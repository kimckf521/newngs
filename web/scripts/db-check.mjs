/**
 * DB connectivity + schema check.
 *   cd web && node scripts/db-check.mjs
 * Reads DATABASE_URL / PGSSL from .env.local (or the process env), connects,
 * runs the same CREATE TABLE IF NOT EXISTS the app uses, then prints the tables
 * and row counts. Never prints the password.
 */
import { readFileSync } from 'node:fs';
import { Pool } from 'pg';

function loadEnvLocal() {
  const env = {};
  let txt = '';
  try {
    txt = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
  } catch {
    /* no .env.local — fall back to process.env */
  }
  for (const line of txt.split('\n')) {
    if (/^\s*#/.test(line)) continue;
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

const env = loadEnvLocal();
const url = env.DATABASE_URL || process.env.DATABASE_URL;
const pgssl = (env.PGSSL || process.env.PGSSL || '').toLowerCase();
const useSsl = pgssl === '1' || pgssl === 'true' || /sslmode=require/i.test(url || '');

if (!url) {
  console.error('✗ DATABASE_URL not found in web/.env.local');
  process.exit(1);
}

try {
  const u = new URL(url);
  console.log(
    `→ host=${u.hostname} port=${u.port || 5432} db=${u.pathname.slice(1) || '(default)'} user=${u.username} ssl=${useSsl}`,
  );
} catch {
  console.log('→ (could not parse DATABASE_URL for display)');
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS app_users (
  uid text PRIMARY KEY, email text, name text,
  role text NOT NULL DEFAULT 'student',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS admins (
  email text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS courses (
  id text PRIMARY KEY, data jsonb NOT NULL,
  published boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS pages (
  route text NOT NULL, locale text NOT NULL, draft jsonb, published jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (route, locale)
);
`;

const pool = new Pool({
  connectionString: url,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 12000,
  max: 2,
});

try {
  await pool.query('SELECT 1');
  console.log('✓ Connected');
  await pool.query(SCHEMA_SQL);
  console.log('✓ Schema ensured');
  for (const t of ['app_users', 'admins', 'courses', 'pages']) {
    const { rows } = await pool.query(`SELECT count(*)::int AS n FROM ${t}`);
    console.log(`   • ${t}: ${rows[0].n} rows`);
  }
  console.log('\n✅ ALL GOOD — the Postgres backend is live.');
} catch (e) {
  console.error('\n✗ FAILED:', e.message);
  if (/timeout|ETIMEDOUT|ENOTFOUND|ECONNREFUSED/i.test(e.message))
    console.error('  → likely the 外网 whitelist/安全组 (add your public IP) or a wrong host/port.');
  if (/password|authentication/i.test(e.message)) console.error('  → wrong user/password.');
  if (/SSL|encryption/i.test(e.message)) console.error('  → set PGSSL=1 (or the server forbids SSL — remove it).');
  if (/database .* does not exist/i.test(e.message)) console.error('  → wrong DB name (try /postgres).');
  process.exitCode = 1;
} finally {
  await pool.end();
}
