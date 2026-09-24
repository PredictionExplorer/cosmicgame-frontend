'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { useFormat } from '@/hooks/useFormat';
import type { TxResult } from '@/hooks/useTxFlow';
import type { TxStage } from '@/lib/txStage';
import type { AnchorAction, AnchoredTokenInfo, CSTTokenInfo, RewardsByToken } from '@/services/api';
import { Link } from '@/i18n/navigation';
import { DateTime } from '@/components/ui/date-time';
import { SectionHeader } from '@/components/ui/section-header';
import { buttonVariants } from '@/components/ui/button';

import AnchorActionsTable from './AnchorActionsTable';
import { AnchorDistributionsTable } from './AnchorDistributionsTable';
import { AnchorTokenGrid, type AnchorGridItem } from './AnchorTokenGrid';

/** The grid ids of this panel, which own the page's one wallet flow in turn. */
export const CST_GRIDS = { anchored: 'cst-anchored', available: 'cst-available' } as const;

export interface CSTAnchoringPanelProps {
  account: string;
  anchoredTokens: readonly AnchoredTokenInfo[];
  availableTokens: readonly CSTTokenInfo[];
  anchorDistributions: readonly RewardsByToken[];
  actions: AnchorAction[];
  /** Anchors token ids; resolves with the transaction's outcome. */
  onAnchor: (tokenIds: number[]) => Promise<TxResult>;
  /** Releases anchor action ids; resolves with the transaction's outcome. */
  onRelease: (actionIds: number[]) => Promise<TxResult>;
  /** The stage of a grid's own transaction (idle for a grid that did not start it). */
  stageFor: (gridId: string) => TxStage;
  walletBusy: boolean;
  loading?: boolean;
}

/**
 * Cosmic Signature anchoring for the connected wallet: what it has anchored
 * (with the ETH each NFT has accrued), what it can still anchor, each NFT's
 * Anchor Distributions and the history of its actions.
 */
export function CSTAnchoringPanel({
  account,
  anchoredTokens,
  availableTokens,
  anchorDistributions,
  actions,
  onAnchor,
  onRelease,
  stageFor,
  walletBusy,
  loading = false,
}: CSTAnchoringPanelProps) {
  const t = useTranslations('anchoring');
  const format = useFormat();

  const accruedByToken = useMemo(
    () => new Map(anchorDistributions.map((row) => [row.TokenId, row.RewardToCollectEth ?? 0])),
    [anchorDistributions],
  );

  // Oldest anchor first: the order the NFTs joined, as the contract counts them.
  const anchoredItems = useMemo<AnchorGridItem[]>(
    () =>
      [...anchoredTokens]
        .sort((a, b) => a.StakeTimeStamp - b.StakeTimeStamp)
        .flatMap((row) => {
          const info = row.TokenInfo;
          const actionId = info?.StakeActionId ?? row.StakeActionId;
          if (!info || typeof actionId !== 'number') return [];
          const accruedEth = accruedByToken.get(info.TokenId) ?? null;
          // The anchored-token row nests the full token record, name included.
          const name: unknown = (info as Record<string, unknown>).TokenName;
          return [
            {
              key: actionId,
              tokenId: info.TokenId,
              seed: info.Seed ?? null,
              name: typeof name === 'string' ? name : null,
              accruedEth,
              meta: [
                <DateTime key="anchored" timestamp={row.StakeTimeStamp}>
                  {(date) => t('picker.anchoredOn', { date })}
                </DateTime>,
              ],
              detail:
                accruedEth === null
                  ? null
                  : t('picker.accrued', {
                      amount: format.amount(accruedEth, { unit: 'ETH', context: 'card' }),
                    }),
            },
          ];
        }),
    [accruedByToken, anchoredTokens, format, t],
  );

  const availableItems = useMemo<AnchorGridItem[]>(
    () =>
      availableTokens.map((token) => ({
        key: token.TokenId,
        tokenId: token.TokenId,
        seed: token.Seed ?? null,
        name: token.TokenName ?? null,
        meta: [
          typeof token.RoundNum === 'number' ? t('picker.cycle', { cycle: token.RoundNum }) : null,
        ],
      })),
    [availableTokens, t],
  );

  return (
    <div className="space-y-[var(--block-gap)] sm:space-y-16">
      <AnchorTokenGrid
        id={CST_GRIDS.anchored}
        collection="cosmicSignature"
        mode="release"
        items={anchoredItems}
        title={t('panels.shared.anchoredTokens')}
        description={t('panels.cosmicSignature.anchoredDescription')}
        emptyTitle={t('panels.shared.anchoredEmpty.title')}
        emptyDescription={t('panels.shared.anchoredEmpty.description')}
        onCommit={onRelease}
        stage={stageFor(CST_GRIDS.anchored)}
        walletBusy={walletBusy}
        loading={loading}
      />

      <AnchorTokenGrid
        id={CST_GRIDS.available}
        collection="cosmicSignature"
        mode="anchor"
        items={availableItems}
        title={t('panels.shared.available')}
        description={t('panels.cosmicSignature.availableDescription')}
        emptyTitle={t('panels.cosmicSignature.availableEmpty.title')}
        emptyDescription={t('panels.cosmicSignature.availableEmpty.description')}
        emptyAction={
          <Link href="/gallery" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            {t('panels.cosmicSignature.availableEmpty.action')}
          </Link>
        }
        onCommit={onAnchor}
        stage={stageFor(CST_GRIDS.available)}
        walletBusy={walletBusy}
        loading={loading}
      />

      <section aria-labelledby="cst-distributions-heading">
        <SectionHeader
          headingId="cst-distributions-heading"
          title={t('panels.cosmicSignature.distributions')}
          description={t('panels.cosmicSignature.distributionsDescription')}
        />
        <AnchorDistributionsTable
          list={[...anchorDistributions]}
          address={account}
          loading={loading}
        />
      </section>

      <section aria-labelledby="cst-history-heading">
        <SectionHeader
          headingId="cst-history-heading"
          title={t('panels.shared.history')}
          description={t('panels.shared.historyDescription')}
        />
        <AnchorActionsTable list={actions} IsRwalk={false} loading={loading} />
      </section>
    </div>
  );
}
