'use client';

import { useTranslations } from 'next-intl';

import { formatEthValue } from '@/utils';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GlobalAnchorActionsTable } from '@/components/anchoring/GlobalAnchorActionsTable';
import { GlobalAnchoredTokensTable } from '@/components/anchoring/GlobalAnchoredTokensTable';
import { UniqueAnchorHoldersCSTTable } from '@/components/tables/UniqueAnchorHoldersCSTTable';
import { UniqueAnchorHoldersRWLKTable } from '@/components/tables/UniqueAnchorHoldersRWLKTable';
import type { UniqueAnchorHolderCST } from '@/components/tables/UniqueAnchorHoldersCSTTable';
import type { UniqueAnchorHolderRWLK } from '@/components/tables/UniqueAnchorHoldersRWLKTable';
import type { AnchorAction, AnchoredTokenInfo } from '@/services/api';

import { StatisticsItem } from './StatisticsItem';
import { StatisticsGroup } from './StatisticsGroup';
import { StatsSection } from './StatsSection';

/** Query-state bundle for one anchoring dataset. */
export interface AnchoringDataState<T> {
  data: T[] | null | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

/** Props for the anchoring statistics section. */
export interface AnchoringSectionProps {
  cstStats: {
    NumActiveStakers: number;
    NumDeposits?: number;
    TotalRewardEth?: number;
    TotalTokensStaked: number;
    UnclaimedRewardEth?: number;
  };
  rwlkStats: {
    NumActiveStakers: number;
    TotalTokensMinted?: number;
    TotalTokensStaked: number;
  };
  cstAnchorActions: AnchoringDataState<AnchorAction>;
  rwlkAnchorActions: AnchoringDataState<AnchorAction>;
  anchoredCSTokens: AnchoringDataState<AnchoredTokenInfo>;
  anchoredRWLKTokens: AnchoringDataState<AnchoredTokenInfo>;
  uniqueCSTAnchorHolders: AnchoringDataState<UniqueAnchorHolderCST>;
  uniqueRWLKAnchorHolders: AnchoringDataState<UniqueAnchorHolderRWLK>;
}

interface AnchoringTableSectionProps<T> {
  title: string;
  tooltip: string;
  state: AnchoringDataState<T>;
  emptyTitle: string;
  children: React.ReactNode;
}

function AnchoringTableSection<T>({
  title,
  tooltip,
  state,
  emptyTitle,
  children,
}: AnchoringTableSectionProps<T>) {
  return (
    <StatsSection
      title={title}
      tooltip={tooltip}
      isLoading={state.isLoading}
      isError={state.isError}
      onRetry={state.onRetry}
      isEmpty={(state.data ?? []).length === 0}
      emptyTitle={emptyTitle}
    >
      {children}
    </StatsSection>
  );
}

/** CST and RWLK anchoring tabs with stats, actions, anchored tokens, and unique anchor-holders. */
export function AnchoringSection({
  cstStats,
  rwlkStats,
  cstAnchorActions,
  rwlkAnchorActions,
  anchoredCSTokens,
  anchoredRWLKTokens,
  uniqueCSTAnchorHolders,
  uniqueRWLKAnchorHolders,
}: AnchoringSectionProps) {
  const t = useTranslations('statistics');

  return (
    <Tabs defaultValue="cst" className="mt-8">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 p-1 sm:inline-flex sm:w-auto sm:flex-nowrap">
        <TabsTrigger
          value="cst"
          className="min-w-0 flex-1 whitespace-normal px-2 py-2 text-center text-sm font-semibold leading-tight sm:flex-none sm:whitespace-nowrap sm:px-3 sm:py-1.5 sm:text-lg"
        >
          {t('anchoringPage.tabs.cosmicSignature')}
        </TabsTrigger>
        <TabsTrigger
          value="rwlk"
          className="min-w-0 flex-1 whitespace-normal px-2 py-2 text-center text-sm font-semibold leading-tight sm:flex-none sm:whitespace-nowrap sm:px-3 sm:py-1.5 sm:text-lg"
        >
          {t('anchoringPage.tabs.randomWalk')}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cst" className="space-y-6 pt-4">
        <StatisticsGroup
          title={t('anchoringPage.groups.cosmicSignature')}
          accentColor="blue"
          tooltip={t('anchoringTooltips.cstGroup')}
        >
          <StatisticsItem
            title={t('anchoringPage.stats.activeHolders')}
            value={cstStats.NumActiveStakers}
            tooltip={t('anchoringTooltips.cstActiveAnchorHolders')}
          />
          <StatisticsItem
            title={t('anchoringPage.stats.distributionDeposits')}
            value={cstStats.NumDeposits ?? '—'}
            tooltip={t('anchoringTooltips.cstAnchorDistributionDeposits')}
          />
          <StatisticsItem
            title={t('anchoringPage.stats.totalDistributions')}
            value={formatEthValue(cstStats.TotalRewardEth ?? 0)}
            tooltip={t('anchoringTooltips.cstTotalAnchorDistributions')}
          />
          <StatisticsItem
            title={t('anchoringPage.stats.tokensAnchored')}
            value={cstStats.TotalTokensStaked}
            tooltip={t('anchoringTooltips.cstTotalTokensAnchored')}
          />
          <StatisticsItem
            title={t('anchoringPage.stats.unretrievedDistributions')}
            value={formatEthValue(cstStats.UnclaimedRewardEth ?? 0)}
            tooltip={t('anchoringTooltips.cstUnretrievedAnchorDistributions')}
          />
        </StatisticsGroup>

        <AnchoringTableSection
          title={t('anchoringPage.tables.actions')}
          tooltip={t('sectionTooltips.anchorReleaseActions')}
          state={cstAnchorActions}
          emptyTitle={t('anchoringPage.empty.actions')}
        >
          <GlobalAnchorActionsTable list={cstAnchorActions.data ?? []} IsRWLK={false} />
        </AnchoringTableSection>

        <AnchoringTableSection
          title={t('anchoringPage.tables.anchoredTokens')}
          tooltip={t('sectionTooltips.anchoredTokens')}
          state={anchoredCSTokens}
          emptyTitle={t('anchoringPage.empty.tokens')}
        >
          <GlobalAnchoredTokensTable list={anchoredCSTokens.data ?? []} IsRWLK={false} />
        </AnchoringTableSection>

        <AnchoringTableSection
          title={t('anchoringPage.tables.uniqueHolders')}
          tooltip={t('sectionTooltips.uniqueAnchorHolders')}
          state={uniqueCSTAnchorHolders}
          emptyTitle={t('anchoringPage.empty.holders')}
        >
          <UniqueAnchorHoldersCSTTable list={uniqueCSTAnchorHolders.data ?? []} />
        </AnchoringTableSection>
      </TabsContent>

      <TabsContent value="rwlk" className="space-y-6 pt-4">
        <StatisticsGroup
          title={t('anchoringPage.groups.randomWalk')}
          accentColor="purple"
          tooltip={t('anchoringTooltips.rwlkGroup')}
        >
          <StatisticsItem
            title={t('anchoringPage.stats.activeHolders')}
            value={rwlkStats.NumActiveStakers}
            tooltip={t('anchoringTooltips.rwlkActiveAnchorHolders')}
          />
          <StatisticsItem
            title={t('anchoringPage.stats.tokensImprinted')}
            value={rwlkStats.TotalTokensMinted ?? '—'}
            tooltip={t('anchoringTooltips.rwlkTotalTokensImprinted')}
          />
          <StatisticsItem
            title={t('anchoringPage.stats.tokensAnchored')}
            value={rwlkStats.TotalTokensStaked}
            tooltip={t('anchoringTooltips.rwlkTotalTokensAnchored')}
          />
        </StatisticsGroup>

        <AnchoringTableSection
          title={t('anchoringPage.tables.actions')}
          tooltip={t('sectionTooltips.anchorReleaseActions')}
          state={rwlkAnchorActions}
          emptyTitle={t('anchoringPage.empty.actions')}
        >
          <GlobalAnchorActionsTable list={rwlkAnchorActions.data ?? []} IsRWLK={true} />
        </AnchoringTableSection>

        <AnchoringTableSection
          title={t('anchoringPage.tables.anchoredTokens')}
          tooltip={t('sectionTooltips.anchoredTokens')}
          state={anchoredRWLKTokens}
          emptyTitle={t('anchoringPage.empty.tokens')}
        >
          <GlobalAnchoredTokensTable list={anchoredRWLKTokens.data ?? []} IsRWLK={true} />
        </AnchoringTableSection>

        <AnchoringTableSection
          title={t('anchoringPage.tables.uniqueHolders')}
          tooltip={t('sectionTooltips.uniqueAnchorHolders')}
          state={uniqueRWLKAnchorHolders}
          emptyTitle={t('anchoringPage.empty.holders')}
        >
          <UniqueAnchorHoldersRWLKTable list={uniqueRWLKAnchorHolders.data ?? []} />
        </AnchoringTableSection>
      </TabsContent>
    </Tabs>
  );
}
