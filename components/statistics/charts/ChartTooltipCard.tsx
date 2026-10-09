import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { LegendSwatch, type LegendShape } from './ChartLegend';

export interface ChartTooltipRow {
  key: string;
  label: ReactNode;
  value: ReactNode;
  /** The series colour, drawn as the row's key. */
  color?: string;
  shape?: LegendShape;
}

/**
 * The hover card of every statistics chart: a title (the point's date or
 * position), label and value rows with tabular figures, and an optional
 * footer line. Pass it as Recharts' `<Tooltip content>` from a small adapter
 * that maps the hovered point to rows.
 */
export function ChartTooltipCard({
  title,
  rows,
  footer,
  className,
}: {
  title: ReactNode;
  rows: readonly ChartTooltipRow[];
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'min-w-44 max-w-72 rounded-control border border-rule bg-surface-raised px-3 py-2.5 shadow-float',
        className,
      )}
    >
      <p className="type-label text-foreground">{title}</p>
      {rows.length > 0 ? (
        <dl className="mt-2 space-y-1">
          {rows.map((row) => (
            <div key={row.key} className="flex items-center justify-between gap-6 type-body-sm">
              <dt className="flex min-w-0 items-center gap-2 text-muted-foreground">
                {row.color ? <LegendSwatch color={row.color} shape={row.shape} /> : null}
                {row.label}
              </dt>
              <dd className="shrink-0 tabular-nums text-foreground">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {footer ? (
        <p className="mt-2 border-t border-rule-faint pt-2 type-caption text-subtle">{footer}</p>
      ) : null}
    </div>
  );
}
