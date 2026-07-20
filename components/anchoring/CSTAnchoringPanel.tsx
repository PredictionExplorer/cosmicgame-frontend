import { useTranslations } from 'next-intl';

import type { CSTTokenInfo, AnchoredTokenInfo, AnchorAction, RewardsByToken } from '@/services/api';
import AnchorActionsTable from '@/components/anchoring/AnchorActionsTable';
import { AnchorDistributionsTable } from '@/components/anchoring/AnchorDistributionsTable';
import { AnchoredTokensTable } from '@/components/anchoring/AnchoredTokensTable';
import { CSTokensTable } from '@/components/tokens/CSTokensTable';
import { InfoTooltip } from '@/components/ui/info-tooltip';

/** Props for the Cosmic Signature NFT anchoring panel. */
export interface CSTAnchoringPanelProps {
  account: string;
  stakingActions: AnchorAction[];
  userTokens: CSTTokenInfo[];
  anchoredTokens: AnchoredTokenInfo[];
  anchorDistributions: RewardsByToken[];
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

/** Displays Cosmic Signature NFT Anchor Distributions, actions, available tokens, and anchored tokens. */
export function CSTAnchoringPanel({
  account,
  stakingActions,
  userTokens,
  anchoredTokens,
  anchorDistributions,
  handleStake,
  handleStakeMany,
  handleUnstake,
  handleUnstakeMany,
}: CSTAnchoringPanelProps) {
  const t = useTranslations('anchoring');

  return (
    <>
      <div>
        <SectionHeader
          title={t('panels.shared.anchoredTokens')}
          tooltip={t('panels.cosmicSignature.anchoredTooltip')}
        />
        <AnchoredTokensTable
          list={anchoredTokens}
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
          title={t('panels.shared.available')}
          tooltip={t('panels.cosmicSignature.availableTooltip')}
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
          title={t('panels.cosmicSignature.distributions')}
          tooltip={t('panels.cosmicSignature.distributionsTooltip')}
        />
        <AnchorDistributionsTable list={anchorDistributions} address={account} />
      </div>

      <div className="mt-12">
        <SectionHeader
          title={t('panels.shared.history')}
          tooltip={t('panels.shared.historyTooltip')}
        />
        <AnchorActionsTable list={stakingActions} IsRwalk={false} />
      </div>
    </>
  );
}
