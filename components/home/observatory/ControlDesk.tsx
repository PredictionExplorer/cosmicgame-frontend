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
  /**
   * Show the standing below 1024px too. A placeholder standing (no wallet
   * yet) would only repeat the form's own connect action while the desk is
   * one column, so it waits for the two-column desk.
   */
  standingOnPhones?: boolean;
  /** The latest Signature: beside the form from 1024px, after the Calibration Window on phones. */
  art?: ReactNode;
  className?: string;
}

/**
 * A region of the desk on the page ground: one hairline over its heading and
 * no box ("captions, not cards", docs/design-system.md). The gesture form is
 * the page's only quiet surface; every other region is set off by space and
 * this rule alone. Exported for the page's own regions under the desk.
 */
export const DESK_REGION = 'border-t border-rule pt-4';

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
 * and beside it, on the wall, the latest Signature on its plate with the
 * wallet's standing under it. Every other region opens on a hairline; a
 * region that continues the one above it in its column (the Calibration
 * Window under the clock, the standing under the art) opens on a fainter one.
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
            className="mt-5 grid min-w-0 gap-y-8 lg:mt-3 lg:grid-cols-12 lg:grid-rows-[minmax(min-content,0px)_auto_minmax(min-content,0px)_auto] lg:gap-x-6 lg:gap-y-5"
          >
            <div
              data-testid="control-desk-clock"
              className={cn(
                'min-w-0 lg:col-span-5 lg:col-start-1 lg:row-start-1',
                DESK_REGION,
                calibration ? 'lg:self-start' : 'lg:row-span-2',
              )}
            >
              {clock}
            </div>
            {gestureConsole && (
              <div
                data-testid="control-desk-gesture"
                className="min-w-0 rounded-surface bg-surface p-5 sm:p-6 lg:col-span-8 lg:col-start-1 lg:row-span-2 lg:row-start-3 lg:px-8 lg:pb-8 lg:pt-5"
              >
                {gestureConsole}
              </div>
            )}
            {standing && (
              <div
                data-testid="control-desk-standing"
                className={cn(
                  'min-w-0',
                  DESK_REGION,
                  gestureConsole
                    ? 'lg:col-span-4 lg:col-start-9 lg:row-start-4 lg:border-rule-faint'
                    : 'lg:col-span-5 lg:col-start-8 lg:row-start-3',
                  !standingOnPhones && 'max-lg:hidden',
                )}
              >
                {standing}
              </div>
            )}
            <div
              data-testid="control-desk-standings"
              className={cn(
                'min-w-0 lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1',
                DESK_REGION,
              )}
            >
              {standings}
            </div>
            {calibration && (
              <div
                data-testid="control-desk-calibration"
                className={cn(
                  'min-w-0',
                  DESK_REGION,
                  // Under the clock in the Cycle column from 1024px: one
                  // column, two readings, parted by a fainter hairline.
                  'lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:self-start lg:border-rule-faint lg:pt-3.5',
                )}
              >
                {calibration}
              </div>
            )}
            {art && (
              <div
                data-testid="control-desk-art"
                className={cn(
                  'min-w-0',
                  DESK_REGION,
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

export interface DeskDisclosureProps {
  /** The summary's content: a title, optionally with an icon and a line under it. */
  summary: ReactNode;
  /** What opens under the summary. */
  children: ReactNode;
  id?: string;
  testId?: string;
  className?: string;
}

/**
 * A native disclosure set as a hairline row on the page ground (the reserve
 * breakdown, the story behind the art): it stays in the server HTML, opens
 * from the keyboard, and never boxes what it holds. Rows stack as one list,
 * each closed by its rule; the first adds the rule above.
 */
export function DeskDisclosure({ summary, children, id, testId, className }: DeskDisclosureProps) {
  return (
    <details
      id={id}
      data-testid={testId}
      className={cn('group/disclosure scroll-mt-24 border-b border-rule', className)}
    >
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 py-4 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 flex-1 items-center gap-4">{summary}</span>
        <ChevronDown
          className="size-5 shrink-0 text-subtle transition-transform duration-[var(--duration-base)] group-open/disclosure:rotate-180 motion-reduce:transition-none"
          aria-hidden
        />
      </summary>
      <div className="border-t border-rule-faint">{children}</div>
    </details>
  );
}

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
    <DeskDisclosure
      id="allocation-breakdown"
      testId="allocations-disclosure"
      // The first of the page's disclosure rows carries the rule above the list.
      className={cn('border-t', className)}
      summary={
        <>
          <AllocationIcon className="size-5 shrink-0 text-subtle" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="type-heading-3 block text-foreground">
              {t('orientation.allocationsTitle')}
            </span>
            <span className="type-body-sm mt-0.5 block text-muted-foreground">
              {t('orientation.allocationsDescription')}
            </span>
          </span>
        </>
      }
    >
      {children}
    </DeskDisclosure>
  );
}
