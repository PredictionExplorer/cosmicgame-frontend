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
} from '@/utils';

import { MainWrapper } from '@/components/styled';
import { StatCard } from '@/components/ui/stat-card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { Spinner } from '@/components/ui/spinner';
import { ErrorState } from '@/components/ui/error-state';
import { Button } from '@/components/ui/button';
import { RoundInfoSection } from '@/components/home/RoundInfoSection';
import Counter from '@/components/common/Counter';
import { SpecialPrizeWinners } from '@/components/tables/SpecialPrizeWinners';
import type { DonatedNFT as DonatedNFTType } from '@/services/api/types';
import {
  useDashboardInfo,
  useBidListByRound,
  useDonationsNFTByRound,
  useDonationsCGWithInfoByRound,
  useDonationsERC20ByRound,
  usePrizeTime,
  useCurrentTime,
} from '@/hooks/useApiQuery';

type EthDonation = import('@/components/tables/EthDonationTable').EthDonation;
type DonatedERC20 = import('@/components/donations/DonatedERC20Table').DonatedERC20Token;

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
  const { data: prizeTimeRaw } = usePrizeTime();
  const { data: currentTimeRaw } = useCurrentTime();
  const round = dashboardData?.CurRoundNum ?? -1;

  const { data: bidListData } = useBidListByRound(round, 'desc');
  const { data: nftDonationsData } = useDonationsNFTByRound(round);
  const { data: ethDonationsRawData } = useDonationsCGWithInfoByRound(round);
  const { data: erc20DonationsData } = useDonationsERC20ByRound(round);

  const data = dashboardData ?? null;
  const curBidList = useMemo(() => bidListData ?? [], [bidListData]);
  const donatedNFTs = (nftDonationsData ?? []) as DonatedNFTType[];
  const ethDonations = (ethDonationsRawData ?? []) as EthDonation[];
  const donatedERC20Tokens = (erc20DonationsData ?? []) as DonatedERC20[];

  const [mountTime] = useState(() => Date.now());

  const prizeTime = useMemo(() => {
    if (prizeTimeRaw == null || currentTimeRaw == null) return 0;
    const diff = currentTimeRaw * 1000 - mountTime;
    return prizeTimeRaw * 1000 - diff;
  }, [prizeTimeRaw, currentTimeRaw, mountTime]);

  const championList = useMemo(() => {
    if (!bidListData) return null;
    const champions = getEnduranceChampions(bidListData);
    return [...champions].sort((a, b) => b.chronoWarrior - a.chronoWarrior);
  }, [bidListData]);

  const [lastBidderElapsed, setLastBidderElapsed] = useState('');

  const offset = useMemo(() => {
    if (currentTimeRaw == null) return 0;
    return currentTimeRaw * 1000 - mountTime;
  }, [currentTimeRaw, mountTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (curBidList.length) {
        const lastBidTime = curBidList[0]!.TimeStamp;
        setLastBidderElapsed(calculateTimeDiff(lastBidTime - offset / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [curBidList, offset]);

  const [curPage, setCurPage] = useState(1);
  const [donatedTokensTab, setDonatedTokensTab] = useState(0);
  const perPage = 12;

  if (isLoading) {
    return (
      <MainWrapper>
        <div className="flex items-center justify-center py-32">
          <Spinner size="lg" />
        </div>
      </MainWrapper>
    );
  }

  if (isError || !data) {
    return (
      <MainWrapper>
        <ErrorState
          title="Failed to load round data"
          message="Please refresh the page to try again."
          onRetry={() => window.location.reload()}
        />
      </MainWrapper>
    );
  }

  const roundStarted = data.TsRoundStart
    ? convertTimestampToDateTime(data.TsRoundStart)
    : 'Not started';

  const hasStarted = data.TsRoundStart !== 0;
  const hasLastBidder = data.LastBidderAddr !== zeroAddress;
  const isCountdownActive = hasLastBidder && prizeTime > mountTime;
  const isBidsExhausted = hasLastBidder && prizeTime > 0 && prizeTime <= mountTime;

  const charityAmount =
    (Number(data.CosmicGameBalanceEth) || 0) * ((data.CharityPercentage ?? 0) / 100);

  return (
    <MainWrapper>
      {/* Back navigation */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Game
      </Link>

      {/* ===== HERO SECTION ===== */}
      {/* No gradient-border-card (mask pseudo): Chrome/Skia PDF often drops nested content in that compositing path. */}
      <div className="flex flex-col gap-6 rounded-2xl border border-white/[0.1] bg-gradient-to-b from-primary/[0.06] to-transparent p-6 sm:p-8 mb-8 print:overflow-visible">
        {/* Header row: LIVE badge + round info */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Radio className="h-5 w-5 text-primary" />
              <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 animate-live-dot" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                Round #{data.CurRoundNum}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Started {roundStarted} &bull; {data.CurNumBids} bid
                {data.CurNumBids !== 1 ? 's' : ''} placed
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

        {/* Countdown or Exhausted state */}
        {hasStarted && isCountdownActive && (
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
              Round ends in
              <InfoTooltip
                content="When this timer hits zero, the last bidder wins the main prize. Each new bid resets the timer."
                className="ml-1.5"
              />
            </p>
            <Countdown date={prizeTime} renderer={Counter} />
          </div>
        )}

        {hasStarted && isBidsExhausted && (
          <div className="text-center rounded-xl bg-primary/[0.06] p-5 animate-pulse-glow">
            <Zap className="mx-auto h-7 w-7 text-primary mb-2" />
            <p className="font-display text-lg font-bold text-primary">Bids Exhausted!</p>
            <p className="mt-1 text-sm text-primary/80">
              Waiting for the winner to claim the prize.
            </p>
          </div>
        )}

        {/* Last bidder card */}
        {hasLastBidder && (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10">
                <User className="h-4 w-4 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Last Bidder — Current Leader
                  </p>
                  <InfoTooltip content="The last bidder when the countdown reaches zero wins the main ETH prize and a COSMIC NFT." />
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
            {!!(curBidList.length && curBidList[0]?.Message !== '') && (
              <div className="mt-3 flex items-start gap-2 rounded-lg bg-white/[0.03] p-3">
                <MessageSquare className="h-3.5 w-3.5 mt-0.5 text-muted-foreground/50 shrink-0" />
                <p className="break-words text-sm text-amber-300/90">
                  &ldquo;{curBidList[0]?.Message}&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {/* Special Prize Leaders */}
        {hasLastBidder && <SpecialPrizeWinners />}

        {/* CTA Button */}
        <div className="flex justify-center">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-[#15BFFD] to-[#9C37FD] hover:opacity-90 text-white border-0 font-semibold"
          >
            <Link href="/">
              Place a Bid <ArrowRight className="ml-2 h-4 w-4" />
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
          label="Total Bids"
          value={data.CurNumBids}
          icon={<Hash className="h-4 w-4" />}
          tooltip="Total bids placed in this round. Each bid is also a raffle ticket."
        />
        <StatCard
          label="Prize Pool"
          value={formatEthValue(data.PrizeAmountEth ?? 0)}
          icon={<Trophy className="h-4 w-4" />}
          tooltip="ETH prize awarded to the last bidder when the countdown reaches zero."
          gradient
        />
        <StatCard
          label="Raffle Pool"
          value={formatEthValue(data.RaffleAmountEth ?? 0)}
          icon={<Shuffle className="h-4 w-4" />}
          tooltip={`ETH split among ${data.NumRaffleEthWinnersBidding ?? 0} random raffle winners at round end.`}
        />
        <StatCard
          label="Charity"
          value={formatEthValue(charityAmount)}
          icon={<Heart className="h-4 w-4" />}
          tooltip={`${data.CharityPercentage ?? 0}% of the prize pool is donated to Ethereum Protocol Guild each round.`}
        />
        <StatCard
          label="Donated ETH"
          value={formatEthValue(data.CurRoundStats?.TotalDonatedAmountEth ?? 0)}
          icon={<Coins className="h-4 w-4" />}
          tooltip="Direct ETH donations from the community this round."
        />
        <StatCard
          label="Donated NFTs"
          value={data.CurRoundStats?.TotalDonatedNFTs ?? 0}
          icon={<ImageIcon className="h-4 w-4" />}
          tooltip="NFTs donated to the prize pool by the community."
        />
      </motion.div>

      {/* ===== ROUND INFO SECTIONS ===== */}
      <motion.div custom={2} variants={sectionFade} initial="hidden" animate="visible">
        <RoundInfoSection
          data={data}
          curBidList={curBidList}
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
    </MainWrapper>
  );
};

export default CurrentRoundPage;
