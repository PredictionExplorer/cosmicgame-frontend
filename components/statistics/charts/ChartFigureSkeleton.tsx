import { Skeleton, SkeletonChart } from '@/components/ui/skeleton';

import { ChartReadout } from './ChartReadout';

/**
 * A `ChartFigure` while its chart's code loads: the readout's figures, the
 * toolbar, the plot at its height and the note, in the finished figure's
 * order and spacing, so the page does not move when the chart replaces it.
 * Free of the charting library (a `next/dynamic` loading fallback).
 */
export function ChartFigureSkeleton({
  figures,
  height,
  captions = false,
}: {
  /** How many readout figures the chart shows. */
  figures: number;
  /** The plot's height, px. */
  height: number;
  /** Whether the figures carry a caption line. */
  captions?: boolean;
}) {
  return (
    <div className="min-w-0 space-y-5">
      <ChartReadout
        items={Array.from({ length: figures }, (_, index) => ({
          id: String(index),
          label: <Skeleton as="span" shine={false} className="my-1 block h-2.5 w-16" />,
          value: null,
          caption: captions ? null : undefined,
        }))}
      />
      <div aria-hidden className="flex min-h-11 flex-wrap items-center gap-x-6 gap-y-3 sm:min-h-9">
        <Skeleton shine={false} className="h-9 w-40 rounded-control" />
      </div>
      <SkeletonChart height={height} bars={18} />
    </div>
  );
}
