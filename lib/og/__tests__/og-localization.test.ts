import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  OG_SUBSET_SOURCES,
  embeddedSubsetFiles,
  ogRenderedText,
  sourceRegistryProblems,
} from '@/scripts/build-og-fonts-core';
import { ogCoverageProblems, uncoveredBy } from '@/scripts/og-font-coverage';
import { SCRIPT_PATTERNS } from '@/test-utils/locale-expectations';

import { getLocaleConfig } from '@/i18n/localeConfig';
import { routing, TRANSLATED_LOCALES } from '@/i18n/routing';
import {
  OG_ROUTES,
  fillOgTemplate,
  formatOgCycle,
  getOgCatalog,
  getOgCopy,
  resolveOgLocale,
} from '@/lib/og/copy';
import {
  CLASH_DISPLAY_500,
  INTER_400,
  INTER_500,
  OG_SHARED_FONTS,
  OG_TYPOGRAPHY,
  getOgFontConfig,
  getOgTypography,
  ogFontFiles,
} from '@/lib/og/fonts';

const ROOT = process.cwd();

const generatorPaths = [
  'app/[locale]/(app)/opengraph-image.tsx',
  'app/[locale]/(app)/gallery/opengraph-image.tsx',
  'app/[locale]/(app)/current-cycle/opengraph-image.tsx',
  'app/[locale]/(app)/anchoring/opengraph-image.tsx',
  'app/[locale]/(app)/faq/opengraph-image.tsx',
  'app/[locale]/(app)/how-it-works/opengraph-image.tsx',
  'app/[locale]/(app)/detail/[id]/opengraph-image.tsx',
  'app/[locale]/(app)/gesture/[id]/opengraph-image.tsx',
  'app/[locale]/(app)/allocation/[id]/opengraph-image.tsx',
  'app/[locale]/(app)/user/[address]/opengraph-image.tsx',
  'app/[locale]/(landing)/opengraph-image.tsx',
  'app/[locale]/(landing)/landing-site/opengraph-image.tsx',
  'app/[locale]/(landing)/about/opengraph-image.tsx',
  'app/[locale]/(landing)/learn/opengraph-image.tsx',
] as const;

const CHINESE_LOCALES = ['zh', 'zh-TW', 'zh-HK'] as const;

/** Every drawn string of a locale's catalog (alt text is never drawn). */
function drawnStrings(locale: string): string[] {
  const out: string[] = [];
  const walk = (value: unknown, key = '') => {
    if (key.startsWith('alt')) return;
    if (typeof value === 'string') out.push(value);
    else if (value && typeof value === 'object') {
      for (const [child, nested] of Object.entries(value)) walk(nested, child);
    }
  };
  walk(getOgCatalog(locale));
  return out;
}

