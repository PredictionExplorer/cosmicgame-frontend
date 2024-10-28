import React, { useEffect, useState } from "react";
import { Box, Button, Link, Tab, Tabs, Typography } from "@mui/material";
import { MainWrapper } from "../components/styled";
import api from "../services/api";
import { ethers } from "ethers";
import { formatEthValue } from "../utils";
import { useStakedToken } from "../contexts/StakedTokenContext";
import { useApiData } from "../contexts/ApiDataContext";
import { useActiveWeb3React } from "../hooks/web3";
import useCosmicGameContract from "../hooks/useCosmicGameContract";
import getErrorMessage from "../utils/alert";
import { useNotification } from "../contexts/NotificationContext";
import { GetServerSideProps } from "next";
import StakingActionsTable from "../components/StakingActionsTable";
import BiddingHistoryTable from "../components/BiddingHistoryTable";
import { CSTTable } from "./my-tokens";
import WinningHistoryTable from "../components/WinningHistoryTable";
import UnclaimedStakingRewardsTable from "../components/UnclaimedStakingRewardsTable";
import CollectedStakingRewardsTable from "../components/CollectedStakingRewardsTable";
import MarketingRewardsTable from "../components/MarketingRewardsTable";
import DonatedNFTTable from "../components/DonatedNFTTable";

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

