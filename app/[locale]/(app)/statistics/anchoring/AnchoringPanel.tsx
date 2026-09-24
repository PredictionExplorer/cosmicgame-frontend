'use client';

import { ArrowRight } from 'lucide-react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';

import { countActiveAnchorHolders } from '@/utils/anchoringStats';
import { toFiniteNumber } from '@/utils/finiteNumber';
import { useFormat } from '@/hooks/useFormat';
import { Link } from '@/i18n/navigation';
import { TOUCH_TARGET_TEXT_LINK_CLASS } from '@/lib/touch-target';
import { cn } from '@/lib/utils';
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
 * The anchoring statistics. The page counts; the pool and what it means per
 * NFT belong to the Anchor Distributions hub, one link away, so the two pages
 * never lead with the same figures. First the counts of both collections as
 * one hairline strip (the wallets anchoring either, then the NFTs anchored in
 * each, named as the hub names them), then each collection's own figures and
 * its anchor and release, anchored-NFT and anchor-holder ledgers. A figure
 * waits as a skeleton while the dashboard loads and reads Unavailable when it
 * fails; it is never a confident zero.
 */
const AnchoringPanel = () => {
  const t = useTranslations('statistics');
  const tAnchoring = useTranslations('anchoring');
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
  // Distinct wallets anchoring either kind: the per-kind NumActiveStakers overlap, so their
  // sum counted a wallet that anchors both kinds twice.
  const activeAnchorHolders = countActiveAnchorHolders(
    uniqueCSTAnchorHoldersQuery.data,
    uniqueRWLKAnchorHoldersQuery.data,
  );
  const holdersLoading =
    uniqueCSTAnchorHoldersQuery.isLoading || uniqueRWLKAnchorHoldersQuery.isLoading;
  const pending = <Skeleton className="h-7 w-24" />;
  const count = (value: unknown) => {
    const known = toFiniteNumber(value);
    return known === null ? null : format.count(known);
  };

  const figures: PageHeaderFigure[] = [
    {
      id: 'activeHolders',
      label: t('anchoringPage.snapshot.activeHoldersLabel'),
      info: t('anchoringPage.snapshot.activeHoldersTooltip'),
      value: holdersLoading ? pending : count(activeAnchorHolders),
    },
    {
      id: 'anchoredCosmicSignature',
      label: tAnchoring('flow.cosmicSignature.anchored.label'),
      info: tAnchoring('flow.cosmicSignature.anchored.definition'),
      value: dashboard.isLoading ? pending : count(cstAnchorStats?.TotalTokensStaked),
    },
    {
      id: 'anchoredRandomWalk',
      label: tAnchoring('flow.randomWalk.anchored.label'),
      info: tAnchoring('flow.randomWalk.anchored.definition'),
      value: dashboard.isLoading ? pending : count(rwlkAnchorStats?.TotalTokensStaked),
    },
  ];

  return (
    <div data-testid="anchoring-panel">
      <section aria-labelledby="anchoring-now-heading">
        <SectionHeader
          headingId="anchoring-now-heading"
          title={t('anchoringPage.nowTitle')}
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
        cstStats={cstAnchorStats}
        rwlkStats={rwlkAnchorStats}
        statsLoading={dashboard.isLoading}
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
