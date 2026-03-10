import React from 'react';
import { Box, Typography, Grid, Link } from '@mui/material';
import { formatEther, zeroAddress } from 'viem';
import { useEffect, useState } from 'react';
import Countdown from 'react-countdown';

import api from '../../services/api';
import { reportError } from '../../utils/errors';
import { calculateTimeDiff, convertTimestampToDateTime } from '../../utils';
import { GradientText } from '../styled';
import { useActiveWeb3React } from '../../hooks/web3';
import type { DashboardInfo, BidInfo } from '../../services/api';

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

export const BiddingStatus: React.FC<BiddingStatusProps> = ({
  data,
  loading,
  activationTime,
  curBidList,
  ethBidInfo,
  prizeTime,
}) => {
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
            <Box mb={4}>
              <Typography variant="subtitle1" textAlign="center" fontWeight={400}>
                Round {data.CurRoundNum} becomes active at{' '}
                {convertTimestampToDateTime(activationTime, true)}
              </Typography>
              <Countdown
                key={3}
                date={activationTime * 1000}
                renderer={Counter as unknown as (...args: unknown[]) => React.ReactNode}
              />
            </Box>
          ) : data && data.TsRoundStart !== 0 ? (
            <Grid container spacing={2} alignItems="center" mb={4}>
              <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                <Typography variant="h5">Round #{data.CurRoundNum}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 8, md: 8 }} sx={{ width: '100%' }}>
                {data &&
                  data.LastBidderAddr !== zeroAddress &&
                  (prizeTime > Date.now() ? (
                    <>
                      <Typography variant="subtitle1" textAlign="center" fontWeight={400}>
                        Finishes In
                      </Typography>
                      <Countdown
                        key={0}
                        date={prizeTime}
                        renderer={Counter as unknown as (...args: unknown[]) => React.ReactNode}
                      />
                    </>
                  ) : (
                    <>
                      <Typography variant="h5" color="primary">
                        Bids exhausted!
                      </Typography>
                      <Typography variant="subtitle2" color="primary">
                        Waiting for the winner to claim the prize.
                      </Typography>
                    </>
                  ))}
                {roundStarted !== '' && (
                  <Typography sx={{ mt: 1 }}>(Round was started {roundStarted} ago.)</Typography>
                )}
                <Link href="/changed-parameters" color="inherit">
                  Changed Parameters
                </Link>
              </Grid>
            </Grid>
          ) : (
            <>
              {data && data.CurRoundNum > 0 ? (
                <Typography variant="h4" mb={2}>
                  Round {data.CurRoundNum} started
                </Typography>
              ) : (
                <Typography variant="subtitle1">Start the game with your first bid!</Typography>
              )}
              <Typography variant="subtitle1" mt={2} mb={2}>
                Dutch auction for the first bid in ETH has started. Make your bid.
              </Typography>
            </>
          )}
          {data && data.LastBidderAddr !== zeroAddress && (
            <Grid container spacing={2} mb={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 3, md: 4 }}>
                <Typography variant="subtitle1">Bid Price</Typography>
              </Grid>
              <Grid size={{ xs: 8, sm: 5, md: 8 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography>Using Ether</Typography>
                  <Typography>{(ethBidInfo?.ETHPrice ?? 0).toFixed(5)} ETH</Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography>Using RandomWalk</Typography>
                  <Typography>{((ethBidInfo?.ETHPrice ?? 0) / 2).toFixed(5)} ETH</Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography>Using CST</Typography>
                  {cstBidData?.CSTPrice > 0 ? (
                    <Typography>{cstBidData?.CSTPrice.toFixed(5)} CST</Typography>
                  ) : (
                    <Typography color="#ff0">FREE</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          )}
          {activationTime < Date.now() / 1000 && (
            <>
              <Grid container spacing={2} mb={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                  <Typography variant="subtitle1">Main Prize Reward</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 8, md: 8 }}>
                  <GradientText variant="h6" sx={{ display: 'inline' }}>
                    {(data?.PrizeAmountEth ?? 0).toFixed(4)} ETH
                  </GradientText>
                </Grid>
              </Grid>
              <Grid container spacing={2} mb={2} alignItems="center">
                <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                  <Typography variant="subtitle1">Last Bidder Address</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 8, md: 8 }}>
                  <Typography>
                    {data && data.LastBidderAddr === zeroAddress ? (
                      'There is no bidder yet.'
                    ) : (
                      <>
                        <Link
                          href={`/user/${data!.LastBidderAddr}`}
                          color="rgb(255, 255, 255)"
                          fontSize="inherit"
                          sx={{ wordBreak: 'break-all' }}
                        >
                          {data!.LastBidderAddr}
                        </Link>{' '}
                        {lastBidderElapsed !== '' && <>({lastBidderElapsed} Elapsed)</>}
                      </>
                    )}
                  </Typography>
                </Grid>
              </Grid>
              {!!(curBidList.length && curBidList[0]?.Message !== '') && (
                <Grid container spacing={2} mb={2} alignItems="center">
                  <Grid size={{ xs: 12, sm: 4, md: 4 }}>
                    <Typography variant="subtitle1">Last Bidder Message</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 8, md: 8 }}>
                    <Typography sx={{ wordWrap: 'break-word', color: '#ff0' }}>
                      {curBidList[0]?.Message}
                    </Typography>
                  </Grid>
                </Grid>
              )}
              {curBidList.length > 0 && winProbability && data && (
                <>
                  <Typography mt={4}>
                    {data.LastBidderAddr === account
                      ? `You have 100.00% chance of winning the main prize (${(
                          data.PrizeAmountEth ?? 0
                        ).toFixed(4)}ETH).`
                      : "You're not the last bidder, so you can win the main prize in 24 hours if the last bidder doesn't take it."}
                  </Typography>
                  <Typography>
                    You have {winProbability.raffle.toFixed(2)}% chance of winning the raffle{' '}
                    {((data.RaffleAmountEth ?? 0) / (data.NumRaffleEthWinnersBidding ?? 1)).toFixed(
                      4,
                    )}{' '}
                    ETH, and {winProbability.nft.toFixed(2)}% chance of winning a Cosmic Signature
                    Token for now.
                  </Typography>
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};
