import { queueEnv } from "@upkick/env/queue";

export const queueConfig = {
  prefix: queueEnv.QUEUE_PREFIX,
} as const;
