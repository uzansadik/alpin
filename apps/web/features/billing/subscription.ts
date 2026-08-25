import { authClient } from "@upkick/auth/client";

export async function getOrganizationSubscriptions(organizationId: string) {
  const { data, error } = await authClient.customer.subscriptions.list({
    query: {
      page: 1,
      limit: 100,
      active: true,
      referenceId: organizationId,
    },
  });

  if (error) {
    throw new Error(error.message ?? "Unable to load subscriptions.");
  }

  return data;
}

export async function hasActiveSubscription(organizationId: string) {
  const subscriptions = await getOrganizationSubscriptions(organizationId);

  return subscriptions.result.items.length > 0;
}

export async function hasProduct(organizationId: string, productId: string) {
  const subscriptions = await getOrganizationSubscriptions(organizationId);

  return subscriptions.result.items.some((subscription) => subscription.productId === productId);
}
