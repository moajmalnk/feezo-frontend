import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { WorkspacePending } from "@/components/workspace/WorkspacePending";
import { useRequirePermission } from "@/hooks/useRequirePermission";

const AdmitStudentPage = lazy(() =>
  import("@/components/school/SchoolAdminWorkspace").then((m) => ({
    default: m.AdmitStudentPage,
  })),
);

export const Route = createFileRoute("/tenant/students_/admit")({
  component: AdmitRoute,
  pendingComponent: () => (
    <WorkspacePending label="Opening admit…" detail="Loading student admission…" />
  ),
});

function AdmitRoute() {
  useRequirePermission("students");
  return (
    <Suspense fallback={<WorkspacePending label="Opening admit…" />}>
      <AdmitStudentPage />
    </Suspense>
  );
}
