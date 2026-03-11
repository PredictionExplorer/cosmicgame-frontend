import type { CSTTokenInfo, StakedTokenInfo, StakingAction, RewardsByToken } from '@/services/api';
import StakingActionsTable from '@/components/staking/StakingActionsTable';
import { StakingRewardsTable } from '@/components/staking/StakingRewardsTable';
import { StakedTokensTable } from '@/components/staking/StakedTokensTable';
import { CSTokensTable } from '@/components/tokens/CSTokensTable';

/** Props for the CST staking panel. */
export interface CSTStakingPanelProps {
  account: string;
  stakingActions: StakingAction[];
  userTokens: CSTTokenInfo[];
  stakedTokens: StakedTokenInfo[];
  stakingRewards: RewardsByToken[];
  handleStake: (tokenId: number) => Promise<unknown>;
  handleStakeMany: (tokenIds: number[]) => Promise<unknown>;
  handleUnstake: (actionId: number) => Promise<unknown>;
  handleUnstakeMany: (actionIds: number[]) => Promise<unknown>;
}

/** Displays CST staking rewards, actions, available tokens, and staked tokens. */
export function CSTStakingPanel({
  account,
  stakingActions,
  userTokens,
  stakedTokens,
  stakingRewards,
  handleStake,
  handleStakeMany,
  handleUnstake,
  handleUnstakeMany,
}: CSTStakingPanelProps) {
  return (
    <>
      <div>
        <p className="text-base leading-none mb-4">Staking Rewards by Token</p>
        <StakingRewardsTable list={stakingRewards} address={account} />
      </div>

      <div>
        <p className="text-base leading-none mt-16 mb-4">Stake / Unstake Actions</p>
        <StakingActionsTable list={stakingActions} IsRwalk={false} />
      </div>

      <div>
        <p className="text-base leading-none mt-16 mb-4">Tokens Available for Staking</p>
        <CSTokensTable
          list={userTokens}
          handleStake={async (tokenId) => {
            await handleStake(tokenId);
          }}
          handleStakeMany={async (tokenIds) => {
            await handleStakeMany(tokenIds);
          }}
        />
      </div>

      <div>
        <p className="text-base leading-none mt-16 mb-4">Staked Tokens</p>
        <StakedTokensTable
          list={stakedTokens}
          handleUnstake={async (actionId) => {
            await handleUnstake(actionId);
          }}
          handleUnstakeMany={async (actionIds) => {
            await handleUnstakeMany(actionIds);
          }}
          IsRwalk={false}
        />
      </div>
    </>
  );
}
