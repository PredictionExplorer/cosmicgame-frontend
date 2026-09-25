/**
 * Source registry and glyph sets for the share-card font subsets that
 * `npm run og:fonts` (scripts/build-og-fonts.ts) cuts and lib/og/fonts.ts
 * embeds. Kept apart from the CLI so the unit suite can check the registries
 * and the coverage of every locale's copy without running a build.
 */

import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { readingCardTexts } from '../app/[locale]/(landing)/readingCardCopy';
import { getLocaleConfig } from '../i18n/localeConfig';
import { routing, type AppLocale } from '../i18n/routing';
import { OG_TYPOGRAPHY, ogFontFiles, type OgFontFile } from '../lib/og/fonts';
import { OG_DOMAINS } from '../lib/og/hosts';

/** The variable TTFs of the google/fonts repository are pinned to one commit for reproducible builds. */
export const GOOGLE_FONTS_COMMIT = 'f6b2b7e8545e086ad3f821af21895d732b6485cf';

export interface FontSource {
  /** Path of the variable TTF inside the google/fonts repository. */
  readonly path: string;
}

export interface SubsetSource extends FontSource {
  /** Variation-axis values the subset is instanced at (satori draws static faces only). */
  readonly axes: Readonly<Record<string, number>>;
  /** Fixed glyph set, for faces that only ever draw numbers and addresses. */
  readonly glyphs?: string;
}

/** Token numbers (`#000047`) and checksummed, shortened addresses (`0xA169…63B6`). */
const MONO_GLYPHS = '0123456789abcdefABCDEFx#….· ';

const noto = (cut: string, weight: number): SubsetSource => ({
  path: `ofl/notosans${cut.toLowerCase()}/NotoSans${cut}[wght].ttf`,
  axes: { wght: weight },
});

/**
 * Every checked-in subset, by file name in assets/fonts. Inter is instanced
 * at the optical size of the text it sets (28–32px), as a browser with the
 * full variable font would.
 */
export const OG_SUBSET_SOURCES: Readonly<Record<string, SubsetSource>> = {
  'Inter-400.subset.ttf': { path: 'ofl/inter/Inter[opsz,wght].ttf', axes: { opsz: 28, wght: 400 } },
  'Inter-500.subset.ttf': { path: 'ofl/inter/Inter[opsz,wght].ttf', axes: { opsz: 28, wght: 500 } },
  'JetBrainsMono-500.subset.ttf': {
    path: 'ofl/jetbrainsmono/JetBrainsMono[wght].ttf',
    axes: { wght: 500 },
    glyphs: MONO_GLYPHS,
  },
  'Onest-500.subset.ttf': { path: 'ofl/onest/Onest[wght].ttf', axes: { wght: 500 } },
  'NotoSansSC-700.subset.ttf': noto('SC', 700),
  'NotoSansSC-400.subset.ttf': noto('SC', 400),
  'NotoSansTC-700.subset.ttf': noto('TC', 700),
  'NotoSansTC-400.subset.ttf': noto('TC', 400),
  'NotoSansHK-700.subset.ttf': noto('HK', 700),
  'NotoSansHK-400.subset.ttf': noto('HK', 400),
  'NotoSansKR-700.subset.ttf': noto('KR', 700),
  'NotoSansKR-400.subset.ttf': noto('KR', 400),
  'NotoSansJP-700.subset.ttf': noto('JP', 700),
  'NotoSansJP-400.subset.ttf': noto('JP', 400),
};

/** Punctuation the card layout may render around CJK copy. */
const CJK_PUNCTUATION = '，。、：；！？「」『』（）《》〈〉【】—…·・／％－～　';
/** Typographic punctuation any locale's copy may carry (quotes, dashes, ellipsis). */
const TYPOGRAPHIC_PUNCTUATION = '“”‘’«»—–…·';
/** Hosts printed in the card footer, both of them: the glyph set follows the footer. */
const DOMAINS = Object.values(OG_DOMAINS).join('');

const PRINTABLE_ASCII = Array.from({ length: 0x7f - 0x20 }, (_, index) =>
  String.fromCharCode(0x20 + index),
).join('');

function collectStrings(value: unknown, out: string[], key = ''): void {
  // Alt text is read by screen readers and crawlers, never drawn.
  if (key.startsWith('alt')) return;
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, out));
  else if (value && typeof value === 'object') {
    for (const [childKey, child] of Object.entries(value as Record<string, unknown>)) {
      collectStrings(child, out, childKey);
    }
  }
}

