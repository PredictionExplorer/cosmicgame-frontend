import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState, type FC } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tbody, Tr } from 'react-super-responsive-table';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RowData {
  EvtLogId: string | number;
  ActionId: string | number;
  TimeStamp: number;
  ActionType: number;
  TokenId: string | number;
  StakerAddr: string;
  NumStakedNFTs: number;
}

interface GlobalStakingActionsRowProps {
  row: RowData;
  IsRWLK: boolean;
}

const GlobalStakingActionsRow: FC<GlobalStakingActionsRowProps> = ({ row, IsRWLK }) => {
  const router = useRouter();

  if (!row) {
    return <TablePrimaryRow />;
  }

  const handleRowClick = () => {
    router.push(`/anchor-action/${IsRWLK ? 1 : 0}/${row.ActionId}`);
  };

  return (
    <TablePrimaryRow className="cursor-pointer" onClick={handleRowClick}>
      <TablePrimaryCell>{convertTimestampToDateTime(row.TimeStamp)}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        {row.ActionType === 0 ? 'Stake' : 'Unstake'}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {IsRWLK ? (
          <a href={`https://randomwalknft.com/detail/${row.TokenId}`} className="text-inherit">
            {row.TokenId}
          </a>
        ) : (
          <Link href={`/detail/${row.TokenId}`} className="text-inherit">
            {row.TokenId}
          </Link>
        )}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href={`/user/${row.StakerAddr}`} className="text-inherit font-mono">
                {shortenHex(row.StakerAddr, 6)}
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>{row.StakerAddr}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface GlobalStakingActionsTableProps {
  list: RowData[];
  IsRWLK: boolean;
}

export const GlobalStakingActionsTable: FC<GlobalStakingActionsTableProps> = ({ list, IsRWLK }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (!list || list.length === 0) {
    return <p className="text-muted-foreground">No actions yet.</p>;
  }

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const visibleRows = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            <col width="25%" />
            <col width="15%" />
            <col width="15%" />
            <col width="25%" />
            <col width="15%" />
          </colgroup>

          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Stake Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Action Type</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Staker Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of NFTs</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <Tbody>
            {visibleRows.map((row) => (
              <GlobalStakingActionsRow key={row.EvtLogId} row={row} IsRWLK={IsRWLK} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
