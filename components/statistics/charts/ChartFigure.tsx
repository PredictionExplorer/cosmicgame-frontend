'use client';

import { useState, type ReactNode } from 'react';
import { Table2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { ChartReadout, type ReadoutItem } from './ChartReadout';
import { CHART_SURFACE_CLASS } from './theme';

export interface ChartFigureProps {
  /** Names the figure for assistive technology (usually its section's title). */
  label: string;
  /**
   * The chart's point in figures (`ChartReadout`), above the plot as the
   * figure's caption: its total, its peak, its record. Screen-reader and
   * keyboard users get the chart's point from it without exploring the plot.
   * Pass figures as `null` while they load, so the caption keeps its height.
   */
  readout?: readonly ReadoutItem[];
  /** A sentence under the readout, for a reading that is not a figure. */
  summary?: ReactNode;
  /** Options that change what the chart shows (an interval, a view), above the plot. */
  controls?: ReactNode;
  /** The chart's key (`ChartLegend`), under the plot. */
  legend?: ReactNode;
  /** A method or scope note under everything, in caption type. Two lines at most. */
  note?: ReactNode;
  /**
   * The same data as a table (`DataTable`). Adds a "View as table" switch
   * that shows it in place of the plot.
   */
  table?: ReactNode;
  /**
   * A loading, empty or error state that stands in for the plot, its legend
   * and the table switch.
   */
  state?: ReactNode;
  /**
   * The `state` is a placeholder for data on its way: the toolbar holds the
   * place of the "View as table" switch that arrives with the data, so the
   * plot does not move down (or the row wrap) when it does.
   */
  loading?: boolean;
  /**
   * Open on the table (the switch still shows the plot): for a series too
   * short to plot meaningfully (`MIN_PLOT_POINTS`), where a lone dot on a
   * full plot reads as a broken chart.
   */
  preferTable?: boolean;
  /** The plot. */
  children?: ReactNode;
  className?: string;
}

/**
 * ChartFigure — the frame every statistics chart sits in: its readout as the
 * caption, a toolbar (the chart's own options on the left, "View as table"
 * on the right), the plot or its table, the legend and a short note. No box:
 * the section around it is the frame.
 */
export function ChartFigure({
  label,
  readout,
  summary,
  controls,
  legend,
  note,
  table,
  state,
  loading = false,
  preferTable = false,
  children,
  className,
}: ChartFigureProps) {
  const t = useTranslations('statistics');
  // The reader's own choice wins; until they make one, the figure follows `preferTable`.
  const [choice, setChoice] = useState<boolean | null>(null);
  const asTable = choice ?? preferTable;
  const canSwitch = Boolean(table) && !state;
  const showTable = canSwitch && asTable;
  const hasReadout = Boolean(readout && readout.length > 0);

  return (
    <figure aria-label={label} className={cn('min-w-0 space-y-5', className)}>
      {hasReadout || summary ? (
        <figcaption className="space-y-3">
          {hasReadout ? <ChartReadout items={readout!} /> : null}
          {summary ? (
            <p className="max-w-[var(--measure-prose)] type-body-md text-muted-foreground">
              {summary}
            </p>
          ) : null}
        </figcaption>
      ) : null}
      {controls || canSwitch || loading ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {controls}
          {canSwitch || loading ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={asTable}
              onClick={() => setChoice(!asTable)}
              // While the data loads the switch holds its place unseen, so the row
              // wraps (or not) now, not when the data arrives.
              {...(canSwitch ? {} : { 'aria-hidden': true, tabIndex: -1, disabled: true })}
              className={cn('ms-auto', !canSwitch && 'invisible')}
            >
              <Table2 aria-hidden />
              {t('charts.viewTable')}
            </Button>
          ) : null}
        </div>
      ) : null}
      {state ?? (showTable ? table : <div className={CHART_SURFACE_CLASS}>{children}</div>)}
      {!state && !showTable ? legend : null}
      {note ? (
        <p className="max-w-[var(--measure-prose)] type-caption text-subtle">{note}</p>
      ) : null}
    </figure>
  );
}
