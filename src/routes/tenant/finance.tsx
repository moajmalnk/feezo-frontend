import { createFileRoute, redirect } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { WorkspacePending } from "@/components/workspace/WorkspacePending";
import { useRequirePermission } from "@/hooks/useRequirePermission";
import {
  financeViewHref,
  isFinanceTab,
  parseFinanceViewSearch,
  type FinanceViewSearch,
} from "@/lib/finance-tabs";

const FinanceModule = lazy(() =>
  import("@/components/school/SchoolAdminWorkspace").then((m) => ({
    default: m.FinanceModule,
  })),
);

type FinanceSearch = FinanceViewSearch & {
  /** @deprecated Prefer `/tenant/finance/$view` pages. Kept for deep-link redirects. */
  tab?: string;
};

export const Route = createFileRoute("/tenant/finance")({
  validateSearch: (search: Record<string, unknown>): FinanceSearch => {
    const parsed = parseFinanceViewSearch(search);
    const tab = typeof search.tab === "string" ? search.tab.trim() : undefined;
    return {
      ...parsed,
      ...(tab ? { tab } : {}),
    };
  },
  beforeLoad: ({ search }) => {
    if (isFinanceTab(search.tab)) {
      const { tab: _tab, ...rest } = search;
      throw redirect({
        href: financeViewHref(search.tab, rest),
        replace: true,
      });
    }
  },
  component: FinanceRoute,
  pendingComponent: () => (
    <WorkspacePending label="Opening finance…" detail="Loading books and reports…" />
  ),
});

function FinanceRoute() {
  useRequirePermission("finance");
  return (
    <Suspense fallback={<WorkspacePending label="Opening finance…" />}>
      <FinanceModule view="overview" />
    </Suspense>
  );
}
