import { db } from "@alpin/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  const start = performance.now();

  await db.execute(sql`select 1`);

  return NextResponse.json({
    databasePingMs: Math.round(performance.now() - start),
  });
}
