/** Canonical public list prices (INR). Keep in sync with feezo-backend/lib/plan_catalog.php */
export const PLAN_LIST_PRICES = {
  Basic: { monthlyInr: 899, annualInr: 9499 },
  Premium: { monthlyInr: 1499, annualInr: 16499 },
  Enterprise: { monthlyInr: 2299, annualInr: 25499 },
} as const;

export type PlanCatalogName = keyof typeof PLAN_LIST_PRICES;

export type PublicPlanPrice = {
  name: string;
  monthly: number;
  annually: number;
};

export function catalogMonthly(name: PlanCatalogName): number {
  return PLAN_LIST_PRICES[name].monthlyInr;
}

export function catalogAnnual(name: PlanCatalogName): number {
  return PLAN_LIST_PRICES[name].annualInr;
}
