import nodemailer from 'nodemailer';
import { env, requireSmtpCreds } from './env';

// The transporter is created lazily on first send (not at module load) so
// importing this module — e.g. when `next build` collects route data — never
// requires SMTP credentials to be present.
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (transporter) return transporter;
  const { user, pass } = requireSmtpCreds();
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: true, // SSL on port 465
    auth: { user, pass },
  });
  return transporter;
}

/**
 * Strip CR/LF from a value before it lands in an email header.
 *
 * Email headers are line-delimited; allowing \r or \n in interpolated values
 * lets an attacker inject extra headers (BCC, From spoof, etc.). Apply to
 * anything that ends up in `subject`, `replyTo`, etc.
 */
function stripCrlf(s: string): string {
  return s.replace(/[\r\n]+/g, ' ').trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface PartnerFields {
  name: string;
  school_name: string;
  email: string;
  mobile_or_wechat: string;
  help_description: string;
}

export async function sendPartnerEmail(f: PartnerFields): Promise<void> {
  // Sanitize anything that flows into a header.
  const safeName = stripCrlf(f.name);
  const safeSchool = stripCrlf(f.school_name);
  const safeEmail = stripCrlf(f.email);
  const safeContact = stripCrlf(f.mobile_or_wechat);
  // help_description goes in the body, so newlines are fine here.
  const safeDescription = f.help_description;

  const text =
    `Name: ${safeName}\n` +
    `School: ${safeSchool}\n` +
    `Email: ${safeEmail}\n` +
    `Mobile/WeChat: ${safeContact}\n\n` +
    `How can we help:\n${safeDescription}`;

  const html =
    `<p><strong>Name:</strong> ${escapeHtml(safeName)}</p>` +
    `<p><strong>School:</strong> ${escapeHtml(safeSchool)}</p>` +
    `<p><strong>Email:</strong> ${escapeHtml(safeEmail)}</p>` +
    `<p><strong>Mobile/WeChat:</strong> ${escapeHtml(safeContact)}</p>` +
    `<p><strong>How can we help:</strong></p>` +
    `<p>${escapeHtml(safeDescription).replace(/\n/g, '<br>')}</p>`;

  const { user } = requireSmtpCreds();
  await getTransporter().sendMail({
    from: user,
    to: env.EMAIL_RECEIVER,
    replyTo: safeEmail,
    subject: `New Partner Request from ${safeName}`,
    text,
    html,
  });
}