describe('localized share-card copy', () => {
  it.each(
    TRANSLATED_LOCALES.flatMap((locale) => OG_ROUTES.map((route) => [locale, route] as const)),
  )('%s %s is written in its own script', (locale, route) => {
    const copy = getOgCopy(locale, route);
    expect(`${copy.alt}${copy.eyebrow ?? ''}${copy.title}${copy.subhead}`).toMatch(
      SCRIPT_PATTERNS[locale],
    );
    // The locale's Intl tag (`uk-UA`, `zh-TW`) resolves to the same copy.
    expect(getOgCopy(getLocaleConfig(locale).intlLocale, route)).toBe(copy);
  });

  it('gives each Chinese variant its own copy, not a shared catalog', () => {
    expect(getOgCopy('zh-TW', 'default').title).not.toBe(getOgCopy('zh', 'default').title);
    expect(getOgCopy('zh-HK', 'default').title).not.toBe(getOgCopy('zh', 'default').title);
    // Taiwan and Hong Kong differ in vocabulary, not only in characters.
    expect(getOgCopy('zh-TW', 'anchoring').fact).toContain('錨定配發');
    expect(getOgCopy('zh-HK', 'anchoring').fact).toContain('錨定派發');
  });

  it('keeps the English brand line and says the art is seeded, not rendered, on-chain', () => {
    expect(getOgCopy('en', 'default')).toEqual(
      expect.objectContaining({
        title: 'Every Gesture Shapes the Signature.',
        subhead: 'A procedural on-chain art protocol on Arbitrum.',
      }),
    );
    expect(getOgCopy('en', 'gallery').title).toBe('Three-body trajectories, seeded on-chain.');
    expect(getOgCopy('en', 'token').subhead).toMatch(/seeded on-chain.*open-source renderer/);
  });

  // Share cards are the most amplified copy the protocol has: no unsourced
  // verification claim, no rendering claim the protocol does not make, no
  // payout pitch (AGENTS.md, trust claims stay on /security and /audits).
  it.each(routing.locales)('%s cards make no unsourced or inaccurate claims', (locale) => {
    const drawn = drawnStrings(locale).join('\n');
    expect(drawn).not.toMatch(/verified on-chain|formally verified|audited|rendered on-chain/i);
    expect(drawn).not.toMatch(
      /链上已验证|鏈上已驗證|Верифіковано ончейн|온체인 검증|オンチェーンで検証済み|Đã xác minh trên chuỗi/,
    );
    expect(drawn).not.toMatch(/链上呈现|鏈上呈現|オンチェーンで描く|온체인에서 렌더링/);
    expect(drawn).not.toMatch(/Receive a share each cycle|Per-Cycle ETH|No Lockup/i);
  });

  it('states the public-goods share as the tested marquee does', () => {
    expect(getOgCopy('en', 'default').fact).toContain('7% to Protocol Guild');
  });

  it('fills templates and cycles per locale', () => {
    expect(
      fillOgTemplate(getOgCatalog('en').gesture.titleWithValue!, { position: 1139, cycle: 2 }),
    ).toBe('Gesture #1139 · Cycle #2');
    expect(fillOgTemplate('{a} and {missing}', { a: 1 })).toBe('1 and {missing}');
    expect(formatOgCycle('zh', 7)).toBe('第 7 个周期');
    expect(formatOgCycle('zh-TW', 7)).toBe('第 7 個週期');
    expect(formatOgCycle('ja', 7)).toBe('サイクル7');
    expect(formatOgCycle('uk', 7)).toBe('Цикл 7');
    expect(resolveOgLocale('zh-Hant')).toBe('zh-TW');
    expect(resolveOgLocale('zh-MO')).toBe('zh-HK');
    expect(resolveOgLocale('not-a-locale')).toBe('en');
  });

  it('uses the locale’s own separator in wall labels', () => {
    expect(getOgCatalog('ja').shared.plateCaption).toBe('{name}・{cycle}');
    expect(getOgCatalog('en').shared.plateCaption).toBe('{name} · {cycle}');
  });
});

