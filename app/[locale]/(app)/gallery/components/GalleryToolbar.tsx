'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/lib/utils';
import { TOUCH_TARGET_HEIGHT_CLASS } from '@/lib/touch-target';

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
  /** Opens / closes the trait facets (rail on wide screens, sheet elsewhere). */
  onToggleFacets?: () => void;
  facetsOpen?: boolean;
  activeTraitFilterCount?: number;
  /** Hide trait-based sort orders while the trait index is unavailable. */
  traitSortsAvailable?: boolean;
}

/** Search, status filters, trait facet toggle, sort, and view mode for the gallery. */
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
  onToggleFacets,
  facetsOpen = false,
  activeTraitFilterCount = 0,
  traitSortsAvailable = true,
}: GalleryToolbarProps) {
  const tTraits = useTranslations('traits');

  return (
    <div className="space-y-4">
      <GallerySearchInput
        value={searchQuery}
        onChange={onSearchChange}
        onSearch={onSearchSubmit}
        resultCount={resultCount}
        totalCount={totalCount}
        className="max-w-2xl mx-auto"
      />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {onToggleFacets ? (
            <button
              type="button"
              onClick={onToggleFacets}
              aria-pressed={facetsOpen}
              aria-label={tTraits('facets.toggleAria')}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200',
                TOUCH_TARGET_HEIGHT_CLASS,
                facetsOpen || activeTraitFilterCount > 0
                  ? 'border-primary/25 bg-primary/10 text-primary'
                  : 'border-white/[0.06] bg-white/[0.03] text-muted-foreground hover:bg-white/[0.06] hover:text-foreground',
              )}
              data-testid="facets-toggle"
            >
              <SlidersHorizontal className="h-3 w-3" aria-hidden />
              {activeTraitFilterCount > 0
                ? tTraits('facets.toggleWithCount', { count: activeTraitFilterCount })
                : tTraits('facets.toggle')}
            </button>
          ) : null}
          <GalleryFilterChips value={filter} onChange={onFilterChange} />
        </div>
        <div className="flex items-center gap-3">
          <GallerySortSelect
            value={sort}
            onChange={onSortChange}
            traitSortsAvailable={traitSortsAvailable}
          />
          <GalleryViewToggle value={viewMode} onChange={onViewModeChange} />
        </div>
      </div>
    </div>
  );
}
