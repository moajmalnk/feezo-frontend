import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { MarketingHomeSkeleton } from "@/components/marketing/MarketingHomeSkeleton";
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
  // Keep HTML #boot-shell up until MarketingLanding mounts (markLandingReady).
  // Suspense fallback covers the rare case the shell was force-cleared on slow 3G.
  return (
    <Suspense fallback={<MarketingHomeSkeleton />}>
      <MarketingLanding />
    </Suspense>
  );
}
