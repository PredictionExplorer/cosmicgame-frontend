'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { getEnduranceChampions } from '@/utils';

import { PageShell } from '@/components/ui/page-shell';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton, SkeletonTable } from '@/components/ui/skeleton';
import { AttachedNFTAllocationShowcase } from '@/components/attachments/DonatedNFTPrizeShowcase';
import type { DonatedERC20Token } from '@/components/attachments/AttachedERC20Table';
import { SpecialAllocationRecipients } from '@/components/tables/SpecialAllocationRecipients';
import type { EthDonation } from '@/components/tables/EthDonationTable';
import type { AttachedNFT } from '@/services/api/types';
import {
  useDashboardInfo,
  useGestureListByCycle,
  useDonationsNFTByRound,
  useDonationsCGWithInfoByRound,
  useDonationsERC20ByRound,
  useCurrentTime,
} from '@/hooks/useApiQuery';
import { ZERO_ADDRESS } from '@/lib/cycleState';
import { resolveLatestGesture } from '@/lib/latestGesture';
import { useAllocationFinalize } from '@/hooks/useAllocationFinalize';
import { useEndgameChainSync } from '@/hooks/useEndgameChainSync';
import { useLiveFreshness } from '@/hooks/useLiveFreshness';
import { useNow } from '@/hooks/useNow';

import { cyclePhaseView } from './cyclePhase';
import { CycleDetails } from './components/CycleDetails';
import { CycleStatus } from './components/CycleStatus';

const EMPTY: never[] = [];

/** The page body while the first dashboard read is in flight: the cycle column and a ledger. */
function CurrentCycleSkeleton() {
  const t = useTranslations('common');
  return (
    <div role="status" aria-label={t('status.loading')} className="space-y-[var(--block-gap)]">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-12" aria-hidden>
        <div className="space-y-6 lg:col-span-5">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-16 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-12 w-48 rounded-control" />
        </div>
        <div className="space-y-3 lg:col-span-7">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-28 w-full rounded-surface" />
          <Skeleton className="h-28 w-full rounded-surface" />
        </div>
      </div>
      <SkeletonTable announce={false} />
    </div>
  );
}

/**
 * `seoSummary` is the server-rendered page header, the page's only header: it
 * carries the cycle, gesture count, Signature Allocation and opening time, so
 * the body starts with the clock and never repeats those figures.
 *
 * The dashboard polls every few seconds. A failed poll keeps the last reading
 * on screen (the header's live status says it is delayed, and the clock stops
 * calling itself live); the page is replaced by an error only when nothing has
 * ever loaded, and "Try again" refetches instead of reloading the page.
 */
const CurrentRoundPage = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('currentCycle');
  const dashboard = useDashboardInfo();
  const data = dashboard.data ?? null;
  const { data: currentTimeRaw, dataUpdatedAt: currentTimeUpdatedAt } = useCurrentTime();
  const round = data?.CurRoundNum ?? -1;

  const gestureQuery = useGestureListByCycle(round, 'desc');
  const { data: nftDonationsData } = useDonationsNFTByRound(round);
  const { data: ethDonationsRawData } = useDonationsCGWithInfoByRound(round);
  const { data: erc20DonationsData } = useDonationsERC20ByRound(round);
  const freshness = useLiveFreshness();

  const gestures = gestureQuery.data ?? EMPTY;
  const latestResolution = useMemo(
    () =>
      resolveLatestGesture({
        dashboardLastAddress: data?.LastBidderAddr,
        gestures,
      }),
    [gestures, data?.LastBidderAddr],
  );
  const attachedNfts = (nftDonationsData ?? EMPTY) as AttachedNFT[];
  const ethDonations = (ethDonationsRawData ?? EMPTY) as EthDonation[];
  const attachedErc20 = (erc20DonationsData ?? EMPTY) as DonatedERC20Token[];

  const [currentTimeFallbackMs] = useState(() => Date.now());
  const nowMs = useNow(1000);

  const offset = useMemo(() => {
    if (currentTimeRaw == null) return 0;
    const sampledAtMs = currentTimeUpdatedAt || currentTimeFallbackMs;
    return currentTimeRaw * 1000 - sampledAtMs;
  }, [currentTimeRaw, currentTimeUpdatedAt, currentTimeFallbackMs]);

  const { allocationTime, activationTime } = useAllocationFinalize({ data, offset });
  // Final-minute synchronizer: 1s direct-chain reads around the zero-cross so
  // the page doesn't declare the cycle finished on a stale countdown target.
  const endgame = useEndgameChainSync({ targetMs: allocationTime });

  const championList = useMemo(() => {
    if (!gestureQuery.data || nowMs <= 0) return null;
    const champions = getEnduranceChampions(gestureQuery.data, 0, Math.floor(nowMs / 1000));
    return [...champions].sort((a, b) => b.chronoWarrior - a.chronoWarrior);
  }, [gestureQuery.data, nowMs]);

  const participants = useMemo(
    () => (gestureQuery.data ? new Set(gestureQuery.data.map((g) => g.BidderAddr)).size : null),
    [gestureQuery.data],
  );

  if (!data) {
    return (
      <PageShell variant="data" backdrop="signature">
        {seoSummary}
        {dashboard.isError ? (
          <ErrorState
            headingLevel={2}
            title={t('error.title')}
            message={t('error.message')}
            onRetry={() => void dashboard.refetch()}
          />
        ) : (
          <CurrentCycleSkeleton />
        )}
      </PageShell>
    );
  }

  const phase = cyclePhaseView({
    data,
    allocationTime,
    activationTime,
    now: nowMs,
    finalizationConfirmed: !endgame.isConfirmationPending,
    fresh: freshness.state === 'live' || freshness.state === 'connecting',
  });
  // Standings exist once someone has gestured (known on the server too, unlike the phase).
  const hasStandings = data.TsRoundStart !== 0 && data.LastBidderAddr !== ZERO_ADDRESS;

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary}

      <div className="space-y-[calc(var(--block-gap)*1.5)]">
        <section
          aria-labelledby="cycle-status-heading"
          className={
            hasStandings ? 'grid gap-12 lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16' : undefined
          }
        >
          <CycleStatus
            data={data}
            phase={phase}
            nowMs={nowMs}
            participants={participants}
            headingId="cycle-status-heading"
            className={
              hasStandings
                ? 'lg:sticky lg:top-[calc(var(--sticky-offset)+1rem)] lg:col-span-5 lg:self-start'
                : 'max-w-xl'
            }
          />
          {hasStandings ? (
            <div className="min-w-0 lg:col-span-7">
              <SpecialAllocationRecipients
                latestParticipantAddress={latestResolution.address}
                latestGesture={latestResolution.gesture}
                latestMessage={latestResolution.gesture?.Message ?? ''}
                showLastGesture
              />
            </div>
          ) : null}
        </section>

        <AttachedNFTAllocationShowcase
          nfts={attachedNfts}
          erc20Tokens={attachedErc20}
          cycleNumber={data.CurRoundNum}
        />

        <CycleDetails
          data={data}
          gestures={gestures}
          gesturesLoading={gestureQuery.isPending && round >= 0}
          gesturesError={gestureQuery.isError && !gestureQuery.data}
          onRetryGestures={() => void gestureQuery.refetch()}
          championList={championList}
          ethDonations={ethDonations}
          attachedNfts={attachedNfts}
          attachedErc20={attachedErc20}
        />
      </div>
    </PageShell>
  );
};

export default CurrentRoundPage;
