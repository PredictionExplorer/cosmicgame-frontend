import { useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import { useLocale, useTranslations } from 'next-intl';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { getExplorerUrl } from '@/utils';

import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
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
import type { MarketingReward } from '@/services/api/types';

export type { MarketingReward };

const GlobalMarketingRewardsRow = ({ row }: { row: MarketingReward }) => {
  const locale = useLocale();
  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a
          className="text-inherit"
          href={getExplorerUrl('tx', row.TxHash)}
          target="_blank"
          rel="noopener noreferrer"
        >
          <HydrationSafeDateTime timestamp={row.TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        <AddressLink address={row.MarketerAddr} url={`/marketing/${row.MarketerAddr}`} />
      </TablePrimaryCell>
      <TablePrimaryCell align="right">{row.AmountEth.toFixed(2)} CST</TablePrimaryCell>
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
            <Tr>
              <TablePrimaryHeadCell align="left">{t('columns.datetime')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell>{t('columns.outreachContributor')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="right">{t('columns.amount')}</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {list.slice((page - 1) * perPage, page * perPage).map((row) => (
              <GlobalMarketingRewardsRow row={row} key={row.EvtLogId} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
