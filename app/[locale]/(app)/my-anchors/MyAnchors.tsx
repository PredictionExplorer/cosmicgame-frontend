'use client';

import { useEffect, useState, useMemo } from 'react';
import { Layers, TrendingUp, Gift } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

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
import { formatDistributionPerAnchoredNftEth } from '@/utils/anchoringStats';

const MyAnchors = () => {
  const t = useTranslations('myPages');
  const locale = useLocale();
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

  const distributionPerCST = useMemo(
    () =>
      formatDistributionPerAnchoredNftEth(
        dashboardData?.StakingAmountEth,
        dashboardData?.MainStats?.StakeStatisticsCST?.TotalTokensStaked,
      ),
    [dashboardData],
  );

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
        label: t('anchors.stats.cosmicSignature.label'),
        value: anchoredCSTokens.length.toLocaleString(locale),
        tooltip: t('anchors.stats.cosmicSignature.tooltip'),
        icon: <Layers className="h-4 w-4" />,
      },
      {
        label: t('anchors.stats.randomWalk.label'),
        value: anchoredRWLKTokens.length.toLocaleString(locale),
        tooltip: t('anchors.stats.randomWalk.tooltip'),
        icon: <Layers className="h-4 w-4" />,
      },
      {
        label: t('anchors.stats.unretrieved.label'),
        value: unclaimedRewardEth > 0 ? `${unclaimedRewardEth.toFixed(4)} ETH` : '0 ETH',
        tooltip: t('anchors.stats.unretrieved.tooltip'),
        icon: <Gift className="h-4 w-4" />,
        featured: true,
        gradient: true,
      },
      {
        label: t('anchors.stats.distributionPerNft.label'),
        value: distributionPerCST.value,
        tooltip: [
          t('anchors.stats.distributionPerNft.tooltip'),
          distributionPerCST.indexedCountUnavailable
            ? t('anchors.stats.distributionPerNft.indexUnavailableSuffix')
            : '',
        ]
          .filter(Boolean)
          .join(' '),
        icon: <TrendingUp className="h-4 w-4" />,
      },
    ],
    [anchoredCSTokens, anchoredRWLKTokens, unclaimedRewardEth, distributionPerCST, locale, t],
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
            {t('anchors.eyebrow')}
          </SectionEyebrow>
        }
        title={t('anchors.title')}
        subtitle={t('anchors.subtitle')}
      />

      {!account ? (
        <EmptyState
          title={t('shared.walletNotConnected')}
          description={t('anchors.walletDescription')}
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
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                    <Layers className="h-5 w-5" />
                  </span>
                  <span className="text-lg font-semibold whitespace-nowrap normal-case ml-4">
                    {t('anchors.tabs.cosmicSignature')}
                  </span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="rwlk" className="flex-1 py-3">
                <div className="flex items-center">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[rgb(var(--nebula-violet-rgb)/0.28)] bg-[rgb(var(--nebula-violet-rgb)/0.12)] text-[rgb(var(--nebula-violet-rgb))]">
                    <Layers className="h-5 w-5" />
                  </span>
                  <span className="text-lg font-semibold whitespace-nowrap normal-case ml-4">
                    {t('anchors.tabs.randomWalk')}
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
