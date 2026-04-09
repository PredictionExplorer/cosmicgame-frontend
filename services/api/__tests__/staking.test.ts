import axios from 'axios';

import {
  get_staking_cst_rewards_to_claim_by_user,
  get_staking_cst_rewards_collected_by_user,
  get_staked_cst_tokens_by_user,
  get_cst_action_ids_by_deposit_id,
  get_staking_cst_actions_by_user,
  get_staking_cst_actions,
  get_staking_cst_actions_info,
  get_staking_cst_rewards,
  get_staking_cst_rewards_by_round,
  get_staking_cst_reward_paid_records_by_user,
  get_staked_cst_tokens,
  get_staking_rewards_by_user,
  get_staking_rewards_by_user_by_token_details,
  get_staking_cst_by_user_by_deposit_rewards,
  get_staking_rwalk_actions_info,
  get_staking_rwalk_actions,
  get_staking_rwalk_actions_by_user,
  get_staking_rwalk_mints_global,
  get_staking_rwalk_mints_by_user,
  get_staked_rwalk_tokens,
  get_staked_rwalk_tokens_by_user,
} from '@/services/api/staking';

jest.mock('axios', () => {
  const actual = jest.requireActual<typeof import('axios')>('axios');
  return {
    __esModule: true,
    default: {
      get: jest.fn(),
      post: jest.fn(),
      interceptors: {
        request: { use: jest.fn(), eject: jest.fn() },
        response: { use: jest.fn(), eject: jest.fn() },
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

const TX = { EvtLogId: 1, BlockNum: 10, TxId: 1, TxHash: '0xh', TimeStamp: 100, DateTime: '' };

beforeEach(() => {
  jest.clearAllMocks();
});

describe('staking API', () => {
  describe('get_staking_cst_rewards_to_claim_by_user', () => {
    it('returns flattened rewards on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { UnclaimedEthDeposits: [{ EvtLogId: 1, Tx: TX }] },
      });
      const result = await get_staking_cst_rewards_to_claim_by_user('0xabc');
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('TxHash', '0xh');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*cst.*rewards.*to_claim.*by_user.*0xabc/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staking_cst_rewards_to_claim_by_user('0xabc')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staking_cst_rewards_to_claim_by_user('0xabc')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_staking_cst_rewards_collected_by_user', () => {
    it('returns flattened data on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: { CollectedStakingCSTRewards: [{ EvtLogId: 2, Tx: TX }] },
      });
      const result = await get_staking_cst_rewards_collected_by_user('0xdef');
      expect(result).toHaveLength(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*cst.*rewards.*collected.*by_user.*0xdef/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staking_cst_rewards_collected_by_user('0xdef')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staking_cst_rewards_collected_by_user('0xdef')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_staked_cst_tokens_by_user', () => {
    it('returns raw data on success', async () => {
      const tokens = [{ TokenId: 1, IsStaked: true }];
      mockedAxios.get.mockResolvedValue({ data: { StakedTokensCST: tokens } });
      const result = await get_staked_cst_tokens_by_user('0xabc');
      expect(result).toEqual(tokens);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*cst.*staked_tokens.*by_user.*0xabc/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staked_cst_tokens_by_user('0xabc')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staked_cst_tokens_by_user('0xabc')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_cst_action_ids_by_deposit_id', () => {
    it('returns action IDs on success', async () => {
      const ids = [{ ActionId: 1, Claimed: true }];
      mockedAxios.get.mockResolvedValue({ data: { ActionIdsWithClaimInfo: ids } });
      const result = await get_cst_action_ids_by_deposit_id('0xabc', 5);
      expect(result).toEqual(ids);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*cst.*rewards.*action_ids_by_deposit.*0xabc.*5/),
      );
    });

    it('returns null on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_cst_action_ids_by_deposit_id('0xabc', 5)).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_cst_action_ids_by_deposit_id('0xabc', 5)).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_staking_cst_actions_by_user', () => {
    it('returns flattened data on success', async () => {
      mockedAxios.get.mockResolvedValue({ data: { StakingCSTActions: [{ EvtLogId: 1 }] } });
      const result = await get_staking_cst_actions_by_user('0xabc');
      expect(result).toHaveLength(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*cst.*actions.*by_user.*0xabc/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staking_cst_actions_by_user('0xabc')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staking_cst_actions_by_user('0xabc')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_staking_cst_actions', () => {
    it('returns flattened data on success', async () => {
      mockedAxios.get.mockResolvedValue({ data: { StakingCSTActions: [] } });
      const result = await get_staking_cst_actions();
      expect(result).toEqual([]);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*cst.*actions.*global/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staking_cst_actions()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staking_cst_actions()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_staking_cst_actions_info', () => {
    it('returns flattened combined info on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          CombinedStakingRecordInfo: {
            ActionId: 1,
            Stake: { TokenId: 1, Tx: TX },
            Unstake: { TokenId: 1, Tx: TX },
          },
        },
      });
      const result = await get_staking_cst_actions_info(1);
      expect(result).toHaveProperty('ActionId', 1);
      expect(result?.Stake).toHaveProperty('TxHash', '0xh');
      expect(result?.Unstake).toHaveProperty('TxHash', '0xh');
    });

    it('returns null when info is missing', async () => {
      mockedAxios.get.mockResolvedValue({ data: { CombinedStakingRecordInfo: null } });
      expect(await get_staking_cst_actions_info(1)).toBeNull();
    });

    it('returns null on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staking_cst_actions_info(1)).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staking_cst_actions_info(1)).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_staking_cst_rewards', () => {
    it('returns flattened data on success', async () => {
      mockedAxios.get.mockResolvedValue({ data: { StakingCSTRewards: [] } });
      const result = await get_staking_cst_rewards();
      expect(result).toEqual([]);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*cst.*rewards.*global/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staking_cst_rewards()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staking_cst_rewards()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_staking_cst_rewards_by_round', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { Rewards: [] } });
      await get_staking_cst_rewards_by_round(3);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*cst.*rewards.*by_round.*3/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staking_cst_rewards_by_round(3)).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staking_cst_rewards_by_round(3)).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_staking_cst_reward_paid_records_by_user', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { RewardPaidRecords: [] } });
      await get_staking_cst_reward_paid_records_by_user('0xabc');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*cst.*rewards.*paid.*by_user.*0xabc/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staking_cst_reward_paid_records_by_user('0xabc')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staking_cst_reward_paid_records_by_user('0xabc')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_staked_cst_tokens', () => {
    it('returns raw token data on success', async () => {
      const tokens = [{ TokenId: 1 }];
      mockedAxios.get.mockResolvedValue({ data: { StakedTokensCST: tokens } });
      const result = await get_staked_cst_tokens();
      expect(result).toEqual(tokens);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*cst.*staked_tokens.*all/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staked_cst_tokens()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staked_cst_tokens()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_staking_rewards_by_user', () => {
    it('returns raw rewards data on success', async () => {
      const rewards = [{ TokenId: 1, TotalReward: '10' }];
      mockedAxios.get.mockResolvedValue({ data: { RewardsByToken: rewards } });
      const result = await get_staking_rewards_by_user('0xabc');
      expect(result).toEqual(rewards);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*cst.*rewards.*by_user.*by_token.*summary.*0xabc/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staking_rewards_by_user('0xabc')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staking_rewards_by_user('0xabc')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_staking_rewards_by_user_by_token_details', () => {
    it('returns processed details on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          RewardsByTokenDetails: {
            action1: {
              ActionId: 1,
              Stake: { TokenId: 1, Tx: TX },
              Unstake: null,
            },
          },
        },
      });
      const result = await get_staking_rewards_by_user_by_token_details('0xabc', 1);
      expect(result).toHaveProperty('action1');
    });

    it('returns raw details when not an object', async () => {
      mockedAxios.get.mockResolvedValue({ data: { RewardsByTokenDetails: null } });
      const result = await get_staking_rewards_by_user_by_token_details('0xabc', 1);
      expect(result).toBeNull();
    });

    it('returns null on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staking_rewards_by_user_by_token_details('0xabc', 1)).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staking_rewards_by_user_by_token_details('0xabc', 1)).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_staking_cst_by_user_by_deposit_rewards', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { RewardsByDeposit: [] } });
      await get_staking_cst_by_user_by_deposit_rewards('0xabc');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*cst.*rewards.*by_user.*by_deposit.*0xabc/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staking_cst_by_user_by_deposit_rewards('0xabc')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staking_cst_by_user_by_deposit_rewards('0xabc')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_staking_rwalk_actions_info', () => {
    it('returns flattened combined info on success', async () => {
      mockedAxios.get.mockResolvedValue({
        data: {
          CombinedRWalkStakingRecordInfo: {
            ActionId: 2,
            Stake: { TokenId: 5, Tx: TX },
            Unstake: { TokenId: 5, Tx: TX },
          },
        },
      });
      const result = await get_staking_rwalk_actions_info(2);
      expect(result).toHaveProperty('ActionId', 2);
      expect(result?.Stake).toHaveProperty('TxHash', '0xh');
    });

    it('returns null when info is missing', async () => {
      mockedAxios.get.mockResolvedValue({ data: { CombinedRWalkStakingRecordInfo: null } });
      expect(await get_staking_rwalk_actions_info(2)).toBeNull();
    });

    it('returns null on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staking_rwalk_actions_info(2)).toBeNull();
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staking_rwalk_actions_info(2)).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_staking_rwalk_actions', () => {
    it('returns flattened data on success', async () => {
      mockedAxios.get.mockResolvedValue({ data: { GlobalStakingActionsRWalk: [] } });
      const result = await get_staking_rwalk_actions();
      expect(result).toEqual([]);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*rwalk.*actions.*global/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staking_rwalk_actions()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staking_rwalk_actions()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_staking_rwalk_actions_by_user', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { UserStakingActionsRWalk: [] } });
      await get_staking_rwalk_actions_by_user('0xabc');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*rwalk.*actions.*by_user.*0xabc/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staking_rwalk_actions_by_user('0xabc')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staking_rwalk_actions_by_user('0xabc')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_staking_rwalk_mints_global', () => {
    it('returns flattened data on success', async () => {
      mockedAxios.get.mockResolvedValue({ data: { StakingRWalkRewardsMints: [] } });
      const result = await get_staking_rwalk_mints_global();
      expect(result).toEqual([]);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*rwalk.*mints.*global/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staking_rwalk_mints_global()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staking_rwalk_mints_global()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_staking_rwalk_mints_by_user', () => {
    it('calls correct endpoint', async () => {
      mockedAxios.get.mockResolvedValue({ data: { RWalkStakingRewardMints: [] } });
      await get_staking_rwalk_mints_by_user('0xabc');
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*rwalk.*mints.*by_user.*0xabc/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staking_rwalk_mints_by_user('0xabc')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staking_rwalk_mints_by_user('0xabc')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });

  describe('get_staked_rwalk_tokens', () => {
    it('returns raw token data on success', async () => {
      const tokens = [{ TokenId: 10 }];
      mockedAxios.get.mockResolvedValue({ data: { StakedTokensRWalk: tokens } });
      const result = await get_staked_rwalk_tokens();
      expect(result).toEqual(tokens);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*rwalk.*staked_tokens.*all/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staked_rwalk_tokens()).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staked_rwalk_tokens()).rejects.toThrow('Network response was not OK');
    });
  });

  describe('get_staked_rwalk_tokens_by_user', () => {
    it('returns raw token data on success', async () => {
      const tokens = [{ TokenId: 11 }];
      mockedAxios.get.mockResolvedValue({ data: { StakedTokensRWalk: tokens } });
      const result = await get_staked_rwalk_tokens_by_user('0xabc');
      expect(result).toEqual(tokens);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringMatching(/staking.*rwalk.*staked_tokens.*by_user.*0xabc/),
      );
    });

    it('returns empty array on 400', async () => {
      mockedAxios.get.mockRejectedValue(make400());
      expect(await get_staked_rwalk_tokens_by_user('0xabc')).toEqual([]);
    });

    it('throws on network error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('fail'));
      await expect(get_staked_rwalk_tokens_by_user('0xabc')).rejects.toThrow(
        'Network response was not OK',
      );
    });
  });
});
