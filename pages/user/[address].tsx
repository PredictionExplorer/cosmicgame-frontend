import React, { useEffect, useState } from "react";
import { Box, Button, Link, Typography } from "@mui/material";
import Head from "next/head";
import { MainWrapper } from "../../components/styled";
import { GetServerSidePropsContext } from "next";
import api from "../../services/api";
import BiddingHistoryTable from "../../components/BiddingHistoryTable";
import WinningHistoryTable from "../../components/WinningHistoryTable";
import { ethers } from "ethers";
import { formatEthValue } from "../../utils";
import { UnclaimedStakingRewardsTable } from "../../components/UnclaimedStakingRewardsTable";
import { CollectedStakingRewardsTable } from "../../components/CollectedStakingRewardsTable";
import { StakingActionsTable } from "../../components/StakingActionsTable";
import { MarketingRewardsTable } from "../../components/MarketingRewardsTable";
import { useStakedToken } from "../../contexts/StakedTokenContext";
import { useApiData } from "../../contexts/ApiDataContext";
import { MyWinningsTable } from "../my-tokens";
import useRaffleWalletContract from "../../hooks/useRaffleWalletContract";
import { useRouter } from "next/router";
import { useActiveWeb3React } from "../../hooks/web3";
import useCosmicGameContract from "../../hooks/useCosmicGameContract";
import DonatedNFTTable from "../../components/DonatedNFTTable";

