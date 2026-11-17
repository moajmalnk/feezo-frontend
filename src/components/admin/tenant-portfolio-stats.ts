import type { Tenant } from "@/components/admin/data";

/** Portfolio totals — shared by Overview KPIs and Tenants registry summary. */
export function computeTenantPortfolioStats(tenants: Tenant[]) {
  let active = 0;
  let trial = 0;
  let overdue = 0;
  let suspended = 0;
  let students = 0;
  let seats = 0;
  let staff = 0;
  let mrr = 0;
  let basic = 0;
  let premium = 0;
  let enterprise = 0;

  for (const t of tenants) {
    if (t.status === "Active") active += 1;
    else if (t.status === "Trial") trial += 1;
    else if (t.status === "Overdue") overdue += 1;
    else if (t.status === "Suspended") suspended += 1;
    students += t.students || 0;
    seats += t.capacity || 0;
    staff += t.staffCount || 0;
    mrr += t.mrrContribution || 0;
    if (t.tier === "Basic") basic += 1;
    else if (t.tier === "Premium") premium += 1;
    else if (t.tier === "Enterprise") enterprise += 1;
  }

  const seatPct = seats > 0 ? Math.round((students / seats) * 1000) / 10 : 0;

  return {
    total: tenants.length,
    active,
    trial,
    overdue,
    suspended,
    students,
    seats,
    staff,
    mrr,
    seatPct,
    basic,
    premium,
    enterprise,
  };
}

export type TenantPortfolioStats = ReturnType<typeof computeTenantPortfolioStats>;
