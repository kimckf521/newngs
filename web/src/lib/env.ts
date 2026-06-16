/**
 * Environment configuration for the contact-form mailer.
 *
 * Non-secret values have safe defaults. SMTP credentials are validated
 * LAZILY via `requireSmtpCreds()` at request time — never at module load —
 * so `next build` (which evaluates route modules with NODE_ENV=production)
 * does not require secrets to be present on the build machine.
 */

export const env = {
  SMTP_HOST: process.env.SMTP_HOST ?? 'smtp.exmail.qq.com',
  SMTP_PORT: Number(process.env.SMTP_PORT ?? '465'),
  EMAIL_RECEIVER: process.env.EMAIL_RECEIVER ?? 'info@nextgenscholars.asia',
} as const;

/**
 * Returns the SMTP credentials, throwing if they are missing. Call this at
 * request time (inside the handler / mailer), not at module scope, so a
 * deploy without creds fails on the first form submission (logged) rather
 * than failing the build.
 */
export function requireSmtpCreds(): { user: string; pass: string } {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || user.trim() === '' || !pass || pass.trim() === '') {
    throw new Error('Missing required environment variables: SMTP_USER / SMTP_PASS');
  }
  return { user, pass };
}
