/**
 * Message-catalog integrity checks shared by the `i18n:parity` CLI and the
 * `i18n/__tests__/catalog-integrity.test.ts` suite (docs/i18n/README.md §7).
 *
 * Every check is locale-generic: a locale contributes only its Intl tag,
 * from which the required plural categories are derived. Adding a language
 * therefore needs no change here.
 *
 * Checks, per namespace, against the default-locale catalog:
 *   - key parity: missing, empty (''), and extra keys,
 *   - ICU syntax: every message parses with the same parser next-intl uses,
 *   - ICU signature: the same `{arguments}` as the source and no `<tags>` the
 *     source lacks (a dropped argument loses information, an invented
 *     placeholder or tag renders as raw text),
 *   - plural completeness: every `plural` / `selectordinal` block covers the
 *     locale's CLDR categories (`one/few/many/other` for uk, `other` for zh),
 *   - untranslated namespace: a catalog whose every value equals the source
 *     is a copied file, not a translation.
 *
 * Long-form content (content/**, see ./i18n-content-areas.ts) is shaped by
 * mapped types, so only the last check applies to it: `compareContent`
 * measures how much of a module still reads exactly like the English source.
 */
import {
  parse,
  TYPE,
  type MessageFormatElement,
  type PluralElement,
} from '@formatjs/icu-messageformat-parser';

export type Messages = Record<string, unknown>;

