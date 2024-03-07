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
import DonatedNFTDistributionTable from "../components/DonatedNFTDistributionTable";
import CSTokenDistributionTable from "../components/CSTokenDistributionTable";
import CTBalanceDistributionTable from "../components/CTBalanceDistributionTable";
import {
  Chart,
  ChartArea,
  ChartLegend,
  ChartSeries,
  ChartSeriesItem,
} from "@progress/kendo-react-charts";
import "@progress/kendo-theme-default/dist/all.css";
import {
  convertTimestampToDateTime,
  formatCSTValue,
  formatEthValue,
} from "../utils";
import { UniqueStakersTable } from "../components/UniqueStakersTable";
import { GlobalStakingActionsTable } from "../components/GlobalStakingActionsTable";
import { GlobalStakedTokensTable } from "../components/GlobalStakedTokensTable";

const StatisticsItem = ({ title, value }) => {
  return (
    <Box display="flex" flexWrap="wrap" my={1}>
      <Typography color="primary" width={{ md: "400px", xs: "250px" }} mr={2}>
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
  const [uniqueStakers, setUniqueStakers] = useState([]);
  const [nftDonations, setNftDonations] = useState([]);
  const [cstDistribution, setCSTDistribution] = useState([]);
  const [ctBalanceDistribution, setCTBalanceDistribution] = useState([]);
  const [stakingActions, setStakingActions] = useState(null);
  const [stakedTokens, setStakedTokens] = useState(null);
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
        data.CurRoundNum,
        "desc"
      );
      setBidHistory(bidHistory);
      let uniqueBidders = await api.get_unique_bidders();
      uniqueBidders = uniqueBidders.sort((a, b) => b.NumBids - a.NumBids);
      setUniqueBidders(uniqueBidders);
      const uniqueWinners = await api.get_unique_winners();
      setUniqueWinners(uniqueWinners);
      const uniqueStakers = await api.get_unique_stakers();
      setUniqueStakers(uniqueStakers);
      const nftDonations = await api.get_donations_nft_list();
      setNftDonations(nftDonations);
      const distribution = await api.get_cst_distribution();
      setCSTDistribution(distribution);
      const ctbDistribution = await api.get_ct_balances_distribution();
      setCTBalanceDistribution(ctbDistribution);
      const actions = await api.get_staking_actions();
      setStakingActions(actions);
      const tokens = await api.get_staked_tokens();
      setStakedTokens(tokens);

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
                value={formatEthValue(data.BidPriceEth)}
              />
              <StatisticsItem
                title="Num Bids Since Round Start"
                value={data.CurNumBids}
              />
              <StatisticsItem
                title="Total Donated NFTs"
                value={data.CurRoundStats.TotalDonatedNFTs}
              />
              <StatisticsItem
                title="Prize Amount"
                value={formatEthValue(data.PrizeAmountEth)}
              />
              <Box display="flex" flexWrap="wrap" my={1}>
                <Typography
                  color="primary"
                  width={{ md: "400px", xs: "250px" }}
                  mr={2}
                >
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
              <StatisticsItem
                title="Last Bidder"
                value={
                  <Link
                    sx={{
                      color: "inherit",
                      fontSize: "inherit",
                      fontFamily: "monospace",
                    }}
                    href={`/user/${data.LastBidderAddr}`}
                  >
                    {data.LastBidderAddr}
                  </Link>
                }
              />
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
                title="CosmicGame contract balance"
                value={`${data.CosmicGameBalanceEth.toFixed(4)} ETH`}
              />
              <StatisticsItem
                title="Num Prizes Given"
                value={
                  <Link href="/prize" color="inherit" fontSize="inherit">
                    {data.TotalPrizes}
                  </Link>
                }
              />
              <StatisticsItem
                title="Total Cosmic Signature Tokens minted"
                value={
                  <Link href="/gallery" color="inherit" fontSize="inherit">
                    {data.MainStats.NumCSTokenMints}
                  </Link>
                }
              />
              <StatisticsItem
                title="Total Amount Paid in Main Prizes"
                value={formatEthValue(data.TotalPrizesPaidAmountEth)}
              />
              <StatisticsItem
                title="Total Amount Paid in ETH Raffles"
                value={formatEthValue(data.MainStats.TotalRaffleEthDeposits)}
              />
              <StatisticsItem
                title="Total CST Consumed"
                value={formatCSTValue(data.MainStats.TotalCSTConsumedEth)}
              />
              <StatisticsItem
                title="Total Reward Paid to Marketing Agents with CST"
                value={formatCSTValue(data.MainStats.TotalMktRewardsEth)}
              />
              <StatisticsItem
                title="Number of Marketing Reward Transactions"
                value={data.MainStats.NumMktRewards}
              />
              <StatisticsItem
                title="Amount of ETH collected by the winners from raffles"
                value={formatEthValue(data.MainStats.TotalRaffleEthWithdrawn)}
              />
              <Typography color="primary">{`${
                data.MainStats.NumWinnersWithPendingRaffleWithdrawal
              } winners are yet to withdraw funds totalling an amount of ${formatEthValue(
                data.MainStats.TotalRaffleEthDeposits -
                  data.MainStats.TotalRaffleEthWithdrawn
              )}`}</Typography>
              {data.MainStats.NumCosmicGameDonations > 0 && (
                <StatisticsItem
                  title="Num Cosmic Game Donations"
                  value={
                    <Link
                      color="inherit"
                      fontSize="inherit"
                      href="/charity-deposits-cg"
                    >
                      {data.MainStats.NumCosmicGameDonations}
                    </Link>
                  }
                />
              )}
              {data.MainStats.SumCosmicGameDonationsEth > 0 && (
                <StatisticsItem
                  title="Sum of Cosmic Game Donations"
                  value={
                    <Link
                      color="inherit"
                      fontSize="inherit"
                      href="/charity-deposits-cg"
                    >
                      {formatEthValue(data.MainStats.SumCosmicGameDonationsEth)}
                    </Link>
                  }
                />
              )}
              {data.SumVoluntaryDonationsEth > 0 && (
                <StatisticsItem
                  title="Voluntary Donations Received"
                  value={
                    <Link
                      color="inherit"
                      fontSize="inherit"
                      href="/charity-deposits-voluntary"
                    >
                      {`${data.NumVoluntaryDonations} totalling ${data.SumVoluntaryDonationsEth} ETH`}
                    </Link>
                  }
                />
              )}
              {data.MainStats.NumWithdrawals > 0 && (
                <>
                  <StatisticsItem
                    title="Withdrawals from Charity Wallet"
                    value={
                      <Link
                        color="inherit"
                        fontSize="inherit"
                        href="/charity-withdrawals"
                      >
                        {data.MainStats.NumWithdrawals}
                      </Link>
                    }
                  />
                  <StatisticsItem
                    title="Total amount withdrawn from Charity Wallet"
                    value={formatEthValue(data.MainStats.SumWithdrawals)}
                  />
                </>
              )}
              <StatisticsItem
                title="RandomWalk Tokens Used"
                value={
                  <Link
                    color="inherit"
                    fontSize="inherit"
                    href="/used-rwlk-nfts"
                  >
                    {data.NumRwalkTokensUsed}
                  </Link>
                }
              />
              <StatisticsItem
                title="Charity Balance"
                value={formatEthValue(data.CharityBalanceEth)}
              />
              <StatisticsItem
                title="Number of Bids with CST"
                value={data.MainStats.NumBidsCST}
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
              <StatisticsItem
                title="Amount of Cosmic Signature Tokens with assigned name"
                value={data.MainStats.TotalNamedTokens}
              />
              <StatisticsItem
                title="Number of Active Stakers"
                value={data.MainStats.StakeStatistics.NumActiveStakers}
              />
              <StatisticsItem
                title="Number of Staking Rewards Deposits"
                value={data.MainStats.StakeStatistics.NumDeposits}
              />
              <StatisticsItem
                title="Total Staking Rewards"
                value={`${data.MainStats.StakeStatistics.TotalRewardEth.toFixed(
                  4
                )} ETH`}
              />
              <StatisticsItem
                title="Total Tokens Staked"
                value={data.MainStats.StakeStatistics.TotalTokensStaked}
              />
              <StatisticsItem
                title="Unclaimed Staking Rewards"
                value={`${data.MainStats.StakeStatistics.UnclaimedRewardEth.toFixed(
                  4
                )} ETH`}
              />
            </Box>
            <Box mt={4}>
              <Typography variant="h6" mb={2}>
                Unique Bidders
              </Typography>
              <UniqueBiddersTable list={uniqueBidders} />
            </Box>
            <Box mt={4}>
              <Typography variant="h6" mb={2}>
                Unique Winners
              </Typography>
              <UniqueWinnersTable list={uniqueWinners} />
            </Box>
            <Box mt={4}>
              <Typography variant="h6" mb={2}>
                Unique Stakers
              </Typography>
              <UniqueStakersTable list={uniqueStakers} />
            </Box>
            <Box mt={4}>
              <Typography variant="h6" mb={2}>
                Donated Token Distribution per Contract Address
              </Typography>
              <DonatedNFTDistributionTable
                list={data.MainStats.DonatedTokenDistribution}
              />
            </Box>
            <Box mt={4}>
              <Typography variant="h6" mb={2}>
                Cosmic Signature Token Distribution
              </Typography>
              <CSTokenDistributionTable list={cstDistribution} />
            </Box>
            <Box mt={4}>
              <Typography variant="h6" mb={2}>
                Cosmic Token Balance Distribution
              </Typography>
              {ctBalanceDistribution.length > 0 && (
                <Chart
                  transitions={false}
                  style={{ width: "100%", height: 500 }}
                >
                  <ChartLegend visible={false} />
                  <ChartArea background="transparent" />
                  <ChartSeries>
                    <ChartSeriesItem
                      type="pie"
                      data={ctBalanceDistribution.map((value) => ({
                        category: value.OwnerAddr,
                        value: value.BalanceFloat,
                      }))}
                      field="value"
                      categoryField="category"
                      labels={{
                        visible: true,
                        content: (props) => {
                          return `${props.dataItem.category}: ${props.dataItem.value}`;
                        },
                        color: "white",
                        background: "none",
                      }}
                    />
                  </ChartSeries>
                </Chart>
              )}
            </Box>
            <Box mt={4}>
              <CTBalanceDistributionTable
                list={ctBalanceDistribution.slice(0, 20)}
              />
            </Box>
            <Box>
              <Typography variant="h6" mb={2} mt={8}>
                Staking Actions
              </Typography>
              {stakingActions === null ? (
                <Typography variant="h6">Loading...</Typography>
              ) : (
                <GlobalStakingActionsTable list={stakingActions} />
              )}
            </Box>
            <Box>
              <Typography variant="h6" mt={8} mb={2}>
                Staked Tokens
              </Typography>
              {stakedTokens === null ? (
                <Typography variant="h6">Loading...</Typography>
              ) : (
                <GlobalStakedTokensTable list={stakedTokens} />
              )}
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
