import { emailEnv } from "@upkick/env/email";
import { Resend } from "resend";

const resend = new Resend(emailEnv.RESEND_API_KEY);

export { resend };
