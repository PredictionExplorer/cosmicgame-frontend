import type { CSSProperties } from 'react';

import { cn } from '@/lib/utils';

/** How a series draws, so its legend key looks like its mark. */
export type LegendShape = 'dot' | 'square' | 'line' | 'dash' | 'ring';

export interface LegendItem {
  key: string;
  label: string;
  /** A CSS colour (use `SERIES_COLOR` or a method colour). */
  color: string;
  shape?: LegendShape;
}

/** The key of one series: a dot, a square, a stroke, a dashed stroke or an outlined square. */
export function LegendSwatch({
  color,
  shape = 'square',
  className,
}: {
  color: string;
  shape?: LegendShape;
  className?: string;
}) {
  const style: CSSProperties =
    shape === 'line'
      ? { borderTop: `2px solid ${color}` }
      : shape === 'dash'
        ? { borderTop: `2px dashed ${color}` }
        : shape === 'ring'
          ? { boxShadow: `inset 0 0 0 1.5px ${color}` }
          : { backgroundColor: color };
  return (
    <span
      aria-hidden
      className={cn(
        'inline-block shrink-0',
        shape === 'line' || shape === 'dash'
          ? 'h-0 w-4'
          : shape === 'dot'
            ? 'size-2.5 rounded-pill'
            : 'size-2.5 rounded-edge',
        className,
      )}
      style={style}
    />
  );
}

/**
 * ChartLegend — the one legend for every statistics chart: a wrapping row of
 * keys in caption type, each drawn like its series. Recharts' own legend is
 * not used, so every chart's key looks the same.
 */
export function ChartLegend({
  items,
  className,
}: {
  items: readonly LegendItem[];
  className?: string;
}) {
  return (
    <ul
      className={cn(
        'flex flex-wrap gap-x-5 gap-y-1.5 type-caption text-muted-foreground',
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.key} className="inline-flex items-center gap-2">
          <LegendSwatch color={item.color} shape={item.shape} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
