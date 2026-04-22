'use client';

import { useEffect, useState, useMemo } from 'react';
import { formatEther, zeroAddress } from 'viem';
import Countdown from 'react-countdown';
import { Trophy, Coins, User, MessageSquare, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

import { calculateTimeDiff, convertTimestampToDateTime } from '@/utils';

import { cn } from '@/lib/utils';
import { StatCard } from '@/components/ui/stat-card';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { useActiveWeb3React } from '@/hooks/web3';
import type { DashboardInfo, BidInfo } from '@/services/api';
import { useCurrentTime, useUserInfo, useCTPrice } from '@/hooks/useApiQuery';

import Counter from './Counter';

interface EthBidInfo {
  ETHPrice: number;
  AuctionDuration?: number;
  SecondsElapsed?: number;
}

interface BiddingStatusData extends DashboardInfo {
  PrizeAmountEth?: number;
  RaffleAmountEth?: number;
}

interface BiddingStatusProps {
  data: BiddingStatusData | null;
  loading: boolean;
  activationTime: number;
  curBidList: BidInfo[];
  ethBidInfo: EthBidInfo | null;
  prizeTime: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: 'easeOut' as const },
  }),
};

export const BiddingStatus = ({
  data,
  loading,
  activationTime,
  curBidList,
  ethBidInfo,
  prizeTime,
}: BiddingStatusProps) => {
  const [_roundStarted, setRoundStarted] = useState('');
  const [lastBidderElapsed, setLastBidderElapsed] = useState('');

  const { account } = useActiveWeb3React();
  const { data: currentTimeRaw } = useCurrentTime();
  const { data: userInfoRaw } = useUserInfo(account);
  const { data: ctPriceRaw } = useCTPrice();

  const offset = useMemo(() => {
    if (currentTimeRaw == null) return 0;
    return currentTimeRaw * 1000 - Date.now();
  }, [currentTimeRaw]);

  const winProbability = useMemo(() => {
    if (!account || !data || !curBidList.length) return null;
    const Bids = (userInfoRaw?.Bids as BidInfo[] | undefined) || [];
    if (!Bids.length) return null;
    const curRoundBids = Bids.filter((bid) => bid.RoundNum === data.CurRoundNum);
    const pSelect = (total: number, chosen: number, yours: number) =>
      1 - Math.pow((total - yours) / total, chosen);
    return {
      raffle:
        pSelect(curBidList.length, data.NumRaffleEthWinnersBidding ?? 1, curRoundBids.length) * 100,
      nft:
        pSelect(curBidList.length, data.NumRaffleNFTWinnersBidding ?? 1, curRoundBids.length) * 100,
    };
  }, [account, data, userInfoRaw, curBidList]);

  const cstBidData = useMemo(() => {
    if (!ctPriceRaw) return { AuctionDuration: 0, CSTPrice: 0, SecondsElapsed: 0 };
    return {
      AuctionDuration: parseInt(String(ctPriceRaw.AuctionDuration)),
      CSTPrice: parseFloat(formatEther(BigInt(ctPriceRaw.CSTPrice))),
      SecondsElapsed: parseInt(String(ctPriceRaw.SecondsElapsed)),
    };
  }, [ctPriceRaw]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (data != null) {
        setRoundStarted(calculateTimeDiff(data.TsRoundStart - offset / 1000));
      }
      if (curBidList.length) {
        const lastBidTime = curBidList[0]!.TimeStamp;
        setLastBidderElapsed(calculateTimeDiff(lastBidTime - offset / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [data, curBidList, offset]);

  if (loading) return null;

  return (
    <div className="space-y-5">
      {/* Pre-activation countdown */}
      {activationTime > Date.now() / 1000 && data ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Round {data.CurRoundNum} becomes active at{' '}
            {convertTimestampToDateTime(activationTime, true)}
          </p>
          <div className="mt-4">
            <Countdown key={3} date={activationTime * 1000} renderer={Counter} />
          </div>
        </motion.div>
      ) : data && data.TsRoundStart !== 0 ? (
        <>
          {/* Countdown / Exhausted */}
          {data.LastBidderAddr !== zeroAddress &&
            (prizeTime > Date.now() ? (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="gradient-border-card gradient-border-card-accent rounded-2xl bg-gradient-to-b from-primary/[0.06] to-transparent p-6 text-center"
              >
                <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3">
                  Round ends in
                  <InfoTooltip
                    content="When this timer hits zero, the last bidder wins the main prize. Each new bid resets the timer."
                    className="ml-1.5"
                  />
                </p>
                <Countdown key={0} date={prizeTime} renderer={Counter} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="gradient-border-card rounded-2xl bg-primary/[0.06] p-6 text-center animate-pulse-glow"
              >
                <Zap className="mx-auto h-8 w-8 text-primary mb-2" />
                <h5 className="font-display text-xl font-bold text-primary">Bids Exhausted!</h5>
                <p className="mt-1 text-sm text-primary/80">
                  Waiting for the winner to claim the prize.
                </p>
              </motion.div>
            ))}

          {/* Prize + bid prices row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
              <StatCard
                label="Main Prize"
                value={`${(data?.PrizeAmountEth ?? 0).toFixed(4)} ETH`}
                icon={<Trophy className="h-5 w-5" />}
                gradient
                tooltip="The amount you win if you're the last bidder when time runs out"
              />
            </motion.div>

            {data.LastBidderAddr !== zeroAddress && (
              <>
                <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible">
                  <StatCard
                    label="ETH Bid"
                    value={`${(ethBidInfo?.ETHPrice ?? 0).toFixed(5)} ETH`}
                    icon={<Coins className="h-4 w-4" />}
                    tooltip="Current price to place an ETH bid"
                  />
                </motion.div>
                <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
                  <StatCard
                    label="RandomWalk Bid"
                    value={`${((ethBidInfo?.ETHPrice ?? 0) / 2).toFixed(5)} ETH`}
                    tooltip="50% discount when using a RandomWalk NFT to bid"
                  />
                </motion.div>
                <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
                  <StatCard
                    label="CST Bid"
                    value={
                      cstBidData?.CSTPrice > 0 ? `${cstBidData.CSTPrice.toFixed(4)} CST` : 'FREE'
                    }
                    tooltip="Bid using Cosmic Token. Price decreases over time via Dutch auction -- can become free!"
                  />
                </motion.div>
              </>
            )}
          </div>

          {/* Last bidder */}
          {data.LastBidderAddr !== zeroAddress && (
            <motion.div
              custom={4}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className={cn(
                'rounded-xl border p-4 transition-colors',
                data.LastBidderAddr === account
                  ? 'border-emerald-500/30 bg-emerald-500/[0.04]'
                  : 'border-white/[0.06] bg-white/[0.03]',
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full',
                    data.LastBidderAddr === account ? 'bg-emerald-500/15' : 'bg-accent/10',
                  )}
                >
                  <User
                    className={cn(
                      'h-4 w-4',
                      data.LastBidderAddr === account ? 'text-emerald-400' : 'text-accent',
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Last Bidder
                    </p>
                    {data.LastBidderAddr === account && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
                        You
                      </span>
                    )}
                    <InfoTooltip content="The last bidder when the countdown reaches zero wins the main ETH prize and a COSMIC NFT." />
                  </div>
                  <a
                    href={`/user/${data.LastBidderAddr}`}
                    className="mt-0.5 block break-all text-sm font-mono text-white transition-colors hover:text-primary"
                  >
                    {data.LastBidderAddr}
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
            </motion.div>
          )}

          {/* Win probability */}
          {curBidList.length > 0 && winProbability && data && (
            <motion.div
              custom={5}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-3"
            >
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-primary/70" />
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Your Chances
                </p>
                <InfoTooltip content="Your probability of winning raffle prizes based on the number of bids you've placed this round." />
              </div>
              {data.LastBidderAddr === account ? (
                <p className="text-sm font-medium text-emerald-400">
                  You&apos;re the last bidder! You win the main prize (
                  {(data.PrizeAmountEth ?? 0).toFixed(4)} ETH) if no one else bids.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Not the last bidder &mdash; bid again to take the lead, or win via raffle.
                </p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">ETH Raffle</span>
                    <span className="font-medium text-primary">
                      {winProbability.raffle.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(winProbability.raffle, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">NFT Raffle</span>
                    <span className="font-medium text-accent">
                      {winProbability.nft.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(winProbability.nft, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent/60"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="gradient-border-card rounded-2xl bg-primary/[0.04] p-8 text-center"
        >
          {data && data.CurRoundNum > 0 ? (
            <h4 className="font-display text-2xl font-bold">Round {data.CurRoundNum}</h4>
          ) : (
            <h4 className="font-display text-2xl font-bold">Start the Game</h4>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            Dutch auction for the first bid in ETH has started. Make your bid.
          </p>
        </motion.div>
      )}
    </div>
  );
};
