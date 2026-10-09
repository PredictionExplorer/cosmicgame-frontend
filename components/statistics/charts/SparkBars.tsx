import { cn } from '@/lib/utils';

export interface SparkBarsProps {
  /** The values, oldest first. */
  values: readonly number[];
  /** What the bars show, for assistive technology ("Gestures per UTC day, last 30 days: …"). */
  label: string;
  /** The bar colour, a CSS colour (`SERIES_COLOR.gestures`). */
  color: string;
  /** Height in px. The width follows the container. */
  height?: number;
  /**
   * The last bucket is still filling (today): drawn as an outline over a
   * faint fill, so a partial day reads as partial rather than as a drop.
   */
  partialLast?: boolean;
  className?: string;
}

/**
 * SparkBars — a small, static bar strip for a trend next to a figure: one
 * bar per bucket, scaled to the largest, no axes. Plain SVG, so it costs no
 * chart library; the caller states the reading in words beside it (and in
 * `label`), because a sparkline alone is not an answer.
 */
export function SparkBars({
  values,
  label,
  color,
  height = 56,
  partialLast = false,
  className,
}: SparkBarsProps) {
  const max = Math.max(0, ...values);
  const count = values.length;
  const gap = count > 40 ? 0.15 : 0.25;
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${Math.max(count, 1)} ${height}`}
      preserveAspectRatio="none"
      className={cn('block w-full', className)}
      style={{ height }}
    >
      <line
        x1={0}
        x2={count}
        y1={height - 0.5}
        y2={height - 0.5}
        stroke="hsl(var(--rule))"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      {values.map((value, index) => {
        const barHeight = max > 0 ? Math.max(value > 0 ? 1.5 : 0, (value / max) * (height - 2)) : 0;
        const last = index === count - 1;
        const partial = last && partialLast;
        return (
          <rect
            key={index}
            x={index + gap / 2}
            y={height - 1 - barHeight}
            width={1 - gap}
            height={barHeight}
            fill={color}
            fillOpacity={partial ? 0.25 : last ? 1 : 0.72}
            stroke={partial ? color : undefined}
            strokeWidth={partial ? 1 : undefined}
            strokeDasharray={partial ? '2 2' : undefined}
            vectorEffect={partial ? 'non-scaling-stroke' : undefined}
            data-partial={partial || undefined}
          />
        );
      })}
    </svg>
  );
}
