import { z } from "zod";

const queueEnvSchema = z.object({
  QUEUE_PREFIX: z.string().min(1),
});

export const queueEnv = queueEnvSchema.parse({
  QUEUE_PREFIX: process.env.QUEUE_PREFIX,
});
