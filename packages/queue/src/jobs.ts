import type { QueueName } from "./queues";

export type JobPayloads = {
  "system.ping": {
    message: string;
  };

  "email.send": {
    to: string;
    subject: string;
    html: string;
  };

  "webhook.process": {
    webhookId: string;
    organizationId: string;
  };

  "ai.process": {
    taskId: string;
    organizationId: string;
  };
};

export type JobName = keyof JobPayloads;

export const jobQueues = {
  "system.ping": "default",
  "email.send": "email",
  "webhook.process": "webhook",
  "ai.process": "ai",
} satisfies Record<JobName, QueueName>;
