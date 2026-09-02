type VerificationEmailOptions = {
  verificationUrl: string;
};

export function verificationEmail({ verificationUrl }: VerificationEmailOptions) {
  return {
    subject: "Verify your email",

    html: `
      <div>
        <h1>Verify your email</h1>

        <p>
          Please verify your email address to continue.
        </p>

        <p>
          <a href="${verificationUrl}">
            Verify email
          </a>
        </p>
      </div>
    `,
  };
}
