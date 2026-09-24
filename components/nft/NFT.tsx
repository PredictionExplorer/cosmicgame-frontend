import { formatId, getAssetsUrl, getThumbUrl } from '@/utils';

import { Link } from '@/i18n/navigation';
import { SkeletonArtPlate } from '@/components/ui/skeleton';

import NFTImage from './NFTImage';

interface NFTProps {
  TokenId: number | string;
  Seed?: number | string;
  TokenName?: string;
  [key: string]: unknown;
}

/**
 * A Signature card: the art on its plate and a one-line label under it. The
 * link is named by the label, so the image itself is decorative.
 */
const NFT = ({ nft }: { nft: NFTProps }) => {
  const seed = nft.Seed ?? '';
  const thumb = getThumbUrl(seed, 'card');
  const fullImage = getAssetsUrl(`cosmicsignature/0x${seed}.png`);

  return (
    <div className="group relative overflow-hidden rounded-surface border border-rule bg-surface transition-colors duration-[var(--duration-fast)] hover:border-input">
      {!nft ? (
        <SkeletonArtPlate />
      ) : (
        <Link href={`/detail/${nft.TokenId}`} className="block no-underline">
          <NFTImage
            src={thumb}
            fallbackSrc={fullImage}
            frame="signature"
            alt=""
            unavailableDetail={formatId(nft.TokenId)}
          />
          <div className="flex items-center justify-between p-3">
            <span className="type-mono text-subtle">{formatId(nft.TokenId)}</span>
            {nft.TokenName && nft.TokenName !== '' && (
              <span className="ml-2 truncate type-body-sm font-medium text-foreground">
                {nft.TokenName}
              </span>
            )}
          </div>
        </Link>
      )}
    </div>
  );
};

export default NFT;
