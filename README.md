# NGS NextJS — NextGen Scholars Website

Migration of the existing Django site at `nextgenscholars.asia` to a modern
**Next.js 14 + TypeScript + Tailwind CSS** stack, deployed on Tencent Cloud
Lighthouse in Guangzhou.

## Repository layout

```
ngs-nextjs/
├── web/        Next.js frontend (built now)
├── api/        FastAPI backend placeholder for future AI features
├── deploy/     Nginx + PM2 configs and deploy script
└── README.md
```

## Why this migration

- The Django site has zero database use — every view is a plain `render()`
  with no context. Django was overkill.
- The user plans to add AI features later via Chinese AI providers
  (DeepSeek, Tencent Hunyuan, etc.). Splitting the frontend (Next.js) from
  the backend (future FastAPI) is the industry-standard pattern.
- Frontend modernization: TypeScript types, React component reuse, faster
  iteration with hot reload.
- Hard constraint: deployment is in China, so no Google Fonts, no Vercel,
  no foreign CDNs. All assets are bundled locally.

## What's preserved

The new site looks **exactly the same** as the Django original:

- All 33 routes (16 ZH + 17 EN, including the contact-form POST endpoint)
- The 10,741-line `styles.css` is shipped verbatim — no rewrites
- All BEM class names, all responsive breakpoints
- Self-hosted Glacial Indifference, Cal Sans, Albert Sans, Josefin Sans fonts
- Faculty video popups (now in React state instead of jQuery DOM)
- Stripe checkout selects on the admissions page
- WeChat customer service floating button
- ICP備 number in the footer
- All images, videos, icons under `/static/...`

## Frontend (`web/`)

```bash
cd web
npm install              # uses China npmmirror (.npmrc)
npm run dev              # http://localhost:3000
npm run build            # production build
```

Stack:
- Next.js 14 (App Router, Standalone output)
- React 18, TypeScript 5
- Tailwind CSS 3 (available but not used to rewrite legacy CSS)
- Bootstrap 5 (only for the carousel CSS used by some sections)
- Nodemailer for the contact form

## Backend (`api/`)

Not built yet. Reserved for the future FastAPI service that will integrate
Chinese AI APIs (DeepSeek, Tencent Hunyuan) and any database-backed features.

## Deployment

See `deploy/README.md` for the full server setup, deploy script, and
rollback procedure.

Production URL: `https://nextgenscholars.asia`
Server: Tencent Cloud Lighthouse Ubuntu 22.04 (2 CPU, 2 GB RAM, Guangzhou)

## Source

The original Django project lives at `/Volumes/Extreme/Claude/NGS-Claude/`.
This Next.js port mirrors its structure 1:1 — every Django template has a
matching React component, every Django route has a matching `app/.../page.tsx`.
