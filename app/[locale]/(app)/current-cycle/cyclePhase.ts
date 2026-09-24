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
   * the finalize action live at the top of the home page. `commit` actions
   * take the commit gradient; `neutral` ones (only looking) take the outline.
   */
  cta: { key: CycleCtaKey; href: string; emphasis: 'commit' | 'neutral' };
}

export interface CyclePhaseInput extends Omit<CycleStateInput, 'loading'> {
  /** The dashboard's latest poll succeeded (see `useLiveFreshness`). */
  fresh: boolean;
  /** The connected wallet, if any. */
  account?: string | null;
  /**
   * Epoch ms from which anyone may finalize (the finalization time plus the
   * contract's timeout for the latest participant), or null while unknown.
   */
  openFinalizationMs?: number | null;
}

/**
 * Whether this viewer can finalize now: the latest participant as soon as
 * the clock reaches zero, anyone once open finalization begins.
 */
function mayFinalize({
  account,
  openFinalizationMs,
  data,
  now,
}: Pick<CyclePhaseInput, 'account' | 'openFinalizationMs' | 'data' | 'now'>): boolean {
  const latest = data?.LastBidderAddr;
  if (account && latest && account.toLowerCase() === latest.toLowerCase()) return true;
  return (
    typeof openFinalizationMs === 'number' && openFinalizationMs > 0 && now >= openFinalizationMs
  );
}

/**
 * The /current-cycle reading of the cycle state. It runs the home clock's
 * phase machine (`getCycleState`) and names phases with the home clock's copy
 * (`home.chrono.phase.*`), so the two pages never disagree at the zero-cross.
 * Before the browser clock has ticked (`now` is 0 during server rendering) or
 * while the finalization time is unknown, the phase is `loading`, not a guess.
 */
export function cyclePhaseView({
  fresh,
  account,
  openFinalizationMs,
  ...input
}: CyclePhaseInput): CyclePhaseView {
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

  // At zero only the latest participant may finalize until open finalization
  // begins; everyone else is sent to the home clock, which counts down to it.
  const homeClock = { key: 'viewHomeClock', href: '/', emphasis: 'neutral' } as const;
  const cta: CyclePhaseView['cta'] = state.isOpeningSoon
    ? homeClock
    : state.isReadyToFinalize
      ? mayFinalize({ account, openFinalizationMs, data: input.data, now: input.now })
        ? { key: 'finalizeCycle', href: '/', emphasis: 'commit' }
        : homeClock
      : state.isWaitingForFirstGesture
        ? { key: 'makeFirstGesture', href: '/#make-gesture', emphasis: 'commit' }
        : { key: 'makeGesture', href: '/#make-gesture', emphasis: 'commit' };

  return {
    state,
    messageKey: viewForPhase(state.phase).messageKey,
    tone,
    countdownTargetMs,
    showsZero: state.isConfirmingFinalization || state.isReadyToFinalize,
    cta,
  };
}
