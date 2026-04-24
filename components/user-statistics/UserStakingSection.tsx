import Image from 'next/image';
import { Lock, Unlock, Coins, Gift, Layers } from 'lucide-react';

import { formatEthValue } from '@/utils';

import type { StakingAction, StakingRewardMint } from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/ui/stat-card';
import { EmptyState } from '@/components/ui/empty-state';
import StakingActionsTable from '@/components/staking/StakingActionsTable';
import { StakingRewardsTable } from '@/components/staking/StakingRewardsTable';
import { CSTStakingRewardsByDepositTable } from '@/components/staking/CSTStakingRewardsByDepositTable';
import { CollectedCSTStakingRewardsTable } from '@/components/staking/CollectedCSTStakingRewardsTable';
import { UncollectedCSTStakingRewardsTable } from '@/components/staking/UncollectedCSTStakingRewardsTable';
import { RwalkStakingRewardMintsTable } from '@/components/staking/RwalkStakingRewardMintsTable';
import type { CSTStakingRewardByDeposit } from '@/components/staking/CSTStakingRewardsByDepositTable';

import type { UserProfileInfo } from './UserStatsSection';

interface StakingRewardRow {
  TokenId: number;
  RewardCollectedEth?: number;
  RewardToCollectEth?: number;
  [key: string]: unknown;
}

/** Props for the user staking section. */
export interface UserStakingSectionProps {
  address: string;
  userInfo: UserProfileInfo;
  stakingCSTActions: StakingAction[];
  stakingRWLKActions: StakingAction[];
  cstStakingRewards: StakingRewardRow[];
  cstStakingRewardsByDeposit: CSTStakingRewardByDeposit[];
  collectedCstStakingRewards: import('@/services/api/types').StakingCSTReward[];
  rwlkMints: StakingRewardMint[];
}

