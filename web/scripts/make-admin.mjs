/**
 * Make an account an admin by email.
 *   cd web && node scripts/make-admin.mjs their@email.com
 *
 * Admin status is resolved from the `admins` allowlist (email-keyed), so this
 * works even before the user's first login. Also flips their app_users.role to
 * 'admin' if the row already exists. Reads DATABASE_URL / PGSSL from .env.local.
 * Pass --remove to revoke.
 */
import { readFileSync } from 'node:fs';
import { Pool } from 'pg';

const email = (process.argv[2] || '').trim().toLowerCase();
const remove = process.argv.includes('--remove');
if (!email || !email.includes('@')) {
  console.error('Usage: node scripts/make-admin.mjs their@email.com [--remove]');
  process.exit(1);
}

const env = {};
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  if (/^\s*#/.test(line)) continue;
  const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const ssl = ['1', 'true'].includes((env.PGSSL || '').toLowerCase()) ? { rejectUnauthorized: false } : undefined;
const pool = new Pool({ connectionString: env.DATABASE_URL, ssl });

try {
  await pool.query(`CREATE TABLE IF NOT EXISTS admins (email text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now())`);
  if (remove) {
    await pool.query('DELETE FROM admins WHERE lower(email) = $1', [email]);
    await pool.query("UPDATE app_users SET role = 'student', updated_at = now() WHERE lower(email) = $1", [email]);
    console.log(`✓ Revoked admin from ${email}`);
  } else {
    await pool.query('INSERT INTO admins (email) VALUES ($1) ON CONFLICT (email) DO NOTHING', [email]);
    await pool.query("UPDATE app_users SET role = 'admin', updated_at = now() WHERE lower(email) = $1", [email]);
    console.log(`✓ ${email} is now an admin (allowlist + role).`);
  }
  const { rows } = await pool.query('SELECT email FROM admins ORDER BY email');
  console.log('admins allowlist:', rows.map((r) => r.email).join(', ') || '(empty)');
} catch (e) {
  console.error('✗ FAILED:', e.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
