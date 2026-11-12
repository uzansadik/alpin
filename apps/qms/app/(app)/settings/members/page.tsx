import { requireOrganizationId } from "@/features/authorization/server";
import { MqdmsCard } from "@/features/settings/mqdms-card";

export default async function MembersPage() {
  const organizationId = await requireOrganizationId();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Members</h1>

        <p className="text-sm text-muted-foreground">
          Invite people and change their roles from mqdms.
        </p>
      </div>

      <MqdmsCard
        description="Invitations, memberships and member roles live in mqdms. Alpin only reads the roles published for your account."
        title="Members"
      >
        <div>
          <p className="text-sm text-muted-foreground">Organization id</p>

          <p className="font-medium">{organizationId}</p>
        </div>
      </MqdmsCard>
    </div>
  );
}
