import { isAddress } from 'viem';

import { sumAllocatedEth, type AllocationAmountRow } from '@/utils/allocationRecords';
import { toFiniteNumber } from '@/utils/finiteNumber';

/**
 * How a public data page's header figure is measured from its list: one
 * definition for the server, which measures the rows it read, and for the
 * browser, which measures the same list when the server's read failed
 * (`PublicDataFigureRefill`), so both give the same number for the same rows.
 */
export type ListMeasure =
  /** How many rows. */
  | { kind: 'count' }
  /**
   * How many distinct addresses: per row the first of `fields` that is set.
   * With `unknownWhenAbsent`, a list whose rows carry none of the fields
   * measures as unknown, never as 0 (an endpoint that omits owners says
   * nothing about ownership).
   */
  | { kind: 'distinct'; fields: readonly string[]; unknownWhenAbsent?: boolean }
  /** The sum of a count nested at `path` in every row. */
  | { kind: 'sum'; path: readonly string[] }
  /** The sum of every row's `AmountEth`. */
  | { kind: 'ethSum' }
  /** The ETH of the allocation record types only (history rows mix ETH, CST and NFT rows). */
  | { kind: 'allocatedEth' }
  /** The newest row's `TimeStamp`, in Unix seconds. */
  | { kind: 'latest' };

/** What a measure's number is: a count, an ETH amount or a date. */
export type MeasureUnit = 'count' | 'eth' | 'date';

/** The unit a measure's number is shown in. */
export function measureUnit(measure: ListMeasure): MeasureUnit {
  switch (measure.kind) {
    case 'ethSum':
    case 'allocatedEth':
      return 'eth';
    case 'latest':
      return 'date';
    default:
      return 'count';
  }
}

type Row = Record<string, unknown>;

/**
 * Distinct wallet or contract addresses, case-insensitively. Anything that is not an address
 * is skipped: the allocation history records Anchor Distribution ETH against the placeholder
 * "(All CS NFT Stakers)", which is not a wallet and must not count as a recipient.
 */
export function countDistinctAddresses(values: readonly unknown[]): number {
  const addresses = new Set<string>();
  for (const value of values) {
    if (typeof value === 'string' && isAddress(value, { strict: false })) {
      addresses.add(value.toLowerCase());
    }
  }
  return addresses.size;
}

/** The sum of every row's `AmountEth`. */
export function sumAmountEth(rows: readonly { AmountEth?: unknown }[]): number {
  return rows.reduce((total, row) => total + (toFiniteNumber(row.AmountEth) ?? 0), 0);
}

/** The newest `TimeStamp` (Unix seconds) among rows, or null when there is none. */
export function latestTimestamp(rows: readonly { TimeStamp?: unknown }[]): number | null {
  let latest: number | null = null;
  for (const row of rows) {
    const ts = toFiniteNumber(row.TimeStamp);
    if (ts !== null && ts > 0 && (latest === null || ts > latest)) latest = ts;
  }
  return latest;
}

function valueAt(row: Row, path: readonly string[]): unknown {
  let value: unknown = row;
  for (const key of path) {
    if (value === null || typeof value !== 'object') return undefined;
    value = (value as Row)[key];
  }
  return value;
}

/**
 * A list's measure: a number, or `null` when the rows cannot say (no row
 * dated for `latest`, no row carrying an address for a `distinct` measure
 * with `unknownWhenAbsent`).
 */
export function measureRows(rows: readonly object[], measure: ListMeasure): number | null {
  const records = rows as readonly Row[];
  switch (measure.kind) {
    case 'count':
      return records.length;
    case 'distinct': {
      const values = records.map(
        (row) => measure.fields.map((field) => row[field]).find(Boolean) ?? null,
      );
      if (measure.unknownWhenAbsent && records.length > 0 && !values.some(Boolean)) return null;
      return countDistinctAddresses(values);
    }
    case 'sum':
      return records.reduce(
        (total, row) => total + (toFiniteNumber(valueAt(row, measure.path)) ?? 0),
        0,
      );
    case 'ethSum':
      return sumAmountEth(records);
    case 'allocatedEth':
      return sumAllocatedEth(records as readonly AllocationAmountRow[]);
    case 'latest':
      return latestTimestamp(records);
  }
}
