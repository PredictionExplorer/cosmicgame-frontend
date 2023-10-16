import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Link, Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../../components/styled";
import { GetServerSidePropsContext } from "next";
import api from "../../services/api";
import { convertTimestampToDateTime } from "../../utils";
import DonatedNFT from "../../components/DonatedNFT";
import RaffleWinnerTable from "../../components/RaffleWinnerTable";
import BiddingHistoryTable from "../../components/BiddingHistoryTable";
import { useActiveWeb3React } from "../../hooks/web3";
import useCosmicGameContract from "../../hooks/useCosmicGameContract";
import { useApiData } from "../../contexts/ApiDataContext";

const PrizeInfo = ({ roundNum }) => {
  const { account } = useActiveWeb3React();
  const cosmicGameContract = useCosmicGameContract();
  const { apiData: status } = useApiData();
  const [donatedNFTToClaim, setDonatedNFTToClaim] = useState([]);
  const [bidHistory, setBidHistory] = useState([]);
  const [nftDonations, setNftDonations] = useState([]);
  const [prizeInfo, setPrizeInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleAllDonatedNFTsClaim = async () => {
    try {
      const indexList = donatedNFTToClaim.map((item) => item.Index);
      const res = await cosmicGameContract.claimManyDonatedNFTs(indexList);
      console.log(res);
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    const fetchUnclaimedDonatedNFTs = async () => {
      const nfts = await api.get_unclaimed_donated_nft_by_user(account);
      setDonatedNFTToClaim(nfts);
    };
    if (status.NumDonatedNFTToClaim > 0) {
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
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <>
      <Head>
        <title>Prize Info | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        <Box mb={4}>
          <Link
            href={`/prize/${roundNum}`}
            sx={{
              textDecorationColor: "#15BFFD !important",
              textDecorationThickness: "3px",
            }}
          >
            <Typography variant="h4" color="primary" component="span" mr={2}>
              {`Round #${roundNum}`}
            </Typography>
          </Link>
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
                {convertTimestampToDateTime(prizeInfo.TimeStamp)}
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
                Total Raffle Eth Deposits:
              </Typography>
              &nbsp;
              <Typography component="span">
                {prizeInfo.RoundStats.TotalRaffleEthDepositsEth.toFixed(4)}
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
              <Box
                sx={{
                  mb: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">Donated NFTs</Typography>
                {status.NumDonatedNFTToClaim > 0 && (
                  <Button
                    variant="contained"
                    onClick={handleAllDonatedNFTsClaim}
                  >
                    Claim All
                  </Button>
                )}
              </Box>
              <Grid container spacing={2}>
                {nftDonations.length ? (
                  nftDonations.map((nft) => (
                    <Grid key={nft.RecordId} item xs={12} sm={12} md={4} lg={4}>
                      <DonatedNFT nft={nft} />
                    </Grid>
                  ))
                ) : (
                  <Grid item>
                    <Typography>
                      No ERC721 tokens were donated on this round
                    </Typography>
                  </Grid>
                )}
              </Grid>
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
  return { props: { roundNum: parseInt(roundNum) } };
}

export default PrizeInfo;
