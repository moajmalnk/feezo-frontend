import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { syncClientStateToCurrentBuild } from "@/lib/app-version";
import { dismissBootShell } from "@/lib/boot-shell";
import { unregisterServiceWorkersOnDisallowedHosts } from "@/lib/pwa-host";
import { router } from "@/router";
import { applyWorkspaceThemeMode, peekStoredThemeMode } from "@/lib/workspace-theme";

import "./styles.css";

syncClientStateToCurrentBuild();
applyWorkspaceThemeMode(peekStoredThemeMode());
void unregisterServiceWorkersOnDisallowedHosts();

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);

// Signal prerendered #seo-content can hide once the SPA has mounted.
queueMicrotask(() => {
  window.dispatchEvent(new Event("feezo:hydrated"));
});

// Last-resort clear if route code never calls dismiss (chunk/network failure).
// Marketing home waits longer — premature dismiss blanks the page on slow 3G
// while the landing chunk is still pending.
const marketingHome = Boolean(
  (window as Window & { __feezoIsMarketingHome?: boolean }).__feezoIsMarketingHome,
);
window.setTimeout(() => dismissBootShell({ force: true }), marketingHome ? 15000 : 6000);
