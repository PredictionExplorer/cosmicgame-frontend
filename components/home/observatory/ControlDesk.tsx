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
  className?: string;
}

/** One region frame: a hairline on a faint surface, the only bordered level of its region. */
const FRAME = 'rounded-surface border border-rule-faint bg-surface/60';

/**
 * The decision desk.
 *
 * The DOM is in the order a phone reads it, so the swipe and Tab order
 * follow what is drawn (WCAG 1.3.2, 2.4.3): the clock, the gesture form
 * where a thumb reaches it first, the wallet's standing, the standings, the
 * Calibration Window and the latest Signature. Below 1024px, tablets
 * included, the desk is that one column, so the action is always the second
 * thing on the page.
 *
 * From 1024px each cell is placed explicitly. Row 1 is the Cycle column
 * (clock over Calibration Window; 5 of 12) beside the Standings Ledger (7 of
 * 12). Row 2 is the gesture form (8 of 12) on the page's one quiet surface,
 * and beside it, unframed on the wall, the latest Signature on its plate
 * with the wallet's standing under it. The Cycle column's frame is a
 * decorative cell behind the clock and the Calibration Window, which stay
 * separate cells so they can take their own places in the phone order. The
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
      className,
    },
    ref,
  ) => {
    return (
      <div data-testid="control-desk" className={cn('min-w-0', className)}>
        <div id="deck" ref={ref} className="scroll-mt-24">
          <div data-testid="control-desk-header">{header}</div>
          <div
            data-testid="control-desk-grid"
            // From 1024px, rows 1 and 3 are exactly as tall as the clock and
            // the art (a min-content minimum under a fixed maximum takes none
            // of a spanning cell's height), so rows 2 and 4 absorb what the
            // standings and the form, which span two rows, need beyond them:
            // the Calibration Window stays under the clock and the standing
            // under the art.
            className="mt-5 grid min-w-0 gap-4 md:gap-5 lg:mt-4 lg:grid-cols-12 lg:grid-rows-[minmax(min-content,0px)_auto_minmax(min-content,0px)_auto]"
          >
            {/* The Cycle column's frame from 1024px: drawn behind the clock
                and the Calibration Window, which keep their own cells. */}
            <div
              aria-hidden
              data-testid="control-desk-cycle"
              className={cn(
                'hidden lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:block',
                FRAME,
              )}
            />
            <div
              data-testid="control-desk-clock"
              className={cn(
                'min-w-0 p-5 sm:p-6',
                FRAME,
                // On the Cycle column's frame from 1024px: inset by its padding.
                'lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:mx-5 lg:mt-4 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 xl:mx-6',
                calibration ? 'lg:self-start' : 'lg:row-span-2 lg:mb-4',
              )}
            >
              {clock}
            </div>
            {gestureConsole && (
              <div
                data-testid="control-desk-gesture"
                className="min-w-0 rounded-surface bg-surface p-5 sm:p-6 lg:col-span-8 lg:col-start-1 lg:row-span-2 lg:row-start-3 lg:px-8 lg:pb-8 lg:pt-4"
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
                  'min-w-0 p-5 sm:p-6 lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:pb-0',
                  FRAME,
                  gestureConsole
                    ? 'lg:col-span-4 lg:col-start-9 lg:row-start-4 lg:pt-0'
                    : 'lg:col-span-5 lg:col-start-8 lg:row-start-3 lg:pt-4',
                  !standingOnPhones && 'max-md:hidden',
                )}
              >
                {standing}
              </div>
            )}
            <div
              data-testid="control-desk-standings"
              className={cn(
                'min-w-0 p-5 sm:p-6',
                FRAME,
                'lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:px-5 lg:py-4 xl:px-6',
              )}
            >
              {standings}
            </div>
            {calibration && (
              <div
                data-testid="control-desk-calibration"
                className={cn(
                  'min-w-0 p-5 sm:p-6',
                  FRAME,
                  // Under the clock on the Cycle column's frame from 1024px,
                  // parted from it by one inset hairline.
                  'lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:mx-5 lg:mb-4 lg:self-start lg:rounded-none lg:border-0 lg:border-t lg:border-rule-faint lg:bg-transparent lg:px-0 lg:pb-0 lg:pt-3.5 xl:mx-6',
                )}
              >
                {calibration}
              </div>
            )}
            {art && (
              <div
                data-testid="control-desk-art"
                className={cn(
                  'min-w-0 lg:pt-4',
                  gestureConsole
                    ? 'lg:col-span-4 lg:col-start-9 lg:row-start-3'
                    : 'lg:col-span-7 lg:col-start-1 lg:row-start-3',
                )}
              >
                {art}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
ControlDesk.displayName = 'ControlDesk';

export interface AllocationsDisclosureProps {
  children: ReactNode;
  className?: string;
}

/**
 * Where the cycle reserve goes: the full allocation ledger behind a native
 * disclosure, so it stays in the server HTML and opens from the keyboard.
 */
export function AllocationsDisclosure({ children, className }: AllocationsDisclosureProps) {
  const t = useTranslations('home');
  return (
    <details
      id="allocation-breakdown"
      data-testid="allocations-disclosure"
      className={cn('group/allocations scroll-mt-24', FRAME, className)}
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
      <div className="border-t border-rule-faint">{children}</div>
    </details>
  );
}

/** The frame every desk region shares; exported for the page's own regions. */
export const DESK_FRAME = FRAME;
