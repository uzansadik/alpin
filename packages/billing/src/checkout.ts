import { env } from "@upkick/env/server";

import { polar } from "./client";

export type BillingCheckoutProduct = "pro-monthly" | "ai-credits-500";

type CreateBillingCheckoutInput = {
  organizationId: string;
  organizationName: string;
  billingEmail: string;

  product: BillingCheckoutProduct;

  successUrl: string;
  returnUrl: string;
};

function getProductId(product: BillingCheckoutProduct) {
  switch (product) {
    case "pro-monthly":
      return env.POLAR_PRO_MONTHLY_PRODUCT_ID;

    case "ai-credits-500":
      return env.POLAR_AI_CREDITS_500_PRODUCT_ID;
  }
}

export async function createBillingCheckout({
  organizationId,
  organizationName,
  billingEmail,
  product,
  successUrl,
  returnUrl,
}: CreateBillingCheckoutInput) {
  const productId = getProductId(product);

  const checkout = await polar.checkouts.create({
    products: [productId],

    externalCustomerId: organizationId,

    customerEmail: billingEmail,
    customerName: organizationName,

    successUrl,
    returnUrl,

    metadata: {
      organizationId,
      checkoutProduct: product,
    },
  });

  return {
    id: checkout.id,
    url: checkout.url,
  };
}
