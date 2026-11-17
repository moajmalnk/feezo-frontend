import { createFileRoute } from "@tanstack/react-router";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { SupportPage } from "@/components/marketing/SupportPage";
import "@/file-routes";

export const Route = createFileRoute("/support")({
  component: SupportRoute,
});

function SupportRoute() {
  return (
    <MarketingShell>
      <SupportPage />
    </MarketingShell>
  );
}
