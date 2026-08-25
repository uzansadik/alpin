"use client";

import { authClient } from "@upkick/auth/client";
import { Button } from "@upkick/ui/components/button";

export function ManageBillingButton() {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => {
        void authClient.customer.portal();
      }}
    >
      Manage billing
    </Button>
  );
}
