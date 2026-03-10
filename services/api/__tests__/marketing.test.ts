import axios from 'axios';

import { get_marketing_rewards, get_marketing_rewards_by_user } from '@/services/api/marketing';

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

const make400 = () =>
  Object.assign(new Error('Bad Request'), {
    response: { status: 400 },
    isAxiosError: true,
  });

const TX = { EvtLogId: 1, BlockNum: 10, TxId: 1, TxHash: '0xabc', TimeStamp: 100, DateTime: '' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('marketing API', () => {
  describe('get_marketing_rewards', () => {
    it('returns flattened rewards on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { MarketingRewards: [{ EvtLogId: 1, Tx: TX }] },
      });

      const result = await get_marketing_rewards();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('TxHash', '0xabc');
      expect(result[0]).not.toHaveProperty('Tx');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*marketing.*rewards.*global/),
      );
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());

      const result = await get_marketing_rewards();

      expect(result).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(get_marketing_rewards()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_marketing_rewards_by_user', () => {
    it('returns flattened user rewards on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { UserMarketingRewards: [{ EvtLogId: 2, Amount: '100' }] },
      });

      const result = await get_marketing_rewards_by_user('0xuser');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('EvtLogId', 2);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*marketing.*rewards.*by_user.*0xuser/),
      );
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());

      const result = await get_marketing_rewards_by_user('0xuser');

      expect(result).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      await expect(get_marketing_rewards_by_user('0xuser')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });
});
