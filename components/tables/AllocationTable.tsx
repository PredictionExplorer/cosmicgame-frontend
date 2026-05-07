'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

import { CustomPagination } from '@/components/common/CustomPagination';
import { DataTable, type DataTableColumn } from '@/components/tables/DataTable';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { RoundInfo } from '@/services/api';

const PER_PAGE = 10;

const columns: DataTableColumn<RoundInfo>[] = [
  {
    id: 'cycle',
    header: 'Cycle',
    align: 'center',
    width: '5%',
    sortable: true,
    accessor: (r) => r.RoundNum,
    render: (r) => (
      <Link
        href={`/allocation/${r.RoundNum}`}
        className="text-foreground transition-colors hover:text-primary"
      >
        {r.RoundNum}
      </Link>
    ),
    tooltip: 'The sequential cycle number in the protocol.',
  },
  {
    id: 'finalized',
    header: 'Finalized',
    align: 'center',
    width: '20%',
    sortable: true,
    accessor: (r) => r.TimeStamp,
    render: (r) => convertTimestampToDateTime(r.TimeStamp),
    tooltip: 'The date and time when this cycle ended and allocations were distributed.',
  },
  {
    id: 'recipient',
    header: 'Recipient',
    width: '7%',
    accessor: (r) => r.WinnerAddr,
    render: (r) => (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="font-mono">{r.WinnerAddr ? shortenHex(r.WinnerAddr, 6) : '-'}</span>
        </TooltipTrigger>
        {r.WinnerAddr ? (
          <TooltipContent>
            <p className="max-w-[280px] break-all font-mono text-xs leading-relaxed">
              {r.WinnerAddr}
            </p>
          </TooltipContent>
        ) : null}
      </Tooltip>
    ),
    tooltip: 'The wallet address of the Signature Allocation recipient.',
  },
  {
    id: 'amountEth',
    header: 'Allocation Amount',
    align: 'center',
    width: '15%',
    sortable: true,
    accessor: (r) => r.AmountEth ?? 0,
    render: (r) => (r.AmountEth || 0).toFixed(4),
    tooltip: 'The total ETH distributed as the Signature Allocation for this cycle.',
  },
  {
    id: 'gestures',
    header: 'Gestures',
    align: 'center',
    width: '5%',
    sortable: true,
    accessor: (r) => r.RoundStats?.TotalBids ?? 0,
    render: (r) => r.RoundStats?.TotalBids ?? 0,
    tooltip: 'Total number of gestures made during this cycle.',
  },
  {
    id: 'attachedNfts',
    header: 'Attached NFTs',
    align: 'center',
    width: '12%',
    sortable: true,
    accessor: (r) => r.RoundStats?.TotalDonatedNFTs ?? 0,
    render: (r) => r.RoundStats?.TotalDonatedNFTs ?? 0,
    tooltip: 'Number of NFTs attached to gestures by participants during this cycle.',
  },
  {
    id: 'stellarSelectionEth',
    header: 'Stellar Selection Deposits',
    align: 'center',
    width: '12%',
    sortable: true,
    accessor: (r) => (r.RoundStats?.TotalRaffleEthDepositsEth as number) ?? 0,
    render: (r) => ((r.RoundStats?.TotalRaffleEthDepositsEth as number) || 0).toFixed(4),
    tooltip: 'Total ETH allocated to the Stellar Selection pool by participants.',
  },
  {
    id: 'anchorDistribution',
    header: 'Anchor Distribution Deposit',
    align: 'center',
    width: '11%',
    sortable: true,
    accessor: (r) => r.StakingDepositAmountEth ?? 0,
    render: (r) => (r.StakingDepositAmountEth || 0).toFixed(4),
    tooltip:
      'Total ETH allocated to the Anchor Distribution pool, distributed among NFT anchor-holders.',
  },
  {
    id: 'nftsDistributed',
    header: 'NFTs Distributed',
    align: 'center',
    width: '13%',
    sortable: true,
    accessor: (r) => r.RoundStats?.TotalRaffleNFTs ?? 0,
    render: (r) => r.RoundStats?.TotalRaffleNFTs ?? 0,
    tooltip: 'Total Cosmic Signature NFTs distributed via Stellar Selection in this cycle.',
  },
];

export const AllocationTable = ({ list, loading }: { list: RoundInfo[]; loading: boolean }) => {
  const [page, setPage] = useState(1);

  const paginatedList = useMemo(() => {
    const startIndex = (page - 1) * PER_PAGE;
    const endIndex = page * PER_PAGE;
    return list.slice(startIndex, endIndex);
  }, [page, list]);

  return (
    <>
      <DataTable
        ariaLabel="Allocation recipients by cycle"
        data={paginatedList}
        columns={columns}
        loading={loading}
        skeletonRows={6}
        emptyTitle="No recipients yet"
        emptyDescription="No Performance Cycles have been finalized yet."
        getRowKey={(r, i) => r.RoundNum ?? `cycle-${i}`}
        densityStorageKey="cs.allocation.density"
      />
      {!loading && list.length > 0 ? (
        <CustomPagination
          page={page}
          setPage={setPage}
          totalLength={list.length}
          perPage={PER_PAGE}
        />
      ) : null}
    </>
  );
};
