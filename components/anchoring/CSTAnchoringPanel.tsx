'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { useFormat } from '@/hooks/useFormat';
import { isAnchorable } from '@/utils/anchoringStats';
import type { TxResult } from '@/hooks/useTxFlow';
import type { TxStage } from '@/lib/txStage';
import type { AnchorAction, AnchoredTokenInfo, CSTTokenInfo, RewardsByToken } from '@/services/api';
import { Link } from '@/i18n/navigation';
import { SectionHeader } from '@/components/ui/section-header';
import { buttonVariants } from '@/components/ui/button';

import AnchorActionsTable from './AnchorActionsTable';
import { AnchoredOn } from './AnchoredOn';
import { AnchorDistributionsTable } from './AnchorDistributionsTable';
import { AnchorTokenGrid, type AnchorGridItem } from './AnchorTokenGrid';
import { SECTION_READY, type SectionRead } from './sectionRead';

/** The grid ids of this panel, which own the page's one wallet flow in turn. */
export const CST_GRIDS = { anchored: 'cst-anchored', available: 'cst-available' } as const;

export interface CSTAnchoringPanelProps {
  account: string;
  anchoredTokens: readonly AnchoredTokenInfo[];
  /**
   * The wallet's Cosmic Signature NFTs as the indexer lists them, anchored
   * ones included: only those that can be anchored (`isAnchorable`) are
   * offered, so "Select all" never puts an anchored or released NFT into a
   * batch the contract would revert.
   */
  availableTokens: readonly CSTTokenInfo[];
  /**
   * The wallet's per-NFT Anchor Distributions summary; `null` while it loads
   * or when the read failed. It lists only NFTs that have received a deposit,
   * so an anchored NFT without a row has accrued 0 ETH.
   */
  anchorDistributions: readonly RewardsByToken[] | null;
  /**
   * The summary could not be read: its ledger shows an error with a retry, and each anchored
   * NFT says its accrued ETH is unavailable, instead of reading as an empty history.
   */
  distributionsError?: boolean;
  onRetryDistributions?: () => void;
  actions: AnchorAction[];
  /** The wallet's anchored NFTs. */
  anchoredRead?: SectionRead;
  /** The wallet's NFTs (the anchorable ones are offered). */
  availableRead?: SectionRead;
  /** The Anchor Distributions summary (its failure is `distributionsError`). */
  distributionsLoading?: boolean;
  /** The wallet's anchor and release history. */
  historyRead?: SectionRead;
  /** Anchors token ids; resolves with the transaction's outcome. */
  onAnchor: (tokenIds: number[]) => Promise<TxResult>;
  /** Releases anchor action ids; resolves with the transaction's outcome. */
  onRelease: (actionIds: number[]) => Promise<TxResult>;
  /** The stage of a grid's own transaction (idle for a grid that did not start it). */
  stageFor: (gridId: string) => TxStage;
  walletBusy: boolean;
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
  distributionsError = false,
  onRetryDistributions,
  actions,
  anchoredRead = SECTION_READY,
  availableRead = SECTION_READY,
  distributionsLoading = false,
  historyRead = SECTION_READY,
  onAnchor,
  onRelease,
  stageFor,
  walletBusy,
}: CSTAnchoringPanelProps) {
  const t = useTranslations('anchoring');
  const tCommon = useTranslations('common');
  const format = useFormat();

  const accruedByToken = useMemo(
    () =>
      anchorDistributions === null
        ? null
        : new Map(anchorDistributions.map((row) => [row.TokenId, row.RewardToCollectEth ?? 0])),
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
          // Unknown until the summary is read; after that, no row means no deposit yet.
          const accruedEth =
            accruedByToken === null ? null : (accruedByToken.get(info.TokenId) ?? 0);
          return [
            {
              key: actionId,
              tokenId: info.TokenId,
              seed: info.Seed ?? null,
              name: info.TokenName ?? null,
              accruedEth,
              meta: [<AnchoredOn key="anchored" timestamp={row.StakeTimeStamp} />],
              detail:
                accruedEth === null
                  ? distributionsError
                    ? tCommon('status.unavailable')
                    : null
                  : t('picker.accrued', {
                      amount: format.amount(accruedEth, { unit: 'ETH', context: 'card' }),
                    }),
            },
          ];
        }),
    [accruedByToken, anchoredTokens, distributionsError, format, t, tCommon],
  );

  const availableItems = useMemo<AnchorGridItem[]>(
    () =>
      availableTokens.filter(isAnchorable).map((token) => ({
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
        loading={anchoredRead.loading}
        failed={anchoredRead.failed}
        onRetry={anchoredRead.onRetry}
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
        loading={availableRead.loading}
        failed={availableRead.failed}
        onRetry={availableRead.onRetry}
      />

      <section aria-labelledby="cst-distributions-heading">
        <SectionHeader
          headingId="cst-distributions-heading"
          title={t('panels.cosmicSignature.distributions')}
          description={t('panels.cosmicSignature.distributionsDescription')}
        />
        <AnchorDistributionsTable
          list={[...(anchorDistributions ?? [])]}
          address={account}
          loading={distributionsLoading}
          error={distributionsError ? t('overview.errorMessage') : undefined}
          errorTitle={t('overview.errorTitle')}
          onRetry={onRetryDistributions}
        />
      </section>

      <section aria-labelledby="cst-history-heading">
        <SectionHeader
          headingId="cst-history-heading"
          title={t('panels.shared.history')}
          description={t('panels.shared.historyDescription')}
        />
        <AnchorActionsTable
          list={actions}
          IsRwalk={false}
          loading={historyRead.loading}
          error={historyRead.failed ? t('overview.errorMessage') : undefined}
          errorTitle={t('overview.errorTitle')}
          onRetry={historyRead.onRetry}
        />
      </section>
    </div>
  );
}
