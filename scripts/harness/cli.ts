#!/usr/bin/env tsx
/**
 * Cosmic Signature local test harness CLI.
 *
 *   npm run harness -- <command> [flags]
 *   npm run dev:testing            # shorthand for `harness up`
 *
 * Commands:
 *   up          Boot the whole stack (chain, deploy, db, indexer, api,
 *               director, Next.js). Fresh universe every time.
 *               --detach            return once healthy instead of streaming logs
 *               --seed-cycles <n>   backdated historical cycles (default 8, ci 2)
 *               --scenario <name>   initial scenario (default ambient)
 *               --pace <name>       realtime | demo | fast (default demo)
 *               --no-frontend       skip the Next.js dev server
 *               --rebuild-backend   force `make build` of the Go binaries
 *   down        Stop everything (keeps the database volume). --wipe removes it.
 *   reset       down --wipe, then up (flags forwarded to up).
 *   status      Show process + director status.
 *   scenario    Switch the running director's scenario: `scenario final-ten`.
 *   pace        Select realtime | demo | fast for the next configured cycle.
 *   gesture     One-shot gesture: --as <persona> --kind eth|cst|rwlk -m <msg>.
 *   finalize    Finalize the current cycle: [--as <persona>].
 *   pause       Pause automatic scenario activity.
 *   resume      Resume automatic scenario activity.
 *   director    (internal) run the director in-process; used by `up`.
 *
 * Scenario names: ambient, opening-soon, waiting-first-gesture, live,
 * approach, final-hour, final-ten, final-minute, ready-to-finalize,
 * exclusivity-expired, gesture-battle, attachments-showcase, anchoring-heavy,
 * quiet. See docs/harness.md.
 */

import { parseArgs } from 'node:util';

import { resolveHarnessConfig } from './config';
import { fail } from './log';
import { readState } from './processes';
import { isPaceName, type PaceName } from './director/pace';

async function controlRequest(path: string, body?: Record<string, unknown>): Promise<unknown> {
  const config = resolveHarnessConfig();
  const state = readState(config);
  const port = state?.controlPort ?? config.controlPort;
  const url = `http://127.0.0.1:${port}${path}`;
  const response = await fetch(url, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? null : JSON.stringify(body),
    signal: AbortSignal.timeout(60_000),
  }).catch(() => {
    throw new Error(
      `Director control API is not reachable at ${url}. Is the harness running? (npm run harness -- status)`,
    );
  });
  const payload = (await response.json()) as Record<string, unknown>;
  if (!response.ok) throw new Error(String(payload.error ?? `HTTP ${response.status}`));
  return payload;
}

function parsePace(raw: string | undefined, fallback: PaceName): PaceName {
  if (raw === undefined) return fallback;
  if (!isPaceName(raw)) fail(`Unknown pace "${raw}".`, 'Use one of: realtime, demo, fast.');
  return raw;
}

function parseCount(raw: string | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < 0) fail(`Invalid count "${raw}".`);
  return value;
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);
  const config = resolveHarnessConfig();

  switch (command) {
    case 'up':
    case 'reset': {
      const { values } = parseArgs({
        args: rest,
        options: {
          detach: { type: 'boolean', default: false },
          'seed-cycles': { type: 'string' },
          scenario: { type: 'string', default: 'ambient' },
          pace: { type: 'string' },
          'no-frontend': { type: 'boolean', default: false },
          'rebuild-backend': { type: 'boolean', default: false },
          wipe: { type: 'boolean', default: false },
        },
      });
      const { upCommand, downCommand } = await import('./orchestrator/up');
      if (command === 'reset') await downCommand(config, { wipe: true });
      await upCommand(config, {
        detach: values.detach ?? false,
        seedCycles: parseCount(values['seed-cycles'], config.ci ? 2 : 8),
        scenario: values.scenario ?? 'ambient',
        pace: parsePace(values.pace, 'demo'),
        withFrontend: !(values['no-frontend'] ?? false),
        rebuildBackend: values['rebuild-backend'] ?? false,
      });
      return;
    }

    case 'down': {
      const { values } = parseArgs({
        args: rest,
        options: { wipe: { type: 'boolean', default: false } },
      });
      const { downCommand } = await import('./orchestrator/up');
      await downCommand(config, { wipe: values.wipe ?? false });
      return;
    }

    case 'status': {
      const { statusCommand } = await import('./orchestrator/up');
      await statusCommand(config);
      return;
    }

    case 'scenario': {
      const name = rest[0];
      if (!name) fail('Usage: harness scenario <name>');
      const result = await controlRequest('/scenario', { name });
      process.stdout.write(`${JSON.stringify(result)}\n`);
      return;
    }

    case 'phase': {
      const name = rest[0];
      if (!name) fail('Usage: harness phase <name> (one-shot jump, no hold)');
      const result = await controlRequest('/phase', { name });
      process.stdout.write(`${JSON.stringify(result)}\n`);
      return;
    }

    case 'pace': {
      const name = rest[0];
      if (!name) fail('Usage: harness pace <realtime|demo|fast>');
      const result = await controlRequest('/pace', { name: parsePace(name, 'demo') });
      process.stdout.write(`${JSON.stringify(result)}\n`);
      return;
    }

    case 'gesture': {
      const { values } = parseArgs({
        args: rest,
        options: {
          as: { type: 'string' },
          kind: { type: 'string', default: 'eth' },
          message: { type: 'string', short: 'm' },
        },
      });
      const result = await controlRequest('/gesture', {
        persona: values.as,
        kind: values.kind,
        message: values.message,
      });
      process.stdout.write(`${JSON.stringify(result)}\n`);
      return;
    }

    case 'finalize': {
      const { values } = parseArgs({ args: rest, options: { as: { type: 'string' } } });
      const result = await controlRequest('/finalize', { persona: values.as });
      process.stdout.write(`${JSON.stringify(result)}\n`);
      return;
    }

    case 'pause':
    case 'resume': {
      const result = await controlRequest(`/${command}`, {});
      process.stdout.write(`${JSON.stringify(result)}\n`);
      return;
    }

    case 'director': {
      const { values } = parseArgs({
        args: rest,
        options: {
          scenario: { type: 'string', default: 'ambient' },
          pace: { type: 'string' },
          'seed-cycles': { type: 'string' },
        },
      });
      const { runDirector } = await import('./director/run');
      await runDirector(config, {
        scenario: values.scenario ?? 'ambient',
        pace: parsePace(values.pace, 'demo'),
        seedCycles: parseCount(values['seed-cycles'], 0),
      });
      return;
    }

    default:
      fail(
        command ? `Unknown command "${command}".` : 'Missing command.',
        'Commands: up, down, reset, status, scenario, phase, pace, gesture, finalize, pause, resume. See scripts/harness/cli.ts header.',
      );
  }
}

main().catch((err: unknown) => {
  fail(err instanceof Error ? err.message : String(err));
});
