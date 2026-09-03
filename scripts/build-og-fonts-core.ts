/**
 * Source registry and glyph sets for the Open Graph font subsets that
 * `npm run og:fonts` (scripts/build-og-fonts.ts) cuts and lib/og/fonts.ts
 * embeds. Kept apart from the CLI so the unit suite can assert that the two
 * registries agree without running a build.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { OG_TYPOGRAPHY, type OgFontSpec } from '../lib/og/fonts';
import { TRANSLATED_LOCALES, type AppLocale, type TranslatedLocale } from '../i18n/routing';

/** The variable TTFs of the google/fonts repository are pinned to one commit for reproducible builds. */
export const GOOGLE_FONTS_COMMIT = 'f6b2b7e8545e086ad3f821af21895d732b6485cf';

export interface FontSource {
  /** Path of the variable TTF inside the google/fonts repository. */
  readonly path: string;
}

/**
 * Where each locale's OG face comes from; `null` when the locale renders with
 * next/og's built-in Latin fonts. Typed against the translated locales so a
 * locale whose `OG_TYPOGRAPHY` entry embeds a font cannot register without
 * naming its source here (`sourceRegistryProblems` checks the converse too).
 * The output file name is the one `OG_TYPOGRAPHY` embeds.
 */
export const OG_FONT_SOURCES: Readonly<Record<TranslatedLocale, FontSource | null>> = {
  zh: { path: 'ofl/notosanssc/NotoSansSC[wght].ttf' },
  'zh-TW': { path: 'ofl/notosanstc/NotoSansTC[wght].ttf' },
  'zh-HK': { path: 'ofl/notosanshk/NotoSansHK[wght].ttf' },
  uk: { path: 'ofl/onest/Onest[wght].ttf' },
};

/** Punctuation the card layout may render around CJK copy. */
const CJK_PUNCTUATION = '，。、：；！？「」『』（）《》〈〉【】—…·／％－～　';
/** Typographic punctuation any locale's copy may carry (quotes, dashes, ellipsis). */
const TYPOGRAPHIC_PUNCTUATION = '“”‘’«»—–…·';

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

/**
 * Every distinct character the locale's OG images can render: its `seo.json`
 * og copy, printable ASCII for dynamic values (counts, `#42`, addresses, the
 * footer domain), and the punctuation the card may emit.
 */
export function ogGlyphText(root: string, locale: AppLocale): string {
  const seo = JSON.parse(readFileSync(join(root, 'messages', locale, 'seo.json'), 'utf8')) as {
    og: unknown;
  };
  const strings: string[] = [];
  collectStrings(seo.og, strings);
  const punctuation = OG_TYPOGRAPHY[locale].cjk
    ? `${CJK_PUNCTUATION}${TYPOGRAPHIC_PUNCTUATION}`
    : TYPOGRAPHIC_PUNCTUATION;
  return Array.from(new Set([...strings.join(''), ...PRINTABLE_ASCII, ...punctuation])).join('');
}

/** Locales whose OG typography embeds a font, with the spec to write. */
export function ogFontLocales(): ReadonlyArray<{ locale: TranslatedLocale; font: OgFontSpec }> {
  return TRANSLATED_LOCALES.flatMap((locale) => {
    const { font } = OG_TYPOGRAPHY[locale];
    return font ? [{ locale, font }] : [];
  });
}

/** Both registries must agree on which locales embed a font. */
export function sourceRegistryProblems(): string[] {
  const problems: string[] = [];
  for (const locale of TRANSLATED_LOCALES) {
    const embeds = OG_TYPOGRAPHY[locale].font !== null;
    const sourced = OG_FONT_SOURCES[locale] !== null;
    if (embeds && !sourced) {
      problems.push(
        `${locale} embeds an OG font (lib/og/fonts.ts) but has no source in OG_FONT_SOURCES (scripts/build-og-fonts-core.ts)`,
      );
    }
    if (sourced && !embeds) {
      problems.push(
        `${locale} has a font source in OG_FONT_SOURCES but renders with next/og defaults (lib/og/fonts.ts)`,
      );
    }
  }
  return problems;
}
