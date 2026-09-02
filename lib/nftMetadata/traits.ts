/**
 * Canonical trait model for Cosmic Signature tokens.
 *
 * The metadata pipeline publishes traits as OpenSea `attributes` rows keyed by
 * a human-readable `trait_type`. This module maps those wire labels onto a
 * fixed set of canonical keys so that UI code never renders a raw wire label:
 * every label and every closed-set value goes through the `traits` message
 * catalog, which keeps the copy bilingual and lexicon-safe.
 */
import type { CosmicSignatureMetadata, NftAttribute } from './types';

/** Every trait the UI understands, in display order. */
export const TRAIT_KEYS = [
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
  'chaos',
  'syzygies',
  'cycle',
  'imprinted',
  'allocation',
] as const;

/** A canonical trait key. */
export type TraitKey = (typeof TRAIT_KEYS)[number];

/** Categorical traits: these drive facets, chips, and the rarity score. */
export const CATEGORICAL_TRAIT_KEYS = [
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
] as const;

/** A categorical trait key. */
export type CategoricalTraitKey = (typeof CATEGORICAL_TRAIT_KEYS)[number];

/**
 * Traits that only some tokens carry. Absence is a legitimate (usually common)
 * value for these, which is what makes their presence rare.
 */
export const OPTIONAL_TRAIT_KEYS: ReadonlySet<TraitKey> = new Set<TraitKey>([
  'underlay',
  'accent',
  'symmetry',
  'projection',
  'wildcard',
  'finish',
]);

/** Traits describing the composition of the artwork. */
export const COMPOSITION_TRAIT_KEYS: readonly TraitKey[] = [
  'structure',
  'underlay',
  'accent',
  'symmetry',
  'projection',
  'wildcard',
  'finish',
  'palette',
  'spectralClass',
];

/** Traits describing the three-body simulation behind the artwork. */
export const PHYSICS_TRAIT_KEYS: readonly TraitKey[] = ['massBalance', 'fate', 'chaos', 'syzygies'];

/** Traits describing how and when the token was imprinted. */
export const PROVENANCE_TRAIT_KEYS: readonly TraitKey[] = ['allocation', 'cycle', 'imprinted'];

/**
 * Wire `trait_type` labels → canonical keys. The pipeline's labels are sealed
 * wire-format strings, so the one label that collides with the lexicon is
 * mapped here (and only here) onto the coined term.
 */
const WIRE_TRAIT_TYPES: Readonly<Record<string, TraitKey>> = {
  Structure: 'structure',
  Underlay: 'underlay',
  Accent: 'accent',
  Symmetry: 'symmetry',
  Projection: 'projection',
  Wildcard: 'wildcard',
  Finish: 'finish',
  Palette: 'palette',
  'Spectral Class': 'spectralClass',
  'Mass Balance': 'massBalance',
  Fate: 'fate',
  Chaos: 'chaos',
  Syzygies: 'syzygies',
  Round: 'cycle', // lexicon-allow-backend-type
  Imprinted: 'imprinted',
  Allocation: 'allocation',
};

/** Default `max_value` for the chaos index when the row omits it. */
export const DEFAULT_CHAOS_MAX = 100;

/**
 * Compact, serializable trait record for one token. This is what the
 * collection index endpoint ships to the browser (one row per token), so it
 * carries only what cards, facets, sorting, and rarity need.
 */
export interface NftTraitEntry {
  id: number;
  /** Lower-case hex seed without the `0x` prefix (matches the indexer's `Seed`). */
  seed?: string;
  /** `metadata_version` of the source document, when published. */
  version?: string;
  /** True when the v2 art traits (structure + palette) are present. */
  hasArtTraits: boolean;
  structure?: string;
  underlay?: string;
  accent?: string;
  symmetry?: string;
  projection?: string;
  wildcard?: boolean;
  finish?: string;
  palette?: string;
  spectralClass?: string;
  /** Base hue of each of the three bodies, in degrees `[0, 360)`. */
  hues?: number[];
  wavelengthNm?: number;
  massBalance?: string;
  fate?: string;
  chaos?: number;
  chaosMax?: number;
  syzygies?: number;
  cycle?: number;
  /** Imprint time as a unix timestamp in seconds. */
  imprinted?: number;
  allocation?: string;
}

