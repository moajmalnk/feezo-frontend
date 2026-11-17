import { apiRequest } from "@/lib/api/client";
import type { PublicPlanPrice } from "@/lib/plan-catalog";

/** Public list prices from Control Plane catalog (subscription_plans). */
export async function fetchPublicPlans(): Promise<PublicPlanPrice[]> {
  return apiRequest<PublicPlanPrice[]>("/api/public/plans.php", {
    auth: false,
    skipUnauthorized: true,
    timeoutMs: 6000,
  });
}
