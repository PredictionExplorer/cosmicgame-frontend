'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import type { TxResult } from '@/hooks/useTxFlow';
import type { TxStage } from '@/lib/txStage';
import type { AnchorAction, AnchorDistributionImprint, AnchoredTokenInfo } from '@/services/api';
import { SectionHeader } from '@/components/ui/section-header';

import AnchorActionsTable from './AnchorActionsTable';
import { AnchoredOn } from './AnchoredOn';
import { AnchorTokenGrid, type AnchorGridItem } from './AnchorTokenGrid';
import { RwalkAnchorDistributionImprintsTable } from './RwalkAnchorDistributionImprintsTable';
import { SECTION_READY, type SectionRead } from './sectionRead';

/** The grid ids of this panel, which own the page's one wallet flow in turn. */
export const RWLK_GRIDS = { anchored: 'rwlk-anchored', available: 'rwlk-available' } as const;

export interface RWLKAnchoringPanelProps {
  anchoredTokens: readonly AnchoredTokenInfo[];
  /**
   * Random Walk NFTs in the wallet that can still be anchored (never anchored
   * by anyone, as the contract's `usedNfts` records); `null` while they load.
   */
  availableTokenIds: readonly number[] | null;
  imprints: AnchorDistributionImprint[];
  actions: AnchorAction[];
  anchoredRead?: SectionRead;
  availableRead?: SectionRead;
  imprintsRead?: SectionRead;
  historyRead?: SectionRead;
  onAnchor: (tokenIds: number[]) => Promise<TxResult>;
  onRelease: (actionIds: number[]) => Promise<TxResult>;
  stageFor: (gridId: string) => TxStage;
  walletBusy: boolean;
}

/**
 * Random Walk anchoring for the connected wallet: what it has anchored, what
 * it can still anchor, the Stellar Selection imprints its anchors received
 * and the history of its actions. Random Walk anchors receive no ETH.
 */
export function RWLKAnchoringPanel({
  anchoredTokens,
  availableTokenIds,
  imprints,
  actions,
  anchoredRead = SECTION_READY,
  availableRead = SECTION_READY,
  imprintsRead = SECTION_READY,
  historyRead = SECTION_READY,
  onAnchor,
  onRelease,
  stageFor,
  walletBusy,
}: RWLKAnchoringPanelProps) {
  const t = useTranslations('anchoring');

  const anchoredItems = useMemo<AnchorGridItem[]>(
    () =>
      [...anchoredTokens]
        .sort((a, b) => a.StakeTimeStamp - b.StakeTimeStamp)
        .map((row) => ({
          key: row.StakeActionId,
          tokenId: row.StakedTokenId,
          meta: [<AnchoredOn key="anchored" timestamp={row.StakeTimeStamp} />],
        })),
    [anchoredTokens],
  );

  const availableItems = useMemo<AnchorGridItem[]>(
    () => (availableTokenIds ?? []).map((tokenId) => ({ key: tokenId, tokenId })),
    [availableTokenIds],
  );

  return (
    <div className="space-y-[var(--block-gap)] sm:space-y-16">
      <AnchorTokenGrid
        id={RWLK_GRIDS.anchored}
        collection="randomWalk"
        mode="release"
        items={anchoredItems}
        title={t('panels.shared.anchoredTokens')}
        description={t('panels.randomWalk.anchoredDescription')}
        emptyTitle={t('panels.shared.anchoredEmpty.title')}
        emptyDescription={t('panels.shared.anchoredEmpty.description')}
        onCommit={onRelease}
        stage={stageFor(RWLK_GRIDS.anchored)}
        walletBusy={walletBusy}
        loading={anchoredRead.loading}
        failed={anchoredRead.failed}
        onRetry={anchoredRead.onRetry}
      />

      <AnchorTokenGrid
        id={RWLK_GRIDS.available}
        collection="randomWalk"
        mode="anchor"
        items={availableItems}
        title={t('panels.shared.available')}
        description={t('panels.randomWalk.availableDescription')}
        emptyTitle={t('panels.randomWalk.availableEmpty.title')}
        emptyDescription={t('panels.randomWalk.availableEmpty.description')}
        onCommit={onAnchor}
        stage={stageFor(RWLK_GRIDS.available)}
        walletBusy={walletBusy}
        loading={!availableRead.failed && (availableRead.loading || availableTokenIds === null)}
        failed={availableRead.failed}
        onRetry={availableRead.onRetry}
      />

      <section aria-labelledby="rwlk-imprints-heading">
        <SectionHeader
          headingId="rwlk-imprints-heading"
          title={t('panels.randomWalk.selection')}
          description={t('panels.randomWalk.selectionDescription')}
        />
        <RwalkAnchorDistributionImprintsTable
          list={imprints}
          showRecipient={false}
          loading={imprintsRead.loading}
          error={imprintsRead.failed ? t('overview.errorMessage') : undefined}
          errorTitle={t('overview.errorTitle')}
          onRetry={imprintsRead.onRetry}
          emptyTitle={t('panels.randomWalk.selectionEmpty')}
        />
      </section>

      <section aria-labelledby="rwlk-history-heading">
        <SectionHeader
          headingId="rwlk-history-heading"
          title={t('panels.shared.history')}
          description={t('panels.shared.historyDescription')}
        />
        <AnchorActionsTable
          list={actions}
          IsRwalk
          loading={historyRead.loading}
          error={historyRead.failed ? t('overview.errorMessage') : undefined}
          errorTitle={t('overview.errorTitle')}
          onRetry={historyRead.onRetry}
        />
      </section>
    </div>
  );
}
