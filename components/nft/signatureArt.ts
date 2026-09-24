import { getAssetsUrl, getThumbUrl, getWebImageUrl } from '@/utils';

import {
  resolveTraitValueLabel,
  toSpectralClass,
  type NftTraitEntry,
  type TraitTranslator,
} from '@/lib/nftMetadata';
import { ART_WIDTH, type ArtRendition, type ArtSource } from '@/components/ui/art-frame';

/** Pixel width of the published `thumb_card.webp` thumbnail. */
export const SIGNATURE_THUMB_WIDTH = 640;

/** Every published file of one Signature, derived from its seed. */
export interface SignatureMedia {
  /** The responsive set: the 640px thumbnail and the full-size web image. */
  renditions: readonly ArtRendition[];
  /** The full-size web image (WebP, the same pixels as the source at a fraction of the bytes). */
  webImage: string;
  /** The source PNG, for tokens rendered before the WebP derivative existed. */
  sourceImage: string;
  /** The 30-second animation of the simulation. */
  video: string;
}

function bareSeed(seed: string | number): string {
  return String(seed).trim().replace(/^0x/i, '');
}

/**
 * The media package of a Signature, or `null` without a seed (the indexer
 * has not published it yet).
 */
export function signatureMedia(seed: string | number | null | undefined): SignatureMedia | null {
  if (seed === null || seed === undefined || bareSeed(seed) === '') return null;
  const hex = bareSeed(seed);
  const webImage = getWebImageUrl(hex);
  return {
    renditions: [
      { src: getThumbUrl(hex, 'card'), width: SIGNATURE_THUMB_WIDTH },
      { src: webImage, width: ART_WIDTH },
    ],
    webImage,
    sourceImage: getAssetsUrl(`cosmicsignature/0x${hex}.png`),
    video: getAssetsUrl(`cosmicsignature/0x${hex}.mp4`),
  };
}

/**
 * The ArtFrame source chain of a Signature: the responsive set, then the
 * full-size web image on its own (when the browser picked a missing
 * thumbnail), then the source PNG.
 */
export function signatureSources(media: SignatureMedia | null): readonly ArtSource[] {
  if (!media) return [];
  return [media.renditions, media.webImage, media.sourceImage];
}

export interface SignatureAltInput {
  /** The formatted token number, e.g. `#000025`. */
  id: string;
  /** The token's name, when it has one. */
  name?: string | null;
  /** The token's traits, when the metadata has been published. */
  entry?: NftTraitEntry | null;
}

/**
 * Alt text composed from a Signature's traits, in the locale of the `traits`
 * translator: `“Twisted Mind”, Cosmic Signature #000025: Orbit Ribbons
 * structure, Solar Mono palette, spectral class G`. Each part appears only
 * when it is known; without traits it is the name and number alone.
 */
export function composeSignatureAlt(t: TraitTranslator, { id, name, entry }: SignatureAltInput) {
  const trimmedName = name?.trim();
  const subject = trimmedName
    ? t('alt.subjectNamed', { name: trimmedName, id })
    : t('quickView.title', { id });
  if (!entry?.structure || !entry.palette) return subject;

  const structure = resolveTraitValueLabel(t, 'structure', entry.structure);
  const palette = resolveTraitValueLabel(t, 'palette', entry.palette);
  const spectralClass = toSpectralClass(entry.spectralClass);
  return spectralClass
    ? t('alt.withTraitsAndClass', { subject, structure, palette, spectralClass })
    : t('alt.withTraits', { subject, structure, palette });
}