/** Normalizes a seed to lower-case hex without the `0x` prefix. */
export function normalizeSeed(seed: string | number | null | undefined): string | undefined {
  if (seed == null) return undefined;
  const normalized = String(seed).trim().toLowerCase().replace(/^0x/, '');
  return normalized || undefined;
}

function toFiniteNumber(value: NftAttribute['value']): number | undefined {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function toTrimmedString(value: NftAttribute['value']): string | undefined {
  const text = String(value).trim();
  return text ? text : undefined;
}

function toFlag(value: NftAttribute['value']): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  return /^(yes|true|1)$/i.test(value.trim());
}

function normalizeHue(degrees: number): number {
  const wrapped = ((degrees % 360) + 360) % 360;
  return Math.round(wrapped) % 360;
}

function applyAttribute(entry: NftTraitEntry, key: TraitKey, attribute: NftAttribute): void {
  switch (key) {
    case 'chaos': {
      const chaos = toFiniteNumber(attribute.value);
      if (chaos === undefined) return;
      entry.chaos = chaos;
      entry.chaosMax =
        typeof attribute.max_value === 'number' && attribute.max_value > 0
          ? attribute.max_value
          : DEFAULT_CHAOS_MAX;
      return;
    }
    case 'syzygies':
    case 'cycle':
    case 'imprinted': {
      const numeric = toFiniteNumber(attribute.value);
      if (numeric !== undefined) entry[key] = numeric;
      return;
    }
    case 'wildcard':
      entry.wildcard = toFlag(attribute.value);
      return;
    default: {
      const text = toTrimmedString(attribute.value);
      if (text !== undefined) entry[key] = text;
    }
  }
}

/**
 * Builds the compact trait record for a parsed metadata document.
 * `fallbackId` covers v1 documents that omit `properties.token_id`.
 * Returns `null` when no token id can be determined.
 */
export function normalizeTraitEntry(
  metadata: CosmicSignatureMetadata,
  fallbackId?: number,
): NftTraitEntry | null {
  const id = metadata.properties?.token_id ?? fallbackId;
  if (id == null || !Number.isInteger(id) || id < 0) return null;

  const entry: NftTraitEntry = { id, hasArtTraits: false };
  const seed = normalizeSeed(metadata.properties?.seed);
  if (seed) entry.seed = seed;
  if (metadata.metadata_version) entry.version = metadata.metadata_version;

  for (const attribute of metadata.attributes) {
    const key = WIRE_TRAIT_TYPES[attribute.trait_type.trim()];
    if (key) applyAttribute(entry, key, attribute);
  }

  const palette = metadata.properties?.generation?.palette;
  if (palette?.body_base_hues_deg && palette.body_base_hues_deg.length > 0) {
    entry.hues = palette.body_base_hues_deg.map(normalizeHue);
  }
  if (typeof palette?.dominant_wavelength_nm === 'number') {
    entry.wavelengthNm = Math.round(palette.dominant_wavelength_nm);
  }
  if (!entry.spectralClass && palette?.spectral_class) {
    entry.spectralClass = palette.spectral_class.trim() || undefined;
  }
  if (!entry.palette && palette?.family) {
    entry.palette = palette.family.trim() || undefined;
  }

  entry.hasArtTraits = Boolean(entry.structure && entry.palette);
  return entry;
}

/**
 * The categorical value of a trait as a display string: `undefined` when the
 * token does not carry the trait. Boolean traits collapse to `"Yes"` so they
 * can share the facet / label machinery with string traits.
 */
export function categoricalValue(
  entry: NftTraitEntry,
  key: CategoricalTraitKey,
): string | undefined {
  if (key === 'wildcard') return entry.wildcard ? 'Yes' : undefined;
  return entry[key];
}

/**
 * Keys of the categorical traits a token actually carries, in display order.
 */
export function presentCategoricalKeys(entry: NftTraitEntry): CategoricalTraitKey[] {
  return CATEGORICAL_TRAIT_KEYS.filter((key) => categoricalValue(entry, key) !== undefined);
}
