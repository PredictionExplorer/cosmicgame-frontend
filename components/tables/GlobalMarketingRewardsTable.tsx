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
import { AddressLink } from '@/components/common/AddressLink';
import type { MarketingReward } from '@/services/api/types';

export type { MarketingReward };

const GlobalMarketingRewardsRow = ({ row }: { row: MarketingReward }) => {
  const t = useTranslations('tables');
  const locale = useLocale();
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell label={t('columns.datetime')}>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', row.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HydrationSafeDateTime timestamp={row.TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.outreachContributor')} align="center">
        <AddressLink address={row.MarketerAddr} url={`/marketing/${row.MarketerAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.amount')} align="right">
        {row.AmountEth.toFixed(2)} CST
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const GlobalMarketingRewardsTable = ({ list }: { list: MarketingReward[] }) => {
  const t = useTranslations('tables');
  const perPage = 5;
  const [page, setPage] = useState(1);

  if (list.length === 0) {
    return <p>{t('empty.allocations')}</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <tr>
              <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('columns.outreachContributor')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">{t('columns.amount')}</TablePrimaryHeadCell>
            </tr>
          </TablePrimaryHead>
          <TablePrimaryBody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <GlobalMarketingRewardsRow row={row} key={row.EvtLogId} />
            ))}
          </TablePrimaryBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
