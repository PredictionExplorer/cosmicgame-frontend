'use client';

import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { CATEGORICAL_TRAIT_KEYS, type CategoricalTraitKey } from '@/lib/nftMetadata';
import { cn } from '@/lib/utils';
import { useTraitLabels } from '@/components/nft/traits';

import { countActiveTraitFilters, type ChaosRange, type TraitFilterState } from '../traitFilters';

/** Props for {@link GalleryActiveFilters}. */
export interface GalleryActiveFiltersProps {
  selected: TraitFilterState;
  chaosRange: ChaosRange | null;
  onRemoveValue: (key: CategoricalTraitKey, value: string) => void;
  onClearChaos: () => void;
  onClearAll: () => void;
  className?: string;
}

/**
 * GalleryActiveFilters — removable chips for every active trait selection,
 * so the filter state is visible even when the facet rail is collapsed.
 */
export function GalleryActiveFilters({
  selected,
  chaosRange,
  onRemoveValue,
  onClearChaos,
  onClearAll,
  className,
}: GalleryActiveFiltersProps) {
  const t = useTranslations('traits');
  const { typeLabel, valueLabel } = useTraitLabels();
  const activeCount = countActiveTraitFilters(selected, chaosRange);
  if (activeCount === 0) return null;

  const chipClass =
    'inline-flex min-h-8 items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 pl-2.5 pr-1 text-xs text-foreground';
  const removeClass =
    'inline-flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

  return (
    <div
      className={cn('flex flex-wrap items-center gap-2', className)}
      role="group"
      aria-label={t('facets.activeAria')}
      data-testid="active-trait-filters"
    >
      {CATEGORICAL_TRAIT_KEYS.flatMap((key) =>
        (selected[key] ?? []).map((value) => {
          const trait = typeLabel(key);
          const label = valueLabel(key, value);
          return (
            <span key={`${key}:${value}`} className={chipClass}>
              <span className="text-muted-foreground">{trait}</span>
              <span aria-hidden className="text-muted-foreground/40">
                ·
              </span>
              <span>{label}</span>
              <button
                type="button"
                onClick={() => onRemoveValue(key, value)}
                aria-label={t('facets.removeFilter', { trait, value: label })}
                className={removeClass}
              >
                <X className="h-3 w-3" aria-hidden />
              </button>
            </span>
          );
        }),
      )}
      {chaosRange ? (
        <span className={chipClass}>
          <span className="text-muted-foreground">{typeLabel('chaos')}</span>
          <span aria-hidden className="text-muted-foreground/40">
            ·
          </span>
          <span className="font-mono tabular-nums">
            {t('facets.chaosValue', { min: chaosRange[0], max: chaosRange[1] })}
          </span>
          <button
            type="button"
            onClick={onClearChaos}
            aria-label={t('facets.clearFacet', { trait: typeLabel('chaos') })}
            className={removeClass}
          >
            <X className="h-3 w-3" aria-hidden />
          </button>
        </span>
      ) : null}
      {activeCount > 1 ? (
        <button
          type="button"
          onClick={onClearAll}
          className="min-h-8 px-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          {t('facets.clearAll')}
        </button>
      ) : null}
    </div>
  );
}
