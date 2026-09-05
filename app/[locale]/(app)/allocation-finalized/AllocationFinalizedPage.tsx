'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Fireworks, { FireworksHandlers } from '@fireworks-js/react';
import { usePublicClient } from 'wagmi';
import { useTranslations } from 'next-intl';

import { useRouter } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import {
  DefinitionList,
  DetailRow,
  SectionCard,
  detailLinkClass,
  detailPanelClass,
} from '@/components/detail-page/DetailPageChrome';
import { PageHeader } from '@/components/layout/PageHeader';
import { MainWrapper } from '@/components/styled';
import useCosmicGameContract from '@/hooks/useCosmicGameContract';
import { useRoundInfo } from '@/hooks/useApiQuery';
import { cn } from '@/lib/utils';
import { formatFixed } from '@/utils/format';

/** Poll interval while waiting for the next round to become active (chain activation time). */
const ACTIVATION_POLL_MS = 4000;

const AllocationFinalizedPage = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('allocation');
  const searchParams = useSearchParams();
  const router = useRouter();
  const publicClient = usePublicClient();
  const cosmicGameContract = useCosmicGameContract();

  const fireworksRef = useRef<FireworksHandlers>(null);

  const [finishFireworks, setFinishFireworks] = useState(false);

  const roundStr = searchParams.get('cycle');
  const roundNum =
    roundStr !== null && roundStr !== '' ? Number.parseInt(roundStr, 10) : Number.NaN;
  const cycleIsValid = Number.isFinite(roundNum) && roundNum >= 0;
  const finalizeMessage = searchParams.get('message');
  const isClaimSuccess = finalizeMessage === 'success';

  const { data: allocationInfo, isLoading: loading } = useRoundInfo(cycleIsValid ? roundNum : -1);

  /**
   * After `claimMainPrize`, the chain is on the next round; `roundActivationTime()` is when that
   * round becomes playable. While `block.timestamp < activation`, stay on this congratulations URL;
   * once `block.timestamp >= activation`, send players to home so the dashboard shows the live round.
   */
  useEffect(() => {
    if (!isClaimSuccess || !cycleIsValid || !publicClient || !cosmicGameContract) return;

    let cancelled = false;

    const maybeRedirectWhenRoundActive = async () => {
      try {
        const activationTime = await cosmicGameContract.read.roundActivationTime?.();
        const block = await publicClient.getBlock({ blockTag: 'latest' });
        if (cancelled || activationTime === undefined || block === null) return;

        const activationSec = Number(activationTime);
        const blockSec = Number(block.timestamp);
        if (!Number.isFinite(activationSec) || activationSec <= 0) return;

        if (blockSec >= activationSec) {
          router.replace('/');
        }
      } catch {
        /* transient RPC or contract read failure — next poll retries */
      }
    };

    void maybeRedirectWhenRoundActive();
    const id = window.setInterval(() => void maybeRedirectWhenRoundActive(), ACTIVATION_POLL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [isClaimSuccess, cycleIsValid, publicClient, cosmicGameContract, router]);

  const handleFireworksClick = () => {
    fireworksRef.current?.stop();
    setFinishFireworks(true);
  };

  const breadcrumbsBase = [
    { label: t('finalized.home'), href: '/' },
    { label: t('finalized.title') },
  ];

  return (
    <MainWrapper className="max-sm:pb-16">
      {seoSummary}
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
              // Celebration layer: above the header, below a focused skip link.
              zIndex: 60,
            }}
            onClick={handleFireworksClick}
          />
        )}

        {!cycleIsValid ? (
          <>
            <PageHeader
              title={t('finalized.title')}
              subtitle={t('finalized.invalid.subtitle')}
              breadcrumbs={breadcrumbsBase}
              className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
              align="left"
              titleLevel={2}
            />
            <div className={cn(detailPanelClass, 'p-10 text-center')}>
              <p className="font-medium text-foreground">
                {t.rich('finalized.invalid.missingParameter', {
                  code: (chunks) => <span className="font-mono">{chunks}</span>,
                })}
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                {t.rich('finalized.invalid.guidance', {
                  allocations: (chunks) => (
                    <Link href="/my-allocations" className={detailLinkClass}>
                      {chunks}
                    </Link>
                  ),
                })}
              </p>
            </div>
          </>
        ) : loading ? (
          <>
            <PageHeader
              title={t('finalized.title')}
              subtitle={t('finalized.loading.subtitle', { cycle: roundNum })}
              breadcrumbs={breadcrumbsBase}
              className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
              align="left"
              titleLevel={2}
            />
            <div className={cn(detailPanelClass, 'p-10 text-center')}>
              <p className="text-sm font-medium text-muted-foreground">
                {t('finalized.loading.status')}
              </p>
            </div>
          </>
        ) : !allocationInfo ? (
          <>
            <PageHeader
              title={
                isClaimSuccess
                  ? t('finalized.pending.successTitle')
                  : t('finalized.pending.defaultTitle')
              }
              subtitle={
                isClaimSuccess
                  ? t('finalized.pending.successSubtitle', { cycle: roundNum })
                  : undefined
              }
              breadcrumbs={
                isClaimSuccess
                  ? [
                      { label: t('finalized.home'), href: '/' },
                      {
                        label: t('finalized.pending.cycleBreadcrumb', { cycle: roundNum }),
                        href: `/allocation/${roundNum}`,
                      },
                      { label: t('finalized.pending.finalizedBreadcrumb') },
                    ]
                  : breadcrumbsBase
              }
              className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
              align="left"
              titleLevel={2}
            />
            <div className={cn(detailPanelClass, 'space-y-6 p-10 text-center')}>
              {isClaimSuccess ? (
                <>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t('finalized.pending.breakdown')}
                  </p>
                  <Link
                    href={`/allocation/${roundNum}`}
                    className={cn(detailLinkClass, 'inline-block text-base font-medium')}
                  >
                    {t('finalized.pending.viewDetails', { cycle: roundNum })}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {t.rich('finalized.pending.review', {
                      allocations: (chunks) => (
                        <Link href="/my-allocations" className={detailLinkClass}>
                          {chunks}
                        </Link>
                      ),
                    })}
                  </p>
                </>
              ) : (
                <p className="font-medium text-foreground">{t('finalized.pending.empty')}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <PageHeader
              title={t('finalized.result.title', { cycle: allocationInfo.RoundNum })}
              breadcrumbs={[
                { label: t('finalized.home'), href: '/' },
                {
                  label: t('finalized.result.allocationBreadcrumb'),
                  href: `/allocation/${allocationInfo.RoundNum}`,
                },
                { label: t('finalized.result.retrievedBreadcrumb') },
              ]}
              className="mb-10 text-left sm:max-w-none [&_p]:mx-0 [&_p]:max-w-none"
              align="left"
              titleLevel={2}
            />

            <SectionCard
              sectionId="allocation-claimed-rewards"
              title={t('finalized.result.sectionTitle', { cycle: allocationInfo.RoundNum })}
              description={t('finalized.result.sectionDescription')}
            >
              <DefinitionList>
                <DetailRow label={t('finalized.result.ethAllocation')}>
                  <span className="font-mono tabular-nums">
                    {formatFixed(allocationInfo.AmountEth, 6)} ETH
                  </span>
                </DetailRow>
                <DetailRow label={t('finalized.result.nftId')}>
                  <Link
                    href={`/detail/${allocationInfo.TokenId}`}
                    className={cn(detailLinkClass, 'font-mono tabular-nums')}
                  >
                    {allocationInfo.TokenId}
                  </Link>
                </DetailRow>
                {!!(allocationInfo.RoundStats.TotalDonatedNFTs as number) ? (
                  <DetailRow label={t('finalized.result.attachedTokensLabel')}>
                    <span>
                      {t('finalized.result.attachedTokens', {
                        count: allocationInfo.RoundStats.TotalDonatedNFTs as number,
                      })}
                    </span>
                  </DetailRow>
                ) : null}
              </DefinitionList>
            </SectionCard>

            <SectionCard
              sectionId="allocation-claimed-next"
              title={t('finalized.next.title')}
              description={t('finalized.next.description')}
            >
              <div className="px-4 py-4 text-sm leading-relaxed text-muted-foreground sm:px-5">
                {t.rich('finalized.next.body', {
                  allocations: (chunks) => (
                    <Link href="/my-allocations" className={detailLinkClass}>
                      {chunks}
                    </Link>
                  ),
                  anchors: (chunks) => (
                    <Link href="/my-anchors" className={detailLinkClass}>
                      {chunks}
                    </Link>
                  ),
                })}
              </div>
            </SectionCard>
          </>
        )}
      </div>
    </MainWrapper>
  );
};

export default AllocationFinalizedPage;
