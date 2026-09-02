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
  "email.verification": {
    to: string;
    verificationUrl: string;
  };

  "webhook.process": {
    webhookId: string;
    organizationId: string;
  };

  "ai.process": {
    taskId: string;
    organizationId: string;
  };
  "email.password-reset": {
    to: string;
    resetUrl: string;
  };

  "email.organization-invitation": {
    to: string;
    invitationUrl: string;
    organizationName: string;
    inviterName: string;
  };
};

export type JobName = keyof JobPayloads;

export const jobQueues = {
  "system.ping": "default",
  "email.send": "email",
  "webhook.process": "webhook",
  "ai.process": "ai",
  "email.verification": "email",
  "email.password-reset": "email",
  "email.organization-invitation": "email",
} satisfies Record<JobName, QueueName>;