/**
 * Every distinct character a locale's cards can draw: its `seo.json` og copy
 * (without alt text), the reading pages' cards (a Learn guide, the white
 * paper, the quiz, About: app/[locale]/(landing)/readingCardCopy.ts), the
 * uppercase eyebrows of cased scripts — cased with the same
 * `toLocaleUpperCase` the card applies, so no capital is missing from the
 * face that sets the word — printable ASCII for dynamic values, the footer
 * host, and the punctuation the card may emit.
 */
export function ogRenderedText(root: string, locale: AppLocale): string {
  const seo = JSON.parse(readFileSync(join(root, 'messages', locale, 'seo.json'), 'utf8')) as {
    og: unknown;
  };
  const strings: string[] = [];
  collectStrings(seo.og, strings);
  strings.push(...readingCardTexts(locale));
  const { cjk } = OG_TYPOGRAPHY[locale];
  const intl = getLocaleConfig(locale).intlLocale;
  const cased = cjk ? [] : strings.map((text) => text.toLocaleUpperCase(intl));
  const punctuation = cjk
    ? `${CJK_PUNCTUATION}${TYPOGRAPHIC_PUNCTUATION}`
    : TYPOGRAPHIC_PUNCTUATION;
  return Array.from(
    new Set([
      ...strings.join(''),
      ...cased.join(''),
      ...PRINTABLE_ASCII,
      ...DOMAINS,
      ...punctuation,
    ]),
  ).join('');
}

const fileName = (font: OgFontFile): string => basename(fileURLToPath(font.file));

/** Locales whose cards embed the subset file. */
export function subsetConsumers(file: string): AppLocale[] {
  return routing.locales.filter((locale) =>
    ogFontFiles(locale).some((font) => font.source === 'subset' && fileName(font) === file),
  );
}

/**
 * The characters to cut `file` with, before restricting them to what its
 * source font covers: a fixed set for the mono face, otherwise the union of
 * the text of every locale that embeds it.
 */
export function subsetGlyphText(root: string, file: string): string {
  const source = OG_SUBSET_SOURCES[file];
  if (!source) throw new Error(`${file} has no entry in OG_SUBSET_SOURCES`);
  if (source.glyphs) return source.glyphs;
  return Array.from(
    new Set(subsetConsumers(file).flatMap((locale) => Array.from(ogRenderedText(root, locale)))),
  ).join('');
}

/** Every subset file the typography registry embeds, by file name. */
export function embeddedSubsetFiles(): string[] {
  return Array.from(
    new Set(
      routing.locales.flatMap((locale) =>
        ogFontFiles(locale)
          .filter((font) => font.source === 'subset')
          .map(fileName),
      ),
    ),
  ).sort();
}

/** Both registries must agree on which subsets exist, and one file is one face. */
export function sourceRegistryProblems(): string[] {
  const problems: string[] = [];
  const embedded = embeddedSubsetFiles();
  for (const file of embedded) {
    if (!OG_SUBSET_SOURCES[file]) {
      problems.push(
        `${file} is embedded (lib/og/fonts.ts) but has no source in OG_SUBSET_SOURCES (scripts/build-og-fonts-core.ts)`,
      );
    }
  }
  for (const file of Object.keys(OG_SUBSET_SOURCES)) {
    if (!embedded.includes(file)) {
      problems.push(`${file} has a source in OG_SUBSET_SOURCES but no locale embeds it`);
    }
  }
  // One file must be one family at one weight in every locale's typography,
  // and its weight must be the one it is instanced at.
  const faces = new Map<string, string>();
  for (const locale of routing.locales) {
    for (const font of ogFontFiles(locale)) {
      const file = fileName(font);
      const face = `${font.family}@${font.weight}`;
      const seen = faces.get(file);
      if (seen && seen !== face) problems.push(`${file} is embedded as both ${seen} and ${face}`);
      faces.set(file, face);
      const axes = OG_SUBSET_SOURCES[file]?.axes;
      if (font.source === 'subset' && axes && axes.wght !== font.weight) {
        problems.push(`${file} is embedded at weight ${font.weight} but cut at wght=${axes.wght}`);
      }
    }
  }
  return problems;
}
