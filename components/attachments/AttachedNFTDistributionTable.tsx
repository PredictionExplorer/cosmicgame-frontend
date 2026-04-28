import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

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
import { CustomPagination } from '@/components/common/CustomPagination';

const PER_PAGE = 5;

export interface NFTDistributionRowData {
  TokenAddr: string;
  NumDonations: number;
}

interface NFTDistributionTableProps {
  list: NFTDistributionRowData[];
}

const DonatedNFTDistributionTable: FC<NFTDistributionTableProps> = ({ list }) => {
  const [page, setPage] = useState(1);

  const paginatedData = useMemo(
    () => list.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [list, page],
  );

  if (list.length === 0) {
    return <p>No attached tokens yet.</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">Contract Address</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">Number of NFTs</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {paginatedData.map((row, index) => {
              const rowKey = `donated-nft-${(page - 1) * PER_PAGE + index}`;
              if (!row) {
                return <TablePrimaryRow key={rowKey} />;
              }
              return (
                <TablePrimaryRow key={rowKey}>
                  <TablePrimaryCell>
                    <span className="font-mono">{row.TokenAddr}</span>
                  </TablePrimaryCell>
                  <TablePrimaryCell align="right">{row.NumDonations}</TablePrimaryCell>
                </TablePrimaryRow>
              );
            })}
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

export default DonatedNFTDistributionTable;
