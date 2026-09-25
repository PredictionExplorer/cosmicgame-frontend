'use client';

import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

import type { SortKey, StatusFilter, ViewMode } from '../galleryQuery';

import { GalleryFiltersButton } from './GalleryFiltersButton';
import { GallerySearchInput } from './GallerySearchInput';
import { GallerySortSelect } from './GallerySortSelect';
import { GalleryStatusFilter } from './GalleryStatusFilter';
import { GalleryViewToggle } from './GalleryViewToggle';

export interface GalleryToolbarProps {
  search: string;
  onSearchCommit: (query: string) => void;
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  view: ViewMode;
  onViewChange: (view: ViewMode) => void;
  /** Opens the trait rail (desktop) or the filter sheet (below `lg`). */
  onToggleFilters: () => void;
  /** The rail is open. */
  filtersOpen: boolean;
  /** Active filters counted on the Filters button. */
  activeFilterCount: number;
  /** Hide trait-based orders while the trait index is unavailable. */
  traitSortsAvailable: boolean;
  className?: string;
}

/**
 * The gallery's one control row. From `lg` it holds everything: search, the
 * status filter, Filters, sort and view, and stays under the header while the
 * grid scrolls. From `md` the sort order is in the row too, since a tablet has
 * the room; below `md` it is the search and the Filters button only (the
 * sheet holds the rest), and it scrolls away with the page, so the art gets
 * the screen.
 */
export const GalleryToolbar = forwardRef<HTMLDivElement, GalleryToolbarProps>(
  (
    {
      search,
      onSearchCommit,
      status,
      onStatusChange,
      sort,
      onSortChange,
      view,
      onViewChange,
      onToggleFilters,
      filtersOpen,
      activeFilterCount,
      traitSortsAvailable,
      className,
    },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        'flex items-center gap-2 lg:flex-wrap lg:gap-3',
        'lg:sticky lg:top-[var(--sticky-offset)] lg:z-30 lg:-mx-3 lg:rounded-surface lg:px-3 lg:py-2 lg:glass',
        className,
      )}
      data-testid="gallery-toolbar"
    >
      <GallerySearchInput
        value={search}
        onCommit={onSearchCommit}
        className="min-w-0 flex-1 lg:min-w-48 lg:max-w-xs"
      />
      <GalleryStatusFilter value={status} onChange={onStatusChange} className="max-lg:hidden" />
      <div className="flex shrink-0 items-center gap-2 lg:ms-auto lg:gap-3">
        <GalleryFiltersButton
          activeCount={activeFilterCount}
          pressed={filtersOpen}
          onClick={onToggleFilters}
        />
        <div className="flex items-center gap-3 max-md:hidden">
          <GallerySortSelect
            value={sort}
            onChange={onSortChange}
            traitSortsAvailable={traitSortsAvailable}
          />
          <GalleryViewToggle value={view} onChange={onViewChange} className="max-lg:hidden" />
        </div>
      </div>
    </div>
  ),
);
GalleryToolbar.displayName = 'GalleryToolbar';
