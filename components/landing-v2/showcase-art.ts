import { getAssetsUrl, getThumbUrl, getWebImageUrl } from '@/utils/urls';
import { ART_WIDTH, type ArtSource } from '@/components/ui/art-frame';

import { FEATURED_LANDING_ART } from './featured-art';
import type { LandingShowcaseToken } from './useLandingShowcaseTokens';

/*
 * Landing-safe media helpers. components/nft/signatureArt derives the same
 * files, but it imports the @/utils barrel and the traits catalog, which the
 * marketing host's bundle keeps out (utils/__tests__/format-landing-entry).
 */

/** Pixel width of the published `thumb_card.webp`. */
const THUMB_WIDTH = 640;

/** Pixel width of the bundled previews (public/images/landing/README.md). */
const FEATURED_WIDTH = 960;

/** A Signature the landing can show: bundled, or read from the collection. */
export interface ShowcaseArtwork {
  TokenId: number;
  Seed: string;
  RoundNum?: number;
  TokenName?: string;
  Staked?: boolean;
  /** The bundled preview, for the two featured Signatures. */
  imageSrc?: string;
}

function bareSeed(seed: string | number): string {
  return String(seed).trim().replace(/^0x/i, '');
}

/** The featured Signatures first, then the collection, newest first, without repeats. */
export function showcaseArtworks(
  tokens: readonly LandingShowcaseToken[],
): readonly ShowcaseArtwork[] {
  const featuredIds = new Set<number>(FEATURED_LANDING_ART.map((art) => art.TokenId));
  const live = tokens
    .filter((token) => !featuredIds.has(token.TokenId) && token.Seed !== undefined)
    .map((token) => ({ ...token, Seed: bareSeed(token.Seed!) }));
  const featured = FEATURED_LANDING_ART.map((art) => {
    const record = tokens.find((token) => token.TokenId === art.TokenId);
    return { ...art, TokenName: record?.TokenName, Staked: record?.Staked };
  });
  return [...featured, ...live];
}

/**
 * The artwork's source chain for ArtFrame / useArtSourceChain: the bundled
 * preview for a featured Signature; otherwise the published thumbnail and
 * full web image as one responsive set, then the full web image and the
 * source PNG on their own. Nothing goes through the image optimizer, so a
 * file preloaded with the same srcset and sizes is the file the plate shows.
 */
export function showcaseSources(artwork: ShowcaseArtwork): readonly ArtSource[] {
  if (artwork.imageSrc) return [[{ src: artwork.imageSrc, width: FEATURED_WIDTH }]];
  const seed = bareSeed(artwork.Seed);
  const webImage = getWebImageUrl(seed);
  return [
    [
      { src: getThumbUrl(seed, 'card'), width: THUMB_WIDTH },
      { src: webImage, width: ART_WIDTH },
    ],
    webImage,
    getAssetsUrl(`cosmicsignature/0x${seed}.png`),
  ];
}

/** The 30-second animation of the simulation, 3456 × 2234 H.264. */
export function showcaseAnimation(artwork: ShowcaseArtwork): string {
  return getAssetsUrl(`cosmicsignature/0x${bareSeed(artwork.Seed)}.mp4`);
}

/** A seed shortened for a caption: `5084a873…4dfc33ad`. */
export function shortSeed(seed: string): string {
  const bare = bareSeed(seed);
  return bare.length > 20 ? `${bare.slice(0, 8)}…${bare.slice(-8)}` : bare;
}
