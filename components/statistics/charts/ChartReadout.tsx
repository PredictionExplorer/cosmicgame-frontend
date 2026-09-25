import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

import { LegendSwatch, type LegendShape } from './ChartLegend';

export interface ReadoutItem {
  id: string;
  label: ReactNode;
  /** The figure. `null` while it loads: a placeholder one figure line tall holds its place. */
  value: ReactNode | null;
  /**
   * A qualifier under the figure ("Aug 12, 2026", "41% of gestures"). `null`
   * while it loads (a placeholder line); leave it out for a figure without one.
   */
  caption?: ReactNode | null;
  /** The series this figure reads, so the readout doubles as the chart's key. */
  swatch?: { color: string; shape?: LegendShape };
}

/**
 * ChartReadout — a chart's point in figures, above the plot: each figure in
 * `type-figure-md` under its `type-label` label, with a caption for its date
 * or share. Several figures read at a glance, where a sentence buried them
 * in running text. A `<dl>`, so a screen reader hears each label with its
 * figure; it sits in the figure's caption, so it also names what the plot
 * shows. Figures that load keep their line's height, so nothing below moves
 * when they arrive.
 */
export function ChartReadout({
  items,
  className,
}: {
  items: readonly ReadoutItem[];
  className?: string;
}) {
  return (
    <dl className={cn('flex flex-wrap gap-x-10 gap-y-4', className)}>
      {items.map((item) => (
        <div key={item.id} className="min-w-0 max-w-full">
          <dt className="flex items-center gap-2 type-label text-subtle">
            {item.swatch ? (
              <LegendSwatch color={item.swatch.color} shape={item.swatch.shape} />
            ) : null}
            {item.label}
          </dt>
          <dd className="type-figure-md text-foreground">
            {item.value ?? (
              <span aria-hidden className="flex h-[1lh] items-center">
                <Skeleton as="span" className="block h-5 w-20" />
              </span>
            )}
          </dd>
          {item.caption === null ? (
            <dd aria-hidden className="flex h-[1.45em] items-center type-caption">
              <Skeleton as="span" className="block h-2.5 w-24" />
            </dd>
          ) : item.caption ? (
            <dd className="max-w-[40ch] type-caption text-subtle">{item.caption}</dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
