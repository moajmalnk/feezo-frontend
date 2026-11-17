import { createFileRoute } from "@tanstack/react-router";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { WhoItsForPage } from "@/components/marketing/pages/WhoItsForPage";
import "@/file-routes";

export const Route = createFileRoute("/who-is-feezo-for")({
  component: WhoItsForRoute,
});

function WhoItsForRoute() {
  return (
    <MarketingShell>
      <WhoItsForPage />
    </MarketingShell>
  );
}
