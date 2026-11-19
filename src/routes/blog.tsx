import { createFileRoute, Outlet } from "@tanstack/react-router";

import { MarketingShell } from "@/components/marketing/MarketingShell";
import "@/file-routes";

export const Route = createFileRoute("/blog")({
  component: BlogLayout,
});

function BlogLayout() {
  return (
    <MarketingShell>
      <Outlet />
    </MarketingShell>
  );
}
