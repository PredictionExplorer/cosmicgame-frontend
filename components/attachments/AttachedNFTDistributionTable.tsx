import { useMemo, useState, type FC } from 'react';
import { useTranslations } from 'next-intl';

import {
  TablePrimary,
  TablePrimaryBody,
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
  /** Field names follow the backend dashboard's MainStats.DonatedTokenDistribution rows. */
  ContractAddr: string;
  NumDonatedTokens: number;
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
            <tr>
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
            </tr>
          </TablePrimaryHead>
          <TablePrimaryBody>
            {paginatedData.map((row, index) => {
              const rowKey = `attached-nft-${(page - 1) * PER_PAGE + index}`;
              if (!row) {
                return <TablePrimaryRow key={rowKey} />;
              }
              return (
                <TablePrimaryRow key={rowKey}>
                  <TablePrimaryCell label={t('statisticsColumns.contractAddress')}>
                    <span className="font-mono break-all">{row.ContractAddr}</span>
                  </TablePrimaryCell>
                  <TablePrimaryCell label={t('statisticsColumns.numberOfNfts')} align="right">
                    {row.NumDonatedTokens}
                  </TablePrimaryCell>
                </TablePrimaryRow>
              );
            })}
          </TablePrimaryBody>
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
