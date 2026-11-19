import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { WorkspacePending } from "@/components/workspace/WorkspacePending";
import { useRequirePermission } from "@/hooks/useRequirePermission";
import {
  isFinanceTab,
  parseFinanceViewSearch,
  type FinanceTab,
  type FinanceViewSearch,
} from "@/lib/finance-tabs";

const FinanceModule = lazy(() =>
  import("@/components/school/SchoolAdminWorkspace").then((m) => ({
    default: m.FinanceModule,
  })),
);

export const Route = createFileRoute("/tenant/finance_/$view")({
  beforeLoad: ({ params }) => {
    if (!isFinanceTab(params.view)) {
      throw redirect({ to: "/tenant/finance", search: {} });
    }
  },
  validateSearch: (search: Record<string, unknown>): FinanceViewSearch =>
    parseFinanceViewSearch(search),
  component: FinanceViewRoute,
  pendingComponent: () => (
    <WorkspacePending label="Opening finance…" detail="Loading books and reports…" />
  ),
});

function FinanceViewRoute() {
  useRequirePermission("finance");
  const { view } = Route.useParams();
  return (
    <Suspense fallback={<WorkspacePending label="Opening finance…" />}>
      <FinanceModule view={view as FinanceTab} />
    </Suspense>
  );
}
