/**
 * DirectorRuntime: owns the active scenario loop, pause state, and one-shot
 * commands. The control server and the CLI both talk to this object.
 */

import { createLogger } from '../log';
import { SCENARIOS, scenarioByName, type Scenario } from '../scenarios';
import type { ScenarioContext } from '../scenarios/types';

import {
  performCstGesture,
  performEthGesture,
  performFinalizeCycle,
  performRwlkGesture,
  type GestureKind,
} from './actions';
import { readFinalizeExclusivitySeconds } from './abiCalls';
import { readCycleSnapshot, type CycleSnapshot } from './gameState';
import { PACES, isPaceName, type Pace, type PaceName } from './pace';
import { pickOne } from './personas';
import {
  driveToPhase,
  HarnessTransitionAbortedError,
  isTargetPhase,
  type TargetPhase,
} from './planner';
import { personaByName, type Persona, type World } from './world';

const log = createLogger('director');

export interface DirectorStatus {
  ready: boolean;
  scenario: string;
  phase: TargetPhase | 'unavailable';
  pace: PaceName;
  paused: boolean;
  transition: DirectorTransition;
  cycle: {
    index: string;
    active: boolean;
    opened: boolean;
    secondsUntilActivation: string;
    secondsUntilFinalization: string;
    finalizationTime: string;
    lastGestureAddress: string;
    nextEthGestureCost: string;
    nextCstGestureCost: string;
  };
  personas: Array<{ name: string; address: string }>;
  scenarios: string[];
  paces: PaceName[];
  phases: TargetPhase[];
}

export interface DirectorTransition {
  kind: 'scenario' | 'phase' | 'command' | null;
  state: 'idle' | 'driving' | 'running' | 'error';
  target: string | null;
  error: string | null;
}

const idleTransition = (): DirectorTransition => ({
  kind: null,
  state: 'idle',
  target: null,
  error: null,
});

function phaseFromSnapshot(snapshot: CycleSnapshot | null): DirectorStatus['phase'] {
  if (!snapshot) return 'unavailable';
  if (!snapshot.cycleActive) return 'opening-soon';
  if (!snapshot.cycleOpened) return 'waiting-first-gesture';
  const remaining = Number(snapshot.secondsUntilFinalization);
  if (remaining <= 0) return 'ready-to-finalize';
  if (remaining <= 60) return 'final-minute';
  if (remaining <= 10 * 60) return 'final-ten';
  if (remaining <= 60 * 60) return 'final-hour';
  if (remaining <= 12 * 60 * 60) return 'approach';
  return 'live';
}

export class DirectorRuntime {
  private readonly world: World;
  private pace: Pace;
  private paused = false;
  private readyFlag = false;
  private scenario: Scenario | null = null;
  private abortController: AbortController | null = null;
  private scenarioTask: Promise<void> = Promise.resolve();
  private commandAbortController: AbortController | null = null;
  private mutationTail: Promise<void> = Promise.resolve();
  private mutationGeneration = 0;
  private shuttingDown = false;
  private shutdownTask: Promise<void> | null = null;
  private transition: DirectorTransition = idleTransition();

  constructor(world: World, paceName: PaceName) {
    this.world = world;
    this.pace = PACES[paceName];
  }

  markReady(): void {
    this.readyFlag = true;
  }

  get isReady(): boolean {
    return this.readyFlag;
  }

  get paceName(): PaceName {
    return this.pace.name;
  }

  async setPace(name: string): Promise<void> {
    if (!isPaceName(name)) throw new Error(`Unknown pace "${name}"`);
    if (name === 'seed-history') throw new Error('The seed-history pace is bootstrap-only');
    const generation = this.beginSupersedingMutation();
    await this.enqueueMutation(async () => {
      this.assertCurrentMutation(generation);
      const scenarioName = this.scenario?.name;
      await this.stopScenarioUnlocked();
      this.assertCurrentMutation(generation);
      this.pace = PACES[name];
      if (scenarioName) this.startScenarioUnlocked(scenarioByName(scenarioName));
      log.info(`Pace → ${name} (applies on the next cycle/phase configuration)`);
    });
  }

  private enqueueMutation<T>(operation: () => Promise<T>): Promise<T> {
    const result = this.mutationTail.then(operation, operation);
    this.mutationTail = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }

