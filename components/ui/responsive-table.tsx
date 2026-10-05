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
 * - Every part states its table role (`table`, `rowgroup`, `row`,
 *   `columnheader`, `cell`). A phone record sets these elements to
 *   `display: block`, and WebKit drops the implicit roles of a table restyled
 *   that way, so VoiceOver would otherwise lose table navigation and read
 *   the hidden header row as stray text. The explicit roles equal the
 *   implicit ones, so nothing changes where the table stays a table.
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
  /** Names the scroll region after an element on the page (the table's heading), by id. */
  labelledBy?: string;
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
  labelledBy,
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

  const name = labelledBy
    ? { 'aria-labelledby': labelledBy }
    : label
      ? { 'aria-label': label }
      : null;

  return (
    <div
      ref={setRef}
      // Only a container that actually scrolls is a tab stop, and it is only a
      // landmark when it has a name: a nameless region is worse than none.
      {...(overflowing ? { tabIndex: 0, ...(name ? { role: 'region', ...name } : {}) } : {})}
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
      role="table"
      data-testid="table"
      data-layout={layout}
      className={cn(TABLE_CLASS, 'w-full border-collapse', className)}
      {...props}
    />
  );
}

export function ResponsiveTableHead({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  // Not sticky: the container scrolls horizontally, which per spec forces the
  // other axis to `auto`, so a sticky header would stick to a box that never
  // scrolls vertically.
  return (
    <thead role="rowgroup" data-testid="thead" className={className} {...props}>
      {withRowRoles(children)}
    </thead>
  );
}

/**
 * Header rows are often plain `<tr>`s (a column-group row, the header row);
 * give each the row role the phone record would otherwise lose in WebKit.
 */
function withRowRoles(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, (child) =>
    React.isValidElement<{ role?: string }>(child) && child.type === 'tr' && !child.props.role
      ? React.cloneElement(child, { role: 'row' })
      : child,
  );
}

export function ResponsiveTableBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody role="rowgroup" data-testid="tbody" className={className} {...props} />;
}

interface ColumnProps {
  /** Default `start`. */
  align?: ColumnAlign;
  priority?: ColumnPriority;
  /** Numbers: tabular, lining figures. */
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
      role="columnheader"
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
  /**
   * The cell's part in a phone record: `title` opens the record with the
   * value alone (no label), at the start and in the foreground tier, the
   * name a reader anchors each record on; `omit` leaves the cell out of the
   * record. Tables that stay tables on a phone (`compact`) ignore it.
   */
  phone?: 'title' | 'omit';
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
  phone,
  children,
  ...props
}: CellProps) {
  return (
    <td
      role="cell"
      data-testid="td"
      data-label={label}
      data-priority={priority}
      data-align={logicalAlign(align)}
      data-numeric={numeric ? 'true' : undefined}
      data-nowrap={nowrap ? 'true' : undefined}
      data-stack={stack ? 'true' : undefined}
      data-phone={phone}
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

/**
 * Whether a click on a row is the reader asking for the row's destination,
 * rather than something else a pointer does over a row:
 *
 * - a press on a nested link, button or field belongs to that control;
 * - a modified click (Cmd, Ctrl, Shift, Alt) asks the browser for a new tab,
 *   a new window or a download, which only the row's real link can give, so
 *   the row must not also navigate this tab;
 * - the mouseup that ends a drag-selection over a message or an amount is a
 *   click too, and must not carry the reader away from what they selected;
 * - React bubbles events through portals, so a click inside a popover a
 *   cell opened reaches the row without being inside it in the DOM.
 */
export function isRowActivation(event: React.MouseEvent<HTMLElement>): boolean {
  if (event.button !== 0) return false;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  const target = event.target;
  if (!(target instanceof Node) || !event.currentTarget.contains(target)) return false;
  if (target instanceof Element && target.closest(NESTED_INTERACTIVE_SELECTOR)) return false;
  const selection = typeof window === 'undefined' ? null : window.getSelection();
  if (selection && !selection.isCollapsed && selection.toString().trim() !== '') return false;
  return true;
}

interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /**
   * Convenience click target covering the whole row, for pointer users only.
   *
   * The row deliberately gets no interactive role. Data rows almost always
   * contain their own links (explorer, address, token), and `role="button"`
   * on the row would nest those inside a control, a serious
   * `nested-interactive` axe violation. Keyboard and assistive-tech users
   * reach the same destination through a real link in the row's first cell
   * (styled with {@link TABLE_LINK_CLASS}). A click that is not a plain
   * activation of the row (see {@link isRowActivation}) is left alone.
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
    if (isRowActivation(event)) onActivate();
  };

  return (
    <tr
      role="row"
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
 * cycle), a proof link to the explorer, or the row link in an activatable
 * row's first cell, which gives keyboard and screen-reader users the
 * destination `onActivate` gives pointer users. Foreground text with a
 * quiet underline, so it reads as a link beside the muted static values
 * without turning the ledger into a column of accent colour.
 */
export const TABLE_LINK_CLASS = cn(
  'rounded-sm text-foreground underline decoration-1 underline-offset-[0.2em]',
  'decoration-[color-mix(in_oklab,currentColor_30%,transparent)]',
  'transition-colors duration-[var(--duration-fast)]',
  'hover:text-primary hover:decoration-current',
);
