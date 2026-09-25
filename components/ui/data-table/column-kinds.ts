import type { LogicalAlign } from '@/components/ui/responsive-table';

/**
 * What a column holds. The kind decides, in one place, everything that used
 * to be restated (and to drift) in every table: alignment, wrapping, figure
 * style, the formatter or component that renders the value, the direction a
 * first click sorts in, and how values compare.
 *
 * | kind       | align  | renders with                          | first sort |
 * | ---------- | ------ | ------------------------------------- | ---------- |
 * | `text`     | start  | the value as text                     | A to Z     |
 * | `link`     | start  | an internal `Link` styled as a link   | A to Z     |
 * | `address`  | start  | `<AddressChip variant="plain">`       | A to Z     |
 * | `datetime` | start  | `<DateTime>`, linked to its tx proof  | newest     |
 * | `amount`   | end    | `<Amount context="table">`            | largest    |
 * | `count`    | end    | `formatCount`                         | largest    |
 * | `percent`  | end    | `formatPercent`                       | largest    |
 * | `duration` | end    | `<Duration>`                          | longest    |
 * | `status`   | center | its value as text; `cell` draws icons | A to Z     |
 *
 * On phones, `link`, `address`, `amount`, `count`, `percent` and `status`
 * are compact kinds: up to three of them stay a real table. See
 * {@link phoneLayoutFor}.
 */
export type ColumnKind =
  | 'text'
  | 'link'
  | 'address'
  | 'datetime'
  | 'amount'
  | 'count'
  | 'percent'
  | 'duration'
  | 'status';

export type SortDirection = 'asc' | 'desc';

/** A raw column value: what sorts, and what the kind's renderer formats. */
export type SortValue = string | number | bigint | boolean | null | undefined;

export interface ColumnKindSpec {
  readonly align: LogicalAlign;
  /** Tabular, lining figures. */
  readonly numeric: boolean;
  /** Never wraps: a date, an amount or a short address is one unit. */
  readonly nowrap: boolean;
  /** The direction a first click on the header sorts in. */
  readonly firstDirection: SortDirection;
  /**
   * Short enough to share a 320px screen with two other columns: an address,
   * a figure, a short link or a status icon. A date with its year, a duration
   * and free text are not, so a table holding one reads as records on phones.
   */
  readonly compact: boolean;
}

export const COLUMN_KINDS: Readonly<Record<ColumnKind, ColumnKindSpec>> = {
  text: { align: 'start', numeric: false, nowrap: false, firstDirection: 'asc', compact: false },
  link: { align: 'start', numeric: false, nowrap: false, firstDirection: 'asc', compact: true },
  address: { align: 'start', numeric: false, nowrap: true, firstDirection: 'asc', compact: true },
  datetime: { align: 'start', numeric: true, nowrap: true, firstDirection: 'desc', compact: false },
  amount: { align: 'end', numeric: true, nowrap: true, firstDirection: 'desc', compact: true },
  count: { align: 'end', numeric: true, nowrap: true, firstDirection: 'desc', compact: true },
  percent: { align: 'end', numeric: true, nowrap: true, firstDirection: 'desc', compact: true },
  duration: { align: 'end', numeric: true, nowrap: true, firstDirection: 'desc', compact: false },
  status: { align: 'center', numeric: false, nowrap: true, firstDirection: 'asc', compact: true },
};

/** The most columns a phone keeps as a real table. */
export const COMPACT_MAX_COLUMNS = 3;

/** What the phone layout needs to know about a column. */
export interface PhoneColumn {
  readonly kind: ColumnKind;
  /** `secondary` columns are dropped on phones, so they do not count. */
  readonly priority?: 'primary' | 'secondary';
  /** Long text set under its label: only a record can do that. */
  readonly stack?: boolean;
}

/**
 * The automatic phone layout. A table stays a real table (`compact`) only
 * when every column a phone shows is a compact kind and there are at most
 * three of them: an owner, a count and an amount fit 320px side by side. A
 * date, a duration or free text needs the width of a record line, so any
 * table holding one turns each row into a record (`cards`) instead of
 * cutting values off at the screen's edge.
 */
export function phoneLayoutFor(columns: readonly PhoneColumn[]): 'compact' | 'cards' {
  const shown = columns.filter((column) => column.priority !== 'secondary');
  const fits =
    shown.length > 0 &&
    shown.length <= COMPACT_MAX_COLUMNS &&
    shown.every((column) => COLUMN_KINDS[column.kind].compact && !column.stack);
  return fits ? 'compact' : 'cards';
}

/** True for a value a reader would see as nothing at all (NaN included). */
export function isBlankValue(value: SortValue): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'number') return Number.isNaN(value);
  return typeof value === 'string' && !value.trim();
}

const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });

/**
 * Ascending order for two raw values. Numbers (and bigints) compare
 * numerically and strings by a numeric-aware collation ("Cycle 9" before
 * "Cycle 10"). Blank values are never "smallest": callers keep them last in
 * both directions (see {@link compareRows}).
 */
export function compareSortValues(a: SortValue, b: SortValue): number {
  if (typeof a === 'bigint' && typeof b === 'bigint') return a === b ? 0 : a < b ? -1 : 1;
  const isNumeric = (value: SortValue) => typeof value === 'number' || typeof value === 'bigint';
  if (isNumeric(a) && isNumeric(b)) return Number(a) - Number(b);
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

/**
 * Orders two rows by their raw values in `direction`, with blank values last
 * whichever way the column is sorted, so a column of amounts never opens on
 * a run of dashes.
 */
export function compareRows(a: SortValue, b: SortValue, direction: SortDirection): number {
  const aBlank = isBlankValue(a);
  const bBlank = isBlankValue(b);
  if (aBlank || bBlank) return aBlank === bBlank ? 0 : aBlank ? 1 : -1;
  const order = compareSortValues(a, b);
  return direction === 'asc' ? order : -order;
}
