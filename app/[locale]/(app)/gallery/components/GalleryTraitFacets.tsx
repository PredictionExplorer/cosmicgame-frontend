'use client';

import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import type { CollectionTraits } from '@/hooks/useNftTraits';
import type { CategoricalTraitKey, FacetOption } from '@/lib/nftMetadata';
import { cn } from '@/lib/utils';
import { toIntlLocale } from '@/utils/format';
import { spectralClassColor, toSpectralClass, useTraitLabels } from '@/components/nft/traits';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';

import {
  countActiveTraitFilters,
  isFullChaosRange,
  type ChaosRange,
  type TraitFilterState,
} from '../traitFilters';

/** Facet order in the rail: the defining traits first, the sparse extras last. */
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
  /** Number of NFTs matching the current filters, shown in the header. */
  matchCount?: number;
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
  const { valueLabel } = useTraitLabels();
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? options : options.slice(0, COLLAPSED_OPTION_COUNT);
  const hiddenCount = options.length - visible.length;
  const intl = toIntlLocale(locale);

  return (
    <ul className="space-y-0.5" aria-label={t(`types.${traitKey}`)}>
      {visible.map((option) => {
        const checked = selected.includes(option.value);
        const label = valueLabel(traitKey, option.value);
        const spectral = traitKey === 'spectralClass' ? toSpectralClass(option.value) : null;
        return (
          <li key={option.value}>
            <label
              className={cn(
                'flex min-h-9 cursor-pointer items-center gap-2.5 rounded-md px-2 py-1 text-xs transition-colors hover:bg-white/[0.04]',
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
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{
                    backgroundColor: spectralClassColor(spectral),
                    boxShadow: `0 0 6px ${spectralClassColor(spectral)}`,
                  }}
                />
              ) : null}
              <span className="min-w-0 flex-1 truncate">{label}</span>
              <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/60">
                {option.count.toLocaleString(intl)}
              </span>
            </label>
          </li>
        );
      })}
      {hiddenCount > 0 || expanded ? (
        <li>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="min-h-9 px-2 text-xs text-primary/80 transition-colors hover:text-primary"
          >
            {expanded ? t('facets.showLess') : t('facets.showMore', { count: hiddenCount })}
          </button>
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
    <div className="space-y-2 px-2" data-testid="chaos-range">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{t('facets.chaosRange')}</span>
        <span className="font-mono tabular-nums text-foreground/80">
          {t('facets.chaosValue', { min: current[0], max: current[1] })}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
          {t('facets.chaosMin')}
          <input
            type="range"
            min={bounds.min}
            max={bounds.max}
            step={1}
            value={current[0]}
            disabled={disabled}
            onChange={(event) => update([Number(event.target.value), current[1]])}
            className="h-1.5 w-full cursor-pointer accent-[rgb(var(--aurora-cyan-rgb))]"
          />
        </label>
        <label className="flex flex-col gap-1 text-[10px] uppercase tracking-wider text-muted-foreground/70">
          {t('facets.chaosMax')}
          <input
            type="range"
            min={bounds.min}
            max={bounds.max}
            step={1}
            value={current[1]}
            disabled={disabled}
            onChange={(event) => update([current[0], Number(event.target.value)])}
            className="h-1.5 w-full cursor-pointer accent-[rgb(var(--chrono-rose-rgb))]"
          />
        </label>
      </div>
    </div>
  );
}

/**
 * GalleryTraitFacets — the trait filter rail: one collapsible section per
 * categorical trait with collection counts, plus a chaos range. Rendered in
 * the desktop sidebar and inside the mobile filter sheet.
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
  matchCount,
  className,
}: GalleryTraitFacetsProps) {
  const t = useTranslations('traits');
  const locale = useLocale();
  const { typeLabel } = useTraitLabels();
  const activeCount = countActiveTraitFilters(selected, chaosRange);

  return (
    <div className={cn('space-y-3', className)} data-testid="trait-facets">
      <div className="flex items-center justify-between gap-2 px-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" aria-hidden />
          {t('facets.title')}
          {activeCount > 0 ? (
            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] text-primary">
              {activeCount}
            </span>
          ) : null}
        </h2>
        {activeCount > 0 ? (
          <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={onClearAll}>
            {t('facets.clearAll')}
          </Button>
        ) : null}
      </div>

      {matchCount !== undefined && activeCount > 0 ? (
        <p className="px-2 text-xs text-muted-foreground">
          {t('facets.matches', { count: matchCount.toLocaleString(toIntlLocale(locale)) })}
        </p>
      ) : null}

      {collectionTraits === undefined ? (
        <div
          role="status"
          className="space-y-3 px-2"
          aria-busy="true"
          aria-label={t('facets.loading')}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>
          ))}
        </div>
      ) : collectionTraits === null ? (
        <div className="space-y-2 px-2 text-xs text-muted-foreground">
          <p>{t('facets.unavailable')}</p>
          {onRetry ? (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={onRetry}>
              {t('facets.retry')}
            </Button>
          ) : null}
        </div>
      ) : (
        <>
          {collectionTraits.partial ? (
            <p className="px-2 text-[11px] text-muted-foreground/70">
              {t('facets.partial', {
                indexed: collectionTraits.indexed,
                total: collectionTraits.total,
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
                <AccordionItem key={key} value={key} className="border-white/[0.06]">
                  <AccordionTrigger className="px-2 py-2.5 text-xs hover:no-underline">
                    <span className="flex items-center gap-2">
                      <span className="font-medium">{typeLabel(key)}</span>
                      {chosen.length > 0 ? (
                        <span className="rounded-full bg-primary/15 px-1.5 py-px font-mono text-[10px] text-primary">
                          {chosen.length}
                        </span>
                      ) : null}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <FacetOptions
                      traitKey={key}
                      options={options}
                      selected={chosen}
                      onToggle={(value) => onToggleValue(key, value)}
                    />
                    {chosen.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => onClearKey(key)}
                        className="mt-1 min-h-9 px-2 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {t('facets.clearFacet', { trait: typeLabel(key) })}
                      </button>
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