/** Staking statistics section with CST and RWLK tabs, stat cards, and detailed tables. */
export function UserStakingSection({
  address,
  userInfo,
  stakingCSTActions,
  stakingRWLKActions,
  cstStakingRewards,
  cstStakingRewardsByDeposit,
  collectedCstStakingRewards,
  rwlkMints,
}: UserStakingSectionProps) {
  const totalStakeActions = stakingCSTActions.filter((a) => a.ActionType !== 1).length;
  const totalUnstakeActions = stakingCSTActions.filter((a) => a.ActionType === 1).length;
  const totalRewardEth = cstStakingRewards.reduce(
    (sum, r) => sum + (r.RewardCollectedEth ?? 0) + (r.RewardToCollectEth ?? 0),
    0,
  );
  const unclaimedRewardEth = cstStakingRewards.reduce(
    (sum, r) => sum + (r.RewardToCollectEth ?? 0),
    0,
  );

  const rwlkStats = userInfo?.StakingStatisticsRWalk;
  const hasCSTActivity = stakingCSTActions.length > 0 || cstStakingRewards.length > 0;
  const hasRWLKActivity =
    (rwlkStats?.TotalNumStakeActions ?? 0) > 0 || stakingRWLKActions.length > 0;

  return (
    <div data-testid="user-staking-section">
      <Tabs defaultValue="cst" className="w-full">
        <TabsList className="w-full grid grid-cols-2 h-auto bg-transparent border-b border-border rounded-none p-0">
          <TabsTrigger
            value="cst"
            className="flex-1 h-auto py-3 rounded-none data-[state=active]:bg-white/5 data-[state=active]:shadow-none"
          >
            <div className="flex items-center">
              <Image
                src="/images/CosmicSignatureNFT.png"
                width={94}
                height={60}
                alt="cosmic signature nft"
              />
              <span className="text-lg whitespace-nowrap normal-case ml-4">
                Cosmic Signature Staking
              </span>
            </div>
          </TabsTrigger>
          <TabsTrigger
            value="rwlk"
            className="flex-1 h-auto py-3 rounded-none data-[state=active]:bg-white/5 data-[state=active]:shadow-none"
          >
            <div className="flex items-center">
              <Image src="/images/rwalk.jpg" width={94} height={60} alt="RandomWalk nft" />
              <span className="text-lg whitespace-nowrap normal-case ml-4">
                Random Walk Staking
              </span>
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="cst" className="pt-6">
          {!hasCSTActivity ? (
            <EmptyState
              icon={<Layers className="h-8 w-8 text-muted-foreground/50" />}
              title="No anchoring activity yet"
              description="Anchor your Cosmic Signature NFTs to receive ETH Anchor Distributions each cycle."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
                <StatCard
                  label="Anchor Actions"
                  value={totalStakeActions.toLocaleString()}
                  icon={<Lock className="h-3.5 w-3.5" />}
                  tooltip="Number of times you have anchored Cosmic Signature NFTs."
                />
                <StatCard
                  label="Release Actions"
                  value={totalUnstakeActions.toLocaleString()}
                  icon={<Unlock className="h-3.5 w-3.5" />}
                  tooltip="Number of times you have released anchored Cosmic Signature NFTs."
                />
                <StatCard
                  label="Tokens with Distributions"
                  value={cstStakingRewards.length.toLocaleString()}
                  icon={<Layers className="h-3.5 w-3.5" />}
                  tooltip="Number of anchored tokens that have accumulated Anchor Distributions."
                />
                <StatCard
                  label="Total Distributions"
                  value={formatEthValue(totalRewardEth)}
                  icon={<Coins className="h-3.5 w-3.5" />}
                  tooltip="Total ETH Anchor Distributions received from anchoring (retrieved + unretrieved)."
                  featured
                />
                <StatCard
                  label="Unretrieved Distributions"
                  value={formatEthValue(unclaimedRewardEth)}
                  icon={<Gift className="h-3.5 w-3.5" />}
                  tooltip="Anchor Distributions allocated but not yet retrieved to your wallet."
                  featured={unclaimedRewardEth > 0}
                  gradient={unclaimedRewardEth > 0}
                />
              </div>

              <div className="space-y-8">
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    Anchor / Release Actions
                  </h6>
                  <StakingActionsTable list={stakingCSTActions} IsRwalk={false} />
                </div>
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    Anchor Distributions by Token
                  </h6>
                  <StakingRewardsTable list={cstStakingRewards} address={address} />
                </div>
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    Anchor Distributions by Deposit
                  </h6>
                  <CSTStakingRewardsByDepositTable list={cstStakingRewardsByDeposit} />
                </div>
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    Retrieved Anchor Distributions
                  </h6>
                  <CollectedCSTStakingRewardsTable list={collectedCstStakingRewards} />
                </div>
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    Unretrieved Anchor Distributions
                  </h6>
                  <UncollectedCSTStakingRewardsTable user={address} />
                </div>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="rwlk" className="pt-6">
          {!hasRWLKActivity ? (
            <EmptyState
              icon={<Layers className="h-8 w-8 text-muted-foreground/50" />}
              title="No RandomWalk anchoring yet"
              description="Anchor your RandomWalk NFTs to take part in random allocation imprints."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <StatCard
                  label="Anchor Actions"
                  value={(rwlkStats?.TotalNumStakeActions ?? 0).toLocaleString()}
                  icon={<Lock className="h-3.5 w-3.5" />}
                  tooltip="Number of times you have anchored RandomWalk NFTs."
                />
                <StatCard
                  label="Release Actions"
                  value={(rwlkStats?.TotalNumUnstakeActions ?? 0).toLocaleString()}
                  icon={<Unlock className="h-3.5 w-3.5" />}
                  tooltip="Number of times you have released anchored RandomWalk NFTs."
                />
                <StatCard
                  label="Tokens Anchored"
                  value={(rwlkStats?.TotalTokensStaked ?? 0).toLocaleString()}
                  icon={<Layers className="h-3.5 w-3.5" />}
                  tooltip="Total RandomWalk NFTs currently anchored."
                  featured
                />
                <StatCard
                  label="Tokens Imprinted"
                  value={(rwlkStats?.TotalTokensMinted ?? 0).toLocaleString()}
                  icon={<Gift className="h-3.5 w-3.5" />}
                  tooltip="Cosmic Signature tokens received through RandomWalk anchor allocation imprints."
                />
              </div>

              <div className="space-y-8">
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    Anchor / Release Actions
                  </h6>
                  <StakingActionsTable list={stakingRWLKActions} IsRwalk={true} />
                </div>
                <div>
                  <h6 className="text-sm font-medium uppercase tracking-wider text-muted-foreground mb-4">
                    Anchor Allocation Tokens
                  </h6>
                  <RwalkStakingRewardMintsTable list={rwlkMints} />
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
