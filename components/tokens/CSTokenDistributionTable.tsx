import { useMemo, useState, type FC } from 'react';
import { Tr } from 'react-super-responsive-table';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';
import { CustomPagination } from '@/components/common/CustomPagination';
import { AddressLink } from '@/components/common/AddressLink';

interface TokenDistribution {
  OwnerAddr: string;
  OwnerAid: string | number;
  NumTokens: number;
}

interface CSTokenDistributionRowProps {
  row?: TokenDistribution;
}

const CSTokenDistributionRow: FC<CSTokenDistributionRowProps> = ({ row }) => {
  if (!row) return <TablePrimaryRow />;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <AddressLink address={row.OwnerAddr} url={`/user/${row.OwnerAddr}`} />
      </TablePrimaryCell>

      <TablePrimaryCell align="right">{row.NumTokens}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface CSTokenDistributionTableProps {
  list: TokenDistribution[];
  perPage?: number;
}

export const CSTokenDistributionTable: FC<CSTokenDistributionTableProps> = ({
  list,
  perPage = 5,
}) => {
  const [page, setPage] = useState(1);

  const paginatedData = useMemo(
    () => list.slice((page - 1) * perPage, page * perPage),
    [list, page, perPage],
  );

  if (list.length === 0) return <p>No tokens yet.</p>;

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Owner Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Number of Tokens Owned</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <tbody>
            {paginatedData.map((row) => (
              <CSTokenDistributionRow row={row} key={row.OwnerAid} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
