import type { QueueName } from "@upkick/queue";

import { createDefaultWorker } from "./default-worker";

export type WorkerRuntime = {
  name: QueueName;
  close: () => Promise<void>;
};

type WorkerFactory = () => WorkerRuntime;

const workerFactories: Partial<Record<QueueName, WorkerFactory>> = {
  default: createDefaultWorker,
};

export function createWorkers(queueNames: readonly QueueName[]) {
  return queueNames.map((queueName) => {
    const factory = workerFactories[queueName];

    if (!factory) {
      throw new Error(`No worker implementation registered for queue "${queueName}"`);
    }

    return factory();
  });
}
