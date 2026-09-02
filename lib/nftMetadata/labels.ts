/**
 * Locale-aware labels for trait values, shared by the client hook
 * (`useTraitLabels`) and server code (JSON-LD). Works with any next-intl
 * translator scoped to the `traits` namespace.
 */
import { toSpectralClass } from './spectral';
import {
  presentCategoricalKeys,
  type CategoricalTraitKey,
  type NftTraitEntry,
  type TraitKey,
} from './traits';

/** The slice of a next-intl translator the label helpers need. */
export interface TraitTranslator {
  (key: string, values?: Record<string, string | number>): string;
  has(key: string): boolean;
}

/** `Orbit Ribbons` → `orbitRibbons`, `Last CST Gesture` → `lastCstGesture`. */
export function camelTraitKey(raw: string): string {
  const words = raw
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return words
    .map((word, index) =>
      index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join('');
}

const SYMMETRY_PATTERN = /^([A-Za-z]+)\s*[×x]\s*(\d+)$/;

function translateIfKnown(t: TraitTranslator, key: string, raw: string): string {
  return t.has(key) ? t(key) : raw;
}

/**
 * Translates a categorical trait value into the active locale. Closed
 * vocabularies (fate, mass balance, allocation, symmetry, ...) resolve to
 * catalog entries; open vocabularies (palette names) are composed from their
 * hue and scheme words. Anything the catalog does not know renders verbatim.
 */
export function resolveTraitValueLabel(
  t: TraitTranslator,
  key: CategoricalTraitKey,
  raw: string,
): string {
  const value = raw.trim();
  if (!value) return raw;
  switch (key) {
    case 'structure':
    case 'underlay':
    case 'accent':
      return translateIfKnown(t, `values.vocabulary.${camelTraitKey(value)}`, value);
    case 'symmetry': {
      const match = SYMMETRY_PATTERN.exec(value);
      if (match) {
        const patternKey = `values.symmetry.${match[1]!.toLowerCase()}`;
        return t.has(patternKey) ? t(patternKey, { n: Number(match[2]) }) : value;
      }
      return translateIfKnown(t, `values.symmetry.${camelTraitKey(value)}`, value);
    }
    case 'projection':
      return translateIfKnown(t, `values.projection.${camelTraitKey(value)}`, value);
    case 'wildcard':
      return /^(yes|true)$/i.test(value) ? t('values.wildcard.yes') : value;
    case 'finish':
      return translateIfKnown(t, `values.finish.${camelTraitKey(value)}`, value);
    case 'massBalance':
      return translateIfKnown(t, `values.massBalance.${camelTraitKey(value)}`, value);
    case 'fate':
      return translateIfKnown(t, `values.fate.${camelTraitKey(value)}`, value);
    case 'allocation':
      return translateIfKnown(t, `values.allocation.${camelTraitKey(value)}`, value);
    case 'palette': {
      const words = value.split(/\s+/);
      if (words.length < 2) return value;
      const schemeKey = `values.palette.schemes.${words[words.length - 1]!.toLowerCase()}`;
      const hueKey = `values.palette.hues.${camelTraitKey(words.slice(0, -1).join(' '))}`;
      if (!t.has(schemeKey) || !t.has(hueKey)) return value;
      return t('values.palette.pattern', { hue: t(hueKey), scheme: t(schemeKey) });
    }
    case 'spectralClass': {
      const spectralClass = toSpectralClass(value);
      return spectralClass ? t(`values.spectralClass.${spectralClass}.label`) : value;
    }
    default:
      return value;
  }
}

/** Localized trait type label. */
export function resolveTraitTypeLabel(t: TraitTranslator, key: TraitKey): string {
  return t(`types.${key}`);
}

/** A localized `name` / `value` pair, e.g. for schema.org `additionalProperty`. */
export interface TraitProperty {
  name: string;
  value: string | number;
}

/**
 * Every trait of an entry as localized name/value pairs (categorical traits
 * plus chaos, syzygies, and cycle). Used to publish traits as structured data.
 */
export function traitProperties(t: TraitTranslator, entry: NftTraitEntry): TraitProperty[] {
  const properties: TraitProperty[] = presentCategoricalKeys(entry).map((key) => ({
    name: resolveTraitTypeLabel(t, key),
    value: resolveTraitValueLabel(t, key, key === 'wildcard' ? 'Yes' : (entry[key] as string)),
  }));
  if (typeof entry.chaos === 'number') {
    properties.push({ name: resolveTraitTypeLabel(t, 'chaos'), value: entry.chaos });
  }
  if (typeof entry.syzygies === 'number') {
    properties.push({ name: resolveTraitTypeLabel(t, 'syzygies'), value: entry.syzygies });
  }
  if (typeof entry.cycle === 'number') {
    properties.push({ name: resolveTraitTypeLabel(t, 'cycle'), value: entry.cycle });
  }
  return properties;
}
