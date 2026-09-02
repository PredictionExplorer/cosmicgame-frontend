import { readFile } from 'node:fs/promises';

import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

export const CJK_OG_FONT_NAME = 'Noto Sans SC';
export const CJK_OG_FONT_FILE = 'assets/fonts/NotoSansSC-700.subset.ttf';
export const CJK_OG_FONT_LICENSE = 'assets/fonts/OFL-NotoSansCJK.txt';

export const CYRILLIC_OG_FONT_NAME = 'Onest';
export const CYRILLIC_OG_FONT_FILE = 'assets/fonts/Onest-700.subset.ttf';
export const CYRILLIC_OG_FONT_LICENSE = 'assets/fonts/OFL-Onest.txt';

interface OgFontSpec {
  readonly name: string;
  readonly file: URL;
  readonly weight: 700;
}

export interface OgTypography {
  /**
   * Extra font loaded into `ImageResponse`. `null` means the locale renders
   * fine with next/og's built-in Latin fonts. Every other script needs an
   * explicit subset buffer — the built-in fonts render tofu for CJK and are
   * not guaranteed Cyrillic coverage either.
   */
  readonly font: OgFontSpec | null;
  /** Apply CJK layout metrics (line height, spacing) in CosmicOgCard. */
  readonly cjk: boolean;
}

const OG_TYPOGRAPHY: LocaleRecord<OgTypography> = {
  en: { font: null, cjk: false },
  zh: {
    font: {
      name: CJK_OG_FONT_NAME,
      file: new URL('../../assets/fonts/NotoSansSC-700.subset.ttf', import.meta.url),
      weight: 700,
    },
    cjk: true,
  },
  uk: {
    // Same face as the on-page Ukrainian display headings (lib/fonts.ts).
    font: {
      name: CYRILLIC_OG_FONT_NAME,
      file: new URL('../../assets/fonts/Onest-700.subset.ttf', import.meta.url),
      weight: 700,
    },
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
