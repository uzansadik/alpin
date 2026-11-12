"use client";

import { authClient } from "@alpin/auth/client";
import { Button } from "@alpin/ui/components/button";
import { Input } from "@alpin/ui/components/input";
import { useCallback, useEffect, useState } from "react";
import { auditApiKeyCreated, auditApiKeyRevoked } from "./actions";

/**
 * API anahtarları kullanıcıya bağlıdır (`references: "user"`); organizasyon
 * referansı yoktur.
 */
const API_KEY_CONFIG_ID = "user-keys";

type ApiKeyItem = {
  id: string;
  name?: string | null;
  prefix?: string | null;
  start?: string | null;
};

export function ApiKeysSection() {
  const [name, setName] = useState("");
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const loadKeys = useCallback(async () => {
    const { data, error } = await authClient.apiKey.list({
      query: {
        configId: API_KEY_CONFIG_ID,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
    });

    if (!error && data) {
      setKeys(data.apiKeys);
    }
  }, []);

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  async function createKey() {
    const { data, error } = await authClient.apiKey.create({
      configId: API_KEY_CONFIG_ID,

      name: name.trim() || "Personal API Key",
    });

    if (error || !data) {
      return;
    }

    /*
     * Raw key sadece create response'da gelir.
     * Daha sonra tekrar gösterilemez.
     */
    setCreatedKey(data.key);
    setName("");
    await auditApiKeyCreated({
      keyId: data.id,
      name: name.trim() || "Personal API Key",
      prefix: data.prefix,
    });

    await loadKeys();
  }

  async function deleteKey(keyId: string) {
    const { error } = await authClient.apiKey.delete({
      configId: API_KEY_CONFIG_ID,
      keyId,
    });

    await auditApiKeyRevoked({
      keyId,
    });

    if (!error) {
      await loadKeys();
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Production API"
        />

        <Button type="button" onClick={createKey}>
          Create API key
        </Button>
      </div>

      {createdKey && (
        <div className="rounded-lg border p-4">
          <p className="font-medium">API key created</p>

          <p className="mt-1 text-sm text-muted-foreground">
            Copy this key now. You won't be able to see it again.
          </p>

          <code className="mt-4 block break-all rounded bg-muted p-3 text-sm">{createdKey}</code>
        </div>
      )}

      <div className="divide-y rounded-lg border">
        {keys.map((key) => (
          <div key={key.id} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-medium">{key.name ?? "Unnamed key"}</p>

              <p className="text-xs text-muted-foreground">
                {key.prefix}
                {key.start ? `${key.start}...` : ""}
              </p>
            </div>

            <Button type="button" variant="outline" size="sm" onClick={() => deleteKey(key.id)}>
              Revoke
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
