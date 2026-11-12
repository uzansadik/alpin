import { env } from "@alpin/env/server";
import { getTranslations } from "@alpin/i18n/server";
import { Button } from "@alpin/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@alpin/ui/components/card";
import { ExternalLink } from "lucide-react";

import { requireSession } from "@/features/auth/session";
import { SignOutButton } from "@/features/auth/sign-out-button";

/**
 * mqdms'te organizasyon üyeliği olmayan kullanıcılar buraya düşer.
 *
 * Oturum zorunlu, organizasyon zorunlu değil.
 */
export default async function NoWorkspacePage() {
  const t = await getTranslations();

  await requireSession();

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("auth.noWorkspace.title")}</CardTitle>

          <CardDescription>{t("auth.noWorkspace.description")}</CardDescription>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">{t("auth.managedByMqdms")}</p>
        </CardContent>

        <CardFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
          <Button asChild>
            <a href={env.MQDMS_ISSUER} rel="noreferrer" target="_blank">
              {t("auth.noWorkspace.manage")}

              <ExternalLink />
            </a>
          </Button>

          <SignOutButton label={t("auth.noWorkspace.signOut")} />
        </CardFooter>
      </Card>
    </main>
  );
}
