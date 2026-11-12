"use client";

import { signInWithMqdms } from "@alpin/auth/client";
import { useI18n } from "@alpin/i18n";
import { Button } from "@alpin/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@alpin/ui/components/card";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";

type LoginFormProps = {
  next: string;
};

export function LoginForm({ next }: LoginFormProps) {
  const { t } = useI18n();
  const [isRedirecting, setIsRedirecting] = useState(false);

  async function handleSignIn() {
    setIsRedirecting(true);

    await signInWithMqdms(next);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("auth.login.title")}</CardTitle>

        <CardDescription>{t("auth.login.description")}</CardDescription>
      </CardHeader>

      <CardContent>
        <Button className="w-full" disabled={isRedirecting} onClick={handleSignIn} type="button">
          <ShieldCheck className="mr-2 size-4" />

          {isRedirecting ? t("auth.login.submitting") : t("auth.login.continueWithMqdms")}
        </Button>
      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-center text-sm text-muted-foreground">{t("auth.login.mqdmsHint")}</p>
      </CardFooter>
    </Card>
  );
}
