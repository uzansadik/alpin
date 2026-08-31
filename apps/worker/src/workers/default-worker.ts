import { createRedisWorkerConnection } from "@upkick/redis/worker";
import { Worker } from "bullmq";

import { processSystemPing } from "../jobs/system-ping";

const connection = createRedisWorkerConnection();

export const defaultWorker = new Worker(
  "default",
  async (job) => {
    switch (job.name) {
      case "system.ping":
        return processSystemPing(job);

      default:
        throw new Error(`Unknown job "${job.name}" in default queue`);
    }
  },
  {
    connection,
    concurrency: 10,
    skipVersionCheck: true,
  },
);

defaultWorker.on("completed", (job) => {
  console.log(`[worker] completed ${job.name} (${job.id})`);
});

defaultWorker.on("failed", (job, error) => {
  console.error(`[worker] failed ${job?.name} (${job?.id})`, error);
});

defaultWorker.on("error", (error) => {
  console.error("[worker] error", error);
});
