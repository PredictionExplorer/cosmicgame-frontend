'use client';

import { useTranslations } from 'next-intl';

import { getExplorerUrl } from '@/utils/urls';
import { formatAddress } from '@/utils/format';
import { DataTable, ExternalTableLink, type DataTableColumn } from '@/components/ui/data-table';

export interface NFTDistributionRowData {
  /** Field names follow the backend dashboard's MainStats.DonatedTokenDistribution rows. */
  ContractAddr: string;
  NumDonatedTokens: number;
}

interface NFTDistributionTableProps {
  list: NFTDistributionRowData[];
}

/**
 * How many NFTs each collection has contributed through gesture attachments:
 * the contract (on the explorer) and its count, most first.
 */
const DonatedNFTDistributionTable = ({ list }: NFTDistributionTableProps) => {
  const t = useTranslations('tables');

  const columns: DataTableColumn<NFTDistributionRowData>[] = [
    {
      id: 'contract',
      header: t('statisticsColumns.contractAddress'),
      help: t('statisticsTooltips.attachedNftContractAddress'),
      value: (row) => row.ContractAddr,
      nowrap: true,
      cell: (row) => (
        <ExternalTableLink href={getExplorerUrl('address', row.ContractAddr)} className="type-mono">
          {formatAddress(row.ContractAddr)}
        </ExternalTableLink>
      ),
    },
    {
      id: 'count',
      header: t('statisticsColumns.numberOfNfts'),
      help: t('statisticsTooltips.attachedNftCount'),
      kind: 'count',
      value: (row) => row.NumDonatedTokens,
    },
  ];

  return (
    <DataTable
      data={list}
      columns={columns}
      ariaLabel={t('statisticsColumns.contractAddress')}
      getRowKey={(row) => row.ContractAddr}
      initialSort={{ id: 'count', direction: 'desc' }}
      emptyTitle={t('empty.attachedTokens')}
      headingLevel={3}
    />
  );
};

export default DonatedNFTDistributionTable;
