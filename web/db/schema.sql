-- NGS PostgreSQL schema (CloudBase 新一代 SQL 型数据库 / 任意 PostgreSQL 17+)
-- ---------------------------------------------------------------------------
-- The app auto-creates these tables on first use (see src/lib/db/pg.ts →
-- ensureSchema). This file is the human-readable reference / manual bootstrap:
-- paste it into the CloudBase SQL console (SQL 型数据库 → 新建表 / SQL) if you
-- prefer to create the schema yourself.

CREATE TABLE IF NOT EXISTS app_users (
  uid        text PRIMARY KEY,           -- CloudBase auth uid
  email      text,
  name       text,
  role       text NOT NULL DEFAULT 'student',  -- student | parent | admin
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Page-builder / editor allowlist (an email here passes the admin gate).
CREATE TABLE IF NOT EXISTS admins (
  email      text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Admin-authored courses. The full AdminCourse is stored as JSONB in `data`;
-- `id` (slug) and `published` are promoted to columns for keying/filtering.
CREATE TABLE IF NOT EXISTS courses (
  id         text PRIMARY KEY,           -- slug
  data       jsonb NOT NULL,
  published  boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Question bank. Each row is one stored question/test, full payload in `data`
-- (e.g. {book, test, section, questions, answerKey, ...}); `id` (slug) and
-- `published` are promoted for keying/filtering. Mirrors `courses`.
CREATE TABLE IF NOT EXISTS question_bank (
  id         text PRIMARY KEY,           -- slug, e.g. 'cam15-test1-reading'
  data       jsonb NOT NULL,
  published  boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Visual page-builder (Puck) documents, one row per (route, locale).
CREATE TABLE IF NOT EXISTS pages (
  route      text NOT NULL,
  locale     text NOT NULL,
  draft      jsonb,
  published  jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (route, locale)
);
