// lexicon-allow-start: service test fixtures mirror the backend-sealed API surface

import axios from 'axios';

import {
  get_cst_list,
  get_cst_tokens_by_user,
  get_cst_info,
  get_name_history,
  get_token_by_name,
  get_named_nfts,
  get_cst_transfers,
  get_cst_distribution,
  get_ct_balances_distribution,
  get_ct_transfers,
  get_ct_ownership_transfers,
  get_ct_price,
  get_info,
  get_used_rwlk_nfts,
  create,
} from '@/services/api/tokens';

jest.mock('axios', () => {
  const actual = jest.requireActual<typeof import('axios')>('axios');
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn(), clear: jest.fn() },
      },
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

describe('tokens API', () => {
  describe('get_cst_list', () => {
    it('returns flattened token list on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { CosmicSignatureTokenList: [{ EvtLogId: 1, Tx: TX }] },
      });
      const result = await get_cst_list();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('TxHash', '0xa');
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/cst.*list.*all/));
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_cst_list()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));
      await expect(get_cst_list()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_cst_tokens_by_user', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { UserTokens: [] } });
      await get_cst_tokens_by_user('0xabc');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/cst.*list.*by_user.*0xabc/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_cst_tokens_by_user('0xabc')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_cst_tokens_by_user('0xabc')).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_cst_info', () => {
    it('returns flattened single token', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { TokenInfo: { EvtLogId: 5, Tx: { ...TX, TxHash: '0xb' } } },
      });
      const result = await get_cst_info(5);
      expect(result).toHaveProperty('TxHash', '0xb');
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/cst.*info.*5/));
    });

    it('returns null on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_cst_info(5)).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_cst_info(5)).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_name_history', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { TokenNameHistory: [] } });
      await get_name_history(3);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/cst.*names.*history.*3/));
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_name_history(3)).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_name_history(3)).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_token_by_name', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { TokenNameSearchResults: [] } });
      await get_token_by_name('cosmic');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/cst.*names.*search.*cosmic/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_token_by_name('cosmic')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_token_by_name('cosmic')).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_named_nfts', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { NamedTokens: [] } });
      await get_named_nfts();
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/cst.*names.*named_only/));
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_named_nfts()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_named_nfts()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_cst_transfers', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { CosmicSignatureTransfers: [] } });
      await get_cst_transfers('0xuser');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/cst.*transfers.*by_user.*0xuser/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_cst_transfers('0xuser')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_cst_transfers('0xuser')).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_cst_distribution', () => {
    it('returns distribution data on success', async () => {
      const dist = [{ Address: '0x1', Count: 5 }];
      mockedAxios.get.mockResolvedValue({ data: { CosmicSignatureTokenDistribution: dist } });
      const result = await get_cst_distribution();
      expect(result).toEqual(dist);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/cst.*distribution/));
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_cst_distribution()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_cst_distribution()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_ct_balances_distribution', () => {
    it('returns balances on success', async () => {
      const balances = [{ Address: '0x1', Balance: '100' }];
      mockedAxios.get.mockResolvedValue({ data: { CosmicTokenBalances: balances } });
      const result = await get_ct_balances_distribution();
      expect(result).toEqual(balances);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/ct.*balances/));
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_ct_balances_distribution()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_ct_balances_distribution()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_ct_transfers', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { CosmicTokenTransfers: [] } });
      await get_ct_transfers('0xaddr');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/ct.*transfers.*by_user.*0xaddr/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_ct_transfers('0xaddr')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_ct_transfers('0xaddr')).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_ct_ownership_transfers', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { TokenTransfers: [] } });
      await get_ct_ownership_transfers(7);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/cst.*transfers.*all.*7/));
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_ct_ownership_transfers(7)).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_ct_ownership_transfers(7)).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_ct_price', () => {
    it('returns price data on success', async () => {
      const price = { CSTPrice: '0.01' };
      mockedAxios.get.mockResolvedValue({ data: price });
      const result = await get_ct_price();
      expect(result).toEqual(price);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/bid.*cst_price/));
    });

    it('returns null on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_ct_price()).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_ct_price()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_info', () => {
    it('returns token info on success', async () => {
      const info = { TokenId: 1, Name: 'Cosmic #1' };
      mockedAxios.get.mockResolvedValue({ data: { TokenInfo: info } });
      const result = await get_info(1);
      expect(result).toEqual(info);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/randomwalk\/tokens\/info\/1/),
      );
    });

    it('returns null on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_info(1)).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_info(1)).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_used_rwlk_nfts', () => {
    it('returns used nfts on success', async () => {
      const nfts = [{ TokenId: 1 }];
      mockedAxios.get.mockResolvedValue({ data: { UsedRwalkNFTs: nfts } });
      const result = await get_used_rwlk_nfts();
      expect(result).toEqual(nfts);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/bid.*used_randomwalk_nfts/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_used_rwlk_nfts()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_used_rwlk_nfts()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('create', () => {
    it('returns task_id on success', async () => {
      mockedAxios.post.mockResolvedValue({ data: { task_id: 42 } });
      const result = await create(1, 5);
      expect(result).toBe(42);
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringMatching(/cosmicgame_tokens/), {
        token_id: 1,
        count: 5,
      });
    });

    it('returns -1 when task_id is missing', async () => {
      mockedAxios.post.mockResolvedValue({ data: {} });
      const result = await create(1, 5);
      expect(result).toBe(-1);
    });

    it('throws on any error (no 400 fallback)', async () => {
      mockedAxios.post.mockRejectedValue(make400());
      await expect(create(1, 5)).rejects.toThrow('Network response was not OK');
    });

    it('throws on network error', async () => {
      mockedAxios.post.mockRejectedValue(new Error('fail'));
      await expect(create(1, 5)).rejects.toThrow('Network response was not OK');
    });
  });
});

// lexicon-allow-end
