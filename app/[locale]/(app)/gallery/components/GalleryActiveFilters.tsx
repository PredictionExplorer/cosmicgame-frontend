'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { CATEGORICAL_TRAIT_KEYS, type CategoricalTraitKey } from '@/lib/nftMetadata';
import { cn } from '@/lib/utils';
import { formatCount } from '@/utils/format';
import { useTraitLabels } from '@/components/nft/traits';

import type { StatusFilter } from '../galleryQuery';
import type { ChaosRange, TraitFilterState } from '../traitFilters';

/** Props for {@link GalleryActiveFilters}. */
export interface GalleryActiveFiltersProps {
  status: StatusFilter;
  search: string;
  traits: TraitFilterState;
  chaosRange: ChaosRange | null;
  onClearStatus: () => void;
  onClearSearch: () => void;
  onRemoveTrait: (key: CategoricalTraitKey, value: string) => void;
  onClearChaos: () => void;
  /** The last chip went: where focus goes next (the result count). */
  onEmptied?: () => void;
  className?: string;
}

/** One active filter: what the chip shows and how it goes. */
interface ActiveFilter {
  key: string;
  facet: string;
  value: ReactNode;
  removeLabel: string;
  onRemove: () => void;
}

function FilterChip({
  facet,
  value,
  removeLabel,
  onRemove,
}: {
  facet: string;
  value: ReactNode;
  removeLabel: string;
  onRemove: () => void;
}) {
  return (
    <li className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-control border border-rule bg-surface ps-2.5 pe-1 type-caption">
      <span className="text-subtle">{facet}</span>
      <span className="min-w-0 truncate text-foreground">{value}</span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="relative inline-flex size-6 shrink-0 items-center justify-center rounded-edge text-subtle transition-colors duration-[var(--duration-fast)] hover:bg-surface-raised hover:text-foreground pointer-coarse:after:absolute pointer-coarse:after:-inset-2.5 pointer-coarse:after:content-['']"
      >
        <X aria-hidden className="size-3.5" />
      </button>
    </li>
  );
}

/**
 * GalleryActiveFilters — every active filter as a removable chip (the
 * status, the search, each trait value and the chaos range), so what narrows
 * the grid stays visible when the filter panel is closed. A removed chip
 * hands focus to the chip that takes its place (or the one before it), and
 * the last one to `onEmptied`, so the reader never falls back to the page top.
 */
export function GalleryActiveFilters({
  status,
  search,
  traits,
  chaosRange,
  onClearStatus,
  onClearSearch,
  onRemoveTrait,
  onClearChaos,
  onEmptied,
  className,
}: GalleryActiveFiltersProps) {
  const t = useTranslations('traits');
  const tGallery = useTranslations('gallery');
  const tSearch = useTranslations('search');
  const locale = useLocale();
  const { typeLabel, valueLabel } = useTraitLabels();
  const listRef = useRef<HTMLUListElement>(null);
  // The position of a chip just removed, until the URL has caught up.
  const removedAt = useRef<number | null>(null);

  const filters: ActiveFilter[] = [];
  if (status !== 'all') {
    const facet = tGallery('toolbar.show');
    const value = tGallery(`filters.${status}.label`);
    filters.push({
      key: 'status',
      facet,
      value,
      removeLabel: t('facets.removeFilter', { trait: facet, value }),
      onRemove: onClearStatus,
    });
  }
  if (search) {
    const facet = tSearch('gallery.submit');
    filters.push({
      key: 'search',
      facet,
      value: search,
      removeLabel: t('facets.removeFilter', { trait: facet, value: search }),
      onRemove: onClearSearch,
    });
  }
  for (const key of CATEGORICAL_TRAIT_KEYS) {
    for (const value of traits[key] ?? []) {
      const facet = typeLabel(key);
      const label = valueLabel(key, value);
      filters.push({
        key: `${key}:${value}`,
        facet,
        value: label,
        removeLabel: t('facets.removeFilter', { trait: facet, value: label }),
        onRemove: () => onRemoveTrait(key, value),
      });
    }
  }
  if (chaosRange) {
    const facet = typeLabel('chaos');
    filters.push({
      key: 'chaos',
      facet,
      value: (
        <span className="tabular-nums">
          {t('facets.chaosValue', {
            min: formatCount(chaosRange[0], locale),
            max: formatCount(chaosRange[1], locale),
          })}
        </span>
      ),
      removeLabel: t('facets.clearFacet', { trait: facet }),
      onRemove: onClearChaos,
    });
  }

  const filterKeys = filters.map((filter) => filter.key).join('|');
  useEffect(() => {
    const index = removedAt.current;
    if (index === null) return;
    removedAt.current = null;
    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [];
    const next = buttons[Math.min(index, buttons.length - 1)];
    if (next) next.focus();
    else onEmptied?.();
  }, [filterKeys, onEmptied]);

  if (filters.length === 0) return null;
  return (
    <ul
      ref={listRef}
      className={cn('flex flex-wrap items-center gap-2', className)}
      aria-label={t('facets.activeAria')}
      data-testid="active-trait-filters"
    >
      {filters.map((filter, index) => (
        <FilterChip
          key={filter.key}
          facet={filter.facet}
          value={filter.value}
          removeLabel={filter.removeLabel}
          onRemove={() => {
            removedAt.current = index;
            filter.onRemove();
          }}
        />
      ))}
    </ul>
  );
}
