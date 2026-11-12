import { ApiKeysSection } from "@/features/api-keys/api-keys-section";
import { requireSession } from "@/features/auth/session";

export default async function ApiKeysPage() {
  await requireSession();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">API Keys</h1>

        <p className="text-sm text-muted-foreground">
          Create and manage API keys for your account.
        </p>
      </div>

      <ApiKeysSection />
    </div>
  );
}
