import { useQuery } from '@tanstack/react-query';

import api from '../services/api';
import type {
  BidInfo,
  CombinedStakingRecordInfo,
  CSTTokenInfo,
  CSTTransferRecord,
  CTBalanceDistribution,
  DashboardInfo,
  NameHistoryRecord,
  RewardsByToken,
  RoundInfo,
  StakedTokenInfo,
  StakingAction,
  StakingCSTReward,
  StakingRewardMint,
  TokenDistribution,
  TxInfo,
  UsedRWLKNFT,
  UserBalance,
  UserInfoWithLists,
} from '../services/api';

// ---------------------------------------------------------------------------
// Rounds & Bidding
// ---------------------------------------------------------------------------

export function useDashboardInfo() {
  return useQuery<DashboardInfo | null>({
    queryKey: ['dashboardInfo'],
    queryFn: () => api.get_dashboard_info(),
    refetchInterval: 12_000,
    refetchIntervalInBackground: false,
    staleTime: 5_000,
  });
}

export function useRoundList() {
  return useQuery<RoundInfo[]>({
    queryKey: ['roundList'],
    queryFn: () => api.get_round_list(),
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}

export function useRoundInfo(roundNum: number) {
  return useQuery<RoundInfo | null>({
    queryKey: ['roundInfo', roundNum],
    queryFn: () => api.get_round_info(roundNum),
    enabled: roundNum > 0,
    staleTime: 30_000,
  });
}

export function usePrizeTime() {
  return useQuery<number>({
    queryKey: ['prizeTime'],
    queryFn: () => api.get_prize_time(),
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  });
}

export function useClaimHistory() {
  return useQuery<TxInfo[]>({
    queryKey: ['claimHistory'],
    queryFn: () => api.get_claim_history(),
    staleTime: 30_000,
  });
}

export function useClaimHistoryByUser(address: string | null | undefined) {
  return useQuery<TxInfo[] | null>({
    queryKey: ['claimHistoryByUser', address],
    queryFn: () => api.get_claim_history_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useBidList() {
  return useQuery<BidInfo[]>({
    queryKey: ['bidList'],
    queryFn: () => api.get_bid_list(),
    staleTime: 10_000,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
}

export function useBidInfo(evtLogId: number) {
  return useQuery<BidInfo | null>({
    queryKey: ['bidInfo', evtLogId],
    queryFn: () => api.get_bid_info(evtLogId),
    enabled: evtLogId > 0,
    staleTime: 60_000,
  });
}

export function useBidListByRound(round: number, sortDir: string = 'desc') {
  return useQuery<BidInfo[]>({
    queryKey: ['bidListByRound', round, sortDir],
    queryFn: () => api.get_bid_list_by_round(round, sortDir),
    enabled: round >= 0,
    staleTime: 15_000,
  });
}

export function useCurrentSpecialWinners() {
  return useQuery({
    queryKey: ['currentSpecialWinners'],
    queryFn: () => api.get_current_special_winners(),
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function usePrizeDepositsList() {
  return useQuery<TxInfo[]>({
    queryKey: ['prizeDepositsList'],
    queryFn: () => api.get_prize_deposits_list(),
    staleTime: 30_000,
  });
}

export function usePrizeDepositsByRound(round: number) {
  return useQuery<TxInfo[]>({
    queryKey: ['prizeDepositsByRound', round],
    queryFn: () => api.get_prize_deposits_by_round(round),
    enabled: round >= 0,
    staleTime: 30_000,
  });
}

export function useBannedBids() {
  return useQuery({
    queryKey: ['bannedBids'],
    queryFn: () => api.get_banned_bids(),
    staleTime: 30_000,
  });
}

export function useBidEthPrice() {
  return useQuery({
    queryKey: ['bidEthPrice'],
    queryFn: () => api.get_bid_eth_price(),
    staleTime: 10_000,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
}

export function useTimeUntilPrize() {
  return useQuery<number>({
    queryKey: ['timeUntilPrize'],
    queryFn: () => api.get_time_until_prize(),
    staleTime: 5_000,
    refetchInterval: 10_000,
    refetchIntervalInBackground: false,
  });
}

// ---------------------------------------------------------------------------
// Tokens (CST / CT)
// ---------------------------------------------------------------------------

export function useCSTList() {
  return useQuery<CSTTokenInfo[]>({
    queryKey: ['cstList'],
    queryFn: () => api.get_cst_list(),
    staleTime: 30_000,
  });
}

export function useCSTTokensByUser(address: string | null | undefined) {
  return useQuery<CSTTokenInfo[]>({
    queryKey: ['cstTokensByUser', address],
    queryFn: () => api.get_cst_tokens_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useCSTInfo(tokenId: number | null | undefined) {
  return useQuery<CSTTokenInfo | null>({
    queryKey: ['cstInfo', tokenId],
    queryFn: () => api.get_cst_info(tokenId!),
    enabled: tokenId != null && tokenId >= 0,
    staleTime: 60_000,
  });
}

export function useNameHistory(tokenId: number | null | undefined) {
  return useQuery<NameHistoryRecord[]>({
    queryKey: ['nameHistory', tokenId],
    queryFn: () => api.get_name_history(tokenId!),
    enabled: tokenId != null && tokenId >= 0,
    staleTime: 30_000,
  });
}

export function useTokenByName(name: string | null | undefined) {
  return useQuery<CSTTokenInfo[]>({
    queryKey: ['tokenByName', name],
    queryFn: () => api.get_token_by_name(name!),
    enabled: !!name,
    staleTime: 30_000,
  });
}

export function useNamedNFTs() {
  return useQuery<CSTTokenInfo[]>({
    queryKey: ['namedNFTs'],
    queryFn: () => api.get_named_nfts(),
    staleTime: 30_000,
  });
}

export function useCSTTransfers(address: string | null | undefined) {
  return useQuery<CSTTransferRecord[]>({
    queryKey: ['cstTransfers', address],
    queryFn: () => api.get_cst_transfers(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useCSTDistribution() {
  return useQuery<TokenDistribution[]>({
    queryKey: ['cstDistribution'],
    queryFn: () => api.get_cst_distribution(),
    staleTime: 60_000,
  });
}

export function useCTBalancesDistribution() {
  return useQuery<CTBalanceDistribution[]>({
    queryKey: ['ctBalancesDistribution'],
    queryFn: () => api.get_ct_balances_distribution(),
    staleTime: 60_000,
  });
}

export function useCTTransfers(address: string | null | undefined) {
  return useQuery({
    queryKey: ['ctTransfers', address],
    queryFn: () => api.get_ct_transfers(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useCTOwnershipTransfers(tokenId: number | null | undefined) {
  return useQuery({
    queryKey: ['ctOwnershipTransfers', tokenId],
    queryFn: () => api.get_ct_ownership_transfers(tokenId!),
    enabled: tokenId != null && tokenId >= 0,
    staleTime: 30_000,
  });
}

export function useCTPrice() {
  return useQuery({
    queryKey: ['ctPrice'],
    queryFn: () => api.get_ct_price(),
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useTokenInfo(tokenId: number | string | null | undefined) {
  return useQuery({
    queryKey: ['tokenInfo', tokenId],
    queryFn: () => api.get_info(tokenId!),
    enabled: tokenId != null,
    staleTime: 60_000,
  });
}

export function useUsedRWLKNFTs() {
  return useQuery<UsedRWLKNFT[]>({
    queryKey: ['usedRWLKNFTs'],
    queryFn: () => api.get_used_rwlk_nfts(),
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Staking – CST
// ---------------------------------------------------------------------------

export function useStakingCSTRewardsToClaimByUser(address: string | null | undefined) {
  return useQuery<StakingCSTReward[]>({
    queryKey: ['stakingCSTRewardsToClaim', address],
    queryFn: () => api.get_staking_cst_rewards_to_claim_by_user(address!),
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useStakingCSTRewardsCollectedByUser(address: string | null | undefined) {
  return useQuery<StakingCSTReward[]>({
    queryKey: ['stakingCSTRewardsCollected', address],
    queryFn: () => api.get_staking_cst_rewards_collected_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useStakedCSTTokensByUser(address: string | null | undefined) {
  return useQuery<StakedTokenInfo[]>({
    queryKey: ['stakedCSTTokens', address],
    queryFn: () => api.get_staked_cst_tokens_by_user(address!),
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useCSTActionIdsByDepositId(
  address: string | null | undefined,
  depositId: number | null | undefined,
) {
  return useQuery({
    queryKey: ['cstActionIdsByDeposit', address, depositId],
    queryFn: () => api.get_cst_action_ids_by_deposit_id(address!, depositId!),
    enabled: !!address && depositId != null,
    staleTime: 30_000,
  });
}

export function useStakingCSTActionsByUser(address: string | null | undefined) {
  return useQuery<StakingAction[]>({
    queryKey: ['stakingCSTActionsByUser', address],
    queryFn: () => api.get_staking_cst_actions_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useStakingCSTActions() {
  return useQuery<StakingAction[]>({
    queryKey: ['stakingCSTActions'],
    queryFn: () => api.get_staking_cst_actions(),
    staleTime: 30_000,
  });
}

export function useStakingCSTActionsInfo(actionId: number | null | undefined) {
  return useQuery<CombinedStakingRecordInfo | null>({
    queryKey: ['stakingCSTActionsInfo', actionId],
    queryFn: () => api.get_staking_cst_actions_info(actionId!),
    enabled: actionId != null && actionId >= 0,
    staleTime: 30_000,
  });
}

export function useStakingCSTRewards() {
  return useQuery<StakingCSTReward[]>({
    queryKey: ['stakingCSTRewards'],
    queryFn: () => api.get_staking_cst_rewards(),
    staleTime: 30_000,
  });
}

export function useStakingCSTRewardsByRound(round: number | null | undefined) {
  return useQuery({
    queryKey: ['stakingCSTRewardsByRound', round],
    queryFn: () => api.get_staking_cst_rewards_by_round(round!),
    enabled: round != null && round >= 0,
    staleTime: 30_000,
  });
}

export function useStakingCSTRewardPaidRecordsByUser(address: string | null | undefined) {
  return useQuery({
    queryKey: ['stakingCSTRewardPaidRecords', address],
    queryFn: () => api.get_staking_cst_reward_paid_records_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useStakedCSTTokensGlobal() {
  return useQuery<StakedTokenInfo[]>({
    queryKey: ['stakedCSTTokensGlobal'],
    queryFn: () => api.get_staked_cst_tokens(),
    staleTime: 30_000,
  });
}

export function useStakingRewardsByUser(address: string | null | undefined) {
  return useQuery<RewardsByToken[]>({
    queryKey: ['stakingRewardsByUser', address],
    queryFn: () => api.get_staking_rewards_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useStakingRewardsByUserByTokenDetails(
  address: string | null | undefined,
  tokenId: number | null | undefined,
) {
  return useQuery({
    queryKey: ['stakingRewardsByUserByToken', address, tokenId],
    queryFn: () => api.get_staking_rewards_by_user_by_token_details(address!, tokenId!),
    enabled: !!address && tokenId != null,
    staleTime: 30_000,
  });
}

export function useStakingCSTByUserByDepositRewards(address: string | null | undefined) {
  return useQuery({
    queryKey: ['stakingCSTByUserByDeposit', address],
    queryFn: () => api.get_staking_cst_by_user_by_deposit_rewards(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Staking – RWLK
// ---------------------------------------------------------------------------

export function useStakingRWLKActionsInfo(actionId: number | null | undefined) {
  return useQuery<CombinedStakingRecordInfo | null>({
    queryKey: ['stakingRWLKActionsInfo', actionId],
    queryFn: () => api.get_staking_rwalk_actions_info(actionId!),
    enabled: actionId != null && actionId >= 0,
    staleTime: 30_000,
  });
}

export function useStakingRWLKActions() {
  return useQuery<StakingAction[]>({
    queryKey: ['stakingRWLKActions'],
    queryFn: () => api.get_staking_rwalk_actions(),
    staleTime: 30_000,
  });
}

export function useStakingRWLKActionsByUser(address: string | null | undefined) {
  return useQuery<StakingAction[]>({
    queryKey: ['stakingRWLKActionsByUser', address],
    queryFn: () => api.get_staking_rwalk_actions_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useStakingRWLKMintsGlobal() {
  return useQuery<StakingRewardMint[]>({
    queryKey: ['stakingRWLKMintsGlobal'],
    queryFn: () => api.get_staking_rwalk_mints_global(),
    staleTime: 30_000,
  });
}

export function useStakingRWLKMintsByUser(address: string | null | undefined) {
  return useQuery<StakingRewardMint[]>({
    queryKey: ['stakingRWLKMintsByUser', address],
    queryFn: () => api.get_staking_rwalk_mints_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useStakedRWLKTokensGlobal() {
  return useQuery<StakedTokenInfo[]>({
    queryKey: ['stakedRWLKTokensGlobal'],
    queryFn: () => api.get_staked_rwalk_tokens(),
    staleTime: 30_000,
  });
}

export function useStakedRWLKTokensByUser(address: string | null | undefined) {
  return useQuery<StakedTokenInfo[]>({
    queryKey: ['stakedRWLKTokens', address],
    queryFn: () => api.get_staked_rwalk_tokens_by_user(address!),
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

// ---------------------------------------------------------------------------
// Donations – ETH
// ---------------------------------------------------------------------------

export function useDonationsCGSimpleList() {
  return useQuery({
    queryKey: ['donationsCGSimpleList'],
    queryFn: () => api.get_donations_cg_simple_list(),
    staleTime: 30_000,
  });
}

export function useDonationsCGSimpleByRound(round: number) {
  return useQuery({
    queryKey: ['donationsCGSimpleByRound', round],
    queryFn: () => api.get_donations_cg_simple_by_round(round),
    enabled: round >= 0,
    staleTime: 30_000,
  });
}

export function useDonationsCGWithInfoList() {
  return useQuery({
    queryKey: ['donationsCGWithInfoList'],
    queryFn: () => api.get_donations_cg_with_info_list(),
    staleTime: 30_000,
  });
}

export function useDonationsCGWithInfoByRound(round: number) {
  return useQuery({
    queryKey: ['donationsCGWithInfoByRound', round],
    queryFn: () => api.get_donations_cg_with_info_by_round(round),
    enabled: round >= 0,
    staleTime: 30_000,
  });
}

export function useDonationsWithInfoById(id: number | null | undefined) {
  return useQuery({
    queryKey: ['donationsWithInfoById', id],
    queryFn: () => api.get_donations_with_info_by_id(id!),
    enabled: id != null && id >= 0,
    staleTime: 60_000,
  });
}

export function useDonationsEthByUser(address: string | null | undefined) {
  return useQuery({
    queryKey: ['donationsEthByUser', address],
    queryFn: () => api.get_donations_eth_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useDonationsBothByRound(round: number) {
  return useQuery({
    queryKey: ['donationsBothByRound', round],
    queryFn: () => api.get_donations_both_by_round(round),
    enabled: round >= 0,
    staleTime: 30_000,
  });
}

export function useDonationsBoth() {
  return useQuery({
    queryKey: ['donationsBoth'],
    queryFn: () => api.get_donations_both(),
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Donations – Charity
// ---------------------------------------------------------------------------

export function useCharityDonationsDeposits() {
  return useQuery({
    queryKey: ['charityDonationsDeposits'],
    queryFn: () => api.get_charity_donations_deposits(),
    staleTime: 60_000,
  });
}

export function useCharityCGDeposits() {
  return useQuery({
    queryKey: ['charityCGDeposits'],
    queryFn: () => api.get_charity_cg_deposits(),
    staleTime: 60_000,
  });
}

export function useCharityVoluntary() {
  return useQuery({
    queryKey: ['charityVoluntary'],
    queryFn: () => api.get_charity_voluntary(),
    staleTime: 60_000,
  });
}

export function useCharityWithdrawals() {
  return useQuery({
    queryKey: ['charityWithdrawals'],
    queryFn: () => api.get_charity_withdrawals(),
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Donations – NFT
// ---------------------------------------------------------------------------

export function useDonationsNFTList() {
  return useQuery({
    queryKey: ['donationsNFTList'],
    queryFn: () => api.get_donations_nft_list(),
    staleTime: 30_000,
  });
}

export function useDonatedNFTInfo(recordId: number | null | undefined) {
  return useQuery({
    queryKey: ['donatedNFTInfo', recordId],
    queryFn: () => api.get_donated_nft_info(recordId!),
    enabled: recordId != null && recordId >= 0,
    staleTime: 60_000,
  });
}

export function useDonatedNFTClaimsAll() {
  return useQuery({
    queryKey: ['donatedNFTClaimsAll'],
    queryFn: () => api.get_donated_nft_claims_all(),
    staleTime: 30_000,
  });
}

export function useClaimedDonatedNFTByUser(address: string | null | undefined) {
  return useQuery({
    queryKey: ['claimedDonatedNFTByUser', address],
    queryFn: () => api.get_claimed_donated_nft_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useNFTDonationStats() {
  return useQuery({
    queryKey: ['nftDonationStats'],
    queryFn: () => api.get_nft_donation_stats(),
    staleTime: 60_000,
  });
}

export function useDonationsNFTByRound(round: number) {
  return useQuery({
    queryKey: ['donationsNFTByRound', round],
    queryFn: () => api.get_donations_nft_by_round(round),
    enabled: round >= 0,
    staleTime: 30_000,
  });
}

export function useDonationsNFTUnclaimedByRound(round: number) {
  return useQuery({
    queryKey: ['donationsNFTUnclaimedByRound', round],
    queryFn: () => api.get_donations_nft_unclaimed_by_round(round),
    enabled: round >= 0,
    staleTime: 30_000,
  });
}

export function useUnclaimedDonatedNFTByUser(address: string | null | undefined) {
  return useQuery({
    queryKey: ['unclaimedDonatedNFTByUser', address],
    queryFn: () => api.get_unclaimed_donated_nft_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Donations – ERC20
// ---------------------------------------------------------------------------

export function useDonationsERC20ByRound(round: number) {
  return useQuery({
    queryKey: ['donationsERC20ByRound', round],
    queryFn: () => api.get_donations_erc20_by_round(round),
    enabled: round >= 0,
    staleTime: 30_000,
  });
}

export function useDonationsERC20ByUser(address: string | null | undefined) {
  return useQuery({
    queryKey: ['donationsERC20ByUser', address],
    queryFn: () => api.get_donations_erc20_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Users & Statistics
// ---------------------------------------------------------------------------

export function useUserInfo(address: string | null | undefined) {
  return useQuery<UserInfoWithLists | null>({
    queryKey: ['userInfo', address],
    queryFn: () => api.get_user_info(address!),
    enabled: !!address,
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useUserBalance(address: string | null | undefined) {
  return useQuery<UserBalance | null>({
    queryKey: ['userBalance', address],
    queryFn: () => api.get_user_balance(address!),
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useNotifyRedBox(address: string | null | undefined) {
  return useQuery({
    queryKey: ['notifyRedBox', address],
    queryFn: () => api.notify_red_box(address!),
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useUniqueBidders() {
  return useQuery({
    queryKey: ['uniqueBidders'],
    queryFn: () => api.get_unique_bidders(),
    staleTime: 60_000,
  });
}

export function useUniqueWinners() {
  return useQuery({
    queryKey: ['uniqueWinners'],
    queryFn: () => api.get_unique_winners(),
    staleTime: 60_000,
  });
}

export function useUniqueDonors() {
  return useQuery({
    queryKey: ['uniqueDonors'],
    queryFn: () => api.get_unique_donors(),
    staleTime: 60_000,
  });
}

export function useUniqueCSTStakers() {
  return useQuery({
    queryKey: ['uniqueCSTStakers'],
    queryFn: () => api.get_unique_cst_stakers(),
    staleTime: 60_000,
  });
}

export function useUniqueRWLKStakers() {
  return useQuery({
    queryKey: ['uniqueRWLKStakers'],
    queryFn: () => api.get_unique_rwalk_stakers(),
    staleTime: 60_000,
  });
}

export function useUniqueBothStakers() {
  return useQuery({
    queryKey: ['uniqueBothStakers'],
    queryFn: () => api.get_unique_both_stakers(),
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Raffle
// ---------------------------------------------------------------------------

export function useRaffleDepositsByUser(address: string | null | undefined) {
  return useQuery({
    queryKey: ['raffleDepositsByUser', address],
    queryFn: () => api.get_raffle_deposits_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useChronoWarriorDepositsByUser(address: string | null | undefined) {
  return useQuery({
    queryKey: ['chronoWarriorDepositsByUser', address],
    queryFn: () => api.get_chrono_warrior_deposits_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useUnclaimedRaffleDepositsByUser(address: string | null | undefined) {
  return useQuery({
    queryKey: ['unclaimedRaffleDepositsByUser', address],
    queryFn: () => api.get_unclaimed_raffle_deposits_by_user(address!),
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useRaffleNFTWinnersList() {
  return useQuery({
    queryKey: ['raffleNFTWinnersList'],
    queryFn: () => api.get_raffle_nft_winners_list(),
    staleTime: 30_000,
  });
}

export function useRaffleNFTWinnersByRound(round: number) {
  return useQuery({
    queryKey: ['raffleNFTWinnersByRound', round],
    queryFn: () => api.get_raffle_nft_winners_by_round(round),
    enabled: round >= 0,
    staleTime: 30_000,
  });
}

export function useRaffleNFTWinningsByUser(address: string | null | undefined) {
  return useQuery({
    queryKey: ['raffleNFTWinningsByUser', address],
    queryFn: () => api.get_raffle_nft_winnings_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Marketing
// ---------------------------------------------------------------------------

export function useMarketingRewards() {
  return useQuery({
    queryKey: ['marketingRewards'],
    queryFn: () => api.get_marketing_rewards(),
    staleTime: 30_000,
  });
}

export function useMarketingRewardsByUser(address: string | null | undefined) {
  return useQuery({
    queryKey: ['marketingRewardsByUser', address],
    queryFn: () => api.get_marketing_rewards_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// System
// ---------------------------------------------------------------------------

export function useCurrentTime() {
  return useQuery<number>({
    queryKey: ['currentTime'],
    queryFn: () => api.get_current_time(),
    staleTime: 5_000,
    refetchInterval: 12_000,
    refetchIntervalInBackground: false,
  });
}

export function useSystemModelist() {
  return useQuery({
    queryKey: ['systemModelist'],
    queryFn: () => api.get_system_modelist(),
    staleTime: 60_000,
  });
}

export function useSystemEvents(start: number, end: number) {
  return useQuery({
    queryKey: ['systemEvents', start, end],
    queryFn: () => api.get_system_events(start, end),
    enabled: start >= 0 && end >= start,
    staleTime: 60_000,
  });
}
