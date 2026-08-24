export type BillingPlan = "free" | "pro" | "max";

export type BillingInterval = "month" | "year";

export type CreditType = "ai";

export type ConsumeCreditsInput = {
  organizationId: string;
  userId: string;

  type: CreditType;

  amount: number;

  referenceId?: string;

  metadata?: Record<string, string | number | boolean>;
};
