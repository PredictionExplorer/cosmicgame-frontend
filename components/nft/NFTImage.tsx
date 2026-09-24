'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import {
  ArtImage,
  PendingPlate,
  SIGNATURE_ART_CLASS,
  useArtSourceChain,
  type ArtRendition,
} from '@/components/ui/art-frame';

export interface NFTImageProps {
  src?: string;
  /**
   * Optional next source to try if `src` fails to load (e.g. the full-resolution
   * image when a thumbnail has not been generated yet). On failure the chain is
   * `src → fallbackSrc → terminalFallbackSrc → unavailable state`.
   */
  fallbackSrc?: string;
  /**
   * A last image to try after every real source failed. Defaults to `null`:
   * the designed unavailable state, so a missing render never looks like a
   * real artwork. Pass an image only for non-Signature media that has an
   * honest placeholder of its own.
   */
  terminalFallbackSrc?: string | null;
  alt?: string;
  style?: CSSProperties;
  className?: string;
  /** Above-the-fold images: load eagerly at high fetch priority. */
  priority?: boolean;
  /** Override loading behavior. Defaults to 'lazy' for below-the-fold. */
  loading?: 'lazy' | 'eager';
  /**
   * Responsive size hint for the image optimizer so it can pick the right
   * source from the srcset. Defaults to a reasonable home/gallery value.
   */
  sizes?: string;
  /**
   * Localized text for the all-sources-failed state. Surfaces outside the
   * dApp host (the landing) MUST pass this: the default comes from the
   * `detail` message namespace, which the landing never loads, so the raw
   * key would leak into the UI there.
   */
  unavailableLabel?: string;
  /** A second caption line on the unavailable state, e.g. the token number. */
  unavailableDetail?: ReactNode;
  /**
   * `signature`: a Cosmic Signature on its black plate at the native
   * 3456:2234 ratio with object-fit: contain (SIGNATURE_ART_CLASS).
   * `media` (default): the 16:9 box used by RandomWalk and third-party NFTs.
   */
  frame?: 'media' | 'signature';
  /**
   * Published renditions of `src`, e.g. the 640px thumbnail and the 3456px
   * web image, so the browser picks by `sizes`. When set they replace `src`
   * as the first step of the chain.
   */
  renditions?: readonly ArtRendition[];
  /** `compact` draws the unavailable state as the mark alone, for small thumbnails. */
  density?: 'full' | 'compact';
}

/**
 * NFTImage — an NFT image with a fallback chain that ends in the designed
 * unavailable state (never stock artwork). New Signature surfaces should use
 * `ArtFrame` (components/ui/art-frame), which adds the plate and its edge;
 * `frame="signature"` gives existing call sites the same native-ratio plate.
 */
const NFTImage = ({
  src,
  fallbackSrc,
  terminalFallbackSrc = null,
  // English default keeps server-safety for any future server-tree usage;
  // translated call sites pass a localized alt (e.g. detail.image.alt).
  alt = 'NFT',
  style,
  className,
  priority = false,
  loading,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 800px',
  unavailableLabel,
  unavailableDetail,
  frame = 'media',
  renditions,
  density = 'full',
}: NFTImageProps) => {
  const t = useTranslations('detail');
  const chain = useArtSourceChain([
    renditions && renditions.length > 0 ? renditions : src,
    fallbackSrc,
    terminalFallbackSrc,
  ]);
  const signature = frame === 'signature';

  if (chain.source === null) {
    return (
      <PendingPlate
        label={unavailableLabel ?? t('image.artworkUnavailable')}
        detail={unavailableDetail}
        alt={alt}
        density={density}
        variant={signature ? 'signature' : 'media'}
        className={cn('w-full', className)}
        style={style}
      />
    );
  }

  return (
    <ArtImage
      source={chain.source}
      alt={alt}
      sizes={sizes}
      priority={priority}
      loading={loading}
      onError={chain.onError}
      onLoad={chain.onLoad}
      className={cn(
        'w-full object-contain align-middle',
        // tailwind-merge does not know the `aspect-art` theme value, so the
        // two ratios must never both reach the class list.
        signature ? SIGNATURE_ART_CLASS : 'aspect-video',
        className,
      )}
      style={style}
    />
  );
};

export default NFTImage;
