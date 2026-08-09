import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({ dir: './' });

const config: Config = {
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
    '<rootDir>/.claude/',
  ],
  modulePathIgnorePatterns: ['<rootDir>/.claude/'],
  watchPathIgnorePatterns: ['<rootDir>/.claude/'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.ts',
    '\\.(jpg|jpeg|png|gif|webp|svg|wav|mp3)$': '<rootDir>/__mocks__/fileMock.ts',
    // The SWC transform rewrites `@/` in import statements from tsconfig
    // paths, but NOT inside jest.mock('...') specifiers (e.g. the global
    // @/i18n/navigation mock in jest.setup.ts). This mapper covers those.
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(viem|wagmi|@wagmi|@rainbow-me|@tanstack|abitype|ox)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'contexts/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageThreshold: {
    // Kept a couple of points under the measured numbers (branches 76.4,
    // functions 80.1, lines 85.5, statements 84.0) so an unrelated change
    // cannot fail CI on rounding alone.
    global: { branches: 75, functions: 78, lines: 84, statements: 82 },
  },
};

export default createJestConfig(config);
