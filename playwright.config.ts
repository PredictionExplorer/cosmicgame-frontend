import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { defineConfig, devices } from '@playwright/test';

if (process.env.FORCE_COLOR && process.env.NO_COLOR) {
  delete process.env.NO_COLOR;
}

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000);

/**
 * Harness tier (e2e/harness): full-stack specs against the local game
 * harness (scripts/harness) — real contracts on a local chain, the real
 * indexer/API, and a testing-mode frontend. Included by default; disable
 * with HARNESS_E2E=0 (the CI job matrix runs it separately from the
 * mocked-API projects, which need no Docker/Go/sibling repos).
 */
const harnessEnabled = process.env.HARNESS_E2E !== '0';

/** Web port of a running harness stack (state file), or the e2e default. */
function harnessWebPort(): number {
  try {
    const state = JSON.parse(readFileSync(join(__dirname, '.harness', 'state.json'), 'utf8')) as {
      webPort?: number;
    };
    if (state.webPort) return state.webPort;
  } catch {
    // No stack running yet — global setup will boot one on the default port.
  }
  return Number(process.env.HARNESS_WEB_PORT ?? 3100);
}

/**
 * `--project=harness` runs skip the production build/server of the mocked
 * projects entirely (the harness tier brings its own dev server).
 */
const cliProjects = process.argv
  .flatMap((arg, index, args) => {
    if (arg.startsWith('--project=')) return [arg.slice('--project='.length)];
    if (arg === '--project') return [args[index + 1] ?? ''];
    return [];
  })
  .filter(Boolean);
const harnessOnly =
  cliProjects.length > 0 && cliProjects.every((name) => name.startsWith('harness'));

/** Keep harness specs out of the mocked-API projects. */
const NON_HARNESS_IGNORES = ['**/harness/**'];

export default defineConfig({
  testDir: './e2e',
  snapshotPathTemplate: '{testDir}/__screenshots__/{testFilePath}/{arg}{ext}',
  fullyParallel: true,
  workers: process.env.CI ? 1 : 2,
  retries: 1,
  timeout: 60_000,
  expect: {
    timeout: 15_000,
  },
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'Desktop Chrome',
      testIgnore: ['**/*.mobile.spec.ts', '**/mobile-gesture.spec.ts', ...NON_HARNESS_IGNORES],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      testIgnore: ['**/*.desktop.spec.ts', ...NON_HARNESS_IGNORES],
      use: { ...devices['Pixel 5'] },
    },
    {
      // Mobile Safari is the single biggest source of iOS-only layout bugs
      // (viewport units, sticky headers, flex min-width defaults), none of
      // which Chromium reproduces — so it runs the layout audits.
      //
      // Scoped to those deliberately. The interaction suites are built around
      // hover tooltips and Tab-to-link focus, neither of which behaves the
      // same under WebKit, so running them here reports on the engine rather
      // than on the app.
      name: 'Mobile Safari',
      testMatch: ['**/mobile-overflow.mobile.spec.ts', '**/mobile-tap-targets.mobile.spec.ts'],
      use: { ...devices['iPhone 13'] },
    },
    ...(harnessEnabled
      ? [
          {
            name: 'harness-setup',
            testMatch: /harness\/global\.setup\.ts/,
            teardown: 'harness-teardown',
          },
          {
            name: 'harness-teardown',
            testMatch: /harness\/global\.teardown\.ts/,
          },
          {
            // Serial by construction: all harness specs live in one file, so
            // one worker owns the (shared, mutable) game world.
            name: 'harness',
            testMatch: /harness\/.*\.spec\.ts/,
            dependencies: ['harness-setup'],
            use: {
              ...devices['Desktop Chrome'],
              baseURL: `http://localhost:${harnessWebPort()}`,
            },
          },
        ]
      : []),
  ],
  // The production build/server backs the mocked-API projects; harness-only
  // runs skip it (the harness supplies its own testing-mode dev server).
  ...(harnessOnly
    ? {}
    : {
        webServer: {
          command: `NEXT_PUBLIC_PLAYWRIGHT_UX_SCENARIOS=1 PLAYWRIGHT=1 npm run build && PLAYWRIGHT=1 npm run start -- -p ${port}`,
          port,
          // CI always builds from scratch. Locally, `PLAYWRIGHT_REUSE_SERVER=1`
          // attaches to an already-running production server so an audit sweep
          // doesn't pay for a full rebuild on every iteration.
          reuseExistingServer: !process.env.CI && !!process.env.PLAYWRIGHT_REUSE_SERVER,
          timeout: 300_000,
        },
      }),
});
