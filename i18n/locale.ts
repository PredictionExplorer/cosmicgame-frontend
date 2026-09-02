import { routing, type AppLocale, type TranslatedLocale } from './routing';

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

/**
 * Canonicalizes locale-ish input (`zh`, `zh-CN`, `ZH_TW`, `uk-UA`, `en-US`,
 * undefined) to a supported `AppLocale`, falling back to the default locale.
 *
 * The single home for the parsing that was previously copy-pasted as
 * `locale.toLowerCase().split('-')[0] === 'zh'` ternaries.
 */
export function normalizeLocale(input: string | null | undefined): AppLocale {
  if (!input) return routing.defaultLocale;
  const base = input.trim().toLowerCase().split(/[-_]/, 1)[0] ?? '';
  return isAppLocale(base) ? base : routing.defaultLocale;
}

/** Resolves the entry of a `LocaleRecord` for arbitrary locale-ish input. */
export function pickByLocale<T>(record: LocaleRecord<T>, locale: string | null | undefined): T {
  return record[normalizeLocale(locale)];
}
