/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  images: {
    // Self-hosted Next.js image optimizer (sharp). Required by next/image
    // unless we want to ship raw assets. The standalone output already
    // includes sharp, so this works on the production server.
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {},
};

export default nextConfig;
