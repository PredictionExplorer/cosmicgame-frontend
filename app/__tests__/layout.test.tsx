import '@testing-library/jest-dom';

jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <script {...props}>{children}</script>
  ),
}));

jest.mock('@rainbow-me/rainbowkit');
jest.mock('wagmi');

jest.mock('../providers', () => ({
  Providers: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="providers">{children}</div>
  ),
}));

jest.mock('../analytics', () => ({
  Analytics: () => null,
}));

jest.mock('../../utils/analytics', () => ({
  GA_TRACKING_ID: undefined,
}));

import { metadata, viewport } from '@/app/layout';

describe('RootLayout metadata', () => {
  it('exports metadata with correct default title', () => {
    expect(metadata.title).toEqual(expect.objectContaining({ default: 'Cosmic Signature' }));
  });

  it('exports metadata with correct lexicon-safe description', () => {
    expect(metadata.description).toContain('procedural on-chain art protocol');
    expect(metadata.description).toContain('Arbitrum');
    expect(metadata.description).not.toMatch(/strategy bidding game/i);
  });

  it('exports metadata with metadataBase', () => {
    expect(metadata.metadataBase).toEqual(new URL('https://www.cosmicsignature.com'));
  });

  it('exports metadata with openGraph', () => {
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({
        type: 'website',
        siteName: 'Cosmic Signature',
      }),
    );
  });

  // The site-wide og:image is resolved from `app/opengraph-image.tsx`
  // via Next.js's file-system convention. We must NOT set a
  // `metadata.openGraph.images` value here; an SVG fallback there is
  // what previously broke Discord/Slack/X/Facebook/LinkedIn embeds.
  it('does not set openGraph.images at the layout level', () => {
    expect((metadata.openGraph as { images?: unknown }).images).toBeUndefined();
  });

  it('does not set twitter.images at the layout level', () => {
    expect((metadata.twitter as { images?: unknown }).images).toBeUndefined();
  });

  it('exports metadata with twitter card', () => {
    expect(metadata.twitter).toBeDefined();
    expect(metadata.twitter).toEqual(
      expect.objectContaining({
        card: 'summary_large_image',
      }),
    );
  });

  it('uses the punchier brand line in OG/Twitter titles', () => {
    expect((metadata.openGraph as { title?: string }).title).toMatch(
      /Every Gesture Shapes the Signature/,
    );
    expect((metadata.twitter as { title?: string }).title).toMatch(
      /Every Gesture Shapes the Signature/,
    );
  });

  // The default description used to be promotional but a touch clinical.
  // The current copy emphasizes the protocol mechanic ("every gesture
  // you make…") and the public-goods narrative (Protocol Guild). These
  // cues are what most embed cards crop after ~160 chars, so we assert
  // their presence directly.
  it('default description names the gesture mechanic and Protocol Guild', () => {
    expect(metadata.description).toMatch(/every gesture you make/i);
    expect(metadata.description).toMatch(/Protocol Guild/);
  });

  it('description is short enough to render in Discord/X embeds (<= 320 chars)', () => {
    expect(typeof metadata.description).toBe('string');
    expect((metadata.description as string).length).toBeLessThanOrEqual(320);
  });

  it('exposes a robust keywords array', () => {
    expect(Array.isArray(metadata.keywords)).toBe(true);
    const keywords = metadata.keywords as readonly string[];
    expect(keywords).toEqual(
      expect.arrayContaining(['Cosmic Signature', 'Arbitrum', 'Protocol Guild', 'CC0']),
    );
  });

  it('declares both an SVG and an ICO favicon for cross-browser support', () => {
    const icons = metadata.icons as { icon: Array<{ url: string; type?: string }> };
    expect(icons.icon).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: '/favicon.svg', type: 'image/svg+xml' }),
        expect.objectContaining({ url: '/favicon.ico' }),
      ]),
    );
  });

  it('declares the Google Search Console verification token', () => {
    expect(metadata.verification).toEqual(
      expect.objectContaining({ google: expect.stringMatching(/^[A-Za-z0-9_-]{20,}$/) }),
    );
  });

  it('sets the canonical URL to the marketing host (not the app subdomain)', () => {
    expect(metadata.alternates).toEqual(
      expect.objectContaining({ canonical: 'https://www.cosmicsignature.com' }),
    );
  });

  it('declares the @CosmicSignature Twitter site handle', () => {
    expect(metadata.twitter).toEqual(expect.objectContaining({ site: '@CosmicSignature' }));
  });

  it('declares the OpenGraph type as "website" and the canonical site name', () => {
    expect(metadata.openGraph).toEqual(
      expect.objectContaining({ type: 'website', siteName: 'Cosmic Signature', locale: 'en_US' }),
    );
  });
});

describe('RootLayout viewport', () => {
  it('exports viewport with device-width and initial scale', () => {
    expect(viewport.width).toBe('device-width');
    expect(viewport.initialScale).toBe(1);
  });

  it('exports viewport with themeColor', () => {
    expect(viewport.themeColor).toBe('#15BFFD');
  });
});

// RootLayout is an async Server Component (uses `headers()`); it cannot be rendered
// reliably in jsdom like a sync client tree. Structure is covered by integration/e2e;
// metadata and viewport are asserted above.
