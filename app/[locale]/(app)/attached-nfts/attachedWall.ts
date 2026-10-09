/*
 * The attached-NFT wall's order and paging, shared by the client page and the
 * server seed that resolves the first page's metadata (a server component
 * cannot read values from a 'use client' module).
 */

/** Plates per page. */
export const ATTACHED_WALL_PAGE_SIZE = 12;

/** Plates in the first viewport (one row from `lg`), which load eagerly. */
export const ATTACHED_WALL_EAGER = 4;

interface OrderedRecord {
  TimeStamp?: number | null;
  RecordId?: number | string | null;
}

function recordNumber(value: number | string | null | undefined): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : -1;
}

/** Newest first; records without a time (the indexer omits some) by their record id. */
export function newestAttachedFirst<T extends OrderedRecord>(records: readonly T[]): T[] {
  return [...records].sort(
    (a, b) =>
      (b.TimeStamp ?? 0) - (a.TimeStamp ?? 0) ||
      recordNumber(b.RecordId) - recordNumber(a.RecordId),
  );
}
