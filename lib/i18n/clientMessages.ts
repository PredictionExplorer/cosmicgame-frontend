import { NAMESPACES, type Namespace } from '@/i18n/request';

type Messages = Record<string, unknown>;

/**
 * Message scoping for NextIntlClientProvider.
 *
 * Without an explicit `messages` prop, next-intl serializes the ENTIRE
 * catalog (~300 KB of JSON across 34 namespaces) into every page's HTML and
 * hydrates it on every visit. Scoping cuts the home page's HTML by roughly
 * 240 KB. Two tiers exist:
 *
 *   - Chrome namespaces: needed by the persistent shell that the root
 *     layouts render around every page (header, footer, wallet button,
 *     toasts, error surfaces, shared inputs/tooltips).
 *   - Page namespaces: declared per page via <PageMessages>, which renders
 *     a nested provider containing chrome + page namespaces (nested
 *     next-intl providers REPLACE messages, so chrome must be repeated).
 *
 * Guarded by i18n-scoping tests: a static walker computes which namespaces
 * each page's component tree actually uses and fails if a declaration is
 * missing, and an e2e crawl fails on MISSING_MESSAGE console errors.
 */
export const APP_CHROME_NAMESPACES = [
  'common',
  'errors',
  'footer',
  'forms',
  'formats',
  'nav',
  'search',
  'toasts',
  'tooltips',
  'wallet',
] as const satisfies readonly Namespace[];

export const LANDING_CHROME_NAMESPACES = [
  'common',
  'errors',
  'footer',
  'formats',
  'landing',
  'nav',
] as const satisfies readonly Namespace[];

const KNOWN_NAMESPACES = new Set<string>(NAMESPACES);

/**
 * Returns a catalog containing only the requested namespaces. Throws on
 * unknown namespaces so typos surface in CI rather than as silently missing
 * translations in production.
 */
export function pickMessages(all: Messages, namespaces: readonly Namespace[]): Messages {
  const picked: Messages = {};
  for (const namespace of namespaces) {
    if (!KNOWN_NAMESPACES.has(namespace)) {
      throw new Error(`pickMessages: unknown namespace "${namespace}"`);
    }
    const value = all[namespace];
    if (value === undefined) {
      throw new Error(`pickMessages: namespace "${namespace}" missing from loaded catalog`);
    }
    picked[namespace] = value;
  }
  return picked;
}
