import {
  apiGet,
  getAPIUrl,
  apiCall,
  apiCallRequired,
  flattenTx,
  flattenTxArray,
  pagedPath,
  type ApiListRequestOptions,
  type ApiRequestOptions,
} from './client';
import {
  AnchorActionSchema,
  AnchoredTokenCSTSchema,
  AnchoredTokenRWalkSchema,
  safeValidateListSample,
  validateList,
} from './schemas';
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

/**
 * Fetches unclaimed Cosmic Signature NFT anchoring rewards (ETH deposits) for a wallet address.
 * Required read: an empty list is what "nothing to collect" looks like, so it must not double as
 * the failure result.
 */
export function get_staking_cst_rewards_to_claim_by_user(
  address: string,
  opts?: ApiRequestOptions,
): Promise<CSTAnchorDistribution[]> {
  return apiCallRequired(async () => {
    const { data } = await apiGet(
      getAPIUrl(`staking/cst/rewards/to_claim/by_user/${address}`),
      opts,
    );
    return flattenTxArray<CSTAnchorDistribution>(data.UnclaimedEthDeposits);
  });
}

/** Fetches already-collected Cosmic Signature NFT anchoring rewards for a wallet address (optionally paged). */
export function get_staking_cst_rewards_collected_by_user(
  address: string,
  opts?: ApiListRequestOptions,
): Promise<CSTAnchorDistribution[]> {
  return apiCall(async () => {
    const { data } = await apiGet(
      getAPIUrl(`staking/cst/rewards/collected/by_user/${address}/${pagedPath(opts)}`),
      opts,
    );
    return flattenTxArray<CSTAnchorDistribution>(data.CollectedStakingCSTRewards);
  }, []);
}

/**
 * Fetches Cosmic Signature NFTs currently anchored by a wallet address. Required read, strictly
 * validated — this list drives which tokens a holder can release.
 */
export function get_staked_cst_tokens_by_user(
  address: string,
  opts?: ApiRequestOptions,
): Promise<AnchoredTokenInfo[]> {
  return apiCallRequired(async () => {
    const { data } = await apiGet(getAPIUrl(`staking/cst/staked_tokens/by_user/${address}`), opts);
    return validateList(
      AnchoredTokenCSTSchema,
      data.StakedTokensCST,
      'stakedTokensCST[byUser]',
    ) as AnchoredTokenInfo[];
  });
}

/** Fetches anchoring action IDs with claim status for a user's deposit. */
export function get_cst_action_ids_by_deposit_id(
  user_addr: string,
  deposit_id: number,
  opts?: ApiRequestOptions,
): Promise<ActionIdWithClaimInfo[] | null> {
  return apiCall(async () => {
    const { data } = await apiGet(
      getAPIUrl(`staking/cst/rewards/action_ids_by_deposit/${user_addr}/${deposit_id}`),
      opts,
    );
    return data.ActionIdsWithClaimInfo as ActionIdWithClaimInfo[];
  }, null);
}

/** Fetches Cosmic Signature NFT anchor/release actions performed by a wallet address (optionally paged). */
export function get_staking_cst_actions_by_user(
  address: string,
  opts?: ApiListRequestOptions,
): Promise<AnchorAction[]> {
  return apiCall(async () => {
    const { data } = await apiGet(
      getAPIUrl(`staking/cst/actions/by_user/${address}/${pagedPath(opts)}`),
      opts,
    );
    return flattenTxArray<AnchorAction>(data.StakingCSTActions);
  }, []);
}

/** Fetches Cosmic Signature NFT anchor/release actions globally (optionally paged). */
export function get_staking_cst_actions(opts?: ApiListRequestOptions): Promise<AnchorAction[]> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl(`staking/cst/actions/global/${pagedPath(opts)}`), opts);
    return safeValidateListSample(
      AnchorActionSchema,
      flattenTxArray<AnchorAction>(data.StakingCSTActions),
      'stakingCSTActions',
    ) as AnchorAction[];
  }, []);
}

/** Fetches combined anchor + release record details for a Cosmic Signature NFT anchoring action. */
export function get_staking_cst_actions_info(
  actionId: number,
  opts?: ApiRequestOptions,
): Promise<CombinedAnchorRecordInfo | null> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl(`staking/cst/actions/info/${actionId}`), opts);
    const info = data.CombinedAnchorRecordInfo;
    if (!info) return null;
    return {
      ...info,
      Stake: flattenTx(info.Stake),
      Unstake: flattenTx(info.Unstake),
    };
  }, null);
}

/** Fetches all Cosmic Signature NFT anchoring rewards globally. */
export function get_staking_cst_rewards(
  opts?: ApiRequestOptions,
): Promise<CSTAnchorDistribution[]> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl('staking/cst/rewards/global'), opts);
    return flattenTxArray<CSTAnchorDistribution>(data.StakingCSTRewards);
  }, []);
}

/** Fetches Cosmic Signature NFT anchoring rewards distributed in a specific round. */
export function get_staking_cst_rewards_by_round(
  round: number,
  opts?: ApiRequestOptions,
): Promise<CSTAnchorDistribution[]> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl(`staking/cst/rewards/by_round/${round}`), opts);
    return flattenTxArray<CSTAnchorDistribution>(data.Rewards);
  }, []);
}

/**
 * Fetches all currently anchored Cosmic Signature NFTs globally.
 *
 * Strictly validated against the CST row shape: the token id lives under
 * `TokenInfo.TokenId`, not in a flat `StakedTokenId`.
 */
export function get_staked_cst_tokens(opts?: ApiRequestOptions): Promise<AnchoredTokenInfo[]> {
  return apiCallRequired(async () => {
    const { data } = await apiGet(getAPIUrl('staking/cst/staked_tokens/all'), opts);
    return validateList(
      AnchoredTokenCSTSchema,
      data.StakedTokensCST,
      'stakedTokensCST',
    ) as AnchoredTokenInfo[];
  });
}

