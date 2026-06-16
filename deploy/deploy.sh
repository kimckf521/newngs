#!/usr/bin/env bash
# Deploy script for ngs-web
# Run from your dev machine. Requires SSH access to the production server.
#
# Usage:
#   ./deploy/deploy.sh
#
# Server expectations:
#   - Node.js 20+ installed (via nvm)
#   - PM2 installed globally
#   - Nginx installed and configured
#   - /var/www/ngs/{releases,shared,current} directory layout
#   - /var/www/ngs/shared/.env.production with SMTP secrets

set -euo pipefail

SERVER="${NGS_SERVER:-ubuntu@43.139.195.82}"
TIMESTAMP=$(date +%Y%m%dT%H%M%S)
RELEASE_PATH="/var/www/ngs/releases/${TIMESTAMP}"

echo "==> Building production bundle..."
cd "$(dirname "$0")/../web"
npm run build

echo "==> Preparing standalone bundle (copying static + public)..."
cp -r .next/static .next/standalone/.next/
cp -r public .next/standalone/

echo "==> Creating release directory on server..."
ssh "$SERVER" "mkdir -p ${RELEASE_PATH}"

echo "==> Rsyncing standalone bundle to server..."
rsync -az --delete \
  .next/standalone/ \
  "${SERVER}:${RELEASE_PATH}/"

echo "==> Linking shared .env.production into release..."
ssh "$SERVER" "ln -sf /var/www/ngs/shared/.env.production ${RELEASE_PATH}/.env.production"

echo "==> Symlinking 'current' to new release..."
ssh "$SERVER" "ln -sfn ${RELEASE_PATH} /var/www/ngs/current"

echo "==> Reloading PM2..."
ssh "$SERVER" "pm2 reload ngs-web || pm2 start /var/www/ngs/current/deploy/pm2/ecosystem.config.js"

echo "==> Smoke test..."
ssh "$SERVER" "curl -s -o /dev/null -w 'HTTP %{http_code}\n' http://127.0.0.1:3000/"

echo "==> Done. Deployed to ${RELEASE_PATH}"
echo "==> Consider cleaning up old releases:"
echo "    ssh $SERVER 'cd /var/www/ngs/releases && ls -t | tail -n +6 | xargs rm -rf'"
