import axios from 'axios';

import { get_dashboard_info, get_round_list, get_bid_list } from '../rounds';

jest.mock('axios', () => {
  const actual = jest.requireActual<typeof import('axios')>('axios');
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
    },
    isAxiosError: actual.isAxiosError,
  };
});
const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('rounds API', () => {
  describe('get_dashboard_info', () => {
    it('returns data on successful response', async () => {
      const mockData = { TotalRounds: 10, ActiveRound: 5 };
      mockedAxios.get.mockResolvedValue({ data: mockData });

      const result = await get_dashboard_info();

      expect(result).toEqual(mockData);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*statistics.*dashboard/),
      );
    });

    it('returns null on 400 response', async () => {
      const err = Object.assign(new Error('Bad Request'), {
        response: { status: 400 },
        isAxiosError: true,
      });
      mockedAxios.get.mockRejectedValue(err);

      const result = await get_dashboard_info();

      expect(result).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(get_dashboard_info()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_round_list', () => {
    it('returns array of rounds on successful response', async () => {
      const mockRounds = [
        {
          RoundNum: 1,
          Rounds: [{ RoundNum: 1, ClaimPrizeTx: null }],
        },
      ];
      mockedAxios.get.mockResolvedValue({
        data: { Rounds: mockRounds },
      });

      const result = await get_round_list();

      expect(Array.isArray(result)).toBe(true);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*rounds.*list/),
      );
    });

    it('returns empty array when Rounds is missing', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      const result = await get_round_list();

      expect(result).toEqual([]);
    });

    it('returns empty array on 400 response', async () => {
      const err = Object.assign(new Error('Bad Request'), {
        response: { status: 400 },
        isAxiosError: true,
      });
      mockedAxios.get.mockRejectedValue(err);

      const result = await get_round_list();

      expect(result).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(get_round_list()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_bid_list', () => {
    it('returns array of bids on successful response', async () => {
      const mockBids = [
        {
          EvtLogId: 1,
          Tx: {
            EvtLogId: 1,
            BlockNum: 100,
            TxId: 1,
            TxHash: '0xabc',
            TimeStamp: 1234567890,
            DateTime: '2023-01-01',
          },
        },
      ];
      mockedAxios.get.mockResolvedValue({
        data: { Bids: mockBids },
      });

      const result = await get_bid_list();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('EvtLogId', 1);
      expect(result[0]).toHaveProperty('TxHash', '0xabc');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*bid.*list/),
      );
    });

    it('returns empty array when Bids is missing', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });

      const result = await get_bid_list();

      expect(result).toEqual([]);
    });

    it('returns empty array on 400 response', async () => {
      const err = Object.assign(new Error('Bad Request'), {
        response: { status: 400 },
        isAxiosError: true,
      });
      mockedAxios.get.mockRejectedValue(err);

      const result = await get_bid_list();

      expect(result).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(get_bid_list()).rejects.toThrow('Network response was not OK');
    });
  });
});
