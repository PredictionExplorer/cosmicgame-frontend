import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * Skeleton — shimmer-based placeholder. Drop-in replacement for the old
 * `animate-pulse` rectangle; specialized variants mimic real layouts so
 * loading states don't feel generic.
 */

const skeletonVariants = cva(
  // Base keeps `animate-pulse` for backward-compat — many tests + screenshot
  // checks key off that class. The shimmer runs on a ::before pseudo-element,
  // so the two animations coexist without fighting each other.
  'relative overflow-hidden rounded-md bg-white/[0.04] animate-pulse motion-reduce:before:hidden',
  {
    variants: {
      shine: {
        true: "before:absolute before:inset-0 before:animate-shimmer before:content-[''] before:bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.06)_40%,rgba(255,255,255,0.10)_50%,rgba(255,255,255,0.06)_60%,transparent_100%)] before:bg-[length:200%_100%]",
        false: '',
      },
    },
    defaultVariants: { shine: true },
  },
);

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, shine, ...props }, ref) => (
    <div ref={ref} aria-hidden className={cn(skeletonVariants({ shine }), className)} {...props} />
  ),
);
Skeleton.displayName = 'Skeleton';

export function SkeletonText({
  lines = 3,
  lastLineWidth = '66%',
  className,
}: {
  lines?: number;
  lastLineWidth?: string;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)} role="status" aria-label="Loading text">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{ width: i === lines - 1 ? lastLineWidth : '100%' }}
        />
      ))}
    </div>
  );
}

export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-card)] border border-white/[0.06] bg-white/[0.03] p-4',
        className,
      )}
      role="status"
      aria-label="Loading stat"
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>
      <Skeleton className="mt-3 h-7 w-2/3" />
      <Skeleton className="mt-2 h-2.5 w-1/3" />
    </div>
  );
}

export function SkeletonTableRow({ cols = 4, className }: { cols?: number; className?: string }) {
  return (
    <div
      className={cn('flex items-center gap-4 border-b border-white/[0.04] px-4 py-3', className)}
      role="status"
      aria-label="Loading row"
    >
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className="h-3" style={{ width: `${100 / cols - 4}%`, flexShrink: 0 }} />
      ))}
    </div>
  );
}

export function SkeletonNFTCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-[var(--radius-card)] border border-white/[0.06] bg-white/[0.03]',
        className,
      )}
      role="status"
      aria-label="Loading NFT"
    >
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export { skeletonVariants };
