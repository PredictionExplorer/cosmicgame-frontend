import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/**
 * SectionEyebrow — the page kicker above an H1, as a quiet chip.
 *
 * The dot is a static mark of rhythm. It never pulses: motion on a dot is
 * reserved for `LiveStatus` while its data is actually live, and a pulsing
 * kicker on an archive or a signed-out page made every page look live.
 */

const dotVariants = cva('h-1.5 w-1.5 shrink-0 rounded-full', {
  variants: {
    tone: {
      aurora: 'bg-data-2',
      nebula: 'bg-data-1',
      solar: 'bg-data-3',
      impact: 'bg-data-5',
      rose: 'bg-data-4',
      muted: 'bg-subtle',
    },
  },
  defaultVariants: { tone: 'aurora' },
});

export interface SectionEyebrowProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>, VariantProps<typeof dotVariants> {
  children: React.ReactNode;
  /** Whether to show the leading colored dot. Defaults to true. */
  showDot?: boolean;
  /**
   * @deprecated Ignored: a kicker never pulses. Show live data with
   * `LiveStatus` (components/ui/live-status) instead.
   */
  pulse?: boolean;
}

export function SectionEyebrow({
  className,
  tone,
  showDot = true,
  pulse: _pulse,
  children,
  ...props
}: SectionEyebrowProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-pill border border-rule bg-surface/60 px-3 py-1',
        'type-eyebrow text-muted-foreground',
        className,
      )}
      {...props}
    >
      {showDot ? <span className={dotVariants({ tone })} aria-hidden /> : null}
      {children}
    </div>
  );
}

export { dotVariants };
