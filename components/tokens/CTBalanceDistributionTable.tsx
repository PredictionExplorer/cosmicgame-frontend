import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { memo, useMemo, useState, type FC } from 'react';
import { Tr } from 'react-super-responsive-table';

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

export interface BalanceRow {
  OwnerAddr: string;
  OwnerAid: string | number;
  BalanceFloat: number;
}

const CTBalanceDistributionRow: FC<{ row?: BalanceRow }> = memo(({ row }) => {
  if (!row) return <TablePrimaryRow />;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <AddressLink address={row.OwnerAddr} url={`/user/${row.OwnerAddr}`} />
      </TablePrimaryCell>

      <TablePrimaryCell align="right">{row.BalanceFloat.toFixed(6)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
});
CTBalanceDistributionRow.displayName = 'CTBalanceDistributionRow';

interface TableProps {
  list: BalanceRow[];
}

export const CTBalanceDistributionTable: FC<TableProps> = ({ list }) => {
  const PER_PAGE = 5;
  const [page, setPage] = useState(1);

  const currentRows = useMemo(
    () => list.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [list, page],
  );

  if (list.length === 0) return <p>No tokens yet.</p>;

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Owner Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Balance (CST)</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <tbody>
            {currentRows.map((row) => (
              <CTBalanceDistributionRow key={row.OwnerAid} row={row} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination
        page={page}
        setPage={setPage}
        totalLength={list.length}
        perPage={PER_PAGE}
      />
    </>
  );
};
