import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  OG_ROUTES,
  formatOgEyebrow,
  getOgCopy,
  getOgImageMetadata,
  resolveOgLocale,
} from '@/lib/og/copy';
import {
  CJK_OG_FONT_FILE,
  CJK_OG_FONT_LICENSE,
  CJK_OG_FONT_NAME,
  getOgFontConfig,
} from '@/lib/og/fonts';

const generatorPaths = [
  'app/[locale]/(app)/opengraph-image.tsx',
  'app/[locale]/(app)/gallery/opengraph-image.tsx',
  'app/[locale]/(app)/current-cycle/opengraph-image.tsx',
  'app/[locale]/(app)/anchoring/opengraph-image.tsx',
  'app/[locale]/(app)/faq/opengraph-image.tsx',
  'app/[locale]/(app)/how-it-works/opengraph-image.tsx',
  'app/[locale]/(app)/gesture/[id]/opengraph-image.tsx',
  'app/[locale]/(app)/allocation/[id]/opengraph-image.tsx',
  'app/[locale]/(app)/user/[address]/opengraph-image.tsx',
  'app/[locale]/(landing)/landing-site/opengraph-image.tsx',
  'app/[locale]/(landing)/about/opengraph-image.tsx',
  'app/[locale]/(landing)/learn/opengraph-image.tsx',
] as const;

describe('localized Open Graph images', () => {
  it.each(OG_ROUTES)('%s has Chinese visual copy and alt text', (route) => {
    const copy = getOgCopy('zh', route);
    expect(`${copy.alt}${copy.eyebrow}${copy.title}${copy.subhead}`).toMatch(/[\u3400-\u9fff]/);
    expect(getOgImageMetadata('zh', route)[0]).toEqual(
      expect.objectContaining({
        alt: expect.stringMatching(/[\u3400-\u9fff]/),
        contentType: 'image/png',
        size: { width: 1200, height: 630 },
      }),
    );
  });

  it('preserves the established English default and gallery copy', () => {
    expect(getOgCopy('en', 'default')).toEqual(
      expect.objectContaining({
        title: 'Every Gesture Shapes the Signature.',
        subhead: 'A procedural on-chain art protocol on Arbitrum.',
      }),
    );
    expect(getOgCopy('en', 'gallery').title).toBe('Three-body trajectories, rendered on-chain.');
  });

  it('localizes dynamic labels and validates unknown locales to English', () => {
    expect(formatOgEyebrow(getOgCopy('zh', 'gesture'), 42)).toBe('落笔序号 #42');
    expect(formatOgEyebrow(getOgCopy('zh', 'allocation'), 7)).toBe('周期 #7');
    expect(resolveOgLocale('zh')).toBe('zh');
    expect(resolveOgLocale('not-a-locale')).toBe('en');
  });

  it('checks in a compact TTF subset with its OFL license', () => {
    const font = readFileSync(join(process.cwd(), CJK_OG_FONT_FILE));
    const license = readFileSync(join(process.cwd(), CJK_OG_FONT_LICENSE), 'utf8');
    expect(font.byteLength).toBeGreaterThan(20_000);
    expect(font.byteLength).toBeLessThan(250_000);
    expect(font.subarray(0, 4)).toEqual(Buffer.from([0x00, 0x01, 0x00, 0x00]));
    expect(license).toContain('SIL OPEN FONT LICENSE Version 1.1');
  });

  it('embeds Noto Sans SC only for Chinese rendering', async () => {
    await expect(getOgFontConfig('en')).resolves.toEqual([]);
    const [font] = await getOgFontConfig('zh');
    expect(font).toEqual(
      expect.objectContaining({
        name: CJK_OG_FONT_NAME,
        data: expect.anything(),
        weight: 700,
        style: 'normal',
      }),
    );
    expect(font!.data.byteLength).toBeGreaterThan(20_000);
  });

  it('routes all twelve generators through localized metadata and font loading', () => {
    expect(generatorPaths).toHaveLength(12);
    for (const path of generatorPaths) {
      const source = readFileSync(join(process.cwd(), path), 'utf8');
      expect(source).toContain('generateImageMetadata');
      expect(source).toContain('createCosmicOgImage');
      expect(source).toMatch(/params:\s*Promise<\{[^}]*locale:\s*string/);
    }
  });
});
