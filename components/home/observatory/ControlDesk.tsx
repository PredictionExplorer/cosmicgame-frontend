'use client';

import type { ComponentType, ReactNode, SVGProps } from 'react';
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Amount } from '@/components/ui/amount';
import { AllocationIcon } from '@/lib/conceptIcons';
import { cn } from '@/lib/utils';

export interface ControlDeskProps {
  header: ReactNode;
  clock: ReactNode;
  calibration?: ReactNode;
  standings: ReactNode;
  gestureConsole?: ReactNode;
  /**
   * The connected wallet's standing: under the Calibration Window from
   * 1024px, after the form below it. Omit it without a wallet: a placeholder
   * would only repeat the form's own connect action.
   */
  standing?: ReactNode;
  /** The latest Signature: beside the standings from 1024px, after them on phones. */
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

/** The right-hand cell of row 1 from 1024px, beside the Cycle column: the form, or the art between cycles. */
const DESK_RIGHT = 'lg:col-span-7 lg:col-start-6 lg:row-span-3 lg:row-start-1 lg:self-start';
/** Row 2's wide cell from 1024px. */
const DESK_ROW_2_WIDE = 'lg:col-span-7 lg:col-start-1 lg:row-start-4';
/** Row 2's narrow cell from 1024px. */
const DESK_ROW_2_NARROW = 'lg:col-span-5 lg:col-start-8 lg:row-start-4';

/**
 * The decision desk.
 *
 * One DOM order serves every width, so what is drawn is what is read and
 * tabbed (WCAG 1.3.2, 2.4.3): the clock, the Calibration Window that prices
 * CST, the gesture form, the wallet's standing, the standings and the latest
 * Signature. Below 1024px, tablets included, the desk is that one column.
 *
 * From 1024px it reads column by column, and focus never moves up within a
 * column. Row 1 puts the Cycle column (5 of 12: the clock, the Calibration
 * Window under it on a fainter hairline, then the wallet's standing) beside
 * the gesture form (7 of 12), the page's one quiet surface, so the commit
 * action is in the first viewport from 1280×720 up. Row 2 puts the
 * Standings Ledger (7 of 12) beside the latest Signature on its plate (5 of
 * 12). Between cycles, with no form, the art takes the form's place and the
 * standings follow it in row 2.
 */
export const ControlDesk = forwardRef<HTMLDivElement, ControlDeskProps>(
  ({ header, clock, calibration, standings, gestureConsole, standing, art, className }, ref) => {
    const hasForm = !!gestureConsole;

    const standingsCell = (
      <div
        key="standings"
        data-testid="control-desk-standings"
        className={cn('min-w-0', DESK_REGION, DESK_ROW_2_WIDE)}
      >
        {standings}
      </div>
    );
    const artCell = art ? (
      <div
        key="art"
        data-testid="control-desk-art"
        className={cn('min-w-0', DESK_REGION, hasForm ? DESK_ROW_2_NARROW : DESK_RIGHT)}
      >
        {art}
      </div>
    ) : null;

    return (
      <div data-testid="control-desk" className={cn('min-w-0', className)}>
        <div id="deck" ref={ref} className="scroll-mt-24">
          <div data-testid="control-desk-header">{header}</div>
          <div
            data-testid="control-desk-grid"
            data-layout={hasForm ? 'form' : 'between-cycles'}
            // From 1024px, rows 1 and 2 are exactly as tall as the clock and
            // the Calibration Window (a min-content minimum under a fixed
            // maximum takes none of a spanning cell's height), so row 3
            // absorbs what the right-hand cell needs beyond them and the
            // standing stays right under the Calibration Window.
            className="mt-5 grid min-w-0 gap-y-8 lg:mt-3 lg:grid-cols-12 lg:grid-rows-[minmax(min-content,0px)_minmax(min-content,0px)_auto_auto] lg:gap-x-6 lg:gap-y-5"
          >
            <div
              data-testid="control-desk-clock"
              className={cn(
                'min-w-0 lg:col-span-5 lg:col-start-1 lg:row-start-1',
                DESK_REGION,
                !calibration && 'lg:row-span-2',
              )}
            >
              {clock}
            </div>
            {calibration && (
              <div
                data-testid="control-desk-calibration"
                className={cn(
                  'min-w-0',
                  DESK_REGION,
                  // Under the clock in the Cycle column from 1024px: one
                  // column, two readings, parted by a fainter hairline.
                  'lg:col-span-5 lg:col-start-1 lg:row-start-2 lg:border-rule-faint lg:pt-3.5',
                )}
              >
                {calibration}
              </div>
            )}
            {gestureConsole && (
              <div
                data-testid="control-desk-gesture"
                className={cn(
                  'min-w-0 rounded-surface bg-surface p-5 sm:p-6 lg:px-8 lg:pb-8 lg:pt-5',
                  DESK_RIGHT,
                )}
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
                  // It continues the Cycle column, so it opens on the fainter rule.
                  'lg:col-span-5 lg:col-start-1 lg:row-start-3 lg:self-start lg:border-rule-faint',
                )}
              >
                {standing}
              </div>
            )}
            {/* With a form the standings lead row 2 beside the art; between
                cycles the art leads the right column and the standings follow. */}
            {hasForm ? [standingsCell, artCell] : [artCell, standingsCell]}
          </div>
        </div>
      </div>
    );
  },
);
ControlDesk.displayName = 'ControlDesk';

