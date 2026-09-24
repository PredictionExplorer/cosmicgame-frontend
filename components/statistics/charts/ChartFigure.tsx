'use client';

import { useState, type ReactNode } from 'react';
import { Table2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { CHART_SURFACE_CLASS } from './theme';

export interface ChartFigureProps {
  /** Names the figure for assistive technology (usually its section's title). */
  label: string;
  /**
   * One sentence that reads the chart (its peak, latest value or trend),
   * shown above it as the figure's caption. Screen-reader and keyboard users
   * get the chart's point from it without exploring the plot.
   */
  summary?: ReactNode;
  /** Options that change what the chart shows (an interval, a view), above the plot. */
  controls?: ReactNode;
  /** The chart's key (`ChartLegend`), under the plot. */
  legend?: ReactNode;
  /** A method or scope note under everything, in caption type. */
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
 * ChartFigure — the frame every statistics chart sits in: the one-line
 * reading as its caption, a toolbar (the chart's own options on the left,
 * "View as table" on the right), the plot or its table, the legend and a
 * note. No box: the section around it is the frame.
 */
export function ChartFigure({
  label,
  summary,
  controls,
  legend,
  note,
  table,
  state,
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

  return (
    <figure aria-label={label} className={cn('min-w-0 space-y-4', className)}>
      {summary ? (
        <figcaption className="max-w-[var(--measure-prose)] type-body-md text-muted-foreground">
          {summary}
        </figcaption>
      ) : null}
      {controls || canSwitch ? (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {controls}
          {canSwitch ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={asTable}
              onClick={() => setChoice(!asTable)}
              className="ms-auto"
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
