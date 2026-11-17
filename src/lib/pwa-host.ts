/**
 * Service workers are origin-scoped. Apex feezo.app 301s to www; a SW on the
 * wrong host (or racing the redirect) is a common source of intermittent
 * ERR_FAILED navigations. Only register on hosts that should control the app.
 */

const CANONICAL_PRODUCT_HOST = "www.feezo.app";
const APEX_PRODUCT_HOST = "feezo.app";

export function getCanonicalProductHost(): string {
  return CANONICAL_PRODUCT_HOST;
}

/** True when this origin is allowed to install / keep a Feezo service worker. */
export function isPwaRegistrationHost(hostname: string = window.location.hostname): boolean {
  const host = hostname.trim().toLowerCase();
  if (!host) return false;
  if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
  if (host.endsWith(".localhost")) return true;
  // Vercel / preview deploys
  if (host.endsWith(".vercel.app")) return true;
  // Production canonical only — never apex
  return host === CANONICAL_PRODUCT_HOST;
}

export function isApexProductHost(hostname: string = window.location.hostname): boolean {
  return hostname.trim().toLowerCase() === APEX_PRODUCT_HOST;
}

/**
 * Drop any controlling worker on hosts that must not own one (apex, odd
 * mirrors). Safe to call on every boot — no-ops when there is nothing to clear.
 */
export async function unregisterServiceWorkersOnDisallowedHosts(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;
  if (isPwaRegistrationHost()) return false;

  const regs = await navigator.serviceWorker.getRegistrations();
  if (!regs.length) return false;
  await Promise.all(regs.map((reg) => reg.unregister()));
  return true;
}
