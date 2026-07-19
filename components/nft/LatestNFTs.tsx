import Image from 'next/image';
import { useSnapCarousel } from 'react-snap-carousel';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { NftMarketplaceButton } from '@/components/common/NftMarketplaceButton';
import { useCSTList } from '@/hooks/useApiQuery';

import NFT from './NFT';

const LatestNFTs = () => {
  const t = useTranslations('home');
  const { data: nfts = [] } = useCSTList();
  const nftData = [...nfts].sort((a, b) => Number(b.TokenId) - Number(a.TokenId));

  const { scrollRef, pages, activePageIndex, next, prev } = useSnapCarousel();

  return (
    <div className="bg-[#101441]">
      <div className="container mx-auto px-2.5 py-20 md:pb-[150px]">
        <div className="flex items-center justify-center flex-wrap gap-3">
          <h2 className="text-2xl font-semibold text-foreground">{t('latestNfts.title')}</h2>
          <NftMarketplaceButton variant="compact" />
        </div>
        <div className="text-center mb-14">
          <Image src="/images/divider.svg" width={93} height={3} alt={t('latestNfts.dividerAlt')} />
        </div>

        {nftData.length > 0 ? (
          <>
            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-4 mt-[58px]">
              {nftData.slice(0, 6).map((nft, index) => (
                <div key={nft.TokenId || index}>
                  <NFT nft={nft} />
                </div>
              ))}
            </div>

            {/* Mobile carousel */}
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
                <Button
                  className="mr-2"
                  onClick={() => prev()}
                  disabled={activePageIndex === 0}
                  aria-label={t('latestNfts.previousAria')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button
                  onClick={() => next()}
                  disabled={activePageIndex === pages.length - 1}
                  aria-label={t('latestNfts.nextAria')}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 text-center">
            <h3 className="font-display text-lg font-semibold text-foreground">
              {t('latestNfts.empty.title')}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t('latestNfts.empty.body')}
            </p>
            <Button asChild variant="secondary" size="sm" className="mt-4">
              <Link href="/gallery">{t('latestNfts.empty.cta')}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LatestNFTs;
