import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { useMemo, useState, type FC } from 'react';
import { Tr } from 'react-super-responsive-table';
import { useTranslations } from 'next-intl';

import {
  TablePrimary,
  TablePrimaryCell,
  TablePrimaryContainer,
  TablePrimaryHead,
  TablePrimaryHeadCell,
  TablePrimaryRow,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { TableHeaderHelp } from '@/components/tables/TableHeaderHelp';

const PER_PAGE = 5;

export interface NFTDistributionRowData {
  TokenAddr: string;
  NumDonations: number;
}

interface NFTDistributionTableProps {
  list: NFTDistributionRowData[];
}

const DonatedNFTDistributionTable: FC<NFTDistributionTableProps> = ({ list }) => {
  const t = useTranslations('tables');
  const [page, setPage] = useState(1);

  const paginatedData = useMemo(
    () => list.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [list, page],
  );

  if (list.length === 0) {
    return <p>{t('empty.attachedTokens')}</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                <TableHeaderHelp
                  desktop={t('statisticsColumns.contractAddress')}
                  tooltip={t('statisticsTooltips.attachedNftContractAddress')}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                <TableHeaderHelp
                  desktop={t('statisticsColumns.numberOfNfts')}
                  tooltip={t('statisticsTooltips.attachedNftCount')}
                />
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {paginatedData.map((row, index) => {
              const rowKey = `attached-nft-${(page - 1) * PER_PAGE + index}`;
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
