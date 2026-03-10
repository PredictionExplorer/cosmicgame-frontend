import { formatId } from '@/utils';

import { cn } from '@/lib/utils';
import { useRWLKNFT } from '@/hooks/useRWLKNFT';
import { NFTSkeleton, NFTInfoWrapper } from '@/components/styled';

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

  const content = (
    <>
      {!nft ? <NFTSkeleton /> : <NFTImage src={nft.black_image_thumb} />}
      {nft && (
        <NFTInfoWrapper>
          <span className="text-[11px] text-foreground">{formatId(nft.id)}</span>
        </NFTInfoWrapper>
      )}
    </>
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
