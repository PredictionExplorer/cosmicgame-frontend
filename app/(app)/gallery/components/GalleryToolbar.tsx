'use client';

import { GallerySearchInput } from './GallerySearchInput';
import { GalleryFilterChips, type FilterKey } from './GalleryFilterChips';
import { GallerySortSelect, type SortKey } from './GallerySortSelect';
import { GalleryViewToggle, type ViewMode } from './GalleryViewToggle';

interface GalleryToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  filter: FilterKey;
  onFilterChange: (filter: FilterKey) => void;
  sort: SortKey;
  onSortChange: (sort: SortKey) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  resultCount?: number;
  totalCount?: number;
}

export function GalleryToolbar({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  filter,
  onFilterChange,
  sort,
  onSortChange,
  viewMode,
  onViewModeChange,
  resultCount,
  totalCount,
}: GalleryToolbarProps) {
  return (
    <div className="space-y-4 mb-8">
      <GallerySearchInput
        value={searchQuery}
        onChange={onSearchChange}
        onSearch={onSearchSubmit}
        resultCount={resultCount}
        totalCount={totalCount}
        className="max-w-2xl mx-auto"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <GalleryFilterChips value={filter} onChange={onFilterChange} />
        <div className="flex items-center gap-3">
          <GallerySortSelect value={sort} onChange={onSortChange} />
          <GalleryViewToggle value={viewMode} onChange={onViewModeChange} />
        </div>
      </div>
    </div>
  );
}
