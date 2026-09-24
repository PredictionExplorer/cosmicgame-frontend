'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

/**
 * ResponsiveTable: the table foundation for the whole app (the "ledger").
 *
 * Replaces `react-super-responsive-table`, whose mobile card layout derived
 * each cell's label by reading `child.props.children` by array index inside a
 * `useEffect`. Here each cell states its own label: there is no index
 * arithmetic, no effect and no shared state, so a cell cannot be mislabelled
 * by a sibling. Below `sm` the label is drawn by CSS from `data-label`, which
 * keeps the DOM identical on both layouts (styles/tables.css).
 *
 * What the primitives guarantee:
 *
 * - A column's alignment is stated once and emitted as `data-align` on both
 *   its header and its cells, so headers and values cannot disagree. Text,
 *   dates and addresses read from the start edge, numbers from the end edge
 *   in tabular figures (`numeric`), and only status icons are centred.
 * - Every body cell wraps its content in exactly one `[data-slot='value']`
 *   node, so on a phone a cell holding a badge or a sub-line is still one
 *   value beside its label, never a second grid item in the label column.
 * - Cells with nothing to show are marked `data-empty` and dropped from phone
 *   records, so a record never shows a labelled blank line.
 * - The table has no outer box. The section around it is the one frame; the
 *   ledger itself is a header rule and row hairlines.
 *
 * `components/ui/data-table` builds on these: prefer `<DataTable>` with
 * column kinds for new tables.
 */

const TABLE_CLASS = 'cs-table';
const SCROLL_CLASS = 'cs-table-scroll';

/** Horizontal alignment. `left`/`right` are accepted as aliases of `start`/`end`. */
export type ColumnAlign = 'start' | 'end' | 'center' | 'left' | 'right';

/** The logical alignment emitted as `data-align`. */
export type LogicalAlign = 'start' | 'end' | 'center';

/**
 * `secondary` columns are hidden on phones. Use only for values that are
 * genuinely redundant on a phone, never for the row's identity or amount.
 */
export type ColumnPriority = 'primary' | 'secondary';

/**
 * How the table lays out below `sm`: `cards` turns each row into a spec-sheet
 * record (label at the start, value at the end); `compact` keeps a real table,
 * for two or three short columns such as an owner and a count.
 */
export type TableLayout = 'cards' | 'compact';

export function logicalAlign(align: ColumnAlign | undefined): LogicalAlign {
  if (align === 'right' || align === 'end') return 'end';
  if (align === 'center') return 'center';
  return 'start';
}

/** True while an element's content is wider than its box. */
function useHorizontalOverflow(element: HTMLElement | null): boolean {
  const [overflowing, setOverflowing] = React.useState(false);

  React.useEffect(() => {
    if (!element || typeof ResizeObserver === 'undefined') return;
    const measure = () => setOverflowing(element.scrollWidth > element.clientWidth + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of Array.from(element.children)) observer.observe(child);
    return () => observer.disconnect();
  }, [element]);

  return overflowing;
}

function assignRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === 'function') ref(value);
  else if (ref) ref.current = value;
}

interface ResponsiveTableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Names the scroll region. When the table is wider than its container, the
   * container becomes a focusable, named region so it can be scrolled from the
   * keyboard; a table that fits adds no tab stop.
   */
  label?: string;
  /**
   * `plain` (default): no box, because the section around a table is its one
   * frame. `framed`: a hairline box for a table that stands alone on a page.
   */
  variant?: 'plain' | 'framed';
}

/**
 * Scroll container. A table wider than the screen scrolls inside it, with a
 * fading edge while more lies beyond (styles/tables.css).
 */
