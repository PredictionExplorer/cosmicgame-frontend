'use client';

import { Dna } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { CollectionTraits } from '@/hooks/useNftTraits';
import type { CategoricalTraitKey, FacetOption } from '@/lib/nftMetadata';
import { cn } from '@/lib/utils';
import { toIntlLocale } from '@/utils/format';
import {
  SPECTRAL_CLASSES,
  camelTraitKey,
  spectralClassColor,
  toSpectralClass,
  useTraitLabels,
} from '@/components/nft/traits';
import { Skeleton } from '@/components/ui/skeleton';
import { Surface } from '@/components/ui/surface';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

import type { TraitFilterState } from '../traitFilters';

/** Props for {@link GalleryCollectionDna}. */
export interface GalleryCollectionDnaProps {
  /** `undefined` while the index loads; `null` when unavailable (renders nothing). */
  collectionTraits: CollectionTraits | null | undefined;
  selected: TraitFilterState;
  onSelect: (key: CategoricalTraitKey, value: string) => void;
  className?: string;
}

const DNA_KEYS: readonly CategoricalTraitKey[] = ['fate', 'spectralClass', 'structure'];

const BRAND_SEQUENCE = [
  'rgb(var(--aurora-cyan-rgb))',
  'rgb(var(--nebula-violet-rgb))',
  'rgb(var(--solar-gold-rgb))',
  'rgb(var(--chrono-rose-rgb))',
  'rgb(var(--impact-green-rgb))',
  'rgb(var(--stellar-white-rgb) / 0.7)',
];

const FATE_COLORS: Record<string, string> = {
  eternalDance: 'rgb(var(--impact-green-rgb))',
  ejection: 'rgb(var(--chrono-rose-rgb))',
};

function segmentColor(key: CategoricalTraitKey, value: string, index: number): string {
  if (key === 'spectralClass') return spectralClassColor(value);
  if (key === 'fate')
    return FATE_COLORS[camelTraitKey(value)] ?? BRAND_SEQUENCE[index % BRAND_SEQUENCE.length]!;
  return BRAND_SEQUENCE[index % BRAND_SEQUENCE.length]!;
}

/** Spectral classes read hottest → coolest; everything else stays most-common-first. */
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
  const intl = toIntlLocale(locale);
  const ordered = orderOptions(traitKey, options);
  const anySelected = selected.length > 0;

  return (
    <div className="min-w-0" data-testid={`dna-${traitKey}`}>
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {typeLabel(traitKey)}
      </p>
      <div className="flex h-2.5 w-full gap-px overflow-hidden rounded-full bg-white/[0.04]">
        {ordered.map((option, index) => {
          const color = segmentColor(traitKey, option.value, index);
          const label = valueLabel(traitKey, option.value);
          const active = selected.includes(option.value);
          return (
            <Tooltip key={option.value}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => onSelect(option.value)}
                  aria-pressed={active}
                  aria-label={t('dna.segmentAria', { value: label, count: option.count })}
                  style={{ flexGrow: option.count, backgroundColor: color }}
                  className={cn(
                    'min-w-[3px] transition-opacity duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    anySelected && !active ? 'opacity-35 hover:opacity-70' : 'hover:opacity-80',
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="top">
                <p className="font-medium">{label}</p>
                <p className="text-muted-foreground">{option.count.toLocaleString(intl)}</p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {ordered.slice(0, 6).map((option, index) => (
          <li
            key={option.value}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground"
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: segmentColor(traitKey, option.value, index) }}
            />
            <span className={cn(selected.includes(option.value) && 'text-foreground')}>
              {valueLabel(traitKey, option.value)}
            </span>
            <span className="font-mono tabular-nums text-muted-foreground/60">
              {option.count.toLocaleString(intl)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * GalleryCollectionDna — three proportional bars (fate, spectral class,
 * structure) showing how the archive splits; every segment filters the gallery.
 */
export function GalleryCollectionDna({
  collectionTraits,
  selected,
  onSelect,
  className,
}: GalleryCollectionDnaProps) {
  const t = useTranslations('traits');
  if (collectionTraits === null) return null;
  if (collectionTraits && collectionTraits.rarity.total === 0) return null;

  return (
    <Surface
      variant="glass-bordered"
      radius="lg"
      padding="md"
      className={cn('space-y-4', className)}
      data-testid="collection-dna"
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg border border-primary/15 bg-primary/[0.06] p-2 text-primary">
          <Dna className="h-4 w-4 text-white" aria-hidden />
        </span>
        <div>
          <h2 className="text-sm font-semibold">{t('dna.title')}</h2>
          <p className="text-xs text-muted-foreground">{t('dna.subtitle')}</p>
        </div>
      </div>
      {collectionTraits === undefined ? (
        <div
          role="status"
          className="grid gap-6 md:grid-cols-3"
          aria-busy="true"
          aria-label={t('dna.loading')}
        >
          {DNA_KEYS.map((key) => (
            <div key={key} className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-2.5 w-full rounded-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
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
    </Surface>
  );
}
