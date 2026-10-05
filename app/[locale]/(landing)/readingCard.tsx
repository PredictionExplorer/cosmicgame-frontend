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

import type { ReadingCard, ReadingCardCopy } from './readingCardCopy';

/**
 * Share cards for the landing's reading pages (a Learn guide, the white
 * paper, the quiz, About): the page's own Signature on its plate beside the
 * page's title, so each page unfurls as itself. The bundled preview is read
 * from disk (no network) and scaled to the plate.
 *
 * The card faces are subsets cut from every string these cards draw
 * (./readingCardCopy.ts feeds `npm run og:fonts`), and
 * lib/og/__tests__/og-localization.test.ts fails when a subset misses one,
 * so each card draws its own copy and its alt text (`ReadingCard.alt`, read
 * without loading any font, as the page's metadata must) describes it. The
 * coverage check below is only a last runtime guard: should a title ever
 * carry a character the faces lack, the card draws the brand line (still
 * beside the page's own Signature) rather than a missing glyph.
 */

async function plateDataUri(publicPath: string): Promise<string | null> {
  try {
    const source = await readFile(join(process.cwd(), 'public', publicPath));
    const png = await sharp(source).resize({ width: PLATE_WIDTH }).png().toBuffer();
    return `data:image/png;base64,${png.toString('base64')}`;
  } catch {
    return null;
  }
}

/** The code points a locale's card faces map, parsed once per locale. */
const coveredByLocale = new Map<string, Promise<Set<number>>>();

function coveredCodePoints(locale: string): Promise<Set<number>> {
  let covered = coveredByLocale.get(locale);
  if (!covered) {
    covered = getOgFontConfig(locale).then((fonts) => {
      const points = new Set<number>();
      for (const font of fonts) {
        for (const codePoint of fontCodePoints(new Uint8Array(font.data))) points.add(codePoint);
      }
      return points;
    });
    coveredByLocale.set(locale, covered);
  }
  return covered;
}

/** Whether the locale's card faces can draw every character of these strings. */
async function facesCover(locale: string, texts: readonly string[]): Promise<boolean> {
  const covered = await coveredCodePoints(locale);
  return texts.every((text) =>
    Array.from(text).every(
      (character) => /\s/u.test(character) || covered.has(character.codePointAt(0)!),
    ),
  );
}

/** The brand card's copy has no eyebrow in some locales. */
type DrawnCopy = Omit<ReadingCardCopy, 'eyebrow'> & { eyebrow?: string };

/** The copy the card draws: the page's own, or the brand line's should a glyph be missing. */
async function drawnCopy(locale: string, card: ReadingCard): Promise<DrawnCopy> {
  const { copy } = card;
  const eyebrow = getOgTypography(locale).cjk ? copy.eyebrow : ogUppercase(copy.eyebrow, locale);
  if (await facesCover(locale, [copy.title, eyebrow, copy.subhead ?? '', copy.fact ?? ''])) {
    return copy;
  }
  const brand = getOgCopy(locale, 'default');
  return { eyebrow: brand.eyebrow, title: brand.title, subhead: brand.subhead, fact: brand.fact };
}

export async function readingShareCard(locale: string, card: ReadingCard): Promise<ImageResponse> {
  const plate = signaturePlate(card.plate);
  const src = plate ? await plateDataUri(plate.src) : null;
  const label = plate
    ? fillOgTemplate(getOgCatalog(locale).shared.plateCaption, {
        name: fillOgTemplate(getOgCopy(locale, 'token').title, { number: formatId(plate.tokenId) }),
        cycle: formatOgCycle(locale, plate.cycle),
      })
    : undefined;
  const copy = await drawnCopy(locale, card);

  return createCosmicOgImage(locale, {
    eyebrow: copy.eyebrow,
    title: copy.title,
    subhead: copy.subhead,
    fact: copy.fact,
    domain: OG_DOMAINS.landing,
    art: src ? [{ src, label }] : [],
  });
}
