import { env } from "@alpin/env/server";
import { Separator } from "@alpin/ui/components/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@alpin/ui/components/sidebar";
import type { ReactNode } from "react";

import { requireSession } from "@/features/auth/session";
import { requireOrganizationId } from "@/features/authorization/server";
import { AppSidebar } from "@/features/shell/app-sidebar";

type AppLayoutProps = {
  children: ReactNode;
};

export default async function AppLayout({ children }: AppLayoutProps) {
  const session = await requireSession();
  const organizationId = await requireOrganizationId();

  const mqdmsHost = new URL(env.MQDMS_ISSUER).host;

  return (
    <SidebarProvider>
      <AppSidebar mqdmsUrl={env.MQDMS_ISSUER} organizationId={organizationId} user={session.user} />

      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />

          <Separator className="mr-2 h-4" orientation="vertical" />

          {/* Claim'te organizasyon adı yok; yalnızca id yayınlanıyor. */}
          <span className="truncate text-sm font-medium">{organizationId}</span>

          <a
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
            href={env.MQDMS_ISSUER}
            rel="noreferrer"
            target="_blank"
          >
            {mqdmsHost}
          </a>
        </header>

        <main className="flex flex-1 flex-col p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
