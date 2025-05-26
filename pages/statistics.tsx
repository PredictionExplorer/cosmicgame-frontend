import React, { useEffect, useState, useCallback } from "react";
import { Box, Grid, Link, Tab, Tabs, Typography } from "@mui/material";
import Countdown from "react-countdown";
import { ethers } from "ethers";
import { GetServerSideProps } from "next";

import { MainWrapper } from "../components/styled";
import api from "../services/api";

// Component imports
import BiddingHistoryTable from "../components/BiddingHistoryTable";
import { UniqueBiddersTable } from "../components/UniqueBiddersTable";
import { UniqueWinnersTable } from "../components/UniqueWinnersTable";
import DonatedNFT from "../components/DonatedNFT";
import DonatedNFTDistributionTable from "../components/DonatedNFTDistributionTable";
import { CSTokenDistributionTable } from "../components/CSTokenDistributionTable";
import { CTBalanceDistributionTable } from "../components/CTBalanceDistributionTable";
import { UniqueStakersCSTTable } from "../components/UniqueStakersCSTTable";
import { GlobalStakingActionsTable } from "../components/GlobalStakingActionsTable";
import { GlobalStakedTokensTable } from "../components/GlobalStakedTokensTable";
import { SystemModesTable } from "../components/SystemModesTable";
import { UniqueStakersRWLKTable } from "../components/UniqueStakersRWLKTable";
import { CustomPagination } from "../components/CustomPagination";
import { CTBalanceDistributionChart } from "../components/CTBalanceDistributionChart";
import { UniqueEthDonorsTable } from "../components/UniqueEthDonorsTable";

// Constants, config, and utils
import { ZERO_ADDRESS } from "../config/misc";
import {
  convertTimestampToDateTime,
  formatCSTValue,
  formatEthValue,
  formatSeconds,
  logoImgUrl,
} from "../utils";

// ------------------------------------------------------------------
// Types & Interfaces
// ------------------------------------------------------------------
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface StatisticsItemProps {
  title: string;
  value: React.ReactNode;
}

interface CSTBidData {
  AuctionDuration: number;
  CSTPrice: number;
  SecondsElapsed: number;
}

/* ------------------------------------------------------------------
  Sub-Components / Small Helpers
------------------------------------------------------------------ */

/**
 * CustomTabPanel conditionally renders its `children` if `value === index`.
 */
