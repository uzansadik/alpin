import { workerEnv } from "@alpin/env/worker";
import { type QueueName, queueNames } from "@alpin/queue";

const availableQueues = new Set<string>(queueNames);

const requestedQueues = workerEnv.WORKER_QUEUES.split(",")
  .map((queue) => queue.trim())
  .filter(Boolean);

const invalidQueues = requestedQueues.filter((queue) => !availableQueues.has(queue));

if (invalidQueues.length > 0) {
  throw new Error(`Invalid WORKER_QUEUES: ${invalidQueues.join(", ")}`);
}

export const enabledQueueNames = [...new Set(requestedQueues)] as QueueName[];
