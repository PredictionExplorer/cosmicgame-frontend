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
}));

// next-intl ships untranspiled ESM (like wagmi/rainbowkit above), so its
// client hooks are mocked globally: components under test render with the
// default locale and message KEYS as text (assert on keys, not copy).
jest.mock('next-intl', () => {
  const useTranslations = (namespace?: string) => {
    const prefix = namespace ? `${namespace}.` : '';
    const t = (key: string) => `${prefix}${key}`;
    t.rich = (key: string) => `${prefix}${key}`;
    t.markup = (key: string) => `${prefix}${key}`;
    t.raw = (key: string) => `${prefix}${key}`;
    t.has = () => true;
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

jest.mock('next-intl/server', () => ({
  setRequestLocale: jest.fn(),
  getLocale: async () => 'en',
  getMessages: async () => ({}),
  getTranslations: async (options?: string | { namespace?: string }) => {
    const namespace = typeof options === 'string' ? options : options?.namespace;
    const prefix = namespace ? `${namespace}.` : '';
    return (key: string) => `${prefix}${key}`;
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
    const { href, children, locale: _locale, ...rest } = props;
    return React.createElement('a', { href: hrefToString(href), ref, ...rest }, children);
  });
  return {
    Link,
    useRouter: () => nav().useRouter(),
    usePathname: () => nav().usePathname(),
    redirect: (href: unknown) => nav().redirect?.(hrefToString(href)),
    permanentRedirect: (href: unknown) => nav().permanentRedirect?.(hrefToString(href)),
    getPathname: (args: { href: unknown }) => hrefToString(args?.href),
  };
});
