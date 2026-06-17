# NGS Web Deployment Guide

This guide covers the **VM target** (Tencent Cloud Lighthouse + PM2 + nginx).
For the **containerized CloudBase 云托管 (CloudBase Run)** target — the
China-hosted path that also runs the CloudBase auth + WeChat login — see
[`cloudbase/README.md`](cloudbase/README.md). Vercel remains a third target
(global, but laggy from mainland China).

Deployment target: Tencent Cloud Lighthouse Ubuntu 22.04 (2 CPU, 2 GB RAM)
Domain: nextgenscholars.asia (`43.139.195.82`)

## One-time server setup

```bash
# SSH in
ssh ubuntu@43.139.195.82

# Install Node.js 20 LTS via nvm (China-friendly mirror)
curl -o- https://gitee.com/mirrors/nvm/raw/master/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
nvm alias default 20

# Configure npm to use China mirror
npm config set registry https://registry.npmmirror.com

# Install PM2 globally
npm install -g pm2

# Install Nginx
sudo apt update && sudo apt install -y nginx

# Install Certbot for Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx

# Create directory layout
sudo mkdir -p /var/www/ngs/{releases,shared}
sudo chown -R ubuntu:ubuntu /var/www/ngs
mkdir -p /var/log/pm2
```

## Configure secrets

Create `/var/www/ngs/shared/.env.production` with the SMTP credentials:

```env
SMTP_HOST=smtp.exmail.qq.com
SMTP_PORT=465
SMTP_USER=didihaha@nextgenscholars.asia
SMTP_PASS=<rotated_password>
EMAIL_RECEIVER=info@nextgenscholars.asia
```

**CRITICAL — must do before first deploy:**

1. **Rotate the SMTP password.** The original is in the Django `settings.py`
   and exposed in git history. Even after this Next.js deploy, the leaked
   password remains valid until you change it in Tencent Exmail's admin
   console. Until you rotate, anyone with a copy of the Django repo can
   send mail through this account.
2. After rotating, store the new password in
   `/var/www/ngs/shared/.env.production` only — never commit it.
3. The Next.js app validates `SMTP_USER` and `SMTP_PASS` at boot
   (`web/src/lib/env.ts`). If either is missing, the app **will refuse to
   start in production**. Watch for `Missing required environment variable`
   in `pm2 logs ngs-web` after deploy — that means the symlink to
   `.env.production` is broken or the file is empty.

## Configure Nginx

```bash
# Copy the nginx config to the server
scp deploy/nginx/nextgenscholars.asia.conf \
  ubuntu@43.139.195.82:/tmp/

# On the server:
sudo mv /tmp/nextgenscholars.asia.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/nextgenscholars.asia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Get TLS certs
sudo certbot --nginx -d nextgenscholars.asia -d www.nextgenscholars.asia
```

## Deploy

From your dev machine:

```bash
./deploy/deploy.sh
```

This will:
1. Build the standalone Next.js bundle
2. Copy `.next/static` and `public/` into the standalone directory
3. rsync everything to `/var/www/ngs/releases/<timestamp>/` on the server
4. Symlink `/var/www/ngs/current` to the new release
5. Reload PM2

## First-time PM2 setup

After the first deploy:

```bash
ssh ubuntu@43.139.195.82
pm2 start /var/www/ngs/current/deploy/pm2/ecosystem.config.js
pm2 save
pm2 startup systemd
# Run the suggested command from `pm2 startup` to enable boot
```

## Cutover from the existing Django site

1. The Django app is currently bound to port 80/443 directly. Stop it:
   ```bash
   sudo systemctl stop ngs-django  # or however it's started
   ```
2. The new Nginx config above takes over ports 80/443 and proxies to PM2 on
   3000.
3. Verify:
   ```bash
   curl -I https://nextgenscholars.asia/
   curl -I https://nextgenscholars.asia/index_en
   ```
4. Keep the Django code on disk for ~1 week as a safety net before deleting.

## Rollback

The releases directory keeps old deployments. To roll back:

```bash
ssh ubuntu@43.139.195.82
cd /var/www/ngs/releases
ls -t           # find the previous release timestamp
ln -sfn /var/www/ngs/releases/<previous-timestamp> /var/www/ngs/current
pm2 reload ngs-web
```

## Cleanup old releases

```bash
ssh ubuntu@43.139.195.82
cd /var/www/ngs/releases && ls -t | tail -n +6 | xargs rm -rf
```

## Monitoring

```bash
pm2 status                    # process status
pm2 logs ngs-web              # tail logs
pm2 monit                     # interactive monitor
sudo nginx -t                 # validate nginx config
sudo journalctl -u nginx -f   # nginx system logs
```

## Health checks

- **Liveness endpoint:** `GET /api/health` returns `{ ok: true, ts: ... }`.
  Use this for uptime monitors and PM2 healthchecks instead of probing `/`.
  Example smoke test:
  ```bash
  curl -fsS https://nextgenscholars.asia/api/health
  ```
- **SMTP verify on boot:** the Node process calls `transporter.verify()` at
  startup in production. If credentials are wrong or Exmail is unreachable,
  you'll see `[mailer] SMTP verify failed` in `pm2 logs ngs-web` — fix
  before users hit the contact form.
- Memory: PM2 will auto-restart if `ngs-web` exceeds 700 MB
- Disk: `du -sh /var/www/ngs/releases/*` — clean up old releases periodically
- TLS expiry: certbot auto-renews via systemd timer

## Anti-abuse on the contact form

The `/api/partner_with_us` route has multiple defenses (in priority order):

1. **Origin allow-list** — POSTs from origins outside
   `nextgenscholars.asia` / `www.nextgenscholars.asia` / `localhost:3000`
   are rejected with 403. Update the list in
   `web/src/app/api/partner_with_us/route.ts` if you add a staging domain.
2. **In-memory rate limit** — 5 submissions per IP per minute, per Node
   fork. State is lost on restart. For stronger limiting, also enable
   `limit_req` in Nginx (a `limit_req_zone` keyed off `$binary_remote_addr`
   inside the `location = /api/partner_with_us` block).
3. **Honeypot field** — hidden `<input name="website">` in
   `IndexForm.tsx`. Filled values are silently dropped.
4. **CAPTCHA** — *not yet wired up.* The honeypot catches dumb bots; if
   you start seeing real spam, add Tencent Cloud Captcha
   (https://cloud.tencent.com/product/captcha — works inside the GFW
   unlike hCaptcha/reCAPTCHA). The integration is roughly:
     - Get a CaptchaAppId + AppSecretKey from the Tencent Cloud console.
     - Add the JS snippet to `IndexForm.tsx`, capture the ticket from the
       widget, send it as a hidden form field.
     - In `route.ts`, call Tencent's verify API with the ticket before
       running the rest of the validation. Reject on failure.
