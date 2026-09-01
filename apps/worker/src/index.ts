import { enabledQueueNames } from "./config";
import { createWorkers } from "./workers";

console.log("[worker] starting", {
  queues: enabledQueueNames,
});

const workers = createWorkers(enabledQueueNames);

console.log("[worker] ready", {
  queues: workers.map((worker) => worker.name),
});

let shuttingDown = false;

async function shutdown(signal: string) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log(`[worker] received ${signal}`);

  await Promise.all(workers.map((worker) => worker.close()));

  console.log("[worker] stopped");

  process.exit(0);
}

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
