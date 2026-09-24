'use client';

import type { ReactNode } from 'react';
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
  className?: string;
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
        className="relative inline-flex size-6 shrink-0 items-center justify-center rounded-edge text-subtle transition-colors duration-fast hover:bg-surface-raised hover:text-foreground pointer-coarse:after:absolute pointer-coarse:after:-inset-2.5 pointer-coarse:after:content-['']"
      >
        <X aria-hidden className="size-3.5" />
      </button>
    </li>
  );
}

/**
 * GalleryActiveFilters — every active filter as a removable chip (the
 * status, the search, each trait value and the chaos range), so what narrows
 * the grid stays visible when the filter panel is closed.
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
  className,
}: GalleryActiveFiltersProps) {
  const t = useTranslations('traits');
  const tGallery = useTranslations('gallery');
  const tSearch = useTranslations('search');
  const locale = useLocale();
  const { typeLabel, valueLabel } = useTraitLabels();

  const chips: ReactNode[] = [];
  if (status !== 'all') {
    const facet = tGallery('toolbar.show');
    const value = tGallery(`filters.${status}.label`);
    chips.push(
      <FilterChip
        key="status"
        facet={facet}
        value={value}
        removeLabel={t('facets.removeFilter', { trait: facet, value })}
        onRemove={onClearStatus}
      />,
    );
  }
  if (search) {
    const facet = tSearch('gallery.submit');
    chips.push(
      <FilterChip
        key="search"
        facet={facet}
        value={search}
        removeLabel={t('facets.removeFilter', { trait: facet, value: search })}
        onRemove={onClearSearch}
      />,
    );
  }
  for (const key of CATEGORICAL_TRAIT_KEYS) {
    for (const value of traits[key] ?? []) {
      const facet = typeLabel(key);
      const label = valueLabel(key, value);
      chips.push(
        <FilterChip
          key={`${key}:${value}`}
          facet={facet}
          value={label}
          removeLabel={t('facets.removeFilter', { trait: facet, value: label })}
          onRemove={() => onRemoveTrait(key, value)}
        />,
      );
    }
  }
  if (chaosRange) {
    const facet = typeLabel('chaos');
    chips.push(
      <FilterChip
        key="chaos"
        facet={facet}
        value={
          <span className="tabular-nums">
            {t('facets.chaosValue', {
              min: formatCount(chaosRange[0], locale),
              max: formatCount(chaosRange[1], locale),
            })}
          </span>
        }
        removeLabel={t('facets.clearFacet', { trait: facet })}
        onRemove={onClearChaos}
      />,
    );
  }

  if (chips.length === 0) return null;
  return (
    <ul
      className={cn('flex flex-wrap items-center gap-2', className)}
      aria-label={t('facets.activeAria')}
      data-testid="active-trait-filters"
    >
      {chips}
    </ul>
  );
}
