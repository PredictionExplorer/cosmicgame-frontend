import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tbody, Tr } from 'react-super-responsive-table';

import { convertTimestampToDateTime } from '@/utils';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import type { StakingAction } from '@/services/api';

const StakingActionsRow = ({ row, IsRwalk }: { row: StakingAction; IsRwalk: boolean }) => {
  const router = useRouter();

  if (!row) {
    return <TablePrimaryRow />;
  }

  const handleRowClick = () => {
    router.push(`/staking-action/${IsRwalk ? 1 : 0}/${row.ActionId}`);
  };

  return (
    <TablePrimaryRow className="cursor-pointer" onClick={handleRowClick}>
      <TablePrimaryCell>{convertTimestampToDateTime(row.TimeStamp)}</TablePrimaryCell>

      <TablePrimaryCell align="center">
        {row.ActionType === 1 ? 'Unstake' : 'Stake'}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">
        {IsRwalk ? (
          <a href={`https://randomwalknft.com/detail/${row.TokenId}`} className="text-inherit">
            {row.TokenId}
          </a>
        ) : (
          <Link href={`/detail/${row.TokenId}`} className="text-inherit">
            {row.TokenId}
          </Link>
        )}
      </TablePrimaryCell>

      <TablePrimaryCell align="center">{row.NumStakedNFTs}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const StakingActionsTable = ({ list, IsRwalk }: { list: StakingAction[]; IsRwalk: boolean }) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p className="text-muted-foreground">No actions yet.</p>;
  }

  const startIndex = (page - 1) * perPage;
  const endIndex = page * perPage;
  const currentData = list.slice(startIndex, endIndex);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <colgroup>
            <col width="25%" />
            <col width="25%" />
            <col width="25%" />
            <col width="25%" />
          </colgroup>

          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Stake Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Action Type</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Token ID</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Number of NFTs</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <Tbody>
            {currentData.map((row) => (
              <StakingActionsRow key={row.EvtLogId} row={row} IsRwalk={IsRwalk} />
            ))}
          </Tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default StakingActionsTable;
