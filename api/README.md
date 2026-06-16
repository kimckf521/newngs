# NGS API — Future AI Backend (Placeholder)

This directory is reserved for the future FastAPI service that will integrate
Chinese AI providers (DeepSeek, Tencent Hunyuan, etc.) and any database-backed
features.

It is **not built yet**. The Next.js frontend in `../web/` works standalone for
the current static-content site.

## Where the current API code lives

Until the FastAPI service is built, all server-side endpoints live inside the
Next.js app under `../web/src/app/api/`:

| Route                       | File                                                  | Purpose                       |
| --------------------------- | ----------------------------------------------------- | ----------------------------- |
| `POST /api/partner_with_us` | `web/src/app/api/partner_with_us/route.ts`            | Contact form → Nodemailer     |
| `GET  /api/health`          | `web/src/app/api/health/route.ts`                     | Liveness probe                |

Shared backend helpers live in `web/src/lib/`:

- `mailer.ts` — Nodemailer transporter, header sanitization, HTML body
- `env.ts`    — required-env validation (throws at boot in production)

When the FastAPI service is added, the Next.js routes here may move under
this directory and Nginx will route `/api/*` to whichever backend handles
each path.

## Deliberately deferred

A few items came up in the backend review and were intentionally **not**
implemented yet:

- **Shared form-submission abstraction** — `/api/partner_with_us` is
  currently the only POST endpoint. The other "Form*" components in
  `web/src/components/sections/` (FormHybrid, FormDualTrack,
  FormOnlineDiploma) are static comparison tables, not interactive forms.
  Adding a `submitContactForm(kind, fields)` helper now would be
  speculative — wait until a second real submit endpoint exists, then
  extract the shared parts.
- **Full structured logger (pino / winston)** — overkill for two routes.
  The sanitized `logError` helper in `partner_with_us/route.ts` covers
  the current need (drop secrets / SMTP banners, prefix with a tag). When
  the API surface grows past ~5 routes or PM2 stdout becomes hard to
  search, swap in pino.

## Planned stack

- **FastAPI** — Python web framework
- **uv** or **poetry** — dependency management
- **PostgreSQL** or **MySQL** — for future database needs
- **DeepSeek SDK / Tencent Hunyuan SDK** — Chinese AI providers
- **uvicorn + Gunicorn** — ASGI server
- Deployed alongside Next.js on the same Tencent Cloud server, on a different
  port (e.g. 8000), with Nginx routing `/api/*` requests to it

## When to build

Once the user has decided which AI features to ship first. Likely candidates:

- AI-powered tutor matching
- Course recommendation chatbot
- Personalized study plan generation
- Content moderation for community features
