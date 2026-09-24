'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { sameAddress } from '@/utils/address';
import { useActiveWeb3React } from '@/hooks/web3';
import { useAnchorActions } from '@/hooks/useAnchorActions';
import {
  useCSTAnchorDistributionsByUserByDeposit,
  useCSTAnchorDistributionsToRetrieveByUser,
} from '@/hooks/useApiQuery';
import { useApiData } from '@/contexts/ApiDataContext';
import { Amount } from '@/components/ui/amount';
import { Button } from '@/components/ui/button';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { ChainGuard } from '@/components/wallet/NetworkGuard';
import type { CSTAnchorDistribution } from '@/services/api';

import { ReleaseConfirmDialog } from './ReleaseConfirmDialog';
import type { AnchoringLedgerProps } from './ledgerProps';

interface UnretrievedCSTAnchorDistributionsTableProps extends Omit<
  AnchoringLedgerProps,
  'loading' | 'error' | 'onRetry'
> {
  /** The address whose unretrieved distributions to list. */
  user: string;
}

/** One row of the by-deposit anchoring read: the anchor actions a deposit pays. */
interface DepositActions {
  Actions?: readonly { Claimed?: boolean; Stake?: { ActionId?: number } }[];
}

/**
 * The anchor actions still owed ETH: those in the newest deposit (which
 * covers every NFT anchored at the time) that have not retrieved it.
 */
export function unretrievedActionIds(deposits: readonly unknown[] | undefined): number[] {
  const newest = deposits?.[deposits.length - 1] as DepositActions | undefined;
  return (newest?.Actions ?? []).flatMap((action) =>
    !action.Claimed && typeof action.Stake?.ActionId === 'number' ? [action.Stake.ActionId] : [],
  );
}

/**
 * ETH Anchor Distribution deposits an address has not retrieved yet, one row
 * per deposit. On the connected wallet's own page it adds the total and
 * "Release and retrieve all", which ends every anchor that is owed ETH:
 * through ReleaseConfirmDialog, because releasing is permanent.
 */
export const UnretrievedCSTAnchorDistributionsTable = ({
  user,
  headingLevel = 3,
  ...state
}: UnretrievedCSTAnchorDistributionsTableProps) => {
  const t = useTranslations('anchoring');
  const { account } = useActiveWeb3React();
  const { apiData } = useApiData();
  const { release, txStage } = useAnchorActions();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isOwnAccount = sameAddress(user, account);
  const rewards = useCSTAnchorDistributionsToRetrieveByUser(user);
  const deposits = useCSTAnchorDistributionsByUserByDeposit(isOwnAccount ? user : null);
  const actionIds = useMemo(() => unretrievedActionIds(deposits.data), [deposits.data]);
  const unretrievedEth = apiData?.UnretrievedAnchorDistribution ?? 0;
  const canReleaseAll = isOwnAccount && unretrievedEth > 0 && actionIds.length > 0;

  const columns = useMemo<DataTableColumn<CSTAnchorDistribution>[]>(
    () => [
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('tables.unretrievedDistributions.columns.depositDatetime'),
        value: (row) => row.DepositTimeStamp,
      },
      {
        id: 'deposit',
        kind: 'text',
        header: t('tables.unretrievedDistributions.columns.depositId'),
        value: (row) => row.DepositId,
        nowrap: true,
        cellClassName: 'font-mono tabular-nums',
        priority: 'secondary',
      },
      {
        id: 'anchored',
        kind: 'text',
        header: t('tables.unretrievedDistributions.columns.anchoredTokens'),
        value: (row) => row.YourTokensStaked,
        cell: (row) =>
          t('tables.unretrievedDistributions.anchoredOfTotal', {
            count: row.YourTokensStaked ?? 0,
            total: row.NumStakedNFTs ?? 0,
          }),
        cellClassName: 'tabular-nums',
        nowrap: true,
      },
      {
        id: 'unretrievedTokens',
        kind: 'count',
        header: t('tables.unretrievedDistributions.columns.unretrievedTokens'),
        value: (row) => row.NumUnclaimedTokens,
        priority: 'secondary',
      },
      {
        id: 'deposited',
        kind: 'amount',
        header: t('tables.unretrievedDistributions.columns.depositAmountEth'),
        value: (row) => row.DepositAmountEth,
        showUnit: false,
        priority: 'secondary',
      },
      {
        id: 'distribution',
        kind: 'amount',
        header: t('tables.unretrievedDistributions.columns.distributionAmountEth'),
        value: (row) => row.YourRewardAmountEth,
        showUnit: false,
      },
      {
        id: 'unretrieved',
        kind: 'amount',
        header: t('tables.unretrievedDistributions.columns.unretrievedAmountEth'),
        value: (row) => row.PendingToClaimEth,
        showUnit: false,
        sortable: true,
      },
    ],
    [t],
  );

  const releaseAll = async () => {
    const result = await release(actionIds, false);
    if (result.status === 'confirmed') setConfirmOpen(false);
  };

  return (
    <>
      <DataTable
        data={rewards.data ?? []}
        columns={columns}
        ariaLabel={t('tables.unretrievedDistributions.label')}
        getRowKey={(row) => row.EvtLogId}
        loading={rewards.isLoading}
        error={rewards.error ? t('tables.unretrievedDistributions.error') : undefined}
        onRetry={() => void rewards.refetch()}
        emptyTitle={t('common.empty.unretrieved.title')}
        emptyDescription={t('common.empty.unretrieved.description')}
        tableClassName="sm:min-w-[48rem] lg:min-w-0"
        headingLevel={headingLevel}
        {...state}
      />

      {canReleaseAll ? (
        <div className="mt-6 flex flex-col gap-4 border-t border-rule-faint pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="type-label text-subtle">{t('tables.unretrievedDistributions.summary')}</p>
            <p className="type-figure-md text-foreground">
              <Amount value={unretrievedEth} unit="ETH" context="card" />
            </p>
          </div>
          <ChainGuard explain={false}>
            <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
              {t('tables.unretrievedDistributions.releaseAll')}
            </Button>
          </ChainGuard>
        </div>
      ) : null}

      {isOwnAccount ? (
        <ReleaseConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          collection="cosmicSignature"
          count={actionIds.length}
          retrievableEth={unretrievedEth}
          onConfirm={releaseAll}
          stage={txStage}
        />
      ) : null}
    </>
  );
};
