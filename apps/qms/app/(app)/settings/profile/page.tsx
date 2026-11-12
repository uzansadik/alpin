import { Avatar, AvatarFallback, AvatarImage } from "@alpin/ui/components/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@alpin/ui/components/card";
import { LanguageSelect } from "@/components/language-switcher";

import { requireSession } from "@/features/auth/session";
import { getAuthorizationContext } from "@/features/authorization/server";
import { MqdmsCard } from "@/features/settings/mqdms-card";
import { SessionsSection } from "./sessions-section";

export default async function ProfilePage() {
  const session = await requireSession();
  const context = await getAuthorizationContext();

  return (
    <div className="flex gap-8 flex-col ">
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Profile</CardTitle>

          <CardDescription>
            Your name, e-mail address and profile image are managed in mqdms.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center gap-5">
            <Avatar className="size-20">
              {session.user.image && (
                <AvatarImage alt={session.user.name} src={session.user.image} />
              )}

              <AvatarFallback className="text-xl">
                {session.user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate font-medium">{session.user.name}</p>

              <p className="truncate text-sm text-muted-foreground">{session.user.email}</p>
            </div>
          </div>

          <dl className="grid gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Organization id</dt>

              <dd className="font-medium">{context.organizationId ?? "—"}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Platform role</dt>

              <dd className="font-medium capitalize">{context.platformRole}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Roles</dt>

              <dd className="font-medium">{context.roles.join(", ") || "—"}</dd>
            </div>

            <div>
              <dt className="text-muted-foreground">Permissions</dt>

              <dd className="font-medium">{context.permissions.join(", ") || "—"}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <MqdmsCard
        actionLabel="Open mqdms"
        description="Update your name, e-mail address, password and profile image in mqdms."
        title="Account"
      />

      <SessionsSection />

      <LanguageSelect />
    </div>
  );
}
