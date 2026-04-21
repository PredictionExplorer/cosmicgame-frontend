import { formatId } from '@/utils';

import { cn } from '@/lib/utils';
import { useRWLKNFT } from '@/hooks/useRWLKNFT';
import { NFTSkeleton } from '@/components/styled';

import NFTImage from './NFTImage';

const RandomWalkNFT = ({
  tokenId,
  selected = false,
  selectable = true,
}: {
  tokenId: number | string;
  selected?: boolean;
  selectable?: boolean;
}) => {
  const nft = useRWLKNFT(tokenId);
  const idLabel = formatId(tokenId);

  const content = (
    <div className="relative">
      {!nft ? <NFTSkeleton /> : <NFTImage src={nft.black_image_thumb} />}
      <div
        className={cn(
          'pointer-events-none absolute bottom-2 right-2 z-[1] rounded-md px-2 py-1',
          'bg-black/75 font-mono text-[11px] font-semibold tabular-nums text-white shadow-sm',
          'ring-1 ring-white/10',
        )}
        aria-hidden
      >
        {idLabel}
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden relative',
        selected ? 'border-white' : 'border-[#181F64]',
      )}
    >
      {selectable ? (
        <div className="cursor-pointer">{content}</div>
      ) : (
        <a
          href={`https://www.randomwalknft.com/detail/${tokenId}`}
          className="block cursor-pointer"
        >
          {content}
        </a>
      )}
    </div>
  );
};

export default RandomWalkNFT;
