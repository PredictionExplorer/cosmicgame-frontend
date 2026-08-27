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
import { readCycleSnapshot, type CycleSnapshot } from './gameState';
import { PACES, isPaceName, type Pace, type PaceName } from './pace';
import { pickOne } from './personas';
import { driveToPhase, isTargetPhase } from './planner';
import { personaByName, type Persona, type World } from './world';

const log = createLogger('director');

export interface DirectorStatus {
  ready: boolean;
  scenario: string;
  pace: PaceName;
  paused: boolean;
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
}

export class DirectorRuntime {
  private readonly world: World;
  private pace: Pace;
  private paused = false;
  private readyFlag = false;
  private scenario: Scenario | null = null;
  private abortController: AbortController | null = null;
  private scenarioTask: Promise<void> = Promise.resolve();

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

  setPace(name: string): void {
    if (!isPaceName(name)) throw new Error(`Unknown pace "${name}"`);
    this.pace = PACES[name];
  }

  /** Start (or replace) the active scenario. Resolves once the loop is running. */
  async switchScenario(name: string): Promise<void> {
    const next = scenarioByName(name);
    await this.stopScenario();
    if (next.defaultPace) this.pace = PACES[next.defaultPace];

    const abortController = new AbortController();
    this.abortController = abortController;
    this.scenario = next;
    const context: ScenarioContext = {
      world: this.world,
      pace: this.pace,
      signal: abortController.signal,
      isPaused: () => this.paused,
    };
    log.info(`Scenario → ${next.name}`);
    this.scenarioTask = next.run(context).catch((err: unknown) => {
      if (!abortController.signal.aborted) {
        log.error(
          `Scenario "${next.name}" crashed: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    });
  }

  async stopScenario(): Promise<void> {
    this.abortController?.abort();
    await this.scenarioTask;
    this.abortController = null;
    this.scenario = null;
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
  }

  /** One-shot finalization of the current cycle. */
  async finalize(personaName?: string): Promise<string> {
    const by = personaName ? personaByName(this.world, personaName) : undefined;
    const finalizer = await performFinalizeCycle(this.world, by);
    return finalizer.name;
  }

  /**
   * One-shot jump to a UI phase (no hold loop — unlike the pinned phase
   * scenarios, the game is left alone afterwards). Used by tests.
   */
  async driveTo(phase: string): Promise<void> {
    if (!isTargetPhase(phase)) throw new Error(`Unknown phase "${phase}"`);
    await driveToPhase(this.world, phase, this.pace);
  }

  async status(): Promise<DirectorStatus> {
    let snapshot: CycleSnapshot | null = null;
    try {
      snapshot = await readCycleSnapshot(this.world);
    } catch {
      // Chain still booting — report an empty cycle block.
    }
    return {
      ready: this.readyFlag,
      scenario: this.scenario?.name ?? 'none',
      pace: this.pace.name,
      paused: this.paused,
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
    };
  }
}
