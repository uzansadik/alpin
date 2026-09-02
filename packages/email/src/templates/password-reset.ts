type PasswordResetEmailOptions = {
  resetUrl: string;
};

export function passwordResetEmail({ resetUrl }: PasswordResetEmailOptions) {
  return {
    subject: "Reset your password",

    html: `
      <div>
        <h1>Reset your password</h1>

        <p>
          You requested a password reset.
        </p>

        <p>
          <a href="${resetUrl}">
            Reset password
          </a>
        </p>
      </div>
    `,
  };
}
