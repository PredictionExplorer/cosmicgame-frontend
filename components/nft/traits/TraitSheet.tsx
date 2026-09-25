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
import { useHydrationSafeDateTime } from '@/components/ui/date-time';
import { cn } from '@/lib/utils';
import { toIntlLocale } from '@/utils/format';
import { InfoTooltip } from '@/components/ui/info-tooltip';

import { AllocationLabel } from './AllocationLabel';
import { ChaosMeter } from './ChaosMeter';
import { FateGlyph } from './FateGlyph';
import { HueStrip } from './HueStrip';
import {
  TRAIT_LEDGER_CLASS,
  TRAIT_LEDGER_DENSE_CLASS,
  TRAIT_ROW_CLASS,
  TRAIT_ROW_DENSE_CLASS,
  TRAIT_ROW_WIDE_CLASS,
} from './layout';
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
  /**
   * More rows (`TraitLedgerRow`s) at the end of the last group's ledger, so
   * the facts a page adds read as one ledger with the traits.
   */
  extraRows?: ReactNode;
  className?: string;
}

export interface TraitLedgerRowProps {
  label: ReactNode;
  children: ReactNode;
  /** The value needs the width of both columns (the masses, a braid word). */
  wide?: boolean;
  dense?: boolean;
  testId?: string;
}

/**
 * One label / value row of the trait ledger, the spec-sheet row the detail
 * page's provenance ledger uses: the label in the subtle tier, the value
 * beside it.
 */
export function TraitLedgerRow({
  label,
  children,
  wide = false,
  dense = false,
  testId,
}: TraitLedgerRowProps) {
  return (
    <div
      className={cn(dense ? TRAIT_ROW_DENSE_CLASS : TRAIT_ROW_CLASS, wide && TRAIT_ROW_WIDE_CLASS)}
      data-testid={testId}
    >
      <dt className="flex min-w-0 items-center gap-1 type-label text-subtle">{label}</dt>
      <dd className="min-w-0 type-body-sm text-foreground">{children}</dd>
    </div>
  );
}

function shareOf(
  facets: FacetIndex | null | undefined,
  key: CategoricalTraitKey,
  value: string,
): number | undefined {
  return facets?.[key]?.find((option) => option.value === value)?.count;
}

/**
 * TraitSheet — every trait of a token as a ledger of labelled rows, grouped
 * into Composition, Orbital physics, and Provenance. A categorical value
 * carries how many tokens share it ("22/48") at the end of its line, where
 * it stays when the value wraps. Shared by the gallery quick view (one
 * column) and the detail page panel (two from `lg`).
 */
export function TraitSheet({
  entry,
  facets,
  total,
  groups = ['composition', 'physics', 'provenance'],
  dense = false,
  onSelectTrait,
  hideHeadings = false,
  extraRows,
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
        return selectable(key, entry.allocation, <AllocationLabel value={entry.allocation} />);
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
            className="link-quiet inline-flex min-h-6 items-center font-medium"
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
        className="inline-flex items-center rounded-edge text-left transition-colors hover:text-primary"
      >
        {content}
      </button>
    );
  }

  const shown = groups
    .map((group) => ({
      group,
      rows: GROUP_KEYS[group]
        .map((key) => ({ key, value: renderValue(key) }))
        .filter((row) => row.value !== null),
    }))
    .filter(({ rows }) => rows.length > 0);
  const lastGroup = shown[shown.length - 1]?.group;

  return (
    <div className={cn('space-y-6', dense && 'space-y-4', className)} data-testid="trait-sheet">
      {shown.map(({ group, rows }) => (
        <section key={group} aria-label={t(`groups.${group}`)}>
          {hideHeadings ? null : (
            <h3 className="type-eyebrow mb-3 text-muted-foreground">{t(`groups.${group}`)}</h3>
          )}
          <dl className={dense ? TRAIT_LEDGER_DENSE_CLASS : TRAIT_LEDGER_CLASS}>
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
                <TraitLedgerRow
                  key={key}
                  dense={dense}
                  testId={`trait-row-${key}`}
                  label={
                    <>
                      {typeLabel(key)}
                      <InfoTooltip
                        content={typeHint(key)}
                        label={typeLabel(key)}
                        iconClassName="h-3 w-3"
                      />
                    </>
                  }
                >
                  {/* The share keeps its place at the end of the first line
                      when the value wraps. */}
                  <span className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3">
                    <span className="min-w-0">{value}</span>
                    {share !== undefined && total ? (
                      <span
                        className="type-figure-sm text-subtle"
                        title={t('rarity.share', { count: share, total })}
                      >
                        {t('rarity.shareShort', { count: share, total })}
                      </span>
                    ) : null}
                  </span>
                </TraitLedgerRow>
              );
            })}
            {group === lastGroup ? extraRows : null}
          </dl>
        </section>
      ))}
    </div>
  );
}
