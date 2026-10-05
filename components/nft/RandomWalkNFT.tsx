import { Check } from 'lucide-react';

import { formatId } from '@/utils/format/ids';
import { cn } from '@/lib/utils';
import { useRWLKNFT } from '@/hooks/useRWLKNFT';
import { MEDIA_PLATE_CLASS } from '@/components/ui/art-frame';
import { Skeleton } from '@/components/ui/skeleton';

import NFTImage from './NFTImage';

interface RandomWalkNFTProps {
  tokenId: number | string;
  selected?: boolean;
  /**
   * The image and the number are decorative because a parent control (the
   * picker's toggle button) already names the token.
   */
  decorative?: boolean;
}

/**
 * A Random Walk NFT as the gesture picker offers it: the render whole on its
 * black plate, with nothing drawn over it, and a label row under the plate
 * with the token number and, once chosen, a check. A chosen card also draws
 * the plate's print edge in the accent, so the choice never rests on colour
 * alone.
 */
const RandomWalkNFT = ({ tokenId, selected = false, decorative = false }: RandomWalkNFTProps) => {
  const nft = useRWLKNFT(tokenId);

  return (
    <div className="min-w-0" data-selected={selected || undefined}>
      <div
        className={cn(
          MEDIA_PLATE_CLASS,
          'aspect-art',
          selected &&
            'after:shadow-[inset_0_0_0_2px_var(--color-primary)] hover:after:shadow-[inset_0_0_0_2px_var(--color-primary)]',
        )}
      >
        {nft ? (
          <NFTImage
            src={nft.black_image_thumb}
            alt={decorative ? '' : undefined}
            density="compact"
            className="h-full w-full bg-transparent object-contain"
          />
        ) : (
          <Skeleton className="size-full rounded-none" />
        )}
      </div>
      <p
        aria-hidden={decorative || undefined}
        className="mt-2 flex min-h-5 items-center justify-between gap-2"
      >
        <span className="type-mono text-foreground">{formatId(tokenId)}</span>
        {selected ? (
          <Check aria-hidden className="size-4 shrink-0 text-primary" strokeWidth={2.5} />
        ) : null}
      </p>
    </div>
  );
};

export default RandomWalkNFT;
