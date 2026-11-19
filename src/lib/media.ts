import { apiBaseUrl, getApiToken } from "@/lib/api/client";

/** True when value is an in-browser data URL (not yet uploaded). */
export function isDataUrl(value?: string | null): boolean {
  return typeof value === "string" && value.startsWith("data:");
}

function isApiMediaPath(path: string): boolean {
  return path.startsWith("/api/media.php") || path.startsWith("/uploads/");
}

/**
 * In Vite DEV, keep API media same-origin (`/api/...`) so the dev proxy serves
 * it. Absolute https://api.feezo.app URLs race/cancel in DevTools and break
 * logo <img> + edge-fit fetch from localhost.
 */
function preferDevProxy(pathOrUrl: string): string {
  if (!import.meta.env.DEV) return pathOrUrl;
  try {
    if (pathOrUrl.startsWith("/") && isApiMediaPath(pathOrUrl.split("?")[0] ?? pathOrUrl)) {
      return pathOrUrl;
    }
    const absolute = new URL(pathOrUrl);
    const api = new URL(apiBaseUrl());
    if (absolute.origin === api.origin && isApiMediaPath(absolute.pathname)) {
      return `${absolute.pathname}${absolute.search}`;
    }
  } catch {
    /* keep original */
  }
  return pathOrUrl;
}

/**
 * Resolve stored photo/logo URLs for <img src>.
 * - data: / blob: leave as-is
 * - http(s) API media → same-origin path in DEV (Vite proxy), absolute in prod
 * - /uploads/... or /api/media.php?... → prefix API origin (prod) or keep relative (dev)
 */
export function resolveMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Truncated / corrupt data URLs cannot render — treat as missing.
  if (trimmed.startsWith("data:")) {
    if (trimmed.length < 64 || !trimmed.includes(";base64,")) return undefined;
    return trimmed;
  }

  if (trimmed.startsWith("blob:")) {
    return trimmed;
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return preferDevProxy(trimmed);
  }

  const path = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (import.meta.env.DEV && isApiMediaPath(path.split("?")[0] ?? path)) {
    return path;
  }
  const base = apiBaseUrl();
  return `${base}${path}`;
}

function isCrossOriginUrl(resolved: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URL(resolved, window.location.href).origin !== window.location.origin;
  } catch {
    return false;
  }
}

/**
 * Fetch tenant media for canvas / crop editors.
 * Public media.php assets must not use credentials — production CORS rejects * with cookies.
 */
export async function fetchMediaBlob(src: string): Promise<Blob> {
  const trimmed = src.trim();
  if (!trimmed) throw new Error("No media URL");
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    throw new Error("Use data/blob URLs directly");
  }

  const resolved = resolveMediaUrl(trimmed) ?? trimmed;
  const headers: Record<string, string> = {};
  const crossOrigin = isCrossOriginUrl(resolved);
  const token = getApiToken();
  const base = apiBaseUrl();

  if (token && !crossOrigin && (resolved.startsWith("/") || resolved.startsWith(base))) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(resolved, {
    credentials: "omit",
    headers,
  });
  if (!res.ok) throw new Error(`Media fetch failed (${res.status})`);
  const blob = await res.blob();
  if (!blob.type.startsWith("image/") && !blob.type.startsWith("audio/")) {
    throw new Error("Unexpected media type");
  }
  return blob;
}
