import type { CSTTokenInfo, StakedTokenInfo, StakingAction, RewardsByToken } from '@/services/api';
import StakingActionsTable from '@/components/staking/StakingActionsTable';
import { StakingRewardsTable } from '@/components/staking/StakingRewardsTable';
import { StakedTokensTable } from '@/components/staking/StakedTokensTable';
import { CSTokensTable } from '@/components/tokens/CSTokensTable';
import { InfoTooltip } from '@/components/ui/info-tooltip';

/** Props for the CST anchoring panel. */
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

function SectionHeader({ title, tooltip }: { title: string; tooltip: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h3 className="text-base font-semibold leading-none">{title}</h3>
      <InfoTooltip content={tooltip} />
    </div>
  );
}

/** Displays CST Anchor Distributions, actions, available tokens, and anchored tokens. */
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
        <SectionHeader
          title="Anchored Tokens"
          tooltip="NFTs you currently have anchored. You receive distributions proportional to how many tokens you anchor."
        />
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

      <div className="mt-12">
        <SectionHeader
          title="Available for Anchoring"
          tooltip="NFTs in your wallet that can be anchored to start receiving Anchor Distributions."
        />
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

      <div className="mt-12">
        <SectionHeader
          title="Anchor Distributions"
          tooltip="ETH Anchor Distributions allocated to each of your anchored tokens. Unretrieved distributions can be collected by releasing the anchor."
        />
        <StakingRewardsTable list={stakingRewards} address={account} />
      </div>

      <div className="mt-12">
        <SectionHeader
          title="Anchor / Release History"
          tooltip="A chronological record of all your anchor and release transactions."
        />
        <StakingActionsTable list={stakingActions} IsRwalk={false} />
      </div>
    </>
  );
}
