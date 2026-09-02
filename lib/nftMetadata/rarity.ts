/**
 * Collection-relative trait statistics: facet counts for filtering and an
 * information-content rarity score per token.
 *
 * Scoring follows the OpenRarity idea: each categorical trait value
 * contributes `-log2(share)` where `share` is the fraction of the collection
 * carrying that value; for optional traits, *not* carrying the trait is
 * itself a value, so a trait that only a handful of tokens have is worth a
 * lot to those tokens and almost nothing to everyone else. Higher score means
 * rarer. Rank 1 is the rarest token; ties share a rank (competition ranking).
 */
import {
  CATEGORICAL_TRAIT_KEYS,
  OPTIONAL_TRAIT_KEYS,
  categoricalValue,
  type CategoricalTraitKey,
  type NftTraitEntry,
} from './traits';

/** One selectable value of a categorical trait with its collection frequency. */
export interface FacetOption {
  value: string;
  count: number;
  /** Fraction of scored tokens carrying this value, in `(0, 1]`. */
  share: number;
}

/** Facet options per categorical trait, most common first. */
export type FacetIndex = Record<CategoricalTraitKey, FacetOption[]>;

/** The rarest trait a token carries, with its collection frequency. */
export interface RarestTrait {
  key: CategoricalTraitKey;
  value: string;
  count: number;
  share: number;
}

/** Rarity summary for one token. */
export interface RarityInfo {
  id: number;
  /** Information-content score (bits); higher is rarer. */
  score: number;
  /** 1 = rarest. Tokens with equal scores share a rank. */
  rank: number;
  rarest: RarestTrait | null;
}

/** Rarity for the whole collection. */
export interface RarityIndex {
  byId: Map<number, RarityInfo>;
  /** Number of tokens that carry art traits and were scored. */
  total: number;
}

/** Inclusive numeric bounds of a trait across the collection. */
export interface NumericBounds {
  min: number;
  max: number;
}

/** Only tokens that carry v2 art traits participate in facets and rarity. */
export function scorableEntries(entries: readonly NftTraitEntry[]): NftTraitEntry[] {
  return entries.filter((entry) => entry.hasArtTraits);
}

function countValues(
  entries: readonly NftTraitEntry[],
  key: CategoricalTraitKey,
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const value = categoricalValue(entry, key);
    if (value === undefined) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

/** Builds facet options (value, count, share) for every categorical trait. */
export function buildFacets(entries: readonly NftTraitEntry[]): FacetIndex {
  const scored = scorableEntries(entries);
  const total = scored.length;
  const facets = {} as FacetIndex;
  for (const key of CATEGORICAL_TRAIT_KEYS) {
    const options: FacetOption[] = [];
    for (const [value, count] of countValues(scored, key)) {
      options.push({ value, count, share: total > 0 ? count / total : 0 });
    }
    options.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
    facets[key] = options;
  }
  return facets;
}

/** Sentinel frequency-table key for "does not carry this optional trait". */
const ABSENT = '\u0000absent';

/** Scores every trait-bearing token and ranks the collection (1 = rarest). */
export function scoreRarity(entries: readonly NftTraitEntry[]): RarityIndex {
  const scored = scorableEntries(entries);
  const total = scored.length;
  const byId = new Map<number, RarityInfo>();
  if (total === 0) return { byId, total };

  const tables = new Map<CategoricalTraitKey, Map<string, number>>();
  for (const key of CATEGORICAL_TRAIT_KEYS) {
    const counts = countValues(scored, key);
    if (OPTIONAL_TRAIT_KEYS.has(key)) {
      const present = [...counts.values()].reduce((sum, count) => sum + count, 0);
      if (total - present > 0) counts.set(ABSENT, total - present);
    }
    tables.set(key, counts);
  }

  const infos: RarityInfo[] = scored.map((entry) => {
    let score = 0;
    let rarest: RarestTrait | null = null;
    for (const key of CATEGORICAL_TRAIT_KEYS) {
      const counts = tables.get(key)!;
      const value = categoricalValue(entry, key);
      const tableKey = value ?? (OPTIONAL_TRAIT_KEYS.has(key) ? ABSENT : undefined);
      if (tableKey === undefined) continue;
      const count = counts.get(tableKey);
      if (!count) continue;
      const share = count / total;
      score += -Math.log2(share);
      if (value !== undefined && (rarest === null || count < rarest.count)) {
        rarest = { key, value, count, share };
      }
    }
    return { id: entry.id, score, rank: 0, rarest };
  });

  infos.sort((a, b) => b.score - a.score || a.id - b.id);
  let rank = 0;
  let previousScore: number | null = null;
  infos.forEach((info, index) => {
    if (previousScore === null || Math.abs(info.score - previousScore) > 1e-9) {
      rank = index + 1;
      previousScore = info.score;
    }
    info.rank = rank;
    byId.set(info.id, info);
  });

  return { byId, total };
}

/** Inclusive `[min, max]` of the chaos index across trait-bearing tokens, or null when none. */
export function chaosBounds(entries: readonly NftTraitEntry[]): NumericBounds | null {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const entry of scorableEntries(entries)) {
    if (typeof entry.chaos !== 'number') continue;
    min = Math.min(min, entry.chaos);
    max = Math.max(max, entry.chaos);
  }
  return Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null;
}
