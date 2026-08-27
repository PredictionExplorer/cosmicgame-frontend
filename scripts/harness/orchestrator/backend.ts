/**
 * Indexer (cg-etl) and API server lifecycle. Both are Go binaries from the
 * backend repo, run on the host and pointed at the harness chain + database.
 */

import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';

import type { HarnessConfig } from '../config';
import { httpJson, waitFor } from '../rpc';
import { logFileFor, runBlocking, spawnSupervised, type ManagedProcess } from '../processes';

import { chainRpcUrl } from './chain';

export function apiBaseUrl(config: HarnessConfig): string {
  return `http://127.0.0.1:${config.apiPort}`;
}

/** The dashboard endpoint the frontend boots from. */
export function dashboardUrl(config: HarnessConfig): string {
  return `${apiBaseUrl(config)}/api/cosmicgame/statistics/dashboard`;
}

function backendEnv(config: HarnessConfig): Record<string, string> {
  return {
    RPC_URL: chainRpcUrl(config),
    PGSQL_USERNAME: 'rwcg',
    PGSQL_PASSWORD: 'rwcg',
    PGSQL_DATABASE: 'rwcg',
    PGSQL_HOST: `localhost:${config.dbPort}`,
    LOG_FORMAT: 'text',
    LOG_LEVEL: 'info',
  };
}

/** Build cg-etl and apiserver if either binary is missing (or when forced). */
export async function ensureBackendBinaries(config: HarnessConfig, rebuild = false): Promise<void> {
  const binaries = ['cg-etl', 'apiserver'].map((name) => join(config.backendDir, 'bin', name));
  if (!rebuild && binaries.every((path) => existsSync(path))) return;
  await runBlocking({
    name: 'go-build',
    command: 'make',
    args: ['build'],
    cwd: config.backendDir,
    logFile: logFileFor(config, 'go-build'),
  });
  const missing = binaries.filter((path) => !existsSync(path));
  if (missing.length > 0) {
    throw new Error(`Backend build finished but binaries are missing: ${missing.join(', ')}`);
  }
}

/** Start the chain indexer. Requires the address book in cg_contracts. */
export function startIndexer(config: HarnessConfig): ManagedProcess {
  rmSync(logFileFor(config, 'indexer'), { force: true });
  return spawnSupervised({
    name: 'indexer',
    command: join(config.backendDir, 'bin', 'cg-etl'),
    args: [],
    cwd: config.backendDir,
    env: backendEnv(config),
    logFile: logFileFor(config, 'indexer'),
  });
}

/** Start the JSON API server and wait until it is ready and serving the deployment. */
export async function startApiServer(
  config: HarnessConfig,
  expectedGameAddress: string,
): Promise<ManagedProcess> {
  rmSync(logFileFor(config, 'api'), { force: true });
  const managed = spawnSupervised({
    name: 'api',
    command: join(config.backendDir, 'bin', 'apiserver'),
    args: [],
    cwd: config.backendDir,
    env: {
      ...backendEnv(config),
      HTTP_PORT: String(config.apiPort),
      ADMIN_API_KEY: 'cosmic-harness-local',
    },
    logFile: logFileFor(config, 'api'),
  });

  await waitFor(
    `API server on :${config.apiPort}`,
    async () => {
      await httpJson(`${apiBaseUrl(config)}/readyz`);
      return true;
    },
    { timeoutMs: 60_000 },
  );

  await waitFor(
    'dashboard to serve the deployed address book',
    async () => {
      const dashboard = await httpJson<{
        ContractAddrs?: { CosmicGameAddr?: string };
      }>(dashboardUrl(config));
      return (
        dashboard.ContractAddrs?.CosmicGameAddr?.toLowerCase() === expectedGameAddress.toLowerCase()
      );
    },
    { timeoutMs: 60_000 },
  );
  return managed;
}
