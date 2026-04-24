'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Layers, TrendingUp, Gift } from 'lucide-react';

import { MainWrapper } from '@/components/styled';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActiveWeb3React } from '@/hooks/web3';
import {
  useDashboardInfo,
  useStakingCSTActionsByUser,
  useCSTTokensByUser,
  useStakingRewardsByUser,
  useStakingRWLKActionsByUser,
  useStakingRWLKMintsByUser,
} from '@/hooks/useApiQuery';
import { useStakedToken } from '@/contexts/StakedTokenContext';
import { useStakingActions } from '@/hooks/useStakingActions';
import { CSTStakingPanel } from '@/components/staking/CSTStakingPanel';
import { RWLKStakingPanel } from '@/components/staking/RWLKStakingPanel';
import { StakingHeroStats } from '@/components/staking/StakingHeroStats';
import type { StakingStatItem } from '@/components/staking/StakingHeroStats';
import { StatCardSkeleton } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/PageHeader';

const MyStaking = () => {
  const { account } = useActiveWeb3React();
  const { stake, unstake, handleError, rwalkContract } = useStakingActions();

  const { data: dashboardData, isLoading: loadingDashboard } = useDashboardInfo();
  const { data: stakingCSTActions = [], isLoading: loadingCSTActions } =
    useStakingCSTActionsByUser(account);
  const { data: cstTokensRaw = [], isLoading: loadingCST } = useCSTTokensByUser(account);
  const { data: stakingRewards = [], isLoading: loadingRewards } = useStakingRewardsByUser(account);
  const { data: stakingRWLKActions = [], isLoading: loadingRWLK } =
    useStakingRWLKActionsByUser(account);
  const { data: rwlkMints = [], isLoading: loadingMints } = useStakingRWLKMintsByUser(account);

  const CSTokens = useMemo(() => cstTokensRaw.filter((x) => !x.WasUnstaked), [cstTokensRaw]);

  const rewardPerCST = useMemo(() => {
    const totalStakedCST = dashboardData?.MainStats?.StakeStatisticsCST?.TotalTokensStaked || 0;
    if (totalStakedCST > 0) {
      return (dashboardData?.StakingAmountEth ?? 0) / totalStakedCST;
    }
    return 0;
  }, [dashboardData]);

  const loading =
    loadingDashboard ||
    loadingCSTActions ||
    loadingCST ||
    loadingRewards ||
    loadingRWLK ||
    loadingMints;

  const [rwlkTokens, setRwlkTokens] = useState<number[]>([]);

  const { cstokens: stakedCSTokens, rwlktokens: stakedRWLKTokens } = useStakedToken();

  const unclaimedRewardEth = useMemo(() => {
    return stakingRewards.reduce((sum, r) => sum + (r.RewardToCollectEth ?? 0), 0);
  }, [stakingRewards]);

  const heroStats: StakingStatItem[] = useMemo(
    () => [
      {
        label: 'Your Anchored CST',
        value: stakedCSTokens.length.toLocaleString(),
        tooltip:
          'Number of Cosmic Signature NFTs you currently have anchored. Anchoring more tokens increases your share of Anchor Distributions.',
        icon: <Layers className="h-4 w-4" />,
      },
      {
        label: 'Your Anchored RWLK',
        value: stakedRWLKTokens.length.toLocaleString(),
        tooltip:
          'Number of RandomWalk NFTs you currently have anchored. Each anchored RWLK has a chance to receive an allocation imprint.',
        icon: <Layers className="h-4 w-4" />,
      },
      {
        label: 'Unretrieved Distributions',
        value: unclaimedRewardEth > 0 ? `${unclaimedRewardEth.toFixed(4)} ETH` : '0 ETH',
        tooltip:
          'ETH Anchor Distributions allocated to your anchored CST tokens but not yet retrieved. Releasing an anchor automatically retrieves its accumulated distributions.',
        icon: <Gift className="h-4 w-4" />,
        featured: true,
        gradient: true,
      },
      {
        label: 'Distribution per CST',
        value: rewardPerCST > 0 ? `${rewardPerCST.toFixed(6)} ETH` : '--',
        tooltip:
          'Current ETH Anchor Distribution per anchored CST token, calculated as the total anchoring pool divided by the number of anchored tokens.',
        icon: <TrendingUp className="h-4 w-4" />,
      },
    ],
    [stakedCSTokens, stakedRWLKTokens, unclaimedRewardEth, rewardPerCST],
  );

  useEffect(() => {
    const fetchRWLKTokens = async () => {
      if (!account || !rwalkContract) return;
      try {
        const stakedIds = stakedRWLKTokens.map((x) => x.StakedTokenId);
        const userOwned = await rwalkContract.read.walletOfOwner?.([account]);
        const rawIds = (userOwned as readonly bigint[]).map((t) => Number(t)).sort();
        const filteredIds = rawIds.filter(
          (id) =>
            !stakedIds.includes(id) &&
            !stakingRWLKActions.some((action) => action.ActionType !== 1 && action.TokenId === id),
        );
        setRwlkTokens(filteredIds);
      } catch (err) {
        handleError(err);
      }
    };
    fetchRWLKTokens();
  }, [account, rwalkContract, stakedRWLKTokens, stakingRWLKActions, handleError]);

  return (
    <MainWrapper>
      <PageHeader
        title="My Anchors"
        subtitle="Manage your anchored tokens and view distributions"
      />

      {!account ? (
        <EmptyState
          title="Wallet not connected"
          description="Please connect your wallet to manage your anchors."
        />
      ) : loading ? (
        <div data-testid="my-staking-skeleton">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      ) : (
        <>
          <StakingHeroStats stats={heroStats} className="mb-10" />

          <Tabs defaultValue="cst" className="mt-0">
            <TabsList className="w-full h-auto">
              <TabsTrigger value="cst" className="flex-1 py-3">
                <div className="flex items-center">
                  <Image
                    src="/images/CosmicSignatureNFT.png"
                    width={94}
                    height={60}
                    alt="cosmic signature nft"
                  />
                  <span className="text-lg font-semibold whitespace-nowrap normal-case ml-4">
                    Cosmic Signature Anchoring
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="rwlk" className="flex-1 py-3">
                <div className="flex items-center">
                  <Image src="/images/rwalk.jpg" width={94} height={60} alt="RandomWalk nft" />
                  <span className="text-lg font-semibold whitespace-nowrap normal-case ml-4">
                    Random Walk Anchoring
                  </span>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cst" className="p-6">
              <CSTStakingPanel
                account={account}
                stakingActions={stakingCSTActions}
                userTokens={CSTokens}
                stakedTokens={stakedCSTokens}
                stakingRewards={stakingRewards}
                handleStake={(tokenId) => stake(tokenId, false)}
                handleStakeMany={(tokenIds) => stake(tokenIds, false)}
                handleUnstake={(actionId) => unstake(actionId, false)}
                handleUnstakeMany={(actionIds) => unstake(actionIds, false)}
              />
            </TabsContent>

            <TabsContent value="rwlk" className="p-6">
              <RWLKStakingPanel
                account={account}
                stakingActions={stakingRWLKActions}
                rwlkMints={rwlkMints}
                userTokens={rwlkTokens}
                stakedTokens={stakedRWLKTokens}
                handleStake={(tokenId) => stake(tokenId, true)}
                handleStakeMany={(tokenIds) => stake(tokenIds, true)}
                handleUnstake={(actionId) => unstake(actionId, true)}
                handleUnstakeMany={(actionIds) => unstake(actionIds, true)}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </MainWrapper>
  );
};

export default MyStaking;
