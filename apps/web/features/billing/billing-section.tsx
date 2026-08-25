"use client";

import { authClient } from "@upkick/auth/client";
import { Button } from "@upkick/ui/components/button";
import { useEffect, useState } from "react";

type BillingSectionProps = {
  organizationId: string;
};

export function BillingSection({ organizationId }: BillingSectionProps) {
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    async function loadSubscription() {
      const { data, error } = await authClient.customer.subscriptions.list({
        query: {
          page: 1,
          limit: 10,
          active: true,
          referenceId: organizationId,
        },
      });

      if (!error && data) {
        setHasSubscription(data.result.items.length > 0);
      }

      setLoading(false);
    }

    void loadSubscription();
  }, [organizationId]);

  async function checkout(slug: "pro-monthly" | "pro-yearly" | "ai-credits-500") {
    setCheckoutLoading(slug);

    const { error } = await authClient.checkout({
      slug,
      referenceId: organizationId,
    });

    if (error) {
      console.error(error);
      setCheckoutLoading(null);
    }
  }

  async function openPortal() {
    const { error } = await authClient.customer.portal();

    if (error) {
      console.error(error);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading billing...</p>;
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Current plan</h2>

          <p className="text-sm text-muted-foreground">
            {hasSubscription
              ? "Your organization is currently on Pro."
              : "Your organization is currently on the Free plan."}
          </p>
        </div>

        <div className="text-2xl font-semibold">{hasSubscription ? "Pro" : "Free"}</div>

        {hasSubscription && (
          <Button type="button" variant="outline" onClick={openPortal}>
            Manage billing
          </Button>
        )}
      </section>

      {!hasSubscription && (
        <>
          <div className="border-t" />

          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-medium">Upgrade to Pro</h2>

              <p className="text-sm text-muted-foreground">
                Unlock premium features and additional usage.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                disabled={checkoutLoading !== null}
                onClick={() => checkout("pro-monthly")}
              >
                {checkoutLoading === "pro-monthly" ? "Opening..." : "Choose monthly"}
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={checkoutLoading !== null}
                onClick={() => checkout("pro-yearly")}
              >
                {checkoutLoading === "pro-yearly" ? "Opening..." : "Choose yearly"}
              </Button>
            </div>
          </section>
        </>
      )}

      <div className="border-t" />

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Usage example</h2>

          <p className="text-sm text-muted-foreground">
            Example of a one-time Polar purchase. Applications can replace this with API credits,
            storage, minutes or another usage model.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={checkoutLoading !== null}
          onClick={() => checkout("ai-credits-500")}
        >
          {checkoutLoading === "ai-credits-500" ? "Opening..." : "Buy 500 AI Credits"}
        </Button>
      </section>
    </div>
  );
}
