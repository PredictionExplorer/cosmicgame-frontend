import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import type { RoundInfo } from '@/services/api';

const PrizeRow = ({ prize }: { prize: RoundInfo }) => {
  const router = useRouter();

  if (!prize) return <TablePrimaryRow />;

  const handleRowClick = () => {
    router.push(`/prize/${prize.RoundNum}`);
  };

  return (
    <TablePrimaryRow className="cursor-pointer" onClick={handleRowClick}>
      <TablePrimaryCell align="center">{prize.RoundNum}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(prize.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="font-mono">
                {prize.WinnerAddr ? shortenHex(prize.WinnerAddr, 6) : '-'}
              </span>
            </TooltipTrigger>
            <TooltipContent>{prize.WinnerAddr || ''}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{(prize.AmountEth || 0).toFixed(4)}</TablePrimaryCell>
      <TablePrimaryCell align="center">{prize.RoundStats?.TotalBids || 0}</TablePrimaryCell>
      <TablePrimaryCell align="center">{prize.RoundStats?.TotalDonatedNFTs || 0}</TablePrimaryCell>
      <TablePrimaryCell align="center">
        {((prize.RoundStats?.TotalRaffleEthDepositsEth as number) || 0).toFixed(4)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {(prize.StakingDepositAmountEth || 0).toFixed(4)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{prize.RoundStats?.TotalRaffleNFTs || 0}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const tableHeaders = [
  {
    label: 'Cycle',
    width: '5%',
    tooltip: 'The sequential cycle number in the protocol.',
  },
  {
    label: 'Finalized',
    width: '20%',
    tooltip: 'The date and time when this cycle ended and allocations were distributed.',
  },
  {
    label: 'Recipient',
    width: '7%',
    tooltip: 'The wallet address of the Signature Allocation recipient.',
  },
  {
    label: 'Allocation Amount',
    width: '15%',
    align: 'center' as const,
    tooltip: 'The total ETH distributed as the Signature Allocation for this cycle.',
  },
  {
    label: 'Gestures',
    width: '5%',
    tooltip: 'Total number of gestures made during this cycle.',
  },
  {
    label: 'Attached NFTs',
    width: '12%',
    tooltip: 'Number of NFTs attached to gestures by participants during this cycle.',
  },
  {
    label: 'Stellar Selection Deposits',
    width: '12%',
    align: 'center' as const,
    tooltip: 'Total ETH allocated to the Stellar Selection pool by participants.',
  },
  {
    label: 'Anchor Distribution Deposit',
    width: '11%',
    align: 'center' as const,
    tooltip:
      'Total ETH allocated to the Anchor Distribution pool, distributed among NFT anchor-holders.',
  },
  {
    label: 'NFTs Distributed',
    width: '13%',
    tooltip: 'Total Cosmic Signature NFTs distributed via Stellar Selection in this cycle.',
  },
];

export const PrizeTable = ({ list, loading }: { list: RoundInfo[]; loading: boolean }) => {
  const perPage = 10;
  const [page, setPage] = useState(1);

  const paginatedList = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    const endIndex = page * perPage;
    return list.slice(startIndex, endIndex);
  }, [page, perPage, list]);

  if (loading) {
    return <p className="text-lg font-semibold">Loading...</p>;
  }

  if (!list.length) {
    return <p className="text-lg font-semibold">No recipients yet.</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            {tableHeaders.map((header, index) => (
              <col key={index} style={{ width: header.width }} />
            ))}
          </colgroup>
          <TablePrimaryHead>
            <Tr>
              {tableHeaders.map((header, index) => (
                <TablePrimaryHeadCell key={index} align={header.align || 'center'}>
                  <span className="inline-flex items-center gap-1">
                    {header.label}
                    <InfoTooltip content={header.tooltip} iconClassName="h-3 w-3" />
                  </span>
                </TablePrimaryHeadCell>
              ))}
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {paginatedList.map((prize, index) => (
              <PrizeRow prize={prize} key={prize.RoundNum ?? `round-${index}`} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
