# Testing WeChat (微信) scan login against LOCAL dev

WeChat **网站应用** web login will not accept `localhost` as its 授权回调域 — it
requires your real, verified domain. So to test the QR-scan flow locally we make
the browser reach the local dev server **through** that domain. The app already
builds the OAuth `redirect_uri` from `window.location.origin`, so **no code
change is needed** — visiting via the real domain is enough.

> Replace `nextgenscholars.asia` below with whatever domain you actually set as
> WeChat's **授权回调域** (it may differ from the site's display domain).

---

## 0. Console prerequisites (one-time, your side)

1. **WeChat Open Platform** → your 网站应用 → **授权回调域** = `nextgenscholars.asia`
   (bare domain — no `http://`, no port, no path).
2. **CloudBase console** → 登录授权 → **微信登录** enabled (网站应用 source) with the
   AppID/AppSecret. *(Already done — provider id is `wx_open`.)*
3. **CloudBase console** → **Web 安全域名** → add the **exact origin** you'll use
   locally so the SDK's cross-origin call passes CORS:
   `http://nextgenscholars.asia:3000` (keep your production origin too).

## 1. Point the domain at your machine (`/etc/hosts`)

```bash
sudo sh -c 'echo "127.0.0.1 nextgenscholars.asia" >> /etc/hosts'
```

(or edit `/etc/hosts` by hand and add the line `127.0.0.1 nextgenscholars.asia`)

## 2. Run dev bound to all interfaces

```bash
cd web
npm run dev:domain      # = next dev -H 0.0.0.0 -p 3000
```

## 3. Test in a REAL browser (not the Claude preview)

Open **`http://nextgenscholars.asia:3000/login_en`** (or `/login`), then:

1. Click **WeChat** → you're redirected to `open.weixin.qq.com/connect/qrconnect…`
   (the `redirect_uri` now uses `nextgenscholars.asia`, which WeChat accepts).
2. Scan the QR with the WeChat app and confirm.
3. WeChat redirects back to
   `http://nextgenscholars.asia:3000/auth/callback_en?code=…&state=…`, the
   `OAuthCallback` page runs `verifyOAuth()`, and you land on `/member_en`.

## Troubleshooting

- **WeChat says "redirect_uri 参数错误 / 域名不匹配":** the domain didn't match the
  授权回调域. WeChat matches the **host** (port is normally ignored). If the `:3000`
  port is the problem, run on port 80 instead:
  `sudo npm run dev -- -H 0.0.0.0 -p 80` and open `http://nextgenscholars.asia/login_en`.
- **WeChat button errors *before* redirecting** (check Network → `/auth/v1/provider/uri`):
  - `provider wechat not found` → the wrong env or the source isn't enabled. (We use `provider_id=wx_open`.)
  - CORS / origin error → add `http://nextgenscholars.asia:3000` to CloudBase **Web 安全域名**.
- **WeChat / CloudBase requires HTTPS:** terminate TLS locally with Caddy (auto local cert):
  `caddy reverse-proxy --from nextgenscholars.asia:443 --to localhost:3000`
  then open `https://nextgenscholars.asia/login_en` and add **that** origin to Web 安全域名.

## Cleanup

Remove the line you added to `/etc/hosts` when you're done testing.
