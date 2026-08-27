/**
 * Harness configuration: sibling repo locations, ports, and run options.
 *
 * Everything is resolvable from environment variables so CI and unusual local
 * setups can relocate pieces, but the defaults match the conventional layout:
 * the contracts repo and the indexer/backend repo sit next to this repo.
 */

import { existsSync } from 'node:fs';
import { resolve, join } from 'node:path';

export interface HarnessConfig {
  /** Absolute path of this frontend repo (workspace root). */
  frontendDir: string;
  /** Absolute path of the Cosmic-Signature Hardhat contracts repo. */
  contractsDir: string;
  /** Absolute path of the RWCG backend (indexer + API) repo. */
  backendDir: string;
  /** Runtime scratch dir (logs, pids, generated configs). Gitignored. */
  runDir: string;

  /** Local chain JSON-RPC port (Hardhat node). */
  chainPort: number;
  /** Host port mapped to the harness Postgres container. */
  dbPort: number;
  /** Backend API server port. */
  apiPort: number;
  /** Next.js dev server port for testing mode. */
  webPort: number;
  /** Director control API port. */
  controlPort: number;

  /** Docker Compose project name (isolates containers/volumes). */
  composeProject: string;

  /** Deterministic seed for persona activity. */
  rngSeed: number;
  /** CI mode: fail fast, skip interactive niceties, minimal seeding. */
  ci: boolean;
}

export const CHAIN_ID = 31337;

function intFromEnv(env: NodeJS.ProcessEnv, name: string, fallback: number): number {
  const raw = env[name]?.trim();
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer, got "${raw}"`);
  }
  return value;
}

/** Resolve the harness configuration from the process environment. */
export function resolveHarnessConfig(
  env: NodeJS.ProcessEnv = process.env,
  cwd: string = process.cwd(),
): HarnessConfig {
  const frontendDir = resolve(cwd);
  const contractsDir = resolve(
    env.COSMIC_CONTRACTS_DIR?.trim() || join(frontendDir, '..', 'Cosmic-Signature'),
  );
  const backendDir = resolve(
    env.RWCG_BACKEND_DIR?.trim() || join(frontendDir, '..', 'augur-explorer'),
  );

  return {
    frontendDir,
    contractsDir,
    backendDir,
    runDir: join(frontendDir, '.harness'),
    chainPort: intFromEnv(env, 'HARNESS_CHAIN_PORT', 8545),
    dbPort: intFromEnv(env, 'HARNESS_DB_PORT', 55432),
    apiPort: intFromEnv(env, 'HARNESS_API_PORT', 8099),
    webPort: intFromEnv(env, 'HARNESS_WEB_PORT', 3000),
    controlPort: intFromEnv(env, 'HARNESS_CONTROL_PORT', 8686),
    composeProject: env.HARNESS_COMPOSE_PROJECT?.trim() || 'cosmic-harness',
    rngSeed: intFromEnv(env, 'HARNESS_RNG_SEED', 20260827),
    ci: env.HARNESS_CI === '1' || env.CI === 'true' || env.CI === '1',
  };
}

/** Derived locations inside the runtime scratch dir. */
export function harnessPaths(config: HarnessConfig) {
  return {
    logsDir: join(config.runDir, 'logs'),
    stateFile: join(config.runDir, 'state.json'),
    deployConfigFile: join(config.runDir, 'deploy-config.json'),
    deployReportFile: join(config.runDir, 'deploy-report.json'),
    upgradeConfigFile: join(config.runDir, 'upgrade-config.json'),
    upgradeReportFile: join(config.runDir, 'upgrade-report.json'),
    hardhatConfigFile: join(config.runDir, 'hardhat.config.cjs'),
    composeOverrideFile: join(config.runDir, 'compose.override.yaml'),
    nextDistDir: join(config.runDir, 'next'),
  } as const;
}

export interface PreflightIssue {
  problem: string;
  resolution: string;
}

/**
 * Static preflight: verifies the sibling repos look right before any process
 * is started. Docker/Go checks are separate because they shell out.
 */
export function preflightRepoIssues(config: HarnessConfig): PreflightIssue[] {
  const issues: PreflightIssue[] = [];
  if (!existsSync(join(config.contractsDir, 'hardhat.config.js'))) {
    issues.push({
      problem: `Contracts repo not found at ${config.contractsDir} (missing hardhat.config.js).`,
      resolution:
        'Clone PredictionExplorer/Cosmic-Signature next to this repo or set COSMIC_CONTRACTS_DIR.',
    });
  }
  if (!existsSync(join(config.backendDir, 'compose.yaml'))) {
    issues.push({
      problem: `Backend repo not found at ${config.backendDir} (missing compose.yaml).`,
      resolution: 'Clone the RWCG backend repo next to this repo or set RWCG_BACKEND_DIR.',
    });
  }
  return issues;
}
