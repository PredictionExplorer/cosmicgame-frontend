import React, { useEffect, useState } from "react";
import { Box, Grid, Link, Tab, Tabs, Typography } from "@mui/material";
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
import "@progress/kendo-theme-default/dist/all.css";
import {
  convertTimestampToDateTime,
  formatCSTValue,
  formatEthValue,
  formatSeconds,
} from "../utils";
import { UniqueStakersCSTTable } from "../components/UniqueStakersCSTTable";
import { GlobalStakingActionsTable } from "../components/GlobalStakingActionsTable";
import { GlobalStakedTokensTable } from "../components/GlobalStakedTokensTable";
import { ethers } from "ethers";
import { SystemModesTable } from "../components/SystemModesTable";
import { UniqueStakersRWLKTable } from "../components/UniqueStakersRWLKTable";
import { CustomPagination } from "../components/CustomPagination";
import { CTBalanceDistributionChart } from "../components/CTBalanceDistributionChart";
import { GetServerSideProps } from "next";
// import { UniqueStakersBothTable } from "../components/UniqueStakersBothTable";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const StatisticsItem = ({ title, value }) => {
  return (
    <Box display="flex" my={1}>
      <Typography color="primary" width={{ md: "400px", xs: "200px" }} mr={2}>
        {title}
      </Typography>
      <Typography sx={{ flex: 1, wordBreak: "break-all" }}>{value}</Typography>
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
  // const [uniqueStakers, setUniqueStakers] = useState([]);
  const [uniqueCSTStakers, setUniqueCSTStakers] = useState([]);
  const [uniqueRWLKStakers, setUniqueRWLKStakers] = useState([]);
  const [nftDonations, setNftDonations] = useState([]);
  const [cstDistribution, setCSTDistribution] = useState([]);
  const [ctBalanceDistribution, setCTBalanceDistribution] = useState([]);
  const [stakingCSTActions, setStakingCSTActions] = useState(null);
  const [stakingRWLKActions, setStakingRWLKActions] = useState(null);
  const [stakedCSTokens, setStakedCSTokens] = useState(null);
  const [stakedRWLKTokens, setStakedRWLKTokens] = useState(null);
  const [systemModeChanges, setSystemModeChanges] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cstBidData, setCSTBidData] = useState({
    AuctionDuration: 0,
    CSTPrice: 0,
    SecondsElapsed: 0,
  });
  const [stakingType, setStakingType] = useState(0);

  const handleTabChange = (_event, newValue) => {
    setStakingType(newValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await api.get_dashboard_info();
      setData(data);
      const bidHistory = await api.get_bid_list_by_round(
        data?.CurRoundNum,
        "desc"
      );
      setBidHistory(bidHistory);
      let uniqueBidders = await api.get_unique_bidders();
      uniqueBidders = uniqueBidders.sort((a, b) => b.NumBids - a.NumBids);
      setUniqueBidders(uniqueBidders);
      const uniqueWinners = await api.get_unique_winners();
      setUniqueWinners(uniqueWinners);
      // const uniqueStakers = await api.get_unique_stakers();
      // setUniqueStakers(uniqueStakers);
      let uniqueStakers = await api.get_unique_cst_stakers();
      setUniqueCSTStakers(uniqueStakers);
      uniqueStakers = await api.get_unique_rwalk_stakers();
      setUniqueRWLKStakers(uniqueStakers);
      const nftDonations = await api.get_donations_nft_list();
      setNftDonations(nftDonations);
      const distribution = await api.get_cst_distribution();
      setCSTDistribution(distribution);
      const ctbDistribution = await api.get_ct_balances_distribution();
      setCTBalanceDistribution(ctbDistribution);
      let actions = await api.get_staking_cst_actions();
      setStakingCSTActions(actions);
      actions = await api.get_staking_rwalk_actions();
      setStakingRWLKActions(actions);
      let tokens = await api.get_staked_cst_tokens();
      setStakedCSTokens(tokens);
      tokens = await api.get_staked_rwalk_tokens();
      setStakedRWLKTokens(tokens);
      const sysChanges = await api.get_system_modelist();
      setSystemModeChanges(sysChanges);
      let ctData = await api.get_ct_price();
      if (ctData) {
        setCSTBidData({
          AuctionDuration: parseInt(ctData.AuctionDuration),
          CSTPrice: parseFloat(ethers.utils.formatEther(ctData.CSTPrice)),
          SecondsElapsed: parseInt(ctData.SecondsElapsed),
        });
      }
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
      <MainWrapper>
        {loading || !data ? (
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
                title="Current Bid Price using RandomWalk"
                value={formatEthValue(data.BidPriceEth / 2)}
              />
              <StatisticsItem
                title="Current Bid Price using CST"
                value={
                  cstBidData?.CSTPrice > 0
                    ? formatCSTValue(cstBidData?.CSTPrice)
                    : "FREE"
                }
              />
              <StatisticsItem
                title="Elapsed Time"
                value={formatSeconds(cstBidData?.SecondsElapsed)}
              />
              <StatisticsItem
                title="Auction Duration"
                value={formatSeconds(cstBidData?.AuctionDuration)}
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
                  width={{ md: "400px", xs: "200px" }}
                  mr={2}
                >
                  Prize Claim Date
                </Typography>
                <Box sx={{ flex: 1 }}>
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
                  CURRENT ROUND BID HISTORY
                </Typography>
                <Typography
                  variant="h6"
                  component="span"
                  color="primary"
                  sx={{ ml: 1.5 }}
                >
                  ROUND {data.CurRoundNum}
                </Typography>
              </Box>
              <BiddingHistoryTable biddingHistory={bidHistory} showRound={false} />
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
                      {`${
                        data.NumVoluntaryDonations
                      } totalling ${data.SumVoluntaryDonationsEth.toFixed(
                        4
                      )} ETH`}
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
                title="Number of Raffle Eth Bidding Winners"
                value={data.NumRaffleEthWinnersBidding}
              />
              <StatisticsItem
                title="Number of Raffle NFT Bidding Winners"
                value={data.NumRaffleNFTWinnersBidding}
              />
              {/* <StatisticsItem
                title="Number of Raffle NFT CST Staking Winners"
                value={data.NumRaffleNFTWinnersStakingCST}
              /> */}
              <StatisticsItem
                title="Number of Raffle NFT Random Walk Staking Winners"
                value={data.NumRaffleNFTWinnersStakingRWalk}
              />
              <StatisticsItem
                title="Number of Donated NFTs"
                value={
                  <Link
                    color="inherit"
                    fontSize="inherit"
                    href="/nft-donations"
                  >
                    {data.NumDonatedNFTs}
                  </Link>
                }
              />
              <StatisticsItem
                title="Number of Direct ETH Donors"
                value={
                  <Link color="inherit" fontSize="inherit" href="/donations">
                    {data.MainStats.NumDirectDonations}
                  </Link>
                }
              />
              <StatisticsItem
                title="Amount of Direct ETH Donations"
                value={`${data.MainStats.DirectDonationsEth.toFixed(2)} ETH`}
              />
              <StatisticsItem
                title="Amount of Cosmic Signature Tokens with assigned name"
                value={
                  <Link color="inherit" fontSize="inherit" href="/named-nfts">
                    {data.MainStats.TotalNamedTokens}
                  </Link>
                }
              />
              <StatisticsItem
                title="Number of Unique CST Stakers"
                value={data.MainStats.NumUniqueStakersCST}
              />
              <StatisticsItem
                title="Number of Unique Random Walk Stakers"
                value={data.MainStats.NumUniqueStakersRWalk}
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
            {/* <Box mt={4}>
              <Typography variant="h6" mb={2}>
                Unique Stakers
              </Typography>
              <UniqueStakersBothTable list={uniqueStakers} />
            </Box> */}
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
                Cosmic Signature Token (ERC721) Distribution
              </Typography>
              <CSTokenDistributionTable list={cstDistribution} />
            </Box>

            <Box mt={4}>
              <Typography variant="h6" mb={2}>
                Cosmic Token (ERC20) Balance Distribution
              </Typography>
              <CTBalanceDistributionChart list={ctBalanceDistribution} />
            </Box>
            <Box mt={4}>
              <CTBalanceDistributionTable
                list={ctBalanceDistribution.slice(0, 20)}
              />
            </Box>

            <Box sx={{ mt: 4, borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={stakingType} onChange={handleTabChange}>
                <Tab
                  label={
                    <Typography variant="h6">CosmicSignature Token</Typography>
                  }
                />
                <Tab
                  label={<Typography variant="h6">RandomWalk Token</Typography>}
                />
              </Tabs>
            </Box>
            <CustomTabPanel value={stakingType} index={0}>
              <StatisticsItem
                title="Number of Active Stakers"
                value={data.MainStats.StakeStatisticsCST.NumActiveStakers}
              />
              <StatisticsItem
                title="Number of Staking Rewards Deposits"
                value={data.MainStats.StakeStatisticsCST.NumDeposits}
              />
              <StatisticsItem
                title="Total Staking Rewards"
                value={`${data.MainStats.StakeStatisticsCST.TotalRewardEth.toFixed(
                  4
                )} ETH`}
              />
              <StatisticsItem
                title="Total Tokens Minted"
                value={data.MainStats.StakeStatisticsCST.TotalTokensMinted}
              />
              <StatisticsItem
                title="Total Tokens Staked"
                value={data.MainStats.StakeStatisticsCST.TotalTokensStaked}
              />
              <StatisticsItem
                title="Unclaimed Staking Rewards"
                value={`${data.MainStats.StakeStatisticsCST.UnclaimedRewardEth.toFixed(
                  4
                )} ETH`}
              />
              <Box>
                <Typography variant="subtitle1" mt={2} mb={2}>
                  Stake / Unstake Actions
                </Typography>
                {stakingCSTActions === null ? (
                  <Typography variant="h6">Loading...</Typography>
                ) : (
                  <GlobalStakingActionsTable
                    list={stakingCSTActions}
                    IsRWLK={false}
                  />
                )}
              </Box>
              <Box mt={4}>
                <Typography variant="subtitle1" mb={2}>
                  Staked Tokens
                </Typography>
                {stakedCSTokens === null ? (
                  <Typography variant="h6">Loading...</Typography>
                ) : (
                  <GlobalStakedTokensTable
                    list={stakedCSTokens}
                    IsRWLK={false}
                  />
                )}
              </Box>
              <Box mt={4}>
                <Typography variant="subtitle1" mb={2}>
                  Unique Stakers
                </Typography>
                <UniqueStakersCSTTable list={uniqueCSTStakers} />
              </Box>
            </CustomTabPanel>
            <CustomTabPanel value={stakingType} index={1}>
              <StatisticsItem
                title="Number of Active Stakers"
                value={data.MainStats.StakeStatisticsRWalk.NumActiveStakers}
              />
              <StatisticsItem
                title="Total Tokens Minted"
                value={data.MainStats.StakeStatisticsRWalk.TotalTokensMinted}
              />
              <StatisticsItem
                title="Total Tokens Staked"
                value={data.MainStats.StakeStatisticsRWalk.TotalTokensStaked}
              />
              <Box>
                <Typography variant="subtitle1" mt={2} mb={2}>
                  Stake / Unstake Actions
                </Typography>
                {stakingRWLKActions === null ? (
                  <Typography variant="h6">Loading...</Typography>
                ) : (
                  <GlobalStakingActionsTable
                    list={stakingRWLKActions}
                    IsRWLK={true}
                  />
                )}
              </Box>
              <Box mt={4}>
                <Typography variant="subtitle1" mb={2}>
                  Staked Tokens
                </Typography>
                {stakedRWLKTokens === null ? (
                  <Typography variant="h6">Loading...</Typography>
                ) : (
                  <GlobalStakedTokensTable
                    list={stakedRWLKTokens}
                    IsRWLK={true}
                  />
                )}
              </Box>
              <Box mt={4}>
                <Typography variant="subtitle1" mb={2}>
                  Unique Stakers
                </Typography>
                <UniqueStakersRWLKTable list={uniqueRWLKStakers} />
              </Box>
            </CustomTabPanel>
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
                          xs={6}
                          sm={4}
                          md={3}
                          lg={2}
                        >
                          <DonatedNFT nft={nft} />
                        </Grid>
                      ))}
                  </Grid>
                  <CustomPagination
                    page={curPage}
                    setPage={setCurrentPage}
                    totalLength={nftDonations.length}
                    perPage={perPage}
                  />
                </>
              ) : (
                <Typography mt={2}>
                  No ERC721 tokens were donated on this round.
                </Typography>
              )}
            </Box>
            <Box>
              <Typography variant="h6" mb={2} mt={8}>
                System Mode Changes
              </Typography>
              {systemModeChanges === null ? (
                <Typography variant="h6">Loading...</Typography>
              ) : (
                <SystemModesTable list={systemModeChanges} />
              )}
            </Box>
          </>
        )}
      </MainWrapper>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Statistics | Cosmic Signature";
  const description =
    "Explore comprehensive statistics on Cosmic Signature. Access data on market trends, token performance, user activity, and more. Stay informed with real-time insights into our blockchain ecosystem.";
  const imageUrl = "https://cosmic-game2.s3.us-east-2.amazonaws.com/logo.png";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default Statistics;
