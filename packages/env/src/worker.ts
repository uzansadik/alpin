import { z } from "zod";

const workerEnvSchema = z.object({
  WORKER_QUEUES: z.string().min(1).default("default"),
});

export const workerEnv = workerEnvSchema.parse({
  WORKER_QUEUES: process.env.WORKER_QUEUES,
});
