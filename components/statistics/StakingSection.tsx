import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GlobalStakingActionsTable } from '@/components/staking/GlobalStakingActionsTable';
import { GlobalStakedTokensTable } from '@/components/staking/GlobalStakedTokensTable';
import { UniqueStakersCSTTable } from '@/components/tables/UniqueStakersCSTTable';
import { UniqueStakersRWLKTable } from '@/components/tables/UniqueStakersRWLKTable';
import type { UniqueStakerCST } from '@/components/tables/UniqueStakersCSTTable';
import type { UniqueStakerRWLK } from '@/components/tables/UniqueStakersRWLKTable';
import type { StakingAction, StakedTokenInfo } from '@/services/api';

import { StatisticsItem } from './StatisticsItem';
import { StatisticsGroup } from './StatisticsGroup';
import { CollapsibleSection } from './CollapsibleSection';

/** Props for the anchoring statistics section. */
export interface StakingSectionProps {
  cstStats: {
    NumActiveStakers: number;
    NumDeposits: number;
    TotalRewardEth: number;
    TotalTokensMinted: number;
    TotalTokensStaked: number;
    UnclaimedRewardEth?: number;
  };
  rwlkStats: {
    NumActiveStakers: number;
    TotalTokensMinted: number;
    TotalTokensStaked: number;
  };
  stakingCSTActions: StakingAction[] | null;
  stakingRWLKActions: StakingAction[] | null;
  stakedCSTokens: StakedTokenInfo[] | null;
  stakedRWLKTokens: StakedTokenInfo[] | null;
  uniqueCSTStakers: UniqueStakerCST[];
  uniqueRWLKStakers: UniqueStakerRWLK[];
}

/** CST and RWLK anchoring tabs with stats, actions, anchored tokens, and unique anchor-holders. */
export function StakingSection({
  cstStats,
  rwlkStats,
  stakingCSTActions,
  stakingRWLKActions,
  stakedCSTokens,
  stakedRWLKTokens,
  uniqueCSTStakers,
  uniqueRWLKStakers,
}: StakingSectionProps) {
  return (
    <Tabs defaultValue="cst" className="mt-8">
      <TabsList>
        <TabsTrigger value="cst" className="text-lg font-semibold">
          CosmicSignature Token
        </TabsTrigger>
        <TabsTrigger value="rwlk" className="text-lg font-semibold">
          RandomWalk Token
        </TabsTrigger>
      </TabsList>

      <TabsContent value="cst" className="space-y-6 pt-4">
        <StatisticsGroup title="CST Anchoring Overview" accentColor="blue">
          <StatisticsItem
            title="Number of Active Anchor-holders"
            value={cstStats.NumActiveStakers}
            tooltip="Wallets currently anchoring at least one Cosmic Signature Token"
          />
          <StatisticsItem
            title="Number of Anchor-Distribution Deposits"
            value={cstStats.NumDeposits}
            tooltip="Total distribution deposit events into the CST Anchor pool"
          />
          <StatisticsItem
            title="Total Anchor Distributions"
            value={`${(cstStats.TotalRewardEth ?? 0).toFixed(4)} ETH`}
            tooltip="Total ETH distributed as Anchor Distributions to CST anchor-holders"
          />
          <StatisticsItem title="Total Tokens Imprinted" value={cstStats.TotalTokensMinted} />
          <StatisticsItem
            title="Total Tokens Anchored"
            value={cstStats.TotalTokensStaked}
            tooltip="Number of Cosmic Signature Tokens currently anchored in the protocol"
          />
          <StatisticsItem
            title="Unretrieved Anchor Distributions"
            value={`${(cstStats.UnclaimedRewardEth ?? 0).toFixed(4)} ETH`}
            tooltip="Anchor Distributions allocated but not yet retrieved by anchor-holders"
          />
        </StatisticsGroup>

        <CollapsibleSection title="Anchor / Release Actions">
          {stakingCSTActions === null ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <GlobalStakingActionsTable list={stakingCSTActions} IsRWLK={false} />
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Anchored Tokens">
          {stakedCSTokens === null ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <GlobalStakedTokensTable list={stakedCSTokens ?? []} IsRWLK={false} />
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Unique Anchor-holders">
          <UniqueStakersCSTTable list={uniqueCSTStakers} />
        </CollapsibleSection>
      </TabsContent>

      <TabsContent value="rwlk" className="space-y-6 pt-4">
        <StatisticsGroup title="RWLK Anchoring Overview" accentColor="purple">
          <StatisticsItem
            title="Number of Active Anchor-holders"
            value={rwlkStats.NumActiveStakers}
            tooltip="Wallets currently anchoring at least one RandomWalk Token"
          />
          <StatisticsItem title="Total Tokens Imprinted" value={rwlkStats.TotalTokensMinted} />
          <StatisticsItem
            title="Total Tokens Anchored"
            value={rwlkStats.TotalTokensStaked}
            tooltip="Number of RandomWalk Tokens currently anchored in the protocol"
          />
        </StatisticsGroup>

        <CollapsibleSection title="Anchor / Release Actions">
          {stakingRWLKActions === null ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <GlobalStakingActionsTable list={stakingRWLKActions} IsRWLK={true} />
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Anchored Tokens">
          {stakedRWLKTokens === null ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <GlobalStakedTokensTable list={stakedRWLKTokens ?? []} IsRWLK={true} />
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Unique Anchor-holders">
          <UniqueStakersRWLKTable list={uniqueRWLKStakers} />
        </CollapsibleSection>
      </TabsContent>
    </Tabs>
  );
}
