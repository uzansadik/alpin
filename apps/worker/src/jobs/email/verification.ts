import { sendEmail, verificationEmail } from "@alpin/email";
import type { JobPayloads } from "@alpin/queue";
import type { Job } from "bullmq";

type VerificationJob = JobPayloads["email.verification"];

export async function processVerificationEmail(job: Job<VerificationJob>) {
  const email = verificationEmail({
    verificationUrl: job.data.verificationUrl,
  });

  return sendEmail({
    to: job.data.to,
    subject: email.subject,
    html: email.html,
  });
}
