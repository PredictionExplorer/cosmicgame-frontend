import '@testing-library/jest-dom';

import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';

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

jest.mock('../../../analytics', () => ({
  Analytics: () => null,
}));

// These ship as untranspiled ESM; next/jest always ignores node_modules, so
// mock them like wagmi/rainbowkit above.
jest.mock('@vercel/analytics/next', () => ({
  Analytics: () => null,
}));

jest.mock('@vercel/speed-insights/next', () => ({
  SpeedInsights: () => null,
}));

jest.mock('../../../../utils/analytics', () => ({
  GA_TRACKING_ID: undefined,
}));

import type { Metadata } from 'next';

import { generateMetadata, viewport } from '../layout';
import {
  generateMetadata as landingGenerateMetadata,
  viewport as landingViewport,
} from '../../(landing)/layout';

const paramsFor = (locale: string) => ({ params: Promise.resolve({ locale }) });

let metadata: Metadata;
let landingMetadata: Metadata;

beforeAll(async () => {
  metadata = await generateMetadata(paramsFor('en'));
  landingMetadata = await landingGenerateMetadata(paramsFor('en'));
});

describe('Root layout metadata (shared by both route groups)', () => {
  it('both root layouts produce the same site-wide metadata defaults', () => {
    expect(landingMetadata).toEqual(metadata);
    expect(landingViewport).toBe(viewport);
  });

  it('localizes og:locale per the [locale] segment', async () => {
    const zh = await generateMetadata(paramsFor('zh'));
    expect((zh.openGraph as { locale?: string }).locale).toBe('zh_CN');
    const zhLanding = await landingGenerateMetadata(paramsFor('zh'));
    expect((zhLanding.openGraph as { locale?: string }).locale).toBe('zh_CN');
  });

  it('exports metadata with correct default title', () => {
    expect(metadata.title).toEqual(expect.objectContaining({ default: 'Cosmic Signature' }));
  });

  it('exports metadata with correct lexicon-safe description', () => {
    expect(metadata.description).toContain('procedural on-chain art protocol');
    expect(metadata.description).toContain('Arbitrum');
    expect(metadata.description).not.toMatch(/strategy bidding game/i);
  });

  it('exports metadata with metadataBase', () => {
    expect(metadata.metadataBase).toEqual(new URL('https://cosmicsignature.com'));
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

  // The site-wide og:image is resolved from each group's
  // `opengraph-image.tsx` via Next.js's file-system convention. We must NOT
  // set a `metadata.openGraph.images` value here; an SVG fallback there is
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
      expect.objectContaining({ canonical: 'https://cosmicsignature.com' }),
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

describe('Root layout viewport', () => {
  it('exports viewport with device-width and initial scale', () => {
    expect(viewport.width).toBe('device-width');
    expect(viewport.initialScale).toBe(1);
  });

  it('exports viewport with themeColor', () => {
    expect(viewport.themeColor).toBe('#15BFFD');
  });
});

// The root layouts are Server Components; their shared document shell lives
// in app/root-document.tsx. Structure is covered by integration/e2e; metadata
// and viewport are asserted above. The Vercel Analytics / Speed Insights
// contract below is asserted statically against the shared document source,
// following the same approach as landing-shell-no-web3.test.ts.
describe('RootDocument Vercel Analytics contract', () => {
  const documentSource = readFileSync(
    resolvePath(__dirname, '..', '..', '..', 'root-document.tsx'),
    'utf-8',
  );
  const bodyMatch = documentSource.match(/<body>([\s\S]*?)<\/body>/);

  it('imports the Analytics component from @vercel/analytics/next', () => {
    expect(documentSource).toMatch(
      /import\s*\{\s*Analytics\s+as\s+VercelAnalytics\s*\}\s*from\s*'@vercel\/analytics\/next'/,
    );
  });

  it('imports the SpeedInsights component from @vercel/speed-insights/next', () => {
    expect(documentSource).toMatch(
      /import\s*\{\s*SpeedInsights\s*\}\s*from\s*'@vercel\/speed-insights\/next'/,
    );
  });

  it('renders <VercelAnalytics /> inside <body> for both route groups', () => {
    expect(bodyMatch).not.toBeNull();
    // The shared document is used by BOTH root layouts, so both hosts
    // report to Vercel Web Analytics.
    expect(bodyMatch![1]).toContain('<VercelAnalytics />');
  });

  it('renders <SpeedInsights /> inside <body> for both route groups', () => {
    expect(bodyMatch).not.toBeNull();
    expect(bodyMatch![1]).toContain('<SpeedInsights />');
  });

  it('neither root layout reads request headers (static-rendering contract)', () => {
    for (const layoutPath of [
      resolvePath(__dirname, '..', 'layout.tsx'),
      resolvePath(__dirname, '..', '..', '(landing)', 'layout.tsx'),
    ]) {
      const source = readFileSync(layoutPath, 'utf-8');
      expect(source).not.toMatch(/next\/headers/);
      expect(source).not.toMatch(/headers\(\)/);
    }
    expect(documentSource).not.toMatch(/next\/headers/);
  });
});
