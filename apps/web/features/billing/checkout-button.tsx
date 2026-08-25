"use client";

import { authClient } from "@upkick/auth/client";
import { Button } from "@upkick/ui/components/button";
import { useState } from "react";

type CheckoutButtonProps = {
  slug: "pro-monthly" | "pro-yearly" | "ai-credits-500";

  referenceId?: string;

  children: React.ReactNode;
};

export function CheckoutButton({ slug, referenceId, children }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);

    const { error } = await authClient.checkout({
      slug,
      ...(referenceId
        ? {
            referenceId,
          }
        : {}),
    });

    if (error) {
      console.error("Unable to create checkout:", error);

      setLoading(false);
    }
  }

  return (
    <Button type="button" disabled={loading} onClick={handleCheckout}>
      {loading ? "Opening checkout..." : children}
    </Button>
  );
}
