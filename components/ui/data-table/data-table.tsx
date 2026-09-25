'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { TOUCH_TARGET_EXTENDED_CLASS } from '@/lib/touch-target';
import { formatCount, type AmountUnit } from '@/utils/format';
import { Link, useRouter } from '@/i18n/navigation';
import { TimeZoneNote } from '@/components/ui/date-time';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { TablePagination, pageCountFor } from '@/components/ui/pagination';
import { SectionHeader } from '@/components/ui/section-header';
import {
  ResponsiveTable,
  ResponsiveTableBody,
  ResponsiveTableCell,
  ResponsiveTableContainer,
  ResponsiveTableHead,
  ResponsiveTableHeadCell,
  ResponsiveTableRow,
  TABLE_LINK_CLASS,
  logicalAlign,
  type ColumnAlign,
  type ColumnPriority,
  type LogicalAlign,
  type TableLayout,
} from '@/components/ui/responsive-table';
import { Skeleton } from '@/components/ui/skeleton';

import { YouBadge } from './cells';
import {
  COLUMN_KINDS,
  compareRows,
  isBlankValue,
  phoneLayoutFor,
  type ColumnKind,
  type SortDirection,
  type SortValue,
} from './column-kinds';
import { KindValue, blankShowsUnknown } from './kind-value';
import { useDataTableWidth, type DataTableWidthMode } from './table-width';
import { useCompactFit } from './use-compact-fit';
import { DEFAULT_PAGE_SIZE, PHONE_PAGE_SIZE, usePhoneLayout } from './use-page-size';

export type { SortDirection, SortValue };

/** What a custom `cell` renderer receives besides the row. */
export interface DataTableCellContext {
  /** The row's position in the sorted rows, across all pages (0-based). */
  index: number;
  /** What the column's `value` returned for the row. */
  value: SortValue;
  /** Whether the row belongs to the connected wallet (`isCurrentRow`). */
  isCurrent: boolean;
}

/**
 * One column. Most columns need only `id`, `header`, `kind` and `value`: the
 * kind supplies the alignment, wrapping, figure style, renderer and sort
 * order (see `COLUMN_KINDS`). `cell` replaces the renderer when a value needs
 * more than its kind gives it; `value` still drives sorting and emptiness.
 */
export interface DataTableColumn<T> {
  /** Stable id, for sorting and React keys. */
  id: string;
  /** Header content. */
  header: React.ReactNode;
  /**
   * The column name as plain text: the label beside each value in a phone
   * record. Required when `header` is not a string (an icon, a visually
   * hidden word): without it the record shows no label, never the id, and
   * development builds warn.
   */
  label?: string;
  /** What the column holds. Default `text`. */
  kind?: ColumnKind;
  /** The raw value: what the kind renders, what sorts, and what counts as empty. */
  value?: (row: T) => SortValue;
  /** Custom renderer, replacing the kind's. */
  cell?: (row: T, context: DataTableCellContext) => React.ReactNode;
  /** A one-sentence explanation, shown from an info button beside the header. */
  help?: string;
  /** Let readers sort by this column from its header. */
  sortable?: boolean;
  /** Custom ascending comparator; defaults to comparing `value`. */
  compare?: (a: T, b: T) => number;

  /** `amount`: the unit. Default `ETH`. */
  unit?: AmountUnit;
  /** `amount`: print the unit. Default `true`; pass `false` under a header that names it. */
  showUnit?: boolean;
  /** `percent`: `percent` (default) reads 12.5 as 12.5%, `ratio` reads 0.125 as 12.5%. */
  percentScale?: 'percent' | 'ratio';
  /** `datetime`: show seconds. */
  seconds?: boolean;
  /** `datetime`: the year rule. Default `auto` (only when it is not this year). */
  year?: 'auto' | 'always' | 'never';
  /** `datetime`: the transaction the date proves; links the date to the explorer. */
  txHash?: (row: T) => string | null | undefined;
  /**
   * `link`, `address`, `datetime`: the internal destination. For `address` it
   * defaults to `/user/<address>`; return `null` for an address that should
   * not link.
   */
  href?: (row: T) => string | null | undefined;
  /** `address`: show the copy button. Default `false` in tables. */
  copy?: boolean;
  /** `address`: the zero address's role in a transfer (imprinted / consumed). */
  zeroRole?: 'from' | 'to';
  /** `address`: the address the page is about, which reads "This address". */
  currentAddress?: string | null;
  /**
   * What a blank value shows: `empty` (not applicable: nothing), `unknown`
   * (a dash announced as unavailable: the value could not be read) or
   * `none` (a dash announced as "None": there is truly none, such as a
   * largest Signature Allocation for a wallet that never received one). A
   * phone record leaves a `none` line out, since its absence already says
   * so. Numeric kinds default to `unknown`.
   */
  whenBlank?: 'empty' | 'unknown' | 'none';
  /** What a blank value's dash says to a screen reader. Default "Unavailable", or "None". */
  blankLabel?: string;

