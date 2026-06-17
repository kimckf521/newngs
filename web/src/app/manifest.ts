import type { MetadataRoute } from 'next';

/**
 * Web app manifest (/manifest.webmanifest). Gives Android "Add to Home Screen"
 * a name, theme colours (the dark v1 canvas) and an icon. Next.js auto-links
 * it from every page's <head>. The apple-touch-icon is generated separately by
 * app/apple-icon.tsx.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'NextGen Scholars 未来学者',
    short_name: 'NextGen Scholars',
    description:
      'International education connecting ambitious students with mentors from the world’s leading universities.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a12',
    theme_color: '#0a0a12',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
