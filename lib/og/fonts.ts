import { readFile } from 'node:fs/promises';

import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

/**
 * Checked-in weight-700 subsets for the scripts next/og's built-in Latin
 * fonts cannot render (tofu for CJK, no guaranteed Cyrillic or Vietnamese
 * coverage). Every subset is cut by `npm run og:fonts`
 * (scripts/build-og-fonts.ts) from the copy in `messages/<locale>/seo.json`,
 * so a locale's entry here and its source row there travel together; when
 * several locales share one face (Onest for `uk` and `vi`) they share one
 * file, cut from the union of their copy. lib/og/__tests__/og-localization.test.ts
 * fails when a subset no longer covers its copy. Licenses: THIRD_PARTY_NOTICES.md.
 */
export interface OgFontSpec {
  /** Family name the card's CSS refers to. */
  readonly name: string;
  /** Checked-in subset under assets/fonts. */
  readonly file: URL;
  /** OFL text under assets/fonts. */
  readonly license: URL;
  readonly weight: 700;
}

export interface OgTypography {
  /**
   * Extra font loaded into `ImageResponse`. `null` means the locale renders
   * fine with next/og's built-in Latin fonts. Every other script needs an
   * explicit subset buffer.
   */
  readonly font: OgFontSpec | null;
  /** Apply CJK layout metrics (line height, spacing, no uppercase) in CosmicOgCard. */
  readonly cjk: boolean;
}

const asset = (fileName: string): URL => new URL(`../../assets/fonts/${fileName}`, import.meta.url);

const NOTO_CJK_LICENSE = 'OFL-NotoSansCJK.txt';

const ogFont = (name: string, fileName: string, license: string): OgFontSpec => ({
  name,
  file: asset(fileName),
  license: asset(license),
  weight: 700,
});

/**
 * Same face as the on-page Ukrainian and Vietnamese display headings
 * (lib/fonts.ts). One spec object for both locales: `getOgFontConfig` caches
 * font buffers by family name, so two locales naming one family must point
 * at one file.
 */
const ONEST = ogFont('Onest', 'Onest-700.subset.ttf', 'OFL-Onest.txt');

/**
 * One entry per locale: adding a locale to routing.locales fails to compile
 * here until its OG typography is decided. Each Chinese locale gets the Noto
 * Sans face whose glyph forms match its regional standard (SC / TC / HK).
 */
export const OG_TYPOGRAPHY: LocaleRecord<OgTypography> = {
  en: { font: null, cjk: false },
  zh: { font: ogFont('Noto Sans SC', 'NotoSansSC-700.subset.ttf', NOTO_CJK_LICENSE), cjk: true },
  'zh-TW': {
    font: ogFont('Noto Sans TC', 'NotoSansTC-700.subset.ttf', NOTO_CJK_LICENSE),
    cjk: true,
  },
  'zh-HK': {
    font: ogFont('Noto Sans HK', 'NotoSansHK-700.subset.ttf', NOTO_CJK_LICENSE),
    cjk: true,
  },
  uk: {
    // Cyrillic is alphabetic, so the Latin layout metrics (uppercase
    // eyebrows, tracking) apply.
    font: ONEST,
    cjk: false,
  },
  // Hangul syllable blocks share the CJK square rhythm (Noto Sans KR is the
  // Korean cut of Noto Sans CJK), so the CJK layout metrics apply.
  ko: { font: ogFont('Noto Sans KR', 'NotoSansKR-700.subset.ttf', NOTO_CJK_LICENSE), cjk: true },
  // The Japanese cut: kanji follow the JIS glyph standard, which differs
  // from every Chinese cut, and kana need a Japanese face.
  ja: { font: ogFont('Noto Sans JP', 'NotoSansJP-700.subset.ttf', NOTO_CJK_LICENSE), cjk: true },
  // Vietnamese is a Latin alphabet with stacked diacritics next/og's built-in
  // fonts do not carry; the Latin layout metrics apply.
  vi: { font: ONEST, cjk: false },
};

/** OG typography (font buffer requirement + CJK layout flag) for a locale. */
export function getOgTypography(locale: string | undefined): OgTypography {
  return pickByLocale(OG_TYPOGRAPHY, locale);
}

const fontDataByName = new Map<string, Promise<ArrayBuffer>>();

function loadFont(spec: OgFontSpec): Promise<ArrayBuffer> {
  let data = fontDataByName.get(spec.name);
  if (!data) {
    data = readFile(spec.file).then(
      (buffer) =>
        buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength,
        ) as ArrayBuffer,
    );
    fontDataByName.set(spec.name, data);
  }
  return data;
}

/** `ImageResponse` font config for the locale (empty when defaults suffice). */
export async function getOgFontConfig(locale: string | undefined) {
  const { font } = getOgTypography(locale);
  if (!font) return [];
  return [
    {
      name: font.name,
      data: await loadFont(font),
      weight: font.weight,
      style: 'normal' as const,
    },
  ];
}
