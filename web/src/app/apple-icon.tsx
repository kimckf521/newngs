import { ImageResponse } from 'next/og';

// Generated 180×180 apple-touch-icon (iOS home screen). Built from code so it
// needs no design asset: the brand magenta→cyan gradient with the "N" mark.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #ec1c8b 0%, #8b2fd6 50%, #16c8e6 100%)',
          color: '#ffffff',
          fontSize: 108,
          fontWeight: 800,
          letterSpacing: '-0.05em',
        }}
      >
        N
      </div>
    ),
    { ...size },
  );
}
