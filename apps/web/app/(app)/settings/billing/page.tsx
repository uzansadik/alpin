import { BillingSection } from "@/features/billing/billing-section";
import { getActiveOrganizationMember } from "@/features/organization/server";

export default async function BillingPage() {
  const organizationId = (await getActiveOrganizationMember()).organizationId; // Replace with actual organization ID
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Billing</h1>
      <BillingSection organizationId={organizationId} />
    </div>
  );
}
