'use client';

import { statisticsCopy } from '@/content/statistics-copy';
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
    TotalTokensMinted?: number;
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
  return (
    <Tabs defaultValue="cst" className="mt-8">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 p-1 sm:inline-flex sm:w-auto sm:flex-nowrap">
        <TabsTrigger
          value="cst"
          className="min-w-0 flex-1 whitespace-normal px-2 py-2 text-center text-sm font-semibold leading-tight sm:flex-none sm:whitespace-nowrap sm:px-3 sm:py-1.5 sm:text-lg"
        >
          Cosmic Signature NFT
        </TabsTrigger>
        <TabsTrigger
          value="rwlk"
          className="min-w-0 flex-1 whitespace-normal px-2 py-2 text-center text-sm font-semibold leading-tight sm:flex-none sm:whitespace-nowrap sm:px-3 sm:py-1.5 sm:text-lg"
        >
          RandomWalk NFT
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cst" className="space-y-6 pt-4">
        <StatisticsGroup
          title="Cosmic Signature NFT Anchoring Overview"
          accentColor="blue"
          tooltip={statisticsCopy.anchoring.cstGroup}
        >
          <StatisticsItem
            title="Number of Active Anchor-holders"
            value={cstStats.NumActiveStakers}
            tooltip={statisticsCopy.anchoring.cstActiveAnchorHolders}
          />
          <StatisticsItem
            title="Number of Anchor-Distribution Deposits"
            value={cstStats.NumDeposits ?? '—'}
            tooltip={statisticsCopy.anchoring.cstAnchorDistributionDeposits}
          />
          <StatisticsItem
            title="Total Anchor Distributions"
            value={formatEthValue(cstStats.TotalRewardEth ?? 0)}
            tooltip={statisticsCopy.anchoring.cstTotalAnchorDistributions}
          />
          <StatisticsItem
            title="Total Tokens Imprinted"
            value={cstStats.TotalTokensMinted ?? '—'}
            tooltip={statisticsCopy.anchoring.cstTotalTokensImprinted}
          />
          <StatisticsItem
            title="Total Tokens Anchored"
            value={cstStats.TotalTokensStaked}
            tooltip={statisticsCopy.anchoring.cstTotalTokensAnchored}
          />
          <StatisticsItem
            title="Unretrieved Anchor Distributions"
            value={formatEthValue(cstStats.UnclaimedRewardEth ?? 0)}
            tooltip={statisticsCopy.anchoring.cstUnretrievedAnchorDistributions}
          />
        </StatisticsGroup>

        <AnchoringTableSection
          title="Anchor / Release Actions"
          tooltip={statisticsCopy.sections.anchorReleaseActions}
          state={cstAnchorActions}
          emptyTitle="No anchor actions yet"
        >
          <GlobalAnchorActionsTable list={cstAnchorActions.data ?? []} IsRWLK={false} />
        </AnchoringTableSection>

        <AnchoringTableSection
          title="Anchored Tokens"
          tooltip={statisticsCopy.sections.anchoredTokens}
          state={anchoredCSTokens}
          emptyTitle="No tokens currently anchored"
        >
          <GlobalAnchoredTokensTable list={anchoredCSTokens.data ?? []} IsRWLK={false} />
        </AnchoringTableSection>

        <AnchoringTableSection
          title="Unique Anchor-holders"
          tooltip={statisticsCopy.sections.uniqueAnchorHolders}
          state={uniqueCSTAnchorHolders}
          emptyTitle="No anchor-holders yet"
        >
          <UniqueAnchorHoldersCSTTable list={uniqueCSTAnchorHolders.data ?? []} />
        </AnchoringTableSection>
      </TabsContent>

      <TabsContent value="rwlk" className="space-y-6 pt-4">
        <StatisticsGroup
          title="RWLK Anchoring Overview"
          accentColor="purple"
          tooltip={statisticsCopy.anchoring.rwlkGroup}
        >
          <StatisticsItem
            title="Number of Active Anchor-holders"
            value={rwlkStats.NumActiveStakers}
            tooltip={statisticsCopy.anchoring.rwlkActiveAnchorHolders}
          />
          <StatisticsItem
            title="Total Tokens Imprinted"
            value={rwlkStats.TotalTokensMinted ?? '—'}
            tooltip={statisticsCopy.anchoring.rwlkTotalTokensImprinted}
          />
          <StatisticsItem
            title="Total Tokens Anchored"
            value={rwlkStats.TotalTokensStaked}
            tooltip={statisticsCopy.anchoring.rwlkTotalTokensAnchored}
          />
        </StatisticsGroup>

        <AnchoringTableSection
          title="Anchor / Release Actions"
          tooltip={statisticsCopy.sections.anchorReleaseActions}
          state={rwlkAnchorActions}
          emptyTitle="No anchor actions yet"
        >
          <GlobalAnchorActionsTable list={rwlkAnchorActions.data ?? []} IsRWLK={true} />
        </AnchoringTableSection>

        <AnchoringTableSection
          title="Anchored Tokens"
          tooltip={statisticsCopy.sections.anchoredTokens}
          state={anchoredRWLKTokens}
          emptyTitle="No tokens currently anchored"
        >
          <GlobalAnchoredTokensTable list={anchoredRWLKTokens.data ?? []} IsRWLK={true} />
        </AnchoringTableSection>

        <AnchoringTableSection
          title="Unique Anchor-holders"
          tooltip={statisticsCopy.sections.uniqueAnchorHolders}
          state={uniqueRWLKAnchorHolders}
          emptyTitle="No anchor-holders yet"
        >
          <UniqueAnchorHoldersRWLKTable list={uniqueRWLKAnchorHolders.data ?? []} />
        </AnchoringTableSection>
      </TabsContent>
    </Tabs>
  );
}