  private supersedeActiveWork(): void {
    this.abortController?.abort();
    this.commandAbortController?.abort();
  }

  private beginSupersedingMutation(): number {
    if (this.shuttingDown) throw new Error('Harness director is shutting down');
    this.supersedeActiveWork();
    this.mutationGeneration += 1;
    return this.mutationGeneration;
  }

  private assertCurrentMutation(generation: number): void {
    if (generation !== this.mutationGeneration) throw new HarnessTransitionAbortedError();
  }

  private startScenarioUnlocked(next: Scenario): void {
    const abortController = new AbortController();
    this.abortController = abortController;
    this.scenario = next;
    this.transition = {
      kind: 'scenario',
      state: 'driving',
      target: next.name,
      error: null,
    };
    const markReady = () => {
      if (this.abortController !== abortController || abortController.signal.aborted) return;
      this.transition = {
        kind: 'scenario',
        state: 'running',
        target: next.name,
        error: null,
      };
    };
    const context: ScenarioContext = {
      world: this.world,
      pace: this.pace,
      signal: abortController.signal,
      isPaused: () => this.paused,
      markReady,
    };
    log.info(`Scenario → ${next.name}`);
    this.scenarioTask = next.run(context).catch((err: unknown) => {
      if (
        abortController.signal.aborted ||
        err instanceof HarnessTransitionAbortedError ||
        this.abortController !== abortController
      ) {
        return;
      }
      const message = err instanceof Error ? err.message : String(err);
      log.error(`Scenario "${next.name}" crashed: ${message}`);
      this.transition = {
        kind: 'scenario',
        state: 'error',
        target: next.name,
        error: message,
      };
    });
  }

  /** Start (or replace) the active scenario. Resolves once the loop is running. */
  async switchScenario(name: string): Promise<void> {
    const next = scenarioByName(name);
    const generation = this.beginSupersedingMutation();
    await this.enqueueMutation(async () => {
      this.assertCurrentMutation(generation);
      await this.stopScenarioUnlocked();
      this.assertCurrentMutation(generation);
      if (next.defaultPace) this.pace = PACES[next.defaultPace];
      this.startScenarioUnlocked(next);
    });
  }

  async stopScenario(): Promise<void> {
    const generation = this.beginSupersedingMutation();
    await this.enqueueMutation(async () => {
      this.assertCurrentMutation(generation);
      await this.stopScenarioUnlocked();
    });
  }

  /** Terminal drain used by process shutdown; no later mutation may restart work. */
  async shutdown(): Promise<void> {
    if (this.shutdownTask) return this.shutdownTask;
    this.shuttingDown = true;
    this.supersedeActiveWork();
    this.mutationGeneration += 1;
    this.shutdownTask = this.enqueueMutation(() => this.stopScenarioUnlocked());
    return this.shutdownTask;
  }

  private async stopScenarioUnlocked(): Promise<void> {
    const controller = this.abortController;
    controller?.abort();
    await this.scenarioTask;
    if (this.abortController === controller) {
      this.abortController = null;
      this.scenario = null;
      this.scenarioTask = Promise.resolve();
      this.transition = idleTransition();
    }
  }

