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

const AllocationFinalizedPage = () => {
  const searchParams = useSearchParams();

  const fireworksRef = useRef<FireworksHandlers>(null);

  const [finishFireworks, setFinishFireworks] = useState(false);

  const roundStr = searchParams.get('cycle');
  const roundNum =
    roundStr !== null && roundStr !== '' ? Number.parseInt(roundStr, 10) : Number.NaN;
  const cycleIsValid = Number.isFinite(roundNum) && roundNum >= 0;
  const finalizeMessage = searchParams.get('message');
  const isClaimSuccess = finalizeMessage === 'success';

  const { data: allocationInfo, isLoading: loading } = useRoundInfo(cycleIsValid ? roundNum : -1);

  const handleFireworksClick = () => {
    fireworksRef.current?.stop();
    setFinishFireworks(true);
  };

  const breadcrumbsBase = [{ label: 'Home', href: '/' }, { label: 'Allocation finalized' }];

  return (
    <MainWrapper className="max-sm:pb-16">
      <div className="mx-auto max-w-3xl">
        {isClaimSuccess && !finishFireworks && (
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

        {!cycleIsValid ? (
          <>
            <PageHeader
              title="Allocation finalized"
              subtitle="This page needs a valid cycle number in the URL."
              breadcrumbs={breadcrumbsBase}
              className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
              align="left"
            />
            <div className={cn(detailPanelClass, 'p-10 text-center')}>
              <p className="font-medium text-foreground">
                Missing or invalid <span className="font-mono">cycle</span> query parameter.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Open{' '}
                <Link href="/my-allocations" className={detailLinkClass}>
                  My Allocations
                </Link>{' '}
                to review completed cycles.
              </p>
            </div>
          </>
        ) : loading ? (
          <>
            <PageHeader
              title="Allocation finalized"
              subtitle={`Loading cycle ${roundNum}…`}
              breadcrumbs={breadcrumbsBase}
              className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
              align="left"
            />
            <div className={cn(detailPanelClass, 'p-10 text-center')}>
              <p className="text-sm font-medium text-muted-foreground">Loading...</p>
            </div>
          </>
        ) : !allocationInfo ? (
          <>
            <PageHeader
              title={
                isClaimSuccess
                  ? 'You successfully completed this cycle'
                  : 'Allocation finalized'
              }
              subtitle={
                isClaimSuccess
                  ? `Cycle ${roundNum} was finalized on-chain.`
                  : undefined
              }
              breadcrumbs={
                isClaimSuccess
                  ? [
                      { label: 'Home', href: '/' },
                      {
                        label: `Cycle ${roundNum}`,
                        href: `/allocation/${roundNum}`,
                      },
                      { label: 'Finalized' },
                    ]
                  : breadcrumbsBase
              }
              className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
              align="left"
            />
            <div className={cn(detailPanelClass, 'space-y-6 p-10 text-center')}>
              {isClaimSuccess ? (
                <>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Allocation breakdown (Signature Allocation distribution, prizes, and attached
                    tokens) is on the allocation details page for this cycle.
                  </p>
                  <Link
                    href={`/allocation/${roundNum}`}
                    className={cn(detailLinkClass, 'inline-block text-base font-medium')}
                  >
                    View cycle {roundNum} allocation details
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    You can also review everything under{' '}
                    <Link href="/my-allocations" className={detailLinkClass}>
                      My Allocations
                    </Link>
                    .
                  </p>
                </>
              ) : (
                <p className="font-medium text-foreground">No allocation information.</p>
              )}
            </div>
          </>
        ) : (
          <>
            <PageHeader
              title={`Congratulations! Cycle ${allocationInfo.RoundNum} Signature Allocation received.`}
              breadcrumbs={[
                { label: 'Home', href: '/' },
                { label: 'Allocation', href: `/allocation/${allocationInfo.RoundNum}` },
                { label: 'Retrieved' },
              ]}
              className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
              align="left"
            />

            <SectionCard
              sectionId="allocation-claimed-rewards"
              title={`Cycle ${allocationInfo.RoundNum} allocations`}
              description="Summary of the Signature Allocation components for this cycle."
            >
              <DefinitionList>
                <DetailRow label="ETH allocation">
                  <span className="font-mono tabular-nums">
                    {allocationInfo.AmountEth.toFixed(6)} ETH
                  </span>
                </DetailRow>
                <DetailRow label="Cosmic Signature Token number">
                  <Link
                    href={`/detail/${allocationInfo.TokenId}`}
                    className={cn(detailLinkClass, 'font-mono tabular-nums')}
                  >
                    {allocationInfo.TokenId}
                  </Link>
                </DetailRow>
                {!!(allocationInfo.RoundStats.TotalDonatedNFTs as number) ? (
                  <DetailRow label="Attached tokens (ERC721)">
                    <span>
                      {allocationInfo.RoundStats.TotalDonatedNFTs as ReactNode} attached tokens
                      (ERC721)
                    </span>
                  </DetailRow>
                ) : null}
              </DefinitionList>
            </SectionCard>

            <SectionCard
              sectionId="allocation-claimed-next"
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

export default AllocationFinalizedPage;
