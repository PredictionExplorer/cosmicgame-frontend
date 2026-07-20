import { useTranslations } from 'next-intl';

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
  const t = useTranslations('statistics');
  const { data: tokenURI } = useAttachedNftMetadata(nft.NFTTokenURI);
  const labels = {
    viewNft: t('attachedNftLinks.viewNft'),
    viewOpenSea: t('attachedNftLinks.viewOpenSea'),
    viewContract: t('attachedNftLinks.viewContract'),
    detailsUnavailable: t('attachedNftLinks.detailsUnavailable'),
    contractUnavailable: t('attachedNftLinks.contractUnavailable'),
  };
  const link = resolveAttachedNftLink({ nft, metadata: tokenURI, labels });
  const tokenId = getAttachedNftTokenId(nft);
  const label = tokenURI?.name
    ? t('attachedNftCard.viewNamed', { name: tokenURI.name })
    : tokenId
      ? t('attachedNftCard.viewId', { id: tokenId })
      : link.label;
  const image = (
    <NFTImage
      src={tokenURI?.image}
      alt={
        tokenURI?.name
          ? t('attachedNftCard.imageAltNamed', { name: tokenURI.name })
          : t('attachedNftCard.imageAlt')
      }
    />
  );

  return (
    <StyledCard className="overflow-hidden rounded-lg border border-white/[0.06] bg-white/[0.02]">
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

      {/* Caption row below the image — overlaying both labels on the artwork
          made them collide on narrow grid cards. */}
      <div className="flex items-center justify-between gap-2 px-2 py-1.5">
        <span
          className="truncate text-xs text-muted-foreground"
          data-testid="NFTTokenId"
          title={tokenId ? `#${tokenId}` : undefined}
        >
          {tokenId ? `#${tokenId}` : t('attachedNftCard.unknownToken')}
        </span>
        <span
          className={cn(
            'shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary',
            !link.href && 'bg-white/[0.05] text-muted-foreground',
          )}
        >
          {t('attachedNftCard.attached')}
        </span>
      </div>
    </StyledCard>
  );
};

export default DonatedNFT;
