import { readFile } from 'node:fs/promises';

import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

/**
 * Checked-in weight-700 subsets for the scripts next/og's built-in Latin
 * fonts cannot render (tofu for CJK, no guaranteed Cyrillic coverage). Every
 * subset is cut by `npm run og:fonts` (scripts/build-og-fonts.ts) from the copy
 * in `messages/<locale>/seo.json`, so a locale's entry here and its source row
 * there travel together; lib/og/__tests__/og-localization.test.ts fails when a
 * subset no longer covers its copy. Licenses: THIRD_PARTY_NOTICES.md.
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
    // Same face as the on-page Ukrainian display headings (lib/fonts.ts).
    // Cyrillic is alphabetic, so the Latin layout metrics (uppercase
    // eyebrows, tracking) apply.
    font: ogFont('Onest', 'Onest-700.subset.ttf', 'OFL-Onest.txt'),
    cjk: false,
  },
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
