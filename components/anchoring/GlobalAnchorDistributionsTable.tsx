'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { useCSTAnchorDistributionsByCycle } from '@/hooks/useApiQuery';
import { DataTable, TableLink, type DataTableColumn } from '@/components/ui/data-table';
import AnchoringRecipientTable from '@/components/tables/AnchoringRecipientTable';
import type { CSTAnchorDistribution } from '@/services/api';

import type { AnchoringLedgerProps } from './ledgerProps';

interface GlobalAnchorDistributionsTableProps extends AnchoringLedgerProps {
  list: CSTAnchorDistribution[];
}

/** The anchor-holders who shared one cycle's deposit, loaded when the reader opens it. */
function CycleRecipients({ cycle }: { cycle: number }) {
  const t = useTranslations('anchoring');
  const { data = [], isLoading, error, refetch } = useCSTAnchorDistributionsByCycle(cycle);
  return (
    <AnchoringRecipientTable
      list={data}
      loading={isLoading}
      error={error ? t('tables.globalDistributions.recipientsError') : undefined}
      onRetry={() => void refetch()}
      headingLevel={4}
    />
  );
}

/**
 * Every ETH Anchor Distribution deposit, one row per finalized cycle: when it
 * was deposited, how many Cosmic Signature NFTs shared it, the amount and what
 * is still unretrieved. A row expands into the anchor-holders who shared it.
 */
export const GlobalAnchorDistributionsTable = ({
  list,
  headingLevel = 2,
  ...state
}: GlobalAnchorDistributionsTableProps) => {
  const t = useTranslations('anchoring');
  const tCommon = useTranslations('common');

  const columns = useMemo<DataTableColumn<CSTAnchorDistribution>[]>(
    () => [
      {
        id: 'cycle',
        kind: 'link',
        header: t('tables.globalDistributions.columns.cycle'),
        value: (row) => row.RoundNum,
        // "Cycle 1", not a bare "1": a word-sized link, as every other ledger names a cycle.
        cell: (row) => (
          <TableLink href={`/allocation/${row.RoundNum}`}>
            {tCommon('pageHeader.crumbs.cycle', { cycle: row.RoundNum })}
          </TableLink>
        ),
        nowrap: true,
        sortable: true,
      },
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('tables.globalDistributions.columns.depositDatetime'),
        value: (row) => row.TimeStamp,
        txHash: (row) => row.TxHash,
      },
      {
        id: 'anchored',
        kind: 'count',
        header: t('tables.globalDistributions.columns.totalAnchoredTokens'),
        value: (row) => row.NumStakedNFTs,
      },
      {
        id: 'deposited',
        kind: 'amount',
        header: t('tables.globalDistributions.columns.totalDepositedEth'),
        value: (row) => row.TotalDepositAmountEth,
        showUnit: false,
        sortable: true,
      },
      {
        id: 'pending',
        kind: 'amount',
        header: t('tables.globalDistributions.columns.pendingEth'),
        value: (row) => row.PendingToCollectEth,
        showUnit: false,
      },
      {
        id: 'fullyRetrieved',
        kind: 'text',
        header: t('tables.globalDistributions.columns.fullyRetrieved'),
        value: (row) => (row.FullyClaimed ? t('common.yes') : t('common.no')),
        nowrap: true,
        priority: 'secondary',
      },
    ],
    [t, tCommon],
  );

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('tables.globalDistributions.label')}
      getRowKey={(row) => row.EvtLogId}
      renderDetails={(row) => <CycleRecipients cycle={row.RoundNum} />}
      detailsLabel={(_row, expanded) =>
        expanded
          ? t('tables.globalDistributions.hideRecipients')
          : t('tables.globalDistributions.showRecipients')
      }
      emptyTitle={t('common.empty.distributions.title')}
      emptyDescription={t('common.empty.distributions.description')}
      headingLevel={headingLevel}
      {...state}
    />
  );
};
