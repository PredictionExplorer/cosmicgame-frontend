import { defineRouting } from 'next-intl/routing';

/**
 * Locale routing contract for the whole site (see docs/i18n/README.md §2).
 *
 * `localePrefix: 'as-needed'` keeps every existing English URL unchanged
 * (`/gallery`) while every other locale lives under its prefix (`/zh/gallery`,
 * `/zh-TW/gallery`, `/uk/gallery`) on both hosts. Host separation stays in
 * proxy.ts, which strips the locale prefix before running its checks and then
 * delegates to the next-intl middleware.
 *
 * Locale codes are canonical BCP 47 tags, chosen so that the tags browsers
 * actually send match without translation tables: a bare language code is the
 * CLDR default variant of that language (`zh` = Simplified Chinese, mainland
 * conventions, which also serves Singapore), and further variants of the same
 * language carry the region that distinguishes them (`zh-TW`, `zh-HK`).
 * next-intl negotiates `Accept-Language` with CLDR "best fit" matching, so
 * `zh-Hant` lands on `zh-TW` and `zh-MO` / `yue` on `zh-HK` with no code here.
 *
 * Adding a locale here is the whole "register a language" step: every
 * `LocaleRecord` registry in the codebase becomes a compile error until it
 * has an entry (docs/i18n/README.md §10 walks the checklist).
 */
// Declared as literals BEFORE defineRouting: next-intl types
// `routing.defaultLocale` as the whole locale union, which would collapse
// `TranslatedLocale` to `never` and turn every translated-locale registry
// into an unchecked `{}`.
const LOCALES = ['en', 'zh', 'zh-TW', 'zh-HK', 'uk'] as const;
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
  // Language names are never translated — each label is in its own language
  // and, for variants of one language, in its own script and region wording.
  en: 'English',
  zh: '简体中文',
  'zh-TW': '繁體中文（台灣）',
  'zh-HK': '繁體中文（香港）',
  uk: 'Українська',
};

/**
 * Extra BCP 47 tags each locale serves besides its own code.
 *
 * Two consumers: `lib/hreflang.ts` emits every alias as an additional
 * hreflang alternate for the same URL (`zh-Hant` readers anywhere reach the
 * Taiwan variant, Macau reaches the Hong Kong variant, and `zh-Hans` is the
 * script-explicit name for `zh`), and `normalizeLocale` in ./locale.ts
 * treats an alias as an exact hit before falling back to script/region
 * scoring. Keep the list to tags with a real audience — the bare language
 * code already acts as the catch-all for everyone else.
 */
export const LOCALE_ALIASES: Record<AppLocale, readonly string[]> = {
  en: [],
  zh: ['zh-Hans'],
  'zh-TW': ['zh-Hant'],
  'zh-HK': ['zh-MO'],
  uk: [],
};
