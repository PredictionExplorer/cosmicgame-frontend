import { useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { statisticsCopy } from '@/content/statistics-copy';

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
import { TableHeaderHelp } from '@/components/tables/TableHeaderHelp';
import type { Recipient } from '@/services/api/types';

export type { Recipient };

interface UniqueRecipientsRowProps {
  recipient?: Recipient;
}

const UniqueRecipientsRow = ({ recipient }: UniqueRecipientsRowProps) => {
  if (!recipient) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <AddressLink address={recipient.WinnerAddr} url={`/user/${recipient.WinnerAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{recipient.AllocationsCount}</TablePrimaryCell>
      <TablePrimaryCell align="right">{recipient.MaxWinAmountEth.toFixed(6)}</TablePrimaryCell>
      <TablePrimaryCell align="right">{recipient.PrizesSum.toFixed(6)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface UniqueRecipientsTableProps {
  list: Recipient[];
}

export const UniqueRecipientsTable = ({ list }: UniqueRecipientsTableProps) => {
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>No recipients yet.</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                <TableHeaderHelp
                  desktop="Recipient Address"
                  tooltip={statisticsCopy.tables.recipientAddress}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                <TableHeaderHelp
                  desktop="Allocations Received"
                  tooltip={statisticsCopy.tables.allocationsReceived}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                <TableHeaderHelp
                  desktop="Max Allocation (ETH)"
                  tooltip={statisticsCopy.tables.maxAllocationEth}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                <TableHeaderHelp
                  desktop="Allocations Sum (ETH)"
                  tooltip={statisticsCopy.tables.allocationsSumEth}
                />
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((recipient) => (
              <UniqueRecipientsRow recipient={recipient} key={recipient.WinnerAid} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
