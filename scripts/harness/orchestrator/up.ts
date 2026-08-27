/**
 * Full-stack bring-up/tear-down. `up` boots, in order: Hardhat node (fresh,
 * optionally backdated) → contract deployment → Postgres + migrations +
 * address registration → indexer + API server → director (seeding, pacing,
 * scenario) → Next.js dev server. Every `up` is a fresh universe: the chain
 * restarts from genesis and the database is wiped to match.
 */

import { mkdirSync, rmSync } from 'node:fs';

import type { HarnessConfig } from '../config';
import { harnessPaths, preflightRepoIssues } from '../config';
import { createLogger, fail, step } from '../log';
import {
  emptyState,
  isProcessAlive,
  logFileFor,
  mirrorLogFile,
  readState,
  spawnSupervised,
  stopProcessGroup,
  writeState,
  type HarnessState,
  type ManagedProcess,
} from '../processes';
import { httpJson, waitFor, WaitAbortedError } from '../rpc';
import { seedChainStartIso } from '../director/seedPlan';
import type { PaceName } from '../director/pace';

import { chainRpcUrl, startChainNode } from './chain';
import { deployContracts, readDeployReport } from './deploy';
import {
  ensureDockerUp,
  primeIndexerWatermark,
  registerContractAddresses,
  startDatabase,
  stopDatabase,
} from './database';
import { apiBaseUrl, ensureBackendBinaries, startApiServer, startIndexer } from './backend';
import { startFrontend, testingModeEnv } from './frontend';

const log = createLogger('harness');

export interface UpOptions {
  detach: boolean;
  seedCycles: number;
  scenario: string;
  pace: PaceName;
  withFrontend: boolean;
  rebuildBackend: boolean;
}

/** Order matters: consumers stop before producers on the way down. */
const STOP_ORDER = ['web', 'director', 'api', 'indexer', 'chain'] as const;

export async function upCommand(config: HarnessConfig, options: UpOptions): Promise<void> {
  const issues = preflightRepoIssues(config);
  if (issues.length > 0) {
    for (const issue of issues.slice(1)) log.error(`${issue.problem} ${issue.resolution}`);
    const first = issues[0];
    if (first) fail(first.problem, first.resolution);
  }

  const existing = readState(config);
  if (existing?.processes.some((proc) => isProcessAlive(proc.pid))) {
    fail(
      'A harness stack appears to be running already.',
      'Run `npm run harness -- down` first (or `npm run harness -- status` to inspect it).',
    );
  }

  step('Preparing a fresh harness universe');
  await ensureDockerUp();
  await stopDatabase(config, true);
  rmSync(harnessPaths(config).nextDistDir, { recursive: true, force: true });
  mkdirSync(harnessPaths(config).logsDir, { recursive: true });

  const state: HarnessState = emptyState(config);
  const track = (proc: ManagedProcess) => {
    state.processes.push(proc);
    writeState(config, state);
  };

  // The genesis cycle is always seeded (the V1→V2 proxy upgrade needs it).
  const seedCycles = Math.max(1, options.seedCycles);

  step(`Starting local chain (Hardhat node on :${config.chainPort})`);
  const chainStartIso = seedChainStartIso(seedCycles);
  log.info(`Chain clock starts at ${chainStartIso} (backdated history seeding)`);
  track(await startChainNode(config, { startIso: chainStartIso }));

  step('Deploying the protocol suite (contracts repo deployment task)');
  const addresses = await deployContracts(config);
  state.addresses = { ...addresses };
  writeState(config, state);
  log.info(`Game proxy deployed at ${addresses.cosmicGame}`);

  step('Starting Postgres and applying backend migrations');
  await startDatabase(config);
  await registerContractAddresses(config, addresses);
  await primeIndexerWatermark(config);
  await ensureBackendBinaries(config, options.rebuildBackend);

  step(`Starting the director (seeding ${seedCycles} cycles, then "${options.scenario}")`);
  rmSync(logFileFor(config, 'director'), { force: true });
  const directorMirror = options.detach
    ? null
    : mirrorLogFile('director', logFileFor(config, 'director'));
  const director = spawnSupervised({
    name: 'director',
    command: 'npx',
    args: [
      'tsx',
      'scripts/harness/cli.ts',
      'director',
      '--scenario',
      options.scenario,
      '--pace',
      options.pace,
      '--seed-cycles',
      String(seedCycles),
    ],
    cwd: config.frontendDir,
    env: harnessChildEnv(config),
    logFile: logFileFor(config, 'director'),
  });
  track(director);
  await waitFor(
    'director to finish bootstrapping (seeding can take a few minutes)',
    async () => {
      if (!isProcessAlive(director.pid)) {
        throw new WaitAbortedError(`The director exited early — see ${director.logFile}`);
      }
      const status = await httpJson<{ ready?: boolean }>(
        `http://127.0.0.1:${config.controlPort}/status`,
      );
      return status.ready === true;
    },
    { timeoutMs: 20 * 60_000, intervalMs: 2_000 },
  );
  directorMirror?.();

  // Seeding upgraded the game proxy to V2; refresh the registered
  // implementation address, then index and serve. The indexer boots only
  // now — with the V2 parameters readable — and backfills from the primed
  // watermark, so the whole seeded history lands in the database.
  const finalAddresses = readDeployReport(config);
  state.addresses = { ...finalAddresses };
  writeState(config, state);
  await registerContractAddresses(config, finalAddresses);

  step('Starting the indexer and API server');
  track(startIndexer(config));
  track(await startApiServer(config, finalAddresses.cosmicGame));

  if (options.withFrontend) {
    step(`Starting Next.js in testing mode on :${config.webPort}`);
    track(await startFrontend(config));
  }

  printSummary(config, options);

  if (!options.detach) {
    const stopMirrors = state.processes.map((proc) => mirrorLogFile(proc.name, proc.logFile));
    log.info('Streaming logs. Press Ctrl-C to stop the whole stack.');
    await new Promise<void>((resolveWait) => {
      process.once('SIGINT', () => resolveWait());
      process.once('SIGTERM', () => resolveWait());
    });
    for (const stop of stopMirrors) stop();
    await downCommand(config, { wipe: false });
  }
}

