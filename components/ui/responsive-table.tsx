'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * ResponsiveTable — the table foundation for the whole app.
 *
 * Replaces `react-super-responsive-table`, whose mobile card layout derived
 * each cell's label by reading `child.props.children` **by array index** inside
 * a `useEffect` on the header row and pushing the result through context. That
 * meant labels were blank on first paint, every parent re-render triggered a
 * second full render pass of the table, and any conditionally rendered column
 * silently shifted every label after it.
 *
 * Here each cell states its own label. There is no index arithmetic, no
 * effect and no shared mutable state, so a cell cannot be mislabelled by a
 * sibling. Below `sm` the label is rendered by CSS from `data-label`, which
 * keeps the DOM identical on both layouts (see `styles/global.css`).
 *
 * Cells with no content are marked `data-empty` and hidden on mobile, so a
 * card never shows a labelled blank row.
 */

const MOBILE_CARD_CLASS = 'cs-table';

interface ResponsiveTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Describes the table for assistive tech. Required — tables carry data. */
  'aria-label'?: string;
}

/**
 * Scroll container. Wide tables still scroll horizontally on desktop, and a
 * scrollable region must be reachable by keyboard, hence `tabIndex`/`role`.
 */
export function ResponsiveTableContainer({
  className,
  children,
  label,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { label?: string }) {
  return (
    <div
      // `tabIndex` alone makes the scroll area keyboard-operable. The `region`
      // role is only added alongside a name, since a nameless region is worse
      // for screen readers than no landmark at all.
      {...(label ? { role: 'region', 'aria-label': label } : {})}
      tabIndex={0}
      className={cn(
        // `overflow-y-auto` is declared rather than left implicit: a lone
        // `overflow-x-auto` already forces the other axis to `auto` per spec,
        // so stating it keeps the behaviour visible to the next reader.
        'relative min-w-0 overflow-x-auto overflow-y-auto rounded-xl border border-white/[0.10] bg-white/[0.02]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        // Cards need room to breathe; the border/radius would clip them otherwise.
        'max-sm:border-0 max-sm:bg-none max-sm:shadow-none max-sm:backdrop-blur-none max-sm:before:hidden',
        'print:overflow-visible print:shadow-none print:backdrop-blur-none',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ResponsiveTable({ className, ...props }: ResponsiveTableProps) {
  return (
    <table
      data-testid="table"
      className={cn(MOBILE_CARD_CLASS, 'w-full border-collapse', className)}
      {...props}
    />
  );
}

export function ResponsiveTableHead({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      data-testid="thead"
      className={cn(
        // Not sticky. A `sticky top-0` here used to look like it pinned the
        // header row, but the container scrolls horizontally, and per spec that
        // forces the other axis to `auto` — so this stuck to a container that
        // has no height constraint and therefore never scrolls vertically. It
        // pinned nothing and only created a stacking context.
        'bg-white/[0.03]',
        'print:static print:bg-transparent print:backdrop-blur-none print:[background-image:none]',
        className,
      )}
      {...props}
    />
  );
}

export function ResponsiveTableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody data-testid="tbody" className={className} {...props} />;
}

export type ColumnAlign = 'left' | 'center' | 'right';

/**
 * `secondary` columns are hidden on mobile. Use only for values that are
 * genuinely redundant on a phone — never for the row's identity or amount.
 */
export type ColumnPriority = 'primary' | 'secondary';

interface HeadCellProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  align?: ColumnAlign;
  priority?: ColumnPriority;
}

export function ResponsiveTableHeadCell({
  className,
  align = 'left',
  priority = 'primary',
  ...props
}: HeadCellProps) {
  return (
    <th
      data-testid="th"
      data-priority={priority}
      scope="col"
      className={cn(
        'border-b border-white/[0.08] px-4 py-3 text-xs font-medium uppercase tracking-wider',
        'leading-[1.43] text-muted-foreground print:!text-foreground',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        align === 'left' && 'text-left',
        className,
      )}
      {...props}
    />
  );
}

interface CellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  /**
   * Label shown beside the value in the mobile card layout. Required so a cell
   * can never inherit the wrong label from a sibling column.
   */
  label: string;
  align?: ColumnAlign;
  priority?: ColumnPriority;
}

/** True when a cell would render nothing a reader could see. */
function isEmptyContent(children: React.ReactNode): boolean {
  const flat = React.Children.toArray(children);
  if (flat.length === 0) return true;
  return flat.every((child) => {
    if (child === null || child === undefined || typeof child === 'boolean') return true;
    if (typeof child === 'string') return child.trim() === '';
    if (typeof child === 'number') return false;
    return false;
  });
}

export function ResponsiveTableCell({
  className,
  label,
  align = 'left',
  priority = 'primary',
  children,
  ...props
}: CellProps) {
  return (
    <td
      data-testid="td"
      data-label={label}
      data-priority={priority}
      data-empty={isEmptyContent(children) ? 'true' : undefined}
      className={cn(
        'border-b border-white/[0.03] px-4 py-3.5 text-sm font-normal leading-[1.43]',
        'text-muted-foreground max-sm:text-xs print:!text-foreground',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className,
      )}
      {...props}
    >
      {children}
    </td>
  );
}

const NESTED_INTERACTIVE_SELECTOR = 'a,button,input,select,textarea,[role="button"],[role="link"]';

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /**
   * Convenience click target covering the whole row, for pointer users only.
   *
   * The row deliberately gets no interactive role. Data rows almost always
   * contain their own links (explorer, address, token), and putting
   * `role="button"` on the row nests those inside a control — a serious
   * `nested-interactive` axe violation that also makes screen-reader output
   * ambiguous. Keyboard and assistive-tech users reach the same destination
   * through {@link ResponsiveTableRowLink} in the row's first cell, which is
   * a real link and therefore also supports open-in-new-tab.
   */
  onActivate?: () => void;
}

export function ResponsiveTableRow({ className, onActivate, onClick, ...props }: RowProps) {
  const handleClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    onClick?.(event);
    if (!onActivate || event.defaultPrevented) return;
    // A click on a nested link or button belongs to that control, not the row.
    // Previously the row swallowed those, so tapping an explorer link
    // navigated to the row's detail page instead.
    if (event.target instanceof Element && event.target.closest(NESTED_INTERACTIVE_SELECTOR)) {
      return;
    }
    onActivate();
  };

  return (
    <tr
      data-testid="tr"
      className={cn(
        'border-0 transition-colors even:bg-white/[0.018] hover:bg-white/[0.055]',
        onActivate && 'cursor-pointer',
        className,
      )}
      onClick={onActivate || onClick ? handleClick : undefined}
      {...props}
    />
  );
}

/**
 * Styling for the keyboard-accessible entry point of an activatable row.
 *
 * Apply it to a `Link` from `@/i18n/navigation` in the row's first cell,
 * wrapping that cell's existing content. This is what gives keyboard and
 * screen-reader users the destination that `onActivate` gives pointer users.
 */
export const TABLE_ROW_LINK_CLASS = cn(
  'inline-block rounded-sm leading-6 text-inherit underline-offset-4 hover:underline',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
);
