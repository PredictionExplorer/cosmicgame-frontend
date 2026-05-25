import { StyledCard } from '@/components/styled';
import NFTImage from '@/components/nft/NFTImage';
import type { AttachedNFT as AttachedNFTRecord } from '@/services/api/types';
import { cn } from '@/lib/utils';

import { getAttachedNftTokenId, resolveAttachedNftLink } from './attachedNftLinks';
import { useAttachedNftMetadata } from './useAttachedNftMetadata';

type NFT = Partial<
  Pick<AttachedNFTRecord, 'TokenAddr' | 'NFTTokenId' | 'NFTTokenURI' | 'TokenId'>
> & {
  [key: string]: unknown;
};

interface DonatedNFTProps {
  nft: NFT;
}

const DonatedNFT = ({ nft }: DonatedNFTProps) => {
  const { data: tokenURI } = useAttachedNftMetadata(nft.NFTTokenURI);
  const link = resolveAttachedNftLink({ nft, metadata: tokenURI });
  const tokenId = getAttachedNftTokenId(nft);
  const label = tokenURI?.name
    ? `View attached NFT ${tokenURI.name}`
    : tokenId
      ? `View attached NFT ${tokenId}`
      : link.label;
  const image = (
    <NFTImage
      src={tokenURI?.image}
      alt={tokenURI?.name ? `Attached NFT ${tokenURI.name}` : 'Attached NFT'}
    />
  );

  return (
    <StyledCard>
      {link.href ? (
        <a
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="group block w-full text-left"
        >
          {image}
        </a>
      ) : (
        <div aria-label={label} className="block w-full text-left">
          {image}
        </div>
      )}

      <div className="flex absolute inset-4 justify-between pointer-events-none">
        <span
          className="text-xs [text-shadow:0px_0px_8px_var(--background)]"
          data-testid="NFTTokenId"
        >
          {tokenId ? `#${tokenId}` : 'Unknown token'}
        </span>
        <span
          className={cn(
            'text-primary [text-shadow:0px_0px_8px_var(--background)]',
            !link.href && 'text-muted-foreground',
          )}
        >
          Attached
        </span>
      </div>
    </StyledCard>
  );
};

export default DonatedNFT;
