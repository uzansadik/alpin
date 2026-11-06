// app/(auth)/register/page.tsx

import { getTranslations } from "@alpin/i18n/server";
import { Alert, AlertDescription, AlertTitle } from "@alpin/ui/components/alert";
import { Button } from "@alpin/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@alpin/ui/components/card";
import { CircleAlert } from "lucide-react";
import Link from "next/link";

export default async function Page() {
  const t = await getTranslations();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("auth.register.title")}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert variant="destructive" className="border-destructive/40 bg-destructive/5">
          <CircleAlert />

          <AlertTitle>{t("auth.register.warningTitle")}</AlertTitle>

          <AlertDescription>{t("auth.register.warningDescription")}</AlertDescription>
        </Alert>

        <Button asChild variant="outline" className="w-full">
          <Link href="/login">{t("auth.register.backToLogin")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
