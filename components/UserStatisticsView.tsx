import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatEther } from 'viem';
import { useQueryClient } from '@tanstack/react-query';

import { formatEthValue } from '@/utils';

import { useActiveWeb3React } from '@/hooks/web3';
import useRaffleWalletContract from '@/hooks/useRaffleWalletContract';
import { useStakedToken } from '@/contexts/StakedTokenContext';
import { useApiData } from '@/contexts/ApiDataContext';
import { useNotification } from '@/contexts/NotificationContext';
import type { DashboardInfo, BidInfo, StakingAction, StakingRewardMint } from '@/services/api';
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
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { CSTTable } from './tokens/CSTTable';
import type { WinningHistoryEntry } from './tables/WinningHistoryTable';
import type { MarketingReward } from './tables/MarketingRewardsTable';
import type { CSTStakingRewardByDeposit } from './staking/CSTStakingRewardsByDepositTable';
import type { NFTRecord } from './donations/DonatedNFTTable';
import type { DonatedERC20Token } from './donations/DonatedERC20Table';
import BiddingHistoryTable from './tables/BiddingHistoryTable';
import StakingActionsTable from './staking/StakingActionsTable';
import WinningHistoryTable from './tables/WinningHistoryTable';
import MarketingRewardsTable from './tables/MarketingRewardsTable';
import DonatedNFTTable from './donations/DonatedNFTTable';
import { StakingRewardsTable } from './staking/StakingRewardsTable';
import { CSTStakingRewardsByDepositTable } from './staking/CSTStakingRewardsByDepositTable';
import { CollectedCSTStakingRewardsTable } from './staking/CollectedCSTStakingRewardsTable';
import { UncollectedCSTStakingRewardsTable } from './staking/UncollectedCSTStakingRewardsTable';
import { RwalkStakingRewardMintsTable } from './staking/RwalkStakingRewardMintsTable';
import DonatedERC20Table from './donations/DonatedERC20Table';
import { MainWrapper } from './styled';

/* ------------------------------------------------------------------
   Types
------------------------------------------------------------------ */

interface UserProfileInfo {
  NumBids: number;
  NumPrizes: number;
  MaxBidAmount?: number;
  MaxWinAmount?: number;
  CosmicSignatureNumTransfers?: number;
  TotalCSTokensWon?: number;
  Address?: string;
  SumRaffleEthWinnings?: number;
  SumRaffleEthWithdrawal?: number;
  UnclaimedNFTs?: number;
  NumRaffleEthWinnings?: number;
  RaffleNFTsCount?: number;
  RewardNFTsCount?: number;
  StakingStatisticsRWalk?: {
    TotalNumStakeActions: number;
    TotalNumUnstakeActions: number;
    TotalTokensStaked: number;
    TotalTokensMinted: number;
  };
  [key: string]: unknown;
}

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

/* ------------------------------------------------------------------
   Sub-Components
------------------------------------------------------------------ */

function StatRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <span className="text-primary">{label}</span>
      &nbsp;
      <span>{children}</span>
    </div>
  );
}

