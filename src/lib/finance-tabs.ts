export const FINANCE_TABS = [
  "receive",
  "make",
  "transfer",
  "transfers",
  "analytics",
  "ledger",
  "journals",
  "trial",
  "pl",
  "balance",
  "fees",
  "concession",
  "salary",
  "daybook",
  "reconciliation",
  "cashflow",
  "vehicle",
  "aging",
  "heads",
] as const;

export type FinanceTab = (typeof FINANCE_TABS)[number];

export type FinanceViewPath = `/tenant/finance/${FinanceTab}`;

export const FINANCE_VIEW_PATHS = FINANCE_TABS.map(
  (tab) => `/tenant/finance/${tab}` as FinanceViewPath,
);

export function isFinanceTab(value: unknown): value is FinanceTab {
  return typeof value === "string" && (FINANCE_TABS as readonly string[]).includes(value);
}

/** Canonical page path for a finance view (report, books, or payment form). */
export function financeViewPath(view: FinanceTab): FinanceViewPath {
  return `/tenant/finance/${view}`;
}

export function financeViewFromPathname(pathname: string): FinanceTab | null {
  const match = pathname.match(/^\/tenant\/finance\/([^/?#]+)/);
  if (!match) return null;
  return isFinanceTab(match[1]) ? match[1] : null;
}

export type FinanceViewSearch = {
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

export function parseFinanceViewSearch(search: Record<string, unknown>): FinanceViewSearch {
  const feeKindRaw = optionalString(search.feeKind)?.toLowerCase();
  const feeKind = feeKindRaw === "tuition" || feeKindRaw === "vehicle" ? feeKindRaw : undefined;
  return {
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
}

/** Build `/tenant/finance/fees?studentId=…` style hrefs for guides and deep links. */
export function financeViewHref(view: FinanceTab, search?: FinanceViewSearch): string {
  const path = financeViewPath(view);
  if (!search) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (typeof value === "string" && value.trim()) params.set(key, value.trim());
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}

/**
 * Navigate options for finance subpages.
 * Prefer `href` over `to: "/tenant/finance/$view"` — routeTree.gen.ts is @ts-nocheck,
 * so the IDE's typed `to` union often lags and rejects the `$view` route.
 */
export function financeViewNav(
  view: FinanceTab,
  options?: { search?: FinanceViewSearch; replace?: boolean },
): { href: string; replace?: boolean } {
  return {
    href: financeViewHref(view, options?.search),
    ...(options?.replace ? { replace: true } : {}),
  };
}
