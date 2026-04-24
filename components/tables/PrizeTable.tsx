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
    label: 'Round',
    width: '5%',
    tooltip: 'The sequential round number in the game.',
  },
  {
    label: 'Finalized',
    width: '20%',
    tooltip: 'The date and time when this round ended and prizes were distributed.',
  },
  {
    label: 'Winner',
    width: '7%',
    tooltip: 'The wallet address of the main prize winner.',
  },
  {
    label: 'Prize Amount',
    width: '15%',
    align: 'center' as const,
    tooltip: 'The total ETH awarded as the main prize for this round.',
  },
  {
    label: 'Bids',
    width: '5%',
    tooltip: 'Total number of bids placed during this round.',
  },
  {
    label: 'Donated NFTs',
    width: '12%',
    tooltip: 'Number of NFTs donated by participants during this round.',
  },
  {
    label: 'Raffle Deposits',
    width: '12%',
    align: 'center' as const,
    tooltip: 'Total ETH deposited into the raffle pool by participants.',
  },
  {
    label: 'Staking Deposit',
    width: '11%',
    align: 'center' as const,
    tooltip: 'Total ETH deposited into the staking pool, distributed among NFT stakers.',
  },
  {
    label: 'NFTs Awarded',
    width: '13%',
    tooltip: 'Total COSMIC NFTs awarded via raffle in this round.',
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
