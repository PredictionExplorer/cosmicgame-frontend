'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';

import { sameAddress } from '@/utils/format';
import { AddressChip } from '@/components/ui/address-chip';
import { DataTable, type DataTableColumn } from '@/components/ui/data-table';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import type { LedgerStateProps } from '@/components/tables/ledger-props';

interface EnduranceChampion {
  participant: string;
  championTime: number;
  chronoWarrior?: number;
}

interface ChampionsTableProps extends LedgerStateProps {
  /** `null` while the list is still being computed. */
  championList: EnduranceChampion[] | null;
  /** The latest gesture maker, whose endurance window is still growing. */
  lastBidderAddress?: string | null;
}

/** "Live": a value that is still changing, as a state dot and a word. */
function LiveState() {
  const t = useTranslations('tables');
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-flex items-center gap-1.5 rounded-edge bg-live-surface px-1.5 type-caption font-medium text-live">
        <span aria-hidden className="size-1.5 rounded-full bg-live" />
        {t('status.live')}
      </span>
      <InfoTooltip
        content={t('endurance.liveHelp')}
        label={t('status.live')}
        iconClassName="size-3.5"
      />
    </span>
  );
}

/**
 * Endurance windows by participant, longest first: each participant's
 * longest single hold as the latest gesture maker and their longest reign as
 * Endurance Champion. Both columns sort; a hold still growing is marked live.
 */
const EnduranceChampionsTable = ({
  championList,
  lastBidderAddress,
  ...state
}: ChampionsTableProps) => {
  const t = useTranslations('tables');

  const columns = useMemo<DataTableColumn<EnduranceChampion>[]>(
    () => [
      {
        id: 'participant',
        kind: 'address',
        header: t('columns.userAddress'),
        label: t('columns.participant'),
        value: (row) => row.participant,
        cell: (row) => (
          <span className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1">
            <AddressChip address={row.participant} variant="plain" showCopy={false} />
            {sameAddress(row.participant, lastBidderAddress) ? <LiveState /> : null}
          </span>
        ),
      },
      {
        id: 'championTime',
        kind: 'duration',
        header: t('endurance.championTime'),
        value: (row) => row.championTime,
        sortable: true,
      },
      {
        id: 'chronoWarrior',
        kind: 'duration',
        header: t('endurance.chronoWarrior'),
        value: (row) => row.chronoWarrior ?? 0,
        sortable: true,
      },
    ],
    [t, lastBidderAddress],
  );

  return (
    <DataTable
      data={championList ?? []}
      columns={columns}
      ariaLabel={t('names.enduranceChampions')}
      getRowKey={(row, index) => `${row.participant}-${index}`}
      initialSort={{ id: 'championTime', direction: 'desc' }}
      // Two durations ("9d 1h 36m 4s") beside an address do not fit a phone
      // row: each participant reads as a record.
      layout="cards"
      emptyTitle={t('empty.enduranceChampions')}
      {...state}
      loading={state.loading || championList === null}
    />
  );
};

export default EnduranceChampionsTable;
