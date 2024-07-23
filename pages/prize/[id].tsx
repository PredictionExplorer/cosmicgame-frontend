import React, { useEffect, useState } from "react";
import { Box, Button, Link, Typography } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import { GetServerSidePropsContext } from "next";
import api from "../../services/api";
import { convertTimestampToDateTime } from "../../utils";
import RaffleWinnerTable from "../../components/RaffleWinnerTable";
import BiddingHistoryTable from "../../components/BiddingHistoryTable";
import useCosmicGameContract from "../../hooks/useCosmicGameContract";
import { useApiData } from "../../contexts/ApiDataContext";
import StakingWinnerTable from "../../components/StakingWinnerTable";
import DonatedNFTTable from "../../components/DonatedNFTTable";
import getErrorMessage from "../../utils/alert";
import { useNotification } from "../../contexts/NotificationContext";

const PrizeInfo = ({ roundNum }) => {
  const cosmicGameContract = useCosmicGameContract();
  const { apiData: status } = useApiData();
  const [donatedNFTToClaim, setDonatedNFTToClaim] = useState([]);
  const [bidHistory, setBidHistory] = useState([]);
  const [nftDonations, setNftDonations] = useState([]);
  const [prizeInfo, setPrizeInfo] = useState(null);
  const [stakingRewards, setStakingRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setNotification } = useNotification();

  const handleAllDonatedNFTsClaim = async () => {
    try {
      const indexList = donatedNFTToClaim.map((item) => item.Index);
      const res = await cosmicGameContract.claimManyDonatedNFTs(indexList);
      console.log(res);
    } catch (err) {
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({ text: msg, type: "error", visible: true });
      }
      console.log(err);
    }
  };
  useEffect(() => {
    const fetchUnclaimedDonatedNFTs = async () => {
      const nfts = await api.get_donations_nft_unclaimed_by_round(roundNum);
      setDonatedNFTToClaim(nfts);
    };
    if (status?.NumDonatedNFTToClaim > 0) {
      fetchUnclaimedDonatedNFTs();
    }
  }, [status]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const nftDonations = await api.get_donations_nft_by_round(roundNum);
      setNftDonations(nftDonations);
      const prizeInfo = await api.get_prize_info(roundNum);
      setPrizeInfo(prizeInfo);
      const bidHistory = await api.get_bid_list_by_round(roundNum, "desc");
      setBidHistory(bidHistory);
      const stakingRewards = await api.get_staking_cst_rewards_by_round(
        roundNum
      );
      setStakingRewards(stakingRewards);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <>
      <MainWrapper>
        <Box mb={4}>
          <Typography variant="h4" color="primary" component="span" mr={2}>
            {`Round #${roundNum}`}
          </Typography>
          <Typography variant="h4" component="span">
            Prize Information
          </Typography>
        </Box>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : prizeInfo ? (
          <Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Datetime:
              </Typography>
              &nbsp;
              <Typography component="span">
                <Link
                  color="inherit"
                  fontSize="inherit"
                  href={`https://arbiscan.io/tx/${prizeInfo.TxHash}`}
                  target="__blank"
                >
                  {convertTimestampToDateTime(prizeInfo.TimeStamp)}
                </Link>
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Prize Amount:
              </Typography>
              &nbsp;
              <Typography component="span">
                {prizeInfo.AmountEth.toFixed(4)} ETH
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Winner Address:
              </Typography>
              &nbsp;
              <Link
                href={`/user/${prizeInfo.WinnerAddr}`}
                style={{ color: "rgb(255, 255, 255)" }}
              >
                <Typography fontFamily="monospace" component="span">
                  {prizeInfo.WinnerAddr}
                </Typography>
              </Link>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Charity Address:
              </Typography>
              &nbsp;
              <Typography fontFamily="monospace" component="span">
                {prizeInfo.CharityAddress}
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Charity Amount:
              </Typography>
              &nbsp;
              <Typography component="span">
                {prizeInfo.CharityAmountETH.toFixed(4)} ETH
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Total Bids:
              </Typography>
              &nbsp;
              <Typography component="span">
                {prizeInfo.RoundStats.TotalBids}
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Total Donated NFTs:
              </Typography>
              &nbsp;
              <Typography component="span">
                {prizeInfo.RoundStats.TotalDonatedNFTs}
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Total Raffle Eth Deposits:
              </Typography>
              &nbsp;
              <Typography component="span">
                {prizeInfo.RoundStats.TotalRaffleEthDepositsEth.toFixed(4)} ETH
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Total Raffle NFTs:
              </Typography>
              &nbsp;
              <Typography component="span">
                {prizeInfo.RoundStats.TotalRaffleNFTs}
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Total Staking Deposit Amount:
              </Typography>
              &nbsp;
              <Typography component="span">
                {prizeInfo.StakingDepositAmountEth.toFixed(4)} ETH
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Number of Staked Tokens:
              </Typography>
              &nbsp;
              <Typography component="span">
                {prizeInfo.StakingNumStakedTokens}
              </Typography>
            </Box>
            <Box mb={1}>
              <Typography color="primary" component="span">
                Number of Stakers:
              </Typography>
              &nbsp;
              <Typography component="span">{stakingRewards.length}</Typography>
            </Box>
            <Box mt={4}>
              <Typography variant="h6" lineHeight={1}>
                Bid History
              </Typography>
              <BiddingHistoryTable biddingHistory={bidHistory} />
            </Box>
            <Box mt={4}>
              <Typography variant="h6" mb={2}>
                Raffle Winners
              </Typography>
              <RaffleWinnerTable
                RaffleETHDeposits={prizeInfo.RaffleETHDeposits}
                RaffleNFTWinners={prizeInfo.RaffleNFTWinners}
              />
            </Box>
            <Box mt={4}>
              <Typography variant="h6" mb={2}>
                Staking Rewards
              </Typography>
              <StakingWinnerTable list={stakingRewards} />
            </Box>
            <Box mt={8}>
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">Donated NFTs</Typography>
                {donatedNFTToClaim.length > 0 && (
                  <Button
                    variant="contained"
                    onClick={handleAllDonatedNFTsClaim}
                  >
                    Claim All
                  </Button>
                )}
              </Box>
              <DonatedNFTTable list={nftDonations} handleClaim={null} />
            </Box>
          </Box>
        ) : (
          <Typography>Prize data not found!</Typography>
        )}
      </MainWrapper>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const id = context.params!.id;
  const roundNum = Array.isArray(id) ? id[0] : id;
  const title = `Prize Information for Round ${roundNum} | Cosmic Signature`;
  const description = `Prize Information for Round ${roundNum}`;
  const imageUrl = "https://cosmic-game2.s3.us-east-2.amazonaws.com/logo.png";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return {
    props: { title, description, openGraphData, roundNum: parseInt(roundNum) },
  };
}

export default PrizeInfo;
