/**
 * A single consistent snapshot of the live game, used by the planner, the
 * ambient loop, the smoke check, and the control API's status endpoint.
 */

import { zeroAddress, type Address } from 'viem';

import {
  readCycleActivationTime,
  readCycleIndex,
  readFinalizationTime,
  readLastGestureAddress,
  readNextCstGestureCost,
  readNextEthGestureCost,
  readSecondsUntilActivation,
  readSecondsUntilFinalization,
  readTimeIncrementSeconds,
} from './abiCalls';
import { readChainNowSeconds } from './time';
import type { World } from './world';

export interface CycleSnapshot {
  chainNowSeconds: bigint;
  cycleIndex: bigint;
  activationTime: bigint;
  /** Negative once the cycle is active. */
  secondsUntilActivation: bigint;
  /** True once activation time has passed. */
  cycleActive: boolean;
  /** Zero address until the cycle's first gesture. */
  lastGestureAddress: Address;
  /** True once at least one gesture was made this cycle. */
  cycleOpened: boolean;
  finalizationTime: bigint;
  /** 0 when finalizable (only meaningful while cycleOpened). */
  secondsUntilFinalization: bigint;
  nextEthGestureCost: bigint;
  nextCstGestureCost: bigint;
  timeIncrementSeconds: bigint;
}

export async function readCycleSnapshot(world: World): Promise<CycleSnapshot> {
  const [
    chainNowSeconds,
    cycleIndex,
    activationTime,
    secondsUntilActivation,
    lastGestureAddress,
    finalizationTime,
    secondsUntilFinalization,
    nextEthGestureCost,
    nextCstGestureCost,
    timeIncrementSeconds,
  ] = await Promise.all([
    readChainNowSeconds(world),
    readCycleIndex(world),
    readCycleActivationTime(world),
    readSecondsUntilActivation(world),
    readLastGestureAddress(world),
    readFinalizationTime(world),
    readSecondsUntilFinalization(world),
    readNextEthGestureCost(world),
    readNextCstGestureCost(world),
    readTimeIncrementSeconds(world),
  ]);
  return {
    chainNowSeconds,
    cycleIndex,
    activationTime,
    secondsUntilActivation,
    cycleActive: secondsUntilActivation <= 0n,
    lastGestureAddress,
    cycleOpened: lastGestureAddress !== zeroAddress,
    finalizationTime,
    secondsUntilFinalization,
    nextEthGestureCost,
    nextCstGestureCost,
    timeIncrementSeconds,
  };
}