function CustomTabPanel({ children, value, index, ...other }: TabPanelProps) {
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

/**
 * StatisticsItem displays a title (left) and a value (right).
 * Useful for showing key-value pairs in a vertical list.
 */
const StatisticsItem = ({ title, value }: StatisticsItemProps) => (
  <Box display="flex" my={1} flexWrap="wrap">
    <Typography
      color="primary"
      width={{ md: "400px", xs: "200px" }}
      mr={2}
      sx={{ fontWeight: 500 }}
    >
      {title}
    </Typography>
    <Typography sx={{ flex: 1, wordBreak: "break-all" }}>{value}</Typography>
  </Box>
);

/**
 * Renders a countdown timer for how long is left until a specified date/time.
 */
const CountdownRenderer = ({ days, hours, minutes, seconds }: any) => {
  let result = "";
  if (days) result += `${days}d `;
  if (hours || result) result += `${hours}h `;
  if (minutes || result) result += `${minutes}m `;
  if (seconds || result) result += `${seconds}s`;
  if (result !== "") result += " left";
  return result !== "" ? <Typography>{result}</Typography> : null;
};

/* ------------------------------------------------------------------
  Main Component: Statistics
------------------------------------------------------------------ */
const Statistics = () => {
  const ITEMS_PER_PAGE = 12;

  // Tabs for staking type (0 = CST, 1 = RandomWalk)
  const [stakingType, setStakingType] = useState(0);

  // Pagination for donated NFTs
  const [currentNFTPage, setNFTPage] = useState(1);

  // Primary data from API
  const [data, setData] = useState<any>(null);

  // Realtime CST price and bidding info
  const [cstBidData, setCSTBidData] = useState<CSTBidData>({
    AuctionDuration: 0,
    CSTPrice: 0,
    SecondsElapsed: 0,
  });

  // Additional data sets
  const [currentRoundBidHistory, setCurrentRoundBidHistory] = useState<any[]>(
    []
  );
  const [uniqueBidders, setUniqueBidders] = useState<any[]>([]);
  const [uniqueWinners, setUniqueWinners] = useState<any[]>([]);
  const [uniqueCSTStakers, setUniqueCSTStakers] = useState<any[]>([]);
  const [uniqueRWLKStakers, setUniqueRWLKStakers] = useState<any[]>([]);
  const [uniqueDonors, setUniqueDonors] = useState<any[]>([]);
  const [nftDonations, setNftDonations] = useState<any[]>([]);
  const [cstDistribution, setCSTDistribution] = useState<any[]>([]);
  const [ctBalanceDistribution, setCTBalanceDistribution] = useState<any[]>([]);
  const [stakingCSTActions, setStakingCSTActions] = useState<any>(null);
  const [stakingRWLKActions, setStakingRWLKActions] = useState<any>(null);
  const [stakedCSTokens, setStakedCSTokens] = useState<any>(null);
  const [stakedRWLKTokens, setStakedRWLKTokens] = useState<any>(null);
  const [systemModeChanges, setSystemModeChanges] = useState<any>(null);

  // Loading state
  const [loading, setLoading] = useState(true);

  /* ------------------------------------------------------------------
    Data Fetching
  ------------------------------------------------------------------ */

  // Fetch core stats and multiple lists in parallel
  const fetchData = async () => {
    setLoading(true);
    try {
      const dashboardData = await api.get_dashboard_info();
      setData(dashboardData);

      const curRoundBidHistoryPromise = api.get_bid_list_by_round(
        dashboardData?.CurRoundNum,
        "desc"
      );

      // Parallel data calls
      const [
        uniqueBiddersData,
        uniqueWinnersData,
        uniqueCSTStakersData,
        uniqueRWLKStakersData,
        uniqueDonorsData,
        nftDonationsData,
        cstDistributionData,
        ctbDistributionData,
        stakingCSTActionsData,
        stakingRWLKActionsData,
        stakedCSTokensData,
        stakedRWLKTokensData,
        sysChangesData,
      ] = await Promise.all([
        api.get_unique_bidders(),
        api.get_unique_winners(),
        api.get_unique_cst_stakers(),
        api.get_unique_rwalk_stakers(),
        api.get_unique_donors(),
        api.get_donations_nft_list(),
        api.get_cst_distribution(),
        api.get_ct_balances_distribution(),
        api.get_staking_cst_actions(),
        api.get_staking_rwalk_actions(),
        api.get_staked_cst_tokens(),
        api.get_staked_rwalk_tokens(),
        api.get_system_modelist(),
      ]);

      const curRoundBidHistory = await curRoundBidHistoryPromise;

      // Set states
      setCurrentRoundBidHistory(curRoundBidHistory);
      setUniqueBidders(
        uniqueBiddersData.sort((a: any, b: any) => b.NumBids - a.NumBids)
      );
      setUniqueWinners(uniqueWinnersData);
      setUniqueCSTStakers(uniqueCSTStakersData);
      setUniqueRWLKStakers(uniqueRWLKStakersData);
      setUniqueDonors(uniqueDonorsData);
      setNftDonations(nftDonationsData);
      setCSTDistribution(cstDistributionData);
      setCTBalanceDistribution(ctbDistributionData);
      setStakingCSTActions(stakingCSTActionsData);
      setStakingRWLKActions(stakingRWLKActionsData);
      setStakedCSTokens(stakedCSTokensData);
      setStakedRWLKTokens(stakedRWLKTokensData);
      setSystemModeChanges(sysChangesData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch real-time CST price and bidding info
  const fetchCSTBidData = useCallback(async () => {
    try {
      const ctData = await api.get_ct_price();
      if (ctData) {
        setCSTBidData({
          AuctionDuration: parseInt(ctData.AuctionDuration, 10),
          CSTPrice: parseFloat(ethers.utils.formatEther(ctData.CSTPrice)),
          SecondsElapsed: parseInt(ctData.SecondsElapsed, 10),
        });
      }
    } catch (err) {
      console.error("Error fetching CST bid data:", err);
    }
  }, []);

  // Poll `fetchCSTBidData` every 5 seconds
  useEffect(() => {
    fetchData();
    fetchCSTBidData();

    const interval = setInterval(fetchCSTBidData, 5000);
    return () => clearInterval(interval);
  }, [fetchCSTBidData]);

  /* ------------------------------------------------------------------
    Handlers
  ------------------------------------------------------------------ */

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setStakingType(newValue);
  };

  // Custom countdown text for "Time Left"
  const renderCountdown = () => {
    if (!data) return null;
    if (data.PrizeClaimTs <= Date.now() / 1000) return null;

    return (
      <Box display="flex" my={1}>
        <Typography
          color="primary"
          width={{ md: "400px", xs: "200px" }}
          mr={2}
          sx={{ fontWeight: 500 }}
        >
          Time Left
        </Typography>
        <Box sx={{ flex: 1 }}>
          <Countdown
            date={data.PrizeClaimTs * 1000}
            renderer={CountdownRenderer}
          />
        </Box>
      </Box>
    );
  };

  /* ------------------------------------------------------------------
    Conditional Renders
  ------------------------------------------------------------------ */
  if (loading || !data) {
    return (
      <MainWrapper>
        <Typography variant="h6">Loading...</Typography>
      </MainWrapper>
    );
  }

  /* ------------------------------------------------------------------
    Computed Arrays for Display
  ------------------------------------------------------------------ */
  const currentRoundStats = [
    { title: "Current Round", value: data.CurRoundNum },
    {
      title: "Round Start Date",
      value:
        data.LastBidderAddr === ZERO_ADDRESS
          ? "Round isn't started yet."
          : convertTimestampToDateTime(data.TsRoundStart),
    },
    { title: "Current Bid Price", value: formatEthValue(data.BidPriceEth) },
    {
      title: "Current Bid Price using RandomWalk",
      value: formatEthValue(data.BidPriceEth / 2),
    },
    {
      title: "Current Bid Price using CST",
      value:
        cstBidData?.CSTPrice > 0 ? formatCSTValue(cstBidData.CSTPrice) : "FREE",
    },
    {
      title: "CST Auction Elapsed Time",
      value: formatSeconds(cstBidData.SecondsElapsed),
    },
    {
      title: "CST Auction Duration",
      value: formatSeconds(cstBidData.AuctionDuration),
    },
    { title: "Number of Bids Since Round Start", value: data.CurNumBids },
    {
      title: "Total Donated NFTs",
      value: data.CurRoundStats.TotalDonatedNFTs,
    },
    {
      title: "Total Donated ETH",
      value: (
        <Link
          sx={{
            color: "inherit",
            fontSize: "inherit",
            fontFamily: "monospace",
          }}
          href={`/eth-donation/round/${data.CurRoundNum}`}
          target="_blank"
        >
          {formatEthValue(data.CurRoundStats.TotalDonatedAmountEth)}
        </Link>
      ),
    },
    {
      title: "Prize Amount",
      value: formatEthValue(data.PrizeAmountEth),
    },
    {
      title: "Prize Claim Date",
      value:
        data.PrizeClaimTs === 0
          ? "Round isn't started yet."
          : convertTimestampToDateTime(data.PrizeClaimTs, true),
    },
    {
      title: "Last Bidder",
      value:
        data.LastBidderAddr === ZERO_ADDRESS ? (
          "Round isn't started yet."
        ) : (
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
        ),
    },
  ];

  const overallStats = [
    {
      title: "CosmicGame contract balance",
      value: `${data.CosmicGameBalanceEth.toFixed(4)} ETH`,
    },
    {
      title: "Num Prizes Given",
      value: (
        <Link href="/prize" color="inherit" fontSize="inherit">
          {data.TotalPrizes}
        </Link>
      ),
    },
    {
      title: "Total Cosmic Signature Tokens minted",
      value: (
        <Link href="/gallery" color="inherit" fontSize="inherit">
          {data.MainStats.NumCSTokenMints}
        </Link>
      ),
    },
    {
      title: "Total Amount Paid in Main Prizes",
      value: formatEthValue(data.TotalPrizesPaidAmountEth),
    },
    {
      title: "Total Amount Paid in ETH Raffles",
      value: formatEthValue(data.MainStats.TotalRaffleEthDeposits),
    },
    {
      title: "Total CST Consumed",
      value: formatCSTValue(data.MainStats.TotalCSTConsumedEth),
    },
    {
      title: "Total Reward Paid to Marketing Agents with CST",
      value: formatCSTValue(data.MainStats.TotalMktRewardsEth),
    },
    {
      title: "Number of Marketing Reward Transactions",
      value: (
        <Link color="inherit" fontSize="inherit" href="/marketing">
          {data.MainStats.NumMktRewards}
        </Link>
      ),
    },
    {
      title: "Amount of ETH collected by the winners from raffles",
      value: formatEthValue(data.MainStats.TotalRaffleEthWithdrawn),
    },
    {
      title: "RandomWalk Tokens Used",
      value: (
        <Link color="inherit" fontSize="inherit" href="/used-rwlk-nfts">
          {data.NumRwalkTokensUsed}
        </Link>
      ),
    },
    {
      title: "Charity Balance",
      value: formatEthValue(data.CharityBalanceEth),
    },
    {
      title: "Number of Bids with CST",
      value: data.MainStats.NumBidsCST,
    },
    {
      title: "Number of Unique Bidders",
      value: data.MainStats.NumUniqueBidders,
    },
    {
      title: "Number of Unique Winners",
      value: data.MainStats.NumUniqueWinners,
    },
    {
      title: "Number of Unique ETH Donors",
      value: data.MainStats.NumUniqueDonors,
    },
    {
      title: "Number of Donated NFTs",
      value: (
        <Link color="inherit" fontSize="inherit" href="/nft-donations">
          {data.NumDonatedNFTs}
        </Link>
      ),
    },
    {
      title: "Amount of Cosmic Signature Tokens with assigned name",
      value: (
        <Link color="inherit" fontSize="inherit" href="/named-nfts">
          {data.MainStats.TotalNamedTokens}
        </Link>
      ),
    },
    {
      title: "Number of Unique CST Stakers",
      value: data.MainStats.NumUniqueStakersCST,
    },
    {
      title: "Number of Unique Random Walk Stakers",
      value: data.MainStats.NumUniqueStakersRWalk,
    },
  ];

  return (
    <MainWrapper>
      {/* Current Round Statistics */}
      <Typography variant="h5">Current Round Statistics</Typography>
      <Box my={4}>
        {currentRoundStats.map((item) => (
          <StatisticsItem
            key={item.title}
            title={item.title}
            value={item.value}
          />
        ))}
        {renderCountdown()}
      </Box>

      {/* Bidding History for the Current Round */}
      <Box my={4}>
        <Typography variant="h6">BID HISTORY FOR CURRENT ROUND</Typography>
        <BiddingHistoryTable
          biddingHistory={currentRoundBidHistory}
          showRound={false}
        />
      </Box>

      {/* Overall Statistics */}
      <Typography variant="h5">Overall Statistics</Typography>
      <Box mt={4}>
        {overallStats.map((item) => (
          <StatisticsItem
            key={item.title}
            title={item.title}
            value={item.value}
          />
        ))}
        {/* Additional Conditional Stats */}
        {data.MainStats.NumWinnersWithPendingRaffleWithdrawal > 0 && (
          <Typography color="primary">
            {`${
              data.MainStats.NumWinnersWithPendingRaffleWithdrawal
            } winners are yet to withdraw funds 
              totaling ${formatEthValue(
                data.MainStats.TotalRaffleEthDeposits -
                  data.MainStats.TotalRaffleEthWithdrawn
              )} ETH`}
          </Typography>
        )}
        {data.MainStats.NumCosmicGameDonations > 0 && (
          <>
            <StatisticsItem
              title="Number of Cosmic Game Donations"
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
          </>
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
                } totaling ${data.SumVoluntaryDonationsEth.toFixed(4)} ETH`}
              </Link>
            }
          />
        )}
        {data.MainStats.NumWithdrawals > 0 && (
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
        )}
        <StatisticsItem
          title="Total amount withdrawn from Charity Wallet"
          value={formatEthValue(data.MainStats.SumWithdrawals)}
        />
        <StatisticsItem
          title="Total Donated ETH"
          value={
            <Link
              color="inherit"
              fontSize="inherit"
              href="/eth-donation"
              target="_blank"
            >
              {formatEthValue(data.MainStats.TotalEthDonatedAmountEth)}
            </Link>
          }
        />
      </Box>

      {/* Unique Bidders */}
      <Box mt={4}>
        <Typography variant="h6" mb={2}>
          Unique Bidders
        </Typography>
        <UniqueBiddersTable list={uniqueBidders} />
      </Box>

      {/* Unique Winners */}
      <Box mt={4}>
        <Typography variant="h6" mb={2}>
          Unique Winners
        </Typography>
        <UniqueWinnersTable list={uniqueWinners} />
      </Box>

      {/* Unique Eth Donors */}
      <Box mt={4}>
        <Typography variant="h6" mb={2}>
          Unique Eth Donors
        </Typography>
        <UniqueEthDonorsTable list={uniqueDonors} />
      </Box>

      {/* Donated NFT Distribution */}
      <Box mt={4}>
        <Typography variant="h6" mb={2}>
          Donated Token Distribution per Contract Address
        </Typography>
        <DonatedNFTDistributionTable
          list={data.MainStats.DonatedTokenDistribution}
        />
      </Box>

      {/* CST Distribution */}
      <Box mt={4}>
        <Typography variant="h6" mb={2}>
          Cosmic Signature Token (ERC721) Distribution
        </Typography>
        <CSTokenDistributionTable list={cstDistribution} />
      </Box>

      {/* CT Balance Distribution */}
      <Box mt={4}>
        <Typography variant="h6" mb={2}>
          Cosmic Token (ERC20) Balance Distribution
        </Typography>
        <CTBalanceDistributionChart list={ctBalanceDistribution} />
      </Box>
      <Box mt={4}>
        <CTBalanceDistributionTable list={ctBalanceDistribution.slice(0, 20)} />
      </Box>

      {/* Staking Tabs */}
      <Box sx={{ mt: 4, borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={stakingType} onChange={handleTabChange}>
          <Tab
            label={<Typography variant="h6">CosmicSignature Token</Typography>}
          />
          <Tab label={<Typography variant="h6">RandomWalk Token</Typography>} />
        </Tabs>
      </Box>

      {/* Tab Panel: CosmicSignature Staking */}
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

        {/* CST Stake/Unstake Actions */}
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

        {/* CST Staked Tokens */}
        <Box mt={4}>
          <Typography variant="subtitle1" mb={2}>
            Staked Tokens
          </Typography>
          {stakedCSTokens === null ? (
            <Typography variant="h6">Loading...</Typography>
          ) : (
            <GlobalStakedTokensTable list={stakedCSTokens} IsRWLK={false} />
          )}
        </Box>

        {/* Unique CST Stakers */}
        <Box mt={4}>
          <Typography variant="subtitle1" mb={2}>
            Unique Stakers
          </Typography>
          <UniqueStakersCSTTable list={uniqueCSTStakers} />
        </Box>
      </CustomTabPanel>

      {/* Tab Panel: RandomWalk Staking */}
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

        {/* RWLK Stake/Unstake Actions */}
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

        {/* RWLK Staked Tokens */}
        <Box mt={4}>
          <Typography variant="subtitle1" mb={2}>
            Staked Tokens
          </Typography>
          {stakedRWLKTokens === null ? (
            <Typography variant="h6">Loading...</Typography>
          ) : (
            <GlobalStakedTokensTable list={stakedRWLKTokens} IsRWLK={true} />
          )}
        </Box>

        {/* Unique RWLK Stakers */}
        <Box mt={4}>
          <Typography variant="subtitle1" mb={2}>
            Unique Stakers
          </Typography>
          <UniqueStakersRWLKTable list={uniqueRWLKStakers} />
        </Box>
      </CustomTabPanel>

      {/* Donated NFTs */}
      <Box mt={4}>
        <Typography variant="h6" mb={2}>
          Donated NFTs
        </Typography>
        {nftDonations.length > 0 ? (
          <>
            <Grid container spacing={2} mt={2}>
              {nftDonations
                .slice(
                  (currentNFTPage - 1) * ITEMS_PER_PAGE,
                  currentNFTPage * ITEMS_PER_PAGE
                )
                .map((nft) => (
                  <Grid item key={nft.RecordId} xs={6} sm={4} md={3} lg={2}>
                    <DonatedNFT nft={nft} />
                  </Grid>
                ))}
            </Grid>
            <CustomPagination
              page={currentNFTPage}
              setPage={setNFTPage}
              totalLength={nftDonations.length}
              perPage={ITEMS_PER_PAGE}
            />
          </>
        ) : (
          <Typography mt={2}>
            No ERC721 tokens were donated on this round.
          </Typography>
        )}
      </Box>

      {/* Round Activations */}
      <Box>
        <Typography variant="h6" mb={2} mt={8}>
          Round Activations
        </Typography>
        {systemModeChanges === null ? (
          <Typography variant="h6">Loading...</Typography>
        ) : (
          <SystemModesTable list={systemModeChanges} />
        )}
      </Box>
    </MainWrapper>
  );
};

/* ------------------------------------------------------------------
  Server-Side Rendering (SSR) for SEO
------------------------------------------------------------------ */
export const getServerSideProps: GetServerSideProps = async () => {
  const title = "Statistics | Cosmic Signature";
  const description =
    "Explore comprehensive statistics on Cosmic Signature. Access data on market trends, token performance, user activity, and more. Stay informed with real-time insights into our blockchain ecosystem.";

  const openGraphData = [
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: logoImgUrl },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: logoImgUrl },
  ];

  return { props: { title, description, openGraphData } };
};

export default Statistics;
