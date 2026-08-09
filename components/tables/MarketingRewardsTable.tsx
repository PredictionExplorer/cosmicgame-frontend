import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { getExplorerUrl } from '@/utils';

import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
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
import type { MarketingReward } from '@/services/api/types';

export type { MarketingReward };

const MarketingRewardsRow = ({ row }: { row: MarketingReward }) => {
  const t = useTranslations('tables');
  const locale = useLocale();

  if (!row) {
    return <TablePrimaryRow />;
  }

  const transactionUrl = getExplorerUrl('tx', row.TxHash);

  return (
    <TablePrimaryRow>
      <TablePrimaryCell label={t('columns.datetime')}>
        <a className="text-inherit" href={transactionUrl} target="_blank" rel="noopener noreferrer">
          <HydrationSafeDateTime timestamp={row.TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.amountCst')}>{row.AmountEth.toFixed(2)}</TablePrimaryCell>
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
            <tr>
              <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">{t('columns.amountCst')}</TablePrimaryHeadCell>
            </tr>
          </TablePrimaryHead>
          <TablePrimaryBody>
            {currentItems.map((row) => (
              <MarketingRewardsRow key={row.EvtLogId} row={row} />
            ))}
          </TablePrimaryBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default MarketingRewardsTable;
