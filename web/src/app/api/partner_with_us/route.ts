import { NextRequest, NextResponse } from 'next/server';
import { sendPartnerEmail } from '@/lib/mailer';

// Nodemailer needs Node.js APIs (net, tls, fs) so this route cannot run on
// the Edge runtime. Forcing nodejs makes the constraint explicit and stops
// anyone from accidentally turning the route edge-only later.
export const runtime = 'nodejs';

// ---- Origin allow-list (CSRF defense) ---------------------------------
// Same-origin form POSTs from old browsers may omit Origin entirely; we
// only reject mismatches, not absent headers.
const ALLOWED_ORIGINS = new Set([
  'https://nextgenscholars.asia',
  'https://www.nextgenscholars.asia',
  'http://localhost:3000', // local dev
]);

// ---- Per-field length caps --------------------------------------------
const MAX = {
  name: 100,
  school_name: 200,
  email: 254, // RFC 5321 envelope length
  mobile_or_wechat: 100,
  help_description: 5000,
  honeypot: 200,
} as const;

// ---- In-memory rate limiter -------------------------------------------
// 5 submissions per IP per minute. Per-fork state, so cluster mode would
// multiply the effective limit by instance count — fine at the current
// scale. For stronger limiting, push this into Nginx limit_req or Redis.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_MAP_CAP = 1000;
const ipHits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (ipHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= RATE_LIMIT_MAX) {
    ipHits.set(ip, recent);
    return true;
  }
  recent.push(now);
  ipHits.set(ip, recent);

  // Periodic cold-IP cleanup so the map can't grow without bound.
  if (ipHits.size > RATE_LIMIT_MAP_CAP) {
    for (const [k, v] of ipHits) {
      const filtered = v.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
      if (filtered.length === 0) ipHits.delete(k);
      else ipHits.set(k, filtered);
    }
  }
  return false;
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function readField(form: FormData, name: string, max: number): string {
  const raw = String(form.get(name) ?? '').trim();
  return raw.length > max ? raw.slice(0, max) : raw;
}

// Slightly stricter than the previous regex. \s already covers \r\n but
// the explicit \r\n check is here for clarity (header-injection defense
// in depth — the mailer also strips CR/LF).
function isValidEmail(email: string): boolean {
  if (email.length > MAX.email) return false;
  if (/[\r\n]/.test(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function logError(tag: string, err: unknown): void {
  // Don't dump the raw Nodemailer error — it can include SMTP server
  // banners and response codes that may leak relay state.
  const message = err instanceof Error ? err.message : String(err);
  const code = (err as { code?: string })?.code;
  console.error(`[${tag}] ${code ? `${code}: ` : ''}${message}`);
}

export async function POST(req: NextRequest) {
  // 1. CSRF: reject mismatched Origin.
  const origin = req.headers.get('origin');
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // 2. Rate limit per IP.
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again in a minute.' },
      { status: 429 },
    );
  }

  try {
    const form = await req.formData();

    // 3. Honeypot — silently succeed before any further work.
    const honeypot = readField(form, 'website', MAX.honeypot);
    if (honeypot) {
      return NextResponse.json({ ok: true });
    }

    // 4. Read & cap each field.
    const fields = {
      name: readField(form, 'name', MAX.name),
      school_name: readField(form, 'school_name', MAX.school_name),
      email: readField(form, 'email', MAX.email),
      mobile_or_wechat: readField(form, 'mobile_or_wechat', MAX.mobile_or_wechat),
      help_description: readField(form, 'help_description', MAX.help_description),
    };

    // 5. Validate.
    if (!fields.name || !fields.school_name || !fields.email) {
      return NextResponse.json(
        { error: 'Please fill in all required fields.' },
        { status: 400 },
      );
    }
    if (!isValidEmail(fields.email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    // 6. Fire-and-forget the SMTP send. We've already validated, so the
    //    user gets a snappy success response. Send failures are logged
    //    but invisible to the submitter (better than a 30s spinner).
    void sendPartnerEmail(fields).catch((err) => logError('partner_with_us:send', err));

    return NextResponse.json({ ok: true });
  } catch (err) {
    logError('partner_with_us', err);
    return NextResponse.json({ error: 'Send failed. Please try again.' }, { status: 500 });
  }
}
