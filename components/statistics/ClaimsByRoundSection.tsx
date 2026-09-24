'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { formatAddress, formatSeconds } from '@/utils/format';
import { useFormat } from '@/hooks/useFormat';
import { useNow } from '@/hooks/useNow';
import { useClaimsByRound, useClaimDetailByRound } from '@/hooks/useApiQuery';
import type {
  AttachedToken,
  ClaimTxn,
  ClaimUnclaimedItem,
  RoundClaimSummary,
} from '@/services/api/types';
import { Button } from '@/components/ui/button';
import { DataTable, TableLink, type DataTableColumn } from '@/components/ui/data-table';
import { useCycleHref } from '@/components/tables/useCycleHref';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { SkeletonTable } from '@/components/ui/skeleton';

import { CountBreakdown, type CountPart } from './CountBreakdown';

type AssetType = ClaimUnclaimedItem['AssetType'];

/** What a claimable asset is, in words and figures: "0.25 ETH", "NFT 0x12…34 #5". */
function useAssetText() {
  const t = useTranslations('statistics');
  const format = useFormat();
  return useCallback(
    (asset: { AssetType: AssetType; AmountEth: number; TokenAddr: string; TokenId: number }) => {
      if (asset.AssetType === 'ETH') return format.amount(asset.AmountEth, { unit: 'ETH' });
      if (asset.AssetType === 'ERC721') {
        return `${t('performance.claims.assets.nft')} ${formatAddress(asset.TokenAddr)} #${asset.TokenId}`;
      }
      const amount = format.number(asset.AmountEth, { maximumFractionDigits: 4 });
      return `${t('performance.claims.assets.erc20')} ${amount} · ${formatAddress(asset.TokenAddr)}`;
    },
    [format, t],
  );
}

/** The share of a cycle's retrievable assets already retrieved, 0..1; null when none were allocated. */
export function retrievedShare(cycle: Pick<RoundClaimSummary, 'TotalAwarded' | 'TotalUnclaimed'>) {
  if (!(cycle.TotalAwarded > 0)) return null;
  return Math.min(1, Math.max(0, (cycle.TotalAwarded - cycle.TotalUnclaimed) / cycle.TotalAwarded));
}

/** A dialog header that reads left to right and keeps clear of the close button in its corner. */
const DIALOG_HEADER_CLASS = 'pr-12 text-left';

