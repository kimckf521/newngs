# NextGen Scholars — Homepage Redesigns

This Next.js 14 app contains **two new homepage designs** built as preview routes,
so the existing live pages are untouched. Both are bilingual (English + 中文).

| Route | Design | Add `?lang=zh` for Chinese |
|-------|--------|----------------------------|
| `/redesign` | **v0 — Premium editorial**: light warm "paper", Fraunces serif, restrained brand gradient, an interactive "Living Atlas" global map. | `/redesign?lang=zh` |
| `/redesign-v1` | **v1 — Bold dark**: near-black "night" base, aurora gradient glows, Space Grotesk display type, glass cards. | `/redesign-v1?lang=zh` |

## Run locally

```bash
cd web
npm install
npm run dev
# open http://localhost:3000/redesign  and  http://localhost:3000/redesign-v1
```

## Production build / deploy

```bash
npm run build   # type-checks + builds (succeeds without secrets)
npm start       # serves the production build
```

The contact form posts to `/api/partner_with_us`, which sends email via SMTP.
Those credentials are read **lazily at request time**, so the build does not
need them. To enable the form in production, set the env vars (see
`.env.local.example`):

```
SMTP_USER=...        # required to send mail
SMTP_PASS=...        # required to send mail
SMTP_HOST=smtp.exmail.qq.com   # optional, has a default
SMTP_PORT=465                  # optional, has a default
EMAIL_RECEIVER=info@nextgenscholars.asia   # optional, has a default
```

If SMTP isn't configured the form still submits cleanly; the send just fails
silently and is logged server-side.

## Where the code lives

- `src/components/redesign/`      — v0 (editorial) components
- `src/components/redesign-v1/`   — v1 (bold dark) components
- `src/app/redesign/page.tsx`     — v0 route
- `src/app/redesign-v1/page.tsx`  — v1 route
- `src/content/`                  — shared bilingual content (reused by both)
- `tailwind.config.ts`            — design tokens for both (e.g. `canvas`/`paper` for v0, `night`/`grotesk` for v1, the `ngs` brand gradient)
- `src/app/globals.css`           — includes a `.ngs-redesign`-scoped reset so the new designs aren't affected by the legacy stylesheets

## Promoting a design to the real homepage

When you've chosen one, point the live home at it: render the chosen
`Home…` composition from `src/app/(zh)/page.tsx` (Chinese home, `/`) and
`src/app/(en)/index_en/page.tsx` (English home, `/index_en`). Happy to do
this for whichever design you pick.
