/**
 * A Calibration Window as the contract reports it: its stored length and the
 * seconds elapsed since it opened (negative before the cycle activates), read
 * at `readAtMs`.
 */
export interface CalibrationWindowReading {
  durationSeconds: number;
  elapsedSeconds: number;
  readAtMs: number;
}

export type CalibrationWindowState = 'notStarted' | 'running' | 'complete' | 'closed';

export interface CalibrationWindowStatus {
  state: CalibrationWindowState;
  /** The window's stored length in seconds. */
  durationSeconds: number;
  /** Seconds elapsed now, clamped to the window. */
  elapsedSeconds: number;
  /** Seconds left while running; 0 otherwise. */
  remainingSeconds: number;
  /** Share of the window elapsed, 0 to 1. */
  progress: number;
}

/**
 * Where a window stands `nowMs`, advancing the reading by the time since it
 * was taken. `closedEarly` marks the ETH window once the cycle has a gesture:
 * the contract prices only the cycle's first ETH gesture on the window, so
 * later gestures follow the step-up however long the window has left.
 */
export function calibrationWindowStatus(
  reading: CalibrationWindowReading,
  nowMs: number,
  { closedEarly = false }: { closedEarly?: boolean } = {},
): CalibrationWindowStatus {
  const duration = Math.max(0, reading.durationSeconds);
  const elapsed = reading.elapsedSeconds + Math.max(0, nowMs - reading.readAtMs) / 1000;
  if (closedEarly) {
    return {
      state: 'closed',
      durationSeconds: duration,
      elapsedSeconds: Math.min(Math.max(0, elapsed), duration),
      remainingSeconds: 0,
      progress: 1,
    };
  }
  if (elapsed < 0) {
    return {
      state: 'notStarted',
      durationSeconds: duration,
      elapsedSeconds: 0,
      remainingSeconds: duration,
      progress: 0,
    };
  }
  if (duration === 0 || elapsed >= duration) {
    return {
      state: 'complete',
      durationSeconds: duration,
      elapsedSeconds: duration,
      remainingSeconds: 0,
      progress: 1,
    };
  }
  return {
    state: 'running',
    durationSeconds: duration,
    elapsedSeconds: elapsed,
    remainingSeconds: duration - elapsed,
    progress: elapsed / duration,
  };
}
