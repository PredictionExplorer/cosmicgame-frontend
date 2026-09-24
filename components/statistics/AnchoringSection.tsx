'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';

import { useFormat } from '@/hooks/useFormat';
import { PageHeaderFigures, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { Amount } from '@/components/ui/amount';
import { Skeleton } from '@/components/ui/skeleton';
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
  /** The dashboard's Cosmic Signature anchoring figures; missing while loading or when unread. */
  cstStats?: {
    NumActiveStakers?: number;
    NumDeposits?: number;
    TotalRewardEth?: number;
    UnclaimedRewardEth?: number;
  } | null;
  /** The dashboard's Random Walk anchoring figures; missing while loading or when unread. */
  rwlkStats?: {
    NumActiveStakers?: number;
    TotalTokensMinted?: number;
  } | null;
  /** The dashboard is still loading: the figures hold skeletons, not dashes or zeros. */
  statsLoading?: boolean;
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
      {children}
    </StatsSection>
  );
}

/**
 * A tab's figure strip: a label that wraps pushes nothing, every value sits
 * on the row's bottom line.
 */
const FIGURES_LAYOUT =
  'mt-0 sm:mt-0 sm:[&>div]:flex sm:[&>div]:flex-col sm:[&>div>dt]:grow lg:[&>div]:px-6';

/**
 * The anchoring statistics, one underline tab per NFT kind: the kind's own
 * figures (the anchored counts of both kinds lead the page above the tabs),
 * its Definitions disclosure, then the actions, anchored NFTs and
 * anchor-holders ledgers as sections. While the dashboard loads each figure
 * holds a skeleton; one it could not read is the Unavailable dash.
 */
export function AnchoringSection({
  cstStats,
  rwlkStats,
  statsLoading = false,
  cstAnchorActions,
  rwlkAnchorActions,
  anchoredCSTokens,
  anchoredRWLKTokens,
  uniqueCSTAnchorHolders,
  uniqueRWLKAnchorHolders,
}: AnchoringSectionProps) {
  const t = useTranslations('statistics');
  const format = useFormat();
  const pending = <Skeleton className="h-7 w-20" />;
  const count = (value: number | undefined) =>
    statsLoading ? pending : typeof value === 'number' ? format.count(value) : null;
  const eth = (value: number | undefined) =>
    statsLoading ? pending : typeof value === 'number' ? <Amount value={value} unit="ETH" /> : null;

  const cstFigures: PageHeaderFigure[] = [
    {
      id: 'activeHolders',
      label: t('anchoringPage.stats.activeHoldersCosmicSignature'),
      value: count(cstStats?.NumActiveStakers),
    },
    {
      id: 'deposits',
      label: t('anchoringPage.stats.distributionDeposits'),
      value: count(cstStats?.NumDeposits),
    },
    {
      id: 'totalDistributions',
      label: t('anchoringPage.stats.totalDistributions'),
      value: eth(cstStats?.TotalRewardEth),
    },
    {
      id: 'unretrieved',
      label: t('anchoringPage.stats.unretrievedDistributions'),
      value: eth(cstStats?.UnclaimedRewardEth),
    },
  ];

  const rwlkFigures: PageHeaderFigure[] = [
    {
      id: 'activeHolders',
      label: t('anchoringPage.stats.activeHoldersRandomWalk'),
      value: count(rwlkStats?.NumActiveStakers),
    },
    {
      id: 'tokensImprinted',
      label: t('anchoringPage.stats.tokensImprinted'),
      value: count(rwlkStats?.TotalTokensMinted),
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
          <PageHeaderFigures figures={cstFigures} className={FIGURES_LAYOUT} />
          <DefinitionsDisclosure
            className="mt-6"
            label={t('shared.definitions')}
            items={[
              {
                term: t('anchoringPage.stats.activeHoldersCosmicSignature'),
                definition: t('anchoringTooltips.cstActiveAnchorHolders'),
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
          <PageHeaderFigures figures={rwlkFigures} className={FIGURES_LAYOUT} />
          <DefinitionsDisclosure
            className="mt-6"
            label={t('shared.definitions')}
            items={[
              {
                term: t('anchoringPage.stats.activeHoldersRandomWalk'),
                definition: t('anchoringTooltips.rwlkActiveAnchorHolders'),
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