type DisclosureIcon = ComponentType<SVGProps<SVGSVGElement>>;

export interface DeskDisclosureProps {
  /** The concept's glyph, before the title. */
  icon: DisclosureIcon;
  title: ReactNode;
  /** One line under the title that says what opens. */
  description: ReactNode;
  /** A live figure at the row's end, before the chevron (the reserve row's ETH). */
  figure?: ReactNode;
  /** What opens under the summary. */
  children: ReactNode;
  id?: string;
  testId?: string;
  className?: string;
}

/**
 * A native disclosure set as a hairline row on the page ground (the reserve
 * breakdown, the story behind the art): it stays in the server HTML, opens
 * from the keyboard, and never boxes what it holds. Every row has the same
 * summary: a glyph, the title, one line on what opens and, where there is
 * one, a live figure, so a closed row already says something. Rows stack as
 * one list, each closed by its rule; the first adds the rule above.
 */
export function DeskDisclosure({
  icon: Icon,
  title,
  description,
  figure,
  children,
  id,
  testId,
  className,
}: DeskDisclosureProps) {
  return (
    <details
      id={id}
      data-testid={testId}
      className={cn('group/disclosure scroll-mt-24 border-b border-rule', className)}
    >
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 py-4 [&::-webkit-details-marker]:hidden">
        <Icon className="size-5 shrink-0 text-subtle" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="type-heading-3 block text-foreground">{title}</span>
          <span className="type-body-sm mt-0.5 block text-muted-foreground">{description}</span>
        </span>
        {figure ? (
          <span data-testid={testId ? `${testId}-figure` : undefined} className="shrink-0 text-end">
            {figure}
          </span>
        ) : null}
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
  /** The Cycle Reserve every track draws on, in ETH; null while unknown (no figure is shown). */
  reserveEth?: number | null;
  children: ReactNode;
  className?: string;
}

/**
 * Where the cycle reserve goes: the full allocation ledger behind a native
 * disclosure, so it stays in the server HTML and opens from the keyboard.
 * Closed, it still names the Cycle Reserve the tracks share.
 */
export function AllocationsDisclosure({
  reserveEth = null,
  children,
  className,
}: AllocationsDisclosureProps) {
  const t = useTranslations('home');
  const tGlossary = useTranslations('glossary');
  return (
    <DeskDisclosure
      id="allocation-breakdown"
      testId="allocations-disclosure"
      // The first of the page's disclosure rows carries the rule above the list.
      className={cn('border-t', className)}
      icon={AllocationIcon}
      title={t('orientation.allocationsTitle')}
      description={t('orientation.allocationsDescription')}
      figure={
        reserveEth != null ? (
          <>
            <Amount
              value={reserveEth}
              unit="ETH"
              context="card"
              className="type-figure-sm block text-foreground"
            />
            <span className="type-caption block text-subtle">
              {tGlossary('terms.cycleReserve.term')}
            </span>
          </>
        ) : undefined
      }
    >
      {children}
    </DeskDisclosure>
  );
}
