import { env } from "@alpin/env/server";
import { getTranslations } from "@alpin/i18n/server";
import { Badge } from "@alpin/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@alpin/ui/components/card";
import { Building2, KeyRound, ShieldCheck, Users } from "lucide-react";

import { requireSession } from "@/features/auth/session";
import { getAuthorizationContext } from "@/features/authorization/server";

export default async function DashboardPage() {
  const t = await getTranslations();

  const session = await requireSession();
  const context = await getAuthorizationContext();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {" "}
          {t("dashboard.welcome", {
            name: session.user.name ?? session.user.email,
          })}
        </h1>

        <p className="mt-1 text-muted-foreground">{t("dashboard.accessDescription")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.organization")}</CardTitle>

            <Building2 className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="truncate text-2xl font-semibold">
              {context.organizationId ?? t("dashboard.none")}
            </div>

            <p className="text-xs text-muted-foreground">{t("dashboard.organizationHint")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.platformRole")}</CardTitle>

            <ShieldCheck className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-semibold capitalize">{context.platformRole}</div>

            <p className="text-xs text-muted-foreground">{t("auth.managedByMqdms")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.roles")}</CardTitle>

            <Users className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-semibold">{context.roles.length}</div>

            <p className="text-xs text-muted-foreground">{t("dashboard.roles")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("dashboard.permissions")}</CardTitle>

            <KeyRound className="size-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-semibold">{context.permissions.length}</div>

            <p className="text-xs text-muted-foreground">{t("dashboard.permissions")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t("dashboard.access")}</CardTitle>

            <CardDescription>{t("dashboard.accessDescription")}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground">{t("dashboard.roles")}</p>

              <div className="mt-2 flex flex-wrap gap-2">
                {context.roles.length === 0 ? (
                  <p className="text-sm">{t("dashboard.none")}</p>
                ) : (
                  context.roles.map((role) => (
                    <Badge className="capitalize" key={role} variant="secondary">
                      {role}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{t("dashboard.permissions")}</p>

              <div className="mt-2 flex flex-wrap gap-2">
                {context.permissions.length === 0 ? (
                  <p className="text-sm">{t("dashboard.none")}</p>
                ) : (
                  context.permissions.map((permission) => (
                    <Badge key={permission} variant="outline">
                      {permission}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("auth.managedByMqdms")}</CardTitle>

            <CardDescription>mqdms</CardDescription>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground">{t("auth.managedByMqdms")}</p>

            <a
              className="mt-4 inline-block text-sm font-medium underline underline-offset-4"
              href={env.MQDMS_ISSUER}
              rel="noreferrer"
              target="_blank"
            >
              {new URL(env.MQDMS_ISSUER).host}
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
