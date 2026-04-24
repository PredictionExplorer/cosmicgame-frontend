import { useState, useMemo } from 'react';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

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
import type { Bidder } from '@/services/api/types';

export type { Bidder };

interface UniqueBiddersRowProps {
  bidder?: Bidder;
}

const UniqueBiddersRow = ({ bidder }: UniqueBiddersRowProps) => {
  if (!bidder) {
    return <TablePrimaryRow />;
  }

  const { BidderAddr, NumBids, MaxBidAmountEth } = bidder;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <AddressLink address={BidderAddr} url={`/user/${BidderAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="center">{NumBids}</TablePrimaryCell>
      <TablePrimaryCell align="right">{MaxBidAmountEth.toFixed(6)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface UniqueBiddersTableProps {
  list: Bidder[];
}

export const UniqueBiddersTable = ({ list }: UniqueBiddersTableProps) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  const paginatedList = useMemo(
    () => list.slice((page - 1) * perPage, page * perPage),
    [list, page],
  );

  if (list.length === 0) {
    return <p>No participants yet.</p>;
  }

  return (
    <div className="w-full">
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Participant Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">Number of Gestures</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Max Gesture (ETH)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {paginatedList.map((bidder) => (
              <UniqueBiddersRow bidder={bidder} key={bidder.BidderAid} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </div>
  );
};
