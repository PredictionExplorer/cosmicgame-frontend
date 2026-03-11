import { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatEther } from 'viem';
import { useQueryClient } from '@tanstack/react-query';

import { useActiveWeb3React } from '@/hooks/web3';
import useRaffleWalletContract from '@/hooks/useRaffleWalletContract';
import { useStakedToken } from '@/contexts/StakedTokenContext';
import { useApiData } from '@/contexts/ApiDataContext';
import { useNotification } from '@/contexts/NotificationContext';
import type { BidInfo } from '@/services/api';
import {
  useDashboardInfo,
  useClaimHistoryByUser,
  useUserInfo,
  useUserBalance,
  useStakingCSTActionsByUser,
  useStakingRWLKActionsByUser,
  useMarketingRewardsByUser,
  useCSTTokensByUser,
  useStakingRewardsByUser,
  useStakingCSTRewardsCollectedByUser,
  useStakingCSTByUserByDepositRewards,
  useStakingRWLKMintsByUser,
  useClaimedDonatedNFTByUser,
  useUnclaimedDonatedNFTByUser,
  useDonationsERC20ByUser,
  useBidListByRound,
} from '@/hooks/useApiQuery';
import getErrorMessage from '@/utils/alert';
import { isUserRejection, reportError, getEthErrorMessage } from '@/utils/errors';

import { CSTTable } from './tokens/CSTTable';
import type { WinningHistoryEntry } from './tables/WinningHistoryTable';
import type { MarketingReward } from './tables/MarketingRewardsTable';
import type { CSTStakingRewardByDeposit } from './staking/CSTStakingRewardsByDepositTable';
import type { NFTRecord } from './donations/DonatedNFTTable';
import type { DonatedERC20Token } from './donations/DonatedERC20Table';
import BiddingHistoryTable from './tables/BiddingHistoryTable';
import WinningHistoryTable from './tables/WinningHistoryTable';
import MarketingRewardsTable from './tables/MarketingRewardsTable';
import { MainWrapper } from './styled';
import { UserStatsSection, type UserProfileInfo } from './user-statistics/UserStatsSection';
import { UserStakingSection } from './user-statistics/UserStakingSection';
import { DonatedAssetsSection } from './user-statistics/DonatedAssetsSection';

interface StakingRewardRow {
  TokenId: number;
  RewardCollectedEth?: number;
  RewardToCollectEth?: number;
  [key: string]: unknown;
}

interface UserStatisticsViewProps {
  address: string | null | undefined;
  isOwnProfile: boolean;
}

