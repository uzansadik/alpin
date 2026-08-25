"use server";

import { auth } from "@upkick/auth/server";
import { env } from "@upkick/env/server";
import { headers } from "next/headers";

export async function getAiCreditBalance() {
  const meters = await auth.api.meters({
    headers: await headers(),
    query: {
      page: 1,
      limit: 100,
    },
  });

  const meter = meters.result.items.find((item) => item.meterId === env.POLAR_AI_CREDITS_METER_ID);

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
  amount: number;
};

export async function consumeAiCredits({ amount }: ConsumeAiCreditsInput) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error("Credit amount must be a positive integer.");
  }

  const balance = await getAiCreditBalance();

  if (balance.remaining < amount) {
    throw new Error("INSUFFICIENT_AI_CREDITS");
  }

  await auth.api.ingestion({
    headers: await headers(),
    body: {
      event: "ai_usage",

      metadata: {
        credits: amount,
      },
    },
  });

  return {
    consumed: amount,
    remaining: balance.remaining - amount,
  };
}
