import { getRWLKImageUrl } from '@/utils';

import { cn } from '@/lib/utils';

import NFTImage from './NFTImage';

export interface RandomWalkPlateProps {
  tokenId: number;
  /** The image's alt text, which also names the link ("RandomWalk NFT #004242"). */
  alt: string;
  /** Responsive size hint for the thumbnail. */
  sizes?: string;
  className?: string;
}

/**
 * A RandomWalk NFT on the black art ground at its own 16:9 ratio, linking to
 * its page on randomwalknft.com. Nothing is drawn over the image: the token
 * number and any state belong in the caption the caller sets below the plate.
 * The thumbnail URL follows from the id alone, so the plate needs no read.
 */
export function RandomWalkPlate({
  tokenId,
  alt,
  sizes = '(max-width: 640px) 50vw, 240px',
  className,
}: RandomWalkPlateProps) {
  const file = String(tokenId).padStart(6, '0');
  return (
    <a
      href={`https://www.randomwalknft.com/detail/${tokenId}`}
      className={cn(
        // The plate's 1px edge sits above the image (an inset shadow would
        // paint under it) and strengthens on hover, as on every art plate.
        'relative block overflow-hidden rounded-edge bg-art-ground',
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:content-['']",
        'after:shadow-[var(--art-edge)] after:transition-shadow after:duration-fast hover:after:shadow-[var(--art-edge-active)]',
        className,
      )}
    >
      <NFTImage
        src={getRWLKImageUrl(file, 'black_thumb.jpg')}
        fallbackSrc={getRWLKImageUrl(file, 'black.png')}
        alt={alt}
        sizes={sizes}
        density="compact"
      />
    </a>
  );
}
