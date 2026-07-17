import { defineRouting } from 'next-intl/routing';

/**
 * Locale routing contract for the whole site (see docs/i18n/README.md §2).
 *
 * `localePrefix: 'as-needed'` keeps every existing English URL unchanged
 * (`/gallery`) while Chinese lives under a prefix (`/zh/gallery`) on both
 * hosts. Host separation stays in proxy.ts, which strips the locale prefix
 * before running its checks and then delegates to the next-intl middleware.
 */
export const routing = defineRouting({
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export type AppLocale = (typeof routing.locales)[number];

export const LOCALE_LABELS: Record<AppLocale, string> = {
  // Language names are never translated — each label is in its own language.
  en: 'English',
  zh: '中文',
};
