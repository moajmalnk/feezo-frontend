/**
 * Browser network control plane for Feezo API traffic.
 *
 * - Tracks online / offline / recovery
 * - Classifies transport failures (offline, timeout, dropped)
 * - Circuit-breaks repeated dead-air to the same origin
 * - Dedupes identical in-flight GET requests
 */

export type NetworkConnectivity = "online" | "offline" | "unknown";

export type NetworkFailureKind =
  | "offline"
  | "timeout"
  | "aborted"
  | "unreachable"
  | "unknown";

export type NetworkSnapshot = {
  connectivity: NetworkConnectivity;
  /** True while the circuit is open after consecutive transport failures. */
  circuitOpen: boolean;
  /** Epoch ms when the circuit will allow another probe (0 if closed). */
  circuitOpenUntil: number;
  consecutiveFailures: number;
  lastFailureKind: NetworkFailureKind | null;
  lastFailureAt: number | null;
};

type Listener = (snapshot: NetworkSnapshot) => void;

const CIRCUIT_FAILURE_THRESHOLD = 3;
const CIRCUIT_COOLDOWN_MS = 8_000;
const MAX_BACKOFF_MS = 2_400;

let connectivity: NetworkConnectivity =
  typeof navigator === "undefined" ? "unknown" : navigator.onLine ? "online" : "offline";
let consecutiveFailures = 0;
let circuitOpenUntil = 0;
let lastFailureKind: NetworkFailureKind | null = null;
let lastFailureAt: number | null = null;
const listeners = new Set<Listener>();
const inflightGets = new Map<string, Promise<unknown>>();
let bootstrapped = false;

function now(): number {
  return Date.now();
}

function emit() {
  const snap = getNetworkSnapshot();
  for (const listener of listeners) {
    try {
      listener(snap);
    } catch {
      /* ignore subscriber errors */
    }
  }
}

function setConnectivity(next: NetworkConnectivity) {
  if (connectivity === next) return;
  connectivity = next;
  if (next === "online") {
    // Coming back online: close the circuit so the next call can probe.
    consecutiveFailures = 0;
    circuitOpenUntil = 0;
    lastFailureKind = null;
  }
  emit();
}

function bootstrapNetworkListeners() {
  if (bootstrapped || typeof window === "undefined") return;
  bootstrapped = true;
  window.addEventListener("online", () => setConnectivity("online"));
  window.addEventListener("offline", () => setConnectivity("offline"));
  // Some browsers flip onLine late after wake / VPN — re-check on focus.
  window.addEventListener("focus", () => {
    setConnectivity(navigator.onLine ? "online" : "offline");
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      setConnectivity(navigator.onLine ? "online" : "offline");
    }
  });
}

export function getNetworkSnapshot(): NetworkSnapshot {
  bootstrapNetworkListeners();
  const open = circuitOpenUntil > now();
  return {
    connectivity,
    circuitOpen: open,
    circuitOpenUntil: open ? circuitOpenUntil : 0,
    consecutiveFailures,
    lastFailureKind,
    lastFailureAt,
  };
}

export function subscribeNetwork(listener: Listener): () => void {
  bootstrapNetworkListeners();
  listeners.add(listener);
  listener(getNetworkSnapshot());
  return () => {
    listeners.delete(listener);
  };
}

export function isBrowserOffline(): boolean {
  bootstrapNetworkListeners();
  if (typeof navigator !== "undefined" && navigator.onLine === false) return true;
  return connectivity === "offline";
}

export function isApiCircuitOpen(): boolean {
  return getNetworkSnapshot().circuitOpen;
}

/** Milliseconds to wait before the next transport retry (exponential, capped). */
export function networkRetryDelayMs(attemptIndex: number): number {
  const base = 320 * 2 ** Math.max(0, attemptIndex);
  const jitter = Math.floor(Math.random() * 120);
  return Math.min(MAX_BACKOFF_MS, base + jitter);
}

export function classifyTransportFailure(err: unknown, timedOut: boolean): NetworkFailureKind {
  if (timedOut) return "timeout";
  if (isBrowserOffline()) return "offline";
  if (err instanceof DOMException && err.name === "AbortError") return "aborted";
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("abort")) return "aborted";
    if (
      msg.includes("failed to fetch") ||
      msg.includes("networkerror") ||
      msg.includes("network request failed") ||
      msg.includes("load failed")
    ) {
      return "unreachable";
    }
  }
  return "unknown";
}

export function recordNetworkSuccess() {
  if (consecutiveFailures === 0 && circuitOpenUntil === 0 && lastFailureKind === null) {
    return;
  }
  consecutiveFailures = 0;
  circuitOpenUntil = 0;
  lastFailureKind = null;
  lastFailureAt = null;
  emit();
}

export function recordNetworkFailure(kind: NetworkFailureKind) {
  lastFailureKind = kind;
  lastFailureAt = now();
  if (kind === "aborted") {
    emit();
    return;
  }
  if (kind === "offline") {
    setConnectivity("offline");
  }
  consecutiveFailures += 1;
  if (consecutiveFailures >= CIRCUIT_FAILURE_THRESHOLD) {
    circuitOpenUntil = now() + CIRCUIT_COOLDOWN_MS;
  }
  emit();
}

export function assertNetworkReady(): void {
  bootstrapNetworkListeners();
  if (isBrowserOffline()) {
    const err = new Error(
      "You're offline — reconnect to load control-plane data from the API.",
    );
    (err as Error & { code?: string }).code = "offline";
    throw err;
  }
  const snap = getNetworkSnapshot();
  if (snap.circuitOpen) {
    const waitSec = Math.max(1, Math.ceil((snap.circuitOpenUntil - now()) / 1000));
    const err = new Error(
      `API unreachable — pausing requests for ${waitSec}s after repeated network failures.`,
    );
    (err as Error & { code?: string }).code = "circuit_open";
    throw err;
  }
}

export function transportFailureMessage(kind: NetworkFailureKind): string {
  switch (kind) {
    case "offline":
      return "You're offline — reconnect to load data from the API.";
    case "timeout":
      return "Request timed out — the API may be unreachable.";
    case "unreachable":
      return "Network dropped before the API responded — check your connection.";
    case "aborted":
      return "Request cancelled.";
    default:
      return "Network request failed.";
  }
}

/**
 * Share one in-flight GET promise per URL so remounts / parallel panels
 * don't stampede the API (overview + support both poll on shell paint).
 */
export function dedupeInflightGet<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = inflightGets.get(key);
  if (existing) return existing as Promise<T>;
  const pending = run().finally(() => {
    if (inflightGets.get(key) === pending) inflightGets.delete(key);
  });
  inflightGets.set(key, pending);
  return pending;
}

/** Resolve when the browser reports online again (or reject on timeout / abort). */
export function waitUntilOnline(opts?: {
  timeoutMs?: number;
  signal?: AbortSignal;
}): Promise<void> {
  bootstrapNetworkListeners();
  if (!isBrowserOffline()) return Promise.resolve();
  const timeoutMs = opts?.timeoutMs ?? 60_000;
  return new Promise((resolve, reject) => {
    const onOnline = () => {
      cleanup();
      resolve();
    };
    const onAbort = () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("Still offline"));
    }, timeoutMs);
    const cleanup = () => {
      window.clearTimeout(timer);
      window.removeEventListener("online", onOnline);
      opts?.signal?.removeEventListener("abort", onAbort);
    };
    window.addEventListener("online", onOnline, { once: true });
    if (opts?.signal) {
      if (opts.signal.aborted) {
        onAbort();
        return;
      }
      opts.signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}
