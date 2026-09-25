import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';

/**
 * Skeleton — the placeholder a layout shows while its data loads.
 *
 * Every composite below mirrors the shape of what it stands in for (a
 * figure row, a spec sheet, a ledger, an art plate, a chart) at that
 * layout's real height, so nothing jumps when the data arrives: a one-line
 * "Loading…" panel replaced by a 700px table moved the footer and measured
 * a CLS of 0.22.
 *
 * Composites announce themselves once as a polite status: the region holds
 * its label as visually hidden text, since a live region speaks its content,
 * not its accessible name (the bars are all hidden). Inside a page skeleton
 * that already announces, pass `announce={false}` so a screen reader hears
 * "Loading" once, not once per block. Every bar carries
 * `data-slot="skeleton"`, the hook for tests and checks.
 */

const skeletonVariants = cva(
  // One motion: the shimmer on ::before. Under reduced motion it stays still.
  'relative overflow-hidden rounded-edge bg-muted/70 motion-reduce:before:hidden',
  {
    variants: {
      shine: {
        true: "before:absolute before:inset-0 before:animate-shimmer before:content-[''] before:bg-[linear-gradient(90deg,transparent_0%,hsl(var(--foreground)/0.05)_40%,hsl(var(--foreground)/0.08)_50%,hsl(var(--foreground)/0.05)_60%,transparent_100%)] before:bg-[length:200%_100%]",
        false: '',
      },
    },
    defaultVariants: { shine: true },
  },
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {
  /**
   * `span` where the placeholder sits in phrasing content, such as a count
   * inside a tab's button (a `div` is not allowed there). Pass `inline-block`.
   */
  as?: 'div' | 'span';
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ as = 'div', className, shine, ...props }, ref) =>
    as === 'span' ? (
      <span
        aria-hidden
        data-slot="skeleton"
        className={cn(skeletonVariants({ shine }), className)}
        {...(props as React.HTMLAttributes<HTMLSpanElement>)}
      />
    ) : (
      <div
        ref={ref}
        aria-hidden
        data-slot="skeleton"
        className={cn(skeletonVariants({ shine }), className)}
        {...props}
      />
    ),
);
Skeleton.displayName = 'Skeleton';

interface CompositeProps {
  className?: string;
  /** Set to false inside a skeleton that already announces loading. */
  announce?: boolean;
}

/**
 * The status wrapper every composite shares: a polite live region whose
 * spoken content is its label (visually hidden text, the same pattern as the
 * page skeletons' `LoadingRegion`), and whose name is that same text.
 */
function SkeletonRegion({
  label,
  announce = true,
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { label: string; announce?: boolean }) {
  const labelId = React.useId();
  if (!announce) {
    return (
      <div aria-hidden className={className} {...props}>
        {children}
      </div>
    );
  }
  return (
    <div role="status" aria-busy="true" aria-labelledby={labelId} className={className} {...props}>
      <span id={labelId} className="sr-only">
        {label}
      </span>
      {children}
    </div>
  );
}

export function SkeletonText({
  lines = 3,
  lastLineWidth = '66%',
  className,
  announce,
}: CompositeProps & { lines?: number; lastLineWidth?: string }) {
  const t = useTranslations('tables');

  return (
    <SkeletonRegion
      label={t('skeleton.loadingText')}
      announce={announce}
      className={cn('space-y-2.5', className)}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{ width: i === lines - 1 ? lastLineWidth : '100%' }}
        />
      ))}
    </SkeletonRegion>
  );
}

/**
 * A figure strip placeholder (PageHeaderFigures): a label over a figure in
 * each column, on the page ground with no card around it.
 */
export function SkeletonFigures({
  count = 4,
  className,
  announce,
}: CompositeProps & { count?: number }) {
  const t = useTranslations('tables');
  return (
    <SkeletonRegion
      label={t('skeleton.loadingStat')}
      announce={announce}
      className={cn('grid grid-cols-2 gap-x-8 gap-y-6 lg:grid-cols-4', className)}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="min-w-0">
          <Skeleton shine={false} className="h-3 w-24" />
          <Skeleton className="mt-2.5 h-8 w-2/3" />
        </div>
      ))}
    </SkeletonRegion>
  );
}

/**
 * A ledger placeholder at the finished table's row height: a header rule and
 * `rows` rows from `sm`, and the spec-sheet cards the table becomes on a phone.
 */
