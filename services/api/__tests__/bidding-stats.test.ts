// lexicon-allow-start: service test fixtures mirror the backend-sealed API surface

import axios from 'axios';

import {
  get_bid_frequency,
  get_bid_time_bounds,
  get_bid_type_ratio,
  get_bidding_activity,
  get_top_bidder_active_periods,
} from '@/services/api/bidding-stats';

import { reportError } from '../../../utils/errors';

jest.mock('axios', () => {
  const actual = jest.requireActual<typeof import('axios')>('axios');
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      interceptors: { response: { use: jest.fn() } },
      defaults: {},
    },
    isAxiosError: actual.isAxiosError,
  };
});
jest.mock('../../../utils/errors', () => ({ reportError: jest.fn() }));
const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockReportError = reportError as jest.MockedFunction<typeof reportError>;

const makeAxiosError = (status: number) =>
  Object.assign(new Error(`HTTP ${status}`), { response: { status }, isAxiosError: true });

const bucket = (ts: number) => ({ BucketTs: ts, NumBids: 3, UniqueBidders: 2 });

const ratioBucket = (ts: number) => ({
  BucketTs: ts,
  EthBids: 3,
  RwalkBids: 1,
  CstBids: 2,
  TotalBids: 6,
  EthPct: 50,
  RwalkPct: 16.7,
  CstPct: 33.3,
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('bidding-stats API', () => {
  describe('get_bidding_activity', () => {
    it('fills in the requested window when the server omits it', async () => {
      mockedAxios.get.mockResolvedValue({ data: { FrequencyHistory: [bucket(100)] } });

      const result = await get_bidding_activity(100, 200, 10);

      expect(result).toMatchObject({ InitTs: 100, FinTs: 200, Interval: 10, RecentSpikeIndex: -1 });
      expect(result.FrequencyHistory).toHaveLength(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/statistics\/bidding\/activity\/100\/200\/10/),
      );
    });

    it('propagates a 500 instead of silently reconstructing the series', async () => {
      mockedAxios.get.mockRejectedValue(makeAxiosError(500));

      await expect(get_bidding_activity(100, 200, 10)).rejects.toThrow('HTTP 500');
    });
  });

  describe('get_bid_frequency', () => {
    it('returns the frequency buckets on success', async () => {
      mockedAxios.get.mockResolvedValue({ data: { FrequencyHistory: [bucket(1), bucket(2)] } });

      expect(await get_bid_frequency(1, 10, 1)).toHaveLength(2);
    });

    it('returns an empty series when the server sends none', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      expect(await get_bid_frequency(1, 10, 1)).toEqual([]);
    });

    it('reports a malformed bucket without failing the read', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { FrequencyHistory: [{ BucketTs: 'nope', NumBids: 1, UniqueBidders: 1 }] },
      });

      await expect(get_bid_frequency(1, 10, 1)).resolves.toHaveLength(1);
      expect(mockReportError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('schemaMismatch:bidFrequency'),
        }),
        'schema:bidFrequency',
      );
    });
  });

  describe('get_bid_time_bounds', () => {
    it('defaults missing bounds to zero', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      expect(await get_bid_time_bounds()).toEqual({ MinTs: 0, MaxTs: 0 });
    });

    it('forwards an abort signal to axios', async () => {
      const controller = new AbortController();
      mockedAxios.get.mockResolvedValue({ data: { MinTs: 1, MaxTs: 2 } });

      await get_bid_time_bounds({ signal: controller.signal });

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), {
        signal: controller.signal,
      });
    });
  });

  describe('get_bid_type_ratio', () => {
    it('returns the ratio history on success', async () => {
      mockedAxios.get.mockResolvedValue({ data: { RatioHistory: [ratioBucket(1)] } });

      const result = await get_bid_type_ratio(1, 100, 10);

      expect(result).toHaveLength(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/bid\/bid_type_ratio/), {
        params: { from_ts: 1, to_ts: 100, interval_secs: 10 },
      });
    });

    it('returns an empty series when the route is not deployed', async () => {
      mockedAxios.get.mockRejectedValue(makeAxiosError(404));

      expect(await get_bid_type_ratio(1, 100, 10)).toEqual([]);
    });

    it('propagates a 500 rather than showing an empty chart', async () => {
      mockedAxios.get.mockRejectedValue(makeAxiosError(500));

      await expect(get_bid_type_ratio(1, 100, 10)).rejects.toThrow('HTTP 500');
    });

    it('reports a malformed bucket without failing the read', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { RatioHistory: [{ ...ratioBucket(1), TotalBids: '6' }] },
      });

      await expect(get_bid_type_ratio(1, 100, 10)).resolves.toHaveLength(1);
      expect(mockReportError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining('schemaMismatch:bidTypeRatio'),
        }),
        'schema:bidTypeRatio',
      );
    });

    it('passes the abort signal alongside the query params', async () => {
      const controller = new AbortController();
      mockedAxios.get.mockResolvedValue({ data: { RatioHistory: [] } });

      await get_bid_type_ratio(1, 100, 10, { signal: controller.signal });

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), {
        signal: controller.signal,
        params: { from_ts: 1, to_ts: 100, interval_secs: 10 },
      });
    });
  });

  describe('get_top_bidder_active_periods', () => {
    it('sends the default grouping options and echoes the window back', async () => {
      mockedAxios.get.mockResolvedValue({ data: { TopBidders: [], ActivePeriods: [] } });

      const result = await get_top_bidder_active_periods(3, 10, 20);

      expect(result).toMatchObject({ InitTs: 10, FinTs: 20, TopN: 3, GapHours: 6, MinBids: 2 });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/top_active_periods\/3\/10\/20/),
        { params: { gap_hours: 6, min_bids: 2 } },
      );
    });

    it('accepts grouping overrides in the options object', async () => {
      mockedAxios.get.mockResolvedValue({ data: { TopBidders: [], ActivePeriods: [] } });

      await get_top_bidder_active_periods(3, 10, 20, { gapHours: 12, minBids: 5 });

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.any(String), {
        params: { gap_hours: 12, min_bids: 5 },
      });
    });
  });
});

// lexicon-allow-end
