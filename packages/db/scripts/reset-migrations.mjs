import { rm } from "node:fs/promises";
import { resolve } from "node:path";

if (process.env.APP_ENV !== "local") {
  console.error("❌ Hard reset can only run when APP_ENV=local");
  process.exit(1);
}

await rm(resolve("packages/db/drizzle"), {
  recursive: true,
  force: true,
});

console.log("✅ Migration history removed");
