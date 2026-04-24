import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const contentType = 'image/png';
export const size = { width: 1200, height: 600 };
export const alt = 'Cosmic Signature \u2014 Every Gesture Shapes the Signature.';

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '72px',
        background:
          'radial-gradient(60% 40% at 15% 20%, rgba(108, 60, 225, 0.55) 0%, transparent 60%), radial-gradient(50% 60% at 100% 80%, rgba(0, 229, 255, 0.35) 0%, transparent 70%), radial-gradient(40% 40% at 75% 35%, rgba(255, 61, 138, 0.35) 0%, transparent 65%), linear-gradient(180deg, #0D0521 0%, #1A0B3E 100%)',
        color: '#F0EDFF',
        fontFamily: 'Helvetica, Arial, sans-serif',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #00E5FF, #6C3CE1)',
            boxShadow: '0 0 30px rgba(0, 229, 255, 0.75)',
          }}
        />
        <div
          style={{
            fontSize: 20,
            textTransform: 'uppercase',
            letterSpacing: '0.3em',
            opacity: 0.8,
          }}
        >
          Cosmic Signature
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            maxWidth: '900px',
          }}
        >
          Every Gesture Shapes the Signature.
        </div>
        <div style={{ fontSize: 24, opacity: 0.7, maxWidth: '820px', lineHeight: 1.4 }}>
          A procedural on-chain art protocol on Arbitrum.
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 18,
          opacity: 0.65,
          textTransform: 'uppercase',
          letterSpacing: '0.22em',
        }}
      >
        <div style={{ display: 'flex', gap: '32px' }}>
          <span>CC0</span>
          <span>Formally Verified</span>
          <span>7% Protocol Guild</span>
        </div>
        <div>cosmicsignature.com</div>
      </div>
    </div>,
    size,
  );
}
