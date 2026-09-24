'use client';

import { useId, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import type { CollectionTraits } from '@/hooks/useNftTraits';
import type { CategoricalTraitKey, FacetOption } from '@/lib/nftMetadata';
import { cn } from '@/lib/utils';
import { formatCount } from '@/utils/format';
import { spectralClassColor, toSpectralClass, useTraitLabels } from '@/components/nft/traits';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';

import {
  countActiveTraitFilters,
  isFullChaosRange,
  type ChaosRange,
  type TraitFilterState,
} from '../traitFilters';

/** Facet order: the defining traits first, the sparse extras last. */
export const FACET_ORDER: readonly CategoricalTraitKey[] = [
  'structure',
  'palette',
  'spectralClass',
  'fate',
  'massBalance',
  'allocation',
  'symmetry',
  'projection',
  'underlay',
  'accent',
  'finish',
  'wildcard',
];

const DEFAULT_OPEN: readonly CategoricalTraitKey[] = [
  'structure',
  'palette',
  'spectralClass',
  'fate',
];
const COLLAPSED_OPTION_COUNT = 8;

/** Props for {@link GalleryTraitFacets}. */
export interface GalleryTraitFacetsProps {
  /** `undefined` while the index loads, `null` when it failed. */
  collectionTraits: CollectionTraits | null | undefined;
  selected: TraitFilterState;
  chaosRange: ChaosRange | null;
  onToggleValue: (key: CategoricalTraitKey, value: string) => void;
  onClearKey: (key: CategoricalTraitKey) => void;
  onChaosChange: (range: ChaosRange | null) => void;
  onClearAll: () => void;
  onRetry?: () => void;
  className?: string;
}

function FacetOptions({
  traitKey,
  options,
  selected,
  onToggle,
}: {
  traitKey: CategoricalTraitKey;
  options: FacetOption[];
  selected: readonly string[];
  onToggle: (value: string) => void;
}) {
  const t = useTranslations('traits');
  const locale = useLocale();
  const { typeLabel, valueLabel } = useTraitLabels();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? options : options.slice(0, COLLAPSED_OPTION_COUNT);
  const hiddenCount = options.length - visible.length;

  return (
    <ul className="space-y-px" aria-label={typeLabel(traitKey)}>
      {visible.map((option) => {
        const checked = selected.includes(option.value);
        const label = valueLabel(traitKey, option.value);
        const spectral = traitKey === 'spectralClass' ? toSpectralClass(option.value) : null;
        return (
          <li key={option.value}>
            <label
              className={cn(
                'flex min-h-9 cursor-pointer items-center gap-2.5 rounded-control px-2 type-body-sm transition-colors duration-[var(--duration-fast)] hover:bg-surface-raised',
                'pointer-coarse:min-h-11',
                checked ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              <Checkbox
                checked={checked}
                onChange={() => onToggle(option.value)}
                aria-label={t('facets.optionAria', { value: label, count: option.count })}
              />
              {spectral ? (
                <span
                  aria-hidden
                  className="size-2 shrink-0 rounded-full"
                  style={{ backgroundColor: spectralClassColor(spectral) }}
                />
              ) : null}
              <span className="min-w-0 flex-1 truncate">{label}</span>
              <span className="shrink-0 type-caption tabular-nums text-subtle">
                {formatCount(option.count, locale)}
              </span>
            </label>
          </li>
        );
      })}
      {hiddenCount > 0 || expanded ? (
        <li>
          <Button
            variant="link"
            size="sm"
            onClick={() => setExpanded((open) => !open)}
            className="h-9 px-2"
          >
            {expanded ? t('facets.showLess') : t('facets.showMore', { count: hiddenCount })}
          </Button>
        </li>
      ) : null}
    </ul>
  );
}

function ChaosRangeControl({
  bounds,
  value,
  onChange,
}: {
  bounds: { min: number; max: number };
  value: ChaosRange | null;
  onChange: (range: ChaosRange | null) => void;
}) {
  const t = useTranslations('traits');
  const locale = useLocale();
  const labelId = useId();
  const current: ChaosRange = value ?? [bounds.min, bounds.max];

  function update(next: ChaosRange) {
    const clamped: ChaosRange = [
      Math.min(Math.max(bounds.min, next[0]), next[1]),
      Math.max(Math.min(bounds.max, next[1]), next[0]),
    ];
    onChange(isFullChaosRange(clamped, bounds) ? null : clamped);
  }

  const disabled = bounds.min === bounds.max;

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      className="space-y-3 px-2"
      data-testid="chaos-range"
    >
      <div className="flex items-baseline justify-between gap-3">
        <span id={labelId} className="type-label text-muted-foreground">
          {t('facets.chaosRange')}
        </span>
        <span className="type-figure-sm text-foreground">
          {t('facets.chaosValue', {
            min: formatCount(current[0], locale),
            max: formatCount(current[1], locale),
          })}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5 type-caption text-subtle">
          {t('facets.chaosMin')}
          <input
            type="range"
            min={bounds.min}
            max={bounds.max}
            step={1}
            value={current[0]}
            disabled={disabled}
            onChange={(event) => update([Number(event.target.value), current[1]])}
            className="h-6 w-full cursor-pointer accent-primary"
          />
        </label>
        <label className="flex flex-col gap-1.5 type-caption text-subtle">
          {t('facets.chaosMax')}
          <input
            type="range"
            min={bounds.min}
            max={bounds.max}
            step={1}
            value={current[1]}
            disabled={disabled}
            onChange={(event) => update([current[0], Number(event.target.value)])}
            className="h-6 w-full cursor-pointer accent-primary"
          />
        </label>
      </div>
    </div>
  );
}

/**
 * GalleryTraitFacets — the trait filters: the chaos range, then one
 * collapsible list per categorical trait with its collection counts. Shown in
 * the desktop rail and in the filter sheet below `lg`.
 */
export function GalleryTraitFacets({
  collectionTraits,
  selected,
  chaosRange,
  onToggleValue,
  onClearKey,
  onChaosChange,
  onClearAll,
  onRetry,
  className,
}: GalleryTraitFacetsProps) {
  const t = useTranslations('traits');
  const locale = useLocale();
  const { typeLabel } = useTraitLabels();
  const activeCount = countActiveTraitFilters(selected, chaosRange);

  return (
    <div className={cn('space-y-4', className)} data-testid="trait-facets">
      <div className="flex min-h-9 items-center justify-between gap-2 px-2">
        <h2 className="flex items-center gap-2 type-title text-foreground">
          {t('facets.title')}
          {activeCount > 0 ? (
            <Badge tone="accent" size="sm">
              {formatCount(activeCount, locale)}
            </Badge>
          ) : null}
        </h2>
        {activeCount > 0 ? (
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            {t('facets.clearAll')}
          </Button>
        ) : null}
      </div>

      {collectionTraits === undefined ? (
        <div
          role="status"
          aria-busy="true"
          aria-label={t('facets.loading')}
          className="space-y-5 px-2"
          data-testid="facets-loading"
        >
          {Array.from({ length: 4 }, (_, index) => (
            <div key={index} className="space-y-2.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          ))}
        </div>
      ) : collectionTraits === null ? (
        <div className="space-y-3 px-2">
          <p className="type-body-sm text-muted-foreground">{t('facets.unavailable')}</p>
          {onRetry ? (
            <Button variant="outline" size="sm" onClick={onRetry}>
              {t('facets.retry')}
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          {collectionTraits.partial ? (
            <p className="px-2 type-caption text-subtle">
              {t('facets.partial', {
                indexed: formatCount(collectionTraits.indexed, locale),
                total: formatCount(collectionTraits.total, locale),
              })}
            </p>
          ) : null}
          {collectionTraits.chaos ? (
            <ChaosRangeControl
              bounds={collectionTraits.chaos}
              value={chaosRange}
              onChange={onChaosChange}
            />
          ) : null}
          <Accordion type="multiple" defaultValue={[...DEFAULT_OPEN]} className="w-full">
            {FACET_ORDER.map((key) => {
              const options = collectionTraits.facets[key];
              if (!options || options.length === 0) return null;
              const chosen = selected[key] ?? [];
              return (
                <AccordionItem key={key} value={key} className="border-rule-faint">
                  <AccordionTrigger className="min-h-11 px-2 py-2 type-label text-foreground hover:no-underline">
                    <span className="flex items-center gap-2">
                      {typeLabel(key)}
                      {chosen.length > 0 ? (
                        <Badge tone="accent" size="sm">
                          {formatCount(chosen.length, locale)}
                        </Badge>
                      ) : null}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-3">
                    <FacetOptions
                      traitKey={key}
                      options={options}
                      selected={chosen}
                      onToggle={(value) => onToggleValue(key, value)}
                    />
                    {chosen.length > 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onClearKey(key)}
                        className="mt-1 px-2"
                      >
                        {t('facets.clearFacet', { trait: typeLabel(key) })}
                      </Button>
                    ) : null}
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </>
      )}
    </div>
  );
}
