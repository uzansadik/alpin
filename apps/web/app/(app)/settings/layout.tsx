import { Button } from "@upkick/ui/components/button";
import Link from "next/link";
import type { ReactNode } from "react";

type SettingsLayoutProps = {
  children: ReactNode;
};

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

        <p className="text-muted-foreground">Manage your workspace and account settings.</p>
      </div>

      <div className="flex gap-2 border-b pb-3">
        <Button asChild variant="ghost">
          <Link href="/settings">General</Link>
        </Button>

        <Button asChild variant="ghost">
          <Link href="/settings/members">Members</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/settings/billing">Billing</Link>
        </Button>
      </div>

      {children}
    </div>
  );
}
