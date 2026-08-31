import { defaultWorker } from "./workers/default-worker";

console.log("[worker] starting");

async function shutdown(signal: string) {
  console.log(`[worker] received ${signal}`);

  await defaultWorker.close();

  console.log("[worker] stopped");

  process.exit(0);
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

console.log("[worker] ready");
