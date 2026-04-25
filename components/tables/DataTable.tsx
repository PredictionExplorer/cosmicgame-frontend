'use client';

import * as React from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { Table, Thead, Tr, Th, Td } from 'react-super-responsive-table';
import 'react-super-responsive-table/dist/SuperResponsiveTableStyle.css';

import { cn } from '@/lib/utils';
import { Surface } from '@/components/ui/surface';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import { SkeletonTableRow } from '@/components/ui/skeleton';

/**
 * DataTable — config-driven table primitive.
 *
 * Replaces hand-rolled tables that reimplement the same sort / density /
 * empty state / loading skeleton every time. Pass a `columns` schema and
 * `data`; the table handles sorting, row hover, density toggle, and
 * responsive mobile pivoting via react-super-responsive-table.
 *
 * Not a drop-in for every existing table — complex tables (nested rows,
 * multi-level headers, ad-hoc cell rendering) keep their current shape.
 * New tables and plain list tables should use this.
 */

export type SortDirection = 'asc' | 'desc';

export interface DataTableColumn<T> {
  /** Stable column id — used for sort persistence + React keys. */
  id: string;
  /** Column header label. */
  header: React.ReactNode;
  /** Accessor for sortable/searchable value. Use `render` for display. */
  accessor?: (row: T) => string | number | null | undefined;
  /** Custom cell renderer. Falls back to `accessor`. */
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  /** CSS width (e.g. `'120px'`, `'10%'`). */
  width?: string;
  /** Hide below `sm` breakpoint. */
  hideOnMobile?: boolean;
  /** Help-text tooltip rendered next to the header label. */
  tooltip?: string;
}

export type Density = 'comfortable' | 'compact';

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  /** Stable key per row. Defaults to array index (not ideal — pass a key). */
  getRowKey?: (row: T, index: number) => string | number;
  /** Callback when a row is clicked. */
  onRowClick?: (row: T, index: number) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Skeleton row count while loading. */
  skeletonRows?: number;
  /** localStorage key for density persistence. Pass `null` to disable. */
  densityStorageKey?: string | null;
  /** Initial sort config. */
  initialSort?: { id: string; direction: SortDirection };
  /** Empty state title. */
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  /** Optional className on the outer Surface. */
  className?: string;
  /** aria-label for the table itself (required for a11y). */
  ariaLabel: string;
}

