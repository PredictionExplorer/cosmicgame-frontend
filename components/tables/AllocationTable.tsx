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
 * Allocation, the ETH each allocation track carried (the same tracks, in
 * the same order, as the reserve split above it), and the cycle's gestures
 * and NFTs. The ETH and NFT columns sit under one group heading each, so a
 * sub-header needs neither the unit nor the shared word and stays on one or
 * two lines. Each row leads to that cycle's allocation page.
 *
 * On a phone each cycle is a short record under its name: when it was
 * finalized, the recipient, the Signature Allocation and the gestures. The
 * per-track breakdown is the cycle page's to show, one tap away, so the
 * index is not a stack of eleven-line forms.
 */
export const AllocationTable = ({ list, ...state }: AllocationTableProps) => {
  const t = useTranslations('tables');

  const columns = useMemo<DataTableColumn<RoundInfo>[]>(() => {
    const ethGroup = t('allocation.groups.eth');
    const nftGroup = t('allocation.groups.nfts');
    return [
      {
        id: 'cycle',
        kind: 'text',
        header: t('columns.cycle'),
        value: (cycle) => cycle.RoundNum,
        cell: (cycle) => t('allocation.cycle', { cycle: cycle.RoundNum }),
        nowrap: true,
        sortable: true,
        phone: 'title',
      },
      {
        id: 'finalized',
        kind: 'datetime',
        header: t('allocation.columns.finalized'),
        value: (cycle) => cycle.TimeStamp || null,
        txHash: (cycle) => cycle.TxHash,
        // A finalized cycle always has a date and a recipient: a missing one
        // could not be read, and says so.
        whenBlank: 'unknown',
      },
      {
        id: 'recipient',
        kind: 'address',
        header: t('columns.recipient'),
        value: (cycle) => cycle.WinnerAddr || null,
        whenBlank: 'unknown',
      },
      {
        id: 'signature',
        kind: 'amount',
        group: ethGroup,
        header: t('allocation.columns.signature'),
        label: t('allocation.columns.signatureEth'),
        value: (cycle) => toFiniteNumber(cycle.AmountEth),
        showUnit: false,
        sortable: true,
      },
      {
        id: 'chrono',
        kind: 'amount',
        group: ethGroup,
        header: t('allocation.columns.chrono'),
        label: t('allocation.columns.chronoEth'),
        value: (cycle) => toFiniteNumber(cycle.ChronoWarriorAmountEth),
        showUnit: false,
        hideWhenEmpty: true,
        priority: 'secondary',
      },
      {
        id: 'stellar',
        kind: 'amount',
        group: ethGroup,
        header: t('allocation.columns.stellar'),
        label: t('allocation.columns.stellarEth'),
        value: (cycle) => toFiniteNumber(cycle.RoundStats?.TotalRaffleEthDepositsEth),
        showUnit: false,
        priority: 'secondary',
      },
      {
        id: 'anchor',
        kind: 'amount',
        group: ethGroup,
        header: t('allocation.columns.anchor'),
        label: t('allocation.columns.anchorEth'),
        value: (cycle) => toFiniteNumber(cycle.StakingDepositAmountEth),
        showUnit: false,
        priority: 'secondary',
      },
      {
        id: 'publicGoods',
        kind: 'amount',
        group: ethGroup,
        header: t('allocation.columns.publicGoods'),
        label: t('allocation.columns.publicGoodsEth'),
        value: (cycle) => toFiniteNumber(cycle.CharityAmountETH),
        showUnit: false,
        priority: 'secondary',
      },
      {
        id: 'gestures',
        kind: 'count',
        header: t('allocation.gestures'),
        value: (cycle) => toFiniteNumber(cycle.RoundStats?.TotalBids),
        sortable: true,
      },
      {
        id: 'attachedNfts',
        kind: 'count',
        group: nftGroup,
        header: t('allocation.columns.attached'),
        label: t('allocation.columns.nftsAttached'),
        value: (cycle) => toFiniteNumber(cycle.RoundStats?.TotalDonatedNFTs),
        priority: 'secondary',
      },
      {
        id: 'stellarNfts',
        kind: 'count',
        group: nftGroup,
        header: t('allocation.columns.stellar'),
        label: t('allocation.columns.nftsViaStellar'),
        value: (cycle) => toFiniteNumber(cycle.RoundStats?.TotalRaffleNFTs),
        priority: 'secondary',
      },
    ];
  }, [t]);

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('allocation.listAria')}
      getRowKey={(cycle, index) => cycle.RoundNum ?? `cycle-${index}`}
      getRowHref={(cycle) => `/allocation/${cycle.RoundNum}`}
      emptyTitle={t('empty.recipientCyclesTitle')}
      emptyDescription={t('empty.recipientCyclesDescription')}
      // Each row carries three links (the cycle, its proof, the recipient)
      // over columns of figures: they underline on hover and focus only.
      links="quiet"
      tableClassName="md:min-w-[64rem]"
      {...state}
    />
  );
};
