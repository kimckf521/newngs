# Next.js 14 standalone image for Tencent CloudBase 云托管 (CloudBase Run).
# Build context = this `web/` directory.
#
#   docker build --build-arg NEXT_PUBLIC_CLOUDBASE_ENV_ID=<env-id> -t ngs-web web/
#
# next.config.mjs emits `output: 'standalone'` whenever VERCEL is unset (it is
# unset here), so `.next/standalone/server.js` is produced. Vercel builds are
# unaffected (VERCEL=1 there disables standalone).
# syntax=docker/dockerfile:1

# 1) deps — install with the lockfile only, for layer caching
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# 2) builder — produce the standalone build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* are inlined into the CLIENT bundle at build time and frozen.
# The CloudBase env id MUST be present here (console/runtime env vars are too
# late) or the client falls back to demo auth and WeChat login never runs.
# Default to the project's (public, client-inlined) env id so a build that does
# NOT pass --build-arg — e.g. CloudBase Run via cloudbaserc.json — still gets
# real auth instead of silently falling back to demo mode. Override with
# --build-arg for a different environment.
ARG NEXT_PUBLIC_CLOUDBASE_ENV_ID=ngs-d7gnop4sfa66322e9
ARG NEXT_PUBLIC_CLOUDBASE_REGION=ap-shanghai
ENV NEXT_PUBLIC_CLOUDBASE_ENV_ID=${NEXT_PUBLIC_CLOUDBASE_ENV_ID}
ENV NEXT_PUBLIC_CLOUDBASE_REGION=${NEXT_PUBLIC_CLOUDBASE_REGION}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3) runner — minimal self-contained server
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Port/host must match EXPOSE and the deploy --port / containerPort.
# 0.0.0.0 is required or CloudBase Run can't reach the container.
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs
# Standalone does NOT bundle public/ or .next/static — copy both explicitly.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
