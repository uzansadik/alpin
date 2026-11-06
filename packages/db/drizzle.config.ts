import "dotenv/config";

import { env } from "@alpin/env/server";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema/**/*.ts",
  out: "./drizzle",

  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
