/**
 * Next.js dev server in testing mode: injects the local-network environment
 * (process env takes precedence over .env files) and keeps build artifacts in
 * a harness-specific dist dir so a regular `npm run dev` can coexist.
 */

import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';

import type { HarnessConfig } from '../config';
import { harnessPaths } from '../config';
import { waitFor } from '../rpc';
import { logFileFor, spawnSupervised, type ManagedProcess } from '../processes';

import { chainRpcUrl } from './chain';
import { apiBaseUrl } from './backend';

/** Minimal .env parser — enough to recover existing values like the WalletConnect id. */
export function readEnvFileValue(filePath: string, key: string): string | undefined {
  if (!existsSync(filePath)) return undefined;
  for (const rawLine of readFileSync(filePath, 'utf8').split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) continue;
    if (line.slice(0, eq).trim() !== key) continue;
    return line
      .slice(eq + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '');
  }
  return undefined;
}

function walletConnectProjectId(config: HarnessConfig): string {
  for (const file of ['.env.local', '.env']) {
    const value = readEnvFileValue(
      join(config.frontendDir, file),
      'NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID',
    );
    if (value) return value;
  }
  // Injected + burner connectors never open a WalletConnect session, so a
  // placeholder keeps the app booting on machines without a real project id.
  return 'cosmic-harness-local';
}

/** Environment for the testing-mode frontend (dev server or e2e build). */
export function testingModeEnv(config: HarnessConfig): Record<string, string> {
  return {
    NEXT_PUBLIC_NETWORK: 'local',
    NEXT_PUBLIC_RPC_URL: chainRpcUrl(config),
    NEXT_PUBLIC_API_URL: `${apiBaseUrl(config)}/api/cosmicgame`,
    NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: walletConnectProjectId(config),
    NEXT_PUBLIC_HARNESS: '1',
    NEXT_PUBLIC_HARNESS_CONTROL_URL: `http://127.0.0.1:${config.controlPort}`,
    NEXT_DIST_DIR: relative(config.frontendDir, harnessPaths(config).nextDistDir),
    // Neutralize overrides that would fight the harness data planes.
    NEXT_PUBLIC_UX_SCENARIO: '',
    NEXT_PUBLIC_API_URLS: '',
    NEXT_PUBLIC_RPC_URLS: '',
    NEXT_PUBLIC_SENTRY_DSN: '',
    COSMICGAME_API_UPSTREAM: '',
  };
}

/** Start `next dev` in testing mode and wait until it serves. */
export async function startFrontend(config: HarnessConfig): Promise<ManagedProcess> {
  rmSync(logFileFor(config, 'web'), { force: true });
  const managed = spawnSupervised({
    name: 'web',
    command: 'npx',
    args: ['next', 'dev', '-p', String(config.webPort)],
    cwd: config.frontendDir,
    env: testingModeEnv(config),
    logFile: logFileFor(config, 'web'),
  });
  await waitFor(
    `Next.js dev server on :${config.webPort}`,
    async () => {
      const response = await fetch(`http://127.0.0.1:${config.webPort}/`, { redirect: 'manual' });
      return response.status < 500;
    },
    { timeoutMs: 120_000 },
  );
  return managed;
}
