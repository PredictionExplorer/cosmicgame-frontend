import React, { useEffect, useState } from "react";
import { Box, Grid, Link, Pagination, Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import BiddingHistoryTable from "../components/BiddingHistoryTable";
import { UniqueBiddersTable } from "../components/UniqueBiddersTable";
import { UniqueWinnersTable } from "../components/UniqueWinnersTable";
import DonatedNFT from "../components/DonatedNFT";
import { ZERO_ADDRESS } from "../config/misc";
import Countdown from "react-countdown";

const convertTimestampToDateTime = (timestamp: any) => {
  var date_ob = new Date(timestamp * 1000);
  var year = date_ob.getFullYear();
  var month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  var date = ("0" + date_ob.getDate()).slice(-2);
  var hours = ("0" + date_ob.getHours()).slice(-2);
  var minutes = ("0" + date_ob.getMinutes()).slice(-2);
  var seconds = ("0" + date_ob.getSeconds()).slice(-2);
  var result =
    year +
    "-" +
    month +
    "-" +
    date +
    " " +
    hours +
    ":" +
    minutes +
    ":" +
    seconds;
  return result;
};

const StatisticsItem = ({ title, value }) => {
  return (
    <Box display="flex" flexWrap="wrap" my={1}>
      <Typography color="primary" width={{ md: "300px", xs: "200px" }}>
        {title}
      </Typography>
      <Typography>{value}</Typography>
    </Box>
  );
};

const Statistics = () => {
  const [curPage, setCurrentPage] = useState(1);
  const perPage = 12;
  const [data, setData] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [uniqueBidders, setUniqueBidders] = useState([]);
  const [uniqueWinners, setUniqueWinners] = useState([]);
  const [nftDonations, setNftDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const gridLayout =
    nftDonations.length > 16
      ? { xs: 6, sm: 3, md: 2, lg: 2 }
      : nftDonations.length > 9
      ? { xs: 6, sm: 4, md: 3, lg: 3 }
      : { xs: 12, sm: 6, md: 4, lg: 4 };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await api.get_dashboard_info();
      setData(data);
      const bidHistory = await api.get_bid_list_by_round(
        data.CurRoundNum - 1,
        "desc"
      );
      setBidHistory(bidHistory);
      const uniqueBidders = await api.get_unique_bidders();
      setUniqueBidders(uniqueBidders);
      const uniqueWinners = await api.get_unique_winners();
      setUniqueWinners(uniqueWinners);
      const nftDonations = await api.get_donations_nft_list();
      setNftDonations(nftDonations);
      setLoading(false);
    };
    fetchData();
  }, []);

  const renderer = ({ days, hours, minutes, seconds }) => {
    let result = "";
    if (days > 1) {
      result = `${days} days `;
    } else if (days === 1) {
      result = `${days} day `;
    }
    if (hours > 1) {
      result += `${hours} hours `;
    } else if (hours === 1 || (hours === 0 && result !== "")) {
      result += `${hours} hour `;
    }
    if (minutes > 1) {
      result += `${minutes} minutes `;
    } else if (minutes === 1 || (minutes === 0 && result !== "")) {
      result += `${minutes} minute `;
    }
    if (seconds > 1) {
      result += `${seconds} seconds`;
    } else if (seconds === 1 || (seconds === 0 && result !== "")) {
      result += `${seconds} second`;
    }
    if (result !== "") {
      result += " left";
    }
    return result !== "" && <Typography>{result}</Typography>;
  };

  return (
    <>
      <Head>
        <title>Statistics | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        {loading ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <>
            <Typography variant="h5">Current Round Statistics</Typography>
            <Box my={4}>
              <StatisticsItem title="Current Round" value={data.CurRoundNum} />
              <StatisticsItem
                title="Round Start Date"
                value={
                  data.LastBidderAddr === ZERO_ADDRESS
                    ? "Round isn't started yet."
                    : convertTimestampToDateTime(data.TsRoundStart)
                }
              />
              <StatisticsItem
                title="Current Bid Price"
                value={`${data.BidPriceEth.toFixed(6)} ETH`}
              />
              <StatisticsItem
                title="Num Bids Since Round Start"
                value={data.CurNumBids}
              />
              <StatisticsItem
                title="Prize Amount"
                value={`${data.PrizeAmountEth.toFixed(6)} ETH`}
              />
              <Box display="flex" flexWrap="wrap" my={1}>
                <Typography color="primary" width="300px">
                  Prize Claim Date
                </Typography>
                <Box>
                  <Typography>
                    {convertTimestampToDateTime(data.PrizeClaimTs)}
                  </Typography>
                  {data.PrizeClaimTs > Date.now() / 1000 && (
                    <Countdown
                      date={data.PrizeClaimTs * 1000}
                      renderer={renderer}
                    />
                  )}
                </Box>
              </Box>
              <StatisticsItem title="Last Bidder" value={data.LastBidderAddr} />
            </Box>
            <Box my={4}>
              <Box display="flex" alignItems="center" flexWrap="wrap">
                <Typography variant="h6" component="span">
                  CURRENT ROUND
                </Typography>
                <Typography
                  variant="h6"
                  component="span"
                  color="primary"
                  sx={{ ml: 1.5 }}
                >
                  BID HISTORY
                </Typography>
              </Box>
              <BiddingHistoryTable biddingHistory={bidHistory} />
            </Box>
            <Typography variant="h5">Overall Statistics</Typography>
            <Box mt={4}>
              <StatisticsItem
                title="Num Prizes Given"
                value={
                  <Link href="/prize" color="inherit" fontSize="inherit">
                    {data.TotalPrizes}
                  </Link>
                }
              />
              <StatisticsItem
                title="Total CS tokens minted"
                value={
                  <Link href="/gallery" color="inherit" fontSize="inherit">
                    {data.MainStats.NumCSTokenMints}
                  </Link>
                }
              />
              <StatisticsItem
                title="Total Amount Paid in Prizes"
                value={`${data.TotalPrizesPaidAmountEth.toFixed(6)} ETH`}
              />
              <StatisticsItem
                title="Num Cosmic Game Donations"
                value={
                  <Link
                    color="inherit"
                    fontSize="inherit"
                    href="/charity-deposits"
                  >
                    {data.MainStats.NumCosmicGameDonations}
                  </Link>
                }
              />
              <StatisticsItem
                title="Sum of Cosmic Game Donations"
                value={
                  data.MainStats.SumCosmicGameDonationsEth > 0 ? (
                    <Link
                      color="inherit"
                      fontSize="inherit"
                      href="/charity-deposits-cg"
                    >
                      {`${data.MainStats.SumCosmicGameDonationsEth.toFixed(
                        6
                      )} ETH`}
                    </Link>
                  ) : (
                    `${data.MainStats.SumCosmicGameDonationsEth.toFixed(6)} ETH`
                  )
                }
              />
              <StatisticsItem
                title="Voluntary Donations Received"
                value={
                  data.SumVoluntaryDonationsEth > 0 ? (
                    <Link
                      color="inherit"
                      fontSize="inherit"
                      href="/charity-deposits-voluntary"
                    >
                      {`${data.NumVoluntaryDonations} totalling ${data.SumVoluntaryDonationsEth} ETH`}
                    </Link>
                  ) : (
                    `${data.NumVoluntaryDonations} totalling ${data.SumVoluntaryDonationsEth} ETH`
                  )
                }
              />
              {data.MainStats.NumWithdrawals > 0 && (
                <>
                  <StatisticsItem
                    title="Withdrawals from Charity Wallet"
                    value={data.MainStats.NumWithdrawals}
                  />
                  <StatisticsItem
                    title="Total amount withdrawn"
                    value={`${data.MainStats.SumWithdrawals.toFixed(2)} ETH`}
                  />
                </>
              )}
              <StatisticsItem
                title="RandomWalk Tokens Used"
                value={data.NumRwalkTokensUsed}
              />
              <StatisticsItem title="Price Increase" value="1%" />
              <StatisticsItem title="Time Increase" value="0.01%" />
              <StatisticsItem
                title="Prize Percentage"
                value={`${data.PrizePercentage} %`}
              />
              <StatisticsItem
                title="Raffle Percentage"
                value={`${data.RafflePercentage} %`}
              />
              <StatisticsItem
                title="NFT Holder Winners"
                value={data.NumHolderNFTWinners}
              />
              <StatisticsItem
                title="Raffle ETH Winners"
                value={data.NumRaffleEthWinners}
              />
              <StatisticsItem
                title="Raffle NFT Winners"
                value={data.NumRaffleNFTWinners}
              />
              <StatisticsItem
                title="Raffle Holder NFT Winners"
                value={data.CurRoundNum}
              />
              <StatisticsItem
                title="Charity Address"
                value={data.CharityAddr}
              />
              <StatisticsItem
                title="Charity Percentage"
                value={`${data.CharityPercentage} %`}
              />
              <StatisticsItem
                title="Charity Balance"
                value={`${data.CharityBalanceEth.toFixed(6)} ETH`}
              />
              <StatisticsItem
                title="Number of Unique Bidders"
                value={data.MainStats.NumUniqueBidders}
              />
              <StatisticsItem
                title="Number of Unique Winners"
                value={data.MainStats.NumUniqueWinners}
              />
              <StatisticsItem
                title="Number of Donated NFTs"
                value={data.NumDonatedNFTs}
              />
            </Box>
            <Box mt={4}>
              <Typography variant="h6" mb={2}>
                UNIQUE BIDDERS
              </Typography>
              <UniqueBiddersTable list={uniqueBidders} />
            </Box>
            <Box mt={4}>
              <Typography variant="h6" mb={2}>
                UNIQUE WINNERS
              </Typography>
              <UniqueWinnersTable list={uniqueWinners} />
            </Box>
            <Box mt={4}>
              <Typography variant="h6" mb={2}>
                Donated NFTs
              </Typography>
              {nftDonations.length > 0 ? (
                <>
                  <Grid container spacing={2} mt={2}>
                    {nftDonations
                      .slice((curPage - 1) * perPage, curPage * perPage)
                      .map((nft) => (
                        <Grid
                          item
                          key={nft.RecordId}
                          xs={gridLayout.xs}
                          sm={gridLayout.sm}
                          md={gridLayout.md}
                          lg={gridLayout.lg}
                        >
                          <DonatedNFT nft={nft} />
                        </Grid>
                      ))}
                  </Grid>
                  <Box display="flex" justifyContent="center" mt={4}>
                    <Pagination
                      color="primary"
                      page={curPage}
                      onChange={(e, page) => setCurrentPage(page)}
                      count={Math.ceil(nftDonations.length / perPage)}
                      hideNextButton
                      hidePrevButton
                      shape="rounded"
                    />
                  </Box>
                </>
              ) : (
                <Typography mt={2}>
                  No ERC721 tokens were donated on this round
                </Typography>
              )}
            </Box>
          </>
        )}
      </MainWrapper>
    </>
  );
};

export default Statistics;
