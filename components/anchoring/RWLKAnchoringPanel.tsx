import type { AnchoredTokenInfo, AnchorAction, AnchorDistributionImprint } from '@/services/api';
import AnchorActionsTable from '@/components/anchoring/AnchorActionsTable';
import { AnchoredTokensTable } from '@/components/anchoring/AnchoredTokensTable';
import { RWLKNFTTable } from '@/components/tokens/RWLKNFTTable';
import { RwalkAnchorDistributionImprintsTable } from '@/components/anchoring/RwalkAnchorDistributionImprintsTable';
import { InfoTooltip } from '@/components/ui/info-tooltip';

/** Props for the RWLK anchoring panel. */
export interface RWLKAnchoringPanelProps {
  account: string;
  stakingActions: AnchorAction[];
  rwlkImprints: AnchorDistributionImprint[];
  userTokens: number[];
  anchoredTokens: AnchoredTokenInfo[];
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

/** Displays RWLK anchor allocation imprints, actions, available tokens, and anchored tokens. */
export function RWLKAnchoringPanel({
  account,
  stakingActions,
  rwlkImprints,
  userTokens,
  anchoredTokens,
  handleStake,
  handleStakeMany,
  handleUnstake,
  handleUnstakeMany,
}: RWLKAnchoringPanelProps) {
  return (
    <>
      <div>
        <SectionHeader
          title="Anchored Tokens"
          tooltip="RandomWalk NFTs you currently have anchored. Each anchored token is eligible for random anchor allocation imprints."
        />
        <AnchoredTokensTable
          list={anchoredTokens}
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
          title="Available for Anchoring"
          tooltip="RandomWalk NFTs in your wallet that can be anchored to take part in Anchor Distributions."
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
          title="Anchor Allocation Tokens"
          tooltip="Tokens imprinted as allocations for your anchored RandomWalk NFTs through the on-chain random selection mechanism."
        />
        <RwalkAnchorDistributionImprintsTable list={rwlkImprints} />
      </div>

      <div className="mt-12">
        <SectionHeader
          title="Anchor / Release History"
          tooltip="A chronological record of all your anchor and release transactions."
        />
        <AnchorActionsTable list={stakingActions} IsRwalk={true} />
      </div>
    </>
  );
}