export function SkeletonTable({
  rows = 8,
  columns = 4,
  className,
  announce,
}: CompositeProps & { rows?: number; columns?: number }) {
  const t = useTranslations('tables');
  const widths = ['w-24', 'w-16', 'w-20', 'w-14', 'w-28', 'w-12'];

  return (
    <SkeletonRegion
      label={t('skeleton.loadingRows')}
      announce={announce}
      className={cn('min-w-0', className)}
    >
      <div className="hidden sm:block">
        <div className="flex h-10 items-center gap-6 border-b border-rule px-4">
          {Array.from({ length: columns }).map((_, i) => (
            <div key={i} className={cn('flex-1', i > 0 && 'flex justify-end')}>
              <Skeleton shine={false} className={cn('h-3', widths[i % widths.length])} />
            </div>
          ))}
        </div>
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="flex min-h-[var(--row-h)] items-center gap-6 border-b border-rule-faint px-4"
          >
            {Array.from({ length: columns }).map((__, i) => (
              <div key={i} className={cn('flex-1', i > 0 && 'flex justify-end')}>
                <Skeleton className={cn('h-3.5', widths[(i + row) % widths.length])} />
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="space-y-3 sm:hidden">
        {Array.from({ length: Math.min(rows, 4) }).map((_, card) => (
          <div key={card} className="rounded-surface border border-rule-faint p-4">
            {Array.from({ length: Math.min(columns, 4) }).map((__, i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 border-b border-rule-faint py-2.5 last:border-b-0"
              >
                <Skeleton shine={false} className="h-3 w-20" />
                <Skeleton className={cn('h-3.5', widths[(i + card) % widths.length])} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </SkeletonRegion>
  );
}

/** Spec-sheet rows (label left, value right) at the ledger row height. */
export function SkeletonDetailRows({
  rows = 4,
  className,
  announce,
}: CompositeProps & { rows?: number }) {
  const t = useTranslations('tables');
  const valueWidths = ['w-40', 'w-28', 'w-48', 'w-32', 'w-24'];
  return (
    <SkeletonRegion
      label={t('skeleton.loadingRows')}
      announce={announce}
      className={cn('divide-y divide-rule-faint', className)}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex min-h-[var(--row-h)] items-center justify-between gap-6 py-3">
          <Skeleton shine={false} className="h-3 w-24 shrink-0" />
          <Skeleton className={cn('h-3.5 max-w-[60%]', valueWidths[i % valueWidths.length])} />
        </div>
      ))}
    </SkeletonRegion>
  );
}

/** A page header placeholder: breadcrumb, H1 and a one-sentence lede. */
export function SkeletonPageHeader({
  breadcrumb = true,
  lede = true,
  className,
}: {
  breadcrumb?: boolean;
  lede?: boolean;
  className?: string;
}) {
  return (
    <div aria-hidden className={cn('mb-10', className)}>
      {breadcrumb ? <Skeleton shine={false} className="mb-6 h-3.5 w-44" /> : null}
      <Skeleton className="h-10 w-3/4 max-w-md sm:h-12" />
      {lede ? (
        <div className="mt-5 max-w-[var(--measure-lede)] space-y-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : null}
    </div>
  );
}

/** The art plate at the native ratio, on the pure black ground. */
export function SkeletonArtPlate({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        'relative aspect-art w-full overflow-hidden rounded-edge bg-art-ground shadow-[var(--art-edge)]',
        className,
      )}
    >
      <Skeleton className="absolute inset-0 rounded-none bg-foreground/[0.03]" />
    </div>
  );
}

/** A chart placeholder at the chart's own height: gridlines and rising bars. */
export function SkeletonChart({
  height = 280,
  bars = 14,
  className,
  announce,
}: CompositeProps & { height?: number; bars?: number }) {
  const t = useTranslations('common');
  return (
    <SkeletonRegion
      label={t('status.loading')}
      announce={announce}
      className={cn('relative flex items-end gap-1.5 border-b border-rule px-2 pt-6', className)}
      style={{ height }}
    >
      <div className="pointer-events-none absolute inset-x-0 top-1/3 border-t border-rule-faint" />
      <div className="pointer-events-none absolute inset-x-0 top-2/3 border-t border-rule-faint" />
      {Array.from({ length: bars }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-b-none"
          style={{ height: `${28 + ((i * 37) % 60)}%` }}
        />
      ))}
    </SkeletonRegion>
  );
}

/** A gallery card placeholder: the art plate and its wall label. */
export function SkeletonNFTCard({ className, announce }: CompositeProps) {
  const t = useTranslations('tables');

  return (
    <SkeletonRegion
      label={t('skeleton.loadingNft')}
      announce={announce}
      className={cn('overflow-hidden rounded-surface', className)}
    >
      <SkeletonArtPlate />
      <div className="space-y-2 px-1 pt-3">
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton shine={false} className="h-3 w-1/3" />
      </div>
    </SkeletonRegion>
  );
}

export { skeletonVariants };
