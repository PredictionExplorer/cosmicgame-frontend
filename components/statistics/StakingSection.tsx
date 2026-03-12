import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GlobalStakingActionsTable } from '@/components/staking/GlobalStakingActionsTable';
import { GlobalStakedTokensTable } from '@/components/staking/GlobalStakedTokensTable';
import { UniqueStakersCSTTable } from '@/components/tables/UniqueStakersCSTTable';
import { UniqueStakersRWLKTable } from '@/components/tables/UniqueStakersRWLKTable';
import type { UniqueStakerCST } from '@/components/tables/UniqueStakersCSTTable';
import type { UniqueStakerRWLK } from '@/components/tables/UniqueStakersRWLKTable';

import { StatisticsItem } from './StatisticsItem';
import { StatisticsGroup } from './StatisticsGroup';
import { CollapsibleSection } from './CollapsibleSection';

/** Props for the staking statistics section. */
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stakingCSTActions: any[] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stakingRWLKActions: any[] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stakedCSTokens: any[] | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stakedRWLKTokens: any[] | null;
  uniqueCSTStakers: UniqueStakerCST[];
  uniqueRWLKStakers: UniqueStakerRWLK[];
}

/** CST and RWLK staking tabs with stats, actions, staked tokens, and unique stakers. */
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
        <StatisticsGroup title="CST Staking Overview" accentColor="blue">
          <StatisticsItem
            title="Number of Active Stakers"
            value={cstStats.NumActiveStakers}
            tooltip="Wallets currently staking at least one Cosmic Signature Token"
          />
          <StatisticsItem
            title="Number of Staking Rewards Deposits"
            value={cstStats.NumDeposits}
            tooltip="Total reward deposit events into the CST staking pool"
          />
          <StatisticsItem
            title="Total Staking Rewards"
            value={`${(cstStats.TotalRewardEth ?? 0).toFixed(4)} ETH`}
            tooltip="Total ETH distributed as staking rewards to CST stakers"
          />
          <StatisticsItem title="Total Tokens Minted" value={cstStats.TotalTokensMinted} />
          <StatisticsItem
            title="Total Tokens Staked"
            value={cstStats.TotalTokensStaked}
            tooltip="Number of Cosmic Signature Tokens currently locked in the staking contract"
          />
          <StatisticsItem
            title="Unclaimed Staking Rewards"
            value={`${(cstStats.UnclaimedRewardEth ?? 0).toFixed(4)} ETH`}
            tooltip="Staking rewards earned but not yet withdrawn by stakers"
          />
        </StatisticsGroup>

        <CollapsibleSection title="Stake / Unstake Actions">
          {stakingCSTActions === null ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <GlobalStakingActionsTable list={stakingCSTActions} IsRWLK={false} />
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Staked Tokens">
          {stakedCSTokens === null ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <GlobalStakedTokensTable list={stakedCSTokens ?? []} IsRWLK={false} />
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Unique Stakers">
          <UniqueStakersCSTTable list={uniqueCSTStakers} />
        </CollapsibleSection>
      </TabsContent>

      <TabsContent value="rwlk" className="space-y-6 pt-4">
        <StatisticsGroup title="RWLK Staking Overview" accentColor="purple">
          <StatisticsItem
            title="Number of Active Stakers"
            value={rwlkStats.NumActiveStakers}
            tooltip="Wallets currently staking at least one RandomWalk Token"
          />
          <StatisticsItem title="Total Tokens Minted" value={rwlkStats.TotalTokensMinted} />
          <StatisticsItem
            title="Total Tokens Staked"
            value={rwlkStats.TotalTokensStaked}
            tooltip="Number of RandomWalk Tokens currently locked in the staking contract"
          />
        </StatisticsGroup>

        <CollapsibleSection title="Stake / Unstake Actions">
          {stakingRWLKActions === null ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <GlobalStakingActionsTable list={stakingRWLKActions} IsRWLK={true} />
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Staked Tokens">
          {stakedRWLKTokens === null ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <GlobalStakedTokensTable list={stakedRWLKTokens ?? []} IsRWLK={true} />
          )}
        </CollapsibleSection>

        <CollapsibleSection title="Unique Stakers">
          <UniqueStakersRWLKTable list={uniqueRWLKStakers} />
        </CollapsibleSection>
      </TabsContent>
    </Tabs>
  );
}
