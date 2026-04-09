import { useSnapCarousel } from 'react-snap-carousel';
import { ArrowLeft, ArrowRight, ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { SectionDivider } from '@/components/ui/section-divider';
import { EmptyState } from '@/components/ui/empty-state';
import { useCSTList } from '@/hooks/useApiQuery';

import NFT from './NFT';

const LatestNFTs = () => {
  const { data: nfts = [] } = useCSTList();
  const nftData = [...nfts].sort((a, b) => Number(b.TokenId) - Number(a.TokenId));

  const { scrollRef, pages, activePageIndex, next, prev } = useSnapCarousel();

  return (
    <div className="bg-card/50">
      <div className="max-w-7xl mx-auto px-4 py-20 md:pb-32">
        <h4 className="text-center font-display text-2xl font-bold tracking-tight">Latest NFTs</h4>
        <SectionDivider className="mt-4 mb-10" />

        {nftData.length > 0 ? (
          <>
            <div className="hidden md:grid md:grid-cols-3 gap-4">
              {nftData.slice(0, 6).map((nft, index) => (
                <div key={nft.TokenId || index}>
                  <NFT nft={nft} />
                </div>
              ))}
            </div>

            <div className="md:hidden">
              <ul
                ref={scrollRef}
                className="list-none flex overflow-hidden snap-x snap-mandatory p-0"
              >
                {nftData.slice(0, 6).map((nft, index) => (
                  <li key={nft.TokenId || index} className="w-full shrink-0 mr-2.5">
                    <NFT nft={nft} />
                  </li>
                ))}
              </ul>
              <div className="text-center mt-4">
                <Button className="mr-2" onClick={() => prev()} disabled={activePageIndex === 0}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button onClick={() => next()} disabled={activePageIndex === pages.length - 1}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <EmptyState
            icon={<ImageIcon className="h-8 w-8 text-muted-foreground/50" />}
            title="No NFTs yet"
            description="Cosmic Signature NFTs will appear here once the first round completes."
          />
        )}
      </div>
    </div>
  );
};

export default LatestNFTs;
