import { useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import { useLocale, useTranslations } from 'next-intl';
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
import type { MarketingReward } from '@/services/api/types';

export type { MarketingReward };

const MarketingRewardsRow = ({ row }: { row: MarketingReward }) => {
  const locale = useLocale();

  if (!row) {
    return <TablePrimaryRow />;
  }

  const transactionUrl = getExplorerUrl('tx', row.TxHash);

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a className="text-inherit" href={transactionUrl} target="_blank" rel="noopener noreferrer">
          {convertTimestampToDateTime(row.TimeStamp, false, locale)}
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell>{row.AmountEth.toFixed(2)}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const MarketingRewardsTable = ({ list }: { list: MarketingReward[] }) => {
  const t = useTranslations('tables');
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>{t('empty.allocations')}</p>;
  }

  const currentItems = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">{t('columns.amountCst')}</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {currentItems.map((row) => (
              <MarketingRewardsRow key={row.EvtLogId} row={row} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default MarketingRewardsTable;
