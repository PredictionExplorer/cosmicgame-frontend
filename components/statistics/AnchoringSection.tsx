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
import { CollapsibleSection } from './CollapsibleSection';

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
  cstAnchorActions: AnchorAction[] | null;
  rwlkAnchorActions: AnchorAction[] | null;
  anchoredCSTokens: AnchoredTokenInfo[] | null;
  anchoredRWLKTokens: AnchoredTokenInfo[] | null;
  uniqueCSTAnchorHolders: UniqueAnchorHolderCST[];
  uniqueRWLKAnchorHolders: UniqueAnchorHolderRWLK[];
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
      <TabsList>
        <TabsTrigger value="cst" className="text-lg font-semibold">
          Cosmic Signature NFT
        </TabsTrigger>
        <TabsTrigger value="rwlk" className="text-lg font-semibold">
          RandomWalk NFT
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cst" className="space-y-6 pt-4">
        <StatisticsGroup title="Cosmic Signature NFT Anchoring Overview" accentColor="blue">
          <StatisticsItem
            title="Number of Active Anchor-holders"
            value={cstStats.NumActiveStakers}
            tooltip="Wallets currently anchoring at least one Cosmic Signature NFT"
          />
          <StatisticsItem
            title="Number of Anchor-Distribution Deposits"
            value={cstStats.NumDeposits ?? '—'}
            tooltip="Total distribution deposit events into the Cosmic Signature NFT Anchor pool"
          />
          <StatisticsItem
            title="Total Anchor Distributions"
            value={`${(cstStats.TotalRewardEth ?? 0).toFixed(4)} ETH`}
            tooltip="Total ETH distributed as Anchor Distributions to Cosmic Signature NFT anchor-holders"
          />
          <StatisticsItem
            title="Total Tokens Imprinted"
            value={cstStats.TotalTokensMinted ?? '—'}
          />
          <StatisticsItem
            title="Total Tokens Anchored"
            value={cstStats.TotalTokensStaked}
            tooltip="Number of Cosmic Signature NFTs currently anchored in the protocol"
          />
          <StatisticsItem
            title="Unretrieved Anchor Distributions"
            value={`${(cstStats.UnclaimedRewardEth ?? 0).toFixed(4)} ETH`}
            tooltip="Anchor Distributions allocated but not yet retrieved by anchor-holders"
          />
        </StatisticsGroup>

        <CollapsibleSection title="Anchor / Release Actions">
          {cstAnchorActions === null ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <GlobalAnchorActionsTable list={cstAnchorActions} IsRWLK={false} />
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Anchored Tokens">
          {anchoredCSTokens === null ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <GlobalAnchoredTokensTable list={anchoredCSTokens ?? []} IsRWLK={false} />
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Unique Anchor-holders">
          <UniqueAnchorHoldersCSTTable list={uniqueCSTAnchorHolders} />
        </CollapsibleSection>
      </TabsContent>

      <TabsContent value="rwlk" className="space-y-6 pt-4">
        <StatisticsGroup title="RWLK Anchoring Overview" accentColor="purple">
          <StatisticsItem
            title="Number of Active Anchor-holders"
            value={rwlkStats.NumActiveStakers}
            tooltip="Wallets currently anchoring at least one RandomWalk NFT"
          />
          <StatisticsItem
            title="Total Tokens Imprinted"
            value={rwlkStats.TotalTokensMinted ?? '—'}
          />
          <StatisticsItem
            title="Total Tokens Anchored"
            value={rwlkStats.TotalTokensStaked}
            tooltip="Number of RandomWalk NFTs currently anchored in the protocol"
          />
        </StatisticsGroup>

        <CollapsibleSection title="Anchor / Release Actions">
          {rwlkAnchorActions === null ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <GlobalAnchorActionsTable list={rwlkAnchorActions} IsRWLK={true} />
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Anchored Tokens">
          {anchoredRWLKTokens === null ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <GlobalAnchoredTokensTable list={anchoredRWLKTokens ?? []} IsRWLK={true} />
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Unique Anchor-holders">
          <UniqueAnchorHoldersRWLKTable list={uniqueRWLKAnchorHolders} />
        </CollapsibleSection>
      </TabsContent>
    </Tabs>
  );
}
