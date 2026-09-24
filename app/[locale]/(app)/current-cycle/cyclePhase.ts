import { viewForPhase } from '@/components/home/observatory/phaseView';
import {
  ZERO_ADDRESS,
  getCycleState,
  type CycleState,
  type CycleStateInput,
} from '@/lib/cycleState';

/** Badge tones the cycle's phase takes (a subset of `Badge`'s tones). */
export type CyclePhaseTone = 'neutral' | 'accent' | 'live' | 'attention' | 'positive';

/**
 * The phase's colour. Only the running clock is `live` (its dot breathes);
 * the final stretch, the zero-cross check and a finished clock are static
 * states, so nothing still reads "live" once the clock shows zero.
 */
const PHASE_TONE: Record<CycleState['phase'], CyclePhaseTone> = {
  loading: 'neutral',
  unavailable: 'neutral',
  'opening-soon': 'accent',
  'waiting-first-gesture': 'accent',
  live: 'live',
  approach: 'live',
  'final-hour': 'attention',
  'final-ten': 'attention',
  'final-minute': 'attention',
  confirming: 'attention',
  'ready-to-finalize': 'positive',
};

export type CycleCtaKey = 'viewHomeClock' | 'finalizeCycle' | 'makeFirstGesture' | 'makeGesture';

export interface CyclePhaseView {
  state: CycleState;
  /** Segment under `home.chrono.phase.*`: the home clock's own phase copy. */
  messageKey: string;
  tone: CyclePhaseTone;
  /** Epoch ms the clock counts down to, or null when no countdown runs. */
  countdownTargetMs: number | null;
  /** The clock reached zero: show the zeroed clock instead of a countdown. */
  showsZero: boolean;
  /**
   * The page's one action. Gestures open the home gesture form; the clock and
   * the finalize action live at the top of the home page.
   */
  cta: { key: CycleCtaKey; href: string };
}

export interface CyclePhaseInput extends Omit<CycleStateInput, 'loading'> {
  /** The dashboard's latest poll succeeded (see `useLiveFreshness`). */
  fresh: boolean;
}

/**
 * The /current-cycle reading of the cycle state. It runs the home clock's
 * phase machine (`getCycleState`) and names phases with the home clock's copy
 * (`home.chrono.phase.*`), so the two pages never disagree at the zero-cross.
 * Before the browser clock has ticked (`now` is 0 during server rendering) or
 * while the finalization time is unknown, the phase is `loading`, not a guess.
 */
export function cyclePhaseView({ fresh, ...input }: CyclePhaseInput): CyclePhaseView {
  const hasLastParticipant =
    !!input.data && input.data.TsRoundStart !== 0 && input.data.LastBidderAddr !== ZERO_ADDRESS;
  const loading = input.now <= 0 || (hasLastParticipant && input.allocationTime <= 0);
  const state = getCycleState({ ...input, loading });
  const baseTone = PHASE_TONE[state.phase];
  // The live dot breathes only while the last poll succeeded.
  const tone: CyclePhaseTone = baseTone === 'live' && !fresh ? 'neutral' : baseTone;

  const countdownTargetMs = state.isOpeningSoon
    ? (state.activationTime ?? 0) * 1000
    : state.isFinalizationCountdownActive
      ? input.allocationTime
      : null;

  const cta: CyclePhaseView['cta'] = state.isOpeningSoon
    ? { key: 'viewHomeClock', href: '/' }
    : state.isReadyToFinalize
      ? { key: 'finalizeCycle', href: '/' }
      : state.isWaitingForFirstGesture
        ? { key: 'makeFirstGesture', href: '/#make-gesture' }
        : { key: 'makeGesture', href: '/#make-gesture' };

  return {
    state,
    messageKey: viewForPhase(state.phase).messageKey,
    tone,
    countdownTargetMs,
    showsZero: state.isConfirmingFinalization || state.isReadyToFinalize,
    cta,
  };
}
