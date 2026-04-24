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
              title="Allocation retrieved"
              subtitle="Loading cycle data\u2026"
              breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Allocation retrieved' }]}
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
              title="Allocation retrieved"
              breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Allocation retrieved' }]}
              className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
              align="left"
            />
            <div className={cn(detailPanelClass, 'p-10 text-center')}>
              <p className="font-medium text-foreground">No allocation information.</p>
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
              title={`Congratulations! Cycle ${prizeInfo.RoundNum} Signature Allocation received.`}
              breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'Allocation', href: `/allocation/${prizeInfo.RoundNum}` },
                { label: 'Retrieved' },
              ]}
              className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
              align="left"
            />

            <SectionCard
              sectionId="prize-claimed-rewards"
              title={`Cycle ${prizeInfo.RoundNum} allocations`}
              description="Summary of the Signature Allocation components for this cycle."
            >
              <DefinitionList>
                <DetailRow label="ETH allocation">
                  <span className="font-mono tabular-nums">
                    {prizeInfo.AmountEth.toFixed(6)} ETH
                  </span>
                </DetailRow>
                <DetailRow label="Cosmic Signature Token number">
                  <Link
                    href={`/detail/${prizeInfo.TokenId}`}
                    className={cn(detailLinkClass, 'font-mono tabular-nums')}
                  >
                    {prizeInfo.TokenId}
                  </Link>
                </DetailRow>
                {!!(prizeInfo.RoundStats.TotalDonatedNFTs as number) ? (
                  <DetailRow label="Attached tokens (ERC721)">
                    <span>
                      {prizeInfo.RoundStats.TotalDonatedNFTs as ReactNode} attached tokens (ERC721)
                    </span>
                  </DetailRow>
                ) : null}
              </DefinitionList>
            </SectionCard>

            <SectionCard
              sectionId="prize-claimed-next"
              title="Next steps"
              description="Stellar Selection and anchoring may produce separate allocations."
            >
              <div className="px-4 py-4 text-sm leading-relaxed text-muted-foreground sm:px-5">
                There could also be additional allocations from Stellar Selection. To view your
                allocations, go to{' '}
                <Link href="/my-allocations" className={detailLinkClass}>
                  My Allocations
                </Link>{' '}
                page. For Anchor Distributions, visit{' '}
                <Link href="/my-anchors" className={detailLinkClass}>
                  My Anchors
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
