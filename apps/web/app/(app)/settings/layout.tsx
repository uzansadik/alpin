import { getActiveOrganizationMember } from "@/features/organization/server";
import { SettingsNav } from "@/features/settings/settings-nav";

export default async function SettingsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const member = await getActiveOrganizationMember();

  const isOwner = member?.role === "owner";

  return (
    <div className="space-y-8">
      <SettingsNav isOwner={isOwner} />

      {children}
    </div>
  );
}
