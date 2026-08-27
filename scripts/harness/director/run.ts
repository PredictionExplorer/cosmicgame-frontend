/**
 * Director process entrypoint: bootstraps the game (backdated history seeding
 * on a fresh chain, then live pacing), starts the control API, and runs the
 * requested scenario until terminated.
 */

import { createLogger } from '../log';
import type { HarnessConfig } from '../config';
import { FAR_FUTURE_ACTIVATION } from '../orchestrator/deploy';

import { writeCycleActivationTime, writePaceSetters } from './abiCalls';
import { startControlServer } from './controlServer';
import { readCycleSnapshot } from './gameState';
import { PACES, paceToSetterValues, type PaceName } from './pace';
import { settleIntoConfigurableState } from './planner';
import { DirectorRuntime } from './runtime';
import { seedHistory, SEED_SECONDS_PER_CYCLE } from './seed';
import { readChainLagSeconds, readChainNowSeconds } from './time';
import { createWorld, type World } from './world';

const log = createLogger('director');

export interface DirectorOptions {
  scenario: string;
  pace: PaceName;
  seedCycles: number;
}

/** A chain is "fresh" right after deployment: cycle 0, unopened, parked activation. */
async function isFreshDeployment(world: World): Promise<boolean> {
  const snapshot = await readCycleSnapshot(world);
  return (
    snapshot.cycleIndex === 0n &&
    !snapshot.cycleOpened &&
    snapshot.activationTime >= BigInt(FAR_FUTURE_ACTIVATION)
  );
}

/** Configure live pacing and open the next cycle shortly. */
async function bootstrapLivePace(world: World, pace: PaceName): Promise<void> {
  await settleIntoConfigurableState(world);
  await writePaceSetters(world, paceToSetterValues(PACES[pace]));
  const chainNow = await readChainNowSeconds(world);
  await writeCycleActivationTime(world, chainNow + 5n);
  log.info(`Live pace "${pace}" applied; next cycle activates momentarily.`);
}

export async function runDirector(config: HarnessConfig, options: DirectorOptions): Promise<void> {
  const world = createWorld(config);
  const runtime = new DirectorRuntime(world, options.pace);
  const controlServer = startControlServer(runtime, config.controlPort);

  const fresh = await isFreshDeployment(world);
  if (fresh) {
    // At least the genesis cycle must be seeded: the V1→V2 proxy upgrade
    // requires one finalized cycle, and the frontend expects V2 selectors.
    const seedCycles = Math.max(1, options.seedCycles);
    if (seedCycles !== options.seedCycles) {
      log.info('Seeding at least the genesis cycle (required for the V2 upgrade).');
    }
    const lag = await readChainLagSeconds(world);
    const budget = BigInt(seedCycles * SEED_SECONDS_PER_CYCLE);
    if (lag < budget) {
      throw new Error(
        `Chain clock is only ${lag}s behind the wall clock but seeding ${seedCycles} cycles needs ${budget}s. ` +
          'Start the harness through `harness up` so the chain boots backdated.',
      );
    }
    await seedHistory(world, seedCycles);
    await bootstrapLivePace(world, options.pace);
  }

  runtime.markReady();
  await runtime.switchScenario(options.scenario);
  log.info(`Director ready — scenario "${options.scenario}", pace "${options.pace}".`);

  await new Promise<void>((resolveShutdown) => {
    const shutdown = () => {
      log.info('Shutting down director…');
      void runtime.stopScenario().then(() => {
        controlServer.close(() => resolveShutdown());
      });
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
  });
}
