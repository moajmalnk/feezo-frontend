type FeezoBootWindow = Window & {
  __feezoDismissBootShell?: (opts?: { force?: boolean }) => void;
  __feezoIsMarketingHome?: boolean;
  __feezoLandingReady?: boolean;
};

function bootWindow(): FeezoBootWindow | null {
  if (typeof window === "undefined") return null;
  return window as FeezoBootWindow;
}

/** Marketing homepage finished mounting — safe to clear the HTML LCP shell. */
export function markLandingReady() {
  const w = bootWindow();
  if (!w) return;
  w.__feezoLandingReady = true;
  dismissBootShell({ force: true });
}

/**
 * Remove the HTML LCP / app boot shells if they are still covering the app.
 * On the marketing homepage, non-forced dismiss is ignored until markLandingReady()
 * so slow 3G never blanks the screen while the landing chunk is still downloading.
 */
export function dismissBootShell(opts?: { force?: boolean }) {
  const w = bootWindow();
  if (!w) return;

  if (!opts?.force && w.__feezoIsMarketingHome && !w.__feezoLandingReady) {
    return;
  }

  if (typeof w.__feezoDismissBootShell === "function") {
    w.__feezoDismissBootShell(opts);
    return;
  }

  document.documentElement.classList.remove("app-boot");
  const seo = document.getElementById("seo-content");
  if (seo) seo.setAttribute("hidden", "");
  for (const id of ["boot-shell", "app-boot-shell"] as const) {
    const shell = document.getElementById(id);
    if (!shell) continue;
    shell.classList.add("is-done");
    window.setTimeout(() => shell.remove(), 220);
  }
}
