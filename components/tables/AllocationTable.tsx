'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { toFiniteNumber } from '@/utils/finiteNumber';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { RoundInfo } from '@/services/api';

interface AllocationTableProps extends LedgerStateProps {
  list: RoundInfo[];
}

/**
 * Every finalized cycle in one aligned ledger: who received the Signature
 * Allocation, the ETH each allocation track carried, and the cycle's
 * gestures and NFTs. Each row leads to that cycle's allocation page; every
 * explanation sits once on its column header.
 */
export const AllocationTable = ({ list, ...state }: AllocationTableProps) => {
  const t = useTranslations('tables');

  const columns = useMemo<DataTableColumn<RoundInfo>[]>(
    () => [
      {
        id: 'cycle',
        kind: 'text',
        header: t('columns.cycle'),
        value: (cycle) => cycle.RoundNum,
        cell: (cycle) => t('allocation.cycle', { cycle: cycle.RoundNum }),
        nowrap: true,
        sortable: true,
      },
      {
        id: 'finalized',
        kind: 'datetime',
        header: t('allocation.columns.finalized'),
        value: (cycle) => cycle.TimeStamp,
        txHash: (cycle) => cycle.TxHash,
      },
      {
        id: 'recipient',
        kind: 'address',
        header: t('columns.recipient'),
        help: t('allocation.allocationHelp'),
        value: (cycle) => cycle.WinnerAddr || null,
      },
      {
        id: 'signature',
        kind: 'amount',
        header: t('allocation.columns.signatureEth'),
        value: (cycle) => toFiniteNumber(cycle.AmountEth),
        showUnit: false,
        sortable: true,
      },
      {
        id: 'chrono',
        kind: 'amount',
        header: t('allocation.columns.chronoEth'),
        value: (cycle) => toFiniteNumber(cycle.ChronoWarriorAmountEth),
        showUnit: false,
        hideWhenEmpty: true,
      },
      {
        id: 'stellar',
        kind: 'amount',
        header: t('allocation.columns.stellarEth'),
        help: t('allocation.stellarHelp'),
        value: (cycle) => toFiniteNumber(cycle.RoundStats?.TotalRaffleEthDepositsEth),
        showUnit: false,
      },
      {
        id: 'anchor',
        kind: 'amount',
        header: t('allocation.columns.anchorEth'),
        help: t('allocation.anchorHelp'),
        value: (cycle) => toFiniteNumber(cycle.StakingDepositAmountEth),
        showUnit: false,
      },
      {
        id: 'gestures',
        kind: 'count',
        header: t('allocation.gestures'),
        help: t('allocation.gesturesHelp'),
        value: (cycle) => toFiniteNumber(cycle.RoundStats?.TotalBids),
        sortable: true,
      },
      {
        id: 'attachedNfts',
        kind: 'count',
        header: t('allocation.columns.nftsAttached'),
        help: t('allocation.nftsHelp'),
        value: (cycle) => toFiniteNumber(cycle.RoundStats?.TotalDonatedNFTs),
        priority: 'secondary',
      },
      {
        id: 'stellarNfts',
        kind: 'count',
        header: t('allocation.columns.nftsViaStellar'),
        help: t('allocation.distributedHelp'),
        value: (cycle) => toFiniteNumber(cycle.RoundStats?.TotalRaffleNFTs),
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('allocation.listAria')}
      getRowKey={(cycle, index) => cycle.RoundNum ?? `cycle-${index}`}
      getRowHref={(cycle) => `/allocation/${cycle.RoundNum}`}
      getRowLabel={(cycle) => t('allocation.openDetails', { cycle: cycle.RoundNum })}
      emptyTitle={t('empty.recipientCyclesTitle')}
      emptyDescription={t('empty.recipientCyclesDescription')}
      tableClassName="md:min-w-[60rem]"
      {...state}
    />
  );
};