export function ResponsiveTableContainer({
  className,
  children,
  label,
  variant = 'plain',
  ref,
  ...props
}: ResponsiveTableContainerProps & { ref?: React.Ref<HTMLDivElement> }) {
  const [element, setElement] = React.useState<HTMLDivElement | null>(null);
  const overflowing = useHorizontalOverflow(element);
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      setElement(node);
      assignRef(ref, node);
    },
    [ref],
  );

  return (
    <div
      ref={setRef}
      // Only a container that actually scrolls is a tab stop, and it is only a
      // landmark when it has a name: a nameless region is worse than none.
      {...(overflowing
        ? { tabIndex: 0, ...(label ? { role: 'region', 'aria-label': label } : {}) }
        : {})}
      data-overflowing={overflowing ? 'true' : undefined}
      className={cn(
        SCROLL_CLASS,
        // `overflow-y-auto` is declared rather than left implicit: a lone
        // `overflow-x-auto` already forces the other axis to `auto` per spec.
        'relative min-w-0 overflow-x-auto overflow-y-auto',
        variant === 'framed' &&
          'rounded-surface border border-rule px-2 max-sm:border-0 max-sm:px-0',
        'print:overflow-visible',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface ResponsiveTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  /** Names the table for assistive tech. Every data table needs a name. */
  'aria-label'?: string;
  /** Phone layout; see {@link TableLayout}. Default `cards`. */
  layout?: TableLayout;
}

export function ResponsiveTable({ className, layout = 'cards', ...props }: ResponsiveTableProps) {
  return (
    <table
      data-testid="table"
      data-layout={layout}
      className={cn(TABLE_CLASS, 'w-full border-collapse', className)}
      {...props}
    />
  );
}

export function ResponsiveTableHead({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  // Not sticky: the container scrolls horizontally, which per spec forces the
  // other axis to `auto`, so a sticky header would stick to a box that never
  // scrolls vertically.
  return <thead data-testid="thead" className={className} {...props} />;
}

export function ResponsiveTableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody data-testid="tbody" className={className} {...props} />;
}

interface ColumnProps {
  /** Default `start`. */
  align?: ColumnAlign;
  priority?: ColumnPriority;
  /** Numbers: tabular, lining figures with a slashed zero. */
  numeric?: boolean;
  /** Keep the value on one line (dates, amounts, short ids). */
  nowrap?: boolean;
}

type HeadCellProps = Omit<React.ThHTMLAttributes<HTMLTableCellElement>, 'align'> & ColumnProps;

export function ResponsiveTableHeadCell({
  className,
  align,
  priority = 'primary',
  numeric = false,
  nowrap = false,
  ...props
}: HeadCellProps) {
  return (
    <th
      data-testid="th"
      data-priority={priority}
      data-align={logicalAlign(align)}
      data-numeric={numeric ? 'true' : undefined}
      data-nowrap={nowrap ? 'true' : undefined}
      scope="col"
      className={cn(
        'border-b border-rule px-4 pt-3 pb-2.5 align-bottom',
        'type-label text-subtle print:!text-foreground',
        className,
      )}
      {...props}
    />
  );
}

interface CellProps
  extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, 'align'>, ColumnProps {
  /**
   * Label shown beside the value in the phone record. Required so a cell can
   * never inherit the wrong label from a sibling column.
   */
  label: string;
  /**
   * In the phone record, put the value under its label at full width instead
   * of at the end of the line. For long text: a message, a description.
   */
  stack?: boolean;
}

/** True when a cell would render nothing a reader could see. */
function isEmptyContent(children: React.ReactNode): boolean {
  return React.Children.toArray(children).every((child) => {
    if (typeof child === 'string') return child.trim() === '';
    // `toArray` drops null, undefined and booleans; numbers (zero included)
    // and elements are real content.
    return false;
  });
}

export function ResponsiveTableCell({
  className,
  label,
  align,
  priority = 'primary',
  numeric = false,
  nowrap = false,
  stack = false,
  children,
  ...props
}: CellProps) {
  return (
    <td
      data-testid="td"
      data-label={label}
      data-priority={priority}
      data-align={logicalAlign(align)}
      data-numeric={numeric ? 'true' : undefined}
      data-nowrap={nowrap ? 'true' : undefined}
      data-stack={stack ? 'true' : undefined}
      data-empty={isEmptyContent(children) ? 'true' : undefined}
      className={cn(
        'border-b border-rule-faint px-4 py-3 align-middle text-sm leading-5',
        'text-muted-foreground print:!text-foreground',
        className,
      )}
      {...props}
    >
      <div data-slot="value">{children}</div>
    </td>
  );
}

const NESTED_INTERACTIVE_SELECTOR = 'a,button,input,select,textarea,[role="button"],[role="link"]';

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /**
   * Convenience click target covering the whole row, for pointer users only.
   *
   * The row deliberately gets no interactive role. Data rows almost always
   * contain their own links (explorer, address, token), and `role="button"`
   * on the row would nest those inside a control, a serious
   * `nested-interactive` axe violation. Keyboard and assistive-tech users
   * reach the same destination through a real link in the row's first cell
   * (styled with {@link TABLE_ROW_LINK_CLASS}).
   */
  onActivate?: () => void;
  /**
   * The connected wallet's row: marked with an accent rule at its start edge
   * and left in its ranked place.
   */
  current?: boolean;
}

export function ResponsiveTableRow({
  className,
  onActivate,
  onClick,
  current = false,
  ...props
}: RowProps) {
  const handleClick = (event: React.MouseEvent<HTMLTableRowElement>) => {
    onClick?.(event);
    if (!onActivate || event.defaultPrevented) return;
    // A click on a nested link or button belongs to that control, not the row.
    if (event.target instanceof Element && event.target.closest(NESTED_INTERACTIVE_SELECTOR)) {
      return;
    }
    onActivate();
  };

  return (
    <tr
      data-testid="tr"
      data-current={current ? 'true' : undefined}
      className={cn(
        'transition-colors duration-[var(--duration-fast)] hover:bg-muted/40',
        onActivate && 'cursor-pointer',
        className,
      )}
      onClick={onActivate || onClick ? handleClick : undefined}
      {...props}
    />
  );
}

/**
 * A link inside a ledger cell: an internal route (an address, a token, a
 * cycle) or a proof link to the explorer. Foreground text with a quiet
 * underline, so it reads as a link beside the muted static values without
 * turning the ledger into a column of accent colour.
 */
export const TABLE_LINK_CLASS = cn(
  'rounded-sm text-foreground underline decoration-1 underline-offset-[0.2em]',
  'decoration-[color-mix(in_oklab,currentColor_30%,transparent)]',
  'transition-colors duration-[var(--duration-fast)]',
  'hover:text-primary hover:decoration-current',
);

/**
 * Styling for the keyboard-accessible entry point of an activatable row.
 *
 * Apply it to a `Link` from `@/i18n/navigation` in the row's first cell,
 * wrapping that cell's existing content. This is what gives keyboard and
 * screen-reader users the destination that `onActivate` gives pointer users.
 */
export const TABLE_ROW_LINK_CLASS = TABLE_LINK_CLASS;
