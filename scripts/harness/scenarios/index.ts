/**
 * Scenario registry: the ambient default, one pinned scenario per UI cycle
 * phase (self-healing — they re-drive the game whenever the phase drifts),
 * and a few showcase behaviors for specific surfaces.
 */

import {
  performAnchorCosmicNft,
  performAnchorRwlkNft,
  performCstGesture,
  performEthGesture,
  performGestureWithNftAttachment,
  performGestureWithTokenAttachment,
} from '../director/actions';
import { readCycleSnapshot } from '../director/gameState';
import { pickOne } from '../director/personas';
import {
  driveToPhase,
  phaseStillHolds,
  TARGET_PHASES,
  type TargetPhase,
} from '../director/planner';

import { ambientScenario } from './ambient';
import { tick, type Scenario, type ScenarioContext } from './types';

function pinnedPhaseScenario(phase: TargetPhase): Scenario {
  return {
    name: phase,
    description: `Holds the UI in the "${phase}" cycle phase, re-driving the game when it drifts.`,
    run: async (ctx) => {
      while (!ctx.signal.aborted) {
        if (ctx.isPaused()) {
          await tick(ctx, 500);
          continue;
        }
        if (!(await phaseStillHolds(ctx.world, phase))) {
          await driveToPhase(ctx.world, phase, ctx.pace);
        }
        await tick(ctx, 5_000);
      }
    },
  };
}

/** Two personas trading rapid gestures — exercises chat, ticker, and pulses. */
const gestureBattleScenario: Scenario = {
  name: 'gesture-battle',
  description: 'Two personas trade rapid gestures mid-cycle (chat and ticker stress).',
  run: async (ctx) => {
    const { world } = ctx;
    const [a, b] = [world.personas[0], world.personas[1]];
    if (!a || !b) throw new Error('gesture-battle needs at least two personas');
    let turn = 0;
    while (!ctx.signal.aborted) {
      if (ctx.isPaused()) {
        await tick(ctx, 500);
        continue;
      }
      const snapshot = await readCycleSnapshot(world);
      if (!snapshot.cycleActive || snapshot.secondsUntilFinalization === 0n) {
        await driveToPhase(world, 'final-ten', ctx.pace);
        continue;
      }
      const persona = turn % 2 === 0 ? a : b;
      turn += 1;
      if (world.rng() < 0.3) {
        await performCstGesture(world, persona);
      } else {
        await performEthGesture(world, persona);
      }
      await tick(ctx, 3_000 + world.rng() * 4_000);
    }
  },
};

/** Loads the current cycle with ERC-20 and NFT attachments. */
const attachmentsShowcaseScenario: Scenario = {
  name: 'attachments-showcase',
  description: 'Fills the live cycle with ERC-20 and NFT attachments.',
  run: async (ctx) => {
    const { world } = ctx;
    while (!ctx.signal.aborted) {
      if (ctx.isPaused()) {
        await tick(ctx, 500);
        continue;
      }
      const snapshot = await readCycleSnapshot(world);
      if (!snapshot.cycleActive || snapshot.secondsUntilFinalization === 0n) {
        await driveToPhase(world, 'live', ctx.pace);
        continue;
      }
      const persona = pickOne(world.rng, [...world.personas]);
      if (!snapshot.cycleOpened || world.rng() < 0.5) {
        await performGestureWithNftAttachment(world, persona);
      } else {
        (await performGestureWithTokenAttachment(world, persona)) ??
          (await performEthGesture(world, persona));
      }
      await tick(ctx, 8_000 + world.rng() * 8_000);
    }
  },
};

/** Builds up anchoring positions across personas, then idles with slow turnover. */
const anchoringHeavyScenario: Scenario = {
  name: 'anchoring-heavy',
  description: 'Anchors Cosmic Signature and RandomWalk NFTs across many personas.',
  run: async (ctx) => {
    const { world } = ctx;
    for (const persona of world.personas) {
      if (ctx.signal.aborted) return;
      await performAnchorCosmicNft(world, persona);
      if (world.rng() < 0.5) await performAnchorRwlkNft(world, persona);
    }
    await ambientScenario.run(ctx);
  },
};

/** No automatic activity at all — inspect whatever state the game is in. */
const quietScenario: Scenario = {
  name: 'quiet',
  description: 'No automatic activity; the game only moves when you drive it.',
  run: async (ctx) => {
    while (!ctx.signal.aborted) {
      await tick(ctx, 1_000);
    }
  },
};

const builtInScenarios: readonly Scenario[] = [
  ambientScenario,
  ...TARGET_PHASES.map(pinnedPhaseScenario),
  gestureBattleScenario,
  attachmentsShowcaseScenario,
  anchoringHeavyScenario,
  quietScenario,
];

export const SCENARIOS: ReadonlyMap<string, Scenario> = new Map(
  builtInScenarios.map((scenario) => [scenario.name, scenario]),
);

export function scenarioByName(name: string): Scenario {
  const scenario = SCENARIOS.get(name);
  if (!scenario) {
    throw new Error(`Unknown scenario "${name}". Available: ${[...SCENARIOS.keys()].join(', ')}`);
  }
  return scenario;
}

export type { Scenario, ScenarioContext };