  private async runManualCommand<T>(
    target: string,
    operation: (signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    const generation = this.beginSupersedingMutation();
    return this.enqueueMutation(async () => {
      this.assertCurrentMutation(generation);
      await this.stopScenarioUnlocked();
      this.assertCurrentMutation(generation);
      const controller = new AbortController();
      this.commandAbortController = controller;
      this.transition = { kind: 'command', state: 'driving', target, error: null };
      try {
        const result = await operation(controller.signal);
        this.assertCurrentMutation(generation);
        if (controller.signal.aborted) throw new HarnessTransitionAbortedError();
        this.startScenarioUnlocked(scenarioByName('quiet'));
        this.transition = { kind: 'command', state: 'running', target, error: null };
        return result;
      } catch (err) {
        if (
          controller.signal.aborted ||
          generation !== this.mutationGeneration ||
          err instanceof HarnessTransitionAbortedError
        ) {
          throw err instanceof HarnessTransitionAbortedError
            ? err
            : new HarnessTransitionAbortedError();
        }
        const message = err instanceof Error ? err.message : String(err);
        this.startScenarioUnlocked(scenarioByName('quiet'));
        this.transition = { kind: 'command', state: 'error', target, error: message };
        throw err;
      } finally {
        if (this.commandAbortController === controller) this.commandAbortController = null;
      }
    });
  }

  pause(): void {
    this.paused = true;
    log.info('Automatic activity paused');
  }

  resume(): void {
    this.paused = false;
    log.info('Automatic activity resumed');
  }

  private resolvePersona(name?: string): Persona {
    if (name) return personaByName(this.world, name);
    return pickOne(this.world.rng, [...this.world.personas]);
  }

  /** One-shot gesture, independent of the running scenario. */
  async gesture(options: {
    persona?: string;
    kind?: GestureKind;
    message?: string;
  }): Promise<string> {
    return this.runManualCommand('gesture', async () => {
      const persona = this.resolvePersona(options.persona);
      const kind = options.kind ?? 'eth';
      const messageOptions = options.message !== undefined ? { message: options.message } : {};
      if (kind === 'cst') {
        const made = await performCstGesture(this.world, persona, messageOptions);
        if (!made) throw new Error(`${persona.name} cannot afford the current CST gesture cost`);
        return made.txHash;
      }
      if (kind === 'rwlk') {
        return (await performRwlkGesture(this.world, persona, messageOptions)).txHash;
      }
      return (await performEthGesture(this.world, persona, messageOptions)).txHash;
    });
  }

  /** One-shot finalization of the current cycle. */
  async finalize(personaName?: string): Promise<string> {
    return this.runManualCommand('finalize', async () => {
      const by = personaName ? personaByName(this.world, personaName) : undefined;
      const finalizer = await performFinalizeCycle(this.world, by);
      return finalizer.name;
    });
  }

  /**
   * One-shot jump to a UI phase (no hold loop — unlike the pinned phase
   * scenarios, the game is left alone afterwards). Used by tests.
   */
  async driveTo(phase: string): Promise<void> {
    if (!isTargetPhase(phase)) throw new Error(`Unknown phase "${phase}"`);
    await this.runManualCommand(phase, async (signal) => {
      this.transition = { kind: 'phase', state: 'driving', target: phase, error: null };
      await driveToPhase(this.world, phase, this.pace, { signal });
    });
  }

  async status(): Promise<DirectorStatus> {
    let snapshot: CycleSnapshot | null = null;
    try {
      snapshot = await readCycleSnapshot(this.world);
    } catch {
      // Chain still booting — report an empty cycle block.
    }
    let phase = phaseFromSnapshot(snapshot);
    if (phase === 'ready-to-finalize' && snapshot) {
      try {
        const exclusivitySeconds = await readFinalizeExclusivitySeconds(this.world);
        if (snapshot.chainNowSeconds >= snapshot.finalizationTime + exclusivitySeconds) {
          phase = 'exclusivity-expired';
        }
      } catch {
        // Keep the zero-cross phase while the chain read is unavailable.
      }
    }
    return {
      ready: this.readyFlag,
      scenario: this.scenario?.name ?? 'none',
      phase,
      pace: this.pace.name,
      paused: this.paused,
      transition: { ...this.transition },
      cycle: {
        index: snapshot?.cycleIndex.toString() ?? '0',
        active: snapshot?.cycleActive ?? false,
        opened: snapshot?.cycleOpened ?? false,
        secondsUntilActivation: snapshot?.secondsUntilActivation.toString() ?? '0',
        secondsUntilFinalization: snapshot?.secondsUntilFinalization.toString() ?? '0',
        finalizationTime: snapshot?.finalizationTime.toString() ?? '0',
        lastGestureAddress: snapshot?.lastGestureAddress ?? '',
        nextEthGestureCost: snapshot?.nextEthGestureCost.toString() ?? '0',
        nextCstGestureCost: snapshot?.nextCstGestureCost.toString() ?? '0',
      },
      personas: this.world.personas.map((p) => ({ name: p.name, address: p.address })),
      scenarios: [...SCENARIOS.keys()],
      paces: (Object.keys(PACES) as PaceName[]).filter((name) => name !== 'seed-history'),
      phases: [
        'opening-soon',
        'waiting-first-gesture',
        'live',
        'approach',
        'final-hour',
        'final-ten',
        'final-minute',
        'ready-to-finalize',
        'exclusivity-expired',
      ],
    };
  }
}
