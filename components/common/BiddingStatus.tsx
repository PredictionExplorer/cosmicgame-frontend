import { useEffect, useState, useMemo } from 'react';
import { formatEther, zeroAddress } from 'viem';
import Countdown from 'react-countdown';
import { Timer, Trophy, Coins, User, MessageSquare } from 'lucide-react';

import { calculateTimeDiff, convertTimestampToDateTime, shortenHex } from '@/utils';

import { StatCard } from '@/components/ui/stat-card';
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

export const BiddingStatus = ({
  data,
  loading,
  activationTime,
  curBidList,
  ethBidInfo,
  prizeTime,
}: BiddingStatusProps) => {
  const [roundStarted, setRoundStarted] = useState('');
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

    return () => {
      clearInterval(interval);
    };
  }, [data, curBidList, offset]);

  return (
    <>
      {!loading && (
        <div className="space-y-6">
          {activationTime > Date.now() / 1000 && data ? (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Round {data.CurRoundNum} becomes active at{' '}
                {convertTimestampToDateTime(activationTime, true)}
              </p>
              <Countdown key={3} date={activationTime * 1000} renderer={Counter} />
            </div>
          ) : data && data.TsRoundStart !== 0 ? (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Timer className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-display text-2xl font-bold">Round #{data.CurRoundNum}</h2>
                    {roundStarted !== '' && (
                      <p className="text-xs text-muted-foreground">Started {roundStarted} ago</p>
                    )}
                  </div>
                </div>
                <a
                  href="/changed-parameters"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Parameters
                </a>
              </div>

              {data.LastBidderAddr !== zeroAddress &&
                (prizeTime > Date.now() ? (
                  <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5 text-center">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
                      Prize Claim In
                    </p>
                    <Countdown key={0} date={prizeTime} renderer={Counter} />
                  </div>
                ) : (
                  <div className="rounded-xl border border-primary/30 bg-primary/[0.06] p-5 text-center">
                    <h5 className="text-xl font-bold text-primary">Bids Exhausted!</h5>
                    <p className="mt-1 text-sm text-primary/80">
                      Waiting for the winner to claim the prize.
                    </p>
                  </div>
                ))}
            </>
          ) : (
            <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-6 text-center">
              {data && data.CurRoundNum > 0 ? (
                <h4 className="font-display text-2xl font-bold">Round {data.CurRoundNum}</h4>
              ) : (
                <h4 className="font-display text-2xl font-bold">Start the Game</h4>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                Dutch auction for the first bid in ETH has started. Make your bid.
              </p>
            </div>
          )}

          {activationTime < Date.now() / 1000 && (
            <>
              <StatCard
                label="Main Prize"
                value={`${(data?.PrizeAmountEth ?? 0).toFixed(4)} ETH`}
                icon={<Trophy className="h-5 w-5" />}
                gradient
                tooltip="The amount you win if you're the last bidder when time runs out"
              />

              {data && data.LastBidderAddr !== zeroAddress && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <StatCard
                    label="ETH Bid"
                    value={`${(ethBidInfo?.ETHPrice ?? 0).toFixed(5)} ETH`}
                    icon={<Coins className="h-4 w-4" />}
                  />
                  <StatCard
                    label="RandomWalk Bid"
                    value={`${((ethBidInfo?.ETHPrice ?? 0) / 2).toFixed(5)} ETH`}
                    tooltip="50% discount when using a RandomWalk NFT"
                  />
                  <StatCard
                    label="CST Bid"
                    value={
                      cstBidData?.CSTPrice > 0 ? `${cstBidData.CSTPrice.toFixed(4)} CST` : 'FREE'
                    }
                  />
                </div>
              )}

              {data && data.LastBidderAddr !== zeroAddress && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                      <User className="h-4 w-4 text-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Last Bidder
                      </p>
                      <a
                        href={`/user/${data.LastBidderAddr}`}
                        className="text-sm font-mono text-white hover:text-primary transition-colors truncate block"
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
                        {curBidList[0]?.Message}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {curBidList.length > 0 && winProbability && data && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Your Chances
                  </p>
                  {data.LastBidderAddr === account ? (
                    <p className="text-sm text-emerald-400">
                      You have 100% chance of winning the main prize (
                      {(data.PrizeAmountEth ?? 0).toFixed(4)} ETH)
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Not the last bidder &mdash; you can win if unclaimed after 24h.
                    </p>
                  )}
                  <div className="flex gap-4 text-sm">
                    <span>
                      Raffle:{' '}
                      <span className="font-medium text-primary">
                        {winProbability.raffle.toFixed(2)}%
                      </span>
                    </span>
                    <span>
                      NFT:{' '}
                      <span className="font-medium text-accent">
                        {winProbability.nft.toFixed(2)}%
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};
