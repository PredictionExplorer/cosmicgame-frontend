import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { GlobalStakingActionsTable } from '@/components/staking/GlobalStakingActionsTable';
import { GlobalStakedTokensTable } from '@/components/staking/GlobalStakedTokensTable';
import { UniqueStakersCSTTable } from '@/components/tables/UniqueStakersCSTTable';
import { UniqueStakersRWLKTable } from '@/components/tables/UniqueStakersRWLKTable';
import type { UniqueStakerCST } from '@/components/tables/UniqueStakersCSTTable';
import type { UniqueStakerRWLK } from '@/components/tables/UniqueStakersRWLKTable';

import { StatisticsItem } from './StatisticsItem';

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

      <TabsContent value="cst" className="p-6">
        <StatisticsItem title="Number of Active Stakers" value={cstStats.NumActiveStakers} />
        <StatisticsItem title="Number of Staking Rewards Deposits" value={cstStats.NumDeposits} />
        <StatisticsItem
          title="Total Staking Rewards"
          value={`${(cstStats.TotalRewardEth ?? 0).toFixed(4)} ETH`}
        />
        <StatisticsItem title="Total Tokens Minted" value={cstStats.TotalTokensMinted} />
        <StatisticsItem title="Total Tokens Staked" value={cstStats.TotalTokensStaked} />
        <StatisticsItem
          title="Unclaimed Staking Rewards"
          value={`${(cstStats.UnclaimedRewardEth ?? 0).toFixed(4)} ETH`}
        />

        <div>
          <p className="mb-4 mt-4 text-base font-medium">Stake / Unstake Actions</p>
          {stakingCSTActions === null ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <GlobalStakingActionsTable list={stakingCSTActions} IsRWLK={false} />
          )}
        </div>

        <div className="mt-8">
          <p className="mb-4 text-base font-medium">Staked Tokens</p>
          {stakedCSTokens === null ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <GlobalStakedTokensTable list={stakedCSTokens ?? []} IsRWLK={false} />
          )}
        </div>

        <div className="mt-8">
          <p className="mb-4 text-base font-medium">Unique Stakers</p>
          <UniqueStakersCSTTable list={uniqueCSTStakers} />
        </div>
      </TabsContent>

      <TabsContent value="rwlk" className="p-6">
        <StatisticsItem title="Number of Active Stakers" value={rwlkStats.NumActiveStakers} />
        <StatisticsItem title="Total Tokens Minted" value={rwlkStats.TotalTokensMinted} />
        <StatisticsItem title="Total Tokens Staked" value={rwlkStats.TotalTokensStaked} />

        <div>
          <p className="mb-4 mt-4 text-base font-medium">Stake / Unstake Actions</p>
          {stakingRWLKActions === null ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <GlobalStakingActionsTable list={stakingRWLKActions} IsRWLK={true} />
          )}
        </div>

        <div className="mt-8">
          <p className="mb-4 text-base font-medium">Staked Tokens</p>
          {stakedRWLKTokens === null ? (
            <p className="text-lg font-semibold">Loading...</p>
          ) : (
            <GlobalStakedTokensTable list={stakedRWLKTokens ?? []} IsRWLK={true} />
          )}
        </div>

        <div className="mt-8">
          <p className="mb-4 text-base font-medium">Unique Stakers</p>
          <UniqueStakersRWLKTable list={uniqueRWLKStakers} />
        </div>
      </TabsContent>
    </Tabs>
  );
}