/** Pin the child director/frontend to this exact configuration. */
function harnessChildEnv(config: HarnessConfig): Record<string, string> {
  return {
    COSMIC_CONTRACTS_DIR: config.contractsDir,
    RWCG_BACKEND_DIR: config.backendDir,
    HARNESS_CHAIN_PORT: String(config.chainPort),
    HARNESS_DB_PORT: String(config.dbPort),
    HARNESS_API_PORT: String(config.apiPort),
    HARNESS_WEB_PORT: String(config.webPort),
    HARNESS_CONTROL_PORT: String(config.controlPort),
    HARNESS_COMPOSE_PROJECT: config.composeProject,
    HARNESS_RNG_SEED: String(config.rngSeed),
  };
}

function printSummary(config: HarnessConfig, options: UpOptions): void {
  step('Testing mode is up');
  const lines = [
    options.withFrontend ? `App:         http://localhost:${config.webPort}` : undefined,
    `API:         ${apiBaseUrl(config)}/api/cosmicgame`,
    `Chain RPC:   ${chainRpcUrl(config)} (chain id 31337)`,
    `Control API: http://127.0.0.1:${config.controlPort}/status`,
    `Scenario:    ${options.scenario} (pace: ${options.pace})`,
    `Logs:        ${harnessPaths(config).logsDir}`,
  ];
  for (const line of lines) {
    if (line) log.info(line);
  }
}

export interface DownOptions {
  wipe: boolean;
}

export async function downCommand(config: HarnessConfig, options: DownOptions): Promise<void> {
  const state = readState(config);
  if (state) {
    const byName = new Map(state.processes.map((proc) => [proc.name, proc]));
    for (const name of STOP_ORDER) {
      const proc = byName.get(name);
      if (!proc) continue;
      if (isProcessAlive(proc.pid)) {
        log.info(`Stopping ${proc.name} (pid ${proc.pid})`);
        await stopProcessGroup(proc.pid);
      }
    }
  }
  await stopDatabase(config, options.wipe);
  rmSync(harnessPaths(config).stateFile, { force: true });
  log.info(options.wipe ? 'Harness stopped; database volume wiped.' : 'Harness stopped.');
}

export async function statusCommand(config: HarnessConfig): Promise<void> {
  const state = readState(config);
  if (!state) {
    log.info('No harness state found — the stack is not running.');
    return;
  }
  log.info(`Started at ${state.startedAtIso}`);
  for (const proc of state.processes) {
    log.info(
      `${proc.name.padEnd(9)} pid ${String(proc.pid).padEnd(7)} ${isProcessAlive(proc.pid) ? 'running' : 'stopped'}`,
    );
  }
  try {
    const status = await httpJson<Record<string, unknown>>(
      `http://127.0.0.1:${state.controlPort}/status`,
    );
    log.info(`Director: ${JSON.stringify(status)}`);
  } catch {
    log.warn('Director control API is not answering.');
  }
}

export { testingModeEnv };
