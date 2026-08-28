/**
 * Chain-clock helpers. History seeding is capped at wall time. Explicit
 * interactive phase changes may fast-forward the disposable local chain;
 * frontend countdowns project targets through the backend's chain-clock
 * sample so their relative behavior remains production-equivalent.
 */

import type { World } from './world';

/** Chain "now": the latest block timestamp (blocks tick every ~2s via interval mining). */
export async function readChainNowSeconds(world: World): Promise<bigint> {
  const block = await world.publicClient.getBlock({ blockTag: 'latest' });
  return block.timestamp;
}

export function wallNowSeconds(): bigint {
  return BigInt(Math.floor(Date.now() / 1000));
}

export interface ChainTimeAdvanceOptions {
  /**
   * Interactive phase switching may advance the disposable local chain past
   * host time. Product countdowns project chain time through the API clock.
   * History seeding leaves this false so seeded dates never enter the future.
   */
  allowFuture?: boolean;
}

/** Pure target resolution kept exported for deterministic unit coverage. */
export function resolveChainTimeTarget({
  current,
  requested,
  wall,
  allowFuture = false,
}: {
  current: bigint;
  requested: bigint;
  wall: bigint;
  allowFuture?: boolean;
}): bigint {
  const capped = allowFuture || requested <= wall ? requested : wall;
  return capped > current ? capped : current;
}

/**
 * Move to an absolute timestamp and mine exactly one block.
 *
 * `evm_increaseTime` mutates Hardhat's offset from system time. Combining it
 * with a backdated `initialDate` caused offsets to compound: a two-cycle seed
 * was observed 28 hours ahead of the wall clock. Setting the next timestamp
 * absolutely avoids that drift and gives us a value we can verify.
 */
export async function advanceChainTimeTo(
  world: World,
  targetSeconds: bigint,
  { allowFuture = false }: ChainTimeAdvanceOptions = {},
): Promise<void> {
  let lastError: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    const before = await readChainNowSeconds(world);
    const wallBefore = wallNowSeconds();
    if (!allowFuture && before > wallBefore + 2n) {
      throw new Error(`Chain clock is already past wall time (${before}) during history seeding`);
    }
    const target = resolveChainTimeTarget({
      current: before,
      requested: targetSeconds,
      wall: wallBefore,
      allowFuture,
    });
    if (target <= before) return;

    try {
      await world.testClient.setNextBlockTimestamp({ timestamp: target });
      await world.testClient.mine({ blocks: 1 });
    } catch (error) {
      // The interval miner may consume the requested next timestamp between
      // the read and explicit mine. Re-read and retry from the latest block.
      lastError = error;
      continue;
    }

    const after = await readChainNowSeconds(world);
    if (after < target) {
      lastError = new Error(`Chain clock failed to reach ${target}; latest block is ${after}`);
      continue;
    }
    if (!allowFuture && after > wallNowSeconds() + 2n) {
      throw new Error(`Chain clock advanced past wall time (${after}) during history seeding`);
    }
    return;
  }
  throw lastError instanceof Error ? lastError : new Error('Failed to advance the chain clock');
}

/** Advance the chain clock by `seconds` using the absolute-time primitive. */
export async function advanceChainTime(
  world: World,
  seconds: bigint,
  options: ChainTimeAdvanceOptions = {},
): Promise<void> {
  if (seconds <= 0n) return;
  const now = await readChainNowSeconds(world);
  await advanceChainTimeTo(world, now + seconds, options);
}

/** Seconds the chain clock lags behind the wall clock (0 when caught up). */
export async function readChainLagSeconds(world: World): Promise<bigint> {
  const chainNow = await readChainNowSeconds(world);
  const wall = wallNowSeconds();
  return wall > chainNow ? wall - chainNow : 0n;
}