describe('share-card typography', () => {
  it('sets English titles in Clash Display 500 and body text in Inter, as the site does', () => {
    const en = getOgTypography('en');
    expect(en.display[0]).toBe(CLASH_DISPLAY_500);
    expect(en.displayWeight).toBe(500);
    expect(en.body).toEqual([INTER_400, INTER_500]);
    expect(en.cjk).toBe(false);
  });

  // Clash Display has no Cyrillic and few Vietnamese letters; mixing it with
  // Onest would switch faces inside one word.
  it.each(['uk', 'vi'] as const)('%s titles use Onest alone, body text Inter', (locale) => {
    const { display, body } = getOgTypography(locale);
    expect(display.map((font) => font.family)).toEqual(['Onest']);
    expect(body.map((font) => font.family)).toEqual(['Inter', 'Inter']);
  });

  it('embeds the regional Noto Sans cut for each CJK locale, bold titles over regular text', async () => {
    const names = {
      zh: 'Noto Sans SC',
      'zh-TW': 'Noto Sans TC',
      'zh-HK': 'Noto Sans HK',
      ko: 'Noto Sans KR',
      ja: 'Noto Sans JP',
    } as const;
    for (const [locale, family] of Object.entries(names)) {
      const typography = getOgTypography(locale);
      expect(typography.cjk).toBe(true);
      expect(typography.displayWeight).toBe(700);
      expect(typography.display.find((font) => font.family === family)?.weight).toBe(700);
      expect(typography.body.find((font) => font.family === family)?.weight).toBe(400);
      const config = await getOgFontConfig(locale);
      expect(
        config
          .filter((font) => font.name === family)
          .map((font) => font.weight)
          .sort(),
      ).toEqual([400, 700]);
    }
  });

  // F228: a card is display type read at thumbnail size; a word split across
  // lines (オープ/ンソース) is the first thing the eye catches.
  it('breaks Korean only between words and Japanese only between phrases', () => {
    expect(OG_TYPOGRAPHY.ko).toEqual(
      expect.objectContaining({ titleBreak: 'words', subheadBreak: 'words' }),
    );
    expect(OG_TYPOGRAPHY.ja).toEqual(
      expect.objectContaining({ titleBreak: 'phrases', subheadBreak: 'phrases' }),
    );
    for (const locale of CHINESE_LOCALES) {
      expect(OG_TYPOGRAPHY[locale].titleBreak).toBe('anywhere');
    }
  });

  // Regression: `new URL(\`…/${name}\`, import.meta.url)` made Turbopack resolve
  // every face of a directory to one guessed file (an .eot for Clash Display),
  // and satori rejected it. Each file must be a literal the bundler can trace.
  it('addresses every font file with a literal URL, one file per face', () => {
    const source = readFileSync(join(ROOT, 'lib', 'og', 'fonts.ts'), 'utf8');
    expect(source).not.toMatch(/new URL\(\s*`/);
    for (const locale of routing.locales) {
      const files = ogFontFiles(locale).map((font) => basename(fileURLToPath(font.file)));
      expect(new Set(files).size).toBe(files.length);
      for (const file of files) expect(file).toMatch(/\.ttf$/);
    }
    expect(ogFontFiles('zh')).toHaveLength(7);
  });

  it('loads the wordmark face and the mono face in every locale', () => {
    for (const locale of routing.locales) {
      for (const font of OG_SHARED_FONTS) expect(ogFontFiles(locale)).toContain(font);
    }
  });
});

describe('share-card font files', () => {
  it('keeps the typography and subset registries in agreement', () => {
    expect(sourceRegistryProblems()).toEqual([]);
    expect(Object.keys(OG_SUBSET_SOURCES).sort()).toEqual(embeddedSubsetFiles());
  });

  it.each(
    Array.from(
      new Map(
        routing.locales.flatMap((locale) =>
          ogFontFiles(locale).map((font) => [font.file.href, font]),
        ),
      ).values(),
    ).map((font) => [basename(fileURLToPath(font.file)), font] as const),
  )('%s is a compact TrueType face with its license', (_name, font) => {
    const data = readFileSync(fileURLToPath(font.file));
    expect(data.byteLength).toBeGreaterThan(5_000);
    expect(data.byteLength).toBeLessThan(250_000);
    expect(data.subarray(0, 4)).toEqual(Buffer.from([0x00, 0x01, 0x00, 0x00]));
    if (font.source === 'subset') {
      expect(readFileSync(join(ROOT, font.license!), 'utf8')).toContain(
        'SIL OPEN FONT LICENSE Version 1.1',
      );
    } else {
      // Clash Display ships unmodified from the site's own font directory.
      expect(fileURLToPath(font.file)).toContain(join('public', 'fonts', 'ClashDisplay'));
    }
  });

  // F158: uppercase eyebrows used to draw capitals the subset lacked in a
  // fallback face, switching weight letter by letter in uk and vi.
  it.each(['uk', 'vi'] as const)('%s body faces carry every uppercase eyebrow letter', (locale) => {
    const intl = getLocaleConfig(locale).intlLocale;
    const eyebrows = OG_ROUTES.map((route) => getOgCopy(locale, route).eyebrow ?? '')
      .join('')
      .toLocaleUpperCase(intl);
    expect(eyebrows).toMatch(SCRIPT_PATTERNS[locale]);
    expect(uncoveredBy(getOgTypography(locale).body, eyebrows)).toEqual([]);
  });

  it('draws every character of every locale’s copy with the locale’s own stacks (npm run og:fonts)', () => {
    expect(ogCoverageProblems(ROOT)).toEqual([]);
    // Cased scripts include their uppercase forms in the glyph set.
    expect(ogRenderedText(ROOT, 'uk')).toContain('Є');
    expect(ogRenderedText(ROOT, 'vi')).toContain('Ữ');
  });
});

describe('share-card routes', () => {
  it.each(generatorPaths)(
    '%s renders through the card builders with localized alt text',
    (path) => {
      const source = readFileSync(join(ROOT, path), 'utf8');
      expect(source).toContain('generateImageMetadata');
      expect(source).toContain("from '@/lib/og/cards'");
      expect(source).toContain('ogImageMetadata(');
      expect(source).toMatch(/params:\s*Promise<\{[^}]*locale:\s*string/);
      expect(source).toMatch(/export const size = COSMIC_OG_SIZE/);
    },
  );
});
