import { requireOrganizationId } from "@/features/authorization/server";
import { MqdmsCard } from "@/features/settings/mqdms-card";

export default async function SettingsPage() {
  const organizationId = await requireOrganizationId();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">General</h1>

        <p className="text-sm text-muted-foreground">
          Manage your organization details and branding.
        </p>
      </div>

      <MqdmsCard
        description="Organization name, slug, branding and members are managed in mqdms."
        title="Organization"
      >
        <div>
          <p className="text-sm text-muted-foreground">Organization id</p>

          <p className="font-medium">{organizationId}</p>
        </div>
      </MqdmsCard>
    </div>
  );
}
