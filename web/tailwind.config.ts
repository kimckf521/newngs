import type { Config } from 'tailwindcss';

/**
 * Single source of truth for the NGS design system.
 * All brand colors and font families live here. The legacy CSS file references
 * `:root` variables defined in legacy/site.css which still exist for backwards
 * compatibility while components migrate to Tailwind utilities.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand
        brand: {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
          light: '#60a5fa',
        },
        // Surfaces
        surface: '#ffffff',
        page: '#f6f7fb',
        // Text
        ink: {
          DEFAULT: '#0f172a',
          muted: '#475569',
        },
        // Legacy aliases (kept so a small number of historical references
        // still work; remove these once the migration is complete).
        primary: '#2c3e50',
        secondary: '#e74c3c',
        accent: '#3498db',

        // ── Redesign system (premium editorial) ─────────────────────────
        // Deep navy-ink base + warm paper. The brand magenta→cyan gradient
        // is honoured as a restrained signature accent (see `ngs.*`).
        canvas: {
          DEFAULT: '#0d1424', // deepest ink — dark sections, footer
          soft: '#16203a', // layered dark surface
        },
        paper: {
          DEFAULT: '#faf8f3', // warm off-white page background
          deep: '#f1ede4', // slightly deeper warm tint for bands
        },
        edge: 'rgba(13, 20, 36, 0.10)', // hairline borders on light
        edgelt: 'rgba(255, 255, 255, 0.12)', // hairline borders on dark
        slate: {
          ink: '#101a30', // headings on light
          body: '#3f4a5c', // body copy
          mute: '#6b7585', // captions / muted
        },
        // Brand gradient stops (sampled from the NGS "N" mark).
        ngs: {
          magenta: '#ec1c8b',
          violet: '#8b2fd6',
          cyan: '#16c8e6',
        },
        // Near-black indigo-tinted base for the bold "v1" alternate design.
        night: {
          DEFAULT: '#0a0a12',
          800: '#0f0f1a',
          700: '#161622',
          600: '#1e1e2c',
        },
      },
      fontFamily: {
        sans: ['var(--font-albert-sans)', 'system-ui', 'sans-serif'],
        heading: [
          'var(--font-josefin-sans)',
          'var(--font-albert-sans)',
          'system-ui',
          'sans-serif',
        ],
        // Editorial serif for redesigned display headings.
        display: ['var(--font-fraunces)', 'Georgia', 'Cambria', 'serif'],
        // Geometric display sans for the bold "v1" alternate design.
        grotesk: ['var(--font-space-grotesk)', 'var(--font-albert-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '18px',
        md: '12px',
        '2xl': '22px',
        '3xl': '28px',
      },
      boxShadow: {
        card: '0 10px 24px rgba(15, 23, 42, 0.08)',
        'card-lg': '0 24px 60px rgba(15, 23, 42, 0.12)',
        soft: '0 1px 2px rgba(13,20,36,0.04), 0 10px 30px rgba(13,20,36,0.06)',
        lift: '0 20px 60px rgba(13,20,36,0.14)',
      },
      maxWidth: {
        page: '1280px',
        prose: '46rem',
      },
      backgroundImage: {
        'ngs-gradient':
          'linear-gradient(115deg, #ec1c8b 0%, #8b2fd6 50%, #16c8e6 100%)',
        'ngs-gradient-soft':
          'linear-gradient(115deg, rgba(236,28,139,0.14) 0%, rgba(139,47,214,0.14) 50%, rgba(22,200,230,0.14) 100%)',
      },
      letterSpacing: {
        eyebrow: '0.18em',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        // Interactive Global Network ("Living Atlas")
        'arc-flow': {
          '0%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '-24' },
        },
        'ping-soft': {
          '0%': { transform: 'scale(0.6)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both',
        'arc-flow': 'arc-flow 2.6s linear infinite',
        'ping-soft': 'ping-soft 2.4s cubic-bezier(0,0,0.2,1) infinite',
      },
    },
  },
  plugins: [],
};

export default config;
