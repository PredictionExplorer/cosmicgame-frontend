import { defineRouting } from 'next-intl/routing';

/**
 * Locale routing contract for the whole site (see docs/i18n/README.md §2).
 *
 * `localePrefix: 'as-needed'` keeps every existing English URL unchanged
 * (`/gallery`) while every other locale lives under its prefix (`/zh/gallery`,
 * `/uk/gallery`) on both hosts. Host separation stays in proxy.ts, which
 * strips the locale prefix before running its checks and then delegates to
 * the next-intl middleware.
 *
 * Adding a locale here is the whole "register a language" step: every
 * `LocaleRecord` registry in the codebase becomes a compile error until it
 * has an entry (docs/i18n/README.md §10 walks the checklist).
 */
// Declared as literals BEFORE defineRouting: next-intl types
// `routing.defaultLocale` as the whole locale union, which would collapse
// `TranslatedLocale` to `never` and turn every translated-locale registry
// into an unchecked `{}`.
const LOCALES = ['en', 'zh', 'uk'] as const;
const DEFAULT_LOCALE = 'en' satisfies (typeof LOCALES)[number];

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'as-needed',
  // Persist the language choice for a year (next-intl defaults to a session
  // cookie). Applies to both the middleware and client-side navigation.
  localeCookie: {
    maxAge: 60 * 60 * 24 * 365,
  },
});

export type AppLocale = (typeof LOCALES)[number];

/** Locales that are translations of the default-locale source of truth. */
export type TranslatedLocale = Exclude<AppLocale, typeof DEFAULT_LOCALE>;

/** `routing.locales` without the default locale, in declaration order. */
export const TRANSLATED_LOCALES: readonly TranslatedLocale[] = LOCALES.filter(
  (locale): locale is TranslatedLocale => locale !== DEFAULT_LOCALE,
);

export const LOCALE_LABELS: Record<AppLocale, string> = {
  // Language names are never translated — each label is in its own language.
  en: 'English',
  zh: '中文',
  uk: 'Українська',
};
