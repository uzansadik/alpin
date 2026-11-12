import { env } from "@alpin/env/server";
import { Button } from "@alpin/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@alpin/ui/components/card";
import { ExternalLink } from "lucide-react";

type MqdmsCardProps = {
  title: string;
  description: string;
  actionLabel?: string;
  children?: React.ReactNode;
};

/**
 * mqdms'te yönetilen bir kaynağa yönlendiren kart.
 *
 * Alpin kendi organizasyon/kullanıcı modelini tutmadığı için bu ekranlar
 * yalnızca mqdms'e gider.
 */
export function MqdmsCard({ title, description, actionLabel, children }: MqdmsCardProps) {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>

        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {children}

        <Button asChild variant="outline">
          <a href={env.MQDMS_ISSUER} rel="noreferrer" target="_blank">
            {actionLabel ?? "Manage in mqdms"}

            <ExternalLink />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
