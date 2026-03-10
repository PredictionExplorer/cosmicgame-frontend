import { useEffect, useState, type ReactNode } from 'react';
import { formatEther, zeroAddress } from 'viem';
import Countdown from 'react-countdown';

import { calculateTimeDiff, convertTimestampToDateTime } from '@/utils';

import api from '@/services/api';
import { reportError } from '@/utils/errors';
import { GradientText } from '@/components/styled';
import { useActiveWeb3React } from '@/hooks/web3';
import type { DashboardInfo, BidInfo } from '@/services/api';

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
  const [winProbability, setWinProbability] = useState<{
    raffle: number;
    nft: number;
  } | null>(null);
  const [offset, setOffset] = useState(0);
  const [roundStarted, setRoundStarted] = useState('');
  const [lastBidderElapsed, setLastBidderElapsed] = useState('');
  const [cstBidData, setCSTBidData] = useState({
    AuctionDuration: 0,
    CSTPrice: 0,
    SecondsElapsed: 0,
  });

  const { account } = useActiveWeb3React();

  useEffect(() => {
    const probabilityOfSelection = (totalBids: number, chosenBids: number, yourBids: number) => {
      const probability = 1 - Math.pow((totalBids - yourBids) / totalBids, chosenBids);
      return probability;
    };
    const calculateProbability = async () => {
      if (!account) return;
      const userInfo = await api.get_user_info(account);
      const Bids = userInfo?.Bids || [];
      if (Bids.length && data) {
        const curRoundBids = Bids.filter((bid: BidInfo) => bid.RoundNum === data.CurRoundNum);
        const raffle =
          probabilityOfSelection(
            curBidList.length,
            data?.NumRaffleEthWinnersBidding ?? 1,
            curRoundBids.length,
          ) * 100;
        const nft =
          probabilityOfSelection(
            curBidList.length,
            data?.NumRaffleNFTWinnersBidding ?? 1,
            curRoundBids.length,
          ) * 100;
        setWinProbability({
          raffle: raffle,
          nft: nft,
        });
      }
    };
    const fetchTimeOffset = async () => {
      try {
        const current = await api.get_current_time();
        const diff = current * 1000 - Date.now();
        setOffset(diff);
      } catch (err) {
        reportError(err, 'fetch time offset');
      }
    };

    if (data && account && curBidList.length) {
      calculateProbability();
    }

    fetchTimeOffset();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, account, curBidList]);

  useEffect(() => {
    const fetchCSTBidData = async () => {
      try {
        const ctData = await api.get_ct_price();
        if (ctData) {
          setCSTBidData({
            AuctionDuration: parseInt(String(ctData.AuctionDuration)),
            CSTPrice: parseFloat(formatEther(BigInt(ctData.CSTPrice))),
            SecondsElapsed: parseInt(String(ctData.SecondsElapsed)),
          });
        }
      } catch (err) {
        reportError(err, 'fetch CST bid data');
      }
    };

    fetchCSTBidData();

    const interval = setInterval(fetchCSTBidData, 12000);

    return () => {
      clearInterval(interval);
    };
  }, []);

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
