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
import type { NameHistoryRecord } from '@/services/api';

const NameHistoryRow = ({ record }: { record: NameHistoryRecord }) => {
  const t = useTranslations('tables');
  const locale = useLocale();

  if (!record) {
    return <TablePrimaryRow />;
  }

  const txUrl = getExplorerUrl('tx', record.TxHash);
  const displayName = record.TokenName || t('nameHistory.removed');

  return (
    <TablePrimaryRow>
      <TablePrimaryCell>
        <a href={txUrl} className="text-inherit" target="_blank" rel="noopener noreferrer">
          <HydrationSafeDateTime timestamp={record.TimeStamp} locale={locale} />
        </a>
      </TablePrimaryCell>
      <TablePrimaryCell>{displayName}</TablePrimaryCell>
    </TablePrimaryRow>
  );
};

const NameHistoryTable = ({ list }: { list: NameHistoryRecord[] }) => {
  const t = useTranslations('tables');
  const perPage = 5;
  const [page, setPage] = useState(1);

  const currentItems = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="left">
                {t('columns.dateTimeCompact')}
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="left">{t('columns.tokenName')}</TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {currentItems.map((record) => (
              <NameHistoryRow key={record.EvtLogId} record={record} />
            ))}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};

export default NameHistoryTable;
