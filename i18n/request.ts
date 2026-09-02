import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing, type AppLocale } from './routing';

/**
 * Message namespaces — one JSON file per entry in messages/<locale>/.
 * Adding a namespace: create it for EVERY locale (the parity script,
 * scripts/i18n-parity.ts, reports drift) and list it here.
 */
export const NAMESPACES = [
  'admin',
  'allocation',
  'anchoring',
  'code',
  'common',
  'contracts',
  'coordination',
  'currentCycle',
  'detail',
  'errors',
  'ethContribution',
  'faq',
  'footer',
  'formats',
  'forms',
  'gallery',
  'gesture',
  'home',
  'imprint',
  'landing',
  'legal',
  'marketing',
  'meta',
  'myPages',
  'nav',
  'publicGoods',
  'search',
  'seo',
  'siteMap',
  'statistics',
  'tables',
  'tooltips',
  'toasts',
  'traits',
  'wallet',
] as const;

export type Namespace = (typeof NAMESPACES)[number];

type Messages = Record<string, unknown>;

function isPlainObject(value: unknown): value is Messages {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Deep-merges `overlay` over `base`. Missing or empty-string keys in the
 * overlay fall back to the base value, so an untranslated key renders
 * English rather than a raw key path (docs/i18n/README.md §3.2).
 */
export function mergeMessages(base: Messages, overlay: Messages): Messages {
  const result: Messages = { ...base };
  for (const [key, overlayValue] of Object.entries(overlay)) {
    const baseValue = result[key];
    if (isPlainObject(baseValue) && isPlainObject(overlayValue)) {
      result[key] = mergeMessages(baseValue, overlayValue);
    } else if (overlayValue !== undefined && overlayValue !== '') {
      result[key] = overlayValue;
    }
  }
  return result;
}

async function loadLocaleMessages(locale: AppLocale): Promise<Messages> {
  const namespaces = await Promise.all(
    NAMESPACES.map(async (namespace) => {
      const mod = (await import(`../messages/${locale}/${namespace}.json`)) as {
        default: Messages;
      };
      return [namespace, mod.default] as const;
    }),
  );
  return Object.fromEntries(namespaces);
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale: AppLocale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const english = await loadLocaleMessages('en');
  const messages =
    locale === 'en' ? english : mergeMessages(english, await loadLocaleMessages(locale));

  return { locale, messages };
});
