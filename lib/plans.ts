export const PLANS = {
  monthly: {
    id: "monthly",
    name: "30-Day Access",
    amount: 9900,
    durationDays: 30,
    displayAmount: "₹99",
  },
  annual: {
    id: "annual",
    name: "Annual Access",
    amount: 99900,
    durationDays: 365,
    displayAmount: "₹999",
  },
} as const;

export type PlanId = keyof typeof PLANS;

export function getPlanById(planId: string | undefined) {
  if (!planId || !(planId in PLANS)) {
    return null;
  }

  return PLANS[planId as PlanId];
}
