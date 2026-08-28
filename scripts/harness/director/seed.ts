/**
 * Backdated history seeding. The chain's clock starts in the past (the
 * orchestrator computes the genesis date); this module replays complete
 * cycles at a daily cadence — gestures with organic gaps, finalizations,
 * partial retrievals, anchoring — then advances the clock up to the wall
 * clock so live operation continues seamlessly with realistic history.
 */

import { createLogger } from '../log';
import { upgradeGameToV2 } from '../orchestrator/deploy';

import { ACTIVATION_PARK_SECONDS } from './planner';
import {
  readSecondsUntilFinalization,
  readFinalizeExclusivitySeconds,
  writeCycleActivationTime,
  writePaceSetters,
} from './abiCalls';
import {
  performAnchorCosmicNft,
  performAnchorRwlkNft,
  performCstGesture,
  performEthContribution,
  performEthGesture,
  performFinalizeCycle,
  performGestureWithNftAttachment,
  performGestureWithTokenAttachment,
  performReleaseCosmicNft,
  performRetrievals,
  performRwlkGesture,
  type AnchorRecord,
} from './actions';
import { readCycleSnapshot } from './gameState';
import { PACES, paceToSetterValues } from './pace';
import { pickInt, pickOne } from './personas';
import { SEED_SECONDS_PER_CYCLE } from './seedPlan';
import { advanceChainTime, advanceChainTimeTo, readChainNowSeconds, wallNowSeconds } from './time';
import type { Persona, World } from './world';

const log = createLogger('seed');

export { SEED_SECONDS_PER_CYCLE } from './seedPlan';

interface SeedBookkeeping {
  anchors: AnchorRecord[];
}

async function seedGesture(
  world: World,
  persona: Persona,
  canUseCst: boolean,
  books: SeedBookkeeping,
): Promise<void> {
  const roll = world.rng();
  if (canUseCst && roll < persona.style.cstAffinity) {
    if ((await performCstGesture(world, persona)) !== null) return;
  }
  if (roll < persona.style.cstAffinity + persona.style.rwlkAffinity) {
    await performRwlkGesture(world, persona);
    return;
  }
  const attachRoll = world.rng();
  if (attachRoll < persona.style.attachmentAffinity / 2) {
    await performGestureWithNftAttachment(world, persona);
    return;
  }
  if (attachRoll < persona.style.attachmentAffinity) {
    if ((await performGestureWithTokenAttachment(world, persona)) !== null) return;
  }
  await performEthGesture(world, persona);
  void books;
}

/**
 * Replay `cycles` complete Performance Cycles into the (backdated) chain.
 *
 * The genesis cycle runs on the deployed V1 game; after it finalizes, the
 * proxy is upgraded to CosmicSignatureGameV2 (matching mainnet's history,
 * whose reinitializer requires a completed first cycle), and the remaining
 * cycles run on V2.
 */
export async function seedHistory(world: World, cycles: number): Promise<void> {
  const pace = PACES['seed-history'];
  const increment = BigInt(pace.timeIncrementSeconds);
  const books: SeedBookkeeping = { anchors: [] };

  log.info(`Seeding ${cycles} historical cycles…`);
  await writePaceSetters(world, paceToSetterValues(pace));
  const seedStart = await readChainNowSeconds(world);

  for (let k = 0; k < cycles; k++) {
    const chainNow = await readChainNowSeconds(world);
    const activationTime = chainNow + BigInt(pace.activationDelaySeconds);
    await writeCycleActivationTime(world, activationTime);

    // Wait out part of the Calibration Window before the opening gesture.
    const windowWait = pickInt(world.rng, 60, pace.ethWindowSeconds);
    await advanceChainTimeTo(world, activationTime + BigInt(windowWait));

    const opener = pickOne(world.rng, [...world.personas]);
    await performEthGesture(world, opener);

    // A cycle's worth of gestures with organic gaps (some long, for
    // endurance/chrono variance). CST unlocks after the opening gesture.
    const gestureCount = pickInt(world.rng, 5, 13);
    for (let g = 0; g < gestureCount; g++) {
      const remaining = await readSecondsUntilFinalization(world);
      if (remaining <= 30n) break;
      const gapScale = world.rng() < 0.15 ? 3 : 0.8;
      const gap = BigInt(
        Math.min(
          Number(remaining) - 20,
          Math.max(30, Math.round(Number(increment) * gapScale * world.rng())),
        ),
      );
      await advanceChainTime(world, gap);
      await seedGesture(world, pickOne(world.rng, [...world.personas]), true, books);
    }

    // Occasional voluntary ETH contribution to the reserve.
    if (world.rng() < 0.3) {
      await performEthContribution(world, pickOne(world.rng, [...world.personas]), '0.05');
    }

    // Let the countdown expire, then finalize — usually by the final
    // gesturer; sometimes after the exclusivity window, by someone else.
    const snapshot = await readCycleSnapshot(world);
    await advanceChainTimeTo(world, snapshot.finalizationTime + 30n);
    if (world.rng() < 0.2) {
      const exclusivity = await readFinalizeExclusivitySeconds(world);
      await advanceChainTime(world, exclusivity + 30n);
      const outsider = pickOne(world.rng, [...world.personas]);
      await performFinalizeCycle(world, outsider);
    } else {
      await performFinalizeCycle(world);
    }
    const finalizedCycle = snapshot.cycleIndex;

    // Retrieve most escrowed allocations; leave some so retrievable states exist.
    await advanceChainTime(world, 120n);
    await performRetrievals(world, finalizedCycle, 0.35);

    // Anchoring traffic: Cosmic Signature NFTs exist from cycle 0 onward.
    if (world.rng() < 0.7) {
      const anchor = await performAnchorCosmicNft(world, pickOne(world.rng, [...world.personas]));
      if (anchor) books.anchors.push(anchor);
    }
    if (k < 2) {
      books.anchors.push(
        await performAnchorRwlkNft(world, pickOne(world.rng, [...world.personas])),
      );
    }
    if (books.anchors.length > 3 && world.rng() < 0.4) {
      const record = books.anchors.find((entry) => entry.kind === 'cosmic');
      if (record) {
        await performReleaseCosmicNft(world, record);
        books.anchors.splice(books.anchors.indexOf(record), 1);
      }
    }

    // Rest until this cycle's daily slot ends (keeps a realistic cadence).
    await advanceChainTimeTo(world, seedStart + BigInt((k + 1) * SEED_SECONDS_PER_CYCLE));
    log.info(`Seeded cycle ${finalizedCycle} (${k + 1}/${cycles})`);

    if (k === 0) {
      log.info('Genesis cycle finalized — upgrading the game proxy to CosmicSignatureGameV2…');
      // The upgrade is only authorized while the cycle is inactive; the next
      // cycle auto-activated after the finalize, so park it (legal while no
      // gesture has been made). The loop re-activates on its next iteration.
      const parkFrom = await readChainNowSeconds(world);
      await writeCycleActivationTime(world, parkFrom + ACTIVATION_PARK_SECONDS);
      await upgradeGameToV2(world.config);
      // The V2 reinitializer installs its own timing defaults. Re-apply the
      // seed profile while the next cycle is parked, otherwise cycle 1 can
      // inherit a multi-day countdown and exhaust the backdated seed budget.
      await writePaceSetters(world, paceToSetterValues(pace));
      log.info('Game proxy now runs CosmicSignatureGameV2.');
    }
  }

  // Catch the chain clock up to the wall clock; live operation is seamless.
  await advanceChainTimeTo(world, wallNowSeconds());
  log.info('History seeding complete; chain clock aligned with wall clock.');
}
