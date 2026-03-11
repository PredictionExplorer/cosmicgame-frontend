import { useState, type FC } from 'react';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl, convertTimestampToDateTime } from '@/utils';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { AddressLink } from '@/components/common/AddressLink';
import type { CharityWithdrawal } from '@/services/api/types';

export type { CharityWithdrawal };

interface WithdrawalRowProps {
  withdrawal?: CharityWithdrawal;
}

const WithdrawalRow: FC<WithdrawalRowProps> = ({ withdrawal }) => {
  if (!withdrawal) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a className="text-inherit" href={getExplorerUrl('tx', withdrawal.TxHash)} target="_blank">
          {convertTimestampToDateTime(withdrawal.TimeStamp)}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <AddressLink
          address={withdrawal.DestinationAddr}
          url={`/user/${withdrawal.DestinationAddr}`}
        />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{withdrawal.AmountEth.toFixed(6)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface CharityWithdrawalTableProps {
  list: CharityWithdrawal[];
}

const CharityWithdrawalTable: FC<CharityWithdrawalTableProps> = ({ list }) => {
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState<number>(1);

  if (list.length === 0) {
    return <p>No deposits yet.</p>;
  }

  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = page * ITEMS_PER_PAGE;

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Datetime</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>Destination Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Withdrawal amount (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice(startIndex, endIndex).map((withdrawal) => (
              <WithdrawalRow withdrawal={withdrawal} key={withdrawal.EvtLogId} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={ITEMS_PER_PAGE}
      />
    </>
  );
};

export default CharityWithdrawalTable;
