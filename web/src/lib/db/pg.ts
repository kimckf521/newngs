import 'server-only';
import { Pool, type PoolConfig } from 'pg';

/**
 * PostgreSQL data layer — the app's real backend (server-only).
 * ----------------------------------------------------------------------
 * The CloudBase environment provisioned for this project is the *new
 * generation* (PostgreSQL 17 + PostgREST + RLS), NOT the classic document
 * database. So all server-side persistence (members/roles, courses, pages)
 * runs over a plain `pg` connection here instead of the @cloudbase document
 * SDK.
 *
 * Configuration is a single env var, `DATABASE_URL` (standard libpq URL):
 *   postgresql://USER:PASSWORD@HOST:5432/DBNAME
 *   - Production (CloudBase Run): the env's INTERNAL address (172.17.x.x:5432),
 *     no public exposure, fast.
 *   - Local dev / Vercel: enable 外网 IPv4 in the CloudBase SQL console and use
 *     the public address; set PGSSL=1 if the server requires TLS.
 * When DATABASE_URL is unset, dbConfigured() is false and every caller falls
 * back to its demo / localStorage path — so local dev keeps working with zero
 * backend, exactly like before.
 *
 * The app OWNS its schema: ensureSchema() creates the tables on first use
 * (CREATE TABLE IF NOT EXISTS), so the only console step is creating a DB
 * account + setting DATABASE_URL. db/schema.sql mirrors this for reference.
 */

const DATABASE_URL = process.env.DATABASE_URL;

export function dbConfigured(): boolean {
  return Boolean(DATABASE_URL);
}

/** TLS: on when PGSSL is truthy or the URL asks for sslmode=require. CloudBase's
 *  public endpoint typically needs it; the internal address usually doesn't.
 *  rejectUnauthorized:false because the managed cert isn't in the local trust
 *  store (the connection is still encrypted). */
function sslOption(): PoolConfig['ssl'] {
  const url = DATABASE_URL || '';
  const flag = (process.env.PGSSL || '').toLowerCase();
  if (flag === '0' || flag === 'false') return undefined;
  if (flag === '1' || flag === 'true' || /sslmode=require/i.test(url)) {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

// Pool + one-time schema promise are cached on globalThis so they survive the
// dev-server's HMR module reloads (otherwise every edit leaks a new pool).
type Cache = { pool?: Pool; schema?: Promise<void> };
const cache: Cache = ((globalThis as unknown as { __ngsPg?: Cache }).__ngsPg ??= {});

function getPool(): Pool {
  if (!cache.pool) {
    cache.pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: sslOption(),
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 8_000,
    });
    // A pool 'error' on an idle client would otherwise crash the process.
    cache.pool.on('error', (err) => console.error('[pg] idle client error', err));
  }
  return cache.pool;
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS app_users (
  uid        text PRIMARY KEY,
  email      text,
  name       text,
  role       text NOT NULL DEFAULT 'student',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS admins (
  email      text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS courses (
  id         text PRIMARY KEY,
  data       jsonb NOT NULL,
  published  boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS question_bank (
  id         text PRIMARY KEY,
  data       jsonb NOT NULL,
  published  boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sat_questions (
  id         text PRIMARY KEY,
  data       jsonb NOT NULL,
  published  boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sat_forms (
  id         text PRIMARY KEY,
  data       jsonb NOT NULL,
  published  boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sat_attempts (
  id         text PRIMARY KEY,
  data       jsonb NOT NULL,
  published  boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sat_progress (
  uid        text PRIMARY KEY,
  data       jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS pages (
  route      text NOT NULL,
  locale     text NOT NULL,
  draft      jsonb,
  published  jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (route, locale)
);
CREATE TABLE IF NOT EXISTS ielts_content (
  mod_id     text PRIMARY KEY,
  data       jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS content_versions (
  id        bigserial PRIMARY KEY,
  kind      text NOT NULL,           -- 'course' | 'ielts_module'
  ref_id    text NOT NULL,           -- course slug, or module id
  data      jsonb NOT NULL,          -- full snapshot at save time
  label     text,
  saved_by  text,
  saved_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS content_versions_ref_idx
  ON content_versions (kind, ref_id, id DESC);
`;

/** Create the tables once per process (idempotent). Awaited by query(). */
function ensureSchema(): Promise<void> {
  if (!cache.schema) {
    cache.schema = getPool()
      .query(SCHEMA_SQL)
      .then(() => undefined)
      .catch((err) => {
        // Reset so a transient failure (DB still booting) can retry next call.
        cache.schema = undefined;
        throw err;
      });
  }
  return cache.schema;
}

/** Run a parameterised query and return the rows. Ensures the schema first.
 *  Throws on connection/SQL errors — callers decide whether to fall back. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  if (!DATABASE_URL) throw new Error('DATABASE_URL not set');
  await ensureSchema();
  const res = await getPool().query(text, params as never[]);
  return res.rows as T[];
}

/** Convenience: first row or null. */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

/** Lightweight connectivity probe used by /api setup checks. */
export async function dbPing(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}
