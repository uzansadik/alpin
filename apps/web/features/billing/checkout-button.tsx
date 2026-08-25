"use client";

import { Button } from "@upkick/ui/components/button";
import { useState } from "react";

type CheckoutProduct = "pro-monthly" | "ai-credits-500";

type CheckoutButtonProps = {
  product: CheckoutProduct;
  children: React.ReactNode;
};

export function CheckoutButton({ product, children }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);

    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          product,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Unable to create checkout.");
      }

      window.location.href = result.url;
    } catch (error) {
      console.error(error);

      setLoading(false);
    }
  }

  return (
    <Button type="button" disabled={loading} onClick={handleCheckout}>
      {loading ? "Opening checkout..." : children}
    </Button>
  );
}
