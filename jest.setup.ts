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
process.env.NEXT_PUBLIC_NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'sepolia';
process.env.NEXT_PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://test-api.example/api/cosmicgame/';
process.env.NEXT_PUBLIC_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'http://127.0.0.1:8545';

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
