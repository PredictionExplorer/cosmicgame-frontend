import { useEffect, useState, useMemo, type ReactNode } from 'react';
import { formatEther, zeroAddress } from 'viem';
import Countdown from 'react-countdown';

import { calculateTimeDiff, convertTimestampToDateTime } from '@/utils';

import { GradientText } from '@/components/styled';
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
        <>
          {activationTime > Date.now() / 1000 && data ? (
            <div className="mb-8">
              <p className="text-center text-base font-normal">
                Round {data.CurRoundNum} becomes active at{' '}
                {convertTimestampToDateTime(activationTime, true)}
              </p>
              <Countdown
                key={3}
                date={activationTime * 1000}
                renderer={Counter as unknown as (...args: unknown[]) => ReactNode}
              />
            </div>
          ) : data && data.TsRoundStart !== 0 ? (
            <div className="mb-8 grid grid-cols-12 items-center gap-4">
              <div className="col-span-12 sm:col-span-4">
                <h5 className="text-xl font-semibold">Round #{data.CurRoundNum}</h5>
              </div>
              <div className="col-span-12 w-full sm:col-span-8">
                {data &&
                  data.LastBidderAddr !== zeroAddress &&
                  (prizeTime > Date.now() ? (
                    <>
                      <p className="text-center text-base font-normal">Finishes In</p>
                      <Countdown
                        key={0}
                        date={prizeTime}
                        renderer={Counter as unknown as (...args: unknown[]) => ReactNode}
                      />
                    </>
                  ) : (
                    <>
                      <h5 className="text-xl font-semibold text-primary">Bids exhausted!</h5>
                      <p className="text-sm text-primary">
                        Waiting for the winner to claim the prize.
                      </p>
                    </>
                  ))}
                {roundStarted !== '' && (
                  <p className="mt-2">(Round was started {roundStarted} ago.)</p>
                )}
                <a href="/changed-parameters" className="text-inherit">
                  Changed Parameters
                </a>
              </div>
            </div>
          ) : (
            <>
              {data && data.CurRoundNum > 0 ? (
                <h4 className="mb-4 text-2xl font-semibold">Round {data.CurRoundNum} started</h4>
              ) : (
                <p className="text-base">Start the game with your first bid!</p>
              )}
              <p className="mb-4 mt-4 text-base">
                Dutch auction for the first bid in ETH has started. Make your bid.
              </p>
            </>
          )}
          {data && data.LastBidderAddr !== zeroAddress && (
            <div className="mb-4 grid grid-cols-12 items-center gap-4">
              <div className="col-span-12 sm:col-span-3 md:col-span-4">
                <p className="text-base">Bid Price</p>
              </div>
              <div className="col-span-8 sm:col-span-5 md:col-span-8">
                <div className="mb-2 flex justify-between">
                  <p>Using Ether</p>
                  <p>{(ethBidInfo?.ETHPrice ?? 0).toFixed(5)} ETH</p>
                </div>
                <div className="mb-2 flex justify-between">
                  <p>Using RandomWalk</p>
                  <p>{((ethBidInfo?.ETHPrice ?? 0) / 2).toFixed(5)} ETH</p>
                </div>
                <div className="mb-2 flex justify-between">
                  <p>Using CST</p>
                  {cstBidData?.CSTPrice > 0 ? (
                    <p>{cstBidData?.CSTPrice.toFixed(5)} CST</p>
                  ) : (
                    <p className="text-[#ff0]">FREE</p>
                  )}
                </div>
              </div>
            </div>
          )}
          {activationTime < Date.now() / 1000 && (
            <>
              <div className="mb-4 grid grid-cols-12 items-center gap-4">
                <div className="col-span-12 sm:col-span-4">
                  <p className="text-base">Main Prize Reward</p>
                </div>
                <div className="col-span-12 sm:col-span-8">
                  <GradientText className="inline text-lg font-medium">
                    {(data?.PrizeAmountEth ?? 0).toFixed(4)} ETH
                  </GradientText>
                </div>
              </div>
              <div className="mb-4 grid grid-cols-12 items-center gap-4">
                <div className="col-span-12 sm:col-span-4">
                  <p className="text-base">Last Bidder Address</p>
                </div>
                <div className="col-span-12 sm:col-span-8">
                  <p>
                    {data && data.LastBidderAddr === zeroAddress ? (
                      'There is no bidder yet.'
                    ) : (
                      <>
                        <a
                          href={`/user/${data!.LastBidderAddr}`}
                          className="break-all text-white [font-size:inherit]"
                        >
                          {data!.LastBidderAddr}
                        </a>{' '}
                        {lastBidderElapsed !== '' && <>({lastBidderElapsed} Elapsed)</>}
                      </>
                    )}
                  </p>
                </div>
              </div>
              {!!(curBidList.length && curBidList[0]?.Message !== '') && (
                <div className="mb-4 grid grid-cols-12 items-center gap-4">
                  <div className="col-span-12 sm:col-span-4">
                    <p className="text-base">Last Bidder Message</p>
                  </div>
                  <div className="col-span-12 sm:col-span-8">
                    <p className="break-words text-[#ff0]">{curBidList[0]?.Message}</p>
                  </div>
                </div>
              )}
              {curBidList.length > 0 && winProbability && data && (
                <>
                  <p className="mt-8">
                    {data.LastBidderAddr === account
                      ? `You have 100.00% chance of winning the main prize (${(
                          data.PrizeAmountEth ?? 0
                        ).toFixed(4)}ETH).`
                      : "You're not the last bidder, so you can win the main prize in 24 hours if the last bidder doesn't take it."}
                  </p>
                  <p>
                    You have {winProbability.raffle.toFixed(2)}% chance of winning the raffle{' '}
                    {((data.RaffleAmountEth ?? 0) / (data.NumRaffleEthWinnersBidding ?? 1)).toFixed(
                      4,
                    )}{' '}
                    ETH, and {winProbability.nft.toFixed(2)}% chance of winning a Cosmic Signature
                    Token for now.
                  </p>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};
