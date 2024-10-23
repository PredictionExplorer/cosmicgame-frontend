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
import { UniqueEthDonorsTable } from "../components/UniqueEthDonorsTable";
import EthDonationTable from "../components/EthDonationTable";

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

interface StatisticsItemProps {
  title: string;
  value: React.ReactNode;
}

const StatisticsItem = ({ title, value }: StatisticsItemProps) => (
  <Box display="flex" my={1}>
    <Typography color="primary" width={{ md: "400px", xs: "200px" }} mr={2}>
      {title}
    </Typography>
    <Typography sx={{ flex: 1, wordBreak: "break-all" }}>{value}</Typography>
  </Box>
);

const Statistics = () => {
  const perPage = 12;
  const [curPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<any>(null);
  const [currentRoundBidHistory, setCurrentRoundBidHistory] = useState<any[]>(
    []
  );
  const [uniqueBidders, setUniqueBidders] = useState<any[]>([]);
  const [uniqueWinners, setUniqueWinners] = useState<any[]>([]);
  const [uniqueCSTStakers, setUniqueCSTStakers] = useState<any[]>([]);
  const [uniqueRWLKStakers, setUniqueRWLKStakers] = useState<any[]>([]);
  const [uniqueDonors, setUniqueDonors] = useState<any[]>([]);
  const [nftDonations, setNftDonations] = useState<any[]>([]);
  const [ethDonations, setEthDonations] = useState<any[]>([]);
  const [cstDistribution, setCSTDistribution] = useState<any[]>([]);
  const [ctBalanceDistribution, setCTBalanceDistribution] = useState<any[]>([]);
  const [stakingCSTActions, setStakingCSTActions] = useState<any>(null);
  const [stakingRWLKActions, setStakingRWLKActions] = useState<any>(null);
  const [stakedCSTokens, setStakedCSTokens] = useState<any>(null);
  const [stakedRWLKTokens, setStakedRWLKTokens] = useState<any>(null);
  const [systemModeChanges, setSystemModeChanges] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cstBidData, setCSTBidData] = useState({
    AuctionDuration: 0,
    CSTPrice: 0,
    SecondsElapsed: 0,
  });
  const [stakingType, setStakingType] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setStakingType(newValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await api.get_dashboard_info();
      setData(data);

      // Fetch data that depends on 'data'
      const curBidHistoryPromise = api.get_bid_list_by_round(
        data?.CurRoundNum,
        "desc"
      );

      // Fetch other data in parallel
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

      const curBidHistory = await curBidHistoryPromise;

      setCurrentRoundBidHistory(curBidHistory);
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
      setLoading(false);
    };

    const fetchCSTBidData = async () => {
      let ctData = await api.get_ct_price();
      if (ctData) {
        setCSTBidData({
          AuctionDuration: parseInt(ctData.AuctionDuration),
          CSTPrice: parseFloat(ethers.utils.formatEther(ctData.CSTPrice)),
          SecondsElapsed: parseInt(ctData.SecondsElapsed),
        });
      }
    };

    fetchData();
    fetchCSTBidData();

    const interval = setInterval(() => {
      fetchCSTBidData();
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const renderer = ({ days, hours, minutes, seconds }: any) => {
    let result = "";
    if (days) result += `${days}d `;
    if (hours || result) result += `${hours}h `;
    if (minutes || result) result += `${minutes}m `;
    if (seconds || result) result += `${seconds}s`;
    if (result !== "") result += " left";
    return result !== "" && <Typography>{result}</Typography>;
  };

  if (loading || !data) {
    return (
      <MainWrapper>
        <Typography variant="h6">Loading...</Typography>
      </MainWrapper>
    );
  }

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
        cstBidData?.CSTPrice > 0
          ? formatCSTValue(cstBidData?.CSTPrice)
          : "FREE",
    },
    { title: "Elapsed Time", value: formatSeconds(cstBidData?.SecondsElapsed) },
    {
      title: "Auction Duration",
      value: formatSeconds(cstBidData?.AuctionDuration),
    },
    { title: "Number of Bids Since Round Start", value: data.CurNumBids },
    {
      title: "Total Donated NFTs",
      value: data.CurRoundStats.TotalDonatedNFTs,
    },
    {
      title: "Total Raffle Eth Deposits",
      value: `${data.CurRoundStats.TotalRaffleEthDepositsEth.toFixed(4)} ETH`,
    },
    {
      title: "Total Raffle NFTs",
      value: data.CurRoundStats.TotalRaffleNFTs,
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
      <Typography variant="h5">Current Round Statistics</Typography>
      <Box my={4}>
        {currentRoundStats.map((item) => (
          <StatisticsItem
            key={item.title}
            title={item.title}
            value={item.value}
          />
        ))}
        {data.PrizeClaimTs > Date.now() / 1000 && (
          <Box display="flex" flexWrap="wrap" my={1}>
            <Typography
              color="primary"
              width={{ md: "400px", xs: "200px" }}
              mr={2}
            >
              Time Left
            </Typography>
            <Box sx={{ flex: 1 }}>
              <Countdown date={data.PrizeClaimTs * 1000} renderer={renderer} />
            </Box>
          </Box>
        )}
      </Box>
      <Box my={4}>
        <Typography variant="h6">BID HISTORY FOR CURRENT ROUND</Typography>
        <BiddingHistoryTable
          biddingHistory={currentRoundBidHistory}
          showRound={false}
        />
      </Box>
      {ethDonations.length > 0 && (
        <Box my={4}>
          <Typography variant="h6">ETH DONATIONS FOR CURRENT ROUND</Typography>
          <EthDonationTable list={ethDonations} />
        </Box>
      )}
      <Typography variant="h5">Overall Statistics</Typography>
      <Box mt={4}>
        {overallStats.map((item) => (
          <StatisticsItem
            key={item.title}
            title={item.title}
            value={item.value}
          />
        ))}
        {data.MainStats.NumWinnersWithPendingRaffleWithdrawal > 0 && (
          <Typography color="primary">
            {`${
              data.MainStats.NumWinnersWithPendingRaffleWithdrawal
            } winners are yet to withdraw funds totaling an amount of ${formatEthValue(
              data.MainStats.TotalRaffleEthDeposits -
                data.MainStats.TotalRaffleEthWithdrawn
            )}`}
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
          Unique Eth Donors
        </Typography>
        <UniqueEthDonorsTable list={uniqueDonors} />
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
        <CTBalanceDistributionTable list={ctBalanceDistribution.slice(0, 20)} />
      </Box>
      <Box sx={{ mt: 4, borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={stakingType} onChange={handleTabChange}>
          <Tab
            label={<Typography variant="h6">CosmicSignature Token</Typography>}
          />
          <Tab label={<Typography variant="h6">RandomWalk Token</Typography>} />
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
            <GlobalStakedTokensTable list={stakedCSTokens} IsRWLK={false} />
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
            <GlobalStakedTokensTable list={stakedRWLKTokens} IsRWLK={true} />
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
                  <Grid item key={nft.RecordId} xs={6} sm={4} md={3} lg={2}>
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
    </MainWrapper>
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
