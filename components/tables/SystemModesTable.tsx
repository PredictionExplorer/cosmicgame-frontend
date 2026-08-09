import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import { Link, useRouter } from '@/i18n/navigation';
import { HydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { TABLE_ROW_LINK_CLASS } from '@/components/ui/responsive-table';
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
import type { SystemModeChangeEvent } from '@/services/api/types';

type EventRow = SystemModeChangeEvent;
export type { EventRow };

interface SystemModesRowProps {
  row: EventRow;
  prevRow: EventRow | null;
}

interface SystemModesTableProps {
  list: EventRow[];
}

const SystemModesRow = ({ row, prevRow }: SystemModesRowProps) => {
  const t = useTranslations('tables');
  const locale = useLocale();
  const router = useRouter();

  if (!row) return <TablePrimaryRow />;

  const eventHref = `/system-event/${row.RoundNum}/${row.EvtLogId}/${row.NextEvtLogId}`;

  const handleRowClick = () => {
    router.push(eventHref);
  };

  const scope = row.RoundNum
    ? t('allocation.cycle', { cycle: row.RoundNum })
    : t('status.deployment');

  return (
    <TablePrimaryRow onActivate={handleRowClick}>
      <TablePrimaryCell label={t('columns.round')} align="center">
        <Link
          href={eventHref}
          className={TABLE_ROW_LINK_CLASS}
          aria-label={t('systemModes.viewEvent', { scope })}
        >
          {row.RoundNum ? row.RoundNum : t('status.deployment')}
        </Link>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.started')} align="center">
        <HydrationSafeDateTime timestamp={row.TimeStamp} locale={locale} />
      </TablePrimaryCell>
      <TablePrimaryCell label={t('columns.ended')} align="center">
        {prevRow ? (
          <HydrationSafeDateTime timestamp={prevRow.TimeStamp} locale={locale} />
        ) : (
          t('status.currentlyActive')
        )}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

export const SystemModesTable = ({ list }: SystemModesTableProps) => {
  const t = useTranslations('tables');
  const perPage = 5;
  const [page, setPage] = useState<number>(1);

  if (list.length === 0) {
    return <p>{t('empty.modeChanges')}</p>;
  }

  const paginatedList = list.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <tr>
              <TablePrimaryHeadCell align="center">
                <TableHeaderHelp
                  desktop={t('columns.round')}
                  tooltip={t('statisticsTooltips.systemRound')}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                <TableHeaderHelp
                  desktop={t('columns.started')}
                  tooltip={t('statisticsTooltips.systemStarted')}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                <TableHeaderHelp
                  desktop={t('columns.ended')}
                  tooltip={t('statisticsTooltips.systemEnded')}
                />
              </TablePrimaryHeadCell>
            </tr>
          </TablePrimaryHead>
          <TablePrimaryBody>
            {paginatedList.map((row, i) => {
              const globalIndex = (page - 1) * perPage + i;
              const prevRow = globalIndex > 0 ? (list[globalIndex - 1] ?? null) : null;

              return <SystemModesRow key={row.EvtLogId} row={row} prevRow={prevRow} />;
            })}
          </TablePrimaryBody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
