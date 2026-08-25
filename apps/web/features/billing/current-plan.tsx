"use client";

import { authClient } from "@upkick/auth/client";
import { useEffect, useState } from "react";

type CurrentPlanProps = {
  organizationId: string;
};

export function CurrentPlan({ organizationId }: CurrentPlanProps) {
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    async function load() {
      const { data, error } = await authClient.customer.subscriptions.list({
        query: {
          referenceId: organizationId,
          active: true,
          page: 1,
          limit: 10,
        },
      });

      if (!error && data) {
        setHasSubscription(data.result.items.length > 0);
      }

      setLoading(false);
    }

    void load();
  }, [organizationId]);

  if (loading) {
    return <div>Loading plan...</div>;
  }

  return (
    <div>
      Current plan: <strong>{hasSubscription ? "Pro" : "Free"}</strong>
    </div>
  );
}
