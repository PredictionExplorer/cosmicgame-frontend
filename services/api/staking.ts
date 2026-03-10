import { axios, isAxiosError, getAPIUrl, flattenTx, flattenTxArray } from './client';
import type {
  StakingCSTReward,
  StakingAction,
  StakedTokenInfo,
  CombinedStakingRecordInfo,
  RewardsByToken,
  StakingRewardMint,
} from './types';

export async function get_staking_cst_rewards_to_claim_by_user(
  address: string,
): Promise<StakingCSTReward[]> {
  try {
    const { data } = await axios.get(getAPIUrl(`staking/cst/rewards/to_claim/by_user/${address}`));
    return flattenTxArray<StakingCSTReward>(data.UnclaimedEthDeposits);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staking_cst_rewards_collected_by_user(
  address: string,
): Promise<StakingCSTReward[]> {
  try {
    const { data } = await axios.get(
      getAPIUrl(`staking/cst/rewards/collected/by_user/${address}/0/1000000`),
    );
    return flattenTxArray<StakingCSTReward>(data.CollectedStakingCSTRewards);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staked_cst_tokens_by_user(address: string): Promise<StakedTokenInfo[]> {
  try {
    const { data } = await axios.get(getAPIUrl(`staking/cst/staked_tokens/by_user/${address}`));
    return data.StakedTokensCST;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_cst_action_ids_by_deposit_id(user_addr: string, deposit_id: number) {
  try {
    const { data } = await axios.get(
      getAPIUrl(`staking/cst/rewards/action_ids_by_deposit/${user_addr}/${deposit_id}`),
    );
    return data.ActionIdsWithClaimInfo;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staking_cst_actions_by_user(address: string): Promise<StakingAction[]> {
  try {
    const { data } = await axios.get(getAPIUrl(`staking/cst/actions/by_user/${address}/0/1000000`));
    return flattenTxArray<StakingAction>(data.StakingCSTActions);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staking_cst_actions(): Promise<StakingAction[]> {
  try {
    const { data } = await axios.get(getAPIUrl('staking/cst/actions/global/0/1000000'));
    return flattenTxArray<StakingAction>(data.StakingCSTActions);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staking_cst_actions_info(
  actionId: number,
): Promise<CombinedStakingRecordInfo | null> {
  try {
    const { data } = await axios.get(getAPIUrl(`staking/cst/actions/info/${actionId}`));
    const info = data.CombinedStakingRecordInfo;
    if (!info) return null;
    return {
      ...info,
      Stake: flattenTx(info.Stake),
      Unstake: flattenTx(info.Unstake),
    };
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staking_cst_rewards(): Promise<StakingCSTReward[]> {
  try {
    const { data } = await axios.get(getAPIUrl('staking/cst/rewards/global'));
    return flattenTxArray<StakingCSTReward>(data.StakingCSTRewards);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staking_cst_rewards_by_round(round: number) {
  try {
    const { data } = await axios.get(getAPIUrl(`staking/cst/rewards/by_round/${round}`));
    return flattenTxArray(data.Rewards);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staking_cst_reward_paid_records_by_user(address: string) {
  try {
    const { data } = await axios.get(getAPIUrl(`staking/cst/rewards/paid/by_user/${address}`));
    return flattenTxArray(data.RewardPaidRecords);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staked_cst_tokens(): Promise<StakedTokenInfo[]> {
  try {
    const { data } = await axios.get(getAPIUrl('staking/cst/staked_tokens/all'));
    return data.StakedTokensCST;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staking_rewards_by_user(address: string): Promise<RewardsByToken[]> {
  try {
    const { data } = await axios.get(
      getAPIUrl(`staking/cst/rewards/by_user/by_token/summary/${address}`),
    );
    return data.RewardsByToken;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staking_rewards_by_user_by_token_details(
  address: string,
  tokenId: number,
) {
  try {
    const { data } = await axios.get(
      getAPIUrl(`staking/cst/rewards/by_user/by_token/details/${address}/${tokenId}`),
    );
    const details = data.RewardsByTokenDetails;
    if (!details || typeof details !== 'object') return details;
    const flattenStakeOrUnstake = (
      obj: Record<string, unknown> | null,
    ): Record<string, unknown> | null => {
      if (!obj) return obj;
      const tx = obj.Tx;
      if (tx && typeof tx === 'object') {
        const { Tx: _tx, ...rest } = obj;
        const txRec = tx as Record<string, unknown>;
        return {
          ...rest,
          EvtLogId: txRec.EvtLogId,
          BlockNum: txRec.BlockNum,
          TxId: txRec.TxId,
          TxHash: txRec.TxHash,
          TimeStamp: txRec.TimeStamp,
          DateTime: txRec.DateTime,
        };
      }
      return obj;
    };
    const result: Record<string, unknown> = {};
    Object.keys(details).forEach((key) => {
      const item = details[key] as Record<string, unknown> | null;
      if (!item) {
        result[key] = item;
        return;
      }
      result[key] = {
        ...item,
        Stake: flattenStakeOrUnstake(item.Stake as Record<string, unknown> | null),
        Unstake: flattenStakeOrUnstake(item.Unstake as Record<string, unknown> | null),
      };
    });
    return result;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staking_cst_by_user_by_deposit_rewards(address: string) {
  try {
    const { data } = await axios.get(
      getAPIUrl(`staking/cst/rewards/by_user/by_deposit/${address}`),
    );
    return flattenTxArray(data.RewardsByDeposit);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staking_rwalk_actions_info(
  actionId: number,
): Promise<CombinedStakingRecordInfo | null> {
  try {
    const { data } = await axios.get(getAPIUrl(`staking/rwalk/actions/info/${actionId}`));
    const info = data.CombinedRWalkStakingRecordInfo;
    if (!info) return null;
    return {
      ...info,
      Stake: flattenTx(info.Stake),
      Unstake: flattenTx(info.Unstake),
    };
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return null;
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staking_rwalk_actions(): Promise<StakingAction[]> {
  try {
    const { data } = await axios.get(getAPIUrl('staking/rwalk/actions/global/0/1000000'));
    return flattenTxArray<StakingAction>(data.GlobalStakingActionsRWalk);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staking_rwalk_actions_by_user(address: string): Promise<StakingAction[]> {
  try {
    const { data } = await axios.get(
      getAPIUrl(`staking/rwalk/actions/by_user/${address}/0/1000000`),
    );
    return flattenTxArray<StakingAction>(data.UserStakingActionsRWalk);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staking_rwalk_mints_global(): Promise<StakingRewardMint[]> {
  try {
    const { data } = await axios.get(getAPIUrl('staking/rwalk/mints/global/0/1000000'));
    return flattenTxArray<StakingRewardMint>(data.StakingRWalkRewardsMints);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staking_rwalk_mints_by_user(
  address: string,
): Promise<StakingRewardMint[]> {
  try {
    const { data } = await axios.get(getAPIUrl(`staking/rwalk/mints/by_user/${address}`));
    return flattenTxArray<StakingRewardMint>(data.RWalkStakingRewardMints);
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staked_rwalk_tokens(): Promise<StakedTokenInfo[]> {
  try {
    const { data } = await axios.get(getAPIUrl('staking/rwalk/staked_tokens/all'));
    return data.StakedTokensRWalk;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}

export async function get_staked_rwalk_tokens_by_user(address: string): Promise<StakedTokenInfo[]> {
  try {
    const { data } = await axios.get(getAPIUrl(`staking/rwalk/staked_tokens/by_user/${address}`));
    return data.StakedTokensRWalk;
  } catch (err: unknown) {
    if (isAxiosError(err) && err.response?.status === 400) {
      return [];
    }
    throw new Error('Network response was not OK');
  }
}
