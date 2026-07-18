import { defineConfig, devices } from '@playwright/test';

if (process.env.FORCE_COLOR && process.env.NO_COLOR) {
  delete process.env.NO_COLOR;
}

const port = Number(process.env.PLAYWRIGHT_PORT ?? 3000);

export default defineConfig({
  testDir: './e2e',
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
      testIgnore: ['**/*.mobile.spec.ts', '**/mobile-gesture.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      testIgnore: ['**/*.desktop.spec.ts'],
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: `PLAYWRIGHT=1 npm run build && PLAYWRIGHT=1 npm run start -- -p ${port}`,
    port,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
