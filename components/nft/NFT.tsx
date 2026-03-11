import Link from 'next/link';

import { formatId, getAssetsUrl } from '@/utils';

import { NFTSkeleton, NFTInfoWrapper, StyledCard } from '@/components/styled';

import NFTImage from './NFTImage';

interface NFTProps {
  TokenId: number | string;
  Seed?: number | string;
  TokenName?: string;
  [key: string]: unknown;
}

const NFT = ({ nft }: { nft: NFTProps }) => {
  const image = getAssetsUrl(`cosmicsignature/0x${nft.Seed ?? ''}.png`);

  return (
    <StyledCard>
      <div className="cursor-pointer">
        {!nft ? (
          <NFTSkeleton />
        ) : (
          <Link href={`/detail/${nft.TokenId}`} className="block">
            <NFTImage src={image} />
          </Link>
        )}

        {nft && (
          <NFTInfoWrapper>
            <span className="text-xs text-foreground">{formatId(nft.TokenId)}</span>
          </NFTInfoWrapper>
        )}

        {nft.TokenName && nft.TokenName !== '' && (
          <NFTInfoWrapper className="w-[calc(100%-40px)]">
            <p className="text-base text-white text-center">{nft.TokenName}</p>
          </NFTInfoWrapper>
        )}
      </div>
    </StyledCard>
  );
};

export default NFT;
