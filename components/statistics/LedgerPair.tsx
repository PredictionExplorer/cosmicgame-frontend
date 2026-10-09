import type { ReactNode } from 'react';

import { DataTableWidth } from '@/components/ui/data-table';
import { cn } from '@/lib/utils';

/** The rhythm between stacked statistics sections, shared with the panels around a pair. */
const STACK_CLASS = 'min-w-0 space-y-12 sm:space-y-16';

/**
 * Two stacks of short ledgers side by side from 1280px, one above the other
 * below it. A short ledger alone stops at the 56rem reading width, which left
 * a wide screen's statistics page with a 384px dead band beside every ledger
 * under full-width section rules; paired, each ledger fills its half and the
 * page keeps one right edge, the section rules included. The tables fill
 * their stack at every width (`DataTableWidth value="fill"`), and each stack
 * keeps the page's section rhythm.
 */
export function LedgerPair({
  start,
  end,
  className,
}: {
  /** The first stack: on the left from 1280px, first below it. */
  start: ReactNode;
  /** The second stack: on the right from 1280px, second below it. */
  end: ReactNode;
  className?: string;
}) {
  return (
    <DataTableWidth value="fill">
      <div
        data-testid="ledger-pair"
        className={cn('grid gap-12 sm:gap-16 xl:grid-cols-2 xl:items-start xl:gap-x-12', className)}
      >
        <div className={STACK_CLASS}>{start}</div>
        {/* Stacked, the second stack follows the first like any section: its
            first section drops its own rule as a first child, so the stack
            draws it (SectionShell's rule and spacing) until the two sit side
            by side. */}
        <div
          className={cn(
            STACK_CLASS,
            'max-xl:border-t max-xl:border-rule max-xl:pt-8 sm:max-xl:pt-10',
          )}
        >
          {end}
        </div>
      </div>
    </DataTableWidth>
  );
}
