import { LOCALE_ALIASES, routing, type AppLocale, type TranslatedLocale } from './routing';

export type { AppLocale, TranslatedLocale };

/**
 * A value defined once per supported locale.
 *
 * Every per-locale registry in the codebase (content catalogs, formatting
 * conventions, wallet-UI locales, …) is typed as a `LocaleRecord`, so adding
 * a locale to `routing.locales` turns each registry into a compile error
 * until an entry is provided. "Adding a language" is enforced by the
 * compiler, not by grepping for ternaries.
 */
export type LocaleRecord<T> = Record<AppLocale, T>;

/** Type guard for exact `AppLocale` values (`'en'`, `'zh'`, `'uk'`, …). */
export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (routing.locales as readonly string[]).includes(value);
}

/** Type guard for locales that are translations of the default locale. */
export function isTranslatedLocale(value: unknown): value is TranslatedLocale {
  return isAppLocale(value) && value !== routing.defaultLocale;
}

/** `zh_tw` → `zh-TW`; `undefined` when the input is not a BCP 47 tag at all. */
function canonicalTag(input: string): string | undefined {
  const tag = input.trim().replace(/_/g, '-');
  if (!tag) return undefined;
  try {
    return Intl.getCanonicalLocales(tag)[0];
  } catch {
    return undefined;
  }
}

/** Likely-subtags expansion (`zh-TW` → `zh-Hant-TW`, `zh` → `zh-Hans-CN`), or `undefined`. */
function maximize(tag: string): Intl.Locale | undefined {
  try {
    return new Intl.Locale(tag).maximize();
  } catch {
    return undefined;
  }
}

const sameTag = (a: string, b: string): boolean => a.toLowerCase() === b.toLowerCase();

/**
 * How well a supported locale fits a requested tag, both maximized. Script
 * outranks region: a Traditional-script reader from an unlisted region is
 * better served by another Traditional variant than by a Simplified one that
 * happens to share the region.
 */
function affinity(wanted: Intl.Locale, candidate: Intl.Locale): number {
  if (candidate.language !== wanted.language) return 0;
  let score = 1;
  if (candidate.script === wanted.script) score += 2;
  if (candidate.region === wanted.region) score += 1;
  return score;
}

const resolved = new Map<string, AppLocale>();

/**
 * Canonicalizes locale-ish input (`zh`, `zh-CN`, `ZH_TW`, `zh-Hant`, `uk-UA`,
 * `en-US`, undefined) to a supported `AppLocale`, falling back to the default
 * locale. Resolution order:
 *
 *   1. a supported locale code, in any casing or with `_` separators;
 *   2. an alias declared in `LOCALE_ALIASES` (`zh-Hant` → `zh-TW`);
 *   3. the best-fitting variant of the SAME language, comparing the
 *      likely-subtags expansion of the input against each locale's code and
 *      aliases — script first, then region, then declaration order
 *      (`zh-SG` → `zh`, `zh-Hant-MO` → `zh-HK`, `en-GB` → `en`);
 *   4. the default locale — never a neighbouring language (`ru` is not `uk`).
 *
 * This is a canonicalizer for values the app already holds (route params,
 * `Intl` tags, wallet-kit codes). Negotiating a visitor's `Accept-Language`
 * is next-intl's job in proxy.ts, where CLDR "best fit" data also maps
 * unlisted languages such as `yue` onto `zh-HK`.
 */
export function normalizeLocale(input: string | null | undefined): AppLocale {
  if (!input) return routing.defaultLocale;
  if (isAppLocale(input)) return input;

  const cached = resolved.get(input);
  if (cached) return cached;

  const locale = resolveLocale(input);
  resolved.set(input, locale);
  return locale;
}

function resolveLocale(input: string): AppLocale {
  const tag = canonicalTag(input);
  if (!tag) return routing.defaultLocale;

  for (const locale of routing.locales) {
    if (sameTag(locale, tag) || LOCALE_ALIASES[locale].some((alias) => sameTag(alias, tag))) {
      return locale;
    }
  }

  const wanted = maximize(tag);
  if (!wanted) return routing.defaultLocale;

  let best: { locale: AppLocale; score: number } | undefined;
  for (const locale of routing.locales) {
    for (const candidate of [locale, ...LOCALE_ALIASES[locale]]) {
      const maximized = maximize(candidate);
      const score = maximized ? affinity(wanted, maximized) : 0;
      if (score > 0 && (!best || score > best.score)) best = { locale, score };
    }
  }
  return best?.locale ?? routing.defaultLocale;
}

/** Resolves the entry of a `LocaleRecord` for arbitrary locale-ish input. */
export function pickByLocale<T>(record: LocaleRecord<T>, locale: string | null | undefined): T {
  return record[normalizeLocale(locale)];
}