/** Comprehensive user profile view with bidding stats, winning history, staking actions, token holdings, and raffle claims. */
const UserStatisticsView = ({ address, isOwnProfile }: UserStatisticsViewProps) => {
  const { account } = useActiveWeb3React();
  const prizeWalletContract = useRaffleWalletContract();
  const { fetchData: fetchStakedTokens } = useStakedToken();
  const { fetchData: fetchStatusData } = useApiData();
  const { setNotification } = useNotification();
  const queryClient = useQueryClient();

  const canClaim =
    isOwnProfile || (!!account && !!address && account.toLowerCase() === address.toLowerCase());
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimingDonatedNFTs, setClaimingDonatedNFTs] = useState<number[]>([]);

  const { data: dashboardData, isLoading: loadingDashboard } = useDashboardInfo();
  const { data: claimHistoryRaw, isLoading: loadingClaims } = useClaimHistoryByUser(address);
  const { data: userInfoRaw, isLoading: loadingUserInfo } = useUserInfo(address);
  const { data: balanceData, isLoading: loadingBalance } = useUserBalance(address);
  const { data: stakingCSTActions = [], isLoading: loadingCSTActions } =
    useStakingCSTActionsByUser(address);
  const { data: stakingRWLKActions = [], isLoading: loadingRWLKActions } =
    useStakingRWLKActionsByUser(address);
  const { data: marketingRewardsRaw = [], isLoading: loadingMarketing } =
    useMarketingRewardsByUser(address);
  const { data: cstListRaw = [], isLoading: loadingCST } = useCSTTokensByUser(address);
  const { data: cstStakingRewardsRaw = [], isLoading: loadingStakingRewards } =
    useStakingRewardsByUser(address);
  const { data: collectedCstStakingRewardsRaw = [], isLoading: loadingCollected } =
    useStakingCSTRewardsCollectedByUser(address);
  const { data: cstStakingRewardsByDepositRaw = [], isLoading: loadingByDeposit } =
    useStakingCSTByUserByDepositRewards(address);
  const { data: rwlkMints = [], isLoading: loadingMints } = useStakingRWLKMintsByUser(address);
  const { data: claimedNFTsRaw = [], isLoading: loadingClaimedNFTs } =
    useClaimedDonatedNFTByUser(address);
  const { data: unclaimedNFTsRaw = [], isLoading: loadingUnclaimedNFTs } =
    useUnclaimedDonatedNFTByUser(address);
  const { data: erc20Raw = [], isLoading: loadingERC20 } = useDonationsERC20ByUser(address);

  const curRoundNum = dashboardData?.CurRoundNum ?? -1;
  const { data: bidListForProb = [] } = useBidListByRound(curRoundNum, 'desc');

  const data = dashboardData ?? null;
  const { Bids: bidHistory = [], UserInfo: userInfoObj } = userInfoRaw ?? {};
  const userInfo = (userInfoObj as UserProfileInfo) ?? null;
  const claimHistory = (claimHistoryRaw as WinningHistoryEntry[] | null) ?? null;
  const marketingRewards = (marketingRewardsRaw ?? []) as MarketingReward[];
  const cstList = cstListRaw ?? [];
  const cstStakingRewards = (cstStakingRewardsRaw ?? []) as StakingRewardRow[];
  const collectedCstStakingRewards = collectedCstStakingRewardsRaw ?? [];
  const cstStakingRewardsByDeposit = (cstStakingRewardsByDepositRaw ??
    []) as CSTStakingRewardByDeposit[];
  const claimedDonatedNFTsList = Array.isArray(claimedNFTsRaw)
    ? (claimedNFTsRaw as NFTRecord[])
    : [];
  const unclaimedDonatedNFTsList = Array.isArray(unclaimedNFTsRaw)
    ? (unclaimedNFTsRaw as NFTRecord[])
    : [];
  const donatedERC20List = (erc20Raw ?? []) as DonatedERC20Token[];

  const balance = useMemo(() => {
    if (!balanceData) return { CosmicToken: 0, ETH: 0 };
    return {
      CosmicToken: Number(formatEther(BigInt(balanceData.CosmicTokenBalance || 0))),
      ETH: Number(formatEther(BigInt(balanceData.ETH_Balance || 0))),
    };
  }, [balanceData]);

  const { raffleETHProbability, raffleNFTProbability } = useMemo(() => {
    if (!address || !dashboardData || !bidListForProb.length)
      return { raffleETHProbability: -1, raffleNFTProbability: -1 };
    const totalBids = bidListForProb.length;
    const userBids = bidListForProb.filter(
      (bid: BidInfo) => bid.BidderAddr?.toLowerCase() === address?.toLowerCase(),
    ).length;
    if (totalBids > 0) {
      return {
        raffleETHProbability:
          1 -
          Math.pow(
            (totalBids - userBids) / totalBids,
            dashboardData.NumRaffleEthWinnersBidding ?? 1,
          ),
        raffleNFTProbability:
          1 -
          Math.pow(
            (totalBids - userBids) / totalBids,
            dashboardData.NumRaffleNFTWinnersBidding ?? 1,
          ),
      };
    }
    return { raffleETHProbability: -1, raffleNFTProbability: -1 };
  }, [address, dashboardData, bidListForProb]);

  const loading =
    loadingDashboard ||
    loadingClaims ||
    loadingUserInfo ||
    loadingBalance ||
    loadingCSTActions ||
    loadingRWLKActions ||
    loadingMarketing ||
    loadingCST ||
    loadingStakingRewards ||
    loadingCollected ||
    loadingByDeposit ||
    loadingMints;

  const handleDonatedNFTsClaim = async (tokenID: number) => {
    if (!prizeWalletContract) return;
    setClaimingDonatedNFTs((prev) => [...prev, tokenID]);
    setIsClaiming(true);
    try {
      await prizeWalletContract.write.claimDonatedNft?.([tokenID]);
      setTimeout(() => {
        queryClient.invalidateQueries();
        fetchStakedTokens();
        fetchStatusData();
        setIsClaiming(false);
      }, 3000);
    } catch (err) {
      if (!isUserRejection(err)) {
        reportError(err, 'claim donated NFT');
        const msg = getEthErrorMessage(err, 'An error occurred');
        setNotification({ text: getErrorMessage(msg), type: 'error', visible: true });
      }
      setIsClaiming(false);
    } finally {
      setClaimingDonatedNFTs((prev) => prev.filter((id) => id !== tokenID));
    }
  };

  const handleAllDonatedNFTsClaim = async () => {
    if (!unclaimedDonatedNFTsList.length || !prizeWalletContract) return;
    setIsClaiming(true);
    try {
      const indexList = unclaimedDonatedNFTsList.map((item: { Index: number }) => item.Index);
      await prizeWalletContract.write.claimManyDonatedNfts?.([indexList]);
      setTimeout(() => {
        queryClient.invalidateQueries();
        fetchStakedTokens();
        fetchStatusData();
        setIsClaiming(false);
      }, 3000);
    } catch (err) {
      if (!isUserRejection(err)) {
        reportError(err, 'claim all donated NFTs');
        const msg = getEthErrorMessage(err, 'An error occurred while claiming donated NFTs!');
        setNotification({ text: getErrorMessage(msg), type: 'error', visible: true });
      }
      setIsClaiming(false);
    }
  };

  const handleDonatedERC20Claim = async (roundNum: number, tokenAddr: string, amount: string) => {
    if (!prizeWalletContract) return;
    try {
      await prizeWalletContract.write.claimDonatedToken?.([roundNum, tokenAddr, amount]);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['donationsERC20ByUser'] });
      }, 3000);
    } catch (err) {
      if (isUserRejection(err)) return;
      reportError(err, 'claim donated ERC20 token');
      const rawMsg = getEthErrorMessage(err, 'An error occurred');
      setNotification({ text: getErrorMessage(rawMsg) || rawMsg, type: 'error', visible: true });
    }
  };

  const handleAllDonatedERC20Claim = async () => {
    if (!prizeWalletContract) return;
    try {
      const donatedTokensToClaim = donatedERC20List
        .filter((x) => !x.Claimed)
        .map((x) => ({
          roundNum: x.RoundNum,
          tokenAddress: x.TokenAddr,
          amount: x.AmountDonatedEth,
        }));
      await prizeWalletContract.write.claimManyDonatedTokens?.([donatedTokensToClaim]);
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['donationsERC20ByUser'] });
      }, 3000);
    } catch (err) {
      if (isUserRejection(err)) return;
      reportError(err, 'claim all donated ERC20 tokens');
      const rawMsg = getEthErrorMessage(err, 'An error occurred');
      setNotification({ text: getErrorMessage(rawMsg) || rawMsg, type: 'error', visible: true });
    }
  };

  if (address === 'Invalid Address') {
    return (
      <MainWrapper>
        <h6 className="text-xl font-medium">Invalid Address</h6>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      {isOwnProfile ? (
        <h4 className="text-2xl font-bold text-primary mb-8">My Statistics</h4>
      ) : (
        <div className="mb-8">
          <span className="text-xl font-medium text-primary mr-4">User</span>
          <span className="text-xl font-mono break-all">{address}</span>
        </div>
      )}

      {loading ? (
        <h6 className="text-xl font-medium">Loading...</h6>
      ) : !userInfo ? (
        <h6 className="text-xl font-medium">There is no user information yet.</h6>
      ) : (
        <>
          <UserStatsSection
            userInfo={userInfo}
            balanceETH={balance.ETH}
            balanceCST={balance.CosmicToken}
            raffleETHProbability={raffleETHProbability}
            raffleNFTProbability={raffleNFTProbability}
            data={data}
          />

          <UserStakingSection
            address={address!}
            userInfo={userInfo}
            stakingCSTActions={stakingCSTActions}
            stakingRWLKActions={stakingRWLKActions}
            cstStakingRewards={cstStakingRewards}
            cstStakingRewardsByDeposit={cstStakingRewardsByDeposit}
            collectedCstStakingRewards={collectedCstStakingRewards}
            rwlkMints={rwlkMints}
          />

          <div className="mt-12">
            <h6 className="text-xl font-medium leading-none mb-4">Bid History</h6>
            <BiddingHistoryTable biddingHistory={bidHistory} />
          </div>
          <div>
            <h6 className="text-xl font-medium leading-none mt-16 mb-4">
              Cosmic Signature Tokens User Own
            </h6>
            <CSTTable list={cstList} />
          </div>
          <div>
            <h6 className="text-xl font-medium leading-none mt-16 mb-4">History of Winnings</h6>
            <WinningHistoryTable
              winningHistory={claimHistory ?? []}
              showClaimedStatus={true}
              showWinnerAddr={false}
            />
          </div>
          {marketingRewards.length > 0 && (
            <div>
              <h6 className="text-xl font-medium leading-none mt-16 mb-4">Marketing Rewards</h6>
              <MarketingRewardsTable list={marketingRewards} />
            </div>
          )}

          <DonatedAssetsSection
            unclaimedNFTs={unclaimedDonatedNFTsList}
            claimedNFTs={claimedDonatedNFTsList}
            donatedERC20={donatedERC20List}
            loadingNFTs={loadingUnclaimedNFTs || loadingClaimedNFTs}
            loadingERC20={loadingERC20}
            canClaim={canClaim}
            isClaiming={isClaiming}
            claimingDonatedNFTs={claimingDonatedNFTs}
            onClaimNFT={handleDonatedNFTsClaim}
            onClaimAllNFTs={handleAllDonatedNFTsClaim}
            onClaimERC20={handleDonatedERC20Claim}
            onClaimAllERC20={handleAllDonatedERC20Claim}
          />
        </>
      )}
    </MainWrapper>
  );
};

export default UserStatisticsView;
