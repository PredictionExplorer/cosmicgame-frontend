// lexicon-allow-start: service test fixtures mirror the backend-sealed API surface

import axios from 'axios';

import {
  get_dashboard_info,
  get_round_list,
  get_bid_list,
  get_round_info,
  get_prize_time,
  get_claim_history,
  get_claim_history_by_user,
  get_bid_info,
  get_bid_list_by_round,
  get_current_special_winners,
  get_prize_deposits_list,
  get_prize_deposits_by_round,
  get_banned_bids,
  ban_bid,
  unban_gesture,
  get_bid_eth_price,
  get_time_until_prize,
} from '@/services/api/rounds';

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

const make403 = () =>
  Object.assign(new Error('Forbidden'), {
    response: { status: 403 },
    isAxiosError: true,
  });

const mockTx = (id: number) => ({
  EvtLogId: id,
  Tx: {
    EvtLogId: id,
    BlockNum: 100 + id,
    TxId: id,
    TxHash: `0x${id}`,
    TimeStamp: 1700000000 + id,
    DateTime: `2023-01-0${id}`,
  },
});

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
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/statistics.*dashboard/));
    });

    it('returns null on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_dashboard_info()).toBeNull();
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
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/rounds.*list/));
    });

    it('returns empty array when Rounds is missing', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });
      expect(await get_round_list()).toEqual([]);
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_round_list()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));
      await expect(get_round_list()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_bid_list', () => {
    it('returns array of gestures on successful response', async () => {
      mockedAxios.get.mockResolvedValue({ data: { Gestures: [mockTx(1)] } });

      const result = await get_bid_list();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('EvtLogId', 1);
      expect(result[0]).toHaveProperty('TxHash', '0x1');
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/bid.*list/));
    });

    it('returns empty array when Gestures is missing', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });
      expect(await get_bid_list()).toEqual([]);
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_bid_list()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));
      await expect(get_bid_list()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_round_info', () => {
    it('returns flattened round info on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          RoundInfo: {
            RoundNum: 5,
            ClaimPrizeTx: {
              Tx: {
                EvtLogId: 1,
                BlockNum: 200,
                TxId: 1,
                TxHash: '0xr5',
                TimeStamp: 100,
                DateTime: '2023-01-01',
              },
            },
            MainPrize: {
              WinnerAddr: '0xwinner',
              EthAmountEth: 1.5,
              NftTokenId: 42,
              CstAmountEth: 10,
            },
            CharityDeposit: { CharityAddress: '0xcharity', CharityAmountETH: 0.5 },
            StakingDeposit: {
              StakingDepositAmountEth: 0.3,
              StakingPerTokenEth: 0.01,
              StakingNumStakedTokens: 30,
            },
            EnduranceChampion: { WinnerAddr: '0xendurance', NftTokenId: 7, CstAmountEth: 5 },
            LastCstBidder: { WinnerAddr: '0xlast', NftTokenId: 8, CstAmountEth: 3 },
            ChronoWarrior: {
              WinnerAddr: '0xchrono',
              EthAmountEth: 0.2,
              CstAmountEth: 1,
              NftTokenId: 9,
            },
            RoundStats: { TotalBids: 100 },
          },
        },
      });

      const result = await get_round_info(5);

      expect(result).toHaveProperty('RoundNum', 5);
      expect(result).toHaveProperty('WinnerAddr', '0xwinner');
      expect(result).toHaveProperty('TxHash', '0xr5');
      expect(result).toHaveProperty('CharityAddress', '0xcharity');
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/rounds.*info.*5/));
    });

    it('clamps negative roundNum to 0', async () => {
      mockedAxios.get.mockResolvedValue({ data: { RoundInfo: { RoundNum: 0 } } });

      await get_round_info(-3);

      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/rounds.*info.*0/));
    });

    it('returns null on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_round_info(1)).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_round_info(1)).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_prize_time', () => {
    it('returns CurRoundPrizeTime on success', async () => {
      mockedAxios.get.mockResolvedValue({ data: { CurRoundPrizeTime: 1700001234 } });

      const result = await get_prize_time();

      expect(result).toBe(1700001234);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/rounds.*current.*time/));
    });

    it('returns 0 on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_prize_time()).toBe(0);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_prize_time()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_claim_history', () => {
    it('returns flattened claim history on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { GlobalPrizeHistory: [mockTx(1), mockTx(2)] },
      });

      const result = await get_claim_history();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('TxHash', '0x1');
      expect(result[1]).toHaveProperty('TxHash', '0x2');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/allocations.*history.*global/),
      );
    });

    it('returns empty array when GlobalPrizeHistory is missing', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });
      expect(await get_claim_history()).toEqual([]);
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_claim_history()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_claim_history()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_claim_history_by_user', () => {
    const addr = '0xabc123';

    it('returns flattened history for the given address', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { USerPrizeHistory: [mockTx(3)] },
      });

      const result = await get_claim_history_by_user(addr);

      expect(result).toHaveLength(1);
      expect(result![0]).toHaveProperty('TxHash', '0x3');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(new RegExp(`allocations.*history.*by_user.*${addr}`)),
      );
    });

    it('returns empty array when USerPrizeHistory is missing', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });
      expect(await get_claim_history_by_user(addr)).toEqual([]);
    });

    it('returns null on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_claim_history_by_user(addr)).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_claim_history_by_user(addr)).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_bid_info', () => {
    it('returns flattened bid on success', async () => {
      mockedAxios.get.mockResolvedValue({ data: { GestureInfo: mockTx(7) } });

      const result = await get_bid_info(7);

      expect(result).toHaveProperty('TxHash', '0x7');
      expect(result).toHaveProperty('EvtLogId', 7);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/bid.*info.*7/));
    });

    it('returns null when GestureInfo is null', async () => {
      mockedAxios.get.mockResolvedValue({ data: { GestureInfo: null } });
      expect(await get_bid_info(99)).toBeNull();
    });

    it('returns null on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_bid_info(1)).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_bid_info(1)).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_bid_list_by_round', () => {
    it('maps "asc" sort direction to 0', async () => {
      mockedAxios.get.mockResolvedValue({ data: { BidsByRound: [mockTx(1)] } });

      const result = await get_bid_list_by_round(5, 'asc');

      expect(result).toHaveLength(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/bid.*list.*by_round.*5.*0.*0.*1000000/),
      );
    });

    it('maps "desc" sort direction to 1', async () => {
      mockedAxios.get.mockResolvedValue({ data: { BidsByRound: [] } });

      await get_bid_list_by_round(3, 'desc');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/bid.*list.*by_round.*3.*1.*0.*1000000/),
      );
    });

    it('maps unknown sort direction to 1', async () => {
      mockedAxios.get.mockResolvedValue({ data: { BidsByRound: [] } });

      await get_bid_list_by_round(1, 'random');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/by_round.*1.*1.*0.*1000000/),
      );
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_bid_list_by_round(1, 'asc')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_bid_list_by_round(1, 'asc')).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_current_special_winners', () => {
    it('returns special recipients on success', async () => {
      const recipients = { EnduranceChampion: '0x1', ChronoWarrior: '0x2' };
      mockedAxios.get.mockResolvedValue({ data: recipients });

      const result = await get_current_special_winners();

      expect(result).toEqual(recipients);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/bid.*current_special_winners/),
      );
    });

    it('returns null on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_current_special_winners()).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_current_special_winners()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_prize_deposits_list', () => {
    it('returns flattened deposits on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { RaffleDeposits: [mockTx(1)] },
      });

      const result = await get_prize_deposits_list();

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('TxHash', '0x1');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/stellarSelection.*deposits.*list/),
      );
    });

    it('returns empty array when RaffleDeposits is missing', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });
      expect(await get_prize_deposits_list()).toEqual([]);
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_prize_deposits_list()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_prize_deposits_list()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_prize_deposits_by_round', () => {
    it('returns flattened deposits for the given round', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { RaffleDeposits: [mockTx(2)] },
      });

      const result = await get_prize_deposits_by_round(10);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('TxHash', '0x2');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/stellarSelection.*deposits.*by_round.*10/),
      );
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_prize_deposits_by_round(1)).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_prize_deposits_by_round(1)).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_banned_bids', () => {
    it('returns banned gestures from the main API', async () => {
      const gestures = [{ BidId: 1, UserAddr: '0x1' }];
      mockedAxios.get.mockResolvedValue({ data: gestures });

      const result = await get_banned_bids();

      expect(result).toEqual(gestures);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/get_banned_bids/));
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_banned_bids()).toEqual([]);
    });

    it('returns empty array on 403 response', async () => {
      mockedAxios.get.mockRejectedValue(make403());
      expect(await get_banned_bids()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_banned_bids()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('ban_bid', () => {
    it('posts ban request with bid_id and user_addr', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      const result = await ban_bid(42, '0xuser');

      expect(result).toEqual({ success: true });
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringMatching(/ban_bid/), {
        bid_id: 42,
        user_addr: '0xuser',
      });
    });

    it('throws on server error', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Server Error'));
      await expect(ban_bid(1, '0x1')).rejects.toThrow('Network response was not OK');
    });
  });

  describe('unban_gesture', () => {
    it('posts unban request with bid_id', async () => {
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      const result = await unban_gesture(42);

      expect(result).toEqual({ success: true });
      expect(mockedAxios.post).toHaveBeenCalledWith(expect.stringMatching(/unban_gesture/), {
        bid_id: 42,
      });
    });

    it('throws on server error', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Server Error'));
      await expect(unban_gesture(1)).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_bid_eth_price', () => {
    it('returns bid ETH price info on success', async () => {
      const priceInfo = { GestureCostEth: 0.5, BidPriceWei: '500000000000000000' };
      mockedAxios.get.mockResolvedValue({ data: priceInfo });

      const result = await get_bid_eth_price();

      expect(result).toEqual(priceInfo);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/bid.*eth_price/));
    });

    it('returns null on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_bid_eth_price()).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_bid_eth_price()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_time_until_prize', () => {
    it('returns TimeUntilPrize on success', async () => {
      mockedAxios.get.mockResolvedValue({ data: { TimeUntilPrize: 3600 } });

      const result = await get_time_until_prize();

      expect(result).toBe(3600);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/time.*until_prize/));
    });

    it('returns 0 on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_time_until_prize()).toBe(0);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_time_until_prize()).rejects.toThrow('Network response was not OK');
    });
  });
});

// lexicon-allow-end
