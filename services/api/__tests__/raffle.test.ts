import axios from 'axios';

import {
  get_raffle_deposits_by_user,
  get_chrono_warrior_deposits_by_user,
  get_unclaimed_raffle_deposits_by_user,
  get_raffle_nft_winners_list,
  get_raffle_nft_winners_by_round,
  get_raffle_nft_winnings_by_user,
} from '@/services/api/raffle';

jest.mock('axios', () => {
  const actual = jest.requireActual<typeof import('axios')>('axios');
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      interceptors: { response: { use: jest.fn() } },
    },
    isAxiosError: actual.isAxiosError,
  };
});
jest.mock('../../../utils/errors', () => ({ reportError: jest.fn() }));
const mockedAxios = axios as jest.Mocked<typeof axios>;

const make400 = () =>
  Object.assign(new Error('Bad Request'), {
    response: { status: 400 },
    isAxiosError: true,
  });

const TX = { EvtLogId: 1, BlockNum: 1, TxId: 1, TxHash: '0xa', TimeStamp: 1, DateTime: '' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('raffle API', () => {
  describe('get_raffle_deposits_by_user', () => {
    it('returns flattened deposits on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { UserRaffleDeposits: [{ EvtLogId: 1, Tx: TX }] },
      });
      const result = await get_raffle_deposits_by_user('0xabc');
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('TxHash', '0xa');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/prizes.*deposits.*raffle.*by_user.*0xabc/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_raffle_deposits_by_user('0xabc')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_raffle_deposits_by_user('0xabc')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_chrono_warrior_deposits_by_user', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { UserChronoWarriorDeposits: [] } });
      await get_chrono_warrior_deposits_by_user('0xdef');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(
          /prizes.*deposits.*chrono_warrior.*by_user.*0xdef/,
        ),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_chrono_warrior_deposits_by_user('0xdef')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_chrono_warrior_deposits_by_user('0xdef')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_unclaimed_raffle_deposits_by_user', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { UnclaimedDeposits: [] } });
      await get_unclaimed_raffle_deposits_by_user('0xghi');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/prizes.*deposits.*unclaimed.*by_user.*0xghi/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_unclaimed_raffle_deposits_by_user('0xghi')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_unclaimed_raffle_deposits_by_user('0xghi')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_raffle_nft_winners_list', () => {
    it('returns flattened winners on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { RaffleNFTWinners: [{ EvtLogId: 2, Tx: { ...TX, TxHash: '0xb' } }] },
      });
      const result = await get_raffle_nft_winners_list();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('TxHash', '0xb');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/raffle.*nft.*all.*list/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_raffle_nft_winners_list()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_raffle_nft_winners_list()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_raffle_nft_winners_by_round', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { RaffleNFTWinners: [] } });
      await get_raffle_nft_winners_by_round(4);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/raffle.*nft.*by_round.*4/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_raffle_nft_winners_by_round(4)).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_raffle_nft_winners_by_round(4)).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_raffle_nft_winnings_by_user', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { UserRaffleNFTWinnings: [] } });
      await get_raffle_nft_winnings_by_user('0xwinner');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/raffle.*nft.*by_user.*0xwinner/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_raffle_nft_winnings_by_user('0xwinner')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_raffle_nft_winnings_by_user('0xwinner')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });
});
