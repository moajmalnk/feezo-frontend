/** Remove the HTML LCP boot shell if it is still covering the app. */
export function dismissBootShell() {
  if (typeof window === "undefined") return;
  const w = window as Window & { __feezoDismissBootShell?: () => void };
  if (typeof w.__feezoDismissBootShell === "function") {
    w.__feezoDismissBootShell();
    return;
  }
  const shell = document.getElementById("boot-shell");
  if (!shell) return;
  shell.classList.add("is-done");
  window.setTimeout(() => shell.remove(), 220);
}
