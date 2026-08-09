import { useMemo, useState, type FC } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { formatSeconds } from '@/utils';

import {
  TablePrimaryContainer,
  TablePrimaryBody,
  TablePrimaryCell,
  TablePrimaryHead,
  TablePrimaryRow,
  TablePrimary,
  TablePrimaryHeadCell,
} from '@/components/styled';
import { CustomPagination } from '@/components/common/CustomPagination';
import { AddressLink } from '@/components/common/AddressLink';
import { InfoTooltip } from '@/components/ui/info-tooltip';

interface EnduranceChampion {
  participant: string;
  championTime: number;
  chronoWarrior?: number;
}

interface ChampionRowProps {
  row: EnduranceChampion;
  isLive?: boolean;
}

const EnduranceChampionsRow: FC<ChampionRowProps> = ({ row, isLive = false }) => {
  const t = useTranslations('tables');
  const locale = useLocale();

  if (!row) {
    return <TablePrimaryRow />;
  }

  return (
    <TablePrimaryRow>
      <TablePrimaryCell label={t('columns.userAddress')} align="left">
        <div className="flex flex-wrap items-center gap-2">
          <AddressLink address={row.participant} url={`/user/${row.participant}`} />
          {isLive && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
              {t('status.live')}
              <InfoTooltip content={t('endurance.liveHelp')} />
            </span>
          )}
        </div>
      </TablePrimaryCell>
      <TablePrimaryCell label={t('endurance.championTime')} align="center">
        {formatSeconds(row.championTime, locale)}
      </TablePrimaryCell>
      <TablePrimaryCell label={t('endurance.chronoWarrior')} align="center">
        {formatSeconds(row.chronoWarrior || 0, locale)}
      </TablePrimaryCell>
    </TablePrimaryRow>
  );
};

interface ChampionsTableProps {
  championList: EnduranceChampion[] | null;
  lastBidderAddress?: string | null;
}

const SortIcon = ({
  field,
  sortField,
  sortDirection,
}: {
  field: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}) => {
  if (field !== sortField) return <ArrowUpDown className="ml-1 h-4 w-4 inline" />;
  return sortDirection === 'asc' ? (
    <ArrowUp className="ml-1 h-4 w-4 inline" />
  ) : (
    <ArrowDown className="ml-1 h-4 w-4 inline" />
  );
};

function sameAddress(left: string | null | undefined, right: string | null | undefined): boolean {
  return !!left && !!right && left.toLowerCase() === right.toLowerCase();
}

const EnduranceChampionsTable: FC<ChampionsTableProps> = ({ championList, lastBidderAddress }) => {
  const t = useTranslations('tables');
  const [sortField, setSortField] = useState<'championTime' | 'chronoWarrior'>('championTime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const perPage = 5;

  const handleSort = (field: 'championTime' | 'chronoWarrior') => {
    if (field === sortField) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const paginatedList = useMemo(() => {
    if (!championList) {
      return [];
    }

    const sortedList = [...championList].sort((a, b) => {
      return sortDirection === 'asc'
        ? (a[sortField] ?? 0) - (b[sortField] ?? 0)
        : (b[sortField] ?? 0) - (a[sortField] ?? 0);
    });

    const startIndex = (page - 1) * perPage;
    return sortedList.slice(startIndex, startIndex + perPage);
  }, [championList, sortField, sortDirection, page, perPage]);

  if (!championList) {
    return <p>{t('status.loading')}</p>;
  }

  if (championList.length === 0) {
    return <p>{t('empty.enduranceChampions')}</p>;
  }

  return (
    <>
      <TablePrimaryContainer>
        <TablePrimary>
          <TablePrimaryHead>
            <tr>
              <TablePrimaryHeadCell align="left">{t('columns.userAddress')}</TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                <button
                  className="inline-flex items-center font-inherit cursor-pointer bg-transparent border-0 text-inherit"
                  onClick={() => handleSort('championTime')}
                >
                  {t('endurance.championTime')}
                  <SortIcon
                    field="championTime"
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                </button>
              </TablePrimaryHeadCell>
              <TablePrimaryHeadCell align="center">
                <button
                  className="inline-flex items-center font-inherit cursor-pointer bg-transparent border-0 text-inherit"
                  onClick={() => handleSort('chronoWarrior')}
                >
                  {t('endurance.chronoWarrior')}
                  <SortIcon
                    field="chronoWarrior"
                    sortField={sortField}
                    sortDirection={sortDirection}
                  />
                </button>
              </TablePrimaryHeadCell>
            </tr>
          </TablePrimaryHead>
          <TablePrimaryBody>
            {paginatedList.map((row, index) => (
              <EnduranceChampionsRow
                key={`${row.participant}-${index}-${page}`}
                row={row}
                isLive={sameAddress(row.participant, lastBidderAddress)}
              />
            ))}
          </TablePrimaryBody>
        </TablePrimary>
      </TablePrimaryContainer>
      {championList.length > perPage && (
        <CustomPagination
          page={page}
          setPage={setPage}
          totalLength={championList.length}
          perPage={perPage}
        />
      )}
    </>
  );
};

export default EnduranceChampionsTable;
