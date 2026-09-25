'use client';

import { useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { protocolFacts } from '@/content/protocol-facts';

import { sameAddress } from '@/utils/format';
import { AddressChip } from '@/components/ui/address-chip';
import { Amount } from '@/components/ui/amount';
import {
  DataTable,
  KindValue,
  type DataTableColumn,
  type PhoneRecordContent,
} from '@/components/ui/data-table';
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
 * in the page header; any other destination reads as hex. On a phone each
 * is a two-line record: the date and the amount, then where it went.
 */
const CharityWithdrawalTable = ({ list, ...state }: CharityWithdrawalTableProps) => {
  const t = useTranslations('tables');

  // Where the ETH went, by name when the vault's beneficiary took it.
  const destination = useCallback(
    (row: CharityWithdrawal) => (
      <AddressChip
        address={row.DestinationAddr}
        variant="plain"
        showCopy={false}
        label={sameAddress(row.DestinationAddr, BENEFICIARY.address) ? BENEFICIARY.name : undefined}
      />
    ),
    [],
  );

  const phoneRecord = useCallback(
    (row: CharityWithdrawal): PhoneRecordContent => ({
      title: <KindValue kind="datetime" value={row.TimeStamp} txHash={row.TxHash} year="always" />,
      titleEnd: (
        <Amount value={row.AmountEth} unit="ETH" context="table" unitClassName="text-subtle" />
      ),
      details: [destination(row)],
    }),
    [destination],
  );

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
        header: t('columns.destination'),
        value: (row) => row.DestinationAddr,
        cell: destination,
        phone: 'omit',
      },
      {
        id: 'amount',
        kind: 'amount',
        header: t('columns.amountEth'),
        value: (row) => row.AmountEth,
        showUnit: false,
        sortable: true,
        phone: 'omit',
      },
    ],
    [t, destination],
  );

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('names.publicGoodsRetrievals')}
      getRowKey={(row) => row.EvtLogId}
      phoneRecord={phoneRecord}
      emptyTitle={t('empty.retrievals')}
      {...state}
    />
  );
};

export default CharityWithdrawalTable;