const UserInfo = ({ address }) => {
  const router = useRouter();
  const { account } = useActiveWeb3React();
  const { apiData: status } = useApiData();
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
  const [unclaimedStakingRewards, setUnclaimedStakingRewards] = useState([]);
  const [collectedStakingRewards, setCollectedStakingRewards] = useState([]);
  const [stakingActions, setStakingActions] = useState([]);
  const [marketingRewards, setMarketingRewards] = useState([]);
  const { fetchData: fetchStakedToken } = useStakedToken();
  const [isClaiming, setIsClaiming] = useState({
    donatedNFT: false,
    raffleETH: false,
  });

  const cosmicGameContract = useCosmicGameContract();

  const fetchData = async (addr: string, reload: boolean = true) => {
    setLoading(reload);
    const history = await api.get_claim_history_by_user(addr);
    setClaimHistory(history);
    const { Bids, UserInfo } = await api.get_user_info(addr);
    setBidHistory(Bids);
    setUserInfo(UserInfo);
    const balance = await api.get_user_balance(addr);
    if (balance) {
      setBalance({
        CosmicToken: Number(
          ethers.utils.formatEther(balance.CosmicTokenBalance)
        ),
        ETH: Number(ethers.utils.formatEther(balance.ETH_Balance)),
      });
    }
    const unclaimedStakingRewards = await api.get_unclaimed_staking_rewards_by_user(
      addr
    );
    setUnclaimedStakingRewards(unclaimedStakingRewards);
    const collectedStakingRewards = await api.get_collected_staking_rewards_by_user(
      addr
    );
    setCollectedStakingRewards(collectedStakingRewards);
    const stakingActions = await api.get_staking_actions_by_user(addr);
    setStakingActions(stakingActions);
    const marketingRewards = await api.get_marketing_rewards_by_user(addr);
    setMarketingRewards(marketingRewards);
    fetchStakedToken();
    setLoading(false);
  };

  const fetchDonatedNFTs = async () => {
    setClaimedDonatedNFTs((prev) => ({
      ...prev,
      loading: true,
    }));
    const claimed = await api.get_claimed_donated_nft_by_user(address);
    setClaimedDonatedNFTs({ data: claimed, loading: false });
    setUnclaimedDonatedNFTs((prev) => ({
      ...prev,
      loading: true,
    }));
    const unclaimed = await api.get_unclaimed_donated_nft_by_user(address);
    setUnclaimedDonatedNFTs({ data: unclaimed, loading: false });
  };

  const handleDonatedNFTsClaim = async (e, tokenID) => {
    try {
      e.target.disabled = true;
      e.target.classList.add("Mui-disabled");
      const res = await cosmicGameContract.claimDonatedNFT(tokenID);
      console.log(res);
      setTimeout(() => {
        router.reload();
      }, 4000);
    } catch (err) {
      console.log(err);
      e.target.disabled = false;
      e.target.classList.remove("Mui-disabled");
    }
  };

  const handleAllDonatedNFTsClaim = async () => {
    try {
      setIsClaiming({
        ...isClaiming,
        donatedNFT: true,
      });
      const indexList = unclaimedDonatedNFTs.data.map((item) => item.Index);
      const res = await cosmicGameContract.claimManyDonatedNFTs(indexList);
      console.log(res);
      setTimeout(() => {
        router.reload();
      }, 4000);
    } catch (err) {
      console.log(err);
      setIsClaiming({
        ...isClaiming,
        donatedNFT: false,
      });
    }
  };

  useEffect(() => {
    if (address) {
      if (address !== "Invalid Address") {
        fetchData(address);
        fetchDonatedNFTs();
      } else {
        setInvalidAddress(true);
      }
    }
  }, [address]);

  return (
    <>
      <Head>
        <title>User Info | Cosmic Signature</title>
        <meta name="description" content="" />
      </Head>
      <MainWrapper>
        {invalidAddress ? (
          <Typography variant="h6">Invalid Address</Typography>
        ) : (
          <>
            <Box mb={4}>
              <Typography variant="h6" color="primary" component="span" mr={2}>
                User
              </Typography>
              <Typography variant="h6" component="span" fontFamily="monospace">
                {address}
              </Typography>
            </Box>
            {loading ? (
              <Typography variant="h6">Loading...</Typography>
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
                      {balance.CosmicToken.toFixed(6)} CST
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
                    Maximum Bid Amount:
                  </Typography>
                  &nbsp;
                  <Typography component="span">
                    {userInfo.MaxBidAmount.toFixed(6)} ETH
                  </Typography>
                </Box>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Number of Prizes taken:
                  </Typography>
                  &nbsp;
                  <Typography component="span">{userInfo.NumPrizes}</Typography>
                </Box>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Maximum amount gained (in prize winnings):
                  </Typography>
                  &nbsp;
                  <Typography component="span">
                    {userInfo.MaxWinAmount.toFixed(6)} ETH
                  </Typography>
                </Box>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Amount of winnings in ETH raffles:
                  </Typography>
                  &nbsp;
                  <Typography component="span">
                    {userInfo.SumRaffleEthWinnings.toFixed(6)} ETH
                  </Typography>
                </Box>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Amount withdrawn from ETH raffles:
                  </Typography>
                  &nbsp;
                  <Typography component="span">
                    {userInfo.SumRaffleEthWithdrawal.toFixed(6)} ETH
                  </Typography>
                </Box>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Unclaimed donated NFTs:
                  </Typography>
                  &nbsp;
                  <Typography component="span">
                    {userInfo.UnclaimedNFTs}
                  </Typography>
                </Box>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Total ETH won in raffles:
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
                    Number of (ETH) raffles participated in:
                  </Typography>
                  &nbsp;
                  <Typography component="span">
                    {userInfo.NumRaffleEthWinnings}
                  </Typography>
                </Box>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Number of Raffle NFTs won:
                  </Typography>
                  &nbsp;
                  <Typography component="span">
                    {userInfo.RaffleNFTWon}
                  </Typography>
                </Box>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Total Staked Tokens at this moment:
                  </Typography>
                  &nbsp;
                  <Typography component="span">
                    {userInfo.StakingStatistics.TotalTokensStaked}
                  </Typography>
                </Box>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Total Number of Stake Actions:
                  </Typography>
                  &nbsp;
                  <Typography component="span">
                    {userInfo.StakingStatistics.TotalNumStakeActions}
                  </Typography>
                </Box>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Total Reward:
                  </Typography>
                  &nbsp;
                  <Typography component="span">
                    {formatEthValue(userInfo.StakingStatistics.TotalRewardEth)}
                  </Typography>
                </Box>
                <Box mb={1}>
                  <Typography color="primary" component="span">
                    Unclaimed Reward:
                  </Typography>
                  &nbsp;
                  <Typography component="span">
                    {formatEthValue(
                      userInfo.StakingStatistics.UnclaimedRewardEth
                    )}
                  </Typography>
                </Box>
                <Typography mt={1}>
                  This account has {userInfo.CosmicTokenNumTransfers}{" "}
                  CosmicToken (ERC20), click{" "}
                  <Link href={`/cosmic-token-transfers/${address}`}>here</Link>{" "}
                  to see all the transfers made by this account.
                </Typography>
                <Typography mt={1}>
                  This account has {userInfo.CosmicSignatureNumTransfers}{" "}
                  CosmicSignature (ERC721), click{" "}
                  <Link href={`/cosmic-signature-transfers/${address}`}>
                    here
                  </Link>{" "}
                  to see all the transfers made by this account.
                </Typography>
                <Box mt={6}>
                  <Typography variant="h6" lineHeight={1}>
                    Bid History
                  </Typography>
                  <BiddingHistoryTable biddingHistory={bidHistory} />
                </Box>
                <Box>
                  <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                    History of Winnings
                  </Typography>
                  <WinningHistoryTable
                    winningHistory={claimHistory}
                    showClaimedStatus={true}
                  />
                </Box>
                <Box>
                  <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                    Unclaimed Staking Rewards
                  </Typography>
                  <UnclaimedStakingRewardsTable
                    list={unclaimedStakingRewards}
                    owner={address}
                    fetchData={fetchData}
                  />
                </Box>
                <Box>
                  <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                    Collected Staking Rewards
                  </Typography>
                  <CollectedStakingRewardsTable
                    list={collectedStakingRewards}
                  />
                </Box>
                <Box>
                  <Typography variant="h6" lineHeight={1} mt={8} mb={2}>
                    Stake / Unstake Actions
                  </Typography>
                  <StakingActionsTable list={stakingActions} />
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
                    {status?.NumDonatedNFTToClaim > 0 && account === address && (
                      <Button
                        onClick={handleAllDonatedNFTsClaim}
                        variant="contained"
                        disabled={isClaiming.donatedNFT}
                      >
                        Claim All
                      </Button>
                    )}
                  </Box>
                  {unclaimedDonatedNFTs.loading ||
                  claimedDonatedNFTs.loading ? (
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
                    />
                  )}
                </Box>
              </>
            )}
          </>
        )}
      </MainWrapper>
    </>
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
  return { props: { address } };
}

export default UserInfo;
