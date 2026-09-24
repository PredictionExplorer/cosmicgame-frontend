import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { ImageResponse } from 'next/og';
import sharp from 'sharp';

import { signaturePlate } from '@/components/reading/signaturePlates';
import { PLATE_WIDTH } from '@/lib/og/CosmicOgCard';
import { fillOgTemplate, formatOgCycle, getOgCatalog, getOgCopy } from '@/lib/og/copy';
import { createCosmicOgImage } from '@/lib/og/createCosmicOgImage';
import { getOgFontConfig, getOgTypography } from '@/lib/og/fonts';
import { OG_DOMAINS } from '@/lib/og/hosts';
import { fontCodePoints } from '@/lib/og/sfnt';
import { ogUppercase } from '@/lib/og/text';
import { formatId } from '@/utils/format/ids';

/**
 * Share cards for the landing's reading pages (a Learn guide, the white
 * paper, the quiz): the page's own Signature on its plate beside the page's
 * title, so each page unfurls as itself. The bundled preview is read from
 * disk (no network) and scaled to the plate. The card faces are subsets cut
 * for the share-card copy, so a title with a character the faces lack falls
 * back to the brand line, still beside the page's own Signature, rather
 * than draw a missing glyph.
 */

export interface ReadingCardCopy {
  eyebrow: string;
  title: string;
  subhead?: string;
  fact?: string;
}

async function plateDataUri(publicPath: string): Promise<string | null> {
  try {
    const source = await readFile(join(process.cwd(), 'public', publicPath));
    const png = await sharp(source).resize({ width: PLATE_WIDTH }).png().toBuffer();
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
}

/** Whether the locale's card faces can draw every character of these strings. */
async function facesCover(locale: string, texts: readonly string[]): Promise<boolean> {
  const fonts = await getOgFontConfig(locale);
  const covered = new Set<number>();
  for (const font of fonts) {
    for (const codePoint of fontCodePoints(new Uint8Array(font.data))) covered.add(codePoint);
  }
  return texts.every((text) =>
    Array.from(text).every(
      (character) => /\s/u.test(character) || covered.has(character.codePointAt(0)!),
    ),
  );
}

export async function readingShareCard(
  locale: string,
  copy: ReadingCardCopy,
  plateTokenId: number,
): Promise<ImageResponse> {
  const plate = signaturePlate(plateTokenId);
  const src = plate ? await plateDataUri(plate.src) : null;
  const label = plate
    ? fillOgTemplate(getOgCatalog(locale).shared.plateCaption, {
        name: fillOgTemplate(getOgCopy(locale, 'token').title, { number: formatId(plate.tokenId) }),
        cycle: formatOgCycle(locale, plate.cycle),
      })
    : undefined;

  const eyebrow = getOgTypography(locale).cjk ? copy.eyebrow : ogUppercase(copy.eyebrow, locale);
  const texts = [copy.title, eyebrow, copy.subhead ?? '', copy.fact ?? ''];
  const brand = getOgCopy(locale, 'default');
  const own = await facesCover(locale, texts);

  return createCosmicOgImage(locale, {
    ...(own
      ? { eyebrow: copy.eyebrow, title: copy.title, subhead: copy.subhead, fact: copy.fact }
      : { eyebrow: brand.eyebrow, title: brand.title, subhead: brand.subhead, fact: brand.fact }),
    domain: OG_DOMAINS.landing,
    art: src ? [{ src, label }] : [],
  });
}
