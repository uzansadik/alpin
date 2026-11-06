import { emailEnv } from "@alpin/env/email";
import { Resend } from "resend";

const resend = new Resend(emailEnv.RESEND_API_KEY);

export { resend };
