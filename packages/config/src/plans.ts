export const planIds = ["free", "pro", "business"] as const;

export type PlanId = (typeof planIds)[number];

export type PlanLimits = {
  members: number | null;
  storageMb: number | null;
  usage: number | null;
};

export type Plan = {
  id: PlanId;
  name: string;
  description: string;

  limits: PlanLimits;

  features: {
    prioritySupport: boolean;
  };
};

export const plans = {
  free: {
    id: "free",
    name: "Free",
    description: "For trying out the product.",

    limits: {
      members: 1,
      storageMb: 100,
      usage: 20,
    },

    features: {
      prioritySupport: false,
    },
  },

  pro: {
    id: "pro",
    name: "Pro",
    description: "For individuals and small teams.",

    limits: {
      members: 10,
      storageMb: 10_000,
      usage: 1_000,
    },

    features: {
      prioritySupport: false,
    },
  },

  business: {
    id: "business",
    name: "Business",
    description: "For growing organizations.",

    limits: {
      members: null,
      storageMb: 100_000,
      usage: 10_000,
    },

    features: {
      prioritySupport: true,
    },
  },
} satisfies Record<PlanId, Plan>;

export function getPlan(planId: PlanId): Plan {
  return plans[planId];
}

export function hasUnlimitedLimit(value: number | null): value is null {
  return value === null;
}

export function isWithinLimit(current: number, limit: number | null): boolean {
  if (limit === null) {
    return true;
  }

  return current < limit;
}
