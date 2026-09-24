'use client';

import { ArrowRight } from 'lucide-react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { countActiveAnchorHolders, distributionPerAnchoredNft } from '@/utils/anchoringStats';
import { useFormat } from '@/hooks/useFormat';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
import {
  useCSTAnchorActions,
  useDashboardInfo,
  useGlobalAnchoredCSTokens,
  useGlobalAnchoredRWLKTokens,
  useRWLKAnchorActions,
  useUniqueCSTAnchorHolders,
  useUniqueRWLKAnchorHolders,
} from '@/hooks/useApiQuery';
import { PageHeaderFigures, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { Amount } from '@/components/ui/amount';
import { SectionHeader } from '@/components/ui/section-header';
import { Skeleton } from '@/components/ui/skeleton';
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
 * Anchoring right now, as one hairline strip of the figures no collection
 * tab repeats (the pool first, what it means per NFT, and the wallets
 * anchoring either collection), then each collection's overview, anchor
 * and release ledger, anchored NFTs and anchor-holders.
 */
const AnchoringPanel = () => {
  const t = useTranslations('statistics');
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
  const pending = <Skeleton className="h-7 w-24" />;

  // The anchored counts of each collection lead its own tab below, so the
  // strip does not repeat them. `null` values read as unavailable.
  const figures: PageHeaderFigure[] = [
    {
      id: 'pool',
      label: t('anchoringPage.snapshot.poolLabel'),
      info: t('anchoringPage.snapshot.poolTooltip'),
      value: figuresLoading ? (
        pending
      ) : typeof pool === 'number' ? (
        <Amount value={pool} unit="ETH" context="card" />
      ) : null,
      caption: t('anchoringPage.snapshot.poolCaption'),
    },
    {
      id: 'perNft',
      label: t('anchoringPage.snapshot.perNftLabel'),
      info: t('anchoringPage.snapshot.perNftTooltip'),
      value: figuresLoading ? (
        pending
      ) : perNft.status === 'available' ? (
        <Amount value={perNft.perNftEth} unit="ETH" context="card" />
      ) : null,
      caption:
        !figuresLoading && perNft.status === 'noneAnchored'
          ? t('anchoringPage.snapshot.perNftNoneAnchored')
          : undefined,
    },
    {
      id: 'activeHolders',
      label: t('anchoringPage.snapshot.activeHoldersLabel'),
      info: t('anchoringPage.snapshot.activeHoldersTooltip'),
      value: figuresLoading
        ? pending
        : activeAnchorHolders === null
          ? null
          : format.count(activeAnchorHolders),
    },
  ];

  return (
    <div data-testid="anchoring-panel">
      <section aria-labelledby="anchoring-now-heading">
        <SectionHeader
          headingId="anchoring-now-heading"
          title={t('anchoringPage.nowTitle')}
          description={t('anchoringPage.description')}
          actions={
            <Link
              href="/anchoring"
              className={cn(
                'link inline-flex items-center gap-1.5 type-body-sm',
                TOUCH_TARGET_TEXT_LINK_CLASS,
              )}
            >
              {t('anchoringPage.historyLink')}
              <ArrowRight aria-hidden className="size-4" />
            </Link>
          }
        />
        <PageHeaderFigures figures={figures} className="mt-0 sm:mt-0" />
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
