import { useState } from 'react';
import { Tr } from 'react-super-responsive-table';
import { useTranslations } from 'next-intl';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { convertTimestampToDateTime } from '@/utils';
import { statisticsCopy } from '@/content/statistics-copy';

import { useRouter } from '@/i18n/navigation';
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
  const router = useRouter();

  if (!row) return <TablePrimaryRow />;

  const handleRowClick = () => {
    router.push(`/system-event/${row.RoundNum}/${row.EvtLogId}/${row.NextEvtLogId}`);
  };

  return (
    <TablePrimaryRow className="cursor-pointer" onClick={handleRowClick}>
      <TablePrimaryCell align="center">
        {row.RoundNum ? row.RoundNum : t('status.deployment')}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {convertTimestampToDateTime(row.TimeStamp)}
      </TablePrimaryCell>
      <TablePrimaryCell align="center">
        {prevRow ? convertTimestampToDateTime(prevRow.TimeStamp) : t('status.currentlyActive')}
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
          <colgroup>
            <col width="25%" />
            <col width="33%" />
            <col width="33%" />
          </colgroup>
          <TablePrimaryHead>
            <Tr>
              <TablePrimaryHeadCell align="center">
                <TableHeaderHelp
                  desktop={t('columns.round')}
                  tooltip={statisticsCopy.tables.systemRound}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                <TableHeaderHelp
                  desktop={t('columns.started')}
                  tooltip={statisticsCopy.tables.systemStarted}
                />
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                <TableHeaderHelp
                  desktop={t('columns.ended')}
                  tooltip={statisticsCopy.tables.systemEnded}
                />
              </TablePrimaryHeadCell>
            </Tr>
          </TablePrimaryHead>
          <tbody>
            {paginatedList.map((row, i) => {
              const globalIndex = (page - 1) * perPage + i;
              const prevRow = globalIndex > 0 ? (list[globalIndex - 1] ?? null) : null;

              return <SystemModesRow key={row.EvtLogId} row={row} prevRow={prevRow} />;
            })}
          </tbody>
        </TablePrimary>
      </TablePrimaryContainer>
      <CustomPagination page={page} setPage={setPage} totalLength={list.length} perPage={perPage} />
    </>
  );
};
