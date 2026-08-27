/**
 * Child-process supervision for the harness.
 *
 * Every managed process writes to its own log file under .harness/logs and is
 * spawned as a process-group leader, so it survives a detached orchestrator
 * exit and can be terminated reliably (group kill) by `harness down` later.
 * Foreground mode mirrors the log files to the console by tailing them.
 */

import { spawn } from 'node:child_process';
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  statSync,
  watchFile,
  unwatchFile,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

import { createLogger } from './log';
import type { HarnessConfig } from './config';
import { harnessPaths } from './config';

export interface ManagedProcess {
  name: string;
  pid: number;
  logFile: string;
}

export interface HarnessState {
  startedAtIso: string;
  chainPort: number;
  dbPort: number;
  apiPort: number;
  webPort: number;
  controlPort: number;
  composeProject: string;
  processes: ManagedProcess[];
  /** Deployed contract addresses, once known. */
  addresses?: Record<string, string>;
}

/** Extra environment for a child process (merged over the parent's env). */
export type ChildEnv = Record<string, string | undefined>;

export interface SpawnOptions {
  name: string;
  command: string;
  args: string[];
  cwd: string;
  env?: ChildEnv;
  logFile: string;
}

/** Spawn a supervised process-group leader whose output goes to a log file. */
export function spawnSupervised(options: SpawnOptions): ManagedProcess {
  mkdirSync(dirname(options.logFile), { recursive: true });
  const fd = openSync(options.logFile, 'a');
  const child = spawn(options.command, options.args, {
    cwd: options.cwd,
    env: { ...process.env, ...options.env },
    stdio: ['ignore', fd, fd],
    detached: true,
  });
  closeSync(fd);
  child.unref();
  if (child.pid === undefined) {
    throw new Error(`Failed to spawn ${options.name} (${options.command})`);
  }
  return { name: options.name, pid: child.pid, logFile: options.logFile };
}

export function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

const sleep = (ms: number) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

/** SIGTERM the whole process group, escalating to SIGKILL after a grace period. */
export async function stopProcessGroup(pid: number, graceMs = 8_000): Promise<void> {
  const signal = (sig: NodeJS.Signals) => {
    try {
      // Negative pid: the entire process group (the child was a group leader).
      process.kill(-pid, sig);
    } catch {
      try {
        process.kill(pid, sig);
      } catch {
        // Already gone.
      }
    }
  };
  if (!isProcessAlive(pid)) return;
  signal('SIGTERM');
  const deadline = Date.now() + graceMs;
  while (Date.now() < deadline) {
    if (!isProcessAlive(pid)) return;
    await sleep(200);
  }
  signal('SIGKILL');
}

/** Mirror a growing log file to the console with a prefix. Returns a stop fn. */
export function mirrorLogFile(name: string, logFile: string): () => void {
  const logger = createLogger(name);
  let offset = existsSync(logFile) ? statSync(logFile).size : 0;
  const drain = () => {
    if (!existsSync(logFile)) return;
    const size = statSync(logFile).size;
    if (size <= offset) return;
    const fd = openSync(logFile, 'r');
    try {
      const buffer = Buffer.alloc(size - offset);
      const bytes = readSync(fd, buffer, 0, buffer.length, offset);
      logger.line(buffer.subarray(0, bytes).toString('utf8'));
      offset += bytes;
    } finally {
      closeSync(fd);
    }
  };
  watchFile(logFile, { interval: 300 }, drain);
  return () => unwatchFile(logFile, drain);
}

export interface RunBlockingOptions {
  name: string;
  command: string;
  args: string[];
  cwd: string;
  env?: ChildEnv;
  logFile: string;
  /** Mirror output to the console while running (default true). */
  mirror?: boolean;
}

/** Run a one-shot step to completion, logging output; throws on non-zero exit. */
export async function runBlocking(options: RunBlockingOptions): Promise<void> {
  mkdirSync(dirname(options.logFile), { recursive: true });
  const fd = openSync(options.logFile, 'a');
  const stopMirror =
    options.mirror === false ? () => {} : mirrorLogFile(options.name, options.logFile);
  try {
    await new Promise<void>((resolveRun, rejectRun) => {
      const child = spawn(options.command, options.args, {
        cwd: options.cwd,
        env: { ...process.env, ...options.env },
        stdio: ['ignore', fd, fd],
      });
      child.on('error', rejectRun);
      child.on('exit', (code, sig) => {
        if (code === 0) resolveRun();
        else
          rejectRun(
            new Error(
              `${options.name} exited with ${code ?? `signal ${sig}`} — see ${options.logFile}`,
            ),
          );
      });
    });
  } finally {
    // Give the tail a beat to drain the final lines before detaching.
    await new Promise((resolveSleep) => setTimeout(resolveSleep, 400));
    stopMirror();
    closeSync(fd);
  }
}

export function readState(config: HarnessConfig): HarnessState | null {
  const { stateFile } = harnessPaths(config);
  if (!existsSync(stateFile)) return null;
  try {
    return JSON.parse(readFileSync(stateFile, 'utf8')) as HarnessState;
  } catch {
    return null;
  }
}

export function writeState(config: HarnessConfig, state: HarnessState): void {
  const { stateFile } = harnessPaths(config);
  mkdirSync(dirname(stateFile), { recursive: true });
  writeFileSync(stateFile, JSON.stringify(state, null, 2));
}

export function emptyState(config: HarnessConfig): HarnessState {
  return {
    startedAtIso: new Date().toISOString(),
    chainPort: config.chainPort,
    dbPort: config.dbPort,
    apiPort: config.apiPort,
    webPort: config.webPort,
    controlPort: config.controlPort,
    composeProject: config.composeProject,
    processes: [],
  };
}

export function logFileFor(config: HarnessConfig, name: string): string {
  return join(harnessPaths(config).logsDir, `${name}.log`);
}
