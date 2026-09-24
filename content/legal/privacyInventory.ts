import { LOCALE_COOKIE_NAME } from '@/i18n/localeCookie';
import { THEME_COOKIE_NAME, THEME_STORAGE_KEY } from '@/lib/theme/config';
import { GA_TRACKING_ID } from '@/utils/analytics';

/**
 * What the site actually loads and stores, so the privacy policy lists it
 * from the same configuration that turns it on. A service or cookie whose
 * switch is off in this deployment (no Google Analytics measurement id, no
 * Sentry DSN) is not listed. The copy files describe each entry by id.
 *
 * Checked against app/root-document.tsx (Vercel Web Analytics, Speed
 * Insights, the optional GA4 tag), sentry.client.config.ts, config/wagmi.ts
 * (RainbowKit, WalletConnect), hooks/useTokenPrice.ts (CoinGecko) and the
 * storage keys below. The two keys owned by client modules are written out
 * here (a server module cannot import a value from a 'use client' file); the
 * privacy test pins them to their sources.
 */

/** hooks/useAttentionPreferences.ts `ATTENTION_STORAGE_KEY`. */
export const ATTENTION_STORAGE_KEY = 'cosmic-attention-preferences';
/** components/home/CyclePhaseGuide.tsx `explainerStorageKey`. */
export const EXPLAINER_STORAGE_KEY = 'cosmic-cycle-explainer-dismissed';

export const PRIVACY_SERVICE_IDS = [
  'vercel',
  'vercelAnalytics',
  'googleAnalytics',
  'sentry',
  'api',
  'rpc',
  'walletConnect',
  'coingecko',
] as const;

export type PrivacyServiceId = (typeof PRIVACY_SERVICE_IDS)[number];

export interface PrivacyService {
  readonly id: PrivacyServiceId;
  /** The provider's name as it presents itself (not translated). */
  readonly name: string;
  /** The provider's own privacy policy; null for Cosmic Signature's own service. */
  readonly policy: string | null;
}

const SERVICES: Record<PrivacyServiceId, PrivacyService & { readonly active: boolean }> = {
  vercel: {
    id: 'vercel',
    name: 'Vercel',
    policy: 'https://vercel.com/legal/privacy-policy',
    active: true,
  },
  vercelAnalytics: {
    id: 'vercelAnalytics',
    name: 'Vercel Web Analytics, Speed Insights',
    policy: 'https://vercel.com/docs/analytics/privacy-policy',
    active: true,
  },
  googleAnalytics: {
    id: 'googleAnalytics',
    name: 'Google Analytics 4',
    policy: 'https://policies.google.com/privacy',
    active: Boolean(GA_TRACKING_ID),
  },
  sentry: {
    id: 'sentry',
    name: 'Sentry',
    policy: 'https://sentry.io/privacy/',
    active: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  },
  api: { id: 'api', name: 'Cosmic Signature API', policy: null, active: true },
  rpc: { id: 'rpc', name: 'Arbitrum RPC', policy: null, active: true },
  walletConnect: {
    id: 'walletConnect',
    name: 'WalletConnect (Reown)',
    policy: 'https://reown.com/privacy-policy',
    active: Boolean(process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim()),
  },
  coingecko: {
    id: 'coingecko',
    name: 'CoinGecko',
    policy: 'https://www.coingecko.com/en/privacy',
    active: true,
  },
};

/** The services this deployment loads, in the policy's order. */
export function activePrivacyServices(): PrivacyService[] {
  return PRIVACY_SERVICE_IDS.flatMap((id) => {
    const { active, ...service } = SERVICES[id];
    return active ? [service] : [];
  });
}

export const PRIVACY_STORAGE_IDS = [
  'themeCookie',
  'localeCookie',
  'gaCookies',
  'themeStorage',
  'attention',
  'explainer',
  'wallet',
] as const;

export type PrivacyStorageId = (typeof PRIVACY_STORAGE_IDS)[number];

export interface PrivacyStorageEntry {
  readonly id: PrivacyStorageId;
  /** The cookie or key names, exactly as the browser shows them. */
  readonly names: readonly string[];
  /** `browser`: localStorage or IndexedDB, which stay on the device and are never sent. */
  readonly kind: 'cookie' | 'browser';
  /** A cookie's fixed lifetime, or browser storage kept until the reader clears it. */
  readonly lifetime: 'oneYear' | 'twoYears' | 'untilCleared';
}

const STORAGE: Record<PrivacyStorageId, PrivacyStorageEntry & { readonly active: boolean }> = {
  themeCookie: {
    id: 'themeCookie',
    names: [THEME_COOKIE_NAME],
    kind: 'cookie',
    lifetime: 'oneYear',
    active: true,
  },
  localeCookie: {
    id: 'localeCookie',
    names: [LOCALE_COOKIE_NAME],
    kind: 'cookie',
    lifetime: 'oneYear',
    active: true,
  },
  gaCookies: {
    id: 'gaCookies',
    names: ['_ga', '_ga_*'],
    kind: 'cookie',
    lifetime: 'twoYears',
    active: Boolean(GA_TRACKING_ID),
  },
  themeStorage: {
    id: 'themeStorage',
    names: [THEME_STORAGE_KEY],
    kind: 'browser',
    lifetime: 'untilCleared',
    active: true,
  },
  attention: {
    id: 'attention',
    names: [ATTENTION_STORAGE_KEY],
    kind: 'browser',
    lifetime: 'untilCleared',
    active: true,
  },
  explainer: {
    id: 'explainer',
    names: [EXPLAINER_STORAGE_KEY],
    kind: 'browser',
    lifetime: 'untilCleared',
    active: true,
  },
  wallet: {
    id: 'wallet',
    names: ['wagmi.*', 'rk-*', 'wc@2:*'],
    kind: 'browser',
    lifetime: 'untilCleared',
    active: true,
  },
};

/** The cookies and browser storage this deployment can set, in the policy's order. */
export function activePrivacyStorage(): PrivacyStorageEntry[] {
  return PRIVACY_STORAGE_IDS.flatMap((id) => {
    const { active, ...entry } = STORAGE[id];
    return active ? [entry] : [];
  });
}
