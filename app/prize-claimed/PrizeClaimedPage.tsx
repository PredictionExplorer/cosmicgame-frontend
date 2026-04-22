'use client';

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Fireworks, { FireworksHandlers } from '@fireworks-js/react';

import {
  DefinitionList,
  DetailRow,
  SectionCard,
  detailLinkClass,
  detailPanelClass,
} from '@/components/detail-page/DetailPageChrome';
import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper } from '@/components/styled';
import { useRoundInfo } from '@/hooks/useApiQuery';
import { cn } from '@/lib/utils';

import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

const PrizeClaimedPage = () => {
  const searchParams = useSearchParams();

  const fireworksRef = useRef<FireworksHandlers>(null);

  const [finishFireworks, setFinishFireworks] = useState(false);

  const roundStr = searchParams.get('round');
  const roundNum = parseInt(roundStr ?? '0');

  const { data: prizeInfo, isLoading: loading } = useRoundInfo(roundNum);

  const handleFireworksClick = () => {
    fireworksRef.current?.stop();
    setFinishFireworks(true);
  };

  return (
    <MainWrapper className="max-sm:pb-16">
      <div className="mx-auto max-w-3xl">
        {loading ? (
          <>
            <PageHeader
              title="Prize claimed"
              subtitle="Loading round data…"
              breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Prize claimed' }]}
              className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
              align="left"
            />
            <div className={cn(detailPanelClass, 'p-10 text-center')}>
              <p className="text-sm font-medium text-muted-foreground">Loading...</p>
            </div>
          </>
        ) : !prizeInfo ? (
          <>
            <PageHeader
              title="Prize claimed"
              breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Prize claimed' }]}
              className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
              align="left"
            />
            <div className={cn(detailPanelClass, 'p-10 text-center')}>
              <p className="font-medium text-foreground">No prize information.</p>
            </div>
          </>
        ) : (
          <>
            {searchParams.get('message') && !finishFireworks && (
              <Fireworks
                ref={fireworksRef}
                options={{ opacity: 0.5 }}
                style={{
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  position: 'fixed',
                  zIndex: 10000,
                }}
                onClick={handleFireworksClick}
              />
            )}

            <PageHeader
              title={`Congratulations! You won Round ${prizeInfo.RoundNum}.`}
              breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'Prize', href: `/prize/${prizeInfo.RoundNum}` },
                { label: 'Claimed' },
              ]}
              className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
              align="left"
            />

            <SectionCard
              sectionId="prize-claimed-rewards"
              title={`Round ${prizeInfo.RoundNum} rewards`}
              description="Summary of the main prize components for this round."
            >
              <DefinitionList>
                <DetailRow label="ETH prize">
                  <span className="font-mono tabular-nums">{prizeInfo.AmountEth.toFixed(6)} ETH</span>
                </DetailRow>
                <DetailRow label="Cosmic Signature Token number">
                  <Link href={`/detail/${prizeInfo.TokenId}`} className={cn(detailLinkClass, 'font-mono tabular-nums')}>
                    {prizeInfo.TokenId}
                  </Link>
                </DetailRow>
                {!!(prizeInfo.RoundStats.TotalDonatedNFTs as number) ? (
                  <DetailRow label="Donated tokens (ERC721)">
                    <span>
                      {prizeInfo.RoundStats.TotalDonatedNFTs as ReactNode} donated tokens (ERC721)
                    </span>
                  </DetailRow>
                ) : null}
              </DefinitionList>
            </SectionCard>

            <SectionCard sectionId="prize-claimed-next" title="Next steps" description="Raffles and staking may add separate rewards.">
              <div className="px-4 py-4 text-sm leading-relaxed text-muted-foreground sm:px-5">
                There could also be random rewards from raffles. To check your winnings, go to{' '}
                <Link href="/my-winnings" className={detailLinkClass}>
                  My-Winnings
                </Link>{' '}
                page. For staking rewards, visit{' '}
                <Link href="/my-staking" className={detailLinkClass}>
                  My-Staking
                </Link>{' '}
                page.
              </div>
            </SectionCard>
          </>
        )}
      </div>
    </MainWrapper>
  );
};

export default PrizeClaimedPage;
