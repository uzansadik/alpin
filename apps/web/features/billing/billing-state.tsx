"use client";

import { authClient } from "@upkick/auth/client";
import { useEffect, useState } from "react";

type BillingStateProps = {
  organizationId: string;
};

export function BillingState({ organizationId }: BillingStateProps) {
  const [loading, setLoading] = useState(true);

  const [active, setActive] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await authClient.customer.subscriptions.list({
        query: {
          page: 1,
          limit: 100,
          active: true,
          referenceId: organizationId,
        },
      });

      if (!error && data) {
        setActive(data.result?.items.length > 0);
      }

      setLoading(false);
    }

    void load();
  }, [organizationId]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading billing...</p>;
  }

  return (
    <div>
      <p className="text-sm">Plan: {active ? "Pro" : "Free"}</p>
    </div>
  );
}
