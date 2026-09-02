/**
 * Trait filter state for the gallery and its URL encoding.
 *
 * Every categorical trait becomes one query parameter holding a
 * comma-separated list of selected values (`?structure=Orbit+Ribbons,Time+Chords`),
 * and the chaos range is `?chaos=10-40`, so a filtered view is a shareable link.
 */
import {
  CATEGORICAL_TRAIT_KEYS,
  categoricalValue,
  type CategoricalTraitKey,
  type NftTraitEntry,
  type NumericBounds,
} from '@/lib/nftMetadata';

/** Selected values per categorical trait. */
export type TraitFilterState = Partial<Record<CategoricalTraitKey, string[]>>;

/** Inclusive chaos bounds `[min, max]`. */
export type ChaosRange = [number, number];

/** Query parameter carrying the chaos range. */
export const CHAOS_PARAM = 'chaos';

const VALUE_SEPARATOR = ',';

export function isCategoricalTraitKey(value: string): value is CategoricalTraitKey {
  return (CATEGORICAL_TRAIT_KEYS as readonly string[]).includes(value);
}

/** Reads trait filters from the URL. Unknown keys and empty values are ignored. */
export function parseTraitFilters(params: URLSearchParams): TraitFilterState {
  const state: TraitFilterState = {};
  for (const key of CATEGORICAL_TRAIT_KEYS) {
    const raw = params.get(key);
    if (!raw) continue;
    const values = [
      ...new Set(
        raw
          .split(VALUE_SEPARATOR)
          .map((v) => v.trim())
          .filter(Boolean),
      ),
    ];
    if (values.length > 0) state[key] = values;
  }
  return state;
}

/** Reads the chaos range from the URL (`min-max`), or null when absent/invalid. */
export function parseChaosRange(params: URLSearchParams): ChaosRange | null {
  const raw = params.get(CHAOS_PARAM);
  if (!raw) return null;
  const match = /^(-?\d+(?:\.\d+)?)-(-?\d+(?:\.\d+)?)$/.exec(raw.trim());
  if (!match) return null;
  const min = Number(match[1]);
  const max = Number(match[2]);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) return null;
  return [min, max];
}

/** Serializes a filter value list for the URL (`''` clears the parameter). */
export function serializeTraitValues(values: readonly string[] | undefined): string {
  return values && values.length > 0 ? values.join(VALUE_SEPARATOR) : '';
}

/** Serializes the chaos range for the URL (`''` clears the parameter). */
export function serializeChaosRange(range: ChaosRange | null): string {
  return range ? `${range[0]}-${range[1]}` : '';
}

/** Number of active selections (each chosen value plus the chaos range). */
export function countActiveTraitFilters(
  state: TraitFilterState,
  chaosRange: ChaosRange | null,
): number {
  let count = chaosRange ? 1 : 0;
  for (const key of CATEGORICAL_TRAIT_KEYS) count += state[key]?.length ?? 0;
  return count;
}

/** Toggles one value inside a filter state, returning the new state. */
export function toggleTraitValue(
  state: TraitFilterState,
  key: CategoricalTraitKey,
  value: string,
): TraitFilterState {
  const current = state[key] ?? [];
  const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
  const { [key]: _removed, ...rest } = state;
  return next.length > 0 ? { ...rest, [key]: next } : rest;
}

/** Whether a chaos range equals the collection bounds (i.e. filters nothing). */
export function isFullChaosRange(range: ChaosRange, bounds: NumericBounds | null): boolean {
  return bounds !== null && range[0] <= bounds.min && range[1] >= bounds.max;
}

/**
 * True when the entry satisfies every active filter. Within one trait the
 * selected values are OR-ed; across traits they are AND-ed. Tokens without
 * trait data never match an active trait filter.
 */
export function matchesTraitFilters(
  entry: NftTraitEntry | undefined,
  state: TraitFilterState,
  chaosRange: ChaosRange | null,
): boolean {
  const active = countActiveTraitFilters(state, chaosRange) > 0;
  if (!active) return true;
  if (!entry || !entry.hasArtTraits) return false;
  for (const key of CATEGORICAL_TRAIT_KEYS) {
    const wanted = state[key];
    if (!wanted || wanted.length === 0) continue;
    const value = categoricalValue(entry, key);
    if (value === undefined || !wanted.includes(value)) return false;
  }
  if (chaosRange) {
    if (typeof entry.chaos !== 'number') return false;
    if (entry.chaos < chaosRange[0] || entry.chaos > chaosRange[1]) return false;
  }
  return true;
}