export function DataTable<T>({
  data,
  columns,
  getRowKey,
  onRowClick,
  loading = false,
  error = null,
  onRetry,
  skeletonRows = 6,
  densityStorageKey = 'cs.datatable.density',
  initialSort,
  emptyTitle = 'Nothing here yet',
  emptyDescription,
  emptyAction,
  className,
  ariaLabel,
}: DataTableProps<T>) {
  const [density, setDensity] = useDensityState(densityStorageKey);
  const [sort, setSort] = React.useState<{ id: string; direction: SortDirection } | null>(
    initialSort ?? null,
  );

  const sortedData = React.useMemo(() => {
    if (!sort) return data;
    const col = columns.find((c) => c.id === sort.id);
    if (!col || !col.accessor) return data;
    const accessor = col.accessor;
    const multiplier = sort.direction === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => compareValues(accessor(a), accessor(b)) * multiplier);
  }, [data, sort, columns]);

  const toggleSort = (id: string) => {
    setSort((current) => {
      if (!current || current.id !== id) return { id, direction: 'asc' };
      if (current.direction === 'asc') return { id, direction: 'desc' };
      return null;
    });
  };

  const rowPadding = density === 'compact' ? 'py-2' : 'py-3.5';
  const cellText = density === 'compact' ? 'text-xs' : 'text-sm max-sm:text-xs';

  return (
    <Surface variant="glass" radius="md" className={cn('overflow-hidden', className)}>
      <DensityToolbar density={density} onChange={setDensity} />
      {error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : loading ? (
        <div aria-busy="true" role="status" aria-label="Loading rows">
          {Array.from({ length: skeletonRows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={columns.length} />
          ))}
        </div>
      ) : sortedData.length === 0 ? (
        <EmptyState title={emptyTitle} description={emptyDescription} action={emptyAction} />
      ) : (
        <Table className="w-full border-collapse" aria-label={ariaLabel}>
          <Thead className="bg-white/[0.04] sticky top-0 z-[1]">
            <Tr>
              {columns.map((col) => {
                const isSorted = sort?.id === col.id;
                const direction = isSorted ? sort.direction : null;
                const Icon =
                  direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ArrowUpDown;
                return (
                  <Th
                    key={col.id}
                    style={col.width ? { width: col.width } : undefined}
                    aria-sort={
                      !col.sortable
                        ? undefined
                        : direction === 'asc'
                          ? 'ascending'
                          : direction === 'desc'
                            ? 'descending'
                            : 'none'
                    }
                    className={cn(
                      'border-b border-white/[0.06] px-4 py-3 type-eyebrow text-muted-foreground font-medium',
                      col.hideOnMobile && 'max-sm:hidden',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right',
                    )}
                  >
                    {col.sortable ? (
                      <span className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => toggleSort(col.id)}
                          className={cn(
                            'inline-flex items-center gap-1.5 transition-colors',
                            'hover:text-foreground',
                            isSorted && 'text-foreground',
                          )}
                        >
                          {col.header}
                          <Icon className="h-3 w-3" aria-hidden />
                        </button>
                        {col.tooltip ? (
                          <InfoTooltip content={col.tooltip} iconClassName="h-3 w-3" />
                        ) : null}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        {col.header}
                        {col.tooltip ? (
                          <InfoTooltip content={col.tooltip} iconClassName="h-3 w-3" />
                        ) : null}
                      </span>
                    )}
                  </Th>
                );
              })}
            </Tr>
          </Thead>
          <tbody>
            {sortedData.map((row, rowIdx) => {
              const key = getRowKey ? getRowKey(row, rowIdx) : rowIdx;
              const handleClick = onRowClick ? () => onRowClick(row, rowIdx) : undefined;
              const handleKeyDown = handleClick
                ? (e: React.KeyboardEvent<HTMLTableRowElement>) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleClick();
                    }
                  }
                : undefined;
              return (
                <Tr
                  key={key}
                  tabIndex={handleClick ? 0 : undefined}
                  role={handleClick ? 'button' : undefined}
                  onClick={handleClick}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    'border-0 border-b border-white/[0.03] transition-colors',
                    'duration-[var(--duration-fast)] ease-[var(--ease-out-soft)]',
                    handleClick && 'cursor-pointer hover:bg-white/[0.04]',
                  )}
                >
                  {columns.map((col) => (
                    <Td
                      key={col.id}
                      className={cn(
                        'px-4 text-muted-foreground leading-[1.43]',
                        rowPadding,
                        cellText,
                        col.hideOnMobile && 'max-sm:hidden',
                        col.align === 'center' && 'text-center',
                        col.align === 'right' && 'text-right',
                      )}
                    >
                      {col.render
                        ? col.render(row, rowIdx)
                        : col.accessor
                          ? String(col.accessor(row) ?? '')
                          : null}
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </Surface>
  );
}

function DensityToolbar({
  density,
  onChange,
}: {
  density: Density;
  onChange: (d: Density) => void;
}) {
  return (
    <div className="flex items-center justify-end border-b border-white/[0.06] px-2 py-1.5">
      <div
        role="group"
        aria-label="Row density"
        className="inline-flex rounded-md border border-white/[0.08] p-0.5"
      >
        {(['comfortable', 'compact'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={density === option}
            className={cn(
              'px-2 py-0.5 text-[10px] uppercase tracking-wider rounded-sm transition-colors',
              'duration-[var(--duration-fast)]',
              density === option
                ? 'bg-white/[0.08] text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Density state synced to localStorage via useSyncExternalStore so we never
 * call setState inside an effect (keeps the React-hooks lint rule happy and
 * stays compatible with React Compiler memoization). A custom event lets
 * multiple DataTables on the same page stay in sync within a single tab —
 * the default `storage` event only fires across tabs.
 */
function useDensityState(storageKey: string | null): [Density, (d: Density) => void] {
  const eventName = storageKey ? `${storageKey}:change` : null;

  const subscribe = React.useCallback(
    (callback: () => void) => {
      if (!eventName || typeof window === 'undefined') return () => {};
      window.addEventListener(eventName, callback);
      window.addEventListener('storage', callback);
      return () => {
        window.removeEventListener(eventName, callback);
        window.removeEventListener('storage', callback);
      };
    },
    [eventName],
  );

  const getSnapshot = React.useCallback((): Density => {
    if (!storageKey || typeof window === 'undefined') return 'comfortable';
    try {
      const v = window.localStorage.getItem(storageKey);
      return v === 'compact' || v === 'comfortable' ? v : 'comfortable';
    } catch {
      return 'comfortable';
    }
  }, [storageKey]);

  const getServerSnapshot = React.useCallback((): Density => 'comfortable', []);

  const density = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setDensity = React.useCallback(
    (d: Density) => {
      if (!storageKey || typeof window === 'undefined' || !eventName) return;
      try {
        window.localStorage.setItem(storageKey, d);
        window.dispatchEvent(new Event(eventName));
      } catch {
        // ignore
      }
    },
    [storageKey, eventName],
  );

  return [density, setDensity];
}

function compareValues(a: unknown, b: unknown): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}
