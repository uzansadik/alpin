import { addJob } from "@upkick/queue";
import { NextResponse } from "next/server";

export async function GET() {
  const start = performance.now();
  await addJob("system.ping", {
    message: "Hello from web",
  });
  return NextResponse.json({
    databasePingMs: Math.round(performance.now() - start),
  });
}