const UnretrievedDialog = ({
  cycle,
  nowSec,
  onClose,
}: {
  cycle: RoundClaimSummary | null;
  nowSec: number;
  onClose: () => void;
}) => {
  const t = useTranslations('statistics');
  const format = useFormat();
  const assetText = useAssetText();
  const columns = useMemo<DataTableColumn<ClaimUnclaimedItem>[]>(
    () => [
      {
        id: 'asset',
        header: t('performance.claims.dialog.asset'),
        value: (row) => assetText(row),
      },
      {
        id: 'recipient',
        kind: 'address',
        header: t('performance.claims.dialog.recipient'),
        value: (row) => row.RecipientAddr || null,
      },
    ],
    [assetText, t],
  );

  return (
    <Dialog open={!!cycle} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl">
        {cycle ? (
          <>
            <DialogHeader className={DIALOG_HEADER_CLASS}>
              <DialogTitle>
                {t('performance.claims.dialog.unclaimedTitle', { cycle: cycle.RoundNum })}
              </DialogTitle>
              <DialogDescription>
                {cycle.Expired
                  ? t('performance.claims.dialog.expired')
                  : t('performance.claims.dialog.closesIn', {
                      duration: formatSeconds(
                        Math.max(0, cycle.ClaimWindowTimeout - nowSec),
                        format.locale,
                      ),
                    })}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-auto">
              <DataTable
                data={cycle.UnclaimedItems}
                columns={columns}
                ariaLabel={t('performance.claims.dialog.unclaimedTitle', { cycle: cycle.RoundNum })}
                getRowKey={(row, index) =>
                  `${row.AssetType}-${row.TokenAddr}-${row.TokenId}-${row.RecipientAddr}-${index}`
                }
              />
            </div>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

/** One cycle in detail: its retrieval transactions (with how long each took) and the tokens attached during it. */
const CycleDetailDialog = ({ round, onClose }: { round: number | null; onClose: () => void }) => {
  const t = useTranslations('statistics');
  const assetText = useAssetText();
  const { data, isLoading } = useClaimDetailByRound(round);
  const claims: ClaimTxn[] = data?.ClaimTransactions ?? [];
  const attached: AttachedToken[] = data?.AttachedTokens ?? [];

  const claimColumns = useMemo<DataTableColumn<ClaimTxn>[]>(
    () => [
      { id: 'asset', header: t('performance.claims.dialog.asset'), value: (row) => assetText(row) },
      {
        id: 'recipient',
        kind: 'address',
        header: t('performance.claims.dialog.recipient'),
        value: (row) => row.RecipientAddr,
        cell: (row) => (
          <span className="min-w-0">
            <span className="block font-mono">{formatAddress(row.RecipientAddr)}</span>
            {row.BeneficiaryAddr &&
            row.BeneficiaryAddr.toLowerCase() !== row.RecipientAddr.toLowerCase() ? (
              <span className="block type-caption text-muted-foreground">
                {t('performance.claims.dialog.sweptBy', {
                  address: formatAddress(row.BeneficiaryAddr),
                })}
              </span>
            ) : null}
          </span>
        ),
      },
      {
        id: 'after',
        kind: 'duration',
        header: t('performance.claims.dialog.claimedAfter'),
        value: (row) => Math.max(0, row.ClaimedAfterSecs),
        sortable: true,
      },
      {
        id: 'when',
        kind: 'datetime',
        header: t('performance.claims.dialog.when'),
        value: (row) => row.ClaimTs,
        txHash: (row) => row.TxHash,
        sortable: true,
      },
    ],
    [assetText, t],
  );

  const attachedColumns = useMemo<DataTableColumn<AttachedToken>[]>(
    () => [
      { id: 'asset', header: t('performance.claims.dialog.token'), value: (row) => assetText(row) },
      {
        id: 'by',
        kind: 'address',
        header: t('performance.claims.dialog.attachedBy'),
        value: (row) => row.ContributorAddr,
      },
      {
        id: 'when',
        kind: 'datetime',
        header: t('performance.claims.dialog.when'),
        value: (row) => row.Ts,
        txHash: (row) => row.TxHash,
        sortable: true,
      },
    ],
    [assetText, t],
  );

  return (
    <Dialog open={round != null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader className={DIALOG_HEADER_CLASS}>
          <DialogTitle>
            {t('performance.claims.dialog.exploreTitle', { cycle: round ?? 0 })}
          </DialogTitle>
          <DialogDescription>{t('performance.claims.dialog.exploreDescription')}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <SkeletonTable rows={4} columns={4} />
        ) : (
          <div className="max-h-[65vh] space-y-8 overflow-auto">
            <section>
              <h3 className="mb-3 type-title text-foreground">
                {t('performance.claims.dialog.claimTransactions')}
              </h3>
              {claims.length === 0 ? (
                <p className="type-body-sm text-muted-foreground">
                  {t('performance.claims.dialog.noClaims')}
                </p>
              ) : (
                <DataTable
                  data={claims}
                  columns={claimColumns}
                  ariaLabel={t('performance.claims.dialog.claimTransactions')}
                  initialSort={{ id: 'when', direction: 'desc' }}
                />
              )}
            </section>
            <section>
              <h3 className="mb-3 type-title text-foreground">
                {t('performance.claims.dialog.attachedTokens')}
              </h3>
              {attached.length === 0 ? (
                <p className="type-body-sm text-muted-foreground">
                  {t('performance.claims.dialog.noAttached')}
                </p>
              ) : (
                <DataTable
                  data={attached}
                  columns={attachedColumns}
                  ariaLabel={t('performance.claims.dialog.attachedTokens')}
                  initialSort={{ id: 'when', direction: 'desc' }}
                />
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/**
 * What each finalized cycle left to retrieve (secondary ETH, attached NFTs
 * and ERC-20 tokens), how much of it has been retrieved and how quickly, in
 * neutral figures; a cycle with assets still waiting opens their list, and
 * every cycle opens its retrieval transactions.
 */
export const ClaimsByRoundSection = () => {
  const t = useTranslations('statistics');
  const tTables = useTranslations('tables');
  const cycleHref = useCycleHref();
  const [selected, setSelected] = useState<RoundClaimSummary | null>(null);
  const [exploreRound, setExploreRound] = useState<number | null>(null);
  const { data, isLoading, isError, refetch } = useClaimsByRound();
  const list = useMemo(() => data ?? [], [data]);
  // Ticks every 30s so the "window closes in …" countdown never goes stale.
  const nowSec = Math.floor(useNow(30_000) / 1000);

  const columns = useMemo<DataTableColumn<RoundClaimSummary>[]>(() => {
    const awarded = (row: RoundClaimSummary): CountPart[] => [
      { key: 'eth', count: row.EthAwarded, unit: 'ETH' },
      { key: 'nft', count: row.NftAwarded, unit: 'NFT' },
      { key: 'erc20', count: row.Erc20Awarded, unit: 'ERC-20' },
    ];
    return [
      {
        id: 'cycle',
        kind: 'link',
        header: t('performance.claims.columns.cycle'),
        value: (row) => row.RoundNum,
        // "Cycle 2", not a bare "2": a word-wide link to the cycle's record.
        cell: (row) => (
          <TableLink href={cycleHref(row.RoundNum)}>
            {tTables('allocation.cycle', { cycle: row.RoundNum })}
          </TableLink>
        ),
        sortable: true,
        nowrap: true,
      },
      {
        id: 'awarded',
        header: t('performance.claims.columns.awarded'),
        value: (row) => row.EthAwarded + row.NftAwarded + row.Erc20Awarded || null,
        whenBlank: 'empty',
        cell: (row) => <CountBreakdown parts={awarded(row)} />,
      },
      {
        id: 'retrieved',
        kind: 'percent',
        percentScale: 'ratio',
        header: t('performance.claims.columns.claimedPercent'),
        value: (row) => retrievedShare(row),
        sortable: true,
      },
      {
        id: 'unretrieved',
        kind: 'count',
        header: t('performance.claims.columns.unclaimed'),
        value: (row) => row.TotalUnclaimed,
        sortable: true,
        cell: (row) =>
          row.TotalUnclaimed > 0 ? (
            <Button variant="outline" size="sm" onClick={() => setSelected(row)}>
              {t('performance.claims.unclaimedCount', { count: row.TotalUnclaimed })}
            </Button>
          ) : (
            <span className="text-muted-foreground">{t('performance.claims.allClaimed')}</span>
          ),
      },
      {
        id: 'average',
        kind: 'duration',
        header: t('performance.claims.columns.averageTime'),
        value: (row) => (row.AvgClaimPeriodSecs > 0 ? row.AvgClaimPeriodSecs : null),
        whenBlank: 'empty',
        sortable: true,
      },
      {
        id: 'details',
        header: t('performance.claims.columns.details'),
        align: 'right',
        cell: (row) => (
          <Button
            variant="ghost"
            size="sm"
            // Every row's button reads "Explore"; its name says which cycle.
            aria-label={t('performance.claims.exploreAria', { cycle: row.RoundNum })}
            onClick={() => setExploreRound(row.RoundNum)}
          >
            {t('performance.claims.explore')}
          </Button>
        ),
      },
    ];
  }, [t, tTables, cycleHref]);

  return (
    <div className="space-y-6">
      <p className="max-w-[var(--measure-lede)] type-body-sm text-muted-foreground">
        {t('performance.claims.description')}
      </p>
      {isLoading ? (
        <SkeletonTable rows={5} columns={5} />
      ) : isError ? (
        <ErrorState
          headingLevel={3}
          title={t('performance.claims.loadErrorTitle')}
          message={t('performance.claims.loadErrorMessage')}
          onRetry={() => refetch()}
        />
      ) : list.length === 0 ? (
        <EmptyState headingLevel={3} variant="inline" title={t('performance.claims.empty')} />
      ) : (
        <DataTable
          data={list}
          columns={columns}
          ariaLabel={t('performance.claimsTitle')}
          initialSort={{ id: 'cycle', direction: 'desc' }}
          getRowKey={(row) => String(row.RoundNum)}
        />
      )}
      <UnretrievedDialog cycle={selected} nowSec={nowSec} onClose={() => setSelected(null)} />
      <CycleDetailDialog round={exploreRound} onClose={() => setExploreRound(null)} />
    </div>
  );
};

export default ClaimsByRoundSection;
