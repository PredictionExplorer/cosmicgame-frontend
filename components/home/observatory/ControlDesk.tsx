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
  /** The connected wallet's standing: beside the form from 1024px, under it below. */
  standing?: ReactNode;
  /** Show the standing on phones too (a placeholder standing waits for a wallet). */
  standingOnPhones?: boolean;
  /** The latest Signature: beside the form from 1024px, after the Calibration Window on phones. */
  art?: ReactNode;
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
 * Calibration Window; 5 of 12) beside the Standings Ledger (7 of 12). Row 2
 * is the gesture form (8 of 12) on the page's one quiet surface, and beside
 * it, unframed on the wall, the latest Signature on its plate with the
 * wallet's standing under it. From 768 to 1023px it is one column in the same
 * order, so a tablet never splits into cramped columns. On phones the form
 * moves up under the clock, where a thumb reaches it first, followed by the
 * wallet's standing, the standings, the Calibration Window and the art. The
 * frames are the only bordered level; inside them, space and hairlines.
 */
export const ControlDesk = forwardRef<HTMLDivElement, ControlDeskProps>(
  (
    {
      header,
      clock,
      calibration,
      standings,
      gestureConsole,
      standing,
      standingOnPhones = true,
      art,
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
            className="mt-5 grid min-w-0 gap-4 md:gap-5 lg:mt-4 lg:grid-cols-12 lg:grid-rows-[auto_auto_1fr] lg:gap-5"
          >
            {/* The Cycle column. Below 1024px it dissolves (display: contents)
                so its two parts can take their own places in the page order. */}
            <div
              data-testid="control-desk-cycle"
              className="contents lg:col-span-5 lg:row-start-1 lg:flex lg:flex-col lg:rounded-surface lg:border lg:border-rule-faint lg:bg-surface/60 lg:px-5 lg:py-4 xl:px-6"
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
                    'min-w-0 p-5 max-md:order-5 sm:p-6 lg:mt-3.5 lg:border-0 lg:border-t lg:border-rule-faint lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-3.5',
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
              className={cn(
                'min-w-0 p-5 max-md:order-4 sm:p-6 lg:col-span-7 lg:row-start-1 lg:px-5 lg:py-4 xl:px-6',
                FRAME,
              )}
            >
              {standings}
            </div>
            {gestureConsole && (
              <div
                data-testid="control-desk-gesture"
                className="min-w-0 rounded-surface bg-surface p-5 max-md:order-2 sm:p-6 lg:col-span-8 lg:row-span-2 lg:row-start-2 lg:px-8 lg:pb-8 lg:pt-4"
              >
                {gestureConsole}
              </div>
            )}
            {standing && (
              <div
                data-testid="control-desk-standing"
                className={cn(
                  // Framed like its neighbours while the desk is one column;
                  // on the wall beside the form from 1024px.
                  'min-w-0 p-5 max-md:order-3 sm:p-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:pb-0',
                  FRAME,
                  gestureConsole
                    ? 'lg:col-span-4 lg:col-start-9 lg:row-start-3 lg:pt-0'
                    : 'lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:pt-4',
                  !standingOnPhones && 'max-md:hidden',
                )}
              >
                {standing}
              </div>
            )}
            {art && (
              <div
                data-testid="control-desk-art"
                className={cn(
                  'min-w-0 max-md:order-6 lg:pt-4',
                  gestureConsole
                    ? 'lg:col-span-4 lg:col-start-9 lg:row-start-2'
                    : 'lg:col-span-7 lg:col-start-1 lg:row-start-2',
                )}
              >
                {art}
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
