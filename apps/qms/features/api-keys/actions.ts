"use server";

import { audit } from "@/features/audit/server";
import { getAuthorizationContext } from "@/features/authorization/server";

export async function auditApiKeyCreated(input: {
  keyId: string;
  name?: string | null;
  prefix?: string | null;
}) {
  const context = await getAuthorizationContext();

  if (!context.organizationId) {
    return;
  }

  await audit({
    organizationId: context.organizationId,

    action: "api_key.created",

    target: {
      type: "api_key",
      id: input.keyId,
    },

    metadata: {
      name: input.name ?? null,
      prefix: input.prefix ?? null,
    },
  });
}

export async function auditApiKeyRevoked(input: { keyId: string; name?: string | null }) {
  const context = await getAuthorizationContext();

  if (!context.organizationId) {
    return;
  }

  await audit({
    organizationId: context.organizationId,

    action: "api_key.revoked",

    target: {
      type: "api_key",
      id: input.keyId,
    },

    metadata: {
      name: input.name ?? null,
    },
  });
}
