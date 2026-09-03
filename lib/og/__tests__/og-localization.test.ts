import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { uncoveredCharacters } from '@/scripts/font-cmap';
import { SCRIPT_PATTERNS } from '@/test-utils/locale-expectations';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { routing, TRANSLATED_LOCALES } from '@/i18n/routing';
import {
  OG_ROUTES,
  formatOgEyebrow,
  getOgCopy,
  getOgImageMetadata,
  resolveOgLocale,
} from '@/lib/og/copy';
import { OG_TYPOGRAPHY, getOgFontConfig, getOgTypography } from '@/lib/og/fonts';

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

const CHINESE_LOCALES = ['zh', 'zh-TW', 'zh-HK'] as const;

/** Locales whose OG images embed a checked-in subset. */
const FONT_LOCALES = routing.locales.filter((locale) => OG_TYPOGRAPHY[locale].font !== null);

describe('localized Open Graph images', () => {
  it.each(
    TRANSLATED_LOCALES.flatMap((locale) => OG_ROUTES.map((route) => [locale, route] as const)),
  )('%s %s has visual copy and alt text in its own script', (locale, route) => {
    const script = SCRIPT_PATTERNS[locale];
    const copy = getOgCopy(locale, route);
    expect(`${copy.alt}${copy.eyebrow}${copy.title}${copy.subhead}`).toMatch(script);
    expect(getOgImageMetadata(locale, route)[0]).toEqual(
      expect.objectContaining({
        alt: expect.stringMatching(script),
        contentType: 'image/png',
        size: { width: 1200, height: 630 },
      }),
    );
    // The locale's Intl tag (`uk-UA`, `zh-TW`) resolves to the same copy.
    expect(getOgImageMetadata(getLocaleConfig(locale).intlLocale, route)[0]?.alt).toMatch(script);
  });

  it('gives each Chinese variant its own copy, not a shared catalog', () => {
    // Traditional variants must not fall back to the Simplified catalog, and
    // Taiwan and Hong Kong copy differ in vocabulary, not only in characters.
    expect(getOgCopy('zh-TW', 'default').title).not.toBe(getOgCopy('zh', 'default').title);
    expect(getOgCopy('zh-HK', 'default').title).not.toBe(getOgCopy('zh', 'default').title);
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
    expect(formatOgEyebrow(getOgCopy('zh-TW', 'allocation'), 7)).toBe('週期 #7');
    expect(formatOgEyebrow(getOgCopy('zh-HK', 'allocation'), 7)).toBe('週期 #7');
    expect(resolveOgLocale('zh')).toBe('zh');
    expect(resolveOgLocale('zh-Hant')).toBe('zh-TW');
    expect(resolveOgLocale('zh-MO')).toBe('zh-HK');
    expect(resolveOgLocale('not-a-locale')).toBe('en');
  });

  it.each(FONT_LOCALES)('%s checks in a compact TTF subset with its OFL license', (locale) => {
    const spec = OG_TYPOGRAPHY[locale].font!;
    const font = readFileSync(fileURLToPath(spec.file));
    const license = readFileSync(fileURLToPath(spec.license), 'utf8');
    expect(font.byteLength).toBeGreaterThan(20_000);
    expect(font.byteLength).toBeLessThan(250_000);
    expect(font.subarray(0, 4)).toEqual(Buffer.from([0x00, 0x01, 0x00, 0x00]));
    expect(license).toContain('SIL OPEN FONT LICENSE Version 1.1');
  });

  it.each(FONT_LOCALES)(
    'ships a %s subset that covers every character of its OG copy (npm run og:fonts)',
    async (locale) => {
      const [font] = await getOgFontConfig(locale);
      const copy = OG_ROUTES.flatMap((route) => {
        const routeCopy = getOgCopy(locale, route);
        return [
          routeCopy.alt,
          routeCopy.eyebrow,
          routeCopy.title,
          routeCopy.subhead,
          ...routeCopy.chips,
        ];
      }).join('');
      // Dynamic values are digits, `#`, addresses and the footer domain.
      const dynamic = '#0123456789 0xabcdefABCDEF cosmicsignature.com';
      expect(uncoveredCharacters(new Uint8Array(font!.data), `${copy}${dynamic}`)).toEqual([]);
    },
  );

  it('embeds the regional Noto Sans cut for each Chinese locale', async () => {
    const names = { zh: 'Noto Sans SC', 'zh-TW': 'Noto Sans TC', 'zh-HK': 'Noto Sans HK' };
    for (const locale of CHINESE_LOCALES) {
      const [font] = await getOgFontConfig(locale);
      expect(font?.name).toBe(names[locale]);
      expect(getOgTypography(locale).cjk).toBe(true);
    }
    // Every CJK locale in routing has a font; nothing falls through to Latin defaults.
    for (const locale of routing.locales) {
      if (getOgTypography(locale).cjk) expect(getOgTypography(locale).font).not.toBeNull();
    }
  });

  it('embeds a script-specific font only where next/og defaults cannot render the copy', async () => {
    await expect(getOgFontConfig('en')).resolves.toEqual([]);

    const [cjk] = await getOgFontConfig('zh');
    expect(cjk).toEqual(
      expect.objectContaining({
        name: OG_TYPOGRAPHY.zh.font!.name,
        data: expect.anything(),
        weight: 700,
        style: 'normal',
      }),
    );
    expect(cjk!.data.byteLength).toBeGreaterThan(20_000);
    expect(getOgTypography('zh').cjk).toBe(true);

    const [cyrillic] = await getOgFontConfig('uk');
    expect(cyrillic).toEqual(
      expect.objectContaining({ name: OG_TYPOGRAPHY.uk.font!.name, weight: 700, style: 'normal' }),
    );
    expect(cyrillic!.data.byteLength).toBeGreaterThan(20_000);
    // Cyrillic is alphabetic: Latin layout metrics (uppercase eyebrows, tracking) apply.
    expect(getOgTypography('uk').cjk).toBe(false);
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