function UserStatsSection({
  userInfo,
  balanceETH,
  balanceCST,
  raffleETHProbability,
  raffleNFTProbability,
  data,
}: {
  userInfo: UserProfileInfo;
  balanceETH: number;
  balanceCST: number;
  raffleETHProbability: number;
  raffleNFTProbability: number;
  data: DashboardInfo | null;
}) {
  if (!userInfo) {
    return <h6 className="text-xl font-medium">There is no user information yet.</h6>;
  }

  return (
    <>
      {balanceETH !== 0 && <StatRow label="ETH Balance:">{balanceETH.toFixed(6)} ETH</StatRow>}
      {balanceCST !== 0 && (
        <StatRow label="Cosmic Tokens Balance:">{balanceCST.toFixed(2)} CST</StatRow>
      )}

      <StatRow label="Number of Bids:">{userInfo.NumBids}</StatRow>
      <StatRow label="Number of Cosmic Signature Transfers:">
        {userInfo.CosmicSignatureNumTransfers}
      </StatRow>
      <StatRow label="Maximum Bid Amount:">{formatEthValue(userInfo.MaxBidAmount ?? 0)}</StatRow>
      <StatRow label="Number of Prizes Taken:">{userInfo.NumPrizes}</StatRow>
      <StatRow label="Maximum Amount Gained (in prize winnings):">
        {(userInfo.MaxWinAmount ?? 0).toFixed(6)} ETH
      </StatRow>
      <StatRow label="Amount of Winnings in ETH raffles:">
        {(userInfo.SumRaffleEthWinnings ?? 0).toFixed(6)} ETH
      </StatRow>
      <StatRow label="Amount Withdrawn from ETH raffles:">
        {(userInfo.SumRaffleEthWithdrawal ?? 0).toFixed(6)} ETH
      </StatRow>
      <StatRow label="Unclaimed Donated NFTs:">{userInfo.UnclaimedNFTs}</StatRow>
      <StatRow label="Total ETH Won in raffles:">
        <Link href={`/user/raffle-eth/${userInfo.Address}`} className="text-inherit">
          {((userInfo.SumRaffleEthWinnings ?? 0) + (userInfo.SumRaffleEthWithdrawal ?? 0)).toFixed(
            6,
          )}{' '}
          ETH
        </Link>
      </StatRow>
      <StatRow label="Number of (ETH) raffles Participated in:">
        {userInfo.NumRaffleEthWinnings}
      </StatRow>
      <StatRow label="Raffle NFTs Count (Raffle Mints):">
        <Link href={`/user/raffle-nft/${userInfo.Address}`} className="text-inherit">
          {userInfo.RaffleNFTsCount}
        </Link>
      </StatRow>
      <StatRow label="Reward NFTs Count (All Mints):">{userInfo.RewardNFTsCount}</StatRow>
      <StatRow label="Number of Cosmic Signature Tokens Won:">{userInfo.TotalCSTokensWon}</StatRow>

      {!((data?.CurRoundNum ?? 0) > 0 && data?.TsRoundStart === 0) && raffleETHProbability >= 0 && (
        <>
          <StatRow label="Probability of Winning ETH:">
            {(raffleETHProbability * 100).toFixed(2)}%
          </StatRow>
          <StatRow label="Probability of Winning NFT:">
            {(raffleNFTProbability * 100).toFixed(2)}%
          </StatRow>
        </>
      )}

      <p className="mt-6">
        This account has {userInfo.CosmicSignatureNumTransfers} CosmicSignature (ERC721) transfers.
        Click{' '}
        <Link
          href={`/cosmic-signature-transfer/${userInfo.Address}`}
          className="text-primary underline"
        >
          here
        </Link>{' '}
        to see all the transfers made by this account.
      </p>
      <p className="mt-2">
        Click{' '}
        <Link
          href={`/cosmic-token-transfer/${userInfo.Address}`}
          className="text-primary underline"
        >
          here
        </Link>{' '}
        to see all CosmicToken (ERC20) transfers made by this account.
      </p>
    </>
  );
}

