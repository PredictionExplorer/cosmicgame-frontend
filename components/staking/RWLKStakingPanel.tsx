import type { StakedTokenInfo, StakingAction, StakingRewardMint } from '@/services/api';
import StakingActionsTable from '@/components/staking/StakingActionsTable';
import { StakedTokensTable } from '@/components/staking/StakedTokensTable';
import { RWLKNFTTable } from '@/components/tokens/RWLKNFTTable';
import { RwalkStakingRewardMintsTable } from '@/components/staking/RwalkStakingRewardMintsTable';
import { InfoTooltip } from '@/components/ui/info-tooltip';

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

function SectionHeader({ title, tooltip }: { title: string; tooltip: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h3 className="text-base font-semibold leading-none">{title}</h3>
      <InfoTooltip content={tooltip} />
    </div>
  );
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
        <SectionHeader
          title="Staked Tokens"
          tooltip="RandomWalk NFTs you currently have staked. Each staked token is eligible for random reward mints."
        />
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

      <div className="mt-12">
        <SectionHeader
          title="Available for Staking"
          tooltip="RandomWalk NFTs in your wallet that can be staked to participate in reward distributions."
        />
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

      <div className="mt-12">
        <SectionHeader
          title="Staking Reward Tokens"
          tooltip="Tokens minted as rewards for your staked RandomWalk NFTs through the lottery mechanism."
        />
        <RwalkStakingRewardMintsTable list={rwlkMints} />
      </div>

      <div className="mt-12">
        <SectionHeader
          title="Stake / Unstake History"
          tooltip="A chronological record of all your staking and unstaking transactions."
        />
        <StakingActionsTable list={stakingActions} IsRwalk={true} />
      </div>
    </>
  );
}
