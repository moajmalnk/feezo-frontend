import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect } from "react";

import { dismissBootShell } from "@/lib/boot-shell";
import { importWithRetry } from "@/lib/lazy-with-retry";

const MarketingLanding = lazy(() =>
  importWithRetry(() =>
    import("@/components/marketing/MarketingLanding").then((m) => ({
      default: m.MarketingLanding,
    })),
  ),
);

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  // If the landing chunk never resolves, the HTML safety timer still clears
  // #boot-shell — also dismiss here once Suspense has been pending too long.
  useEffect(() => {
    const timer = window.setTimeout(() => dismissBootShell(), 3500);
    return () => window.clearTimeout(timer);
  }, []);

  // Always show the marketing homepage. Logged-in users reach their workspace
  // via login redirect / "My Account" — do not bounce "/" back to the app.
  return (
    <Suspense fallback={null}>
      <MarketingLanding />
    </Suspense>
  );
}
