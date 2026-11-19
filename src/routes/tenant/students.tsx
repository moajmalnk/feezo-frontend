import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import {
  isStudentProfileTab,
  type StudentProfileTabId,
} from "@/components/school/ProfileDetailTabs";
import { WorkspacePending } from "@/components/workspace/WorkspacePending";
import { useRequirePermission } from "@/hooks/useRequirePermission";

const StudentsLedger = lazy(() =>
  import("@/components/school/SchoolAdminWorkspace").then((m) => ({
    default: m.StudentsLedger,
  })),
);

export type StudentsSearch = {
  id?: string;
  tab?: StudentProfileTabId;
};

export const Route = createFileRoute("/tenant/students")({
  validateSearch: (search: Record<string, unknown>): StudentsSearch => ({
    id: typeof search.id === "string" && search.id.length > 0 ? search.id : undefined,
    tab: isStudentProfileTab(search.tab) ? search.tab : undefined,
  }),
  component: StudentsRoute,
  pendingComponent: () => (
    <WorkspacePending label="Opening students…" detail="Loading the student directory…" />
  ),
});

function StudentsRoute() {
  useRequirePermission("students");
  return (
    <Suspense fallback={<WorkspacePending label="Opening students…" />}>
      <StudentsLedger />
    </Suspense>
  );
}
