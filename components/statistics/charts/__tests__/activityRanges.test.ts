import {
  DAY_SECS,
  FALLBACK_LOOKBACK_SECS,
  HOUR_SECS,
  activePeriodsRange,
  defaultSpikeIndex,
  frequencyRange,
  gestureSpan,
  hasGestureBounds,
  spikeSearchRange,
  spikeViewRange,
} from '../activityRanges';

/** 2026-08-12 09:30 UTC. */
const LAST = Date.UTC(2026, 7, 12, 9, 30) / 1000;
const span = { firstTs: LAST - 400 * DAY_SECS, lastTs: LAST };

describe('activity ranges', () => {
  it('takes the indexed bounds when the API gives them, else the year before now', () => {
    expect(hasGestureBounds({ MinTs: 1, MaxTs: 2 })).toBe(true);
    expect(hasGestureBounds({ MinTs: 0, MaxTs: 2 })).toBe(false);
    expect(hasGestureBounds(undefined)).toBe(false);
    expect(gestureSpan({ MinTs: 10, MaxTs: 20 }, 99)).toEqual({ firstTs: 10, lastTs: 20 });
    expect(gestureSpan(undefined, LAST)).toEqual({
      firstTs: LAST - FALLBACK_LOOKBACK_SECS,
      lastTs: LAST,
    });
  });

  it('asks for a year of whole days, or a week of whole hours, to the latest gesture', () => {
    const daily = frequencyRange(span, 'day');
    expect(daily.intervalSecs).toBe(DAY_SECS);
    expect(daily.initTs % DAY_SECS).toBe(0);
    expect(LAST - daily.initTs).toBeLessThan(366 * DAY_SECS);
    expect(daily.finTs).toBe(LAST + DAY_SECS);
    const hourly = frequencyRange(span, 'hour');
    expect(hourly.initTs % HOUR_SECS).toBe(0);
    expect(LAST - hourly.initTs).toBeLessThanOrEqual(7 * DAY_SECS + HOUR_SECS);
  });

  it('never reaches back before the first gesture', () => {
    const young = { firstTs: LAST - 30 * DAY_SECS, lastTs: LAST };
    expect(frequencyRange(young, 'day').initTs).toBeLessThanOrEqual(young.firstTs);
    expect(frequencyRange(young, 'day').initTs).toBeGreaterThan(young.firstTs - DAY_SECS);
    expect(spikeSearchRange(young).initTs).toBe(young.firstTs);
    expect(activePeriodsRange(young)).toEqual({ initTs: young.firstTs, finTs: LAST + HOUR_SECS });
  });

  it('draws half a day on each side of a spike, on whole hours', () => {
    const view = spikeViewRange({ StartTs: LAST, EndTs: LAST + HOUR_SECS });
    expect(view.initTs % HOUR_SECS).toBe(0);
    expect(view.finTs % HOUR_SECS).toBe(0);
    expect(view.initTs).toBeLessThanOrEqual(LAST - 12 * HOUR_SECS);
    expect(view.finTs).toBeGreaterThanOrEqual(LAST + 13 * HOUR_SECS);
  });

  it('opens on the flagged recent spike, else the latest one', () => {
    const spikes = [
      { StartTs: 3, EndTs: 3 },
      { StartTs: 9, EndTs: 9 },
      { StartTs: 5, EndTs: 5 },
    ];
    expect(defaultSpikeIndex(spikes, 2)).toBe(2);
    expect(defaultSpikeIndex(spikes, -1)).toBe(1);
    expect(defaultSpikeIndex([], -1)).toBeNull();
  });
});
