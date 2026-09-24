'use client';

import type { ReactNode } from 'react';
import { useState, useMemo } from 'react';
import { zeroAddress } from 'viem';
import { ArrowRight, ImageIcon, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';

import { getEnduranceChampions, formatEthValue } from '@/utils';

import { ContributionIcon, PublicGoodsIcon, StellarSelectionIcon } from '@/lib/conceptIcons';
import { Link } from '@/i18n/navigation';
import { PageShell } from '@/components/ui/page-shell';
import { StatCard } from '@/components/ui/stat-card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import { AttachedNFTAllocationShowcase } from '@/components/attachments/DonatedNFTPrizeShowcase';
import { RoundInfoSection } from '@/components/home/RoundInfoSection';
import Counter from '@/components/common/Counter';
import { useHydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { SmoothCountdown } from '@/components/common/SmoothCountdown';
import { SpecialAllocationRecipients } from '@/components/tables/SpecialAllocationRecipients';
import type { AttachedNFT as DonatedNFTType } from '@/services/api/types';
import {
  useDashboardInfo,
  useGestureListByCycle,
  useDonationsNFTByRound,
  useDonationsCGWithInfoByRound,
  useDonationsERC20ByRound,
  useCurrentTime,
} from '@/hooks/useApiQuery';
import { resolveLatestGesture } from '@/lib/latestGesture';
import { useAllocationFinalize } from '@/hooks/useAllocationFinalize';
import { useEndgameChainSync } from '@/hooks/useEndgameChainSync';
import { useNow } from '@/hooks/useNow';

type EthDonation = import('@/components/tables/EthDonationTable').EthDonation;
type DonatedERC20 = import('@/components/attachments/AttachedERC20Table').DonatedERC20Token;

const sectionFade = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
};

/**
 * `seoSummary` is the server-rendered page header, the page's only header: it
 * carries the cycle, gesture count, Signature Allocation and opening time, so
 * the body starts with the clock and never repeats those figures.
 */
const CurrentRoundPage = ({ seoSummary }: { seoSummary?: ReactNode }) => {
  const t = useTranslations('currentCycle');
  const locale = useLocale();
  const { data: dashboardData, isLoading, isError } = useDashboardInfo();
  const { data: currentTimeRaw, dataUpdatedAt: currentTimeUpdatedAt } = useCurrentTime();
  const round = dashboardData?.CurRoundNum ?? -1;

  const { data: bidListData } = useGestureListByCycle(round, 'desc');
  const { data: nftDonationsData } = useDonationsNFTByRound(round);
  const { data: ethDonationsRawData } = useDonationsCGWithInfoByRound(round);
  const { data: erc20DonationsData } = useDonationsERC20ByRound(round);

  const data = dashboardData ?? null;
  const curGestureList = useMemo(() => bidListData ?? [], [bidListData]);
  const latestResolution = useMemo(
    () =>
      resolveLatestGesture({
        dashboardLastAddress: data?.LastBidderAddr,
        gestures: curGestureList,
      }),
    [curGestureList, data?.LastBidderAddr],
  );
  const donatedNFTs = (nftDonationsData ?? []) as DonatedNFTType[];
  const ethDonations = (ethDonationsRawData ?? []) as EthDonation[];
  const donatedERC20Tokens = (erc20DonationsData ?? []) as DonatedERC20[];

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
  const finalizationConfirmed = !endgame.isConfirmationPending;
  const activationDate = useHydrationSafeDateTime(activationTime, true, locale);

  const championList = useMemo(() => {
    if (!bidListData) return null;
    const champions = getEnduranceChampions(bidListData, 0, Math.floor(nowMs / 1000));
    return [...champions].sort((a, b) => b.chronoWarrior - a.chronoWarrior);
  }, [bidListData, nowMs]);

  const [curPage, setCurPage] = useState(1);
  const [donatedTokensTab, setDonatedTokensTab] = useState(0);
  const perPage = 12;

  if (isLoading) {
    return (
      <PageShell variant="data" backdrop="signature">
        {seoSummary}
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </PageShell>
    );
  }

  if (isError || !data) {
    return (
      <PageShell variant="data" backdrop="signature">
        {seoSummary}
        <ErrorState
          headingLevel={2}
          title={t('error.title')}
          message={t('error.message')}
          onRetry={() => window.location.reload()}
        />
      </PageShell>
    );
  }

  const hasStarted = data.TsRoundStart !== 0;
  const hasLastParticipant = data.LastBidderAddr !== zeroAddress;
  const isPreActivation = activationTime > nowMs / 1000;
  const isCountdownActive = hasLastParticipant && allocationTime > nowMs;
  const isPastDeadline = hasLastParticipant && allocationTime > 0 && allocationTime <= nowMs;
  // Only declare the cycle finished once the zero-cross is confirmed on-chain;
  // a last-second gesture may still have extended the deadline.
  const isConfirmingFinalization = isPastDeadline && !finalizationConfirmed;
  const isGesturesExhausted = isPastDeadline && finalizationConfirmed;
  const statusBadgeLabel = isPreActivation
    ? t('hero.status.openingSoon')
    : !hasLastParticipant
      ? t('hero.status.awaitingFirstGesture')
      : isGesturesExhausted
        ? t('hero.status.readyToFinalize')
        : t('hero.status.live');
  const primaryCtaLabel = isPreActivation
    ? t('hero.cta.viewHomeClock')
    : isGesturesExhausted
      ? t('hero.cta.finalizeCycle')
      : !hasLastParticipant
        ? t('hero.cta.makeFirstGesture')
        : t('hero.cta.makeGesture');
  // The gesture CTAs open the home Observatory at its gesture form; the clock
  // and finalize CTAs open its top, where the clock and the finalize action are.
  const primaryCtaHref = isPreActivation || isGesturesExhausted ? '/' : '/#make-gesture';

  const charityAmount =
    (Number(data.CosmicGameBalanceEth) || 0) * ((data.CharityPercentage ?? 0) / 100);

  return (
    <PageShell variant="data" backdrop="signature">
      {seoSummary}

      {/* ===== HERO SECTION ===== */}
      {/* No gradient-border-card (mask pseudo): Chrome/Skia PDF often drops nested content in that compositing path. */}
      <div className="relative mb-10 flex flex-col gap-8 overflow-hidden rounded-2xl border border-border bg-card p-5 print:overflow-visible sm:p-8">
        {/* Card title and status; the header above carries the cycle's figures. */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="type-section">{t('hero.title', { n: data.CurRoundNum })}</h2>
          <span
            data-testid="live-badge"
            className={
              isPreActivation
                ? 'inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary'
                : 'inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400'
            }
          >
            <span
              className={
                isPreActivation
                  ? 'h-1.5 w-1.5 rounded-full bg-primary animate-pulse'
                  : 'h-1.5 w-1.5 rounded-full bg-emerald-400 animate-live-dot'
              }
            />
            {statusBadgeLabel}
          </span>
        </div>

        {/* Pre-activation countdown */}
        {isPreActivation && (
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
              {t('hero.countdown.opensIn')}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {t('hero.countdown.opensAt', {
                n: data.CurRoundNum,
                date: activationDate,
              })}
            </p>
            <SmoothCountdown date={activationTime * 1000} renderer={Counter} />
          </div>
        )}

        {/* Countdown or Closed state */}
        {!isPreActivation && hasStarted && isCountdownActive && (
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
              {t('hero.countdown.finalizesIn')}
              <InfoTooltip content={t('hero.countdown.finalizesTooltip')} className="ml-1.5" />
            </p>
            <SmoothCountdown date={allocationTime} renderer={Counter} />
          </div>
        )}

        {!isPreActivation && hasStarted && isConfirmingFinalization && (
          <div className="text-center rounded-xl bg-primary/[0.06] p-5">
            <Spinner size="sm" className="mx-auto mb-2" />
            <p className="font-display text-lg font-bold text-primary">
              {t('hero.countdown.confirmingTitle')}
            </p>
            <p className="mt-1 text-sm text-primary/80">{t('hero.countdown.confirmingMessage')}</p>
          </div>
        )}

        {!isPreActivation && hasStarted && isGesturesExhausted && (
          <div className="text-center rounded-xl bg-primary/[0.06] p-5">
            <Zap className="mx-auto h-7 w-7 text-primary mb-2" />
            <p className="font-display text-lg font-bold text-primary">
              {t('hero.countdown.readyTitle')}
            </p>
            <p className="mt-1 text-sm text-primary/80">{t('hero.countdown.readyMessage')}</p>
          </div>
        )}

        {/* Special Allocation Leaders */}
        {hasLastParticipant && (
          <SpecialAllocationRecipients
            latestParticipantAddress={latestResolution.address}
            latestGesture={latestResolution.gesture}
            latestMessage={latestResolution.gesture?.Message ?? ''}
            showLastGesture
          />
        )}

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button asChild size="lg" className="font-semibold">
            <Link href={primaryCtaHref}>
              {primaryCtaLabel} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <AttachedNFTAllocationShowcase
        nfts={donatedNFTs}
        erc20Tokens={donatedERC20Tokens}
        cycleNumber={data.CurRoundNum}
        className="mb-12"
      />

      {/* ===== ENHANCED STAT CARDS ===== */}
      <motion.div
        custom={1}
        variants={sectionFade}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12"
      >
        <StatCard
          label={t('stats.stellarSelectionPool.label')}
          value={formatEthValue(data.RaffleAmountEth ?? 0, locale)}
          icon={<StellarSelectionIcon className="h-4 w-4" />}
          tooltip={t('stats.stellarSelectionPool.tooltip', {
            count: data.NumRaffleEthWinnersBidding ?? 0,
          })}
        />
        <StatCard
          label={t('stats.publicGoods.label')}
          value={formatEthValue(charityAmount, locale)}
          icon={<PublicGoodsIcon className="h-4 w-4" />}
          tooltip={t('stats.publicGoods.tooltip', { percent: data.CharityPercentage ?? 0 })}
        />
        <StatCard
          label={t('stats.contributedEth.label')}
          value={formatEthValue(data.CurRoundStats?.TotalDonatedAmountEth ?? 0, locale)}
          icon={<ContributionIcon className="h-4 w-4" />}
          tooltip={t('stats.contributedEth.tooltip')}
        />
        <StatCard
          label={t('stats.attachedNfts.label')}
          value={data.CurRoundStats?.TotalDonatedNFTs ?? 0}
          icon={<ImageIcon className="h-4 w-4" />}
          tooltip={t('stats.attachedNfts.tooltip')}
        />
      </motion.div>

      {/* ===== ROUND INFO SECTIONS ===== */}
      <motion.div custom={2} variants={sectionFade} initial="hidden" animate="visible">
        <RoundInfoSection
          data={data}
          curGestureList={curGestureList}
          championList={championList}
          ethDonations={ethDonations}
          donatedNFTs={donatedNFTs}
          donatedERC20Tokens={donatedERC20Tokens}
          donatedTokensTab={donatedTokensTab}
          onTabChange={(_e, v) => setDonatedTokensTab(v)}
          curPage={curPage}
          setCurPage={setCurPage}
          perPage={perPage}
        />
      </motion.div>
    </PageShell>
  );
};

export default CurrentRoundPage;
