import React, { useEffect, useState } from "react";
import { Box, Button, Link, Tab, Tabs, Typography } from "@mui/material";
import { MainWrapper } from "../../components/styled";
import { GetServerSidePropsContext } from "next";
import api from "../../services/api";
import BiddingHistoryTable from "../../components/BiddingHistoryTable";
import WinningHistoryTable from "../../components/WinningHistoryTable";
import { ethers } from "ethers";
import { formatEthValue } from "../../utils";
import { useStakedToken } from "../../contexts/StakedTokenContext";
import { useApiData } from "../../contexts/ApiDataContext";
import { useActiveWeb3React } from "../../hooks/web3";
import useCosmicGameContract from "../../hooks/useCosmicGameContract";
import DonatedNFTTable from "../../components/DonatedNFTTable";
import { CSTTable } from "../my-tokens";
import getErrorMessage from "../../utils/alert";
import { useNotification } from "../../contexts/NotificationContext";
import StakingActionsTable from "../../components/StakingActionsTable";
import MarketingRewardsTable from "../../components/MarketingRewardsTable";
import { StakingRewardsTable } from "../../components/StakingRewardsTable";

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

const UserInfo = ({ address }) => {
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
  const [invalidAddress, setInvalidAddress] = useState(false);
  const [stakingCSTActions, setStakingCSTActions] = useState([]);
  const [stakingRWLKActions, setStakingRWLKActions] = useState([]);
  const [marketingRewards, setMarketingRewards] = useState([]);
  const [cstList, setCSTList] = useState([]);
  const [isClaiming, setIsClaiming] = useState(false);
  const [stakingTable, setStakingTable] = useState(0);
  const [raffleETHProbability, setRaffleETHProbability] = useState(0);
  const [raffleNFTProbability, setRaffleNFTProbability] = useState(0);
  const [claimingDonatedNFTs, setClaimingDonatedNFTs] = useState([]);
  const [stakingRewards, setStakingRewards] = useState([]);
  const { fetchData: fetchStakedToken } = useStakedToken();
  const { fetchData: fetchStatusData } = useApiData();
  const { setNotification } = useNotification();

  const cosmicGameContract = useCosmicGameContract();

  const fetchData = async (addr: string, reload: boolean = true) => {
    setLoading(reload);
    try {
      const [
        history,
        userInfoResponse,
        balanceResponse,
        stakingCSTActions,
        stakingRWLKActions,
        marketingRewards,
        cstList,
        stakingRewards,
      ] = await Promise.all([
        api.get_claim_history_by_user(addr),
        api.get_user_info(addr),
        api.get_user_balance(addr),
        api.get_staking_cst_actions_by_user(addr),
        api.get_staking_rwalk_actions_by_user(addr),
        api.get_marketing_rewards_by_user(addr),
        api.get_cst_tokens_by_user(addr),
        api.get_staking_rewards_by_user(addr),
      ]);

      setClaimHistory(history);
      const { Bids, UserInfo } = userInfoResponse;
      setBidHistory(Bids);
      setUserInfo(UserInfo);

      if (balanceResponse) {
        setBalance({
          CosmicToken: Number(
            ethers.utils.formatEther(balanceResponse.CosmicTokenBalance)
          ),
          ETH: Number(ethers.utils.formatEther(balanceResponse.ETH_Balance)),
        });
      }

      setStakingCSTActions(stakingCSTActions);
      setStakingRWLKActions(stakingRWLKActions);
      setMarketingRewards(marketingRewards);
      setStakingRewards(stakingRewards);
      setCSTList(cstList);
      // setEthDonations(donations);
      fetchStakedToken();
      fetchStatusData();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonatedNFTs = async (reload: boolean = true) => {
    setClaimedDonatedNFTs((prev) => ({
      ...prev,
      loading: reload,
    }));
    setUnclaimedDonatedNFTs((prev) => ({
      ...prev,
      loading: reload,
    }));
    try {
      const [claimed, unclaimed] = await Promise.all([
        api.get_claimed_donated_nft_by_user(address),
        api.get_unclaimed_donated_nft_by_user(address),
      ]);
      setClaimedDonatedNFTs({ data: claimed, loading: false });
      setUnclaimedDonatedNFTs({ data: unclaimed, loading: false });
    } catch (error) {
      console.error("Error fetching donated NFTs:", error);
    }
  };

  const calculateProbability = async () => {
    try {
      const newData = await api.get_dashboard_info();
      setData(newData); // Added this line to fix the issue

      if (newData) {
        const round = newData?.CurRoundNum;
        const bidList = await api.get_bid_list_by_round(round, "desc");
        const count = bidList.filter((bid) => bid.BidderAddr === address)
          .length;

        let probability =
          1 -
          Math.pow(
            (bidList.length - count) / bidList.length,
            newData?.NumRaffleEthWinnersBidding
          );
        setRaffleETHProbability(probability);

        probability =
          1 -
          Math.pow(
            (bidList.length - count) / bidList.length,
            newData?.NumRaffleNFTWinnersBidding
          );
        setRaffleNFTProbability(probability);
      }
    } catch (error) {
      console.error("Error calculating probability:", error);
    }
  };

  const handleDonatedNFTsClaim = async (tokenID) => {
    setClaimingDonatedNFTs((prev) => [...prev, tokenID]);
    try {
      setIsClaiming(true);
      await cosmicGameContract.claimDonatedNFT(tokenID);
      setTimeout(() => {
        fetchData(address, false);
        fetchDonatedNFTs(false);
        setIsClaiming(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({ text: msg, type: "error", visible: true });
      }
      setIsClaiming(false);
    } finally {
      setClaimingDonatedNFTs((prev) => prev.filter((id) => id !== tokenID));
    }
  };

  const handleAllDonatedNFTsClaim = async () => {
    try {
      setIsClaiming(true);
      const indexList = unclaimedDonatedNFTs.data.map((item) => item.Index);
      await cosmicGameContract.claimManyDonatedNFTs(indexList);
      setTimeout(() => {
        fetchData(address, false);
        fetchDonatedNFTs(false);
        setIsClaiming(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      if (err?.data?.message) {
        const msg = getErrorMessage(err?.data?.message);
        setNotification({ text: msg, type: "error", visible: true });
      }
      setIsClaiming(false);
    }
  };

  const handleTabChange = (_event, newValue) => {
    setStakingTable(newValue);
  };

  useEffect(() => {
    if (address) {
      if (address !== "Invalid Address") {
        fetchData(address);
        fetchDonatedNFTs();
        calculateProbability();
      } else {
        setInvalidAddress(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return (
    <MainWrapper>
      {invalidAddress ? (
        <Typography variant="h6">Invalid Address</Typography>
      ) : (
        <>
          <Box mb={4}>
            <Typography variant="h6" color="primary" component="span" mr={2}>
              User
            </Typography>
            <Typography
              variant="h6"
              component="span"
              fontFamily="monospace"
              sx={{ wordBreak: "break-all" }}
            >
              {address}
            </Typography>
          </Box>
          {loading ? (
            <Typography variant="h6">Loading...</Typography>
          ) : userInfo === null ? (
            <Typography variant="h6">
              There is no user information yet.
            </Typography>
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
                <Typography component="span">
                  {userInfo.UnclaimedNFTs}
                </Typography>
              </Box>
              <Box mb={1}>
                <Typography color="primary" component="span">
                  Total ETH Won in raffles:
                </Typography>
                &nbsp;
                <Typography component="span">
                  <Link
                    href={`/user/raffle-eth/${address}`}
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
                    href={`/user/raffle-nft/${address}`}
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
                (ERC20) transfers, click{" "}
                <Link href={`/cosmic-token-transfer/${address}`}>here</Link> to
                see all the transfers made by this account.
              </Typography>
              <Typography mt={1}>
                This account has {userInfo.CosmicSignatureNumTransfers}{" "}
                CosmicSignature (ERC721) transfers, click{" "}
                <Link href={`/cosmic-signature-transfer/${address}`}>here</Link>{" "}
                to see all the transfers made by this account.
              </Typography>
              <Box>
                <Typography variant="h6" lineHeight={1} mt={4}>
                  Staking Statistics
                </Typography>
                <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                  <Tabs value={stakingTable} onChange={handleTabChange}>
                    <Tab
                      label={<Typography>CosmicSignature Token</Typography>}
                    />
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
                      {
                        userInfo.StakingStatistics.CSTStakingInfo
                          .NumActiveStakers
                      }
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
                        userInfo.StakingStatistics.CSTStakingInfo
                          .UnclaimedRewardEth
                      )}
                    </Typography>
                  </Box>
                  <Box mb={1}>
                    <Typography color="primary" component="span">
                      Total Tokens Minted:
                    </Typography>
                    &nbsp;
                    <Typography component="span">
                      {
                        userInfo.StakingStatistics.CSTStakingInfo
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
                        userInfo.StakingStatistics.CSTStakingInfo
                          .TotalTokensStaked
                      }
                    </Typography>
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      lineHeight={1}
                      mt={4}
                      mb={2}
                    >
                      Stake / Unstake Actions
                    </Typography>
                    <StakingActionsTable
                      list={stakingCSTActions}
                      IsRwalk={false}
                    />
                  </Box>
                  <Box mt={4}>
                    <Typography variant="subtitle1" lineHeight={1} mb={2}>
                      Staking Rewards
                    </Typography>
                    <StakingRewardsTable
                      list={stakingRewards}
                      address={address}
                    />
                  </Box>
                </CustomTabPanel>
                <CustomTabPanel value={stakingTable} index={1}>
                  <Box mb={1}>
                    <Typography color="primary" component="span">
                      Number of Active Stakers:
                    </Typography>
                    &nbsp;
                    <Typography component="span">
                      {
                        userInfo.StakingStatistics.RWalkStakingInfo
                          .NumActiveStakers
                      }
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
                  <StakingActionsTable
                    list={stakingRWLKActions}
                    IsRwalk={true}
                  />
                </CustomTabPanel>
              </Box>
              <Box mt={8}>
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
                  {unclaimedDonatedNFTs.data.length > 0 && account === address && (
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
                    handleClaim={
                      account === address ? handleDonatedNFTsClaim : null
                    }
                    claimingTokens={claimingDonatedNFTs}
                  />
                )}
              </Box>
            </>
          )}
        </>
      )}
    </MainWrapper>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const params = context.params!.address;
  let address = Array.isArray(params) ? params[0] : params;
  if (ethers.utils.isAddress(address.toLowerCase())) {
    address = ethers.utils.getAddress(address.toLowerCase());
  } else {
    address = "Invalid Address";
  }
  const title = `Information for User ${address} | Cosmic Signature`;
  const description = `Information for User ${address}`;
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
    props: { title, description, openGraphData, address },
  };
}

export default UserInfo;
