'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { useFormat } from '@/hooks/useFormat';
import { PageHeaderFigures, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { Amount } from '@/components/ui/amount';
import { DataTableWidth } from '@/components/ui/data-table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GlobalAnchorActionsTable } from '@/components/anchoring/GlobalAnchorActionsTable';
import { GlobalAnchoredTokensTable } from '@/components/anchoring/GlobalAnchoredTokensTable';
import { UniqueAnchorHoldersCSTTable } from '@/components/tables/UniqueAnchorHoldersCSTTable';
import { UniqueAnchorHoldersRWLKTable } from '@/components/tables/UniqueAnchorHoldersRWLKTable';
import type { UniqueAnchorHolderCST } from '@/components/tables/UniqueAnchorHoldersCSTTable';
import type { UniqueAnchorHolderRWLK } from '@/components/tables/UniqueAnchorHoldersRWLKTable';
import type { AnchorAction, AnchoredTokenInfo } from '@/services/api';

import { DefinitionsDisclosure } from './DefinitionsDisclosure';
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
  children: ReactNode;
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
      {/* The tab stacks five-column and four-column ledgers: every one runs
          the full width, so they share a right edge. */}
      <DataTableWidth value="fill">{children}</DataTableWidth>
    </StatsSection>
  );
}

/**
 * The Cosmic Signature overview's five figures: 3 + 2 on a tablet, then one
 * row of five, never a lone fifth figure wrapped under four. The three
 * counts take less room than the two ETH amounts, and the columns pad a
 * little less than the page header's, so an amount keeps its line at
 * 1024px. A label that wraps pushes nothing: every value sits on the row's
 * bottom line.
 */
const CST_FIGURES_LAYOUT = cn(
  'mt-0 sm:mt-0 sm:grid-cols-3 sm:[&>div]:flex sm:[&>div]:flex-col sm:[&>div>dt]:grow',
  'lg:grid lg:grid-cols-[repeat(3,minmax(0,3fr))_repeat(2,minmax(0,5fr))] lg:[&>div]:px-5',
);

/**
 * The anchoring statistics, one underline tab per NFT kind: an overview
 * figure strip (label over value, divided by hairlines, one row on a wide
 * screen instead of a single stacked column), its Definitions disclosure,
 * then the actions, anchored tokens and anchor-holders ledgers as sections.
 */
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
  const format = useFormat();
  const count = (value: number | undefined) =>
    typeof value === 'number' ? format.count(value) : null;

  const cstFigures: PageHeaderFigure[] = [
    {
      id: 'activeHolders',
      label: t('anchoringPage.stats.activeHoldersCosmicSignature'),
      value: count(cstStats.NumActiveStakers),
    },
    {
      id: 'tokensAnchored',
      label: t('anchoringPage.stats.tokensAnchored'),
      value: count(cstStats.TotalTokensStaked),
    },
    {
      id: 'deposits',
      label: t('anchoringPage.stats.distributionDeposits'),
      value: count(cstStats.NumDeposits),
    },
    {
      id: 'totalDistributions',
      label: t('anchoringPage.stats.totalDistributions'),
      value:
        typeof cstStats.TotalRewardEth === 'number' ? (
          <Amount value={cstStats.TotalRewardEth} unit="ETH" />
        ) : null,
    },
    {
      id: 'unretrieved',
      label: t('anchoringPage.stats.unretrievedDistributions'),
      value:
        typeof cstStats.UnclaimedRewardEth === 'number' ? (
          <Amount value={cstStats.UnclaimedRewardEth} unit="ETH" />
        ) : null,
    },
  ];

  const rwlkFigures: PageHeaderFigure[] = [
    {
      id: 'activeHolders',
      label: t('anchoringPage.stats.activeHoldersRandomWalk'),
      value: count(rwlkStats.NumActiveStakers),
    },
    {
      id: 'tokensAnchored',
      label: t('anchoringPage.stats.tokensAnchored'),
      value: count(rwlkStats.TotalTokensStaked),
    },
    {
      id: 'tokensImprinted',
      label: t('anchoringPage.stats.tokensImprinted'),
      value: count(rwlkStats.TotalTokensMinted),
    },
  ];

  return (
    <Tabs defaultValue="cst" className="mt-8">
      <TabsList
        variant="underline"
        scroll
        className="min-w-full"
        aria-label={t('anchoringPage.tabs.label')}
      >
        <TabsTrigger value="cst">{t('anchoringPage.tabs.cosmicSignature')}</TabsTrigger>
        <TabsTrigger value="rwlk">{t('anchoringPage.tabs.randomWalk')}</TabsTrigger>
      </TabsList>

      <TabsContent value="cst" className="mt-8 space-y-12 sm:space-y-16">
        <div>
          <PageHeaderFigures figures={cstFigures} className={CST_FIGURES_LAYOUT} />
          <DefinitionsDisclosure
            className="mt-6"
            label={t('shared.definitions')}
            items={[
              {
                term: t('anchoringPage.stats.activeHoldersCosmicSignature'),
                definition: t('anchoringTooltips.cstActiveAnchorHolders'),
              },
              {
                term: t('anchoringPage.stats.tokensAnchored'),
                definition: t('anchoringTooltips.cstTotalTokensAnchored'),
              },
              {
                term: t('anchoringPage.stats.distributionDeposits'),
                definition: t('anchoringTooltips.cstAnchorDistributionDeposits'),
              },
              {
                term: t('anchoringPage.stats.totalDistributions'),
                definition: t('anchoringTooltips.cstTotalAnchorDistributions'),
              },
              {
                term: t('anchoringPage.stats.unretrievedDistributions'),
                definition: t('anchoringTooltips.cstUnretrievedAnchorDistributions'),
              },
            ]}
          />
        </div>

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

      <TabsContent value="rwlk" className="mt-8 space-y-12 sm:space-y-16">
        <div>
          <PageHeaderFigures figures={rwlkFigures} className="mt-0 sm:mt-0" />
          <DefinitionsDisclosure
            className="mt-6"
            label={t('shared.definitions')}
            items={[
              {
                term: t('anchoringPage.stats.activeHoldersRandomWalk'),
                definition: t('anchoringTooltips.rwlkActiveAnchorHolders'),
              },
              {
                term: t('anchoringPage.stats.tokensAnchored'),
                definition: t('anchoringTooltips.rwlkTotalTokensAnchored'),
              },
              {
                term: t('anchoringPage.stats.tokensImprinted'),
                definition: t('anchoringTooltips.rwlkTotalTokensImprinted'),
              },
            ]}
          />
        </div>

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