function CSTStakingTab({
  stakingActions,
  cstStakingRewards,
  cstStakingRewardsByDeposit,
  collectedCstStakingRewards,
  address,
}: {
  stakingActions: StakingAction[];
  cstStakingRewards: StakingRewardRow[];
  cstStakingRewardsByDeposit: CSTStakingRewardByDeposit[];
  collectedCstStakingRewards: import('@/services/api/types').StakingCSTReward[];
  address: string;
}) {
  const totalStakeActions = stakingActions.filter((a) => a.ActionType !== 1).length;
  const totalUnstakeActions = stakingActions.filter((a) => a.ActionType === 1).length;
  const totalRewardEth = cstStakingRewards.reduce(
    (sum, r) => sum + (r.RewardCollectedEth ?? 0) + (r.RewardToCollectEth ?? 0),
    0,
  );
  const unclaimedRewardEth = cstStakingRewards.reduce(
    (sum, r) => sum + (r.RewardToCollectEth ?? 0),
    0,
  );

  return (
    <>
      <StatRow label="Total Number of Stake Actions:">{totalStakeActions}</StatRow>
      <StatRow label="Total Number of Unstake Actions:">{totalUnstakeActions}</StatRow>
      <StatRow label="Total Tokens with Rewards:">{cstStakingRewards.length}</StatRow>
      <StatRow label="Total Rewards:">{formatEthValue(totalRewardEth)}</StatRow>
      <StatRow label="Unclaimed Rewards:">{formatEthValue(unclaimedRewardEth)}</StatRow>

      <div>
        <h6 className="text-base font-medium leading-none mt-8 mb-4">Stake / Unstake Actions</h6>
        <StakingActionsTable list={stakingActions} IsRwalk={false} />
      </div>

      <div className="mt-8">
        <h6 className="text-base font-medium leading-none mb-4">Staking Rewards by Token</h6>
        <StakingRewardsTable list={cstStakingRewards} address={address} />
      </div>

      <div className="mt-8">
        <h6 className="text-base font-medium leading-none mb-4">Staking Rewards by Deposit</h6>
        <CSTStakingRewardsByDepositTable list={cstStakingRewardsByDeposit} />
      </div>

      <div className="mt-8">
        <h6 className="text-base font-medium leading-none mb-4">Collected Staking Rewards</h6>
        <CollectedCSTStakingRewardsTable list={collectedCstStakingRewards} />
      </div>

      <div className="mt-8">
        <h6 className="text-base font-medium leading-none mb-4">Uncollected Staking Rewards</h6>
        <UncollectedCSTStakingRewardsTable user={address} />
      </div>
    </>
  );
}

function RWLKStakingTab({
  userInfo,
  stakingActions,
  rwlkMints,
}: {
  userInfo: UserProfileInfo;
  stakingActions: StakingAction[];
  rwlkMints: StakingRewardMint[];
}) {
  const rwlkStats = userInfo?.StakingStatisticsRWalk;

  return (
    <>
      <StatRow label="Total Number of Stake Actions:">
        {rwlkStats?.TotalNumStakeActions ?? 0}
      </StatRow>
      <StatRow label="Total Number of Unstake Actions:">
        {rwlkStats?.TotalNumUnstakeActions ?? 0}
      </StatRow>
      <StatRow label="Total Tokens Staked:">{rwlkStats?.TotalTokensStaked ?? 0}</StatRow>
      <StatRow label="Total Tokens Minted:">{rwlkStats?.TotalTokensMinted ?? 0}</StatRow>

      <div>
        <h6 className="text-base font-medium leading-none mt-8 mb-4">Stake / Unstake Actions</h6>
        <StakingActionsTable list={stakingActions} IsRwalk={true} />
      </div>

      <div>
        <h6 className="text-base font-medium leading-none mt-8 mb-4">Staking Reward Tokens</h6>
        <RwalkStakingRewardMintsTable list={rwlkMints} />
      </div>
    </>
  );
}

