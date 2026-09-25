'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { sameAddress } from '@/utils/format';
import { AddressChip } from '@/components/ui/address-chip';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import type { LedgerStateProps } from '@/components/tables/ledger-props';
import type { CharityWithdrawal } from '@/services/api/types';

export type { CharityWithdrawal };

const BENEFICIARY = protocolFacts.publicGoodsBeneficiary;

interface CharityWithdrawalTableProps extends LedgerStateProps {
  list: CharityWithdrawal[];
}

/**
 * ETH forwarded out of the Public Goods Vault, each date linked to its
 * transaction. The vault's documented beneficiary reads by name, as it does
 * in the page header; any other destination reads as hex.
 */
const CharityWithdrawalTable = ({ list, ...state }: CharityWithdrawalTableProps) => {
  const t = useTranslations('tables');

  const columns = useMemo<DataTableColumn<CharityWithdrawal>[]>(
    () => [
      {
        id: 'datetime',
        kind: 'datetime',
        header: t('columns.datetime'),
        value: (row) => row.TimeStamp,
        txHash: (row) => row.TxHash,
        year: 'always',
        sortable: true,
        phone: 'title',
      },
      {
        id: 'destination',
        kind: 'address',
        // Where the ETH went, by name when the vault's beneficiary took it.
        header: t('columns.destination'),
        value: (row) => row.DestinationAddr,
        cell: (row) => (
          <AddressChip
            address={row.DestinationAddr}
            variant="plain"
            showCopy={false}
            label={
              sameAddress(row.DestinationAddr, BENEFICIARY.address) ? BENEFICIARY.name : undefined
            }
          />
        ),
      },
      {
        id: 'amount',
        kind: 'amount',
        header: t('columns.amountEth'),
        value: (row) => row.AmountEth,
        showUnit: false,
        sortable: true,
      },
    ],
    [t],
  );

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('names.publicGoodsRetrievals')}
      getRowKey={(row) => row.EvtLogId}
      // A dated, year-stamped proof beside an address and an amount is wider
      // than a 320px screen: each retrieval reads as a record on phones.
      layout="cards"
      emptyTitle={t('empty.retrievals')}
      {...state}
    />
  );
};

export default CharityWithdrawalTable;
