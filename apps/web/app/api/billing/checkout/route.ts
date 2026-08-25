import { type BillingCheckoutProduct, createBillingCheckout } from "@upkick/billing";
import { env } from "@upkick/env/server";
import { z } from "zod";

import { getSession } from "@/features/auth/session";
import { requireOrganizationOwner } from "@/features/organization/server";

const schema = z.object({
  product: z.enum(["pro-monthly", "ai-credits-500"]),
});

export async function POST(request: Request) {
  const session = await getSession();

  if (!session) {
    return Response.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const { organization } = await requireOrganizationOwner();

  const parsed = schema.safeParse(await request.json());

  if (!parsed.success) {
    return Response.json(
      {
        error: "Invalid billing product.",
      },
      {
        status: 400,
      },
    );
  }

  const product = parsed.data.product as BillingCheckoutProduct;

  try {
    const checkout = await createBillingCheckout({
      organizationId: organization.id,
      organizationName: organization.name,

      // Şimdilik owner email.
      // Sonra billingAccount.billingEmail'e bağlayacağız.
      billingEmail: session.user.email,

      product,

      successUrl:
        `${env.NEXT_PUBLIC_APP_URL}` +
        "/settings/billing" +
        "?checkout=success" +
        "&checkout_id={CHECKOUT_ID}",

      returnUrl: `${env.NEXT_PUBLIC_APP_URL}` + "/settings/billing",
    });

    return Response.json({
      url: checkout.url,
    });
  } catch (error) {
    console.error("Failed to create Polar checkout:", error);

    return Response.json(
      {
        error: "Unable to create checkout.",
      },
      {
        status: 500,
      },
    );
  }
}
