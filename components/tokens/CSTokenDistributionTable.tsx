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
import { AddressLink } from '@/components/common/AddressLink';
import { TableHeaderHelp } from '@/components/tables/TableHeaderHelp';

interface TokenDistribution {
  OwnerAddr: string;
  OwnerAid: string | number;
  NumTokens: number;
}

interface CSTokenDistributionRowProps {
  row?: TokenDistribution;
}

const CSTokenDistributionRow: FC<CSTokenDistributionRowProps> = ({ row }) => {
  const t = useTranslations('tables');

  if (!row) return <TablePrimaryRow />;

  return (
    <TablePrimaryRow>
      <TablePrimaryCell label={t('statisticsColumns.ownerAddress')}>
        <AddressLink address={row.OwnerAddr} url={`/user/${row.OwnerAddr}`} />
      </TablePrimaryCell>

      <TablePrimaryCell label={t('statisticsColumns.numberOfTokensOwned')} align="right">
        {row.NumTokens}
      </TablePrimaryCell>
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
  const t = useTranslations('tables');
  const [page, setPage] = useState(1);

  const paginatedData = useMemo(
    () => list.slice((page - 1) * perPage, page * perPage),
    [list, page, perPage],
  );

  if (list.length === 0) return <p>{t('empty.tokens')}</p>;

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <tr>
              <TablePrimaryHeadCell align="left">
                <TableHeaderHelp
                  desktop={t('statisticsColumns.ownerAddress')}
                  tooltip={t('statisticsTooltips.ownerAddress')}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                <TableHeaderHelp
                  desktop={t('statisticsColumns.numberOfTokensOwned')}
                  tooltip={t('statisticsTooltips.numberOfTokensOwned')}
                />
              </TablePrimaryHeadCell>
            </tr>
          </TablePrimaryHead>

          <TablePrimaryBody>
            {paginatedData.map((row) => (
              <CSTokenDistributionRow row={row} key={row.OwnerAid} />
            ))}
          </TablePrimaryBody>
        </TablePrimary>
      </TablePrimaryContainer>

      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
