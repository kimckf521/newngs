# Deploy to Tencent CloudBase 云托管 (CloudBase Run)

This is the **China-hosted, containerized** deployment target — the right one
now that auth runs on CloudBase and the audience is mainland China. It runs the
full Next.js app (SSR + API routes + the CloudBase auth client) in a container
inside the Great Firewall.

It does **not** replace the other targets:

| Target | Where | How |
|---|---|---|
| Vercel | global edge (laggy in CN) | `VERCEL=1` disables standalone; auto-build |
| VM (Lighthouse) | `deploy/` (PM2 + nginx) | `node .next/standalone/server.js` |
| **CloudBase Run** | **this dir** | **Docker image, port 3000** |

Files: [`web/Dockerfile`](../../web/Dockerfile), [`web/.dockerignore`](../../web/.dockerignore),
[`web/cloudbaserc.json`](../../web/cloudbaserc.json). `web/next.config.mjs` already
emits `output: 'standalone'` for every non-Vercel build, so no config change is needed.

---

## ⚠️ The one thing that bites: `NEXT_PUBLIC_CLOUDBASE_ENV_ID` is baked in at BUILD time

`NEXT_PUBLIC_*` vars are inlined into the **client** bundle when `next build`
runs and then frozen. CloudBase console / runtime env vars apply at container
**runtime only** and are invisible to the client code. So the env id **must** be
passed as a Docker `--build-arg` (the Dockerfile promotes it to `ENV` before the
build). Setting it only in the console means the client silently falls back to
demo auth and WeChat login never fires.

Consequence: the image is environment-specific. Pointing at a different
CloudBase env = a rebuild with a different `--build-arg`.

---

## One-time: install + auth the CLI

```bash
npm i -g @cloudbase/cli           # binary is `tcb` (alias `cloudbase`)
# if slow: npm i -g @cloudbase/cli --registry=http://mirrors.cloud.tencent.com/npm/
tcb -v
tcb login                         # browser authorization
```

## Deploy

Env id: `ngs-d7gnop4sfa66322e9` (already in `cloudbaserc.json`).

**Path A — explicit image build (recommended; guarantees the env id is inlined).**
Build with the build-arg, push to Tencent Container Registry (TCR), then deploy
that image via the CloudBase console (云托管 → 新建服务 → 镜像拉取) or CLI:

```bash
docker build --build-arg NEXT_PUBLIC_CLOUDBASE_ENV_ID=ngs-d7gnop4sfa66322e9 \
  -t ngs-web web/
# docker tag ngs-web <tcr-registry>/<namespace>/ngs-web:latest && docker push ...
```

**Path B — CLI one-shot** (auto-builds the Dockerfile). Run from `web/`:

```bash
cd web && tcb cloudrun deploy -p 3000
```

> Confirm the CLI/console lets you pass `--build-arg NEXT_PUBLIC_CLOUDBASE_ENV_ID`.
> If it does **not**, use Path A — otherwise the env id won't reach the client bundle.

**Path C — CloudBase Framework** via `cloudbaserc.json` (run from `web/`):

```bash
cd web && cloudbase framework deploy
```

> If the CLI rejects the top-level `"version"` field in `cloudbaserc.json`, delete that line.

## Runtime env vars (set in the CloudBase console, on the service)

Build-time vars (env id/region) are already in the image. Set the rest as
**service env variables** in the console:

- `SMTP_USER`, `SMTP_PASS` — **secrets**, never commit them (see the rotation note
  in [`../README.md`](../README.md)). `lib/env.ts → requireSmtpCreds()` reads them
  lazily at request time, so a missing value only breaks the contact form, not boot.
- **AI advisor ("咨询顾问") — NO key needed on CloudBase Run.** It uses the
  **native CloudBase AI gateway** (生文模型) via `app.ai()` (`lib/chat/provider.ts`),
  which authenticates with the Run **managed identity** (the same `TENCENTCLOUD_*`
  creds the Puck SSR uses) — so there is **no `DEEPSEEK_API_KEY` to set here**.
  Instead, the one-time step is in the console: **AI → 生文模型 → 开通 (enable) the
  `deepseek-v3.2` model** (or whichever `CLOUDBASE_AI_MODEL` points at). If the
  model isn't enabled, the chat falls back to the WeChat 客服 handoff (never 500s).
- `DEEPSEEK_API_KEY` — **only for off-platform hosts / local dev** (Vercel, or
  `npm run dev` where the Run managed identity is absent). It's the **fallback**
  backend: when no CloudBase creds exist, `lib/chat/provider.ts` calls the direct
  DeepSeek API instead. **Secret**, never commit; not needed on CloudBase Run.
- `SMTP_HOST`, `SMTP_PORT`, `EMAIL_RECEIVER`, `CLOUDBASE_AI_PROVIDER`,
  `CLOUDBASE_AI_MODEL` — non-secret; already in `cloudbaserc.json` (switch the AI
  model/provider there — e.g. to `deepseek-v4-pro` or `hunyuan` — without a code
  change or rebuild).
- Do **not** set `PORT` / `HOSTNAME` in the console — let the Dockerfile's
  `3000` / `0.0.0.0` stand (console values override Dockerfile `ENV`).

## Verify

```bash
curl -fsS https://<run-service-url>/api/health   # -> {"ok":true,...}
```

---

## WeChat login setup (required for the 微信 button to work)

Code is wired (`lib/auth.ts → loginWithProvider`, `/auth/callback[_en]`). It only
works once the console + WeChat Open Platform are configured:

