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
 * | `status`   | center | a status icon (the only centred kind) | A to Z     |
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
  /** Tabular, lining figures with a slashed zero. */
  readonly numeric: boolean;
  /** Never wraps: a date, an amount or a short address is one unit. */
  readonly nowrap: boolean;
  /** The direction a first click on the header sorts in. */
  readonly firstDirection: SortDirection;
}

export const COLUMN_KINDS: Readonly<Record<ColumnKind, ColumnKindSpec>> = {
  text: { align: 'start', numeric: false, nowrap: false, firstDirection: 'asc' },
  link: { align: 'start', numeric: false, nowrap: false, firstDirection: 'asc' },
  address: { align: 'start', numeric: false, nowrap: true, firstDirection: 'asc' },
  datetime: { align: 'start', numeric: true, nowrap: true, firstDirection: 'desc' },
  amount: { align: 'end', numeric: true, nowrap: true, firstDirection: 'desc' },
  count: { align: 'end', numeric: true, nowrap: true, firstDirection: 'desc' },
  percent: { align: 'end', numeric: true, nowrap: true, firstDirection: 'desc' },
  duration: { align: 'end', numeric: true, nowrap: true, firstDirection: 'desc' },
  status: { align: 'center', numeric: false, nowrap: true, firstDirection: 'asc' },
};

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
