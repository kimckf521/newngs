/** @type {import('next').NextConfig} */
const nextConfig = {
  // `standalone` is for self-hosting (Tencent Cloud / PM2 — see deploy/ and the
  // README). On Vercel we must NOT emit standalone: Vercel's own Next.js build
  // pipeline produces the serverless/edge output and standalone can interfere.
  // Vercel sets VERCEL=1 during builds, so we drop standalone there and keep it
  // for every other (self-hosted) build.
  output: process.env.VERCEL ? undefined : 'standalone',
  reactStrictMode: true,
  // The student portal moved from /member → /student (role-based: /student,
  // /parent, /admin). Redirect the old paths so existing links/bookmarks keep
  // working.
  async redirects() {
    return [
      { source: '/member', destination: '/student', permanent: true },
      { source: '/member/:path*', destination: '/student/:path*', permanent: true },
      { source: '/member_en', destination: '/student_en', permanent: true },
      { source: '/member_en/:path*', destination: '/student_en/:path*', permanent: true },
    ];
  },
  images: {
    // Self-hosted Next.js image optimizer (sharp). Required by next/image
    // unless we want to ship raw assets. The standalone output already
    // includes sharp, so this works on the production server.
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Allow images uploaded to CloudBase storage (page builder) through
    // next/image. Covers the COS + CloudBase temp-file URL hosts.
    remotePatterns: [
      { protocol: 'https', hostname: '**.myqcloud.com' },
      { protocol: 'https', hostname: '**.tcb.qcloud.la' },
      { protocol: 'https', hostname: '**.tcloudbaseapp.com' },
    ],
  },
  experimental: {
    // @cloudbase/manager-node is a heavy Node-only SDK (used server-side to
    // create end-user accounts). Keep it external so webpack doesn't try to
    // bundle it into the server output.
    serverComponentsExternalPackages: ['@cloudbase/manager-node'],
  },
};

export default nextConfig;
