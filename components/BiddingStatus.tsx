import { Box, Typography, Grid, Link } from "@mui/material";
import { constants, ethers } from "ethers";
import { useEffect, useState } from "react";
import Countdown from "react-countdown";
import api from "../services/api";
import { calculateTimeDiff, convertTimestampToDateTime } from "../utils";
import Counter from "./Counter";
import { GradientText } from "./styled";
import { useActiveWeb3React } from "../hooks/web3";

export const BiddingStatus = ({
  data,
  loading,
  activationTime,
  curBidList,
  ethBidInfo,
  prizeTime,
}) => {
  const [winProbability, setWinProbability] = useState(null);
  const [offset, setOffset] = useState(0);
  const [roundStarted, setRoundStarted] = useState("");
  const [lastBidderElapsed, setLastBidderElapsed] = useState("");
  const [cstBidData, setCSTBidData] = useState({
    AuctionDuration: 0,
    CSTPrice: 0,
    SecondsElapsed: 0,
  });

  const { account } = useActiveWeb3React();

  useEffect(() => {
    const probabilityOfSelection = (
      totalBids: number,
      chosenBids: number,
      yourBids: number
    ) => {
      const probability =
        1 - Math.pow((totalBids - yourBids) / totalBids, chosenBids);
      return probability;
    };
    const calculateProbability = async () => {
      const userInfo = await api.get_user_info(account);
      const Bids = userInfo?.Bids || [];
      if (Bids.length) {
        const curRoundBids = Bids.filter(
          (bid: any) => bid.RoundNum === data.CurRoundNum
        );
        const raffle =
          probabilityOfSelection(
            curBidList.length,
            data?.NumRaffleEthWinnersBidding,
            curRoundBids.length
          ) * 100;
        const nft =
          probabilityOfSelection(
            curBidList.length,
            data?.NumRaffleNFTWinnersBidding,
            curRoundBids.length
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
        console.error("Error fetching prize time:", err);
      }
    };

    if (data && account && curBidList.length) {
      calculateProbability();
    }

    fetchTimeOffset();
    const interval = setInterval(async () => {
      setRoundStarted(calculateTimeDiff(data?.TsRoundStart - offset / 1000));
      if (curBidList.length) {
        const lastBidTime = curBidList[0].TimeStamp;
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
        let ctData = await api.get_ct_price();
        if (ctData) {
          setCSTBidData({
            AuctionDuration: parseInt(ctData.AuctionDuration),
            CSTPrice: parseFloat(ethers.utils.formatEther(ctData.CSTPrice)),
            SecondsElapsed: parseInt(ctData.SecondsElapsed),
          });
        }
      } catch (err) {
        console.error("Error fetching CST bid data:", err);
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
          {activationTime > Date.now() / 1000 ? (
            <Box mb={4}>
              <Typography
                variant="subtitle1"
                textAlign="center"
                fontWeight={400}
              >
                Round {data?.CurRoundNum} becomes active at{" "}
                {convertTimestampToDateTime(activationTime, true)}
              </Typography>
              <Countdown
                key={3}
                date={activationTime * 1000}
                renderer={Counter}
              />
            </Box>
          ) : data?.TsRoundStart !== 0 ? (
            <Grid container spacing={2} alignItems="center" mb={4}>
              <Grid item xs={12} sm={4} md={4}>
                <Typography variant="h5">Round #{data?.CurRoundNum}</Typography>
              </Grid>
              <Grid item xs={12} sm={8} md={8} sx={{ width: "100%" }}>
                {data?.LastBidderAddr !== constants.AddressZero &&
                  (prizeTime > Date.now() ? (
                    <>
                      <Typography
                        variant="subtitle1"
                        textAlign="center"
                        fontWeight={400}
                      >
                        Finishes In
                      </Typography>
                      <Countdown key={0} date={prizeTime} renderer={Counter} />
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
                {roundStarted !== "" && (
                  <Typography sx={{ mt: 1 }}>
                    (Round was started {roundStarted} ago.)
                  </Typography>
                )}
                <Link href="/changed-parameters" color="inherit">
                  Changed Parameters
                </Link>
              </Grid>
            </Grid>
          ) : (
            <>
              {data?.CurRoundNum > 0 ? (
                <Typography variant="h4" mb={2}>
                  Round {data?.CurRoundNum} started
                </Typography>
              ) : (
                <Typography variant="subtitle1">
                  Start the game with your first bid!
                </Typography>
              )}
              <Typography variant="subtitle1" mt={2} mb={2}>
                Dutch auction for the first bid in ETH has started. Make your
                bid.
              </Typography>
            </>
          )}
          {data?.LastBidderAddr !== constants.AddressZero && (
            <Grid container spacing={2} mb={2} alignItems="center">
              <Grid item xs={12} sm={3} md={4}>
                <Typography variant="subtitle1">Bid Price</Typography>
              </Grid>
              <Grid item xs={8} sm={5} md={8}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Using Ether</Typography>
                  <Typography>{ethBidInfo.ETHPrice.toFixed(5)} ETH</Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Using RandomWalk</Typography>
                  <Typography>
                    {(ethBidInfo.ETHPrice / 2).toFixed(5)} ETH
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography>Using CST</Typography>
                  {cstBidData?.CSTPrice > 0 ? (
                    <Typography>
                      {cstBidData?.CSTPrice.toFixed(5)} CST
                    </Typography>
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
                <Grid item xs={12} sm={4} md={4}>
                  <Typography variant="subtitle1">Main Prize Reward</Typography>
                </Grid>
                <Grid item xs={12} sm={8} md={8}>
                  <GradientText variant="h6" sx={{ display: "inline" }}>
                    {data?.PrizeAmountEth.toFixed(4)} ETH
                  </GradientText>
                </Grid>
              </Grid>
              <Grid container spacing={2} mb={2} alignItems="center">
                <Grid item xs={12} sm={4} md={4}>
                  <Typography variant="subtitle1">
                    Last Bidder Address
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={8} md={8}>
                  <Typography>
                    {data?.LastBidderAddr === constants.AddressZero ? (
                      "There is no bidder yet."
                    ) : (
                      <>
                        <Link
                          href={`/user/${data?.LastBidderAddr}`}
                          color="rgb(255, 255, 255)"
                          fontSize="inherit"
                          sx={{ wordBreak: "break-all" }}
                        >
                          {data?.LastBidderAddr}
                        </Link>{" "}
                        {lastBidderElapsed !== "" && (
                          <>({lastBidderElapsed} Elapsed)</>
                        )}
                      </>
                    )}
                  </Typography>
                </Grid>
              </Grid>
              {!!(curBidList.length && curBidList[0].Message !== "") && (
                <Grid container spacing={2} mb={2} alignItems="center">
                  <Grid item xs={12} sm={4} md={4}>
                    <Typography variant="subtitle1">
                      Last Bidder Message
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={8} md={8}>
                    <Typography sx={{ wordWrap: "break-word", color: "#ff0" }}>
                      {curBidList[0].Message}
                    </Typography>
                  </Grid>
                </Grid>
              )}
              {curBidList.length > 0 && winProbability && (
                <>
                  <Typography mt={4}>
                    {data?.LastBidderAddr === account
                      ? `You have 100.00% chance of winning the main prize (${data?.PrizeAmountEth.toFixed(
                          4
                        )}ETH).`
                      : "You're not the last bidder, so you can win the main prize in 24 hours if the last bidder doesn't take it."}
                  </Typography>
                  <Typography>
                    You have {winProbability.raffle.toFixed(2)}% chance of
                    winning the raffle{" "}
                    {(
                      data?.RaffleAmountEth / data?.NumRaffleEthWinnersBidding
                    ).toFixed(4)}{" "}
                    ETH, and {winProbability.nft.toFixed(2)}% chance of winning
                    a Cosmic Signature Token for now.
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
