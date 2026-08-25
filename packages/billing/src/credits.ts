import { env } from "@upkick/env/server";

import { polar } from "./client";

export async function getAiCreditBalance(organizationId: string) {
  const state = await polar.customers.getStateExternal({
    externalId: organizationId,
  });

  const meter = state.activeMeters.find((meter) => meter.meterId === env.POLAR_AI_CREDITS_METER_ID);

  if (!meter) {
    return {
      credited: 0,
      consumed: 0,
      remaining: 0,
    };
  }

  return {
    credited: meter.creditedUnits,
    consumed: meter.consumedUnits,
    remaining: meter.balance,
  };
}

type ConsumeAiCreditsInput = {
  organizationId: string;
  userId: string;
  amount: number;
  referenceId?: string;
  metadata?: Record<string, string | number | boolean>;
};

export async function consumeAiCredits({
  organizationId,
  userId,
  amount,
  referenceId,
  metadata = {},
}: ConsumeAiCreditsInput) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Credit amount must be a positive integer.");
  }

  const balance = await getAiCreditBalance(organizationId);

  if (balance.remaining < amount) {
    throw new Error("INSUFFICIENT_AI_CREDITS");
  }

  await polar.events.ingest({
    events: [
      {
        name: "ai_usage",

        externalCustomerId: organizationId,

        ...(referenceId
          ? {
              externalId: referenceId,
            }
          : {}),

        metadata: {
          credits: amount,
          userId,
          ...metadata,
        },
      },
    ],
  });

  return {
    consumed: amount,
    remaining: balance.remaining - amount,
  };
}
