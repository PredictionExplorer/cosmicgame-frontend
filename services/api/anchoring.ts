import { axios, getAPIUrl, apiCall, flattenTx, flattenTxArray } from './client';
import type {
  ActionIdWithClaimInfo,
  CSTAnchorDistribution,
  AnchorAction,
  AnchoredTokenInfo,
  CombinedAnchorRecordInfo,
  RewardsByToken,
  AnchorDistributionImprint,
} from './types';

// lexicon-allow-start: backend HTTP URL paths mirror the Go server routes and are a sealed contract

/** Fetches unclaimed CST anchoring rewards (ETH deposits) for a wallet address. */
export function get_staking_cst_rewards_to_claim_by_user(
  address: string,
): Promise<CSTAnchorDistribution[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`staking/cst/rewards/to_claim/by_user/${address}`),
    );
    return flattenTxArray<CSTAnchorDistribution>(data.UnclaimedEthDeposits);
  }, []);
}

/** Fetches already-collected CST anchoring rewards for a wallet address. */
export function get_staking_cst_rewards_collected_by_user(
  address: string,
): Promise<CSTAnchorDistribution[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`staking/cst/rewards/collected/by_user/${address}/0/1000000`),
    );
    return flattenTxArray<CSTAnchorDistribution>(data.CollectedStakingCSTRewards);
  }, []);
}

/** Fetches Cosmic Signature Tokens currently staked by a wallet address. */
export function get_staked_cst_tokens_by_user(address: string): Promise<AnchoredTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`staking/cst/staked_tokens/by_user/${address}`));
    return data.StakedTokensCST as AnchoredTokenInfo[];
  }, []);
}

/** Fetches anchoring action IDs with claim status for a user's deposit. */
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

/** Fetches CST anchor/release actions performed by a wallet address. */
export function get_staking_cst_actions_by_user(address: string): Promise<AnchorAction[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`staking/cst/actions/by_user/${address}/0/1000000`),
    );
    return flattenTxArray<AnchorAction>(data.StakingCSTActions);
  }, []);
}

/** Fetches all CST anchor/release actions globally. */
export function get_staking_cst_actions(): Promise<AnchorAction[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('staking/cst/actions/global/0/1000000'));
    return flattenTxArray<AnchorAction>(data.StakingCSTActions);
  }, []);
}

/** Fetches combined anchor + release record details for a CST anchoring action. */
export function get_staking_cst_actions_info(
  actionId: number,
): Promise<CombinedAnchorRecordInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`staking/cst/actions/info/${actionId}`));
    const info = data.CombinedAnchorRecordInfo;
    if (!info) return null;
    return {
      ...info,
      Stake: flattenTx(info.Stake),
      Unstake: flattenTx(info.Unstake),
    };
  }, null);
}

/** Fetches all CST anchoring rewards globally. */
export function get_staking_cst_rewards(): Promise<CSTAnchorDistribution[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('staking/cst/rewards/global'));
    return flattenTxArray<CSTAnchorDistribution>(data.StakingCSTRewards);
  }, []);
}

/** Fetches CST anchoring rewards distributed in a specific round. */
export function get_staking_cst_rewards_by_round(round: number): Promise<CSTAnchorDistribution[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`staking/cst/rewards/by_round/${round}`));
    return flattenTxArray<CSTAnchorDistribution>(data.Rewards);
  }, []);
}

/** Fetches CST anchoring reward-paid records for a wallet address. */
export function get_staking_cst_reward_paid_records_by_user(
  address: string,
): Promise<CSTAnchorDistribution[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`staking/cst/rewards/paid/by_user/${address}`));
    return flattenTxArray<CSTAnchorDistribution>(data.RewardPaidRecords);
  }, []);
}

/** Fetches all currently staked Cosmic Signature Tokens globally. */
export function get_staked_cst_tokens(): Promise<AnchoredTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('staking/cst/staked_tokens/all'));
    return data.StakedTokensCST as AnchoredTokenInfo[];
  }, []);
}

/** Fetches a per-token summary of anchoring rewards for a wallet address. */
export function get_staking_rewards_by_user(address: string): Promise<RewardsByToken[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`staking/cst/rewards/by_user/by_token/summary/${address}`),
    );
    return data.RewardsByToken as RewardsByToken[];
  }, []);
}

/** Fetches detailed anchoring reward breakdown for a specific user + token pair, with flattened anchor/release tx fields. */
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

/** Fetches CST anchoring rewards grouped by deposit for a wallet address. */
export function get_staking_cst_by_user_by_deposit_rewards(
  address: string,
): Promise<CSTAnchorDistribution[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`staking/cst/rewards/by_user/by_deposit/${address}`),
    );
    return flattenTxArray<CSTAnchorDistribution>(data.RewardsByDeposit);
  }, []);
}

/** Fetches combined anchor + release record details for a RandomWalk anchoring action. */
export function get_staking_rwalk_actions_info(
  actionId: number,
): Promise<CombinedAnchorRecordInfo | null> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`staking/randomwalk/actions/info/${actionId}`));
    const info = data.CombinedRWalkStakingRecordInfo;
    if (!info) return null;
    return {
      ...info,
      Stake: flattenTx(info.Stake),
      Unstake: flattenTx(info.Unstake),
    };
  }, null);
}

/** Fetches all RandomWalk anchor/release actions globally. */
export function get_staking_rwalk_actions(): Promise<AnchorAction[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('staking/randomwalk/actions/global/0/1000000'));
    return flattenTxArray<AnchorAction>(data.GlobalStakingActionsRWalk);
  }, []);
}

/** Fetches RandomWalk anchor/release actions performed by a wallet address. */
export function get_staking_rwalk_actions_by_user(address: string): Promise<AnchorAction[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`staking/randomwalk/actions/by_user/${address}/0/1000000`),
    );
    return flattenTxArray<AnchorAction>(data.UserStakingActionsRWalk);
  }, []);
}

/** Fetches all RandomWalk anchoring reward mint records globally. */
export function get_staking_rwalk_mints_global(): Promise<AnchorDistributionImprint[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('staking/randomwalk/mints/global/0/1000000'));
    return flattenTxArray<AnchorDistributionImprint>(data.StakingRWalkRewardsMints);
  }, []);
}

/** Fetches RandomWalk anchoring reward mint records for a wallet address. */
export function get_staking_rwalk_mints_by_user(
  address: string,
): Promise<AnchorDistributionImprint[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl(`staking/randomwalk/mints/by_user/${address}`));
    return flattenTxArray<AnchorDistributionImprint>(data.RWalkStakingRewardMints);
  }, []);
}

/** Fetches all currently staked RandomWalk NFTs globally. */
export function get_staked_rwalk_tokens(): Promise<AnchoredTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(getAPIUrl('staking/randomwalk/staked_tokens/all'));
    return data.StakedTokensRWalk as AnchoredTokenInfo[];
  }, []);
}

/** Fetches RandomWalk NFTs currently staked by a wallet address. */
export function get_staked_rwalk_tokens_by_user(address: string): Promise<AnchoredTokenInfo[]> {
  return apiCall(async () => {
    const { data } = await axios.get(
      getAPIUrl(`staking/randomwalk/staked_tokens/by_user/${address}`),
    );
    return data.StakedTokensRWalk as AnchoredTokenInfo[];
  }, []);
}

// lexicon-allow-end
