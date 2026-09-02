'use client';

import type { ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';

import {
  COMPOSITION_TRAIT_KEYS,
  PHYSICS_TRAIT_KEYS,
  PROVENANCE_TRAIT_KEYS,
  categoricalValue,
  type CategoricalTraitKey,
  type FacetIndex,
  type NftTraitEntry,
  type TraitKey,
} from '@/lib/nftMetadata';
import { Link } from '@/i18n/navigation';
import { useHydrationSafeDateTime } from '@/components/common/HydrationSafeDateTime';
import { cn } from '@/lib/utils';
import { toIntlLocale } from '@/utils/format';
import { InfoTooltip } from '@/components/ui/info-tooltip';

import { AllocationPill } from './AllocationPill';
import { ChaosMeter } from './ChaosMeter';
import { FateGlyph } from './FateGlyph';
import { HueStrip } from './HueStrip';
import { SpectralClassBadge } from './SpectralClassBadge';
import { useTraitLabels } from './useTraitLabels';

/** A named group of traits rendered as one section of the sheet. */
export type TraitGroup = 'composition' | 'physics' | 'provenance';

const GROUP_KEYS: Record<TraitGroup, readonly TraitKey[]> = {
  composition: COMPOSITION_TRAIT_KEYS,
  physics: PHYSICS_TRAIT_KEYS,
  provenance: PROVENANCE_TRAIT_KEYS,
};

const CATEGORICAL = new Set<TraitKey>([
  'structure',
  'underlay',
  'accent',
  'symmetry',
  'projection',
  'wildcard',
  'finish',
  'palette',
  'spectralClass',
  'massBalance',
  'fate',
  'allocation',
]);

/** Props for {@link TraitSheet}. */
export interface TraitSheetProps {
  entry: NftTraitEntry;
  /** Collection facets, to annotate each value with how many tokens share it. */
  facets?: FacetIndex | null;
  /** Number of trait-bearing tokens (denominator for shares). */
  total?: number;
  groups?: readonly TraitGroup[];
  /** Tighter spacing for dialogs. */
  dense?: boolean;
  /** When set, categorical values become buttons (e.g. "filter the gallery by this"). */
  onSelectTrait?: (key: CategoricalTraitKey, value: string) => void;
  /** Hide group headings (when the parent already labels the section). */
  hideHeadings?: boolean;
  className?: string;
}

function shareOf(
  facets: FacetIndex | null | undefined,
  key: CategoricalTraitKey,
  value: string,
): number | undefined {
  return facets?.[key]?.find((option) => option.value === value)?.count;
}

/**
 * TraitSheet — every trait of a token laid out as labelled rows, grouped
 * into Composition, Orbital physics, and Provenance. Shared by the gallery
 * quick view and the detail page panel.
 */
export function TraitSheet({
  entry,
  facets,
  total,
  groups = ['composition', 'physics', 'provenance'],
  dense = false,
  onSelectTrait,
  hideHeadings = false,
  className,
}: TraitSheetProps) {
  const t = useTranslations('traits');
  const locale = useLocale();
  const { typeLabel, typeHint, valueLabel } = useTraitLabels();
  const imprintedDate = useHydrationSafeDateTime(entry.imprinted ?? 0, false, locale);
  const intl = toIntlLocale(locale);

  function renderValue(key: TraitKey): ReactNode | null {
    switch (key) {
      case 'palette':
        if (!entry.palette) return null;
        return (
          <span className="flex flex-col gap-1.5">
            <span>{selectable(key, entry.palette, valueLabel('palette', entry.palette))}</span>
            <HueStrip hues={entry.hues} size="sm" className="max-w-[9rem]" />
          </span>
        );
      case 'spectralClass':
        if (!entry.spectralClass) return null;
        return selectable(
          key,
          entry.spectralClass,
          <SpectralClassBadge value={entry.spectralClass} size="md" withLabel />,
        );
      case 'fate':
        if (!entry.fate) return null;
        return selectable(key, entry.fate, <FateGlyph value={entry.fate} size="md" withLabel />);
      case 'allocation':
        if (!entry.allocation) return null;
        return selectable(
          key,
          entry.allocation,
          <AllocationPill value={entry.allocation} size="md" />,
        );
      case 'chaos':
        if (typeof entry.chaos !== 'number') return null;
        return <ChaosMeter value={entry.chaos} max={entry.chaosMax} size="md" />;
      case 'syzygies':
        if (typeof entry.syzygies !== 'number') return null;
        return (
          <span className="font-mono tabular-nums">{entry.syzygies.toLocaleString(intl)}</span>
        );
      case 'cycle':
        if (typeof entry.cycle !== 'number') return null;
        return (
          <Link
            href={`/allocation/${entry.cycle}`}
            className="font-medium text-inherit no-underline transition-colors hover:text-primary"
            aria-label={t('card.viewCycle', { n: entry.cycle })}
          >
            {t('card.cycleLong', { n: entry.cycle })}
          </Link>
        );
      case 'imprinted':
        if (typeof entry.imprinted !== 'number') return null;
        return <span>{imprintedDate}</span>;
      default: {
        if (!CATEGORICAL.has(key)) return null;
        const categoricalKey = key as CategoricalTraitKey;
        const value = categoricalValue(entry, categoricalKey);
        if (value === undefined) return null;
        return selectable(categoricalKey, value, valueLabel(categoricalKey, value));
      }
    }
  }

  function selectable(key: CategoricalTraitKey, value: string, content: ReactNode): ReactNode {
    if (!onSelectTrait) return content;
    return (
      <button
        type="button"
        onClick={() => onSelectTrait(key, value)}
        className="inline-flex items-center rounded-md text-left transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {content}
      </button>
    );
  }

  return (
    <div className={cn('space-y-6', dense && 'space-y-4', className)} data-testid="trait-sheet">
      {groups.map((group) => {
        const rows = GROUP_KEYS[group]
          .map((key) => ({ key, value: renderValue(key) }))
          .filter((row) => row.value !== null);
        if (rows.length === 0) return null;
        return (
          <section key={group} aria-label={t(`groups.${group}`)}>
            {hideHeadings ? null : (
              <h3 className="type-eyebrow mb-3 text-muted-foreground">{t(`groups.${group}`)}</h3>
            )}
            <dl
              className={cn(
                'grid gap-x-6',
                dense
                  ? 'grid-cols-2 gap-y-3 sm:grid-cols-3'
                  : 'grid-cols-1 gap-y-4 sm:grid-cols-2 lg:grid-cols-3',
              )}
            >
              {rows.map(({ key, value }) => {
                const share =
                  CATEGORICAL.has(key) && total
                    ? shareOf(
                        facets,
                        key as CategoricalTraitKey,
                        categoricalValue(entry, key as CategoricalTraitKey) ?? '',
                      )
                    : undefined;
                return (
                  <div
                    key={key}
                    className={cn(
                      'min-w-0 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5',
                      // The allocation pill is the widest value; give it room.
                      key === 'allocation' && 'col-span-2',
                    )}
                    data-testid={`trait-row-${key}`}
                  >
                    <dt className="mb-1 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                      {typeLabel(key)}
                      <InfoTooltip content={typeHint(key)} iconClassName="h-3 w-3" />
                    </dt>
                    <dd className="flex flex-wrap items-center gap-2 text-sm text-foreground">
                      {value}
                      {share !== undefined && total ? (
                        <span
                          className="ml-auto shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/70"
                          title={t('rarity.share', { count: share, total })}
                        >
                          {t('rarity.shareShort', { count: share, total })}
                        </span>
                      ) : null}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        );
      })}
    </div>
  );
}