/* ------------------------------------------------------------------
   Main Component
------------------------------------------------------------------ */

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
    if (!address || !dashboardData || !bidListForProb.length) {
      return { raffleETHProbability: -1, raffleNFTProbability: -1 };
    }
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

  /* --------------------------------------------------
     Claim Handlers
  -------------------------------------------------- */

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
      const msg = getErrorMessage(rawMsg) || rawMsg;
      setNotification({ text: msg, type: 'error', visible: true });
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
      const msg = getErrorMessage(rawMsg) || rawMsg;
      setNotification({ text: msg, type: 'error', visible: true });
    }
  };

  /* --------------------------------------------------
     Render
  -------------------------------------------------- */

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

          {/* Staking Statistics */}
          <div className="mt-8">
            <h6 className="text-xl font-medium leading-none mb-2">Staking Statistics</h6>

            <Tabs defaultValue="cst" className="w-full">
              <TabsList className="w-full grid grid-cols-2 h-auto bg-transparent border-b border-border rounded-none p-0">
                <TabsTrigger
                  value="cst"
                  className="flex-1 h-auto py-3 rounded-none data-[state=active]:bg-white/5 data-[state=active]:shadow-none"
                >
                  <div className="flex items-center">
                    <Image
                      src="/images/CosmicSignatureNFT.png"
                      width={94}
                      height={60}
                      alt="cosmic signature nft"
                    />
                    <span className="text-lg whitespace-nowrap normal-case ml-4">
                      Cosmic Signature Staking
                    </span>
                  </div>
                </TabsTrigger>
                <TabsTrigger
                  value="rwlk"
                  className="flex-1 h-auto py-3 rounded-none data-[state=active]:bg-white/5 data-[state=active]:shadow-none"
                >
                  <div className="flex items-center">
                    <Image src="/images/rwalk.jpg" width={94} height={60} alt="RandomWalk nft" />
                    <span className="text-lg whitespace-nowrap normal-case ml-4">
                      Random Walk Staking
                    </span>
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cst" className="p-6">
                <CSTStakingTab
                  stakingActions={stakingCSTActions}
                  cstStakingRewards={cstStakingRewards}
                  cstStakingRewardsByDeposit={cstStakingRewardsByDeposit}
                  collectedCstStakingRewards={collectedCstStakingRewards}
                  address={address!}
                />
              </TabsContent>

              <TabsContent value="rwlk" className="p-6">
                <RWLKStakingTab
                  userInfo={userInfo}
                  stakingActions={stakingRWLKActions}
                  rwlkMints={rwlkMints}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Bidding History */}
          <div className="mt-12">
            <h6 className="text-xl font-medium leading-none mb-4">Bid History</h6>
            <BiddingHistoryTable biddingHistory={bidHistory} />
          </div>

          {/* User CST Tokens */}
          <div>
            <h6 className="text-xl font-medium leading-none mt-16 mb-4">
              Cosmic Signature Tokens User Own
            </h6>
            <CSTTable list={cstList} />
          </div>

          {/* History of Winnings */}
          <div>
            <h6 className="text-xl font-medium leading-none mt-16 mb-4">History of Winnings</h6>
            <WinningHistoryTable
              winningHistory={claimHistory ?? []}
              showClaimedStatus={true}
              showWinnerAddr={false}
            />
          </div>

          {/* Marketing Rewards */}
          {marketingRewards.length > 0 && (
            <div>
              <h6 className="text-xl font-medium leading-none mt-16 mb-4">Marketing Rewards</h6>
              <MarketingRewardsTable list={marketingRewards} />
            </div>
          )}

          {/* Donated NFTs */}
          <div className="mt-16">
            <div className="flex justify-between items-center mb-4">
              <h6 className="text-xl font-medium">Donated NFTs User Won</h6>
              {unclaimedDonatedNFTsList.length > 0 && canClaim && (
                <Button onClick={handleAllDonatedNFTsClaim} disabled={isClaiming}>
                  Claim All
                </Button>
              )}
            </div>

            {loadingUnclaimedNFTs || loadingClaimedNFTs ? (
              <h6 className="text-xl font-medium">Loading...</h6>
            ) : (
              <DonatedNFTTable
                list={[...unclaimedDonatedNFTsList, ...claimedDonatedNFTsList]}
                handleClaim={canClaim ? handleDonatedNFTsClaim : undefined}
                claimingTokens={claimingDonatedNFTs}
              />
            )}
          </div>

          {/* Donated ERC20 */}
          <div className="mt-16">
            <div className="flex justify-between items-center mb-4">
              <h6 className="text-xl font-medium">Donated ERC20 Tokens</h6>
              {donatedERC20List.filter((x) => !x.Claimed).length > 0 && canClaim && (
                <Button onClick={handleAllDonatedERC20Claim}>Claim All</Button>
              )}
            </div>

            {loadingERC20 ? (
              <h6 className="text-xl font-medium">Loading...</h6>
            ) : (
              <DonatedERC20Table
                list={donatedERC20List}
                handleClaim={canClaim ? handleDonatedERC20Claim : null}
              />
            )}
          </div>
        </>
      )}
    </MainWrapper>
  );
};

export default UserStatisticsView;
