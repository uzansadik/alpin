import { BillingWebhookVerificationError, handleBillingWebhook } from "@upkick/billing";

export async function POST(request: Request) {
  const rawBody = await request.text();

  const headers = Object.fromEntries(request.headers.entries());

  try {
    await handleBillingWebhook(rawBody, headers);

    return new Response(null, {
      status: 202,
    });
  } catch (error) {
    if (error instanceof BillingWebhookVerificationError) {
      return Response.json(
        {
          error: "Invalid webhook signature.",
        },
        {
          status: 403,
        },
      );
    }

    console.error("Billing webhook failed:", error);

    /*
     * Burada 500 dönmek önemli.
     *
     * DB geçici olarak unavailable ise Polar'ın
     * bunu başarılı sanmasını istemiyoruz.
     */
    return Response.json(
      {
        error: "Webhook processing failed.",
      },
      {
        status: 500,
      },
    );
  }
}
