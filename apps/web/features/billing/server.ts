import { auth } from "@upkick/auth/server";
import { headers } from "next/headers";

export async function getOrganizationSubscriptions(organizationId: string) {
  const subscriptions = await auth.api.subscriptions({
    headers: await headers(),

    query: {
      page: 1,
      limit: 10,
      active: true,
      referenceId: organizationId,
    },
  });

  return subscriptions;
}

export async function organizationHasActiveSubscription(organizationId: string) {
  const subscriptions = await getOrganizationSubscriptions(organizationId);

  console.log("[billing] items:", subscriptions.result.items);

  return subscriptions.result.items.length > 0;
}
