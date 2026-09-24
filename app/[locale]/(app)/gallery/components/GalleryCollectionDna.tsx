'use client';

import { useLocale, useTranslations } from 'next-intl';

import type { CollectionTraits } from '@/hooks/useNftTraits';
import type { CategoricalTraitKey, FacetOption } from '@/lib/nftMetadata';
import { cn } from '@/lib/utils';
import { formatCount } from '@/utils/format';
import {
  SPECTRAL_CLASSES,
  camelTraitKey,
  spectralClassColor,
  toSpectralClass,
  useTraitLabels,
} from '@/components/nft/traits';
import { Skeleton } from '@/components/ui/skeleton';

import type { TraitFilterState } from '../traitFilters';

/** Props for {@link GalleryCollectionDna}. */
export interface GalleryCollectionDnaProps {
  /** `undefined` while the index loads; `null` when unavailable (renders nothing). */
  collectionTraits: CollectionTraits | null | undefined;
  selected: TraitFilterState;
  onSelect: (key: CategoricalTraitKey, value: string) => void;
  /** The title's id, for a surrounding region's `aria-labelledby`. */
  titleId?: string;
  /** Hide the title and lede (a disclosure already names the panel). */
  hideHeading?: boolean;
  className?: string;
}

const DNA_KEYS: readonly CategoricalTraitKey[] = ['fate', 'spectralClass', 'structure'];

/** The fixed data series (docs/design-system.md → Data series), for inline swatches. */
const SERIES = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `hsl(var(--data-${n}))`);

/** The two fates keep one hue wherever they appear: a dance (green) and an ejection (pink). */
const FATE_SERIES: Record<string, string> = {
  eternalDance: 'hsl(var(--data-5))',
  ejection: 'hsl(var(--data-4))',
};

function segmentColor(key: CategoricalTraitKey, value: string, index: number): string {
  if (key === 'spectralClass') return spectralClassColor(value);
  if (key === 'fate') return FATE_SERIES[camelTraitKey(value)] ?? SERIES[index % SERIES.length]!;
  return SERIES[index % SERIES.length]!;
}

/** Spectral classes read hottest to coolest; everything else stays most common first. */
function orderOptions(key: CategoricalTraitKey, options: FacetOption[]): FacetOption[] {
  if (key !== 'spectralClass') return options;
  const rank = (value: string) => {
    const spectral = toSpectralClass(value);
    return spectral ? SPECTRAL_CLASSES.indexOf(spectral) : SPECTRAL_CLASSES.length;
  };
  return [...options].sort((a, b) => rank(a.value) - rank(b.value));
}

function DistributionBar({
  traitKey,
  options,
  selected,
  onSelect,
}: {
  traitKey: CategoricalTraitKey;
  options: FacetOption[];
  selected: readonly string[];
  onSelect: (value: string) => void;
}) {
  const t = useTranslations('traits');
  const locale = useLocale();
  const { typeLabel, valueLabel } = useTraitLabels();
  const ordered = orderOptions(traitKey, options);
  const anySelected = selected.length > 0;
  const groupLabel = typeLabel(traitKey);

  return (
    <div className="min-w-0" data-testid={`dna-${traitKey}`}>
      <p className="mb-2 type-label text-muted-foreground">{groupLabel}</p>
      {/* The bar is the picture; the legend under it holds the controls. */}
      <div aria-hidden className="flex h-2 w-full gap-px" data-testid="dna-bar">
        {ordered.map((option, index) => {
          const active = selected.includes(option.value);
          return (
            <span
              key={option.value}
              style={{
                flexGrow: option.count,
                backgroundColor: segmentColor(traitKey, option.value, index),
              }}
              className={cn(
                'min-w-[3px] transition-opacity duration-base first:rounded-l-pill last:rounded-r-pill',
                anySelected && !active && 'opacity-30',
              )}
            />
          );
        })}
      </div>
      <ul
        className="mt-2.5 flex flex-wrap gap-1.5"
        aria-label={groupLabel}
        data-testid="dna-legend"
      >
        {ordered.map((option, index) => {
          const label = valueLabel(traitKey, option.value);
          const active = selected.includes(option.value);
          return (
            <li key={option.value} className="min-w-0">
              <button
                type="button"
                onClick={() => onSelect(option.value)}
                aria-pressed={active}
                aria-label={t('dna.segmentAria', { value: label, count: option.count })}
                className={cn(
                  'inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-control border px-2 type-caption',
                  'pointer-coarse:min-h-11 pointer-coarse:px-3',
                  'transition-colors duration-fast',
                  active
                    ? 'border-primary/60 bg-primary/12 text-foreground'
                    : 'border-rule-faint text-muted-foreground hover:border-input hover:text-foreground',
                )}
              >
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: segmentColor(traitKey, option.value, index) }}
                />
                <span className="min-w-0 truncate">{label}</span>
                <span className="tabular-nums text-subtle">
                  {formatCount(option.count, locale)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * GalleryCollectionDna — how the archive splits across its three defining
 * traits (fate, spectral class, structure): a proportional bar each, and a
 * complete legend whose entries filter the gallery to that value. Stacked in
 * a narrow column (the rail, the sheet), three across in a wide one.
 */
export function GalleryCollectionDna({
  collectionTraits,
  selected,
  onSelect,
  titleId,
  hideHeading = false,
  className,
}: GalleryCollectionDnaProps) {
  const t = useTranslations('traits');
  if (collectionTraits === null) return null;
  if (collectionTraits && collectionTraits.rarity.total === 0) return null;

  return (
    <div className={cn('@container', className)} data-testid="collection-dna">
      {hideHeading ? null : (
        <div className="mb-4">
          <h2 id={titleId} className="type-title text-foreground">
            {t('dna.title')}
          </h2>
          <p className="mt-1 type-body-sm text-muted-foreground">{t('dna.subtitle')}</p>
        </div>
      )}
      {collectionTraits === undefined ? (
        <div
          role="status"
          aria-busy="true"
          aria-label={t('dna.loading')}
          className="grid gap-5 @2xl:grid-cols-3 @2xl:gap-8"
        >
          {DNA_KEYS.map((key) => (
            <div key={key} className="space-y-2.5">
              <Skeleton className="h-3.5 w-20" />
              <Skeleton className="h-2 w-full rounded-pill" />
              <div className="flex gap-1.5">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 @2xl:grid-cols-3 @2xl:gap-8">
          {DNA_KEYS.map((key) => (
            <DistributionBar
              key={key}
              traitKey={key}
              options={collectionTraits.facets[key] ?? []}
              selected={selected[key] ?? []}
              onSelect={(value) => onSelect(key, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
