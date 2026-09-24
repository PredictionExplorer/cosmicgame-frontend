'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { DataTable, type DataTableColumn } from '@/components/ui/data-table';

export interface CSTAnchorDistributionByDeposit {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  DepositRoundNum: number;
  DepositId: number;
  DepositAmountEth: number;
  ClaimedAmountEth: number;
  YourClaimableAmountEth: number;
  FullyClaimed: boolean;
  NumStakedNFTs: number;
  NumTokensCollected: number;
  YourTokensStaked: number;
}

import type { AnchoringLedgerProps } from './ledgerProps';

interface CSTAnchorDistributionsByDepositTableProps extends AnchoringLedgerProps {
  list: CSTAnchorDistributionByDeposit[];
}

/**
 * Every ETH Anchor Distribution deposit an address shares in: the deposit,
 * what has been retrieved from it, and this address's part. The totals across
 * all anchor-holders drop out on phones.
 */
export const CSTAnchorDistributionsByDepositTable = ({
  list,
  headingLevel = 3,
  ...state
}: CSTAnchorDistributionsByDepositTableProps) => {
  const t = useTranslations('anchoring');

  const columns = useMemo<DataTableColumn<CSTAnchorDistributionByDeposit>[]>(
    () => [
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('tables.distributionsByDeposit.columns.depositDatetime'),
        value: (row) => row.TimeStamp,
        txHash: (row) => row.TxHash,
      },
      {
        id: 'cycle',
        kind: 'link',
        header: t('tables.distributionsByDeposit.columns.depositCycle'),
        value: (row) => row.DepositRoundNum,
        href: (row) => `/allocation/${row.DepositRoundNum}`,
      },
      {
        id: 'deposit',
        kind: 'text',
        header: t('tables.distributionsByDeposit.columns.depositId'),
        value: (row) => row.DepositId,
        nowrap: true,
        cellClassName: 'font-mono tabular-nums',
        priority: 'secondary',
      },
      {
        id: 'amount',
        kind: 'amount',
        header: t('tables.distributionsByDeposit.columns.totalDepositAmount'),
        value: (row) => row.DepositAmountEth,
        showUnit: false,
      },
      {
        id: 'retrieved',
        kind: 'amount',
        header: t('tables.distributionsByDeposit.columns.totalRetrievedAmount'),
        value: (row) => row.ClaimedAmountEth,
        showUnit: false,
        priority: 'secondary',
      },
      {
        id: 'retrievable',
        kind: 'amount',
        header: t('tables.distributionsByDeposit.columns.yourRetrievableAmount'),
        value: (row) => row.YourClaimableAmountEth,
        showUnit: false,
      },
      {
        id: 'fullyRetrieved',
        kind: 'text',
        header: t('tables.distributionsByDeposit.columns.fullyRetrieved'),
        value: (row) => (row.FullyClaimed ? t('common.yes') : t('common.no')),
        nowrap: true,
      },
      {
        id: 'anchored',
        kind: 'count',
        header: t('tables.distributionsByDeposit.columns.totalAnchoredNfts'),
        value: (row) => row.NumStakedNFTs,
        priority: 'secondary',
      },
      {
        id: 'retrievedTokens',
        kind: 'count',
        header: t('tables.distributionsByDeposit.columns.totalRetrievedTokens'),
        value: (row) => row.NumTokensCollected,
        priority: 'secondary',
      },
      {
        id: 'yourTokens',
        kind: 'count',
        header: t('tables.distributionsByDeposit.columns.yourAnchoredTokens'),
        value: (row) => row.YourTokensStaked,
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('tables.distributionsByDeposit.label')}
      getRowKey={(row) => row.EvtLogId}
      emptyTitle={t('common.empty.distributions.title')}
      emptyDescription={t('common.empty.distributions.description')}
      tableClassName="sm:min-w-[60rem] xl:min-w-0"
      headingLevel={headingLevel}
      {...state}
    />
  );
};