1. **WeChat Open Platform** (`open.weixin.qq.com`) — the hard blocker:
   - Complete **开发者资质认证** (enterprise-only, ~¥300/year, needs 营业执照, ~1–3 days).
   - Create a **网站应用** (Website Application — *not* a 公众号). Apply for & pass
     **微信登录** capability review. You get an **AppID + AppSecret**.
   - Set **授权回调域** to the **bare domain** only — `nextgenscholars.asia`
     (no `https://`, no path). Scope is fixed at `snsapi_login`.
2. **CloudBase console — enable WeChat** at 环境 → 登录授权
   (`console.cloud.tencent.com/tcb/env/login`): enable 微信登录, pick
   **微信开放平台（网站应用）**, paste the AppID + AppSecret.
3. **CloudBase console — Web 安全域名**: 环境 → 安全配置 → 添加安全域名, add
   `nextgenscholars.asia` (+ `www.`, + any preview domain). This is **separate**
   from WeChat's 授权回调域; both must be set.

**Test:** click 微信 → redirect to the WeChat QR page → scan → redirect back to
`/auth/callback[_en]` → land on `/member[_en]` signed in.
- `「该链接无法访问」` → fix the WeChat **授权回调域**.
- `非法来源` → fix the CloudBase **Web 安全域名** list.

> The redirect target is `https://<domain>/auth/callback` (zh) or
> `/auth/callback_en` (en), built in `loginWithProvider` from `siteLinks`.

## SMS (phone OTP) login setup (for the 验证码 / phone form)

Code is wired (`lib/auth.ts → requestSmsCode` + `SmsLoginForm.tsx`): step 1 sends
the code via `signInWithOtp({ phone })`, step 2 verifies via `data.verifyOtp({ token })`.
No redirect — it's an in-page two-step form. To make it work for real:

1. **CloudBase console — enable 手机号登录 (phone login)** on the same 登录授权 page
   (`console.cloud.tencent.com/tcb/env/login`).
2. **Tencent Cloud SMS (短信)** — phone OTP sends through Tencent Cloud SMS, which
   needs an approved **短信签名** + **短信正文模板** and available quota (the free
   tier is limited; review takes ~1 day). Confirm the env has SMS enabled/funded.
3. **region must be `ap-shanghai`** — already set in `lib/cloudbase.ts` init
   (phone OTP only works in that region).
4. The form normalises bare 11-digit CN mobiles to `+86…` (E.164); other numbers
   must be entered with their `+<country>` prefix.

### Notes / caveats

- **SMS** replaced Google here. Phone OTP also auto-creates the account on first
  use, so the same form serves both login and registration.
- The **QR (网站应用 + snsapi_login)** flow assumes users open the site in a normal
  browser. If they open it *inside* the WeChat in-app browser, that's the 公众号
  网页授权 (`snsapi_userinfo`) path — a different console source.
- ICP **备案** for the domain is expected for Tencent-hosted production in CN
  (the Lighthouse deploy likely already has it) — verify before going live.

## Page builder (Puck) — collections & security rules ⚠️ LAUNCH-BLOCKING

The visual editor (`/admin`) reads/writes CloudBase. The client admin gate is
**UX only** — the *real* boundary is the database security rules below. Set
these in the CloudBase console (环境 → 数据库 → 集合 → 权限) before exposing
`/admin` in production. The save→publish→render round-trip must be exercised
once against the real env (it cannot be tested without this setup).

**1. Create collections:** `pages`, `admins` (+ the existing `users`).

**2. Seed `admins`:** one doc per editor, e.g. `{ email: "designer@…", uid: "<cloudbase uid>" }`.
Add the designer + founders. (`role:'admin'` in `users` is separate — see `lib/roles.ts`.)

**3. Security rules:**
- **`pages`** — public read, admins-only write:
  - read: `true` (published pages are public; SSR reads them too).
  - write: only if the caller is in `admins`. If the rule language can't express
    a cross-collection `admins` lookup, **harden by routing writes through a
    CloudBase cloud function** that checks `admins` server-side and is the *only*
    writer (lock the collection to function-only writes). **Do NOT leave `pages`
    write-open** — any authed user could otherwise publish to the live homepage.
- **`admins`** — must be **readable by signed-in users** so `isAdmin()`'s
  `where({email})` query works (a denied read locks out ALL admins → everyone
  bounced to `/login`). To avoid exposing the whole allowlist, key rows by the
  CloudBase `uid`/`openid` and scope reads to the caller's own row.
- **`users`** — read/write own doc only; `role:'admin'` must NOT be client-settable.

**4. Storage rule:** admin-only writes under the `pages/uploads/` prefix; public
(or signed) read. Add the storage host to `next.config.mjs` `images.remotePatterns`
(already done for `**.myqcloud.com` / `**.tcb.qcloud.la` / `**.tcloudbaseapp.com`).

### SSR host & credentials (where published content renders)

`getPublishedData` (`web/src/lib/puck/server.ts`) reads server-side via
`@cloudbase/node-sdk`, which needs credentials:
- **CloudBase Run** — uses the injected `TENCENTCLOUD_*` managed identity; no
  config needed. ✅ This is the canonical China host.
- **Vercel / other hosts** — set server-only `CLOUDBASE_SECRET_ID` +
  `CLOUDBASE_SECRET_KEY` (NOT `NEXT_PUBLIC_*`) in project env, or published
  content never renders there (it silently falls back to the hardcoded page —
  no error, but edits won't appear). Guard that long-lived secret.

### Dev-only flag

`NEXT_PUBLIC_ADMIN_DEV_BYPASS=1` forces `isAdmin()` true for local testing. It is
**dead-code-eliminated in production builds** (guarded by `NODE_ENV`), so it
cannot open the editor to visitors in prod — but never rely on it as a gate.
