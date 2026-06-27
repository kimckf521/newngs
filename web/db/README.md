# Database (PostgreSQL) — setup & operations

This project's CloudBase environment is the **new generation** (`SQL 型数据库` =
PostgreSQL 17 + PostgREST + RLS), **not** the classic document database. So the
app persists members/roles, courses (and later page-builder pages) to plain
PostgreSQL via a server-side `pg` connection — see [`src/lib/db/pg.ts`](../src/lib/db/pg.ts).

When `DATABASE_URL` is **unset**, every feature falls back to its demo /
localStorage trial path, so local dev works with zero backend.

## One-time setup

1. **Create a DB account** — CloudBase 控制台 → `SQL 型数据库` → `数据库设置` →
   `账号管理` → `创建账号` (a username + password).
2. **Connection address**
   - **Production on CloudBase Run** → use the **internal** address
     (`连接设置 → 内网地址`, e.g. `172.17.x.x:5432`). Fast, no public exposure,
     no TLS needed.
   - **Local dev / off-platform (Vercel)** → `连接设置 → 开启 外网 IPv4`, and set
     `PGSSL=1`.
3. **Set env vars** (`.env.local` locally, or the service's env on the host):

   ```
   DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DBNAME
   PGSSL=1            # only when connecting over the public address
   ADMIN_API_KEY=<long-random-string>   # gates the admin API; required in prod
   ```

4. That's it — the app **auto-creates its tables** on first request (idempotent
   `CREATE TABLE IF NOT EXISTS`). [`schema.sql`](./schema.sql) mirrors the DDL if
   you'd rather create them by hand in the SQL console.

## Tables

| table       | purpose                                                        |
|-------------|----------------------------------------------------------------|
| `app_users` | one row per auth uid → `role` (student/parent/admin) + profile |
| `admins`    | email allowlist that passes the page-builder / editor gate     |
| `courses`   | admin-authored courses (full course JSON in `data`)            |
| `pages`     | visual page-builder (Puck) docs per (route, locale) — phase 2  |

## Make an account an admin

**Via the console** (`成员` tab): set the member's role dropdown to `管理员`.
This updates `app_users.role` AND adds their email to `admins`.

**Via SQL** (CloudBase SQL console), replacing the email:

```sql
UPDATE app_users SET role = 'admin' WHERE email = 'their@email.com';
INSERT INTO admins (email) VALUES ('their@email.com') ON CONFLICT DO NOTHING;
```

The user picks up the new role on their next login / page refresh.
