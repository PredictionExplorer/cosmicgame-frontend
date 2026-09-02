#!/usr/bin/env tsx
/**
 * Regenerates the checked-in weight-700 CJK subsets that the Open Graph image
 * generators embed (lib/og/fonts.ts) — one per Chinese locale, cut from the
 * Noto Sans family whose glyph forms match that locale's regional standard.
 *
 *   npm run og:fonts              # every CJK locale
 *   npm run og:fonts -- zh-HK     # one locale
 *
 * Glyph set per locale: every character of its OG copy
 * (`messages/<locale>/seo.json` → `og.*`), printable ASCII for dynamic values
 * (counts, `#42`, addresses, the footer domain), and the CJK punctuation the
 * card may emit. Sources are the variable TTFs of the google/fonts repository
 * at a pinned commit, instanced at wght=700 and subset with harfbuzz
 * (subset-font), so a rebuild is reproducible. Rerun after changing any
 * Chinese `seo.json` og copy; lib/og/__tests__/og-localization.test.ts fails
 * when a subset no longer covers its copy.
 */

/* eslint-disable no-console -- CLI output; runs via npm scripts, never ships to the browser. */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import subsetFont from 'subset-font';

import { getOgTypography } from '../lib/og/fonts';
import { routing, type AppLocale } from '../i18n/routing';

import { uncoveredCharacters } from './font-cmap';

const ROOT = resolve(process.cwd());
const GOOGLE_FONTS_COMMIT = 'f6b2b7e8545e086ad3f821af21895d732b6485cf';
const CACHE_DIR = join(ROOT, 'node_modules', '.cache', 'og-fonts', GOOGLE_FONTS_COMMIT);
const OUTPUT_DIR = join(ROOT, 'assets', 'fonts');

interface FontSource {
  /** Path inside the google/fonts repository. */
  readonly path: string;
  /** Output file name under assets/fonts (must match lib/og/fonts.ts). */
  readonly output: string;
}

const SOURCES: Readonly<Partial<Record<AppLocale, FontSource>>> = {
  zh: { path: 'ofl/notosanssc/NotoSansSC[wght].ttf', output: 'NotoSansSC-700.subset.ttf' },
  'zh-TW': { path: 'ofl/notosanstc/NotoSansTC[wght].ttf', output: 'NotoSansTC-700.subset.ttf' },
  'zh-HK': { path: 'ofl/notosanshk/NotoSansHK[wght].ttf', output: 'NotoSansHK-700.subset.ttf' },
};

/** Punctuation the card layout may render around the copy, in either script. */
const CJK_PUNCTUATION = '，。、：；！？「」『』（）《》〈〉【】—…·／％－～　';

const PRINTABLE_ASCII = Array.from({ length: 0x7f - 0x20 }, (_, index) =>
  String.fromCharCode(0x20 + index),
).join('');

function collectStrings(value: unknown, out: string[]): void {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
  else if (value && typeof value === 'object') {
    Object.values(value as Record<string, unknown>).forEach((item) => collectStrings(item, out));
  }
}

/** Every distinct character the locale's OG images can render. */
export function ogGlyphText(locale: AppLocale): string {
  const seo = JSON.parse(readFileSync(join(ROOT, 'messages', locale, 'seo.json'), 'utf8')) as {
    og: unknown;
  };
  const strings: string[] = [];
  collectStrings(seo.og, strings);
  return Array.from(new Set([...strings.join(''), ...PRINTABLE_ASCII, ...CJK_PUNCTUATION])).join(
    '',
  );
}

async function fetchSource(source: FontSource): Promise<Buffer> {
  const cached = join(CACHE_DIR, source.output.replace('-700.subset.ttf', '[wght].ttf'));
  if (existsSync(cached)) return readFileSync(cached);
  const url = `https://raw.githubusercontent.com/google/fonts/${GOOGLE_FONTS_COMMIT}/${encodeURI(source.path)}`;
  console.log(`fetch ${url}`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  mkdirSync(CACHE_DIR, { recursive: true });
  writeFileSync(cached, buffer);
  return buffer;
}

async function build(locale: AppLocale): Promise<void> {
  const source = SOURCES[locale];
  if (!source) {
    throw new Error(
      `${locale} embeds a CJK OG font (lib/og/fonts.ts) but has no source in scripts/build-og-fonts.ts`,
    );
  }
  const text = ogGlyphText(locale);
  const subset = await subsetFont(await fetchSource(source), text, {
    targetFormat: 'sfnt',
    variationAxes: { wght: 700 },
    // The subset is only ever rasterized by satori at display sizes.
    noHinting: true,
  });
  const missing = uncoveredCharacters(subset, text);
  if (missing.length > 0) {
    throw new Error(`${source.output} lacks glyphs for: ${missing.join(' ')}`);
  }
  const target = join(OUTPUT_DIR, source.output);
  writeFileSync(target, subset);
  console.log(
    `write assets/fonts/${source.output}  ${subset.byteLength.toLocaleString('en-US')} bytes, ${
      Array.from(text).length
    } code points`,
  );
}

async function main(): Promise<void> {
  const requested = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
  const cjkLocales = routing.locales.filter((locale) => getOgTypography(locale).cjk);
  const locales = requested.length > 0 ? requested : cjkLocales;
  for (const locale of locales) {
    if (!(cjkLocales as readonly string[]).includes(locale)) {
      throw new Error(`${locale} is not a CJK locale; candidates: ${cjkLocales.join(', ')}`);
    }
    await build(locale as AppLocale);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
