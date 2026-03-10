import axios from 'axios';

import { get_user_info, get_user_balance, get_unique_bidders } from '@/services/api/users';

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

describe('users API', () => {
  describe('get_user_info', () => {
    it('returns user data on successful response', async () => {
      const mockUserData = {
        Addr: '0x1234567890123456789012345678901234567890',
        Bids: [],
        PrizeHistory: [],
      };
      mockedAxios.get.mockResolvedValue({ data: mockUserData });

      const result = await get_user_info('0x1234567890123456789012345678901234567890');

      expect(result).toBeDefined();
      expect(result?.Addr).toBe(mockUserData.Addr);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*user.*info/),
      );
    });

    it('flattens Tx in nested arrays', async () => {
      const mockUserData = {
        Addr: '0x1234',
        Bids: [
          {
            EvtLogId: 1,
            Tx: {
              EvtLogId: 1,
              TxHash: '0xabc',
              BlockNum: 100,
              TxId: 1,
              TimeStamp: 123,
              DateTime: '2023-01-01',
            },
          },
        ],
      };
      mockedAxios.get.mockResolvedValue({ data: mockUserData });

      const result = await get_user_info('0x1234');

      expect(result?.Bids).toHaveLength(1);
      expect(result?.Bids[0]).toHaveProperty('TxHash', '0xabc');
    });

    it('returns null on 400 response', async () => {
      const err = Object.assign(new Error('Bad Request'), {
        response: { status: 400 },
        isAxiosError: true,
      });
      mockedAxios.get.mockRejectedValue(err);

      const result = await get_user_info('0x1234');

      expect(result).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(get_user_info('0x1234567890123456789012345678901234567890')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_user_balance', () => {
    it('returns balance data on successful response', async () => {
      const mockBalance = {
        EthBalance: '1.5',
        CSTBalance: '100',
      };
      mockedAxios.get.mockResolvedValue({ data: mockBalance });

      const result = await get_user_balance('0x1234567890123456789012345678901234567890');

      expect(result).toEqual(mockBalance);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*user.*balances/),
      );
    });

    it('returns null on 400 response', async () => {
      const err = Object.assign(new Error('Bad Request'), {
        response: { status: 400 },
        isAxiosError: true,
      });
      mockedAxios.get.mockRejectedValue(err);

      const result = await get_user_balance('0x1234');

      expect(result).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(get_user_balance('0x1234567890123456789012345678901234567890')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_unique_bidders', () => {
    it('returns unique bidders on successful response', async () => {
      const mockBidders = ['0xaaa', '0xbbb', '0xccc'];
      mockedAxios.get.mockResolvedValue({
        data: { UniqueBidders: mockBidders },
      });

      const result = await get_unique_bidders();

      expect(result).toEqual(mockBidders);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*statistics.*unique.*bidders/),
      );
    });

    it('returns empty array on 400 response', async () => {
      const err = Object.assign(new Error('Bad Request'), {
        response: { status: 400 },
        isAxiosError: true,
      });
      mockedAxios.get.mockRejectedValue(err);

      const result = await get_unique_bidders();

      expect(result).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(get_unique_bidders()).rejects.toThrow('Network response was not OK');
    });
  });
});
