export const queueNames = [
  "default",
  "email",
  "webhook",
  "integration",
  "ai",
  "maintenance",
] as const;

export type QueueName = (typeof queueNames)[number];
