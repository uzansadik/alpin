import { redirect } from "next/navigation";

import { organizationHasActiveSubscription } from "@/features/billing/server";
import { requireOrganization } from "@/features/organization/server";

export default async function PremiumPage() {
  const organization = await requireOrganization();

  const hasAccess = await organizationHasActiveSubscription(organization.id);

  if (!hasAccess) {
    redirect("/settings/billing?upgrade=required");
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Premium</h1>

      <p className="text-muted-foreground">This page is available to paid organizations.</p>
    </div>
  );
}
