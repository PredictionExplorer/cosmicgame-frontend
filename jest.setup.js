require('@testing-library/jest-dom');

const { toHaveNoViolations } = require('jest-axe');
expect.extend(toHaveNoViolations);

// Provide IntersectionObserver for jsdom (used by Next.js Link prefetching)
class MockIntersectionObserver {
  constructor(cb) {
    this._cb = cb;
  }
  observe() {
    this._cb([{ isIntersecting: false, target: document.createElement('div') }], this);
  }
  unobserve() {}
  disconnect() {}
}
global.IntersectionObserver = MockIntersectionObserver;

// Fail tests on unexpected console.error / console.warn.
// Known third-party warnings that we cannot fix are allowlisted and silently skipped.
// Any NEW warning that doesn't match the allowlist throws, failing the test immediately.
const ALLOWED_PATTERNS = [
  'not wrapped in act(',
  'cannot be a child of',
  'Preload assets timed out',
  'load preload assets',
  'Missing `Description` or `aria-describedby',
];

function isAllowed(msg) {
  return ALLOWED_PATTERNS.some((p) => msg.includes(p));
}

const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (isAllowed(msg)) return;
  originalError.apply(console, args);
  throw new Error(`Unexpected console.error in test: ${msg.slice(0, 200)}`);
};

console.warn = (...args) => {
  const msg = typeof args[0] === 'string' ? args[0] : '';
  if (isAllowed(msg)) return;
  originalWarn.apply(console, args);
  throw new Error(`Unexpected console.warn in test: ${msg.slice(0, 200)}`);
};

// Mock next/navigation for App Router
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