/** Fetches a per-token summary of anchoring rewards for a wallet address. */
export function get_staking_rewards_by_user(
  address: string,
  opts?: ApiRequestOptions,
): Promise<RewardsByToken[]> {
  return apiCall(async () => {
    const { data } = await apiGet(
      getAPIUrl(`staking/cst/rewards/by_user/by_token/summary/${address}`),
      opts,
    );
    return data.RewardsByToken as RewardsByToken[];
  }, []);
}

/** Fetches detailed anchoring reward breakdown for a specific user + token pair, with flattened anchor/release tx fields. */
export function get_staking_rewards_by_user_by_token_details(
  address: string,
  tokenId: number,
  opts?: ApiRequestOptions,
): Promise<Record<string, unknown> | null> {
  return apiCall(async () => {
    const { data } = await apiGet(
      getAPIUrl(`staking/cst/rewards/by_user/by_token/details/${address}/${tokenId}`),
      opts,
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

/** Fetches Cosmic Signature NFT anchoring rewards grouped by deposit for a wallet address. */
export function get_staking_cst_by_user_by_deposit_rewards(
  address: string,
  opts?: ApiRequestOptions,
): Promise<CSTAnchorDistribution[]> {
  return apiCall(async () => {
    const { data } = await apiGet(
      getAPIUrl(`staking/cst/rewards/by_user/by_deposit/${address}`),
      opts,
    );
    return flattenTxArray<CSTAnchorDistribution>(data.RewardsByDeposit);
  }, []);
}

/** Fetches combined anchor + release record details for a RandomWalk anchoring action. */
export function get_staking_rwalk_actions_info(
  actionId: number,
  opts?: ApiRequestOptions,
): Promise<CombinedAnchorRecordInfo | null> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl(`staking/randomwalk/actions/info/${actionId}`), opts);
    const info = data.CombinedRWalkStakingRecordInfo;
    if (!info) return null;
    return {
      ...info,
      Stake: flattenTx(info.Stake),
      Unstake: flattenTx(info.Unstake),
    };
  }, null);
}

/** Fetches RandomWalk anchor/release actions globally (optionally paged). */
export function get_staking_rwalk_actions(opts?: ApiListRequestOptions): Promise<AnchorAction[]> {
  return apiCall(async () => {
    const { data } = await apiGet(
      getAPIUrl(`staking/randomwalk/actions/global/${pagedPath(opts)}`),
      opts,
    );
    return safeValidateListSample(
      AnchorActionSchema,
      flattenTxArray<AnchorAction>(data.GlobalStakingActionsRWalk),
      'stakingRWalkActions',
    ) as AnchorAction[];
  }, []);
}

/** Fetches RandomWalk anchor/release actions performed by a wallet address (optionally paged). */
export function get_staking_rwalk_actions_by_user(
  address: string,
  opts?: ApiListRequestOptions,
): Promise<AnchorAction[]> {
  return apiCall(async () => {
    const { data } = await apiGet(
      getAPIUrl(`staking/randomwalk/actions/by_user/${address}/${pagedPath(opts)}`),
      opts,
    );
    return flattenTxArray<AnchorAction>(data.UserStakingActionsRWalk);
  }, []);
}

/** Fetches RandomWalk anchoring reward mint records globally (optionally paged). */
export function get_staking_rwalk_mints_global(
  opts?: ApiListRequestOptions,
): Promise<AnchorDistributionImprint[]> {
  return apiCall(async () => {
    const { data } = await apiGet(
      getAPIUrl(`staking/randomwalk/mints/global/${pagedPath(opts)}`),
      opts,
    );
    return flattenTxArray<AnchorDistributionImprint>(data.StakingRWalkRewardsMints);
  }, []);
}

/** Fetches RandomWalk anchoring reward mint records for a wallet address. */
export function get_staking_rwalk_mints_by_user(
  address: string,
  opts?: ApiRequestOptions,
): Promise<AnchorDistributionImprint[]> {
  return apiCall(async () => {
    const { data } = await apiGet(getAPIUrl(`staking/randomwalk/mints/by_user/${address}`), opts);
    return flattenTxArray<AnchorDistributionImprint>(data.RWalkStakingRewardMints);
  }, []);
}

/**
 * Fetches all currently staked RandomWalk NFTs globally. Strictly validated against the
 * RandomWalk row shape (flat `StakedTokenId` / `StakeActionId`).
 */
export function get_staked_rwalk_tokens(opts?: ApiRequestOptions): Promise<AnchoredTokenInfo[]> {
  return apiCallRequired(async () => {
    const { data } = await apiGet(getAPIUrl('staking/randomwalk/staked_tokens/all'), opts);
    return validateList(
      AnchoredTokenRWalkSchema,
      data.StakedTokensRWalk,
      'stakedTokensRWalk',
    ) as AnchoredTokenInfo[];
  });
}

/**
 * Fetches RandomWalk NFTs currently staked by a wallet address. Required read, strictly
 * validated — this list drives which tokens a holder can release.
 */
export function get_staked_rwalk_tokens_by_user(
  address: string,
  opts?: ApiRequestOptions,
): Promise<AnchoredTokenInfo[]> {
  return apiCallRequired(async () => {
    const { data } = await apiGet(
      getAPIUrl(`staking/randomwalk/staked_tokens/by_user/${address}`),
      opts,
    );
    return validateList(
      AnchoredTokenRWalkSchema,
      data.StakedTokensRWalk,
      'stakedTokensRWalk[byUser]',
    ) as AnchoredTokenInfo[];
  });
}

// lexicon-allow-end
