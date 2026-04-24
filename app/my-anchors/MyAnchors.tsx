'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { Layers, TrendingUp, Gift } from 'lucide-react';

import { PageShell } from '@/components/ui/page-shell';
import { SectionEyebrow } from '@/components/ui/section-eyebrow';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useActiveWeb3React } from '@/hooks/web3';
import {
  useDashboardInfo,
  useCSTAnchorActionsByUser,
  useCSTTokensByUser,
  useAnchorDistributionsByUser,
  useRWLKAnchorActionsByUser,
  useRWLKAnchorImprintsByUser,
} from '@/hooks/useApiQuery';
import { useAnchoredToken } from '@/contexts/AnchoredTokenContext';
import { useAnchorActions } from '@/hooks/useAnchorActions';
import { CSTAnchoringPanel } from '@/components/anchoring/CSTAnchoringPanel';
import { RWLKAnchoringPanel } from '@/components/anchoring/RWLKAnchoringPanel';
import { AnchoringHeroStats } from '@/components/anchoring/AnchoringHeroStats';
import type { AnchoringStatItem } from '@/components/anchoring/AnchoringHeroStats';
import { StatCardSkeleton } from '@/components/ui/stat-card';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { PageHeader } from '@/components/layout/PageHeader';

const MyAnchors = () => {
  const { account } = useActiveWeb3React();
  const { anchor, release, handleError, rwalkContract } = useAnchorActions();

  const { data: dashboardData, isLoading: loadingDashboard } = useDashboardInfo();
  const { data: cstAnchorActions = [], isLoading: loadingCSTActions } =
    useCSTAnchorActionsByUser(account);
  const { data: cstTokensRaw = [], isLoading: loadingCST } = useCSTTokensByUser(account);
  const { data: anchorDistributions = [], isLoading: loadingRewards } =
    useAnchorDistributionsByUser(account);
  const { data: rwlkAnchorActions = [], isLoading: loadingRWLK } =
    useRWLKAnchorActionsByUser(account);
  const { data: rwlkImprints = [], isLoading: loadingMints } = useRWLKAnchorImprintsByUser(account);

  const CSTokens = useMemo(() => cstTokensRaw.filter((x) => !x.WasUnstaked), [cstTokensRaw]);

  const rewardPerCST = useMemo(() => {
    const totalAnchoredCST = dashboardData?.MainStats?.StakeStatisticsCST?.TotalTokensStaked || 0;
    if (totalAnchoredCST > 0) {
      return (dashboardData?.StakingAmountEth ?? 0) / totalAnchoredCST;
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

  const { cstokens: anchoredCSTokens, rwlktokens: anchoredRWLKTokens } = useAnchoredToken();

  const unclaimedRewardEth = useMemo(() => {
    return anchorDistributions.reduce((sum, r) => sum + (r.RewardToCollectEth ?? 0), 0);
  }, [anchorDistributions]);

  const heroStats: AnchoringStatItem[] = useMemo(
    () => [
      {
        label: 'Your Anchored CST',
        value: anchoredCSTokens.length.toLocaleString(),
        tooltip:
          'Number of Cosmic Signature NFTs you currently have anchored. Anchoring more tokens increases your share of Anchor Distributions.',
        icon: <Layers className="h-4 w-4" />,
      },
      {
        label: 'Your Anchored RWLK',
        value: anchoredRWLKTokens.length.toLocaleString(),
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
    [anchoredCSTokens, anchoredRWLKTokens, unclaimedRewardEth, rewardPerCST],
  );

  useEffect(() => {
    const fetchRWLKTokens = async () => {
      if (!account || !rwalkContract) return;
      try {
        const anchoredIds = anchoredRWLKTokens.map((x) => x.StakedTokenId);
        const userOwned = await rwalkContract.read.walletOfOwner?.([account]);
        const rawIds = (userOwned as readonly bigint[]).map((t) => Number(t)).sort();
        const filteredIds = rawIds.filter(
          (id) =>
            !anchoredIds.includes(id) &&
            !rwlkAnchorActions.some((action) => action.ActionType !== 1 && action.TokenId === id),
        );
        setRwlkTokens(filteredIds);
      } catch (err) {
        handleError(err);
      }
    };
    fetchRWLKTokens();
  }, [account, rwalkContract, anchoredRWLKTokens, rwlkAnchorActions, handleError]);

  return (
    <PageShell variant="data" backdrop="signature">
      <PageHeader
        align="left"
        eyebrow={
          <SectionEyebrow tone="aurora" pulse>
            Personal · Anchors
          </SectionEyebrow>
        }
        title="My Anchors"
        gradientTitle="signature"
        subtitle="Manage your anchored tokens and view distributions"
      />

      {!account ? (
        <EmptyState
          title="Wallet not connected"
          description="Please connect your wallet to manage your anchors."
        />
      ) : loading ? (
        <div data-testid="my-anchors-skeleton">
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
          <AnchoringHeroStats stats={heroStats} className="mb-10" />

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
              <CSTAnchoringPanel
                account={account}
                stakingActions={cstAnchorActions}
                userTokens={CSTokens}
                anchoredTokens={anchoredCSTokens}
                anchorDistributions={anchorDistributions}
                handleStake={(tokenId) => anchor(tokenId, false)}
                handleStakeMany={(tokenIds) => anchor(tokenIds, false)}
                handleUnstake={(actionId) => release(actionId, false)}
                handleUnstakeMany={(actionIds) => release(actionIds, false)}
              />
            </TabsContent>

            <TabsContent value="rwlk" className="p-6">
              <RWLKAnchoringPanel
                account={account}
                stakingActions={rwlkAnchorActions}
                rwlkImprints={rwlkImprints}
                userTokens={rwlkTokens}
                anchoredTokens={anchoredRWLKTokens}
                handleStake={(tokenId) => anchor(tokenId, true)}
                handleStakeMany={(tokenIds) => anchor(tokenIds, true)}
                handleUnstake={(actionId) => release(actionId, true)}
                handleUnstakeMany={(actionIds) => release(actionIds, true)}
              />
            </TabsContent>
          </Tabs>
        </>
      )}
    </PageShell>
  );
};

export default MyAnchors;
