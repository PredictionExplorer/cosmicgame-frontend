/**
 * The default scenario: an endless, organic stream of activity. Cycles open,
 * personas gesture at irregular intervals (ETH / CST / RandomWalk-discount,
 * occasional attachments and contributions), countdowns run out, cycles
 * finalize, allocations get retrieved, NFTs get anchored and released —
 * forever, at wall-clock speed under the active pace.
 */

import {
  performAnchorCosmicNft,
  performCstGesture,
  performEthContribution,
  performEthGesture,
  performFinalizeCycle,
  performGestureWithNftAttachment,
  performGestureWithTokenAttachment,
  performRetrievals,
  performRwlkGesture,
  type GestureResult,
} from '../director/actions';
import { readCycleSnapshot } from '../director/gameState';
import { pickOne } from '../director/personas';
import type { Persona, World } from '../director/world';

import { tick, type Scenario, type ScenarioContext } from './types';

async function oneGesture(
  world: World,
  persona: Persona,
  cstAllowed: boolean,
): Promise<GestureResult | null> {
  const roll = world.rng();
  if (cstAllowed && roll < persona.style.cstAffinity) {
    const made = await performCstGesture(world, persona);
    if (made) return made;
  }
  if (roll < persona.style.cstAffinity + persona.style.rwlkAffinity) {
    return performRwlkGesture(world, persona);
  }
  const attachRoll = world.rng();
  if (attachRoll < persona.style.attachmentAffinity / 2) {
    return performGestureWithNftAttachment(world, persona);
  }
  if (attachRoll < persona.style.attachmentAffinity) {
    const made = await performGestureWithTokenAttachment(world, persona);
    if (made) return made;
  }
  return performEthGesture(world, persona);
}

async function loopOnce(ctx: ScenarioContext): Promise<void> {
  const { world } = ctx;
  const snapshot = await readCycleSnapshot(world);

  // Between cycles or before activation: idle until the game opens up.
  if (!snapshot.cycleActive) {
    await tick(ctx, 3_000);
    return;
  }

  // Calibration Window: give the descending cost a moment, then open the cycle.
  if (!snapshot.cycleOpened) {
    const wait = 4_000 + world.rng() * 0.25 * ctx.pace.ethWindowSeconds * 1_000;
    await tick(ctx, Math.min(wait, 30_000));
    if (ctx.signal.aborted || ctx.isPaused()) return;
    await performEthGesture(world, pickOne(world.rng, [...world.personas]));
    return;
  }

  // Expired countdown: finalize, settle allocations, seed some anchoring.
  if (snapshot.secondsUntilFinalization === 0n) {
    const finalizer = await performFinalizeCycle(world);
    await performRetrievals(world, snapshot.cycleIndex, 0.3);
    if (world.rng() < 0.5) {
      await performAnchorCosmicNft(world, finalizer);
    }
    if (world.rng() < 0.15) {
      await performEthContribution(world, pickOne(world.rng, [...world.personas]), '0.02');
    }
    return;
  }

  // Live cycle: sometimes gesture, sometimes let the countdown breathe.
  const persona = pickOne(world.rng, [...world.personas]);
  const remaining = Number(snapshot.secondsUntilFinalization);
  const nearDeadline = remaining < Number(snapshot.timeIncrementSeconds) * 1.5;
  const gestureChance = nearDeadline ? 0.65 : 0.25;
  if (world.rng() < gestureChance) {
    await oneGesture(world, persona, true);
  }
  const pause = (2 + world.rng() * 6) * 1_000 * persona.style.tempo;
  await tick(ctx, pause);
}

export const ambientScenario: Scenario = {
  name: 'ambient',
  description:
    'Endless organic activity: gestures, cycle turnover, retrievals, anchoring — at wall-clock speed.',
  run: async (ctx) => {
    ctx.markReady();
    while (!ctx.signal.aborted) {
      if (ctx.isPaused()) {
        await tick(ctx, 500);
        continue;
      }
      await loopOnce(ctx);
    }
  },
};
