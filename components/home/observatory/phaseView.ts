import type { CyclePhase } from '@/lib/cycleState';

/**
 * The state colour of a phase. Colour belongs to live state: it goes on the
 * phase word and on the clock at zero, never on a static label, and always
 * travels with a word (docs/design-system.md, "Live state").
 */
export type PhaseTone = 'neutral' | 'live' | 'attention' | 'positive';

/**
 * Per-phase treatment for the cycle clock and its satellites (the header
 * strip, the action dock, the announcer and the cycle page). Message keys
 * resolve under `home.chrono.phase.*`, the single source of phase copy. Which
 * phases replace the figures with a word is the clock's own decision (a
 * countdown runs only before the cycle opens and while it counts down).
 */
export interface PhaseView {
  /** Message key segment under `home.chrono.phase.*`. */
  messageKey: string;
  tone: PhaseTone;
}

/** Text colour for a phase word, from the palette-tuned state tokens. */
export const PHASE_TEXT_CLASS: Record<PhaseTone, string> = {
  neutral: 'text-muted-foreground',
  live: 'text-live',
  attention: 'text-attention',
  positive: 'text-positive',
};

const VIEWS: Record<CyclePhase, PhaseView> = {
  loading: { messageKey: 'loading', tone: 'neutral' },
  unavailable: { messageKey: 'unavailable', tone: 'neutral' },
  'opening-soon': { messageKey: 'openingSoon', tone: 'neutral' },
  'waiting-first-gesture': { messageKey: 'waitingFirstGesture', tone: 'live' },
  live: { messageKey: 'live', tone: 'live' },
  approach: { messageKey: 'approach', tone: 'live' },
  // One urgency cue: the phase word turns to --attention; the figures keep
  // their size and colour.
  'final-hour': { messageKey: 'finalHour', tone: 'attention' },
  'final-ten': { messageKey: 'finalTen', tone: 'attention' },
  'final-minute': { messageKey: 'finalMinute', tone: 'attention' },
  confirming: { messageKey: 'confirming', tone: 'neutral' },
  'ready-to-finalize': { messageKey: 'readyToFinalize', tone: 'positive' },
};

export function viewForPhase(phase: CyclePhase): PhaseView {
  return VIEWS[phase] ?? VIEWS.live;
}
