import { copyFile, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootEnv = resolve(process.cwd(), ".env");
const webEnv = resolve(process.cwd(), "apps/qms/.env");

/**
 * `@alpin/env` şeması build sırasında doğrulandığı için bu değişkenler
 * eksikse hata build'e bırakılmaz; burada daha erken ve anlaşılır şekilde
 * bildirilir.
 */
const requiredKeys = ["MQDMS_CLIENT_ID"];

let content;

try {
  content = await readFile(rootEnv, "utf8");
} catch {
  console.error("[env:sync] Kök .env bulunamadı. `.env.example` dosyasından kopyalayın.");
  process.exit(1);
}

const missing = requiredKeys.filter((key) => !new RegExp(`^${key}=.+$`, "m").test(content));

if (missing.length > 0) {
  console.error(`[env:sync] Kök .env içinde eksik değişkenler: ${missing.join(", ")}`);
  process.exit(1);
}

await copyFile(rootEnv, webEnv);

console.log("Synced .env -> apps/qms/.env");
