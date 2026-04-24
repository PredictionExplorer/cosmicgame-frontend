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
  retrieval?: CharityWithdrawal;
}

const WithdrawalRow: FC<WithdrawalRowProps> = ({ retrieval }) => {
  if (!retrieval) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', retrieval.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {convertTimestampToDateTime(retrieval.TimeStamp)}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <AddressLink
          address={retrieval.DestinationAddr}
          url={`/user/${retrieval.DestinationAddr}`}
        />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{retrieval.AmountEth.toFixed(6)}</TablePrimaryCell>
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
    return <p>No retrievals yet.</p>;
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
              <TablePrimaryHeadCell align="right">Retrieval amount (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice(startIndex, endIndex).map((retrieval) => (
              <WithdrawalRow retrieval={retrieval} key={retrieval.EvtLogId} />
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
