import pg from "pg";

const { Client } = pg;

if (process.env.APP_ENV !== "local") {
  console.error("❌ db:reset can only run when APP_ENV=local");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing");
  process.exit(1);
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();

console.log("Resetting local database...");

await client.query(`
  DROP SCHEMA IF EXISTS public CASCADE;
  DROP SCHEMA IF EXISTS drizzle CASCADE;

  CREATE SCHEMA public;
`);

await client.end();

console.log("✅ Database reset complete");
