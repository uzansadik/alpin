"use client";

import { authClient } from "@upkick/auth/client";

export async function getOrganizationSubscription(organizationId: string) {
  const { data, error } = await authClient.customer.subscriptions.list({
    query: {
      referenceId: organizationId,
      active: true,
      page: 1,
      limit: 10,
    },
  });

  if (error) {
    throw new Error(error.message ?? "Unable to load subscription.");
  }

  return data;
}

export async function getOrganizationPlan(organizationId: string): Promise<"free" | "pro"> {
  const { data, error } = await authClient.customer.subscriptions.list({
    query: {
      referenceId: organizationId,
      active: true,
      page: 1,
      limit: 10,
    },
  });

  if (error || !data?.result.items.length) {
    return "free";
  }

  return "pro";
}