  /**
   * A heading shared by consecutive columns ("ETH by track"): a row above
   * the headers spans them, so each sub-header can drop the unit and the
   * words it shares. Phone records use each column's own `label`, so give
   * a grouped column a `label` that reads alone ("Chrono-Warrior (ETH)").
   */
  group?: string;

  /** `secondary`: dropped from phone records. */
  priority?: ColumnPriority;
  /**
   * The column's part in a phone record: `title` opens each record with its
   * value alone, unlabelled, at the start and in the foreground tier (the
   * row's identity: an address, a cycle, a date), so the reader scans the
   * records by it; `omit` leaves the value out of the record. A table that
   * stays a table on a phone (`compact`) ignores it.
   */
  phone?: 'title' | 'omit';
  /** In a phone record, put the value under its label (long text). */
  stack?: boolean;
  /** Drop the column on a page where no row has a value, instead of an empty column. */
  hideWhenEmpty?: boolean;
  /** Overrides the kind's alignment. Rarely right: headers follow it too. */
  align?: ColumnAlign;
  /** Overrides the kind's wrapping: `true` keeps a short label ("Cycle 12") on one line. */
  nowrap?: boolean;
  /** CSS width of the column (`'8rem'`, `'20%'`). */
  width?: string;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableProps<T> {
  data: readonly T[];
  columns: readonly DataTableColumn<T>[];
  /**
   * The table's accessible name. With `title` the visible heading names the
   * table and this names its scroll region.
   */
  ariaLabel: string;
  /** A visible heading above the table, which also names it. */
  title?: React.ReactNode;
  /** The heading's level in the page outline. Default 2. */
  headingLevel?: 2 | 3 | 4;
  /** A line under the title. */
  description?: React.ReactNode;
  /** Controls at the end of the title row (a filter, a link). */
  actions?: React.ReactNode;
  /**
   * A line under the title that shows in every state, loading, empty and
   * error included (a read-only notice), so it never moves the table when
   * the rows arrive.
   */
  notice?: React.ReactNode;
  /** A bar between the title and the table (filters). */
  toolbar?: React.ReactNode;
  /**
   * A note under the table beside the row range ("Muted amounts are below
   * 0.01 CST"), after the time zone when the table shows dates.
   */
  caption?: React.ReactNode;
  /**
   * States the reader's time zone under a table with dates (default). Pass
   * `false` where the page already prints the zone beside a standalone date
   * (a Signature's record), so a screen states it once.
   */
  timeZoneNote?: boolean;

  /** Stable key per row. Defaults to the index, which re-mounts rows on sort. */
  getRowKey?: (row: T, index: number) => React.Key;
  /**
   * Where the row leads. The first column's content becomes a real link (the
   * keyboard and screen-reader entry point) and a click anywhere else on the
   * row follows it too. Return `null` for a row without a destination.
   */
  getRowHref?: (row: T, index: number) => string | null | undefined;
  /**
   * Words a screen reader hears after the row link's visible text, naming
   * where it leads ("Gesture #1143" after "Sep 24, 07:31:51"). They are
   * appended, never substituted: the link's name always starts with what it
   * shows, so a voice user can say what they see (WCAG 2.5.3 Label in
   * Name). Leave it out when the visible text already names the
   * destination ("Cycle 12").
   */
  getRowLabel?: (row: T, index: number) => string;
  /** The column that carries the row link and the "You" tag. Default: the first. */
  rowLinkColumn?: string;
  /** Extra classes per row (a hidden, muted row). */
  rowClassName?: (row: T) => string | undefined;

  /**
   * The connected wallet's row. It stays in its place in the order, marked
   * with an accent rule and a "You" tag, and a line above the table gives
   * its position with a way to jump to its page.
   */
  isCurrentRow?: (row: T) => boolean;
  /** Extra figures for that line ("12 gestures"). */
  currentRowSummary?: (row: T) => React.ReactNode;

  /**
   * Content a row can expand to show under itself (the records a summary row
   * stands for). Adds a disclosure button at the row's end; return `null`
   * for a row with nothing to expand.
   */
  renderDetails?: (row: T) => React.ReactNode;
  /** The disclosure button's text for a row, expanded or not. */
  detailsLabel?: (row: T, expanded: boolean) => string;
  /** The disclosure column's header ("Records"). Default "Details". */
  detailsHeader?: string;

  loading?: boolean;
  /** Placeholder rows while loading. Default 5. */
  skeletonRows?: number;
  /** A load failure: the message under the error title. */
  error?: React.ReactNode;
  errorTitle?: string;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  emptyIcon?: React.ReactNode;

  /** The order before anyone sorts. Without it, rows keep the order given. */
  initialSort?: { id: string; direction: SortDirection };
  /**
   * Rows per page. Default 20, or 10 on a phone.
   * `Infinity` shows every row.
   */
  pageSize?: number;
  /** Controlled page (1-based), with `onPageChange`. */
  page?: number;
  onPageChange?: (page: number) => void;
  /** Changing this value returns the table to page 1 (a new filter, a new search). */
  resetPageKey?: unknown;

  /**
   * Phone layout. `auto` (default) keeps a real table only for up to three
   * compact columns (an address, a figure, a short link) and turns any other
   * table into records; see `phoneLayoutFor`.
   */
  layout?: 'auto' | TableLayout;
  /** Row height: `comfortable` 48px (default) or `compact` 40px. */
  density?: 'comfortable' | 'compact';
  /**
   * How wide the table runs on a wide screen. `auto` (default) keeps a short
   * ledger (four columns or fewer) at one reading width, 56rem, so a row is
   * not a 1,200px scan from its address to its figure and short ledgers
   * stacked on a page share a right edge. `fill` always runs the full width
   * of its container. Without this prop the table takes the width of the
   * nearest `<DataTableWidth>`, which a page sets when it stacks short and
   * wide ledgers, so all of them share one right edge. The empty and error
   * states always take the full width, so they stay centred on their section.
   */
  width?: DataTableWidthMode;
  /**
   * `quiet` underlines a cell's links only on hover and keyboard focus, for
   * a dense ledger whose every row carries several (a date, an address, a
   * cycle) that would compete with the text being read. The links keep
   * their foreground ink, and the row itself shows that it is interactive.
   */
  links?: 'underlined' | 'quiet';
  /** Classes on the outer wrapper. */
  className?: string;
  /** Classes on the `<table>` (a `min-width` for a wide ledger). */
  tableClassName?: string;
}

interface ResolvedColumn<T> {
  column: DataTableColumn<T>;
  label: string;
  kind: ColumnKind;
  align: LogicalAlign;
  numeric: boolean;
  nowrap: boolean;
  priority: ColumnPriority;
  help?: string;
  valueOf: (row: T) => SortValue;
  hasValue: boolean;
}

/** The label beside a column's value in a phone record; see `DataTableColumn.label`. */
function columnLabel<T>(column: DataTableColumn<T>): string {
  if (column.label !== undefined) return column.label;
  if (typeof column.header === 'string') return column.header;
  if (process.env.NODE_ENV !== 'production') {
    console.warn(
      `DataTable column "${column.id}": a header that is not plain text needs a \`label\` for phone records.`,
    );
  }
  // Never the developer id ("quickView") beside a value, in any locale.
  return '';
}

function resolveColumn<T>(column: DataTableColumn<T>): ResolvedColumn<T> {
  const kind = column.kind ?? 'text';
  const spec = COLUMN_KINDS[kind];
  return {
    column,
    label: columnLabel(column),
    kind,
    align: column.align ? logicalAlign(column.align) : spec.align,
    numeric: spec.numeric,
    nowrap: column.nowrap ?? spec.nowrap,
    priority: column.priority ?? 'primary',
    help: column.help,
    valueOf: column.value ?? (() => undefined),
    hasValue: Boolean(column.value),
  };
}

function hasAnyValue<T>(col: ResolvedColumn<T>, rows: readonly T[]): boolean {
  return !col.hasValue || rows.some((row) => !isBlankValue(col.valueOf(row)));
}

/**
 * The most columns a ledger can have and still stop at the reading width
 * under `width="auto"`. One width for all of them, so short ledgers stacked
 * on one page (three columns, then four) end at the same right edge; sizing
 * each to its column count gave /statistics/participation three edges.
 */
const FIT_MAX_COLUMNS = 4;
const FIT_WIDTH_CLASS = 'max-w-4xl';

/** Consecutive columns under one `group` heading, and the ungrouped gaps between them. */
interface ColumnGroupCell {
  key: string;
  group: string | null;
  span: number;
}

function columnGroups<T>(columns: readonly ResolvedColumn<T>[]): ColumnGroupCell[] {
  const cells: ColumnGroupCell[] = [];
  for (const col of columns) {
    const group = col.column.group ?? null;
    const last = cells[cells.length - 1];
    if (last && last.group === group) last.span += 1;
    else cells.push({ key: col.column.id, group, span: 1 });
  }
  return cells;
}

/** Placeholder widths per kind, so the skeleton has the finished table's rhythm. */
const SKELETON_WIDTH: Record<ColumnKind, string> = {
  text: 'w-3/4',
  link: 'w-16',
  address: 'w-24',
  datetime: 'w-28',
  amount: 'w-16',
  count: 'w-8',
  percent: 'w-10',
  duration: 'w-20',
  status: 'w-6',
};

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  return (
    document.documentElement.dataset.motion === 'reduced' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

type SortState = { id: string; direction: SortDirection } | null;

const flip = (direction: SortDirection): SortDirection => (direction === 'asc' ? 'desc' : 'asc');

/**
 * The order after a click on a column's header. A column cycles through its
 * kind's first direction, the other direction, and back to the table's own
 * order. Every click changes something: when the table's own order already
 * sorts this column (in either direction), a click turns it around rather
 * than "returning" to the order it is already in.
 */
export function nextSort(
  current: SortState,
  id: string,
  firstDirection: SortDirection,
  initialSort?: { id: string; direction: SortDirection },
): SortState {
  if (!current || current.id !== id) return { id, direction: firstDirection };
  const isOwnOrder = initialSort?.id === current.id && initialSort.direction === current.direction;
  if (isOwnOrder || current.direction === firstDirection) {
    return { id, direction: flip(current.direction) };
  }
  return initialSort ?? null;
}

/**
 * DataTable: the one table. Pass `columns` with a `kind` each and `data`; the
 * table handles alignment, formatting, sorting (with `aria-sort`),
 * pagination, loading rows, the empty and error states, the connected
 * wallet's row and the phone layout.
 */
export function DataTable<T>({
  data,
  columns,
  ariaLabel,
  title,
  headingLevel = 2,
  description,
  actions,
  notice,
  toolbar,
  caption,
  timeZoneNote = true,
  getRowKey,
  getRowHref,
  getRowLabel,
  rowLinkColumn,
  rowClassName,
  isCurrentRow,
  currentRowSummary,
  renderDetails,
  detailsLabel,
  detailsHeader,
  loading = false,
  skeletonRows = 5,
  error,
  errorTitle,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction,
  emptyIcon,
  initialSort,
  pageSize: pageSizeProp,
  page: controlledPage,
  onPageChange,
  resetPageKey,
  layout: layoutProp = 'auto',
  density = 'comfortable',
  width: widthProp,
  links = 'underlined',
  className,
  tableClassName,
}: DataTableProps<T>) {
  const t = useTranslations('tables');
  const locale = useLocale();
  const router = useRouter();
  const headingId = React.useId();
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const isPhone = usePhoneLayout();
  const width = useDataTableWidth(widthProp);

  const resolved = React.useMemo(() => columns.map(resolveColumn), [columns]);
  // Columns with a value somewhere in the data. The phone layout follows
  // these, so it never switches between pages.
  const datasetColumns = React.useMemo(
    () => resolved.filter((col) => !col.column.hideWhenEmpty || hasAnyValue(col, data)),
    [resolved, data],
  );

  const kindLayout: TableLayout =
    layoutProp === 'auto'
      ? phoneLayoutFor(
          datasetColumns.map((col) => ({
            kind: col.kind,
            priority: col.priority,
            stack: col.column.stack,
          })),
        )
      : layoutProp;
  const pageSize = pageSizeProp ?? (isPhone ? PHONE_PAGE_SIZE : DEFAULT_PAGE_SIZE);

  // ── Sorting ───────────────────────────────────────────────────────────
  const [sort, setSort] = React.useState<SortState>(initialSort ?? null);

  const sorted = React.useMemo(() => {
    const active = sort ? resolved.find((col) => col.column.id === sort.id) : undefined;
    if (!sort || !active) return data;
    const { compare } = active.column;
    const indexed = data.map((row, index) => ({ row, index }));
    indexed.sort((a, b) => {
      const order = compare
        ? (sort.direction === 'asc' ? 1 : -1) * compare(a.row, b.row)
        : compareRows(active.valueOf(a.row), active.valueOf(b.row), sort.direction);
      // Ties keep their given order, so a sort never shuffles equal rows.
      return order || a.index - b.index;
    });
    return indexed.map(({ row }) => row);
  }, [data, resolved, sort]);

  // ── Paging ────────────────────────────────────────────────────────────
  // The page is remembered together with the key it was chosen under, so a
  // new `resetPageKey` (a filter) or sort order starts again from page 1
  // without an effect.
  const sortKey = sort ? `${sort.id}:${sort.direction}` : '';
  const [pageState, setPageState] = React.useState({ page: 1, key: resetPageKey, sortKey });
  const uncontrolledPage =
    pageState.key === resetPageKey && pageState.sortKey === sortKey ? pageState.page : 1;
  const paginate = Number.isFinite(pageSize) && pageSize > 0;
  const pageCount = paginate ? pageCountFor(sorted.length, pageSize) : 1;
  const page = Math.min(Math.max(controlledPage ?? uncontrolledPage, 1), pageCount);
  const pageRows = React.useMemo(
    () => (paginate ? sorted.slice((page - 1) * pageSize, page * pageSize) : sorted),
    [paginate, sorted, page, pageSize],
  );
  const pageOffset = paginate ? (page - 1) * pageSize : 0;
  // A column that may be empty shows only on pages where some row has it,
  // so a page of gestures without messages carries no blank Message column.
  const visible = datasetColumns.filter(
    (col) => !col.column.hideWhenEmpty || hasAnyValue(col, pageRows),
  );

  // An automatic compact table that turns out wider than a phone's column
  // (a panel's padding, longer words in a locale) reads as records instead.
  const compactFits = useCompactFit(
    scrollRef,
    isPhone && layoutProp === 'auto' && kindLayout === 'compact',
    pageRows,
  );
  const layout: TableLayout = kindLayout === 'compact' && !compactFits ? 'cards' : kindLayout;

  // Set by "Show my row": once its page is on screen, focus moves to the
  // connected wallet's row, since the button that was pressed is gone.
  const focusCurrentRowRef = React.useRef(false);

  const goToPage = (next: number, { scroll = true }: { scroll?: boolean } = {}) => {
    setPageState({ page: next, key: resetPageKey, sortKey });
    onPageChange?.(next);
    // Keep the reader at the top of the new page when they paged from the
    // bottom of a long table.
    const wrapper = wrapperRef.current;
    if (!scroll || !wrapper || typeof window === 'undefined') return;
    window.requestAnimationFrame(() => {
      if (wrapper.getBoundingClientRect().top < 0) {
        wrapper.scrollIntoView({
          block: 'start',
          behavior: prefersReducedMotion() ? 'auto' : 'smooth',
        });
      }
    });
  };

  React.useEffect(() => {
    if (!focusCurrentRowRef.current) return;
    focusCurrentRowRef.current = false;
    const row = scrollRef.current?.querySelector<HTMLElement>('tbody tr[data-current]');
    if (!row) return;
    // Its first link or button (the row link, the address), else the row
    // itself, which takes focus only from script (tabindex -1, no tab stop).
    let target = row.querySelector<HTMLElement>('a[href], button');
    if (!target) {
      row.tabIndex = -1;
      target = row;
    }
    target.focus({ preventScroll: true });
    if (typeof row.scrollIntoView === 'function') {
      row.scrollIntoView({
        block: 'nearest',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    }
  }, [page]);

  // Development only: a link inside the row link is invalid HTML and an axe
  // `nested-interactive` failure. The kinds' own links are dropped from the
  // row-link column; this catches a custom `cell` that renders one there.
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production' || !getRowHref) return;
    if (wrapperRef.current?.querySelector('tbody a a')) {
      console.error(
        `DataTable "${ariaLabel}": a cell in the row-link column renders a link inside the row link. Render plain content there, or move the link to another column.`,
      );
    }
  });

  const toggleSort = (col: ResolvedColumn<T>) => {
    setSort((current) =>
      nextSort(current, col.column.id, COLUMN_KINDS[col.kind].firstDirection, initialSort),
    );
  };

  // ── Expanded details ──────────────────────────────────────────────────
  const [expanded, setExpanded] = React.useState<ReadonlySet<React.Key>>(() => new Set());

  // ── The connected wallet's row ────────────────────────────────────────
  const currentIndex = isCurrentRow ? sorted.findIndex((row) => isCurrentRow(row)) : -1;
  const currentRow = currentIndex >= 0 ? sorted[currentIndex] : undefined;
  const currentPage = currentIndex >= 0 && paginate ? Math.floor(currentIndex / pageSize) + 1 : 1;

  const linkColumnId = rowLinkColumn ?? visible[0]?.column.id;
  const hasDatetime = timeZoneNote && visible.some((col) => col.kind === 'datetime');
  const cellPadding = density === 'compact' ? 'py-2.5' : 'py-3';
  // An empty or error state's title sits one level under the table's own
  // heading, or takes the table's place in the outline when it has none.
  const stateHeadingLevel = title ? (Math.min(headingLevel + 1, 4) as 3 | 4) : headingLevel;
  const columnCount = visible.length + (renderDetails ? 1 : 0);
  // Measured on the whole data set, so the width holds from page to page.
  // Only the table itself (and its loading rows) stops there: the empty and
  // error states below take the section's full width, so they stay centred.
  const fitClass =
    width === 'auto' && datasetColumns.length + (renderDetails ? 1 : 0) <= FIT_MAX_COLUMNS
      ? FIT_WIDTH_CLASS
      : undefined;
  const groups = visible.some((col) => col.column.group) ? columnGroups(visible) : null;

  const toggleDetails = (key: React.Key) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // The title block is the site's one section header, so a ledger's heading,
  // intro and spacing match every other section on its page: the page tier
  // for an h2, the panel tier inside a section. A titled ledger is itself a
  // <section> (unnamed, so not a landmark), which scopes that <header> to it:
  // outside one, a <header> that is not in <main> would be a banner.
  const Frame = title ? 'section' : 'div';
  const header = title ? (
    <SectionHeader
      as={`h${headingLevel}`}
      size={headingLevel === 2 ? 'page' : 'panel'}
      headingId={headingId}
      title={title}
      description={description}
      actions={actions}
    />
  ) : actions || description ? (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      {description ? (
        <p
          className={cn(
            'min-w-0 max-w-[var(--measure-lede)] text-muted-foreground',
            headingLevel === 2 ? 'type-body-md' : 'type-body-sm',
          )}
        >
          {description}
        </p>
      ) : null}
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  ) : null;

  if (error) {
    return (
      <Frame ref={wrapperRef} className={className}>
        {header}
        {notice}
        <ErrorState
          title={errorTitle}
          message={error}
          onRetry={onRetry}
          headingLevel={stateHeadingLevel}
        />
      </Frame>
    );
  }

  if (!loading && data.length === 0) {
    return (
      <Frame ref={wrapperRef} className={className}>
        {header}
        {notice}
        {toolbar}
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle ?? t('empty.nothingHere')}
          description={emptyDescription}
          action={emptyAction}
          headingLevel={stateHeadingLevel}
        />
      </Frame>
    );
  }

  const showSkeleton = loading && data.length === 0;

  return (
    <Frame
      ref={wrapperRef}
      data-slot="data-table"
      className={cn('scroll-mt-[calc(var(--header-height,4.5rem)+1rem)]', fitClass, className)}
    >
      {header}
      {notice}
      {toolbar}

      {currentRow !== undefined && !showSkeleton ? (
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 type-body-sm">
          <YouBadge />
          <span className="tabular-nums text-muted-foreground">
            {t('currentRow.position', {
              rank: formatCount(currentIndex + 1, locale),
              total: formatCount(sorted.length, locale),
            })}
          </span>
          {currentRowSummary ? (
            <span className="text-muted-foreground">{currentRowSummary(currentRow)}</span>
          ) : null}
          {currentPage !== page ? (
            <button
              type="button"
              onClick={() => {
                focusCurrentRowRef.current = true;
                goToPage(currentPage, { scroll: false });
              }}
              data-touch-target="extended"
              className={cn(TABLE_LINK_CLASS, TOUCH_TARGET_EXTENDED_CLASS, 'type-body-sm')}
            >
              {t('currentRow.show')}
            </button>
          ) : null}
        </div>
      ) : null}

      {showSkeleton ? (
        <p role="status" className="sr-only">
          {t('skeleton.loadingRows')}
        </p>
      ) : null}

      <ResponsiveTableContainer ref={scrollRef} label={ariaLabel}>
        <ResponsiveTable
          layout={layout}
          aria-label={title ? undefined : ariaLabel}
          aria-labelledby={title ? headingId : undefined}
          aria-busy={loading || undefined}
          data-links={links === 'quiet' ? 'quiet' : undefined}
          className={tableClassName}
        >
          <ResponsiveTableHead>
            {groups ? (
              // A group heading is a column header that spans its columns
              // (`scope="col"` with `colSpan`: the table has no <colgroup>
              // for a `colgroup` scope to point at). The cells over ungrouped
              // columns hold nothing, so assistive tech skips them.
              <tr data-slot="column-groups">
                {groups.map((cell) =>
                  cell.group ? (
                    <th
                      key={cell.key}
                      colSpan={cell.span}
                      scope="col"
                      data-align="center"
                      className="border-b border-rule-faint px-4 pt-3 pb-1.5 align-bottom type-label text-subtle print:!text-foreground"
                    >
                      {cell.group}
                    </th>
                  ) : (
                    <td key={cell.key} colSpan={cell.span} aria-hidden="true" />
                  ),
                )}
                {renderDetails ? <td aria-hidden="true" /> : null}
              </tr>
            ) : null}
            <tr>
              {visible.map((col) => (
                <HeaderCell
                  key={col.column.id}
                  col={col}
                  sort={sort}
                  onSort={toggleSort}
                  explainLabel={t('tableHeaderHelp.explainColumn', { column: headerName(col) })}
                />
              ))}
              {renderDetails ? (
                <ResponsiveTableHeadCell align="end">
                  {detailsHeader ?? t('details.header')}
                </ResponsiveTableHeadCell>
              ) : null}
            </tr>
          </ResponsiveTableHead>
          <ResponsiveTableBody>
            {showSkeleton
              ? Array.from({ length: skeletonRows }, (_, rowIndex) => (
                  <tr key={rowIndex} role="row" aria-hidden="true">
                    {visible.map((col) => (
                      <ResponsiveTableCell
                        key={col.column.id}
                        label={col.label}
                        align={col.align}
                        priority={col.priority}
                        className={cellPadding}
                      >
                        <Skeleton
                          className={cn(
                            'inline-block h-3.5 align-middle',
                            SKELETON_WIDTH[col.kind],
                          )}
                        />
                      </ResponsiveTableCell>
                    ))}
                    {renderDetails ? (
                      <ResponsiveTableCell label={t('details.header')} className={cellPadding} />
                    ) : null}
                  </tr>
                ))
              : pageRows.map((row, pageIndex) => {
                  const index = pageOffset + pageIndex;
                  const key = getRowKey ? getRowKey(row, index) : index;
                  const href = getRowHref?.(row, index) ?? null;
                  const isCurrent = isCurrentRow?.(row) ?? false;
                  const activate = href ? () => router.push(href) : undefined;
                  const details = renderDetails?.(row) ?? null;
                  const isExpanded = details !== null && expanded.has(key);
                  // Built from the row's position, not its key: a key can hold
                  // spaces or brackets ("(All CS NFT Stakers)"), which an
                  // IDREF in aria-controls cannot carry.
                  const detailsId = `${headingId}-details-${index}`;

                  return (
                    <React.Fragment key={key}>
                      <ResponsiveTableRow
                        onActivate={activate}
                        current={isCurrent}
                        data-expanded={isExpanded ? 'true' : undefined}
                        className={rowClassName?.(row)}
                      >
                        {visible.map((col) => {
                          const value = col.valueOf(row);
                          const carriesRow = col.column.id === linkColumnId;
                          // The row link wraps this column's value, so the
                          // value's own link (an address, a proof) is dropped
                          // rather than nested inside it.
                          let content = renderCell(
                            col,
                            row,
                            { index, value, isCurrent },
                            { links: !(carriesRow && href) },
                          );
                          if (carriesRow && href) {
                            const destination = getRowLabel?.(row, index);
                            content = (
                              <Link href={href} className={TABLE_LINK_CLASS}>
                                {content}
                                {destination ? (
                                  <span className="sr-only"> {destination}</span>
                                ) : null}
                              </Link>
                            );
                          }
                          if (carriesRow && isCurrent) {
                            content = (
                              <span className="inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-1">
                                {content}
                                <YouBadge />
                              </span>
                            );
                          }
                          // Truly none: a phone record leaves the line out.
                          const noneHere =
                            col.column.whenBlank === 'none' && col.hasValue && isBlankValue(value);
                          return (
                            <ResponsiveTableCell
                              key={col.column.id}
                              label={col.label}
                              align={col.align}
                              numeric={col.numeric}
                              nowrap={col.nowrap}
                              stack={col.column.stack}
                              priority={col.priority}
                              phone={noneHere ? 'omit' : col.column.phone}
                              data-kind={col.kind}
                              className={cn(
                                cellPadding,
                                (col.numeric || col.kind === 'address') && 'text-foreground',
                                col.column.cellClassName,
                              )}
                            >
                              {content}
                            </ResponsiveTableCell>
                          );
                        })}
                        {renderDetails ? (
                          <ResponsiveTableCell
                            // The button names itself; a phone record shows
                            // it alone at the end of its line, unlabelled.
                            label=""
                            align="end"
                            nowrap
                            className={cellPadding}
                          >
                            {details !== null ? (
                              <button
                                type="button"
                                aria-expanded={isExpanded}
                                aria-controls={isExpanded ? detailsId : undefined}
                                onClick={() => toggleDetails(key)}
                                className={cn(
                                  TABLE_LINK_CLASS,
                                  'inline-flex min-h-6 items-center gap-1 no-underline hover:underline',
                                  'max-sm:min-h-11',
                                )}
                              >
                                {detailsLabel?.(row, isExpanded) ?? t('details.header')}
                                <ChevronDown
                                  aria-hidden
                                  className={cn(
                                    'size-3.5 shrink-0 text-subtle transition-transform duration-[var(--duration-fast)]',
                                    isExpanded && 'rotate-180',
                                  )}
                                />
                              </button>
                            ) : null}
                          </ResponsiveTableCell>
                        ) : null}
                      </ResponsiveTableRow>
                      {isExpanded ? (
                        <tr id={detailsId} role="row" data-detail="true">
                          <td
                            role="cell"
                            colSpan={columnCount}
                            className="border-b border-rule-faint bg-surface-sunken px-4 py-3"
                          >
                            {details}
                          </td>
                        </tr>
                      ) : null}
                    </React.Fragment>
                  );
                })}
          </ResponsiveTableBody>
        </ResponsiveTable>
      </ResponsiveTableContainer>

      {!showSkeleton ? (
        <TablePagination
          page={page}
          pageSize={paginate ? pageSize : Math.max(sorted.length, 1)}
          total={sorted.length}
          onPageChange={goToPage}
          caption={
            hasDatetime || caption ? (
              <>
                {hasDatetime ? <TimeZoneNote /> : null}
                {hasDatetime && caption ? <span aria-hidden> · </span> : null}
                {caption}
              </>
            ) : undefined
          }
          label={t('pagination.labelFor', { table: ariaLabel })}
        />
      ) : null}
    </Frame>
  );
}

function renderCell<T>(
  col: ResolvedColumn<T>,
  row: T,
  context: DataTableCellContext,
  { links }: { links: boolean },
): React.ReactNode {
  const { column } = col;
  if (column.cell) return column.cell(row, context);
  if (!col.hasValue) return null;
  // Nothing to show stays truly empty, so a phone record drops the line.
  if (isBlankValue(context.value) && !blankShowsUnknown(col.kind, column.whenBlank)) return null;
  return (
    <KindValue
      kind={col.kind}
      value={context.value}
      // `null` drops the kind's own link (an address's profile, a date's
      // proof) where the row link already wraps the value.
      href={!links ? null : column.href ? column.href(row) : undefined}
      txHash={links ? column.txHash?.(row) : null}
      unit={column.unit}
      showUnit={column.showUnit}
      percentScale={column.percentScale}
      seconds={column.seconds}
      year={column.year}
      copy={column.copy}
      zeroRole={column.zeroRole}
      currentAddress={column.currentAddress}
      whenBlank={column.whenBlank}
      blankLabel={column.blankLabel}
    />
  );
}

/** A column's name as its header says it: the header text, else its label. */
function headerName<T>(col: ResolvedColumn<T>): string {
  return typeof col.column.header === 'string' ? col.column.header : col.label;
}

function HeaderCell<T>({
  col,
  sort,
  onSort,
  explainLabel,
}: {
  col: ResolvedColumn<T>;
  sort: { id: string; direction: SortDirection } | null;
  onSort: (col: ResolvedColumn<T>) => void;
  explainLabel: string;
}) {
  const { column } = col;
  const active = sort?.id === column.id ? sort.direction : null;
  const Arrow = active === 'asc' ? ArrowUp : ArrowDown;
  // On an end-aligned column the arrow leads, keeping the label at the edge.
  const leads = col.align === 'end';
  // The arrow sits in the label's own line of text, joined to the nearest
  // word by U+2060 (no break there), so a label that wraps keeps its arrow
  // beside it instead of stranding it at the far side of the cell. Both are
  // hidden from assistive tech, which hears the order from `aria-sort`.
  const arrow = active ? (
    <span aria-hidden className="whitespace-nowrap">
      {leads ? null : '\u2060'}
      <Arrow className={cn('inline-block size-3.5 align-[-0.125em]', leads ? 'me-1' : 'ms-1')} />
      {leads ? '\u2060' : null}
    </span>
  ) : null;

  // A sortable header keeps its label where every other header has it: only
  // the active column shows its arrow in the text. Pointing at, or tabbing
  // to, an unsorted one shows a faint two-way arrow in the cell's padding
  // (outside the label, so nothing moves) to say the column can be sorted.
  const hint =
    column.sortable && !active ? (
      <ArrowUpDown
        aria-hidden
        data-slot="sort-hint"
        className={cn(
          'pointer-events-none absolute top-1/2 size-3.5 -translate-y-1/2 text-subtle opacity-0',
          'transition-opacity duration-[var(--duration-fast)]',
          'group-hover/sort:opacity-100 group-focus-visible/sort:opacity-100',
          leads ? 'end-full me-0.5' : 'start-full ms-0.5',
        )}
      />
    ) : null;
  const label = column.sortable ? (
    <button
      type="button"
      onClick={() => onSort(col)}
      // A text button in a header row cannot grow to 44px without pushing the
      // row taller; on a phone a transparent pad carries the target instead.
      data-touch-target="extended"
      className={cn(
        TOUCH_TARGET_EXTENDED_CLASS,
        'group/sort inline-block min-w-0 max-w-full rounded-sm [text-align:inherit]',
        'transition-colors duration-[var(--duration-fast)] hover:text-foreground',
        active && 'text-foreground',
      )}
    >
      {hint}
      {leads ? arrow : null}
      <span>{column.header}</span>
      {leads ? null : arrow}
    </button>
  ) : (
    <span className="min-w-0">{column.header}</span>
  );

  return (
    <ResponsiveTableHeadCell
      align={col.align}
      numeric={col.numeric}
      priority={col.priority}
      // A header with a help button would otherwise be named by both
      // ("Net (ETH) Explain column: Net (ETH)"), and a screen reader repeats
      // a column's name every time the reader moves into it. The button
      // inside stays operable.
      aria-label={col.help ? headerName(col) : undefined}
      style={column.width ? { width: column.width } : undefined}
      aria-sort={
        column.sortable
          ? active === 'asc'
            ? 'ascending'
            : active === 'desc'
              ? 'descending'
              : 'none'
          : undefined
      }
      className={column.headerClassName}
    >
      {col.help ? (
        // The help button trails its label, so it always reads as part of
        // this column's header rather than floating towards the next one.
        // On coarse pointers its 44px box reaches 15px left of the icon; a
        // 20px gap keeps that box off a sortable label, so a tap on the end
        // of the label sorts instead of opening the help.
        <span
          className={cn(
            'inline-flex max-w-full items-end gap-1.5 align-bottom',
            column.sortable && 'pointer-coarse:gap-5',
          )}
        >
          {label}
          <InfoTooltip
            content={col.help}
            ariaLabel={explainLabel}
            className="mb-0.5"
            iconClassName="size-3.5"
          />
        </span>
      ) : (
        label
      )}
    </ResponsiveTableHeadCell>
  );
}
