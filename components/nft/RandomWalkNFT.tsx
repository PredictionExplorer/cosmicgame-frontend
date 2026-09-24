import { Check } from 'lucide-react';

import { formatId } from '@/utils';

import { cn } from '@/lib/utils';
import { useRWLKNFT } from '@/hooks/useRWLKNFT';
import { SkeletonArtPlate } from '@/components/ui/skeleton';

import NFTImage from './NFTImage';

interface RandomWalkNFTProps {
  tokenId: number | string;
  selected?: boolean;
  /** Inside a picker the card is plain content; otherwise it links to randomwalknft.com. */
  selectable?: boolean;
  /**
   * The image and the number chip are decorative because a parent control
   * (the picker's toggle button) already names the token.
   */
  decorative?: boolean;
}

/** A RandomWalk NFT thumbnail with its number, used by the gesture picker and gesture pages. */
const RandomWalkNFT = ({
  tokenId,
  selected = false,
  selectable = true,
  decorative = false,
}: RandomWalkNFTProps) => {
  const nft = useRWLKNFT(tokenId);
  const idLabel = formatId(tokenId);

  const content = (
    <div className="relative">
      {!nft ? (
        <SkeletonArtPlate />
      ) : (
        <NFTImage src={nft.black_image_thumb} alt={decorative ? '' : undefined} density="compact" />
      )}
      <span
        className={cn(
          'pointer-events-none absolute bottom-2 right-2 z-[1] rounded-control px-2 py-0.5',
          'bg-art-ground/80 type-caption font-mono font-medium tabular-nums text-foreground',
          'ring-1 ring-rule',
        )}
        aria-hidden={decorative || undefined}
      >
        {idLabel}
      </span>
      {selected ? (
        <span
          aria-hidden
          className="absolute right-2 top-2 z-[1] flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border transition-colors duration-[var(--duration-fast)]',
        selected ? 'border-primary ring-1 ring-primary' : 'border-border',
      )}
      data-selected={selected || undefined}
    >
      {selectable ? (
        content
      ) : (
        <a href={`https://www.randomwalknft.com/detail/${tokenId}`} className="block">
          {content}
        </a>
      )}
    </div>
  );
};

export default RandomWalkNFT;
