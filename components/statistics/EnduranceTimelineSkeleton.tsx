import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

import { ChartReadout } from './charts/ChartReadout';
import { SERIES_COLOR } from './charts/theme';

/**
 * The Endurance timeline's lane grid. From `sm` the address sits in a column
 * beside its lane; on a phone it takes its own line above the lane, so the
 * plot spans the width. The end padding keeps a focused stint's ring clear
 * of the frame's edge.
 */
export const ENDURANCE_LANE_GRID =
  'grid grid-cols-1 gap-y-1 gap-x-3 pe-1 sm:grid-cols-[minmax(6.5rem,10rem)_minmax(0,1fr)] sm:gap-y-0';

/**
 * The Gantt's shape while the cycle's gestures load, `lanes` lanes tall, so
 * the frame does not jump when the real lanes arrive.
 */
export function EnduranceGanttSkeleton({ lanes }: { lanes: number }) {
  const t = useTranslations('common');
  return (
    <div role="status" aria-label={t('status.loading')} className="space-y-3">
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {[28, 24, 16, 20].map((width) => (
          <Skeleton key={width} className="h-4" style={{ width: `${width}%` }} />
        ))}
      </div>
      <div className={cn(ENDURANCE_LANE_GRID, 'border-b border-rule pb-2')}>
        <span className="hidden sm:block" />
        <span className="h-4" />
      </div>
      <div>
        {Array.from({ length: lanes }).map((_, lane) => (
          <div key={lane} className={cn(ENDURANCE_LANE_GRID, 'border-b border-rule-faint py-1.5')}>
            <Skeleton className="my-0.5 h-4 w-28 self-center" />
            <div className="relative min-h-6 rounded-edge bg-surface-sunken">
              <Skeleton
                className="absolute inset-y-1"
                style={{ left: `${(lane * 17) % 55}%`, width: `${12 + ((lane * 29) % 40)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="min-h-5" />
    </div>
  );
}

/**
 * The whole Endurance figure before anything is known (the embed before the
 * dashboard names the live cycle, the activity page while the chart's code
 * loads): the readout's labels, the view switch, `lanes` lanes and the note,
 * in the finished figure's order and spacing. Free of the charting library,
 * so a page can show it while the chart's own chunk loads.
 */
export function EnduranceTimelineSkeleton({ lanes = 8 }: { lanes?: number }) {
  const t = useTranslations('statistics');
  return (
    <div className="min-w-0 space-y-5">
      <ChartReadout
        items={[
          {
            id: 'endurance',
            label: t('charts.endurance.enduranceChampion'),
            value: null,
            caption: null,
            swatch: { color: SERIES_COLOR.endurance },
          },
          {
            id: 'chrono',
            label: t('charts.endurance.chronoWarrior'),
            value: null,
            caption: null,
            swatch: { color: SERIES_COLOR.chrono },
          },
          { id: 'lanes', label: t('charts.endurance.leaders'), value: null },
        ]}
      />
      <div aria-hidden className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <Skeleton className="h-10 w-44 rounded-control" />
        <Skeleton className="ms-auto h-8 w-32 rounded-control" />
      </div>
      <EnduranceGanttSkeleton lanes={Math.max(1, lanes)} />
      <p className="max-w-[var(--measure-prose)] type-caption text-subtle">
        {t('charts.endurance.note')}
      </p>
    </div>
  );
}
