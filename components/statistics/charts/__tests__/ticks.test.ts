import {
  durationScale,
  elapsedTicks,
  linearScale,
  niceStep,
  timeAxisTicks,
  timeStep,
  timeTicks,
} from '../ticks';
import { formatDateRange, formatMonthDay, formatTimeTick } from '../labels';

const DAY = 86_400;
const HOUR = 3_600;
/** 2026-08-12 00:00 UTC. */
const AUG_12 = Date.UTC(2026, 7, 12) / 1000;

describe('chart ticks', () => {
  it('steps figures on 1-2-5 multiples', () => {
    expect(niceStep(100, 4)).toBe(50);
    expect(niceStep(7, 4)).toBe(2);
    expect(niceStep(0.9, 3)).toBe(0.5);
    expect(linearScale(0, 64_393, 4)).toEqual({
      ticks: [0, 20_000, 40_000, 60_000, 80_000],
      domain: [0, 80_000],
    });
  });

  it('keeps a figure axis around its data rather than from zero', () => {
    const { ticks } = linearScale(20_500, 79_900, 4);
    expect(ticks[0]).toBe(20_000);
    expect(ticks[ticks.length - 1]).toBe(80_000);
  });

  it('puts duration ticks on whole hours', () => {
    // A window between 1.4h and 8.7h: whole-hour ticks, never "1.4h / 3.2h".
    const { ticks } = durationScale(1.4 * HOUR, 8.7 * HOUR, 4);
    for (const tick of ticks) expect(tick % HOUR).toBe(0);
    expect(ticks[0]).toBeLessThanOrEqual(1.4 * HOUR);
    expect(ticks[ticks.length - 1]).toBeGreaterThanOrEqual(8.7 * HOUR);
  });

  it('ends elapsed ticks inside the range on whole days', () => {
    expect(elapsedTicks(43 * DAY, 6)).toEqual([0, 14 * DAY, 28 * DAY, 42 * DAY]);
    expect(elapsedTicks(43 * DAY, 8)).toEqual([
      0,
      7 * DAY,
      14 * DAY,
      21 * DAY,
      28 * DAY,
      35 * DAY,
      42 * DAY,
    ]);
    expect(elapsedTicks(0)).toEqual([0]);
  });

  it('picks a calendar step from the span and ticks on UTC boundaries', () => {
    expect(timeStep(AUG_12, AUG_12 + 20 * HOUR, 6)).toEqual({ unit: 'hour', size: 6 });
    expect(timeStep(AUG_12, AUG_12 + 5 * DAY, 6)).toEqual({ unit: 'day', size: 1 });
    expect(timeStep(AUG_12, AUG_12 + 140 * DAY, 6)).toEqual({ unit: 'month', size: 1 });
    const ticks = timeTicks(AUG_12 + 5 * HOUR, AUG_12 + 3 * DAY, { unit: 'day', size: 1 });
    expect(ticks).toEqual([AUG_12 + DAY, AUG_12 + 2 * DAY, AUG_12 + 3 * DAY]);
  });
});

describe('chart labels', () => {
  it('labels a date tick in the locale’s short form', () => {
    expect(formatMonthDay(AUG_12, 'en')).toBe('Aug 12');
    // Zero-padded DD/MM, as the readouts' full DD/MM/YYYY dates beside them (V431).
    expect(formatMonthDay(AUG_12, 'vi')).toBe('12/08');
    expect(formatMonthDay(AUG_12, 'ja')).toMatch(/8月12日/);
  });

  it('shows the hour on an hourly axis and the date at midnight', () => {
    const step = { unit: 'hour', size: 6 } as const;
    expect(formatTimeTick(AUG_12 + 6 * HOUR, step, 'en')).toBe('06:00');
    expect(formatTimeTick(AUG_12, step, 'en')).toBe('Aug 12');
  });

  it('writes a range with its year once', () => {
    const range = formatDateRange(AUG_12, AUG_12 + 43 * DAY, 'en');
    expect(range).toMatch(/Aug 12/);
    expect(range).toMatch(/Sep 24/);
    expect(range.match(/2026/g)).toHaveLength(1);
    expect(formatDateRange(AUG_12, AUG_12 + 43 * DAY, 'vi')).toBe('12/08 – 24/09/2026');
    expect(formatDateRange(AUG_12 - 300 * DAY, AUG_12, 'vi')).toBe('16/10/2025 – 12/08/2026');
  });
});

describe('timeAxisTicks', () => {
  it('never leaves a date axis with a single tick', () => {
    // Regression: Aug 12 – Sep 24 at a phone's three ticks drew only "Sep 2026".
    const from = Date.UTC(2026, 7, 12) / 1000;
    const to = Date.UTC(2026, 8, 24) / 1000;
    expect(timeTicks(from, to, timeStep(from, to, 3))).toHaveLength(1);
    const { step, ticks } = timeAxisTicks(from, to, 3);
    expect(step.unit).toBe('day');
    expect(ticks.length).toBeGreaterThanOrEqual(2);
    expect(ticks.length).toBeLessThanOrEqual(4);
  });

  it('keeps the chosen step when it already shows two ticks', () => {
    const from = Date.UTC(2026, 0, 1) / 1000;
    const to = Date.UTC(2026, 11, 31) / 1000;
    expect(timeAxisTicks(from, to, 6)).toEqual({
      step: timeStep(from, to, 6),
      ticks: timeTicks(from, to, timeStep(from, to, 6)),
    });
  });
});