const MyStatistics = () => {
  const { account } = useActiveWeb3React();
  const [data, setData] = useState(null);
  const [claimedDonatedNFTs, setClaimedDonatedNFTs] = useState({
    data: [],
    loading: false,
  });
  const [unclaimedDonatedNFTs, setUnclaimedDonatedNFTs] = useState({
    data: [],
    loading: false,
  });
  const [claimHistory, setClaimHistory] = useState(null);
  const [bidHistory, setBidHistory] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [balance, setBalance] = useState({ CosmicToken: 0, ETH: 0 });
  const [loading, setLoading] = useState(true);
  const [unclaimedStakingRewards, setUnclaimedStakingRewards] = useState([]);
  const [collectedStakingRewards, setCollectedStakingRewards] = useState([]);
  const [stakingCSTActions, setStakingCSTActions] = useState([]);
  const [stakingRWLKActions, setStakingRWLKActions] = useState([]);
  const [marketingRewards, setMarketingRewards] = useState([]);
  const [cstList, setCSTList] = useState([]);
  const [isClaiming, setIsClaiming] = useState(false);
  const [stakingTable, setStakingTable] = useState(0);
  const [raffleETHProbability, setRaffleETHProbability] = useState(0);
  const [raffleNFTProbability, setRaffleNFTProbability] = useState(0);
  const { fetchData: fetchStakedToken } = useStakedToken();
  const { fetchData: fetchStatusData } = useApiData();
  const { setNotification } = useNotification();

  const cosmicGameContract = useCosmicGameContract();

  const fetchData = async (addr: string, reload: boolean = true) => {
    setLoading(reload);
    try {
      const [
        history,
        { Bids, UserInfo },
        balance,
        unclaimedStakingRewards,
        collectedStakingRewards,
        stakingCSTActions,
        stakingRWLKActions,
        marketingRewards,
        cstList,
      ] = await Promise.all([
        api.get_claim_history_by_user(addr),
        api.get_user_info(addr),
        api.get_user_balance(addr),
        api.get_unclaimed_staking_rewards_by_user(addr),
        api.get_collected_staking_rewards_by_user(addr),
        api.get_staking_cst_actions_by_user(addr),
        api.get_staking_rwalk_actions_by_user(addr),
        api.get_marketing_rewards_by_user(addr),
        api.get_cst_tokens_by_user(addr),
        api.get_donations_by_user(addr),
      ]);
      setClaimHistory(history);
      setBidHistory(Bids);
      setUserInfo(UserInfo);
      if (balance) {
        setBalance({
          CosmicToken: Number(
            ethers.utils.formatEther(balance.CosmicTokenBalance)
          ),
          ETH: Number(ethers.utils.formatEther(balance.ETH_Balance)),
        });
      }
      setUnclaimedStakingRewards(unclaimedStakingRewards);
      setCollectedStakingRewards(collectedStakingRewards);
      setStakingCSTActions(stakingCSTActions);
      setStakingRWLKActions(stakingRWLKActions);
      setMarketingRewards(marketingRewards);
      setCSTList(cstList);
      fetchStakedToken();
      fetchStatusData();
    } catch (error) {
      console.error(error);
      setNotification({
        text: "Failed to fetch data",
        type: "error",
        visible: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDonatedNFTs = async (reload: boolean = true) => {
    setClaimedDonatedNFTs((prev) => ({ ...prev, loading: reload }));
    setUnclaimedDonatedNFTs((prev) => ({ ...prev, loading: reload }));
    try {
      const [claimed, unclaimed] = await Promise.all([
        api.get_claimed_donated_nft_by_user(account),
        api.get_unclaimed_donated_nft_by_user(account),
      ]);
      setClaimedDonatedNFTs({ data: claimed, loading: false });
      setUnclaimedDonatedNFTs({ data: unclaimed, loading: false });
    } catch (error) {
      console.error(error);
      setNotification({
        text: "Failed to fetch donated NFTs",
        type: "error",
        visible: true,
      });
      setClaimedDonatedNFTs((prev) => ({ ...prev, loading: false }));
      setUnclaimedDonatedNFTs((prev) => ({ ...prev, loading: false }));
    }
  };

  const calculateProbability = async () => {
    try {
      const newData = await api.get_dashboard_info();
      setData(newData);
      if (newData) {
        const round = newData?.CurRoundNum;
        const bidList = await api.get_bid_list_by_round(round, "desc");
        const totalBids = bidList.length;
        const userBids = bidList.filter((bid) => bid.BidderAddr === account)
          .length;
        if (totalBids > 0) {
          let probability =
            1 -
            Math.pow(
              (totalBids - userBids) / totalBids,
              newData?.NumRaffleEthWinnersBidding
            );
          setRaffleETHProbability(probability);
          probability =
            1 -
            Math.pow(
              (totalBids - userBids) / totalBids,
              newData?.NumRaffleNFTWinnersBidding
            );
          setRaffleNFTProbability(probability);
        } else {
          setRaffleETHProbability(0);
          setRaffleNFTProbability(0);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDonatedNFTsClaim = async (e, tokenID) => {
    try {
      e.target.disabled = true;
      e.target.classList.add("Mui-disabled");
      await cosmicGameContract.claimDonatedNFT(tokenID);
      setTimeout(() => {
        fetchData(account, false);
        fetchDonatedNFTs(false);
        setIsClaiming(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      const msg = err?.data?.message
        ? getErrorMessage(err.data.message)
        : "An error occurred";
      setNotification({ text: msg, type: "error", visible: true });
      e.target.disabled = false;
      e.target.classList.remove("Mui-disabled");
    }
  };

  const handleAllDonatedNFTsClaim = async () => {
    try {
      setIsClaiming(true);
      const indexList = unclaimedDonatedNFTs.data.map((item) => item.Index);
      await cosmicGameContract.claimManyDonatedNFTs(indexList);
      setTimeout(() => {
        fetchData(account, false);
        fetchDonatedNFTs(false);
        setIsClaiming(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      const msg = err?.data?.message
        ? getErrorMessage(err.data.message)
        : "An error occurred";
      setNotification({ text: msg, type: "error", visible: true });
      setIsClaiming(false);
    }
  };

  const handleTabChange = (_event, newValue) => {
    setStakingTable(newValue);
  };

  useEffect(() => {
    if (account) {
      fetchData(account);
      fetchDonatedNFTs();
      calculateProbability();
    }
  }, [account]);

  return (
    <MainWrapper>
      <Typography variant="h4" color="primary" mb={4}>
        My Statistics
      </Typography>
      {loading ? (
        <Typography variant="h6">Loading...</Typography>
      ) : userInfo === null ? (
        <Typography variant="h6">There is no user information yet.</Typography>
      ) : (
        <>
          {balance.ETH !== 0 && (
            <Box mb={1}>
              <Typography color="primary" component="span">
                ETH Balance:
              </Typography>
              &nbsp;
              <Typography component="span">
                {balance.ETH.toFixed(6)} ETH
              </Typography>
            </Box>
          )}
          {balance.CosmicToken !== 0 && (
            <Box mb={1}>
              <Typography color="primary" component="span">
                Cosmic Tokens Balance:
              </Typography>
              &nbsp;
              <Typography component="span">
                {balance.CosmicToken.toFixed(2)} CST
              </Typography>
            </Box>
          )}
          <Box mb={1}>
            <Typography color="primary" component="span">
              Number of Bids:
            </Typography>
            &nbsp;
            <Typography component="span">{userInfo.NumBids}</Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Number of Cosmic Signature Transfers:
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.CosmicSignatureNumTransfers}
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Number of Cosmic Token Transfers:
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.CosmicTokenNumTransfers}
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Maximum Bid Amount:
            </Typography>
            &nbsp;
            <Typography component="span">
              {formatEthValue(userInfo.MaxBidAmount)}
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Number of Prizes Taken:
            </Typography>
            &nbsp;
            <Typography component="span">{userInfo.NumPrizes}</Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Maximum Amount Gained (in prize winnings):
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.MaxWinAmount.toFixed(6)} ETH
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Amount of Winnings in ETH raffles:
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.SumRaffleEthWinnings.toFixed(6)} ETH
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Amount Withdrawn from ETH raffles:
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.SumRaffleEthWithdrawal.toFixed(6)} ETH
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Unclaimed Donated NFTs:
            </Typography>
            &nbsp;
            <Typography component="span">{userInfo.UnclaimedNFTs}</Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Total ETH Won in raffles:
            </Typography>
            &nbsp;
            <Typography component="span">
              <Link
                href={`/user/raffle-eth/${account}`}
                sx={{ color: "inherit", fontSize: "inherit" }}
              >
                {(
                  userInfo.SumRaffleEthWinnings +
                  userInfo.SumRaffleEthWithdrawal
                ).toFixed(6)}{" "}
                ETH
              </Link>
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Number of (ETH) raffles Participated in:
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.NumRaffleEthWinnings}
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Number of Raffle NFTs Won:
            </Typography>
            &nbsp;
            <Typography component="span">
              <Link
                href={`/user/raffle-nft/${account}`}
                sx={{ color: "inherit", fontSize: "inherit" }}
              >
                {userInfo.RaffleNFTWon}
              </Link>
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Number of Raffle NFTs Claimed:
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.RaffleNFTClaimed}
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Number of Cosmic Signature Tokens Won:
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.TotalCSTokensWon}
            </Typography>
          </Box>
          {/* <Box mb={1}>
            <Typography color="primary" component="span">
              Number of Eth Donations:
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.TotalDonatedCount}
            </Typography>
          </Box>
          <Box mb={1}>
            <Typography color="primary" component="span">
              Total Amount of Eth Donations:
            </Typography>
            &nbsp;
            <Typography component="span">
              {userInfo.TotalDonatedAmountEth.toFixed(2)} ETH
            </Typography>
          </Box> */}
          {!(data?.CurRoundNum > 0 && data?.TsRoundStart === 0) && (
            <>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Probability of Winning ETH:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {(raffleETHProbability * 100).toFixed(2)}%
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Probability of Winning NFT:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {(raffleNFTProbability * 100).toFixed(2)}%
                </Typography>
              </Box>
            </>
          )}
          <Typography mt={3}>
            This account has {userInfo.CosmicTokenNumTransfers} CosmicToken
            (ERC20), click{" "}
            <Link href={`/cosmic-token-transfer/${account}`}>here</Link> to see
            all the transfers made by this account.
          </Typography>
          <Typography mt={1}>
            This account has {userInfo.CosmicSignatureNumTransfers}{" "}
            CosmicSignature (ERC721), click{" "}
            <Link href={`/cosmic-signature-transfer/${account}`}>here</Link> to
            see all the transfers made by this account.
          </Typography>
          <Box>
            <Typography variant="h6" lineHeight={1} mt={4}>
              Staking Statistics
            </Typography>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={stakingTable} onChange={handleTabChange}>
                <Tab label={<Typography>CosmicSignature Token</Typography>} />
                <Tab label={<Typography>RandomWalk Token</Typography>} />
              </Tabs>
            </Box>
            <CustomTabPanel value={stakingTable} index={0}>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Number of Active Stakers:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {userInfo.StakingStatistics.CSTStakingInfo.NumActiveStakers}
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Number of Deposits:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {userInfo.StakingStatistics.CSTStakingInfo.NumDeposits}
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Number of Stake Actions:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {
                    userInfo.StakingStatistics.CSTStakingInfo
                      .TotalNumStakeActions
                  }
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Number of Unstake Actions:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {
                    userInfo.StakingStatistics.CSTStakingInfo
                      .TotalNumUnstakeActions
                  }
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Rewards:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {formatEthValue(
                    userInfo.StakingStatistics.CSTStakingInfo.TotalRewardEth
                  )}
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Unclaimed Rewards:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {formatEthValue(
                    userInfo.StakingStatistics.CSTStakingInfo.UnclaimedRewardEth
                  )}
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Tokens Minted:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {userInfo.StakingStatistics.CSTStakingInfo.TotalTokensMinted}
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Tokens Staked:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {userInfo.StakingStatistics.CSTStakingInfo.TotalTokensStaked}
                </Typography>
              </Box>
              <Typography variant="subtitle1" lineHeight={1} mt={4} mb={2}>
                Stake / Unstake Actions
              </Typography>
              <StakingActionsTable list={stakingCSTActions} IsRwalk={false} />
            </CustomTabPanel>
            <CustomTabPanel value={stakingTable} index={1}>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Number of Active Stakers:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {userInfo.StakingStatistics.RWalkStakingInfo.NumActiveStakers}
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Number of Stake Actions:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {
                    userInfo.StakingStatistics.RWalkStakingInfo
                      .TotalNumStakeActions
                  }
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Number of Unstake Actions:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {
                    userInfo.StakingStatistics.RWalkStakingInfo
                      .TotalNumUnstakeActions
                  }
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Tokens Minted:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {
                    userInfo.StakingStatistics.RWalkStakingInfo
                      .TotalTokensMinted
                  }
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total Tokens Staked:
                </Typography>
                &nbsp;
                <Typography component="span">
                  {
                    userInfo.StakingStatistics.RWalkStakingInfo
                      .TotalTokensStaked
                  }
                </Typography>
              </Box>
              <Typography variant="subtitle1" lineHeight={1} mt={4} mb={2}>
                Stake / Unstake Actions
              </Typography>
              <StakingActionsTable list={stakingRWLKActions} IsRwalk={true} />
            </CustomTabPanel>
          </Box>
          <Box mt={6}>
            <Typography variant="h6" lineHeight={1}>
              Bid History
            </Typography>
            <BiddingHistoryTable biddingHistory={bidHistory} />
          </Box>
          <Box>
            <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
              Cosmic Signature Tokens User Own
            </Typography>
            <CSTTable list={cstList} />
          </Box>
          <Box>
            <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
              History of Winnings
            </Typography>
            <WinningHistoryTable
              winningHistory={claimHistory}
              showClaimedStatus={true}
              showWinnerAddr={false}
            />
          </Box>
          <Box>
            <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
              Earned Staking Rewards
            </Typography>
            <UnclaimedStakingRewardsTable
              list={unclaimedStakingRewards}
              owner={account}
              fetchData={fetchData}
            />
          </Box>
          <Box>
            <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
              Collected Staking Rewards
            </Typography>
            <CollectedStakingRewardsTable
              list={collectedStakingRewards}
              owner={account}
            />
          </Box>
          {marketingRewards.length > 0 && (
            <Box>
              <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                Marketing Rewards
              </Typography>
              <MarketingRewardsTable list={marketingRewards} />
            </Box>
          )}
          <Box mt={8}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Donated NFTs User Won</Typography>
              {unclaimedDonatedNFTs.data.length > 0 && (
                <Button
                  onClick={handleAllDonatedNFTsClaim}
                  variant="contained"
                  disabled={isClaiming}
                >
                  Claim All
                </Button>
              )}
            </Box>
            {unclaimedDonatedNFTs.loading || claimedDonatedNFTs.loading ? (
              <Typography variant="h6">Loading...</Typography>
            ) : (
              <DonatedNFTTable
                list={[
                  ...unclaimedDonatedNFTs.data,
                  ...claimedDonatedNFTs.data,
                ]}
                handleClaim={handleDonatedNFTsClaim}
              />
            )}
          </Box>
        </>
      )}
    </MainWrapper>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  const title = "My Statistics | Cosmic Signature";
  const description =
    "Track your performance with Cosmic Signature's My Statistics page. View detailed bid history, stake status, rewards, and more. Stay informed and optimize your participation in our blockchain ecosystem.";
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

export default MyStatistics;
