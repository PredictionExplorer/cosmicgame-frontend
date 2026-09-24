import { getAssetsUrl, getThumbUrl, getWebImageUrl } from '@/utils';

import { ART_WIDTH, type ArtRendition, type ArtSource } from '@/components/ui/art-frame';

/*
 * A Signature's published media, derived from its seed alone. A leaf module
 * with no hooks and no catalogs, so a page that only shows the art (the home,
 * How it works, the anchoring plates) does not pull the traits catalog in with
 * the alt-text hook; `signatureArt` re-exports it beside the alt-text helpers.
 */

/** Pixel width of the published `thumb_card.webp` thumbnail. */
export const SIGNATURE_THUMB_WIDTH = 640;

/**
 * How long after imprinting a missing render reads as "Rendering" rather than
 * "Artwork unavailable": the renderer publishes the files some time after
 * the imprint transaction.
 */
export const RENDER_WINDOW_SECONDS = 60 * 60;

/**
 * True while a token is young enough that its artwork may still be rendering.
 * `nowMs` is 0 before the page knows the time (server render), which reads
 * as not recent.
 */
export function isRenderPending(imprintedAt: number | null | undefined, nowMs: number): boolean {
  if (!imprintedAt || nowMs <= 0) return false;
  const age = nowMs / 1000 - imprintedAt;
  return age >= 0 && age < RENDER_WINDOW_SECONDS;
}

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
