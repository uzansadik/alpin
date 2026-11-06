import { queueEnv } from "@alpin/env/queue";

export const queueConfig = {
  prefix: queueEnv.QUEUE_PREFIX,
} as const;
