import { PageHeaderFigures, type PageHeaderFigure } from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';

/**
 * FigureStrip — the page header's figure row inside a section body (a
 * section's own totals above its ledger), drawn exactly as the header draws
 * it. The header's row carries margins that fit it to the header's rule; in
 * a section those margins would cancel the stack's gap and set the figures
 * on the heading or table below. The strip sits in its own block formatting
 * context (`flow-root`), which keeps them inside it: the parent's stack sets
 * the space around the strip, as around every other block.
 */
export function FigureStrip({
  figures,
  className,
}: {
  figures: readonly PageHeaderFigure[];
  className?: string;
}) {
  return (
    <div className={cn('flow-root', className)}>
      <PageHeaderFigures figures={figures} className="mt-0 sm:mt-0" />
    </div>
  );
}
