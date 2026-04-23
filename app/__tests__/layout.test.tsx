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

jest.mock('../../utils', () => ({
  logoImgUrl: 'https://example.com/logo.png',
}));

import { metadata, viewport } from '@/app/layout';

describe('RootLayout metadata', () => {
  it('exports metadata with correct default title', () => {
    expect(metadata.title).toEqual(expect.objectContaining({ default: 'Cosmic Signature' }));
  });

  it('exports metadata with correct description', () => {
    expect(metadata.description).toContain('Cosmic Signature is a procedural on-chain art protocol');
    expect(metadata.description).toContain('Arbitrum');
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

  it('exports metadata with twitter card', () => {
    expect(metadata.twitter).toBeDefined();
    expect(metadata.twitter).toEqual(
      expect.objectContaining({
        card: 'summary_large_image',
      }),
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
