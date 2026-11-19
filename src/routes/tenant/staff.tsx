import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { isStaffProfileTab, type StaffProfileTabId } from "@/components/school/ProfileDetailTabs";
import { WorkspacePending } from "@/components/workspace/WorkspacePending";
import { useRequirePermission } from "@/hooks/useRequirePermission";

const StaffRoster = lazy(() =>
  import("@/components/school/SchoolAdminWorkspace").then((m) => ({
    default: m.StaffRoster,
  })),
);

export type StaffSearch = {
  id?: string;
  tab?: StaffProfileTabId;
};

export const Route = createFileRoute("/tenant/staff")({
  validateSearch: (search: Record<string, unknown>): StaffSearch => ({
    id: typeof search.id === "string" && search.id.length > 0 ? search.id : undefined,
    tab: isStaffProfileTab(search.tab) ? search.tab : undefined,
  }),
  component: StaffRoute,
  pendingComponent: () => (
    <WorkspacePending label="Opening staff…" detail="Loading the staff directory…" />
  ),
});

function StaffRoute() {
  useRequirePermission("staff");
  return (
    <Suspense fallback={<WorkspacePending label="Opening staff…" />}>
      <StaffRoster />
    </Suspense>
  );
}
