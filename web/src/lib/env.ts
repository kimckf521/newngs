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
  // CloudBase native AI gateway (生文模型) — PRIMARY backend for the AI advisor
  // in production. Auth uses the CloudBase Run managed identity (no key); see
  // lib/chat/provider.ts. Provider + model are non-secret and console-visible.
  CLOUDBASE_AI_PROVIDER: process.env.CLOUDBASE_AI_PROVIDER ?? 'deepseek',
  CLOUDBASE_AI_MODEL: process.env.CLOUDBASE_AI_MODEL ?? 'deepseek-v3.2',
  // Direct DeepSeek API — FALLBACK used only when CloudBase creds are absent
  // (e.g. local dev with just DEEPSEEK_API_KEY). Non-secret; key is lazy via
  // requireDeepSeekKey().
  DEEPSEEK_BASE_URL: process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com',
  DEEPSEEK_MODEL: process.env.DEEPSEEK_MODEL ?? 'deepseek-chat',
} as const;

/**
 * Returns the DeepSeek API key, throwing if it's missing. Call at request time
 * (inside the /api/chat handler), never at module scope — so a deploy without
 * the key fails the first chat request (handled gracefully → WeChat handoff)
 * rather than failing `next build`. Get a key at https://platform.deepseek.com.
 */
export function requireDeepSeekKey(): string {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key || key.trim() === '') {
    throw new Error('Missing required environment variable: DEEPSEEK_API_KEY');
  }
  return key;
}

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
