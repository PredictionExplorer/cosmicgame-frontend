import { formatId, getAssetsUrl, getThumbUrl } from '@/utils';

import { Link } from '@/i18n/navigation';
import { NFTSkeleton } from '@/components/styled';

import NFTImage from './NFTImage';

interface NFTProps {
  TokenId: number | string;
  Seed?: number | string;
  TokenName?: string;
  [key: string]: unknown;
}

const NFT = ({ nft }: { nft: NFTProps }) => {
  const seed = nft.Seed ?? '';
  const thumb = getThumbUrl(seed, 'card');
  const fullImage = getAssetsUrl(`cosmicsignature/0x${seed}.png`);

  return (
    <div className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(21,191,253,0.08)]">
      {!nft ? (
        <NFTSkeleton />
      ) : (
        <Link href={`/detail/${nft.TokenId}`} className="block">
          <div className="overflow-hidden">
            <div className="transition-transform duration-300 group-hover:scale-[1.03]">
              <NFTImage src={thumb} fallbackSrc={fullImage} />
            </div>
          </div>
          <div className="p-3 flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">{formatId(nft.TokenId)}</span>
            {nft.TokenName && nft.TokenName !== '' && (
              <span className="text-sm font-medium text-white truncate ml-2">{nft.TokenName}</span>
            )}
          </div>
        </Link>
      )}
    </div>
  );
};

export default NFT;
