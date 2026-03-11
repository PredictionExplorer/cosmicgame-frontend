import { axios, getAPIUrl, apiCall, flattenTx, flattenTxArray } from './client';
import type {
  ActionIdWithClaimInfo,
  StakingCSTReward,
  StakingAction,
  StakedTokenInfo,
  CombinedStakingRecordInfo,
  RewardsByToken,
  StakingRewardMint,
} from './types';

/** Fetches unclaimed CST staking rewards (ETH deposits) for a wallet address. */
export function get_staking_cst_rewards_to_claim_by_user(
  address: string,
): Promise<StakingCSTReward[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`staking/cst/rewards/to_claim/by_user/${address}`));
    return flattenTxArray<StakingCSTReward>(data.UnclaimedEthDeposits);
  }, []);
}

/** Fetches already-collected CST staking rewards for a wallet address. */
export function get_staking_cst_rewards_collected_by_user(
  address: string,
): Promise<StakingCSTReward[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`staking/cst/rewards/collected/by_user/${address}/0/1000000`),
    );
    return flattenTxArray<StakingCSTReward>(data.CollectedStakingCSTRewards);
  }, []);
}

/** Fetches Cosmic Signature Tokens currently staked by a wallet address. */
export function get_staked_cst_tokens_by_user(address: string): Promise<StakedTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`staking/cst/staked_tokens/by_user/${address}`));
    return data.StakedTokensCST as StakedTokenInfo[];
  }, []);
}

/** Fetches staking action IDs with claim status for a user's deposit. */
export function get_cst_action_ids_by_deposit_id(
  user_addr: string,
  deposit_id: number,
): Promise<ActionIdWithClaimInfo[] | null> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`staking/cst/rewards/action_ids_by_deposit/${user_addr}/${deposit_id}`),
    );
    return data.ActionIdsWithClaimInfo as ActionIdWithClaimInfo[];
  }, null);
}

/** Fetches CST stake/unstake actions performed by a wallet address. */
export function get_staking_cst_actions_by_user(address: string): Promise<StakingAction[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`staking/cst/actions/by_user/${address}/0/1000000`));
    return flattenTxArray<StakingAction>(data.StakingCSTActions);
  }, []);
}

/** Fetches all CST stake/unstake actions globally. */
export function get_staking_cst_actions(): Promise<StakingAction[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('staking/cst/actions/global/0/1000000'));
    return flattenTxArray<StakingAction>(data.StakingCSTActions);
  }, []);
}

/** Fetches combined stake + unstake record details for a CST staking action. */
export function get_staking_cst_actions_info(
  actionId: number,
): Promise<CombinedStakingRecordInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`staking/cst/actions/info/${actionId}`));
    const info = data.CombinedStakingRecordInfo;
    if (!info) return null;
    return {
      ...info,
      Stake: flattenTx(info.Stake),
      Unstake: flattenTx(info.Unstake),
    };
  }, null);
}

/** Fetches all CST staking rewards globally. */
export function get_staking_cst_rewards(): Promise<StakingCSTReward[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('staking/cst/rewards/global'));
    return flattenTxArray<StakingCSTReward>(data.StakingCSTRewards);
  }, []);
}

/** Fetches CST staking rewards distributed in a specific round. */
export function get_staking_cst_rewards_by_round(round: number): Promise<StakingCSTReward[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`staking/cst/rewards/by_round/${round}`));
    return flattenTxArray<StakingCSTReward>(data.Rewards);
  }, []);
}

/** Fetches CST staking reward-paid records for a wallet address. */
export function get_staking_cst_reward_paid_records_by_user(
  address: string,
): Promise<StakingCSTReward[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`staking/cst/rewards/paid/by_user/${address}`));
    return flattenTxArray<StakingCSTReward>(data.RewardPaidRecords);
  }, []);
}

/** Fetches all currently staked Cosmic Signature Tokens globally. */
export function get_staked_cst_tokens(): Promise<StakedTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('staking/cst/staked_tokens/all'));
    return data.StakedTokensCST as StakedTokenInfo[];
  }, []);
}

/** Fetches a per-token summary of staking rewards for a wallet address. */
export function get_staking_rewards_by_user(address: string): Promise<RewardsByToken[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`staking/cst/rewards/by_user/by_token/summary/${address}`),
    );
    return data.RewardsByToken as RewardsByToken[];
  }, []);
}

/** Fetches detailed staking reward breakdown for a specific user + token pair, with flattened stake/unstake tx fields. */
export function get_staking_rewards_by_user_by_token_details(
  address: string,
  tokenId: number,
): Promise<Record<string, unknown> | null> {
  return apiCall(async () => {
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
  }, null);
}

/** Fetches CST staking rewards grouped by deposit for a wallet address. */
export function get_staking_cst_by_user_by_deposit_rewards(
  address: string,
): Promise<StakingCSTReward[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`staking/cst/rewards/by_user/by_deposit/${address}`),
    );
    return flattenTxArray<StakingCSTReward>(data.RewardsByDeposit);
  }, []);
}

/** Fetches combined stake + unstake record details for a RandomWalk staking action. */
export function get_staking_rwalk_actions_info(
  actionId: number,
): Promise<CombinedStakingRecordInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`staking/rwalk/actions/info/${actionId}`));
    const info = data.CombinedRWalkStakingRecordInfo;
    if (!info) return null;
    return {
      ...info,
      Stake: flattenTx(info.Stake),
      Unstake: flattenTx(info.Unstake),
    };
  }, null);
}

/** Fetches all RandomWalk stake/unstake actions globally. */
export function get_staking_rwalk_actions(): Promise<StakingAction[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('staking/rwalk/actions/global/0/1000000'));
    return flattenTxArray<StakingAction>(data.GlobalStakingActionsRWalk);
  }, []);
}

/** Fetches RandomWalk stake/unstake actions performed by a wallet address. */
export function get_staking_rwalk_actions_by_user(address: string): Promise<StakingAction[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`staking/rwalk/actions/by_user/${address}/0/1000000`),
    );
    return flattenTxArray<StakingAction>(data.UserStakingActionsRWalk);
  }, []);
}

/** Fetches all RandomWalk staking reward mint records globally. */
export function get_staking_rwalk_mints_global(): Promise<StakingRewardMint[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('staking/rwalk/mints/global/0/1000000'));
    return flattenTxArray<StakingRewardMint>(data.StakingRWalkRewardsMints);
  }, []);
}

/** Fetches RandomWalk staking reward mint records for a wallet address. */
export function get_staking_rwalk_mints_by_user(address: string): Promise<StakingRewardMint[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`staking/rwalk/mints/by_user/${address}`));
    return flattenTxArray<StakingRewardMint>(data.RWalkStakingRewardMints);
  }, []);
}

/** Fetches all currently staked RandomWalk NFTs globally. */
export function get_staked_rwalk_tokens(): Promise<StakedTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('staking/rwalk/staked_tokens/all'));
    return data.StakedTokensRWalk as StakedTokenInfo[];
  }, []);
}

/** Fetches RandomWalk NFTs currently staked by a wallet address. */
export function get_staked_rwalk_tokens_by_user(address: string): Promise<StakedTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`staking/rwalk/staked_tokens/by_user/${address}`));
    return data.StakedTokensRWalk as StakedTokenInfo[];
  }, []);
}
