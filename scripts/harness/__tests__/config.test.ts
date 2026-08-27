import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { preflightRepoIssues, resolveHarnessConfig } from '../config';
import {
  seedChainStartIso,
  SEED_SECONDS_PER_CYCLE,
  SEED_TAIL_MARGIN_SECONDS,
} from '../director/seedPlan';

const baseEnv = { NODE_ENV: 'test' } as unknown as NodeJS.ProcessEnv;

describe('resolveHarnessConfig', () => {
  it('applies conventional defaults relative to the workspace', () => {
    const config = resolveHarnessConfig(baseEnv, '/tmp/frontend');
    expect(config.frontendDir).toBe('/tmp/frontend');
    expect(config.contractsDir).toBe('/tmp/Cosmic-Signature');
    expect(config.backendDir).toBe('/tmp/augur-explorer');
    expect(config.runDir).toBe('/tmp/frontend/.harness');
    expect(config.chainPort).toBe(8545);
    expect(config.apiPort).toBe(8099);
    expect(config.webPort).toBe(3000);
  });

  it('honors environment overrides and rejects invalid ports', () => {
    const config = resolveHarnessConfig(
      {
        ...baseEnv,
        COSMIC_CONTRACTS_DIR: '/elsewhere/contracts',
        HARNESS_WEB_PORT: '3100',
        HARNESS_RNG_SEED: '7',
      },
      '/tmp/frontend',
    );
    expect(config.contractsDir).toBe('/elsewhere/contracts');
    expect(config.webPort).toBe(3100);
    expect(config.rngSeed).toBe(7);

    expect(() =>
      resolveHarnessConfig({ ...baseEnv, HARNESS_WEB_PORT: 'not-a-port' }, '/tmp/frontend'),
    ).toThrow(/HARNESS_WEB_PORT/);
  });

  it('flags CI mode from either CI or HARNESS_CI', () => {
    expect(resolveHarnessConfig({ ...baseEnv, CI: 'true' }, '/tmp/x').ci).toBe(true);
    expect(resolveHarnessConfig({ ...baseEnv, HARNESS_CI: '1' }, '/tmp/x').ci).toBe(true);
    expect(resolveHarnessConfig(baseEnv, '/tmp/x').ci).toBe(false);
  });
});

describe('preflightRepoIssues', () => {
  it('reports actionable issues for missing sibling repos and none when present', () => {
    const scratch = mkdtempSync(join(tmpdir(), 'harness-config-'));
    try {
      const missing = preflightRepoIssues(
        resolveHarnessConfig(
          {
            ...baseEnv,
            COSMIC_CONTRACTS_DIR: join(scratch, 'contracts'),
            RWCG_BACKEND_DIR: join(scratch, 'backend'),
          },
          scratch,
        ),
      );
      expect(missing).toHaveLength(2);
      expect(missing[0]?.resolution).toMatch(/COSMIC_CONTRACTS_DIR/);

      mkdirSync(join(scratch, 'contracts'), { recursive: true });
      writeFileSync(join(scratch, 'contracts', 'hardhat.config.js'), '');
      mkdirSync(join(scratch, 'backend'), { recursive: true });
      writeFileSync(join(scratch, 'backend', 'compose.yaml'), '');
      const none = preflightRepoIssues(
        resolveHarnessConfig(
          {
            ...baseEnv,
            COSMIC_CONTRACTS_DIR: join(scratch, 'contracts'),
            RWCG_BACKEND_DIR: join(scratch, 'backend'),
          },
          scratch,
        ),
      );
      expect(none).toHaveLength(0);
    } finally {
      rmSync(scratch, { recursive: true, force: true });
    }
  });
});

describe('seedChainStartIso', () => {
  it('backdates genesis by the per-cycle budget plus the tail margin', () => {
    const nowMs = Date.UTC(2026, 0, 10, 12, 0, 0);
    const iso = seedChainStartIso(3, nowMs);
    const expected = nowMs - (3 * SEED_SECONDS_PER_CYCLE + SEED_TAIL_MARGIN_SECONDS) * 1_000;
    expect(new Date(iso).getTime()).toBe(expected);
  });
});
