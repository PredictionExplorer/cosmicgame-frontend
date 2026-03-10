import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
    return <p className="text-lg font-semibold">No winners yet.</p>;
  }

  const tableHeaders = [
    { label: 'Round', width: '5%' },
    { label: 'Finalized', width: '20%' },
    { label: 'Winner', width: '7%' },
    { label: 'Prize Amount', width: '15%', align: 'center' },
    { label: 'Bids', width: '5%' },
    { label: 'Donated NFTs', width: '12%' },
    { label: 'Raffle Deposits', width: '12%', align: 'center' },
    { label: 'Staking Deposit', width: '11%', align: 'center' },
    { label: 'NFTs Awarded', width: '13%' },
  ];

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
                  {header.label}
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
