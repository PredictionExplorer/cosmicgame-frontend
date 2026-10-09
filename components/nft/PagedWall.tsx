'use client';

import { useRef, useState, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { TablePagination } from '@/components/ui/pagination';

/**
 * Whether a wall shows its error state: only when nothing has loaded. A
 * failed background refetch (a remount after the data went stale, Retry,
 * an invalidation after a send) keeps the data it already has, so the wall
 * on screen stays up instead of turning into an error. `refreshFailed` is a
 * page's own evidence that an empty answer is a failure (the server snapshot
 * counted records a moment ago).
 */
export function wallReadFailed(
  query: { isError: boolean; data: unknown },
  refreshFailed = false,
): boolean {
  return (query.isError && query.data === undefined) || refreshFailed;
}

/** The page a wall shows: the requested one, kept within the pages there are. */
export function clampWallPage(page: number, total: number, pageSize: number): number {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  return Math.min(Math.max(1, Math.trunc(page) || 1), pageCount);
}

export interface PagedWallProps<T> {
  items: readonly T[];
  /** One work on the wall; `eager` is true for the first row of the first page. */
  renderItem: (item: T, context: { index: number; eager: boolean }) => ReactNode;
  /** A stable key per item. */
  itemKey: (item: T, index: number) => string | number;
  pageSize: number;
  /** The page in the URL (`useWallPage`); without it the wall keeps its own. */
  page?: number;
  onPageChange?: (page: number) => void;
  /** The grid's classes: `SIGNATURE_GRID_CLASS` plus the columns above two. */
  gridClassName: string;
  /** Names the list of works for assistive technology. */
  ariaLabel: string;
  /** Works on the first page that load eagerly (the first viewport's row). */
  eagerCount?: number;
  /** The wall is still loading: `loadingState` (its skeleton) shows instead. */
  loading?: boolean;
  loadingState?: ReactNode;
  /** Shown instead of the wall when set (compute it with `wallReadFailed`). */
  error?: ReactNode;
  /** Shown when the wall has no works. */
  empty?: ReactNode;
  /** After the pagination (a link to the rest of the collection). */
  footer?: ReactNode;
  className?: string;
}

/**
 * PagedWall — the one paged wall of works: the error, loading and empty
 * states in one order, the page clamped to the pages there are, the wall
 * scrolled back to its top on a page change, and the shared pagination.
 * Named Signatures and a wallet's collection (both through SignatureWall),
 * the attached NFTs and the used Random Walk NFTs all hang on it, so a fix to
 * how a wall pages reaches every wall. The gallery pages its filtered
 * results with its own URL-driven grid.
 */
export function PagedWall<T>({
  items,
  renderItem,
  itemKey,
  pageSize,
  page: controlledPage,
  onPageChange,
  gridClassName,
  ariaLabel,
  eagerCount = 0,
  loading = false,
  loadingState = null,
  error,
  empty = null,
  footer,
  className,
}: PagedWallProps<T>) {
  const [localPage, setLocalPage] = useState(1);
  const wallRef = useRef<HTMLDivElement>(null);

  if (error) return <>{error}</>;
  if (loading) return <>{loadingState}</>;
  if (items.length === 0) return <>{empty}</>;

  const current = clampWallPage(controlledPage ?? localPage, items.length, pageSize);
  const visible = items.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div ref={wallRef} className={cn('scroll-mt-[var(--sticky-offset)]', className)}>
      <ul className={gridClassName} aria-label={ariaLabel}>
        {visible.map((item, index) => (
          <li key={itemKey(item, index)} className="min-w-0">
            {renderItem(item, { index, eager: current === 1 && index < eagerCount })}
          </li>
        ))}
      </ul>
      <TablePagination
        page={current}
        pageSize={pageSize}
        total={items.length}
        onPageChange={(next) => {
          if (onPageChange) onPageChange(next);
          else setLocalPage(next);
          wallRef.current?.scrollIntoView?.({ block: 'start' });
        }}
        className="mt-10 border-t border-rule-faint pt-5 sm:pl-0"
      />
      {footer}
    </div>
  );
}
