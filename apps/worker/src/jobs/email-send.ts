import { sendEmail } from "@alpin/email";
import type { JobPayloads } from "@alpin/queue";
import type { Job } from "bullmq";

type EmailSendData = JobPayloads["email.send"];

export async function processEmailSend(job: Job<EmailSendData>) {
  return sendEmail({
    to: job.data.to,
    subject: job.data.subject,
    html: job.data.html,
  });
}
