import { getRWLKImageUrl } from '@/utils';

import { cn } from '@/lib/utils';
import { SiteLink } from '@/components/layout/SiteLink';
import { MEDIA_PLATE_CLASS } from '@/components/ui/art-frame';

import NFTImage from './NFTImage';

/** The token's own page on the Random Walk NFT site. */
export const randomWalkTokenUrl = (tokenId: number) =>
  `https://www.randomwalknft.com/detail/${tokenId}`;

export interface RandomWalkPlateProps {
  tokenId: number;
  /** The image's alt text, which also names the link ("Random Walk NFT #004242"). */
  alt: string;
  /** Responsive size hint for the thumbnail. */
  sizes?: string;
  className?: string;
}

/**
 * A Random Walk NFT on the media plate at its own 16:9 ratio, linking to its
 * page on randomwalknft.com in a new tab (screen readers hear that it opens
 * one). Nothing is drawn over the image: the token number and any state
 * belong in the WallLabel the caller sets below the plate. The thumbnail URL
 * follows from the id alone, so the plate needs no read.
 */
export function RandomWalkPlate({
  tokenId,
  alt,
  sizes = '(max-width: 640px) 50vw, 240px',
  className,
}: RandomWalkPlateProps) {
  const file = String(tokenId).padStart(6, '0');
  return (
    <SiteLink
      kind="external"
      href={randomWalkTokenUrl(tokenId)}
      externalIcon={false}
      className={cn(MEDIA_PLATE_CLASS, className)}
    >
      <NFTImage
        src={getRWLKImageUrl(file, 'black_thumb.jpg')}
        fallbackSrc={getRWLKImageUrl(file, 'black.png')}
        alt={alt}
        sizes={sizes}
        density="compact"
      />
    </SiteLink>
  );
}
