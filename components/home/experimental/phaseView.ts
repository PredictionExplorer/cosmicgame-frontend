import type { CyclePhase } from '@/lib/cycleState';

/**
 * How the cycle clock reads in each phase. The figures never change size or
 * colour with the phase (docs/design-system.md → one urgency cue): the phase
 * shows as words, and only the final minute and the finalization states carry
 * a state tone, always beside a word.
 */
export type PhaseTone = 'neutral' | 'live' | 'attention' | 'positive';

export interface PhaseView {
  /** Message key segment under `home.chrono.phase.*`. */
  messageKey: string;
  /** Whether this phase shows a phrase ("Awaiting first Gesture") instead of a countdown. */
  hasDisplayText: boolean;
  /** Tone of the phase tag beside the clock label. */
  tone: PhaseTone;
}

const PHASE_VIEWS: Record<CyclePhase, PhaseView> = {
  loading: { messageKey: 'loading', hasDisplayText: true, tone: 'neutral' },
  unavailable: { messageKey: 'unavailable', hasDisplayText: true, tone: 'neutral' },
  'opening-soon': { messageKey: 'openingSoon', hasDisplayText: false, tone: 'neutral' },
  'waiting-first-gesture': {
    messageKey: 'waitingFirstGesture',
    hasDisplayText: true,
    tone: 'live',
  },
  live: { messageKey: 'live', hasDisplayText: false, tone: 'live' },
  approach: { messageKey: 'approach', hasDisplayText: false, tone: 'live' },
  'final-hour': { messageKey: 'finalHour', hasDisplayText: false, tone: 'live' },
  'final-ten': { messageKey: 'finalTen', hasDisplayText: false, tone: 'live' },
  'final-minute': { messageKey: 'finalMinute', hasDisplayText: false, tone: 'attention' },
  confirming: { messageKey: 'confirming', hasDisplayText: true, tone: 'attention' },
  'ready-to-finalize': { messageKey: 'readyToFinalize', hasDisplayText: true, tone: 'positive' },
};

export function viewForPhase(phase: CyclePhase): PhaseView {
  return PHASE_VIEWS[phase] ?? PHASE_VIEWS.live;
}
