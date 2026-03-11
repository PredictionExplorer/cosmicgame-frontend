import type { StakedTokenInfo, StakingAction, StakingRewardMint } from '@/services/api';
import StakingActionsTable from '@/components/staking/StakingActionsTable';
import { StakedTokensTable } from '@/components/staking/StakedTokensTable';
import { RWLKNFTTable } from '@/components/tokens/RWLKNFTTable';
import { RwalkStakingRewardMintsTable } from '@/components/staking/RwalkStakingRewardMintsTable';

/** Props for the RWLK staking panel. */
export interface RWLKStakingPanelProps {
  account: string;
  stakingActions: StakingAction[];
  rwlkMints: StakingRewardMint[];
  userTokens: number[];
  stakedTokens: StakedTokenInfo[];
  handleStake: (tokenId: number) => Promise<unknown>;
  handleStakeMany: (tokenIds: number[]) => Promise<unknown>;
  handleUnstake: (actionId: number) => Promise<unknown>;
  handleUnstakeMany: (actionIds: number[]) => Promise<unknown>;
}

/** Displays RWLK staking reward mints, actions, available tokens, and staked tokens. */
export function RWLKStakingPanel({
  account,
  stakingActions,
  rwlkMints,
  userTokens,
  stakedTokens,
  handleStake,
  handleStakeMany,
  handleUnstake,
  handleUnstakeMany,
}: RWLKStakingPanelProps) {
  return (
    <>
      <div>
        <p className="text-base leading-none mb-4">Staking Reward Tokens</p>
        <RwalkStakingRewardMintsTable list={rwlkMints} />
      </div>

      <div>
        <p className="text-base leading-none mt-16 mb-4">Stake / Unstake Actions</p>
        <StakingActionsTable list={stakingActions} IsRwalk={true} />
      </div>

      <div>
        <p className="text-base leading-none mt-16 mb-4">Tokens Available for Staking</p>
        <RWLKNFTTable
          list={userTokens}
          ownerAddress={account}
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
          IsRwalk={true}
        />
      </div>
    </>
  );
}
