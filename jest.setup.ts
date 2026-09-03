/**
 * Jest setup — runs once per test worker before the test suite starts.
 * Compiled via `next/jest` (babel-jest + @babel/preset-typescript).
 */
import { TextDecoder, TextEncoder } from 'node:util';

import { toHaveNoViolations } from 'jest-axe';

import '@testing-library/jest-dom';

// Polyfill Web TextEncoder/TextDecoder for jsdom (required by viem, wagmi,
// and other modern encoders that expect WHATWG Encoding standard globals).
(globalThis as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder = TextEncoder;
(globalThis as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder = TextDecoder;

// Required by config/networks.ts (which refuses defaults); set so tests
// can render app components without tripping the env-validation guard.
//
// These are assigned UNCONDITIONALLY (no `|| existing` fallback) so the suite
// is hermetic. `next/jest` can leak `.env.local` values (e.g.
// `NEXT_PUBLIC_NETWORK=mainnet`) into a Jest worker depending on worker
// scheduling, which previously caused flaky chain-id mismatches under parallel
// runs (mainnet 42161 vs the expected sepolia 421614) while `--runInBand`
// passed. Forcing the values here guarantees every worker resolves the same
// network regardless of `.env.local` or shell env. Per-test overrides still
// work because they run in `beforeEach`, after this setup file.
process.env.NEXT_PUBLIC_NETWORK = 'sepolia';
process.env.NEXT_PUBLIC_API_URL = 'http://test-api.example/api/cosmicgame/';
process.env.NEXT_PUBLIC_RPC_URL = 'http://127.0.0.1:8545';
process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID = 'test-walletconnect-project-id';
// The plural rotation lists take precedence over the singular vars
// (lib/serverRotation.ts), so shell-exported values would silently change
// which base URL the suite resolves. Strip them for the same hermeticity.
delete process.env.NEXT_PUBLIC_API_URLS;
delete process.env.NEXT_PUBLIC_RPC_URLS;

// Build stamp (mirrors next.config `env`); Preview/local show footer line in tests.
process.env.NEXT_PUBLIC_BUILD_COMMIT =
  process.env.NEXT_PUBLIC_BUILD_COMMIT || 'deadbeef1234567890abcdef1234567890abcd';
process.env.NEXT_PUBLIC_BUILD_REF = process.env.NEXT_PUBLIC_BUILD_REF || 'local';
process.env.NEXT_PUBLIC_VERCEL_ENV = process.env.NEXT_PUBLIC_VERCEL_ENV || 'preview';

expect.extend(toHaveNoViolations);

// Provide IntersectionObserver for jsdom (used by Next.js Link prefetching
// and various in-view animation hooks). jsdom doesn't ship one.
type IntersectionCallback = (
  entries: Partial<IntersectionObserverEntry>[],
  observer: unknown,
) => void;
class MockIntersectionObserver {
  private _cb: IntersectionCallback;
  constructor(cb: IntersectionCallback) {
    this._cb = cb;
  }
  observe(): void {
    this._cb([{ isIntersecting: false, target: document.createElement('div') }], this);
  }
  unobserve(): void {}
  disconnect(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
(global as unknown as { IntersectionObserver: unknown }).IntersectionObserver =
  MockIntersectionObserver;

// Fail tests on unexpected console.error / console.warn. Known third-party
// warnings that we cannot fix are allowlisted and silently skipped. Any NEW
// warning that doesn't match the allowlist throws, failing the test
// immediately so the offending change is easy to spot in CI.
const ALLOWED_PATTERNS: readonly string[] = [
  'not wrapped in act(',
  'cannot be a child of',
  'Preload assets timed out',
  'load preload assets',
  'Missing `Description` or `aria-describedby',
  '[apiCall]',
  '[apiPost]',
  '[Cosmic Signature]',
];

function isAllowed(msg: string): boolean {
  return ALLOWED_PATTERNS.some((p) => msg.includes(p));
}

const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: unknown[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (isAllowed(msg)) return;
  originalError.apply(console, args);
  throw new Error(`Unexpected console.error in test: ${msg.slice(0, 200)}`);
};

console.warn = (...args: unknown[]) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (isAllowed(msg)) return;
  originalWarn.apply(console, args);
  throw new Error(`Unexpected console.warn in test: ${msg.slice(0, 200)}`);
};

// Mock next/navigation for App Router. All routing hooks return no-op
// defaults so individual tests can override per-case via jest.mock() without
// importing the real next/navigation (which pulls React server components).
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

// next-intl ships untranspiled ESM (like wagmi/rainbowkit above), so its
// client hooks are mocked globally: components under test render with the
// default locale and message KEYS as text (assert on keys, not copy).
jest.mock('next-intl', () => {
  const React = require('react');
  const statisticsMessages = require('./messages/en/statistics.json') as Record<string, unknown>;
  const formatsMessages = require('./messages/en/formats.json') as Record<string, unknown>;
  const catalogMessages: Record<string, Record<string, unknown>> = {
    admin: require('./messages/en/admin.json') as Record<string, unknown>,
    code: require('./messages/en/code.json') as Record<string, unknown>,
    contracts: require('./messages/en/contracts.json') as Record<string, unknown>,
    coordination: require('./messages/en/coordination.json') as Record<string, unknown>,
    ethContribution: require('./messages/en/ethContribution.json') as Record<string, unknown>,
    faq: require('./messages/en/faq.json') as Record<string, unknown>,
    imprint: require('./messages/en/imprint.json') as Record<string, unknown>,
    legal: require('./messages/en/legal.json') as Record<string, unknown>,
    marketing: require('./messages/en/marketing.json') as Record<string, unknown>,
    publicGoods: require('./messages/en/publicGoods.json') as Record<string, unknown>,
    seo: require('./messages/en/seo.json') as Record<string, unknown>,
    statistics: statisticsMessages,
    traits: require('./messages/en/traits.json') as Record<string, unknown>,
  };
  const resolveMessage = (messages: Record<string, unknown>, key: string): unknown =>
    key
      .split('.')
      .reduce<unknown>(
        (value, part) =>
          value && typeof value === 'object' ? (value as Record<string, unknown>)[part] : undefined,
        messages,
      );
  const interpolate = (message: string, values?: Record<string, unknown>) =>
    message.replace(/\{(\w+)\}/g, (_match, name: string) => String(values?.[name] ?? `{${name}}`));

  const useTranslations = (namespace?: string) => {
    const prefix = namespace ? `${namespace}.` : '';
    const t = (key: string, values?: Record<string, unknown>) => {
      if (namespace && catalogMessages[namespace]) {
        const message = resolveMessage(catalogMessages[namespace], key);
        if (typeof message === 'string') return interpolate(message, values);
      }
      if (namespace === 'formats' && key.startsWith('durationCompact.')) {
        const message = resolveMessage(formatsMessages, key);
        if (typeof message === 'string') return interpolate(message, values);
      }
      if (namespace === 'tooltips') {
        if (key === 'moreInformation') return `More information: ${String(values?.content ?? '')}`;
        if (key === 'moreInformationAbout') {
          return `More information about ${String(values?.label ?? '')}`;
        }
        if (key === 'explainColumn') return `Explain column: ${String(values?.column ?? '')}`;
      }
      if (namespace === 'common' && key === 'status.loadingDots') return 'Loading...';
      if (namespace === 'errors' && key === 'state.title') return 'Something went wrong';
      if (namespace === 'errors' && key === 'state.retry') return 'Try again';
      if (namespace === 'wallet' && key === 'labels.nftCount') {
        return String(values?.count ?? '');
      }
      const renderedValues = values
        ? Object.entries(values)
            .filter(([, value]) => typeof value !== 'function')
            .map(([name, value]) => `${name}=${String(value)}`)
            .join(',')
        : '';
      return `${prefix}${key}${renderedValues ? `(${renderedValues})` : ''}`;
    };
    t.rich = (key: string, values?: Record<string, unknown>) => {
      if (namespace && catalogMessages[namespace]) {
        const message = resolveMessage(catalogMessages[namespace], key);
        if (typeof message === 'string') {
          const strongMatch = message.match(/^(.*)<strong>\{(\w+)\}<\/strong>(.*)$/);
          if (strongMatch && typeof values?.strong === 'function') {
            const before = strongMatch[1] ?? '';
            const valueName = strongMatch[2] ?? '';
            const after = strongMatch[3] ?? '';
            const renderStrong = values.strong as (chunks: string) => unknown;
            return React.createElement(
              React.Fragment,
              null,
              interpolate(before, values),
              renderStrong(String(values?.[valueName] ?? `{${valueName}}`)),
              interpolate(after, values),
            );
          }
          return interpolate(message, values).replace(/<\/?\w+>/g, '');
        }
      }
      return `${prefix}${key}`;
    };
    t.markup = (key: string) => `${prefix}${key}`;
    t.raw = (key: string) => `${prefix}${key}`;
    // Catalog-backed namespaces answer truthfully so components that branch
    // on `t.has` (e.g. trait value fallbacks) behave as in production.
    t.has = (key: string) =>
      namespace && catalogMessages[namespace]
        ? typeof resolveMessage(catalogMessages[namespace], key) === 'string'
        : true;
    return t;
  };
  return {
    useLocale: () => 'en',
    useTranslations,
    useMessages: () => ({}),
    useNow: () => new Date(0),
    useTimeZone: () => 'UTC',
    useFormatter: () => ({
      dateTime: (value: Date | number) => String(value),
      number: (value: number) => String(value),
      relativeTime: (value: Date | number) => String(value),
      list: (value: Iterable<string>) => Array.from(value).join(', '),
    }),
    NextIntlClientProvider: ({ children }: { children?: unknown }) => children,
    hasLocale: (locales: readonly string[], candidate: unknown) =>
      typeof candidate === 'string' && locales.includes(candidate),
  };
});

// PageMessages is an async server component (it awaits getMessages) that
// jsdom test renderers cannot await; scoping correctness has its own guard
// (app/[locale]/(app)/__tests__/i18n-scoping.test.ts), so tests treat it as
// a passthrough.
jest.mock('@/components/i18n/PageMessages', () => ({
  PageMessages: ({ children }: { children?: unknown }) => children,
}));

// The lazy wallet modal chunk imports RainbowKit + WalletConnect (untranspiled
// ESM). Hovering/clicking a connect button in a test would pull that graph in
// through the dynamic import, so the module is stubbed globally; the
// deferred-mount behavior has its own suite (contexts/__tests__/
// WalletUiContext.test.tsx) with a local probe mock.
jest.mock('@/components/wallet/WalletUi', () => ({
  WalletUi: () => null,
}));

jest.mock('next-intl/server', () => ({
  setRequestLocale: jest.fn(),
  getLocale: jest.fn(async () => 'en'),
  // A catalog that "contains" every namespace: PageMessages/pickMessages
  // validate that requested namespaces exist, and tests assert on message
  // KEYS (rendered by the useTranslations mock), not on catalog contents.
  getMessages: async () =>
    new Proxy({} as Record<string, unknown>, {
      get: (_target, property) => (typeof property === 'string' ? {} : undefined),
      has: () => true,
    }),
  getTranslations: async (options?: string | { locale?: string; namespace?: string }) => {
    const namespace = typeof options === 'string' ? options : options?.namespace;
    // Any locale registered in routing.locales resolves its own catalogs;
    // unknown or absent locales fall back to the default (English) catalog.
    const { routing } = require('./i18n/routing') as {
      routing: { locales: readonly string[]; defaultLocale: string };
    };
    const requestedLocale = typeof options === 'object' ? options.locale : undefined;
    const locale =
      requestedLocale && routing.locales.includes(requestedLocale)
        ? requestedLocale
        : routing.defaultLocale;
    const prefix = namespace ? `${namespace}.` : '';
    // The namespaces this mock answers from real catalogs; every other
    // namespace renders message KEYS so tests assert on keys, not copy.
    const catalogNamespaces = [
      'admin',
      'code',
      'common',
      'contracts',
      'coordination',
      'detail',
      'ethContribution',
      'faq',
      'imprint',
      'legal',
      'marketing',
      'meta',
      'publicGoods',
      'seo',
      'siteMap',
      'statistics',
    ];
    const namespaceMessages: Record<string, Record<string, unknown>> = Object.fromEntries(
      catalogNamespaces.map((name) => [
        name,
        require(`./messages/${locale}/${name}.json`) as Record<string, unknown>,
      ]),
    );
    const statisticsMessages = namespaceMessages.statistics!;
    const resolveMessage = (key: string): unknown =>
      key
        .split('.')
        .reduce<unknown>(
          (value, part) =>
            value && typeof value === 'object'
              ? (value as Record<string, unknown>)[part]
              : undefined,
          (namespace && namespaceMessages[namespace]) || statisticsMessages,
        );
    return (key: string, values?: Record<string, unknown>) => {
      if (namespace && namespaceMessages[namespace]) {
        const message = resolveMessage(key);
        if (typeof message === 'string') {
          return message.replace(/\{(\w+)\}/g, (_match, name: string) =>
            String(values?.[name] ?? `{${name}}`),
          );
        }
      }
      if (namespace === 'meta') {
        const shared: Record<string, string> = {
          'shared.defaultTitle': 'Cosmic Signature',
          'shared.defaultOgTitle': 'Cosmic Signature — Every Gesture Shapes the Signature.',
          'shared.defaultDescription':
            'A procedural on-chain art protocol on Arbitrum. Every gesture you make shapes the cycle’s final Signature. When the cycle finalizes, the protocol distributes its reserves across more than ten allocation tracks — including Protocol Guild, the funding mechanism for 170+ Ethereum core contributors.',
        };
        if (shared[key]) return shared[key];
      }
      const renderedValues = values
        ? Object.entries(values)
            .map(([name, value]) => `${name}=${String(value)}`)
            .join(',')
        : '';
      return `${prefix}${key}${renderedValues ? `(${renderedValues})` : ''}`;
    };
  },
  getFormatter: async () => ({
    dateTime: (value: Date | number) => String(value),
    number: (value: number) => String(value),
  }),
  getRequestConfig: (factory: unknown) => factory,
}));

// defineRouting is pure config; the identity keeps @/i18n/routing usable
// (routing.locales, LOCALE_LABELS) without loading next-intl's ESM.
jest.mock('next-intl/routing', () => ({
  defineRouting: <T>(config: T) => config,
}));

// Mock the locale-aware navigation wrappers (@/i18n/navigation). Link renders
// a plain anchor; the hooks DELEGATE to the next/navigation mock at call time,
// so existing per-test `jest.mock('next/navigation', ...)` overrides (router
// spies, pathname stubs) keep working unchanged for components that migrated
// to the i18n wrappers.
jest.mock('@/i18n/navigation', () => {
  const React = require('react');
  const hrefToString = (href: unknown): string => {
    if (typeof href === 'string') return href;
    if (href && typeof href === 'object') {
      const obj = href as { pathname?: string; href?: string };
      return obj.pathname ?? obj.href ?? '/';
    }
    return '/';
  };
  const nav = () => jest.requireMock('next/navigation');
  const Link = React.forwardRef(function MockI18nLink(
    props: { href: unknown; children?: unknown; locale?: string } & Record<string, unknown>,
    ref: unknown,
  ) {
    const { href, children, locale: _locale, prefetch: _prefetch, ...rest } = props;
    return React.createElement('a', { href: hrefToString(href), ref, ...rest }, children);
  });
  // Mirrors `localePrefix: 'as-needed'`: the default locale stays unprefixed,
  // every other locale lives under its prefix (`/vi/gallery`, `/vi` for `/`).
  const getPathname = (args: { href: unknown; locale?: string }) => {
    const pathname = hrefToString(args?.href);
    const { routing } = require('./i18n/routing') as { routing: { defaultLocale: string } };
    if (!args?.locale || args.locale === routing.defaultLocale) return pathname;
    return pathname === '/' ? `/${args.locale}` : `/${args.locale}${pathname}`;
  };
  return {
    Link,
    useRouter: () => nav().useRouter(),
    usePathname: () => nav().usePathname(),
    redirect: (href: unknown) => nav().redirect?.(hrefToString(href)),
    permanentRedirect: (href: unknown) => nav().permanentRedirect?.(hrefToString(href)),
    getPathname,
  };
});
