'use client';

import { ArrowRight } from 'lucide-react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { countActiveAnchorHolders, distributionPerAnchoredNft } from '@/utils/anchoringStats';
import { useFormat } from '@/hooks/useFormat';
import { Link } from '@/i18n/navigation';
import {
  useCSTAnchorActions,
  useDashboardInfo,
  useGlobalAnchoredCSTokens,
  useGlobalAnchoredRWLKTokens,
  useRWLKAnchorActions,
  useUniqueCSTAnchorHolders,
  useUniqueRWLKAnchorHolders,
} from '@/hooks/useApiQuery';
import { Amount } from '@/components/ui/amount';
import { SectionHeader } from '@/components/ui/section-header';
import { StatCard, StatGrid } from '@/components/ui/stat-card';
import { UnknownValue } from '@/components/ui/unknown-value';
import {
  AnchoringSection,
  type AnchoringDataState,
} from '@/components/statistics/AnchoringSection';
import type { UniqueAnchorHolderCST } from '@/components/tables/UniqueAnchorHoldersCSTTable';
import type { UniqueAnchorHolderRWLK } from '@/components/tables/UniqueAnchorHoldersRWLKTable';

function toDataState<T>(query: UseQueryResult<T[], Error>): AnchoringDataState<T> {
  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    onRetry: () => query.refetch(),
  };
}

/**
 * Anchoring right now (one row of figures with the pool as its headline),
 * then the anchor and release ledgers, anchored NFTs and anchor-holders of
 * each collection.
 */
const AnchoringPanel = () => {
  const t = useTranslations('statistics');
  const tCommon = useTranslations('common');
  const format = useFormat();
  const dashboard = useDashboardInfo(undefined, { poll: false });
  const cstAnchorActionsQuery = useCSTAnchorActions();
  const rwlkAnchorActionsQuery = useRWLKAnchorActions();
  const anchoredCSTokensQuery = useGlobalAnchoredCSTokens();
  const anchoredRWLKTokensQuery = useGlobalAnchoredRWLKTokens();
  const uniqueCSTAnchorHoldersQuery = useUniqueCSTAnchorHolders();
  const uniqueRWLKAnchorHoldersQuery = useUniqueRWLKAnchorHolders();

  const cstAnchorStats = dashboard.data?.MainStats.StakeStatisticsCST;
  const rwlkAnchorStats = dashboard.data?.MainStats.StakeStatisticsRWalk;
  const unknown = <UnknownValue label={tCommon('status.unavailable')} />;
  const count = (value: number | undefined) =>
    typeof value === 'number' ? format.count(value) : unknown;
  const pool = dashboard.data?.StakingAmountEth;
  const perNft = distributionPerAnchoredNft(pool, cstAnchorStats?.TotalTokensStaked);
  // Distinct wallets anchoring either kind: the per-kind NumActiveStakers overlap, so their
  // sum counted a wallet that anchors both kinds twice.
  const activeAnchorHolders = countActiveAnchorHolders(
    uniqueCSTAnchorHoldersQuery.data,
    uniqueRWLKAnchorHoldersQuery.data,
  );
  const figuresLoading =
    dashboard.isLoading ||
    uniqueCSTAnchorHoldersQuery.isLoading ||
    uniqueRWLKAnchorHoldersQuery.isLoading;

  return (
    <div data-testid="anchoring-panel">
      <section aria-labelledby="anchoring-now-heading">
        <SectionHeader
          headingId="anchoring-now-heading"
          title={t('anchoringPage.nowTitle')}
          description={t('anchoringPage.description')}
          actions={
            <Link href="/anchoring" className="link inline-flex items-center gap-1.5 type-body-sm">
              {t('anchoringPage.historyLink')}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          }
        />
        <StatGrid className="grid-cols-1 min-[430px]:grid-cols-2 lg:grid-cols-5">
          <StatCard
            className="min-[430px]:col-span-2 lg:col-span-1"
            emphasis
            label={t('anchoringPage.snapshot.poolLabel')}
            tooltip={t('anchoringPage.snapshot.poolTooltip')}
            value={
              typeof pool === 'number' ? <Amount value={pool} unit="ETH" context="card" /> : unknown
            }
            caption={t('anchoringPage.snapshot.poolCaption')}
            loading={figuresLoading}
          />
          <StatCard
            label={t('anchoringPage.snapshot.perNftLabel')}
            tooltip={t('anchoringPage.snapshot.perNftTooltip')}
            value={
              perNft.status === 'available' ? (
                <Amount value={perNft.perNftEth} unit="ETH" context="card" />
              ) : (
                unknown
              )
            }
            caption={
              perNft.status === 'noneAnchored'
                ? t('anchoringPage.snapshot.perNftNoneAnchored')
                : undefined
            }
            loading={figuresLoading}
          />
          <StatCard
            label={t('anchoringPage.snapshot.cosmicSignatureLabel')}
            tooltip={t('anchoringPage.snapshot.cosmicSignatureTooltip')}
            value={count(cstAnchorStats?.TotalTokensStaked)}
            loading={figuresLoading}
          />
          <StatCard
            label={t('anchoringPage.snapshot.randomWalkLabel')}
            tooltip={t('anchoringPage.snapshot.randomWalkTooltip')}
            value={count(rwlkAnchorStats?.TotalTokensStaked)}
            loading={figuresLoading}
          />
          <StatCard
            label={t('anchoringPage.snapshot.activeHoldersLabel')}
            tooltip={t('anchoringPage.snapshot.activeHoldersTooltip')}
            value={activeAnchorHolders === null ? unknown : format.count(activeAnchorHolders)}
            loading={figuresLoading}
          />
        </StatGrid>
      </section>

      <AnchoringSection
        cstStats={cstAnchorStats ?? { NumActiveStakers: 0, TotalTokensStaked: 0 }}
        rwlkStats={rwlkAnchorStats ?? { NumActiveStakers: 0, TotalTokensStaked: 0 }}
        cstAnchorActions={toDataState(cstAnchorActionsQuery)}
        rwlkAnchorActions={toDataState(rwlkAnchorActionsQuery)}
        anchoredCSTokens={toDataState(anchoredCSTokensQuery)}
        anchoredRWLKTokens={toDataState(anchoredRWLKTokensQuery)}
        uniqueCSTAnchorHolders={
          toDataState(uniqueCSTAnchorHoldersQuery) as AnchoringDataState<UniqueAnchorHolderCST>
        }
        uniqueRWLKAnchorHolders={
          toDataState(uniqueRWLKAnchorHoldersQuery) as AnchoringDataState<UniqueAnchorHolderRWLK>
        }
      />
    </div>
  );
};

export default AnchoringPanel;
