import axios from 'axios';

import {
  get_donations_cg_simple_list,
  get_donations_cg_simple_by_round,
  get_donations_cg_with_info_list,
  get_donations_cg_with_info_by_round,
  get_donations_with_info_by_id,
  get_donations_eth_by_user,
  get_donations_both_by_round,
  get_donations_both,
  get_charity_donations_deposits,
  get_charity_cg_deposits,
  get_charity_voluntary,
  get_charity_withdrawals,
  get_donations_nft_list,
  get_donated_nft_info,
  get_donated_nft_claims_all,
  get_claimed_donated_nft_by_user,
  get_nft_donation_stats,
  get_donations_nft_by_round,
  get_donations_nft_unclaimed_by_round,
  get_unclaimed_donated_nft_by_user,
  get_donations_erc20_by_round,
  get_donations_erc20_by_user,
} from '@/services/api/donations';

jest.mock('axios', () => {
  const actual = jest.requireActual<typeof import('axios')>('axios');
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
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

const TX = { EvtLogId: 1, BlockNum: 1, TxId: 1, TxHash: '0xa', TimeStamp: 1, DateTime: '' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('donations API', () => {
  describe('get_donations_cg_simple_list', () => {
    it('returns flattened donations on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { DirectCGDonations: [{ EvtLogId: 1, Tx: TX }] },
      });
      const result = await get_donations_cg_simple_list();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('TxHash', '0xa');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*eth.*simple.*list/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_donations_cg_simple_list()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));
      await expect(get_donations_cg_simple_list()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_donations_cg_simple_by_round', () => {
    it('calls correct endpoint with round number', async () => {
      mockedAxios.get.mockResolvedValue({ data: { DirectCGDonations: [] } });
      await get_donations_cg_simple_by_round(5);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*eth.*simple.*by_round.*5/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_donations_cg_simple_by_round(1)).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_donations_cg_simple_by_round(1)).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_donations_cg_with_info_list', () => {
    it('returns flattened data on success', async () => {
      mockedAxios.get.mockResolvedValue({ data: { DirectCGDonations: [{ EvtLogId: 2 }] } });
      const result = await get_donations_cg_with_info_list();
      expect(result).toHaveLength(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*eth.*with_info.*list/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_donations_cg_with_info_list()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_donations_cg_with_info_list()).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_donations_cg_with_info_by_round', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { DirectCGDonations: [] } });
      await get_donations_cg_with_info_by_round(3);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*eth.*with_info.*by_round.*3/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_donations_cg_with_info_by_round(3)).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_donations_cg_with_info_by_round(3)).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_donations_with_info_by_id', () => {
    it('returns flattened single donation', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { ETHDonation: { EvtLogId: 10, Tx: { ...TX, TxHash: '0xb' } } },
      });
      const result = await get_donations_with_info_by_id(10);
      expect(result).toHaveProperty('TxHash', '0xb');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*eth.*with_info.*info.*10/),
      );
    });

    it('returns null on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_donations_with_info_by_id(10)).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_donations_with_info_by_id(10)).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_donations_eth_by_user', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { CombinedDonationRecords: [] } });
      await get_donations_eth_by_user('0xabc');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*eth.*by_user.*0xabc/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_donations_eth_by_user('0xabc')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_donations_eth_by_user('0xabc')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_donations_both_by_round', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { CosmicGameDonations: [] } });
      await get_donations_both_by_round(7);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*eth.*both.*by_round.*7/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_donations_both_by_round(7)).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_donations_both_by_round(7)).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_donations_both', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { CosmicGameDonations: [] } });
      await get_donations_both();
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*eth.*both.*all/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_donations_both()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_donations_both()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_charity_donations_deposits', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { CharityDonations: [] } });
      await get_charity_donations_deposits();
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*charity.*deposits/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_charity_donations_deposits()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_charity_donations_deposits()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_charity_cg_deposits', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { CharityDonations: [] } });
      await get_charity_cg_deposits();
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*charity.*cg_deposits/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_charity_cg_deposits()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_charity_cg_deposits()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_charity_voluntary', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { CharityDonations: [] } });
      await get_charity_voluntary();
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*charity.*voluntary/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_charity_voluntary()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_charity_voluntary()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_charity_withdrawals', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { CharityWithdrawals: [] } });
      await get_charity_withdrawals();
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*charity.*withdrawals/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_charity_withdrawals()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_charity_withdrawals()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_donations_nft_list', () => {
    it('returns normalized flattened data', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { NFTDonations: [{ EvtLogId: 1, TokenAddress: '0xT' }] },
      });
      const result = (await get_donations_nft_list()) as Array<{ TokenAddr: string }>;
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('TokenAddr', '0xT');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*nft.*list/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_donations_nft_list()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_donations_nft_list()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_donated_nft_info', () => {
    it('returns normalized flattened single item', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          NFTDonation: {
            EvtLogId: 5,
            TokenAddress: '0xN',
            Tx: { ...TX, EvtLogId: 5, TxHash: '0xc' },
          },
        },
      });
      const result = await get_donated_nft_info(5);
      expect(result).toHaveProperty('TxHash', '0xc');
      expect(result).toHaveProperty('TokenAddr', '0xN');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*nft.*info.*5/),
      );
    });

    it('returns null on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_donated_nft_info(5)).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_donated_nft_info(5)).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_donated_nft_claims_all', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { DonatedNFTClaims: [] } });
      await get_donated_nft_claims_all();
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*nft.*claims/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_donated_nft_claims_all()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_donated_nft_claims_all()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_claimed_donated_nft_by_user', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { DonatedNFTClaims: [] } });
      await get_claimed_donated_nft_by_user('0xuser');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*nft.*claims.*by_user.*0xuser/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_claimed_donated_nft_by_user('0xuser')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_claimed_donated_nft_by_user('0xuser')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_nft_donation_stats', () => {
    it('returns raw stats object', async () => {
      const stats = { TotalDonations: 42 };
      mockedAxios.get.mockResolvedValue({ data: { NFTDonationStats: stats } });
      const result = await get_nft_donation_stats();
      expect(result).toEqual(stats);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*nft.*statistics/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_nft_donation_stats()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_nft_donation_stats()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_donations_nft_by_round', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { NFTDonations: [] } });
      await get_donations_nft_by_round(2);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*nft.*by_round.*2/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_donations_nft_by_round(2)).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_donations_nft_by_round(2)).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_donations_nft_unclaimed_by_round', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { NFTDonations: [] } });
      await get_donations_nft_unclaimed_by_round(4);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*nft.*unclaimed.*by_round.*4/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_donations_nft_unclaimed_by_round(4)).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_donations_nft_unclaimed_by_round(4)).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_unclaimed_donated_nft_by_user', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { UnclaimedDonatedNFTs: [] } });
      await get_unclaimed_donated_nft_by_user('0xaddr');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*nft.*unclaimed.*by_user.*0xaddr/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_unclaimed_donated_nft_by_user('0xaddr')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_unclaimed_donated_nft_by_user('0xaddr')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_donations_erc20_by_round', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { DonationsERC20ByRoundDetailed: [] } });
      await get_donations_erc20_by_round(6);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*erc20.*by_round.*detailed.*6/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_donations_erc20_by_round(6)).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_donations_erc20_by_round(6)).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_donations_erc20_by_user', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { DonatedPrizesERC20ByWinner: [] } });
      await get_donations_erc20_by_user('0xwinner');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/proxy\?url=.*donations.*erc20.*by_user.*0xwinner/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_donations_erc20_by_user('0xwinner')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_donations_erc20_by_user('0xwinner')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });
});
