import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { WorkspaceOpeningScreen } from "@/components/school/TenantDirectorySkeleton";
import { useRequirePermission } from "@/hooks/useRequirePermission";

const SchoolDashboard = lazy(() =>
  import("@/components/school/SchoolAdminWorkspace").then((m) => ({
    default: m.SchoolDashboard,
  })),
);
const PostSignupSupportPrompt = lazy(() =>
  import("@/components/help/PostSignupSupportPrompt").then((m) => ({
    default: m.PostSignupSupportPrompt,
  })),
);

export const Route = createFileRoute("/tenant/dashboard")({
  component: DashboardRoute,
  pendingComponent: () => (
    <WorkspaceOpeningScreen
      label="Opening dashboard"
      detail="Loading school overview…"
      variant="dashboard"
    />
  ),
});

function DashboardRoute() {
  useRequirePermission("dashboard");
  return (
    <Suspense
      fallback={
        <WorkspaceOpeningScreen
          label="Opening dashboard"
          detail="Loading school overview…"
          variant="dashboard"
        />
      }
    >
      <SchoolDashboard />
      <PostSignupSupportPrompt />
    </Suspense>
  );
}
