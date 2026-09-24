import { cyclePhaseView, type CyclePhaseInput } from '../cyclePhase';

const NOW = 1_800_000_000_000;
const HOUR = 3_600_000;
const PARTICIPANT = '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12';
const ZERO = '0x0000000000000000000000000000000000000000';

const live = (overrides: Partial<CyclePhaseInput> = {}): CyclePhaseInput => ({
  data: { TsRoundStart: NOW / 1000 - 10 * 3600, LastBidderAddr: PARTICIPANT },
  allocationTime: NOW + 20 * HOUR,
  activationTime: NOW / 1000 - 11 * 3600,
  now: NOW,
  finalizationConfirmed: true,
  fresh: true,
  ...overrides,
});

describe('cyclePhaseView', () => {
  it('is live while the clock runs, with a countdown and the gesture action', () => {
    const view = cyclePhaseView(live());
    expect(view.state.phase).toBe('live');
    expect(view.messageKey).toBe('live');
    expect(view.tone).toBe('live');
    expect(view.countdownTargetMs).toBe(NOW + 20 * HOUR);
    expect(view.showsZero).toBe(false);
    expect(view.cta).toEqual({ key: 'makeGesture', href: '/#make-gesture' });
  });

  it('stops breathing when the last poll failed, but keeps the phase', () => {
    const view = cyclePhaseView(live({ fresh: false }));
    expect(view.state.phase).toBe('live');
    expect(view.tone).toBe('neutral');
  });

  it('never calls the zero-cross live: confirming is a static attention state', () => {
    const view = cyclePhaseView(live({ allocationTime: NOW - 1000, finalizationConfirmed: false }));
    expect(view.state.phase).toBe('confirming');
    expect(view.messageKey).toBe('confirming');
    expect(view.tone).toBe('attention');
    expect(view.countdownTargetMs).toBeNull();
    expect(view.showsZero).toBe(true);
    // Gestures remain possible until finalization executes.
    expect(view.cta.key).toBe('makeGesture');
  });

  it('is ready to finalize once the chain confirms the zero-cross', () => {
    const view = cyclePhaseView(live({ allocationTime: NOW - 1000 }));
    expect(view.state.phase).toBe('ready-to-finalize');
    expect(view.tone).toBe('positive');
    expect(view.showsZero).toBe(true);
    expect(view.cta).toEqual({ key: 'finalizeCycle', href: '/' });
  });

  it('marks the final hour as needing attention', () => {
    expect(cyclePhaseView(live({ allocationTime: NOW + 30 * 60_000 })).tone).toBe('attention');
  });

  it('counts down to the opening before a cycle opens', () => {
    const opensAt = NOW / 1000 + 3600;
    const view = cyclePhaseView(
      live({ data: { TsRoundStart: 0, LastBidderAddr: ZERO }, activationTime: opensAt }),
    );
    expect(view.state.phase).toBe('opening-soon');
    expect(view.countdownTargetMs).toBe(opensAt * 1000);
    expect(view.cta).toEqual({ key: 'viewHomeClock', href: '/' });
  });

  it('asks for the first gesture when the cycle is open and empty', () => {
    const view = cyclePhaseView(
      live({ data: { TsRoundStart: 0, LastBidderAddr: ZERO }, activationTime: NOW / 1000 - 60 }),
    );
    expect(view.state.phase).toBe('waiting-first-gesture');
    expect(view.countdownTargetMs).toBeNull();
    expect(view.cta.key).toBe('makeFirstGesture');
  });

  it('does not guess before the browser clock ticks (server render)', () => {
    const view = cyclePhaseView(live({ now: 0 }));
    expect(view.state.phase).toBe('loading');
    expect(view.countdownTargetMs).toBeNull();
    expect(view.tone).toBe('neutral');
  });

  it('does not call a cycle finished while its finalization time is unknown', () => {
    expect(cyclePhaseView(live({ allocationTime: 0 })).state.phase).toBe('loading');
  });
});
