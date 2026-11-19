import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect } from "react";

import { WorkspacePending } from "@/components/workspace/WorkspacePending";
import { applyNoindex } from "@/lib/seo/public-pages";

const TenantLayoutApp = lazy(() => {
  // Kick off the heavy workspace chunk while the shell boots — Students/Staff/Finance
  // all lazy-load the same module and otherwise paint a blank main pane.
  void import("@/components/school/SchoolAdminWorkspace");
  return import("./TenantLayoutApp").then((m) => ({ default: m.TenantLayoutApp }));
});

export const Route = createFileRoute("/tenant")({
  component: TenantLayoutRoute,
  pendingComponent: WorkspacePending,
});

function TenantLayoutRoute() {
  useEffect(() => {
    applyNoindex();
  }, []);

  return (
    <Suspense fallback={<WorkspacePending />}>
      <TenantLayoutApp />
    </Suspense>
  );
}
