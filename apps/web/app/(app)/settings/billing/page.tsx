import { CheckoutButton } from "@/features/billing/checkout-button";
import { requireOrganizationOwner } from "@/features/organization/server";

export default async function BillingPage() {
  await requireOrganizationOwner();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>

        <p className="text-sm text-muted-foreground">Manage your subscription and AI credits.</p>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="font-medium">Pro</h2>

          <CheckoutButton product="pro-monthly">Upgrade to Pro</CheckoutButton>
        </div>

        <div>
          <h2 className="font-medium">AI Credits</h2>

          <CheckoutButton product="ai-credits-500">Buy 500 AI Credits</CheckoutButton>
        </div>
      </div>
    </div>
  );
}