export function isPlainObject(value: unknown): value is Messages {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Flattens `{a:{b:'x'}}` to `Map { 'a.b' => 'x' }` (leaf values only). */
export function flattenMessages(node: Messages, prefix = ''): Map<string, unknown> {
  const leaves = new Map<string, unknown>();
  for (const [key, value] of Object.entries(node)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (isPlainObject(value)) {
      for (const [childPath, childValue] of flattenMessages(value, path)) {
        leaves.set(childPath, childValue);
      }
    } else {
      leaves.set(path, value);
    }
  }
  return leaves;
}

export interface IcuSignature {
  /** Named arguments: `{name}`, `{count, plural, …}`, `{date, date, short}`, … */
  readonly arguments: ReadonlySet<string>;
  /** Rich-text tags: `<em>…</em>`. */
  readonly tags: ReadonlySet<string>;
  /** Plural blocks with the keyword categories they declare (`=N` cases excluded). */
  readonly plurals: readonly {
    readonly argument: string;
    readonly type: 'cardinal' | 'ordinal';
    readonly categories: ReadonlySet<string>;
  }[];
}

function walk(
  elements: readonly MessageFormatElement[],
  args: Set<string>,
  tags: Set<string>,
  plurals: IcuSignature['plurals'][number][],
): void {
  for (const element of elements) {
    switch (element.type) {
      case TYPE.argument:
      case TYPE.number:
      case TYPE.date:
      case TYPE.time:
        args.add(element.value);
        break;
      case TYPE.select:
        args.add(element.value);
        for (const option of Object.values(element.options)) {
          walk(option.value, args, tags, plurals);
        }
        break;
      case TYPE.plural: {
        const plural = element as PluralElement;
        args.add(plural.value);
        plurals.push({
          argument: plural.value,
          type: plural.pluralType ?? 'cardinal',
          categories: new Set(Object.keys(plural.options).filter((key) => !key.startsWith('='))),
        });
        for (const option of Object.values(plural.options)) {
          walk(option.value, args, tags, plurals);
        }
        break;
      }
      case TYPE.tag:
        tags.add(element.value);
        walk(element.children, args, tags, plurals);
        break;
      default:
        // literal, pound
        break;
    }
  }
}

/** Parses an ICU message and summarizes the placeholders it depends on. Throws on syntax errors. */
export function icuSignature(message: string): IcuSignature {
  const args = new Set<string>();
  const tags = new Set<string>();
  const plurals: IcuSignature['plurals'][number][] = [];
  walk(parse(message, { requiresOtherClause: true }), args, tags, plurals);
  return { arguments: args, tags, plurals };
}

const pluralCategoryCache = new Map<string, readonly string[]>();

/** CLDR plural categories a locale's catalogs must cover. */
export function pluralCategoriesFor(
  intlLocale: string,
  type: 'cardinal' | 'ordinal' = 'cardinal',
): readonly string[] {
  const cacheKey = `${intlLocale}:${type}`;
  let categories = pluralCategoryCache.get(cacheKey);
  if (!categories) {
    categories = new Intl.PluralRules(intlLocale, { type }).resolvedOptions().pluralCategories;
    pluralCategoryCache.set(cacheKey, categories);
  }
  return categories;
}

export interface NamespaceReport {
  readonly namespace: string;
  readonly total: number;
  readonly missing: readonly string[];
  readonly empty: readonly string[];
  readonly extra: readonly string[];
  /** Keys whose translated value equals the source value verbatim. */
  readonly identical: readonly string[];
  /** `key: parser message` for messages the ICU parser rejects. */
  readonly syntaxErrors: readonly string[];
  /** Keys whose `{arguments}` differ from the source or that invent `<tags>` the source lacks. */
  readonly signatureMismatches: readonly string[];
  /** `key: argument → missing categories` for incomplete plural blocks. */
  readonly pluralGaps: readonly string[];
  /** True when every value is a verbatim copy of the source (a copied file). */
  readonly untranslated: boolean;
}

export interface CompareOptions {
  readonly namespace: string;
  readonly source: Messages;
  readonly translation: Messages;
  /** BCP-47 tag of the translation, for `Intl.PluralRules`. */
  readonly intlLocale: string;
}

const describeSet = (values: ReadonlySet<string>): string => [...values].sort().join(',');

/** Compares one translated namespace against its source-locale counterpart. */
export function compareNamespace({
  namespace,
  source,
  translation,
  intlLocale,
}: CompareOptions): NamespaceReport {
  const sourceLeaves = flattenMessages(source);
  const translatedLeaves = flattenMessages(translation);

  const missing: string[] = [];
  const empty: string[] = [];
  const identical: string[] = [];
  const syntaxErrors: string[] = [];
  const signatureMismatches: string[] = [];
  const pluralGaps: string[] = [];

  for (const [key, sourceValue] of sourceLeaves) {
    if (!translatedLeaves.has(key)) {
      missing.push(key);
      continue;
    }
    const translatedValue = translatedLeaves.get(key);
    if (translatedValue === '') {
      empty.push(key);
      continue;
    }
    if (typeof translatedValue !== 'string' || typeof sourceValue !== 'string') {
      continue;
    }
    if (translatedValue === sourceValue) identical.push(key);

    let sourceSignature: IcuSignature;
    let translatedSignature: IcuSignature;
    try {
      sourceSignature = icuSignature(sourceValue);
    } catch {
      // A malformed source message is the source locale's problem and is
      // reported when that catalog is checked against itself.
      continue;
    }
    try {
      translatedSignature = icuSignature(translatedValue);
    } catch (error) {
      syntaxErrors.push(`${key}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }

    // Arguments must match exactly: a dropped one loses information, an
    // invented one renders as raw text. Tags may be dropped (the copy simply
    // renders without that emphasis — e.g. a wordplay that has no equivalent)
    // but never invented, since an unknown tag renders literally.
    const inventedTags = [...translatedSignature.tags].filter(
      (tag) => !sourceSignature.tags.has(tag),
    );
    if (
      describeSet(sourceSignature.arguments) !== describeSet(translatedSignature.arguments) ||
      inventedTags.length > 0
    ) {
      signatureMismatches.push(
        `${key}: expected {${describeSet(sourceSignature.arguments)}} <${describeSet(
          sourceSignature.tags,
        )}>, got {${describeSet(translatedSignature.arguments)}} <${describeSet(
          translatedSignature.tags,
        )}>`,
      );
    }

    for (const plural of translatedSignature.plurals) {
      const required = pluralCategoriesFor(intlLocale, plural.type);
      const absent = required.filter((category) => !plural.categories.has(category));
      if (absent.length > 0) {
        pluralGaps.push(`${key}: {${plural.argument}, plural} lacks ${absent.join(', ')}`);
      }
    }
  }

  const extra = [...translatedLeaves.keys()].filter((key) => !sourceLeaves.has(key));
  const comparable = sourceLeaves.size - missing.length - empty.length;

  return {
    namespace,
    total: sourceLeaves.size,
    missing,
    empty,
    extra,
    identical,
    syntaxErrors,
    signatureMismatches,
    pluralGaps,
    untranslated: comparable > 0 && identical.length === comparable,
  };
}

/** Everything that makes `--strict` fail for one namespace. */
export function strictProblems(report: NamespaceReport): readonly string[] {
  return [
    ...report.missing.map((key) => `missing: ${key}`),
    ...report.empty.map((key) => `empty: ${key}`),
    ...report.extra.map((key) => `extra: ${key}`),
    ...report.syntaxErrors.map((entry) => `icu syntax: ${entry}`),
    ...report.signatureMismatches.map((entry) => `icu signature: ${entry}`),
    ...report.pluralGaps.map((entry) => `plural: ${entry}`),
    ...(report.untranslated ? [`untranslated: every value equals the source catalog`] : []),
  ];
}

export interface ContentReport {
  readonly area: string;
  /** Prose leaves (see `isProse`) present in both source and translation. */
  readonly total: number;
  /** Paths whose translated prose equals the source verbatim. */
  readonly identical: readonly string[];
  /** True when every comparable leaf is a verbatim copy (a scaffolded, untranslated module). */
  readonly untranslated: boolean;
}

/**
 * Whether a source-locale leaf is prose worth comparing. Composed content
 * carries the locale-independent skeleton too (ids, slugs, icon names,
 * hrefs, option keys), which is single tokens without whitespace; prose in
 * the source locale is multi-word. One-word labels are left out with the
 * skeleton, which under-counts prose slightly but never mistakes an id for
 * an untranslated sentence.
 */
function isProse(value: string): boolean {
  return /\p{L}/u.test(value) && /\s/.test(value.trim());
}

/** Flattens any JSON-like value to `path → leaf`, descending into arrays (`items[2].title`). */
export function flattenContent(node: unknown, prefix = ''): Map<string, unknown> {
  const leaves = new Map<string, unknown>();
  if (Array.isArray(node)) {
    node.forEach((item, index) => {
      for (const [path, value] of flattenContent(item, `${prefix}[${index}]`))
        leaves.set(path, value);
    });
  } else if (isPlainObject(node)) {
    for (const [key, value] of Object.entries(node)) {
      const path = prefix ? `${prefix}.${key}` : key;
      for (const [childPath, childValue] of flattenContent(value, path)) {
        leaves.set(childPath, childValue);
      }
    }
  } else {
    leaves.set(prefix || '(root)', node);
  }
  return leaves;
}

/**
 * Compares one locale's long-form content with the source locale's. Mapped
 * types already guarantee the shape, so the only question is whether the
 * prose was translated: skeleton tokens and leaves the translation does not
 * carry (a paragraph list of another length) are not comparable. Shared
 * brand names ("Cosmic Signature NFT") stay identical in every locale, which
 * is why only a module whose EVERY comparable leaf is verbatim counts as
 * untranslated.
 */
export function compareContent(area: string, source: unknown, translation: unknown): ContentReport {
  const sourceLeaves = flattenContent(source);
  const translatedLeaves = flattenContent(translation);
  const identical: string[] = [];
  let total = 0;
  for (const [path, sourceValue] of sourceLeaves) {
    const translatedValue = translatedLeaves.get(path);
    if (typeof sourceValue !== 'string' || typeof translatedValue !== 'string') continue;
    if (!isProse(sourceValue)) continue;
    total += 1;
    if (sourceValue === translatedValue) identical.push(path);
  }
  return { area, total, identical, untranslated: total > 0 && identical.length === total };
}

/**
 * Checks the source catalog against itself: only ICU syntax and plural
 * completeness apply (parity with itself is trivially true).
 */
export function checkSourceNamespace(
  namespace: string,
  source: Messages,
  intlLocale: string,
): Pick<NamespaceReport, 'namespace' | 'syntaxErrors' | 'pluralGaps'> {
  const syntaxErrors: string[] = [];
  const pluralGaps: string[] = [];
  for (const [key, value] of flattenMessages(source)) {
    if (typeof value !== 'string') continue;
    let signature: IcuSignature;
    try {
      signature = icuSignature(value);
    } catch (error) {
      syntaxErrors.push(`${key}: ${error instanceof Error ? error.message : String(error)}`);
      continue;
    }
    for (const plural of signature.plurals) {
      const required = pluralCategoriesFor(intlLocale, plural.type);
      const absent = required.filter((category) => !plural.categories.has(category));
      if (absent.length > 0) {
        pluralGaps.push(`${key}: {${plural.argument}, plural} lacks ${absent.join(', ')}`);
      }
    }
  }
  return { namespace, syntaxErrors, pluralGaps };
}
