const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

/** @type {import('jest').Config} */
const config = {
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/e2e/',
    '<rootDir>/.claude/',
  ],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(jpg|jpeg|png|gif|webp|svg|wav|mp3)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(viem|wagmi|@wagmi|@rainbow-me|@tanstack|abitype|ox)/)',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'contexts/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'utils/**/*.{ts,tsx}',
    'services/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!app/**/page.tsx',
    '!app/**/layout.tsx',
    '!app/manifest.ts',
    '!app/api/**',
    '!app/(app)/HomePageLoader.tsx',
    '!app/(app)/statistics/StatisticsLoader.tsx',
    '!components/landing/**',
    '!contexts/index.ts',
  ],
  coverageThreshold: {
    global: { branches: 71, functions: 79, lines: 87, statements: 86 },
  },
};

module.exports = createJestConfig(config);
