import { calibrationWindowStatus } from '../components/calibrationWindow';

const reading = (durationSeconds: number, elapsedSeconds: number) => ({
  durationSeconds,
  elapsedSeconds,
  readAtMs: 1_000_000,
});

describe('calibrationWindowStatus', () => {
  it('reads a window part-way through as running, with the time left and its progress', () => {
    expect(calibrationWindowStatus(reading(43_200, 10_800), 1_000_000)).toEqual({
      state: 'running',
      durationSeconds: 43_200,
      elapsedSeconds: 10_800,
      remainingSeconds: 32_400,
      progress: 0.25,
    });
  });

  it('advances the reading by the time since it was taken', () => {
    const status = calibrationWindowStatus(reading(100, 10), 1_000_000 + 30_000);
    expect(status.elapsedSeconds).toBe(40);
    expect(status.remainingSeconds).toBe(60);
  });

  it('never reports more time elapsed than the window has: a finished window is complete', () => {
    // The contract keeps counting past the window's end; the page once showed an
    // elapsed time longer than the duration it sat next to.
    expect(calibrationWindowStatus(reading(7_200, 3_650_000), 1_000_000)).toEqual({
      state: 'complete',
      durationSeconds: 7_200,
      elapsedSeconds: 7_200,
      remainingSeconds: 0,
      progress: 1,
    });
  });

  it('completes a running window once the clock passes its end', () => {
    expect(calibrationWindowStatus(reading(60, 50), 1_000_000 + 20_000).state).toBe('complete');
  });

  it('reads a window that has not opened yet (negative elapsed) as not started', () => {
    expect(calibrationWindowStatus(reading(600, -120), 1_000_000)).toMatchObject({
      state: 'notStarted',
      elapsedSeconds: 0,
      remainingSeconds: 600,
      progress: 0,
    });
  });

  it('closes the ETH window once the cycle has a gesture, however long it has left', () => {
    expect(
      calibrationWindowStatus(reading(7_200, 600), 1_000_000, { closedEarly: true }),
    ).toMatchObject({ state: 'closed', remainingSeconds: 0, progress: 1, elapsedSeconds: 600 });
  });

  it('treats a zero-length window as complete rather than dividing by zero', () => {
    const status = calibrationWindowStatus(reading(0, 0), 1_000_000);
    expect(status.state).toBe('complete');
    expect(Number.isFinite(status.progress)).toBe(true);
  });
});
