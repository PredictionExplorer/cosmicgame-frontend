/**
 * Chain-clock helpers. Live scenarios run strictly at wall-clock speed (the
 * frontend compares on-chain timestamps against Date.now()), so time warping
 * is reserved for backdated history seeding, where the chain clock starts in
 * the past and is advanced up to — never beyond — the present.
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

/** Advance the chain clock by `seconds` and mine a block at the new time. */
export async function advanceChainTime(world: World, seconds: bigint): Promise<void> {
  if (seconds <= 0n) return;
  await world.testClient.increaseTime({ seconds: Number(seconds) });
  await world.testClient.mine({ blocks: 1 });
}

/**
 * Advance the chain clock to an absolute timestamp (no-op if already past).
 * Clamped to wall clock so live countdowns can never end up in chain-future.
 */
export async function advanceChainTimeTo(world: World, targetSeconds: bigint): Promise<void> {
  const clamped = targetSeconds > wallNowSeconds() ? wallNowSeconds() : targetSeconds;
  const now = await readChainNowSeconds(world);
  if (clamped <= now) return;
  await advanceChainTime(world, clamped - now);
}

/** Seconds the chain clock lags behind the wall clock (0 when caught up). */
export async function readChainLagSeconds(world: World): Promise<bigint> {
  const chainNow = await readChainNowSeconds(world);
  const wall = wallNowSeconds();
  return wall > chainNow ? wall - chainNow : 0n;
}
