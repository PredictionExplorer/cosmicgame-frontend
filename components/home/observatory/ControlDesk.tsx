'use client';

import type { ReactNode } from 'react';
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AllocationIcon } from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';

export interface ControlDeskProps {
  header: ReactNode;
  clock: ReactNode;
  calibration?: ReactNode;
  standings: ReactNode;
  gestureConsole?: ReactNode;
  orientation?: ReactNode;
  allocationLedger: ReactNode;
  className?: string;
}

/** One region frame: a hairline on a faint surface, the only bordered level of its region. */
const FRAME = 'rounded-surface border border-rule-faint bg-surface/60';

/**
 * The decision desk.
 *
 * From 1024px: row 1 is the Cycle column (clock, Signature Allocation and
 * Calibration Window; 5 of 12) beside the Standings Ledger (7 of 12); row 2
 * is the gesture form, full width, on the page's one quiet surface. From 768
 * to 1023px it is one column in the same order, so a tablet never splits into
 * cramped columns. On phones the form moves up under the clock, where a
 * thumb reaches it first, and the standings and the Calibration Window follow.
 * The frames are the only bordered level; inside them, space and hairlines.
 */
export const ControlDesk = forwardRef<HTMLDivElement, ControlDeskProps>(
  (
    {
      header,
      clock,
      calibration,
      standings,
      gestureConsole,
      orientation,
      allocationLedger,
      className,
    },
    ref,
  ) => {
    const t = useTranslations('home');
    return (
      <div data-testid="control-desk" className={cn('min-w-0', className)}>
        <div id="deck" ref={ref} className="scroll-mt-24">
          <div data-testid="control-desk-header">{header}</div>
          <div
            data-testid="control-desk-grid"
            className="mt-5 grid min-w-0 gap-4 md:gap-5 lg:mt-4 lg:grid-cols-12 lg:gap-5"
          >
            {/* The Cycle column. Below 1024px it dissolves (display: contents)
                so its two parts can take their own places in the page order. */}
            <div
              data-testid="control-desk-cycle"
              className="contents lg:col-span-5 lg:flex lg:flex-col lg:rounded-surface lg:border lg:border-rule-faint lg:bg-surface/60 lg:p-5 xl:p-6"
            >
              <div
                data-testid="control-desk-clock"
                className={cn(
                  'min-w-0 p-5 max-md:order-1 sm:p-6 lg:border-0 lg:bg-transparent lg:p-0',
                  FRAME,
                  'lg:rounded-none',
                )}
              >
                {clock}
              </div>
              {calibration && (
                <div
                  data-testid="control-desk-calibration"
                  className={cn(
                    'min-w-0 p-5 max-md:order-4 sm:p-6 lg:mt-4 lg:border-0 lg:border-t lg:border-rule-faint lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-4',
                    FRAME,
                    'lg:rounded-none',
                  )}
                >
                  {calibration}
                </div>
              )}
            </div>
            <div
              data-testid="control-desk-standings"
              className={cn('min-w-0 p-5 max-md:order-3 sm:p-6 lg:col-span-7 lg:p-5 xl:p-6', FRAME)}
            >
              {standings}
            </div>
            {gestureConsole && (
              <div
                data-testid="control-desk-gesture"
                className="min-w-0 rounded-surface bg-surface p-5 max-md:order-2 sm:p-6 lg:col-span-12 lg:px-8 lg:pb-8 lg:pt-5"
              >
                {gestureConsole}
              </div>
            )}
          </div>
        </div>
        {orientation}
        <details
          id="allocation-breakdown"
          data-testid="allocations-disclosure"
          className={cn('group/allocations mt-6 scroll-mt-24', FRAME)}
        >
          <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
            <AllocationIcon className="size-5 shrink-0 text-subtle" aria-hidden />
            <span className="min-w-0 flex-1">
              <span className="type-title block text-foreground">
                {t('orientation.allocationsTitle')}
              </span>
              <span className="type-body-sm mt-0.5 block text-muted-foreground">
                {t('orientation.allocationsDescription')}
              </span>
            </span>
            <ChevronDown
              className="size-5 shrink-0 text-subtle transition-transform duration-[var(--duration-base)] group-open/allocations:rotate-180 motion-reduce:transition-none"
              aria-hidden
            />
          </summary>
          <div className="border-t border-rule-faint">{allocationLedger}</div>
        </details>
      </div>
    );
  },
);
ControlDesk.displayName = 'ControlDesk';
