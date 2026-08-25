export type AppPlan = "free" | "pro";

const planFeatures = {
  free: [],
  pro: ["premium-page"],
} as const;

export type AppFeature = (typeof planFeatures.pro)[number];

export function hasFeature(plan: AppPlan, feature: AppFeature) {
  return planFeatures[plan].includes(feature as never);
}
