import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";

const rootEnv = resolve(process.cwd(), ".env");
const webEnv = resolve(process.cwd(), "apps/qms/.env");

await copyFile(rootEnv, webEnv);

console.log("Synced .env -> apps/qms/.env");
