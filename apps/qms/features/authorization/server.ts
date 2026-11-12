import { redirect } from "next/navigation";
import { cache } from "react";

import { getSession } from "@/features/auth/session";

/**
 * mqdms claim'lerinden türetilen yetki bağlamı.
 *
 * Alpin kendi rol/izin kataloğunu tutmaz; kararlar mqdms'in yayınladığı
 * claim'lere göre verilir.
 */
export type AuthorizationContext = {
  organizationId: string | null;
  roles: string[];
  permissions: string[];
  platformRole: string;
};

const EMPTY_CONTEXT: AuthorizationContext = {
  organizationId: null,
  roles: [],
  permissions: [],
  platformRole: "user",
};

export const getAuthorizationContext = cache(async (): Promise<AuthorizationContext> => {
  const session = await getSession();

  if (!session) {
    return EMPTY_CONTEXT;
  }

  return {
    organizationId: session.user.organizationId ?? null,
    roles: session.user.roles ?? [],
    permissions: session.user.permissions ?? [],
    platformRole: session.user.platformRole ?? "user",
  };
});

/**
 * Kullanıcının mqdms'te seçtiği organizasyon id'si.
 *
 * mqdms'te organizasyon üyeliği yoksa claim yayınlanmaz; bu durumda
 * uygulama `/no-workspace` ekranına yönlendirilir.
 */
export const requireOrganizationId = cache(async (): Promise<string> => {
  const context = await getAuthorizationContext();

  if (!context.organizationId) {
    redirect("/no-workspace");
  }

  return context.organizationId;
});

export function hasPermission(context: AuthorizationContext, permission: string): boolean {
  return context.permissions.includes(permission);
}
