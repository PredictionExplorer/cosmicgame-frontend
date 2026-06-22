import {
  UX_SCENARIO_DEMO_ACCOUNT,
  getUxScenarioSnapshot,
  resetUxScenarioForTest,
  simulateUxScenarioGesture,
} from '../uxCycleScenarios';

describe('uxCycleScenarios', () => {
  const originalEnv = process.env.NEXT_PUBLIC_UX_SCENARIO;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_UX_SCENARIO = '';
    window.history.pushState({}, '', '/');
    resetUxScenarioForTest();
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_UX_SCENARIO = originalEnv;
    resetUxScenarioForTest();
  });

  it('creates a low-time scenario with an active countdown', () => {
    window.history.pushState({}, '', '/?uxScenario=live-low-time');

    const scenario = getUxScenarioSnapshot();

    expect(scenario?.name).toBe('live-low-time');
    expect(scenario).not.toBeNull();
    expect(scenario!.finalizationTimeSec - scenario!.currentTimeSec).toBe(3 * 60);
    expect(scenario!.dashboard.LastBidderAddr).not.toBe(UX_SCENARIO_DEMO_ACCOUNT);
    expect(scenario!.dashboard.TsRoundStart).toBeGreaterThan(0);
  });

  it('extends the low-time scenario when simulating a gesture', () => {
    window.history.pushState({}, '', '/?uxScenario=live-low-time');
    const before = getUxScenarioSnapshot()!;

    const after = simulateUxScenarioGesture({
      bidder: UX_SCENARIO_DEMO_ACCOUNT,
      gestureType: 'CST',
      message: 'Testing timer extension',
    });

    expect(after).not.toBeNull();
    expect(after!.finalizationTimeSec).toBe(before.finalizationTimeSec + before.extensionSeconds);
    expect(after!.dashboard.LastBidderAddr).toBe(UX_SCENARIO_DEMO_ACCOUNT);
    expect(after!.dashboard.CurNumBids).toBe(before.dashboard.CurNumBids + 1);
    expect(after!.gestures[0]?.Message).toBe('Testing timer extension');
  });

  it('uses the environment scenario when no query override is present', () => {
    process.env.NEXT_PUBLIC_UX_SCENARIO = 'final-ten';
    resetUxScenarioForTest();

    expect(getUxScenarioSnapshot()?.name).toBe('final-ten');
  });
});
