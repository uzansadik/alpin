import { validateEvent, WebhookVerificationError } from "@polar-sh/sdk/webhooks";
import { db } from "@upkick/db";
import { billingAccount, billingSubscription } from "@upkick/db/schema";
import { env } from "@upkick/env/server";

export class BillingWebhookVerificationError extends Error {
  constructor() {
    super("Invalid billing webhook signature.");
    this.name = "BillingWebhookVerificationError";
  }
}

function resolveSubscriptionProduct(productId: string) {
  if (productId === env.POLAR_PRO_MONTHLY_PRODUCT_ID) {
    return {
      plan: "pro" as const,
      interval: "month" as const,
    };
  }

  // Daha sonra:
  //
  // POLAR_PRO_YEARLY_PRODUCT_ID
  // POLAR_MAX_MONTHLY_PRODUCT_ID
  // POLAR_MAX_YEARLY_PRODUCT_ID

  return null;
}

async function syncCustomer(customer: { id: string; externalId: string | null; email: string }) {
  const organizationId = customer.externalId;

  if (!organizationId) {
    console.warn("Polar customer has no external organization id:", customer.id);

    return;
  }

  await db
    .insert(billingAccount)
    .values({
      organizationId,
      provider: "polar",
      providerCustomerId: customer.id,
      billingEmail: customer.email,
    })
    .onConflictDoUpdate({
      target: billingAccount.organizationId,

      set: {
        providerCustomerId: customer.id,
        billingEmail: customer.email,
        updatedAt: new Date(),
      },
    });
}

async function syncSubscription(subscription: {
  id: string;
  productId: string;
  customerId: string;

  status: string;

  currentPeriodStart: Date;
  currentPeriodEnd: Date;

  cancelAtPeriodEnd: boolean;
  canceledAt: Date | null;

  metadata: Record<string, unknown>;

  customer: {
    id: string;
    externalId: string | null;
    email: string;
  };
}) {
  const organizationIdFromMetadata =
    typeof subscription.metadata.organizationId === "string"
      ? subscription.metadata.organizationId
      : null;

  const organizationId = organizationIdFromMetadata ?? subscription.customer.externalId;

  if (!organizationId) {
    console.warn("Unable to resolve organization for Polar subscription:", subscription.id);

    return;
  }

  const product = resolveSubscriptionProduct(subscription.productId);

  if (!product) {
    console.warn("Unknown Polar subscription product:", subscription.productId);

    return;
  }

  /*
   * Webhook ordering'e güvenmiyoruz.
   *
   * customer.created daha önce gelmemiş olsa bile
   * subscription payload içindeki customer ile
   * billingAccount oluşturulabilir.
   */
  await db
    .insert(billingAccount)
    .values({
      organizationId,
      provider: "polar",

      providerCustomerId: subscription.customer.id,

      billingEmail: subscription.customer.email,
    })
    .onConflictDoUpdate({
      target: billingAccount.organizationId,

      set: {
        providerCustomerId: subscription.customer.id,

        billingEmail: subscription.customer.email,

        updatedAt: new Date(),
      },
    });

  await db
    .insert(billingSubscription)
    .values({
      organizationId,

      provider: "polar",

      providerSubscriptionId: subscription.id,

      providerProductId: subscription.productId,

      plan: product.plan,

      billingInterval: product.interval,

      status: subscription.status,

      currentPeriodStart: subscription.currentPeriodStart,

      currentPeriodEnd: subscription.currentPeriodEnd,

      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,

      canceledAt: subscription.canceledAt,
    })
    .onConflictDoUpdate({
      target: billingSubscription.providerSubscriptionId,

      set: {
        organizationId,

        providerProductId: subscription.productId,

        plan: product.plan,

        billingInterval: product.interval,

        status: subscription.status,

        currentPeriodStart: subscription.currentPeriodStart,

        currentPeriodEnd: subscription.currentPeriodEnd,

        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,

        canceledAt: subscription.canceledAt,

        updatedAt: new Date(),
      },
    });
}

export async function handleBillingWebhook(rawBody: string, headers: Record<string, string>) {
  if (!env.POLAR_WEBHOOK_SECRET) {
    throw new Error("POLAR_WEBHOOK_SECRET is not configured.");
  }

  let event: ReturnType<typeof validateEvent>;

  try {
    event = validateEvent(rawBody, headers, env.POLAR_WEBHOOK_SECRET);
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      throw new BillingWebhookVerificationError();
    }

    throw error;
  }

  switch (event.type) {
    case "customer.created":
    case "customer.updated": {
      await syncCustomer(event.data);
      break;
    }

    case "subscription.created":
    case "subscription.updated": {
      await syncSubscription(event.data);
      break;
    }

    case "order.paid": {
      /*
       * Şimdilik bir şey yapmıyoruz.
       *
       * Polar zaten:
       * - subscription payment
       * - one-time credit purchase
       *
       * işlemlerini ve credit benefit grant'ini
       * kendi tarafında yönetiyor.
       *
       * İleride billingOrder/audit eklersek
       * burada işleyeceğiz.
       */
      break;
    }

    default:
      break;
  }
}
