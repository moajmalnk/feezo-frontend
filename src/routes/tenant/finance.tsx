import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

import { WorkspacePending } from "@/components/workspace/WorkspacePending";
import { useRequirePermission } from "@/hooks/useRequirePermission";
import { isFinanceTab, type FinanceTab } from "@/lib/finance-tabs";

const FinanceModule = lazy(() =>
  import("@/components/school/SchoolAdminWorkspace").then((m) => ({
    default: m.FinanceModule,
  })),
);

type FinanceSearch = {
  tab?: FinanceTab;
  /** Make Payment · prefill staff salary disbursal */
  staffId?: string;
  /** Receive Payment · prefill student vehicle / fee collection */
  studentId?: string;
  /** Receive Payment · open receipt in edit mode */
  paymentId?: string;
  /** Make Payment · open voucher in edit mode */
  disbursementId?: string;
  amount?: string;
  /** Payroll month · YYYY-MM */
  month?: string;
  /** Prefill fee category kind · tuition | vehicle */
  feeKind?: "tuition" | "vehicle";
  /** Comma-separated fee period labels to open as collect lines */
  periods?: string;
};

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export const Route = createFileRoute("/tenant/finance")({
  validateSearch: (search: Record<string, unknown>): FinanceSearch => {
    const feeKindRaw = optionalString(search.feeKind)?.toLowerCase();
    const feeKind = feeKindRaw === "tuition" || feeKindRaw === "vehicle" ? feeKindRaw : undefined;
    return {
      tab: isFinanceTab(search.tab) ? search.tab : undefined,
      staffId: optionalString(search.staffId),
      studentId: optionalString(search.studentId),
      paymentId: optionalString(search.paymentId),
      disbursementId: optionalString(search.disbursementId),
      amount: optionalString(search.amount),
      month:
        typeof search.month === "string" && /^\d{4}-\d{2}$/.test(search.month.trim())
          ? search.month.trim()
          : undefined,
      feeKind,
      periods: optionalString(search.periods),
    };
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
      <FinanceModule />
    </Suspense>
  );
}
