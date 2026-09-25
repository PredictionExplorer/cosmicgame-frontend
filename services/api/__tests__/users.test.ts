// lexicon-allow-start: service test fixtures mirror the backend-sealed API surface

import axios from 'axios';

import {
  get_user_info,
  get_user_balance,
  get_unique_bidders,
  notify_red_box,
  get_unique_winners,
  get_unique_donors,
  get_unique_cst_stakers,
  get_unique_rwalk_stakers,
  get_unique_both_stakers,
} from '@/services/api/users';
import { reportError } from '@/utils/errors';

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
      defaults: {},
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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('users API', () => {
  describe('get_user_info', () => {
    it('returns user data on successful response', async () => {
      const mockUserData = {
        Addr: '0x1234567890123456789012345678901234567890',
        Gestures: [],
        PrizeHistory: [],
      };
      mockedAxios.get.mockResolvedValue({ data: mockUserData });

      const result = await get_user_info('0x1234567890123456789012345678901234567890');

      expect(result).toBeDefined();
      expect(result?.Addr).toBe(mockUserData.Addr);
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/user.*info/));
    });

    it('flattens Tx in nested arrays', async () => {
      const mockUserData = {
        Addr: '0x1234',
        Gestures: [
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

      expect(result?.Gestures).toHaveLength(1);
      expect(result?.Gestures[0]).toHaveProperty('TxHash', '0xabc');
    });

    it('reads the anchored Cosmic Signature NFTs from the per-collection map', async () => {
      // Regression: the API keys anchored tokens by collection, and the flattener dropped
      // the whole map, so a profile counted none of its anchored Cosmic Signature NFTs.
      mockedAxios.get.mockResolvedValue({
        data: {
          Addr: '0x1234',
          CurrentlyStakedTokens: {
            CST: [{ TokenInfo: { TokenId: 0 }, Tx: { TxHash: '0xabc' } }],
            RWalk: [{ TokenId: 7 }, { TokenId: 8 }],
          },
        },
      });

      const result = await get_user_info('0x1234');

      expect(result?.CurrentlyStakedTokens).toHaveLength(1);
      expect(result?.CurrentlyStakedTokens[0]).toHaveProperty('TxHash', '0xabc');
    });

    it('still reads a flat anchored-token list', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { Addr: '0x1234', CurrentlyStakedTokens: [{ TokenId: 1 }, { TokenId: 2 }] },
      });

      const result = await get_user_info('0x1234');

      expect(result?.CurrentlyStakedTokens).toHaveLength(2);
    });

    it('rejects a UserInfo block with non-numeric totals', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { Addr: '0x1234', UserInfo: { NumBids: 'many', NumPrizes: 1 } },
      });

      await expect(get_user_info('0x1234')).rejects.toThrow(/schemaMismatch:UserInfo — NumBids/);
    });

    it('propagates a 400 instead of resolving to null', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      await expect(get_user_info('0x1234')).rejects.toThrow('Network response was not OK');
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));
      await expect(get_user_info('0x1234')).rejects.toThrow('Network Error');
    });
  });

  describe('get_user_balance', () => {
    it('returns balance data on successful response', async () => {
      const mockBalance = { EthBalance: '1.5', CSTBalance: '100' };
      mockedAxios.get.mockResolvedValue({ data: mockBalance });

      const result = await get_user_balance('0x1234567890123456789012345678901234567890');

      expect(result).toEqual(mockBalance);
      expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringMatching(/user.*balances/));
    });

    it('returns null on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_user_balance('0x1234')).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));
      await expect(get_user_balance('0x1234')).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_unique_bidders', () => {
    it('returns unique participants on successful response', async () => {
      const mockParticipants = [{ Addr: '0xaaa' }, { Addr: '0xbbb' }];
      mockedAxios.get.mockResolvedValue({ data: { UniqueBidders: mockParticipants } });

      const result = await get_unique_bidders();

      expect(result).toEqual(mockParticipants);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/statistics.*unique.*bidders/),
      );
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_unique_bidders()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));
      await expect(get_unique_bidders()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('notify_red_box', () => {
    it('returns Winnings data on success', async () => {
      const winnings = { HasUnclaimedPrizes: true, Amount: '0.5' };
      mockedAxios.get.mockResolvedValue({ data: { Winnings: winnings } });

      const result = await notify_red_box('0xuser');

      expect(result).toEqual(winnings);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/user.*notif_red_box.*0xuser/),
      );
    });

    it('maps the wire UnclaimedStakingReward onto UnretrievedAnchorDistribution', async () => {
      // Regression: the lexicon rename read the UI name off the wire, so the retrieval
      // prompt never showed for wallets with unretrieved Anchor Distributions.
      mockedAxios.get.mockResolvedValue({
        data: { Winnings: { ETHRaffleToClaim: 0, UnclaimedStakingReward: 1.4054718307649714 } },
      });

      const result = await notify_red_box('0xuser');

      expect(result?.UnretrievedAnchorDistribution).toBe(1.4054718307649714);
    });

    it('reads a wallet the indexer has not seen yet (Winnings: []) as nothing waiting', async () => {
      // Regression: the production answer for a new wallet spread an empty array, so
      // UnretrievedAnchorDistribution came back undefined and My Allocations showed a
      // permanent "could not be loaded" error instead of "Nothing waiting".
      mockedAxios.get.mockResolvedValue({
        data: {
          UserAddr: '0x1234567890123456789012345678901234567890',
          UserAid: 0,
          Winnings: [],
          error: '',
          status: 1,
        },
      });

      expect(await notify_red_box('0x1234567890123456789012345678901234567890')).toEqual({
        ETHRaffleToClaim: 0,
        ETHRaffleToClaimWei: 0,
        NumDonatedNFTToClaim: 0,
        UnretrievedAnchorDistribution: 0,
      });
    });

    it('keeps the anchor figure unknown when a notice lacks it', async () => {
      mockedAxios.get.mockResolvedValue({ data: { Winnings: { ETHRaffleToClaim: 0 } } });
      const result = await notify_red_box('0xuser');
      expect(result).not.toBeNull();
      expect(result?.UnretrievedAnchorDistribution).toBeUndefined();
    });

    it('returns null when the payload has no Winnings', async () => {
      mockedAxios.get.mockResolvedValue({ data: {} });
      expect(await notify_red_box('0xuser')).toBeNull();
    });

    it('returns null for a Winnings list it cannot read as a notice', async () => {
      mockedAxios.get.mockResolvedValue({ data: { Winnings: [{ Amount: 1 }] } });
      expect(await notify_red_box('0xuser')).toBeNull();
    });

    it('returns null on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await notify_red_box('0xuser')).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(notify_red_box('0xuser')).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_unique_winners', () => {
    it('returns unique recipients on success', async () => {
      const recipients = [{ Addr: '0x1', Wins: 3 }];
      mockedAxios.get.mockResolvedValue({ data: { UniqueWinners: recipients } });

      const result = await get_unique_winners();

      expect(result).toEqual(recipients);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/statistics\/unique\/winners/),
      );
    });

    it('maps the wire PrizesCount onto AllocationsCount', async () => {
      // Regression: the column read AllocationsCount off the wire and rendered blank.
      mockedAxios.get.mockResolvedValue({
        data: {
          UniqueWinners: [
            {
              WinnerAid: 980,
              WinnerAddr: '0x7406',
              PrizesCount: 39,
              MaxWinAmountEth: 0,
              PrizesSum: 3.5397,
            },
          ],
        },
      });

      const [recipient] = await get_unique_winners();

      expect(recipient?.AllocationsCount).toBe(39);
      expect(recipient?.PrizesSum).toBe(3.5397);
      expect(reportError).not.toHaveBeenCalled();
    });

    // Regression (V140): the schema required PrizesCount while the mapper also accepted
    // AllocationsCount, so a renamed field reported a mismatch on every read.
    it('accepts a row that already names the count AllocationsCount', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          UniqueWinners: [
            {
              WinnerAid: 980,
              WinnerAddr: '0x7406',
              AllocationsCount: 12,
              MaxWinAmountEth: 0,
              PrizesSum: 1,
            },
          ],
        },
      });

      const [recipient] = await get_unique_winners();

      expect(recipient?.AllocationsCount).toBe(12);
      expect(reportError).not.toHaveBeenCalled();
    });

    it('leaves a missing count undefined rather than inventing one, and reports it', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          UniqueWinners: [{ WinnerAid: 1, WinnerAddr: '0x1', MaxWinAmountEth: 0, PrizesSum: 0 }],
        },
      });

      const [recipient] = await get_unique_winners();

      expect(recipient?.AllocationsCount).toBeUndefined();
      expect(reportError).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('uniqueWinners') }),
        'schema:uniqueWinners',
      );
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_unique_winners()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_unique_winners()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_unique_donors', () => {
    it('returns unique donors on success', async () => {
      const donors = [{ Addr: '0xd1', DonationCount: 5 }];
      mockedAxios.get.mockResolvedValue({ data: { UniqueDonors: donors } });

      const result = await get_unique_donors();

      expect(result).toEqual(donors);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/statistics.*unique.*donors/),
      );
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_unique_donors()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_unique_donors()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_unique_cst_stakers', () => {
    it('returns unique CST anchorHolders on success', async () => {
      const anchorHolders = [{ Addr: '0xs1', StakeCount: 2 }];
      mockedAxios.get.mockResolvedValue({ data: { UniqueStakersCST: anchorHolders } });

      const result = await get_unique_cst_stakers();

      expect(result).toEqual(anchorHolders);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/statistics\/unique\/stakers\/cst/),
      );
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_unique_cst_stakers()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_unique_cst_stakers()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_unique_rwalk_stakers', () => {
    it('returns unique RWLK anchorHolders on success', async () => {
      const anchorHolders = [{ Addr: '0xr1', StakeCount: 4 }];
      mockedAxios.get.mockResolvedValue({ data: { UniqueStakersRWalk: anchorHolders } });

      const result = await get_unique_rwalk_stakers();

      expect(result).toEqual(anchorHolders);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/statistics\/unique\/stakers\/randomwalk/),
      );
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_unique_rwalk_stakers()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_unique_rwalk_stakers()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_unique_both_stakers', () => {
    it('returns unique combined anchorHolders on success', async () => {
      const anchorHolders = [{ Addr: '0xb1', StakeCount: 6 }];
      mockedAxios.get.mockResolvedValue({ data: { UniqueStakersBoth: anchorHolders } });

      const result = await get_unique_both_stakers();

      expect(result).toEqual(anchorHolders);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/statistics\/unique\/stakers\/both/),
      );
    });

    it('returns empty array on 400 response', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_unique_both_stakers()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_unique_both_stakers()).rejects.toThrow('Network response was not OK');
    });
  });
});

// lexicon-allow-end
