import { readFile } from 'node:fs/promises';

import { resolveOgLocale } from './copy';

export const CJK_OG_FONT_NAME = 'Noto Sans SC';
export const CJK_OG_FONT_FILE = 'assets/fonts/NotoSansSC-700.subset.ttf';
export const CJK_OG_FONT_LICENSE = 'assets/fonts/OFL-NotoSansCJK.txt';

let cjkFontData: Promise<ArrayBuffer> | undefined;

function loadCjkFont(): Promise<ArrayBuffer> {
  cjkFontData ??= readFile(
    new URL('../../assets/fonts/NotoSansSC-700.subset.ttf', import.meta.url),
  ).then(
    (buffer) =>
      buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer,
  );
  return cjkFontData;
}

export async function getOgFontConfig(locale: string | undefined) {
  if (resolveOgLocale(locale) !== 'zh') return [];
  return [
    {
      name: CJK_OG_FONT_NAME,
      data: await loadCjkFont(),
      weight: 700 as const,
      style: 'normal' as const,
    },
  ];
}
