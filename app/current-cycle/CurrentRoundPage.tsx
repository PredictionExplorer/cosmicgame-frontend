'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import Countdown from 'react-countdown';
import { zeroAddress } from 'viem';
import {
  ArrowLeft,
  ArrowRight,
  Hash,
  Trophy,
  Shuffle,
  Heart,
  Coins,
  ImageIcon,
  Radio,
  User,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

import {
  getEnduranceChampions,
  formatEthValue,
  convertTimestampToDateTime,
  calculateTimeDiff,
  shortenHex,
  getStableClientTargetTime,
} from '@/utils';

import { PageShell } from '@/components/ui/page-shell';
import { StatCard } from '@/components/ui/stat-card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import { RoundInfoSection } from '@/components/home/RoundInfoSection';
import Counter from '@/components/common/Counter';
import { SpecialAllocationRecipients } from '@/components/tables/SpecialAllocationRecipients';
import type { AttachedNFT as DonatedNFTType } from '@/services/api/types';
import {
  useDashboardInfo,
  useGestureListByCycle,
  useDonationsNFTByRound,
  useDonationsCGWithInfoByRound,
  useDonationsERC20ByRound,
  useAllocationTime,
  useCurrentTime,
} from '@/hooks/useApiQuery';
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

const CurrentRoundPage = () => {
  const { data: dashboardData, isLoading, isError } = useDashboardInfo();
  const { data: prizeTimeRaw } = useAllocationTime();
  const { data: currentTimeRaw, dataUpdatedAt: currentTimeUpdatedAt } = useCurrentTime();
  const round = dashboardData?.CurRoundNum ?? -1;

  const { data: bidListData } = useGestureListByCycle(round, 'desc');
  const { data: nftDonationsData } = useDonationsNFTByRound(round);
  const { data: ethDonationsRawData } = useDonationsCGWithInfoByRound(round);
  const { data: erc20DonationsData } = useDonationsERC20ByRound(round);

  const data = dashboardData ?? null;
  const curGestureList = useMemo(() => bidListData ?? [], [bidListData]);
  const donatedNFTs = (nftDonationsData ?? []) as DonatedNFTType[];
  const ethDonations = (ethDonationsRawData ?? []) as EthDonation[];
  const donatedERC20Tokens = (erc20DonationsData ?? []) as DonatedERC20[];

  const [mountTime] = useState(() => Date.now());
  const nowMs = useNow(1000);

  const allocationTime = useMemo(() => {
    return getStableClientTargetTime({
      targetServerTimeSec: prizeTimeRaw,
      currentServerTimeSec: currentTimeRaw,
      currentServerTimeUpdatedAtMs: currentTimeUpdatedAt,
      fallbackNowMs: mountTime,
    });
  }, [prizeTimeRaw, currentTimeRaw, currentTimeUpdatedAt, mountTime]);

  const championList = useMemo(() => {
    if (!bidListData) return null;
    const champions = getEnduranceChampions(bidListData, 0, Math.floor(nowMs / 1000));
    return [...champions].sort((a, b) => b.chronoWarrior - a.chronoWarrior);
  }, [bidListData, nowMs]);

  const [lastBidderElapsed, setLastBidderElapsed] = useState('');

  const offset = useMemo(() => {
    if (currentTimeRaw == null) return 0;
    return currentTimeRaw * 1000 - mountTime;
  }, [currentTimeRaw, mountTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (curGestureList.length) {
        const lastGestureTime = curGestureList[0]!.TimeStamp;
        setLastBidderElapsed(calculateTimeDiff(lastGestureTime - offset / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [curGestureList, offset]);

  const [curPage, setCurPage] = useState(1);
  const [donatedTokensTab, setDonatedTokensTab] = useState(0);
  const perPage = 12;

  if (isLoading) {
    return (
      <PageShell variant="data" backdrop="signature">
        <div className="flex items-center justify-center py-32">
          <Spinner size="lg" />
        </div>
      </PageShell>
    );
  }

  if (isError || !data) {
    return (
      <PageShell variant="data" backdrop="signature">
        <ErrorState
          title="Failed to load cycle data"
          message="Please refresh the page to try again."
          onRetry={() => window.location.reload()}
        />
      </PageShell>
    );
  }

  const roundStarted = data.TsRoundStart
    ? convertTimestampToDateTime(data.TsRoundStart)
    : 'Not started';

  const hasStarted = data.TsRoundStart !== 0;
  const hasLastParticipant = data.LastBidderAddr !== zeroAddress;
  const isCountdownActive = hasLastParticipant && allocationTime > nowMs;
  const isGesturesExhausted = hasLastParticipant && allocationTime > 0 && allocationTime <= nowMs;

  const charityAmount =
    (Number(data.CosmicGameBalanceEth) || 0) * ((data.CharityPercentage ?? 0) / 100);

  return (
    <PageShell variant="data" backdrop="signature">
      {/* Back navigation */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Home
      </Link>

      {/* ===== HERO SECTION ===== */}
      {/* No gradient-border-card (mask pseudo): Chrome/Skia PDF often drops nested content in that compositing path. */}
      <div className="relative mb-8 flex flex-col gap-6 overflow-hidden rounded-2xl border border-white/[0.1] bg-[linear-gradient(135deg,rgb(var(--aurora-cyan-rgb)/0.11),rgb(var(--nebula-violet-rgb)/0.08)_46%,transparent)] p-6 shadow-[0_24px_100px_-72px_rgb(var(--aurora-cyan-rgb)/0.9)] backdrop-blur-sm print:overflow-visible sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, rgb(var(--aurora-cyan-rgb) / 0.22), rgb(var(--nebula-violet-rgb) / 0.18) 48%, transparent 70%)',
          }}
        />
        {/* Header row: LIVE badge + round info */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Radio className="h-5 w-5 text-primary" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-live-dot" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Cycle #{data.CurRoundNum}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Opened {roundStarted} &bull; {data.CurNumBids} gesture
                {data.CurNumBids !== 1 ? 's' : ''} made
              </p>
            </div>
          </div>
          <span
            data-testid="live-badge"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-400"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-live-dot" />
            Live
          </span>
        </div>

        {/* Countdown or Closed state */}
        {hasStarted && isCountdownActive && (
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
              Cycle finalizes in
              <InfoTooltip
                content="When this timer hits zero, the participant who made the Final Gesture may finalize the cycle and retrieve the Signature Allocation. Each new gesture extends the timer."
                className="ml-1.5"
              />
            </p>
            <Countdown date={allocationTime} renderer={Counter} intervalDelay={100} precision={1} />
          </div>
        )}

        {hasStarted && isGesturesExhausted && (
          <div className="text-center rounded-xl bg-primary/[0.06] p-5 animate-pulse-glow">
            <Zap className="mx-auto h-7 w-7 text-primary mb-2" />
            <p className="font-display text-lg font-bold text-primary">Cycle Closed</p>
            <p className="mt-1 text-sm text-primary/80">Waiting for the cycle to finalize.</p>
          </div>
        )}

        {/* Last participant card */}
        {hasLastParticipant && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10">
                <User className="h-4 w-4 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Last Participant &mdash; Current Leader
                  </p>
                  <InfoTooltip content="The participant who made the Final Gesture when the countdown reaches zero may retrieve the Signature Allocation: ETH, 1,000 CST, and a Cosmic Signature NFT." />
                </div>
                <a
                  href={`/user/${data.LastBidderAddr}`}
                  className="mt-0.5 text-sm font-mono text-white hover:text-primary transition-colors truncate block"
                >
                  {shortenHex(data.LastBidderAddr, 8)}
                </a>
              </div>
              {lastBidderElapsed !== '' && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {lastBidderElapsed} ago
                </span>
              )}
            </div>
            {!!(curGestureList.length && curGestureList[0]?.Message !== '') && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-white/[0.03] p-3">
                <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/50 shrink-0" />
                <p className="break-words text-sm text-amber-300/90">
                  &ldquo;{curGestureList[0]?.Message}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {/* Special Allocation Leaders */}
        {hasLastParticipant && <SpecialAllocationRecipients />}

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-[#15BFFD] to-[#9C37FD] hover:opacity-90 text-white border-0 font-semibold"
          >
            <Link href="/">
              Make a Gesture <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* ===== ENHANCED STAT CARDS ===== */}
      <motion.div
        custom={1}
        variants={sectionFade}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-12"
      >
        <StatCard
          label="Total Gestures"
          value={data.CurNumBids}
          icon={<Hash className="h-4 w-4" />}
          tooltip="Total gestures made in this cycle. Each gesture is also a Stellar Selection entry."
        />
        <StatCard
          label="Cycle Reserve"
          value={formatEthValue(data.PrizeAmountEth ?? 0)}
          icon={<Trophy className="h-4 w-4" />}
          tooltip="ETH portion of the Signature Allocation retrieved by the participant who made the Final Gesture. The recipient also receives 1,000 CST and a Cosmic Signature NFT."
          gradient
        />
        <StatCard
          label="Stellar Selection Pool"
          value={formatEthValue(data.RaffleAmountEth ?? 0)}
          icon={<Shuffle className="h-4 w-4" />}
          tooltip={`ETH split across ${data.NumRaffleEthWinnersBidding ?? 0} randomly selected participants when the cycle finalizes.`}
        />
        <StatCard
          label="Public Goods"
          value={formatEthValue(charityAmount)}
          icon={<Heart className="h-4 w-4" />}
          tooltip={`${data.CharityPercentage ?? 0}% of the Cycle Reserve is forwarded to Protocol Guild each cycle.`}
        />
        <StatCard
          label="Contributed ETH"
          value={formatEthValue(data.CurRoundStats?.TotalDonatedAmountEth ?? 0)}
          icon={<Coins className="h-4 w-4" />}
          tooltip="Direct ETH contributions from the community this cycle."
        />
        <StatCard
          label="Attached NFTs"
          value={data.CurRoundStats?.TotalDonatedNFTs ?? 0}
          icon={<ImageIcon className="h-4 w-4" />}
          tooltip="NFTs attached to gestures by the community this cycle."
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
