import Image from 'next/image';

import { formatEthValue } from '@/utils';

import type { StakingAction, StakingRewardMint } from '@/services/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StakingActionsTable from '@/components/staking/StakingActionsTable';
import { StakingRewardsTable } from '@/components/staking/StakingRewardsTable';
import { CSTStakingRewardsByDepositTable } from '@/components/staking/CSTStakingRewardsByDepositTable';
import { CollectedCSTStakingRewardsTable } from '@/components/staking/CollectedCSTStakingRewardsTable';
import { UncollectedCSTStakingRewardsTable } from '@/components/staking/UncollectedCSTStakingRewardsTable';
import { RwalkStakingRewardMintsTable } from '@/components/staking/RwalkStakingRewardMintsTable';
import type { CSTStakingRewardByDeposit } from '@/components/staking/CSTStakingRewardsByDepositTable';

import { StatRow, type UserProfileInfo } from './UserStatsSection';


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

/** Staking statistics section with CST and RWLK tabs. */
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

  return (
    <div className="mt-8">
      <h6 className="text-xl font-medium leading-none mb-2">Staking Statistics</h6>
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

        <TabsContent value="cst" className="p-6">
          <StatRow label="Total Number of Stake Actions:">{totalStakeActions}</StatRow>
          <StatRow label="Total Number of Unstake Actions:">{totalUnstakeActions}</StatRow>
          <StatRow label="Total Tokens with Rewards:">{cstStakingRewards.length}</StatRow>
          <StatRow label="Total Rewards:">{formatEthValue(totalRewardEth)}</StatRow>
          <StatRow label="Unclaimed Rewards:">{formatEthValue(unclaimedRewardEth)}</StatRow>

          <div>
            <h6 className="text-base font-medium leading-none mt-8 mb-4">
              Stake / Unstake Actions
            </h6>
            <StakingActionsTable list={stakingCSTActions} IsRwalk={false} />
          </div>
          <div className="mt-8">
            <h6 className="text-base font-medium leading-none mb-4">Staking Rewards by Token</h6>
            <StakingRewardsTable list={cstStakingRewards} address={address} />
          </div>
          <div className="mt-8">
            <h6 className="text-base font-medium leading-none mb-4">Staking Rewards by Deposit</h6>
            <CSTStakingRewardsByDepositTable list={cstStakingRewardsByDeposit} />
          </div>
          <div className="mt-8">
            <h6 className="text-base font-medium leading-none mb-4">Collected Staking Rewards</h6>
            <CollectedCSTStakingRewardsTable list={collectedCstStakingRewards} />
          </div>
          <div className="mt-8">
            <h6 className="text-base font-medium leading-none mb-4">Uncollected Staking Rewards</h6>
            <UncollectedCSTStakingRewardsTable user={address} />
          </div>
        </TabsContent>

        <TabsContent value="rwlk" className="p-6">
          <StatRow label="Total Number of Stake Actions:">
            {rwlkStats?.TotalNumStakeActions ?? 0}
          </StatRow>
          <StatRow label="Total Number of Unstake Actions:">
            {rwlkStats?.TotalNumUnstakeActions ?? 0}
          </StatRow>
          <StatRow label="Total Tokens Staked:">{rwlkStats?.TotalTokensStaked ?? 0}</StatRow>
          <StatRow label="Total Tokens Minted:">{rwlkStats?.TotalTokensMinted ?? 0}</StatRow>

          <div>
            <h6 className="text-base font-medium leading-none mt-8 mb-4">
              Stake / Unstake Actions
            </h6>
            <StakingActionsTable list={stakingRWLKActions} IsRwalk={true} />
          </div>
          <div>
            <h6 className="text-base font-medium leading-none mt-8 mb-4">Staking Reward Tokens</h6>
            <RwalkStakingRewardMintsTable list={rwlkMints} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
