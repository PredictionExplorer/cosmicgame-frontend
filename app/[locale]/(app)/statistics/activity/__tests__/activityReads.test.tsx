// lexicon-allow-start: analytics fixtures and reads mirror sealed backend wire names
import {
  get_bid_frequency,
  get_bid_time_bounds,
  get_bidding_activity,
  get_top_bidder_active_periods,
} from '@/services/api/bidding-stats';
import {
  ACTIVE_PERIODS_TOP_N,
  activePeriodsRange,
  frequencyRange,
  gestureSpan,
  spikeSearchRange,
  spikeViewRange,
} from '@/components/statistics/charts/activityRanges';

import { readSystemModes } from '../../../publicDataReads';
import { readActivity } from '../activityReads';

jest.mock('@/services/api/bidding-stats', () => ({
  get_bid_time_bounds: jest.fn(),
  get_bid_frequency: jest.fn(),
  get_bidding_activity: jest.fn(),
  get_top_bidder_active_periods: jest.fn(),
}));
jest.mock('../../../publicDataReads', () => ({
  readSystemModes: jest.fn(),
  readDashboard: jest.fn(async () => ({ data: { MainStats: { TotalBids: 3_186 } }, at: 0 })),
}));

const HOUR = 3_600;
const DAY = 86_400;
/** 2026-08-12 00:00 UTC, the latest gesture; the first came 30 days before. */
const LAST = Date.UTC(2026, 7, 12) / 1000;
const FIRST = LAST - 30 * DAY;
const PARTICIPANT = '0x7406B34d25A9B7841CAC133E3173919e0af6Bc6c';

const mockBounds = get_bid_time_bounds as jest.Mock;
const mockFrequency = get_bid_frequency as jest.Mock;
const mockSpikes = get_bidding_activity as jest.Mock;
const mockPeriods = get_top_bidder_active_periods as jest.Mock;
const mockModes = readSystemModes as jest.Mock;

function answerLikeTheApi() {
  mockBounds.mockResolvedValue({ MinTs: FIRST, MaxTs: LAST });
  mockFrequency.mockImplementation(async (initTs: number, _finTs: number, interval: number) =>
    interval === DAY
      ? [{ BucketTs: LAST - DAY, NumBids: 1_234, UniqueBidders: 56 }]
      : [{ BucketTs: LAST - 10 * HOUR, NumBids: 34, UniqueBidders: 9 }],
  );
  mockSpikes.mockResolvedValue({
    InitTs: FIRST,
    FinTs: LAST + HOUR,
    Interval: HOUR,
    FrequencyHistory: [{ BucketTs: LAST - HOUR, NumBids: 1, UniqueBidders: 1 }],
    Spikes: [{ StartTs: LAST - 10 * HOUR, EndTs: LAST - 10 * HOUR, PeakCount: 34, TotalBids: 34 }],
    RecentSpikeIndex: -1,
    RecentWindowSecs: 0,
  });
  mockPeriods.mockResolvedValue({
    InitTs: FIRST,
    FinTs: LAST + HOUR,
    TopN: 20,
    GapHours: 6,
    MinBids: 1,
    TopBidders: [{ BidderAddr: PARTICIPANT, NumBids: 819 }],
    ActivePeriods: [
      { BidderAddr: PARTICIPANT, StartTs: LAST - 2 * DAY, EndTs: LAST - DAY, NumBids: 819 },
    ],
  });
  mockModes.mockResolvedValue({ data: [], at: 0 });
}

describe('readActivity', () => {
  const previous = process.env.PLAYWRIGHT;
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.PLAYWRIGHT;
    answerLikeTheApi();
  });
  afterAll(() => {
    if (previous === undefined) delete process.env.PLAYWRIGHT;
    else process.env.PLAYWRIGHT = previous;
  });

  it('seeds the bounds, the log and every all-time chart, and keeps the render five minutes', async () => {
    const { seeds, cacheWindow } = await readActivity();
    expect(seeds.map((seed) => seed.queryKey[0])).toEqual([
      'bidTimeBounds',
      'systemModelist',
      'bidFrequency',
      'biddingActivity',
      'topBidderActivePeriods',
      'bidFrequency',
    ]);
    expect(cacheWindow).toBe('live');
  });

  it('hands the dashboard to the page for the every-gesture total', async () => {
    const { dashboard } = await readActivity();
    expect(dashboard).toEqual({ MainStats: { TotalBids: 3_186 } });
  });

  it('leaves the hourly history out of the spikes’ seed', async () => {
    const { seeds } = await readActivity();
    const spikes = seeds.find((seed) => seed.queryKey[0] === 'biddingActivity');
    expect(spikes?.data).toMatchObject({ FrequencyHistory: [], RecentSpikeIndex: -1 });
    expect((spikes?.data as { Spikes: unknown[] }).Spikes).toHaveLength(1);
  });

  // The seeds land under the keys the charts' hooks build: both take their ranges from
  // activityRanges (the chart tests pin the hooks' side).
  it('keys each chart’s seed by the range the chart asks for', async () => {
    const { seeds } = await readActivity();
    const span = gestureSpan({ MinTs: FIRST, MaxTs: LAST }, 0);
    const daily = frequencyRange(span, 'day');
    const search = spikeSearchRange(span);
    const periods = activePeriodsRange(span);
    const view = spikeViewRange({ StartTs: LAST - 10 * HOUR, EndTs: LAST - 10 * HOUR });
    expect(seeds.map((seed) => seed.queryKey)).toEqual([
      ['bidTimeBounds'],
      ['systemModelist'],
      ['bidFrequency', daily.initTs, daily.finTs, DAY],
      ['biddingActivity', search.initTs, search.finTs, HOUR],
      ['topBidderActivePeriods', ACTIVE_PERIODS_TOP_N, periods.initTs, periods.finTs],
      ['bidFrequency', view.initTs, view.finTs, HOUR],
    ]);
  });

  it('seeds no chart when the bounds cannot be read, and keeps the render a minute', async () => {
    mockBounds.mockRejectedValue(new Error('Network response was not OK'));
    const { seeds, cacheWindow } = await readActivity();
    expect(seeds.map((seed) => seed.queryKey[0])).toEqual(['systemModelist']);
    expect(mockFrequency).not.toHaveBeenCalled();
    expect(cacheWindow).toBe('pending');
  });

  it('keeps a render with a failed chart read a minute', async () => {
    mockPeriods.mockRejectedValue(new Error('Network response was not OK'));
    const { seeds, cacheWindow } = await readActivity();
    expect(seeds.some((seed) => seed.queryKey[0] === 'topBidderActivePeriods')).toBe(false);
    expect(cacheWindow).toBe('pending');
  });

  it('reads nothing under the e2e harness, whose browser mocks the API', async () => {
    process.env.PLAYWRIGHT = '1';
    await expect(readActivity()).resolves.toEqual({
      seeds: [],
      dashboard: null,
      cacheWindow: 'pending',
    });
    expect(mockBounds).not.toHaveBeenCalled();
  });
});
// lexicon-allow-end
