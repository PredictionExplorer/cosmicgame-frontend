import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { memo, useMemo, useState, type FC } from 'react';
import { Tr } from 'react-super-responsive-table';
import { useLocale, useTranslations } from 'next-intl';

import { formatTableAmount } from '@/utils';

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

export interface BalanceRow {
  OwnerAddr: string;
  OwnerAid: string | number;
  BalanceFloat: number;
}

const CTBalanceDistributionRow: FC<{ row?: BalanceRow; locale: string }> = memo(
  ({ row, locale }) => {
    if (!row) return <TablePrimaryRow />;

    return (
      <TablePrimaryRow>
        <TablePrimaryCell>
          <AddressLink address={row.OwnerAddr} url={`/user/${row.OwnerAddr}`} />
        </TablePrimaryCell>

        <TablePrimaryCell align="right">
          {formatTableAmount(row.BalanceFloat, locale)}
        </TablePrimaryCell>
      </TablePrimaryRow>
    );
  },
);
CTBalanceDistributionRow.displayName = 'CTBalanceDistributionRow';

interface TableProps {
  list: BalanceRow[];
}

export const CTBalanceDistributionTable: FC<TableProps> = ({ list }) => {
  const t = useTranslations('tables');
  const locale = useLocale();
  const PER_PAGE = 5;
  const [page, setPage] = useState(1);

  const currentRows = useMemo(
    () => list.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [list, page],
  );

  if (list.length === 0) return <p>{t('empty.tokens')}</p>;

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                <TableHeaderHelp
                  desktop={t('statisticsColumns.ownerAddress')}
                  tooltip={t('statisticsTooltips.ownerAddress')}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">
                <TableHeaderHelp
                  desktop={t('statisticsColumns.cstBalance')}
                  tooltip={t('statisticsTooltips.cstBalance')}
                />
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>

          <tbody>
            {currentRows.map((row) => (
              <CTBalanceDistributionRow key={row.OwnerAid} row={row} locale={locale} />
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
