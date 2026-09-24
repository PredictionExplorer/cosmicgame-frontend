import type { CyclePhase } from '@/lib/cycleState';

/**
 * The state colour of a phase. Colour belongs to live state: it goes on the
 * phase word and on the clock at zero, never on a static label, and always
 * travels with a word (docs/design-system.md, "Live state").
 */
export type PhaseTone = 'neutral' | 'live' | 'attention' | 'positive';

/**
 * Per-phase treatment for the cycle clock and its satellites (the header
 * strip and the action dock). Message keys resolve under `home.chrono.phase.*`,
 * the single source of phase copy.
 */
export interface PhaseView {
  /** Message key segment under `home.chrono.phase.*`. */
  messageKey: string;
  /** Whether this phase shows a word at the clock's size instead of a countdown. */
  hasDisplayText: boolean;
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
  // One urgency cue: the phase word turns to --attention; the figures keep
  // their size and colour.
  'final-hour': { messageKey: 'finalHour', hasDisplayText: false, tone: 'attention' },
  'final-ten': { messageKey: 'finalTen', hasDisplayText: false, tone: 'attention' },
  'final-minute': { messageKey: 'finalMinute', hasDisplayText: false, tone: 'attention' },
  confirming: { messageKey: 'confirming', hasDisplayText: true, tone: 'neutral' },
  'ready-to-finalize': { messageKey: 'readyToFinalize', hasDisplayText: true, tone: 'positive' },
};

export function viewForPhase(phase: CyclePhase): PhaseView {
  return VIEWS[phase] ?? VIEWS.live;
}
