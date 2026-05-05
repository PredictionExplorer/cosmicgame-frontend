/**
 * React Query hooks that wrap the API layer. Each hook maps to a backend endpoint
 * with appropriate stale times and refetch intervals for the Cosmic Signature app.
 */
import { useQuery } from '@tanstack/react-query';

import api from '@/services/api';
import type {
  ActionIdWithClaimInfo,
  AdminEventRow,
  BannedGesture,
  GestureEthCostInfo,
  Participant,
  GestureInfo,
  CharityWithdrawal,
  CombinedAnchorRecordInfo,
  CSTTokenInfo,
  CSTTransferRecord,
  CTBalanceDistribution,
  CTPriceInfo,
  DashboardInfo,
  DonatedERC20Token,
  AttachedNFT,
  ETHDonation,
  MarketingReward,
  NameHistoryRecord,
  NFTDonationStatsEntry,
  NotifyRedBoxResult,
  StellarSelectionETHDeposit,
  StellarSelectionNFTRecipient,
  RewardsByToken,
  RoundInfo,
  SpecialRecipients,
  AnchoredTokenInfo,
  AnchorAction,
  CSTAnchorDistribution,
  AnchorDistributionImprint,
  SystemModeChangeEvent,
  TokenDistribution,
  TokenImprintInfo,
  TxInfo,
  UniqueEthDonor,
  UniqueAnchorHolderCST,
  UniqueAnchorHolderRWLK,
  UsedRWLKNFT,
  UserBalance,
  UserInfoWithLists,
  Recipient,
  WinningHistoryEntry,
} from '@/services/api';

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
    /** Backend serves `rounds/info/0`; the previous `> 0` guard broke first-cycle finalize UX. */
    enabled: Number.isFinite(roundNum) && roundNum >= 0,
    staleTime: 30_000,
  });
}

export function useAllocationTime() {
  return useQuery<number>({
    queryKey: ['allocationTime'],
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
  return useQuery<WinningHistoryEntry[] | null>({
    queryKey: ['claimHistoryByUser', address],
    queryFn: () => api.get_claim_history_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useGestureList() {
  return useQuery<GestureInfo[]>({
    queryKey: ['gestureList'],
    queryFn: () => api.get_bid_list(),
    staleTime: 10_000,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
}

export function useGestureInfo(evtLogId: number) {
  return useQuery<GestureInfo | null>({
    queryKey: ['gestureInfo', evtLogId],
    queryFn: () => api.get_bid_info(evtLogId),
    enabled: evtLogId > 0,
    staleTime: 60_000,
  });
}

export function useGestureListByCycle(round: number, sortDir: string = 'desc') {
  return useQuery<GestureInfo[]>({
    queryKey: ['bidListByRound', round, sortDir],
    queryFn: () => api.get_bid_list_by_round(round, sortDir),
    enabled: round >= 0,
    staleTime: 15_000,
  });
}

export function useCurrentSpecialRecipients() {
  return useQuery<SpecialRecipients | null>({
    queryKey: ['currentSpecialWinners'],
    queryFn: () => api.get_current_special_winners(),
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useAllocationDepositsList() {
  return useQuery<TxInfo[]>({
    queryKey: ['prizeDepositsList'],
    queryFn: () => api.get_prize_deposits_list(),
    staleTime: 30_000,
  });
}

export function useAllocationDepositsByCycle(round: number) {
  return useQuery<TxInfo[]>({
    queryKey: ['prizeDepositsByRound', round],
    queryFn: () => api.get_prize_deposits_by_round(round),
    enabled: round >= 0,
    staleTime: 30_000,
  });
}

export function useBannedGestures() {
  return useQuery<BannedGesture[]>({
    queryKey: ['bannedBids'],
    queryFn: () => api.get_banned_bids(),
    staleTime: 30_000,
  });
}

export function useGestureEthCost() {
  return useQuery<GestureEthCostInfo | null>({
    queryKey: ['bidEthPrice'],
    queryFn: () => api.get_bid_eth_price(),
    staleTime: 10_000,
    refetchInterval: 15_000,
    refetchIntervalInBackground: false,
  });
}

export function useTimeUntilAllocation() {
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
  return useQuery<TxInfo[]>({
    queryKey: ['ctTransfers', address],
    queryFn: () => api.get_ct_transfers(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useCTOwnershipTransfers(tokenId: number | null | undefined) {
  return useQuery<CSTTransferRecord[]>({
    queryKey: ['ctOwnershipTransfers', tokenId],
    queryFn: () => api.get_ct_ownership_transfers(tokenId!),
    enabled: tokenId != null && tokenId >= 0,
    staleTime: 30_000,
  });
}

export function useCTPrice() {
  return useQuery<CTPriceInfo | null>({
    queryKey: ['ctPrice'],
    queryFn: () => api.get_ct_price(),
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useTokenInfo(tokenId: number | string | null | undefined) {
  return useQuery<TokenImprintInfo | null>({
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

export function useCSTAnchorDistributionsToRetrieveByUser(address: string | null | undefined) {
  return useQuery<CSTAnchorDistribution[]>({
    queryKey: ['stakingCSTRewardsToClaim', address],
    queryFn: () => api.get_staking_cst_rewards_to_claim_by_user(address!),
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useCSTAnchorDistributionsRetrievedByUser(address: string | null | undefined) {
  return useQuery<CSTAnchorDistribution[]>({
    queryKey: ['stakingCSTRewardsCollected', address],
    queryFn: () => api.get_staking_cst_rewards_collected_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useAnchoredCSTokensByUser(address: string | null | undefined) {
  return useQuery<AnchoredTokenInfo[]>({
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
  return useQuery<ActionIdWithClaimInfo[] | null>({
    queryKey: ['cstActionIdsByDeposit', address, depositId],
    queryFn: () => api.get_cst_action_ids_by_deposit_id(address!, depositId!),
    enabled: !!address && depositId != null,
    staleTime: 30_000,
  });
}

export function useCSTAnchorActionsByUser(address: string | null | undefined) {
  return useQuery<AnchorAction[]>({
    queryKey: ['stakingCSTActionsByUser', address],
    queryFn: () => api.get_staking_cst_actions_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useCSTAnchorActions() {
  return useQuery<AnchorAction[]>({
    queryKey: ['cstAnchorActions'],
    queryFn: () => api.get_staking_cst_actions(),
    staleTime: 30_000,
  });
}

export function useCSTAnchorActionInfo(actionId: number | null | undefined) {
  return useQuery<CombinedAnchorRecordInfo | null>({
    queryKey: ['stakingCSTActionsInfo', actionId],
    queryFn: () => api.get_staking_cst_actions_info(actionId!),
    enabled: actionId != null && actionId >= 0,
    staleTime: 30_000,
  });
}

export function useCSTAnchorDistributions() {
  return useQuery<CSTAnchorDistribution[]>({
    queryKey: ['stakingCSTRewards'],
    queryFn: () => api.get_staking_cst_rewards(),
    staleTime: 30_000,
  });
}

export function useCSTAnchorDistributionsByCycle(round: number | null | undefined) {
  return useQuery<CSTAnchorDistribution[]>({
    queryKey: ['stakingCSTRewardsByRound', round],
    queryFn: () => api.get_staking_cst_rewards_by_round(round!),
    enabled: round != null && round >= 0,
    staleTime: 30_000,
  });
}

export function useCSTAnchorDistributionPaidRecordsByUser(address: string | null | undefined) {
  return useQuery<CSTAnchorDistribution[]>({
    queryKey: ['stakingCSTRewardPaidRecords', address],
    queryFn: () => api.get_staking_cst_reward_paid_records_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useGlobalAnchoredCSTokens() {
  return useQuery<AnchoredTokenInfo[]>({
    queryKey: ['stakedCSTTokensGlobal'],
    queryFn: () => api.get_staked_cst_tokens(),
    staleTime: 30_000,
  });
}

export function useAnchorDistributionsByUser(address: string | null | undefined) {
  return useQuery<RewardsByToken[]>({
    queryKey: ['stakingRewardsByUser', address],
    queryFn: () => api.get_staking_rewards_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useAnchorDistributionsByUserByTokenDetails(
  address: string | null | undefined,
  tokenId: number | null | undefined,
) {
  return useQuery<Record<string, unknown> | null>({
    queryKey: ['stakingRewardsByUserByToken', address, tokenId],
    queryFn: () => api.get_staking_rewards_by_user_by_token_details(address!, tokenId!),
    enabled: !!address && tokenId != null,
    staleTime: 30_000,
  });
}

export function useCSTAnchorDistributionsByUserByDeposit(address: string | null | undefined) {
  return useQuery<CSTAnchorDistribution[]>({
    queryKey: ['stakingCSTByUserByDeposit', address],
    queryFn: () => api.get_staking_cst_by_user_by_deposit_rewards(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Staking – RWLK
// ---------------------------------------------------------------------------

export function useRWLKAnchorActionInfo(actionId: number | null | undefined) {
  return useQuery<CombinedAnchorRecordInfo | null>({
    queryKey: ['stakingRWLKActionsInfo', actionId],
    queryFn: () => api.get_staking_rwalk_actions_info(actionId!),
    enabled: actionId != null && actionId >= 0,
    staleTime: 30_000,
  });
}

export function useRWLKAnchorActions() {
  return useQuery<AnchorAction[]>({
    queryKey: ['rwlkAnchorActions'],
    queryFn: () => api.get_staking_rwalk_actions(),
    staleTime: 30_000,
  });
}

export function useRWLKAnchorActionsByUser(address: string | null | undefined) {
  return useQuery<AnchorAction[]>({
    queryKey: ['stakingRWLKActionsByUser', address],
    queryFn: () => api.get_staking_rwalk_actions_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useGlobalRWLKAnchorImprints() {
  return useQuery<AnchorDistributionImprint[]>({
    queryKey: ['stakingRWLKMintsGlobal'],
    queryFn: () => api.get_staking_rwalk_mints_global(),
    staleTime: 30_000,
  });
}

export function useRWLKAnchorImprintsByUser(address: string | null | undefined) {
  return useQuery<AnchorDistributionImprint[]>({
    queryKey: ['stakingRWLKMintsByUser', address],
    queryFn: () => api.get_staking_rwalk_mints_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useGlobalAnchoredRWLKTokens() {
  return useQuery<AnchoredTokenInfo[]>({
    queryKey: ['stakedRWLKTokensGlobal'],
    queryFn: () => api.get_staked_rwalk_tokens(),
    staleTime: 30_000,
  });
}

export function useAnchoredRWLKTokensByUser(address: string | null | undefined) {
  return useQuery<AnchoredTokenInfo[]>({
    queryKey: ['anchoredRWLKTokens', address],
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
  return useQuery<ETHDonation[]>({
    queryKey: ['donationsCGSimpleList'],
    queryFn: () => api.get_donations_cg_simple_list(),
    staleTime: 30_000,
  });
}

export function useDonationsCGSimpleByRound(round: number) {
  return useQuery<ETHDonation[]>({
    queryKey: ['donationsCGSimpleByRound', round],
    queryFn: () => api.get_donations_cg_simple_by_round(round),
    enabled: round >= 0,
    staleTime: 30_000,
  });
}

export function useDonationsCGWithInfoList() {
  return useQuery<ETHDonation[]>({
    queryKey: ['donationsCGWithInfoList'],
    queryFn: () => api.get_donations_cg_with_info_list(),
    staleTime: 30_000,
  });
}

export function useDonationsCGWithInfoByRound(round: number) {
  return useQuery<ETHDonation[]>({
    queryKey: ['donationsCGWithInfoByRound', round],
    queryFn: () => api.get_donations_cg_with_info_by_round(round),
    enabled: round >= 0,
    staleTime: 30_000,
  });
}

export function useDonationsWithInfoById(id: number | null | undefined) {
  return useQuery<ETHDonation | null>({
    queryKey: ['donationsWithInfoById', id],
    queryFn: () => api.get_donations_with_info_by_id(id!),
    enabled: id != null && id >= 0,
    staleTime: 60_000,
  });
}

export function useDonationsEthByUser(address: string | null | undefined) {
  return useQuery<ETHDonation[]>({
    queryKey: ['donationsEthByUser', address],
    queryFn: () => api.get_donations_eth_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useDonationsBothByRound(round: number) {
  return useQuery<ETHDonation[]>({
    queryKey: ['donationsBothByRound', round],
    queryFn: () => api.get_donations_both_by_round(round),
    enabled: round >= 0,
    staleTime: 30_000,
  });
}

export function useDonationsBoth() {
  return useQuery<ETHDonation[]>({
    queryKey: ['donationsBoth'],
    queryFn: () => api.get_donations_both(),
    staleTime: 30_000,
  });
}

// ---------------------------------------------------------------------------
// Donations – Charity
// ---------------------------------------------------------------------------

export function useCharityDonationsDeposits() {
  return useQuery<ETHDonation[]>({
    queryKey: ['charityDonationsDeposits'],
    queryFn: () => api.get_charity_donations_deposits(),
    staleTime: 60_000,
  });
}

export function useCharityCGDeposits() {
  return useQuery<ETHDonation[]>({
    queryKey: ['charityCGDeposits'],
    queryFn: () => api.get_charity_cg_deposits(),
    staleTime: 60_000,
  });
}

export function useCharityVoluntary() {
  return useQuery<ETHDonation[]>({
    queryKey: ['charityVoluntary'],
    queryFn: () => api.get_charity_voluntary(),
    staleTime: 60_000,
  });
}

export function useCharityWithdrawals() {
  return useQuery<CharityWithdrawal[]>({
    queryKey: ['charityWithdrawals'],
    queryFn: () => api.get_charity_withdrawals(),
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Donations – NFT
// ---------------------------------------------------------------------------

export function useDonationsNFTList() {
  return useQuery<AttachedNFT[]>({
    queryKey: ['donationsNFTList'],
    queryFn: () => api.get_donations_nft_list(),
    staleTime: 30_000,
  });
}

export function useDonatedNFTInfo(recordId: number | null | undefined) {
  return useQuery<AttachedNFT | null>({
    queryKey: ['donatedNFTInfo', recordId],
    queryFn: () => api.get_donated_nft_info(recordId!),
    enabled: recordId != null && recordId >= 0,
    staleTime: 60_000,
  });
}

export function useDonatedNFTClaimsAll() {
  return useQuery<AttachedNFT[]>({
    queryKey: ['donatedNFTClaimsAll'],
    queryFn: () => api.get_donated_nft_claims_all(),
    staleTime: 30_000,
  });
}

export function useClaimedDonatedNFTByUser(address: string | null | undefined) {
  return useQuery<AttachedNFT[]>({
    queryKey: ['claimedDonatedNFTByUser', address],
    queryFn: () => api.get_claimed_donated_nft_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useNFTDonationStats() {
  return useQuery<NFTDonationStatsEntry[]>({
    queryKey: ['nftDonationStats'],
    queryFn: () => api.get_nft_donation_stats(),
    staleTime: 60_000,
  });
}

export function useDonationsNFTByRound(round: number) {
  return useQuery<AttachedNFT[]>({
    queryKey: ['donationsNFTByRound', round],
    queryFn: () => api.get_donations_nft_by_round(round),
    enabled: round >= 0,
    staleTime: 30_000,
  });
}

export function useDonationsNFTUnclaimedByRound(round: number) {
  return useQuery<AttachedNFT[]>({
    queryKey: ['donationsNFTUnclaimedByRound', round],
    queryFn: () => api.get_donations_nft_unclaimed_by_round(round),
    enabled: round >= 0,
    staleTime: 30_000,
  });
}

export function useUnclaimedDonatedNFTByUser(address: string | null | undefined) {
  return useQuery<AttachedNFT[]>({
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
  return useQuery<DonatedERC20Token[]>({
    queryKey: ['donationsERC20ByRound', round],
    queryFn: () => api.get_donations_erc20_by_round(round),
    enabled: round >= 0,
    staleTime: 30_000,
  });
}

export function useDonationsERC20ByUser(address: string | null | undefined) {
  return useQuery<DonatedERC20Token[]>({
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
  return useQuery<NotifyRedBoxResult | null>({
    queryKey: ['notifyRedBox', address],
    queryFn: () => api.notify_red_box(address!),
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useUniqueParticipants() {
  return useQuery<Participant[]>({
    queryKey: ['uniqueParticipants'],
    queryFn: () => api.get_unique_bidders(),
    staleTime: 60_000,
  });
}

export function useUniqueRecipients() {
  return useQuery<Recipient[]>({
    queryKey: ['uniqueRecipients'],
    queryFn: () => api.get_unique_winners(),
    staleTime: 60_000,
  });
}

export function useUniqueDonors() {
  return useQuery<UniqueEthDonor[]>({
    queryKey: ['uniqueDonors'],
    queryFn: () => api.get_unique_donors(),
    staleTime: 60_000,
  });
}

export function useUniqueCSTAnchorHolders() {
  return useQuery<UniqueAnchorHolderCST[]>({
    queryKey: ['uniqueCSTAnchorHolders'],
    queryFn: () => api.get_unique_cst_stakers(),
    staleTime: 60_000,
  });
}

export function useUniqueRWLKAnchorHolders() {
  return useQuery<UniqueAnchorHolderRWLK[]>({
    queryKey: ['uniqueRWLKAnchorHolders'],
    queryFn: () => api.get_unique_rwalk_stakers(),
    staleTime: 60_000,
  });
}

export function useUniqueBothAnchorHolders() {
  return useQuery<UniqueAnchorHolderRWLK[]>({
    queryKey: ['uniqueBothStakers'],
    queryFn: () => api.get_unique_both_stakers(),
    staleTime: 60_000,
  });
}

// ---------------------------------------------------------------------------
// Raffle
// ---------------------------------------------------------------------------

export function useStellarSelectionDepositsByUser(address: string | null | undefined) {
  return useQuery<StellarSelectionETHDeposit[]>({
    queryKey: ['raffleDepositsByUser', address],
    queryFn: () => api.get_raffle_deposits_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useChronoWarriorDepositsByUser(address: string | null | undefined) {
  return useQuery<StellarSelectionETHDeposit[]>({
    queryKey: ['chronoWarriorDepositsByUser', address],
    queryFn: () => api.get_chrono_warrior_deposits_by_user(address!),
    enabled: !!address,
    staleTime: 30_000,
  });
}

export function useUnretrievedStellarSelectionDepositsByUser(address: string | null | undefined) {
  return useQuery<StellarSelectionETHDeposit[]>({
    queryKey: ['unclaimedRaffleDepositsByUser', address],
    queryFn: () => api.get_unclaimed_raffle_deposits_by_user(address!),
    enabled: !!address,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}

export function useStellarSelectionNFTRecipientsList() {
  return useQuery<StellarSelectionNFTRecipient[]>({
    queryKey: ['raffleNFTWinnersList'],
    queryFn: () => api.get_raffle_nft_winners_list(),
    staleTime: 30_000,
  });
}

export function useStellarSelectionNFTRecipientsByCycle(round: number) {
  return useQuery<StellarSelectionNFTRecipient[]>({
    queryKey: ['raffleNFTWinnersByRound', round],
    queryFn: () => api.get_raffle_nft_winners_by_round(round),
    enabled: round >= 0,
    staleTime: 30_000,
  });
}

export function useStellarSelectionNFTAllocationsByUser(address: string | null | undefined) {
  return useQuery<StellarSelectionNFTRecipient[]>({
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
  return useQuery<MarketingReward[]>({
    queryKey: ['marketingRewards'],
    queryFn: () => api.get_marketing_rewards(),
    staleTime: 30_000,
  });
}

export function useMarketingRewardsByUser(address: string | null | undefined) {
  return useQuery<MarketingReward[]>({
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
  return useQuery<SystemModeChangeEvent[]>({
    queryKey: ['systemModelist'],
    queryFn: () => api.get_system_modelist(),
    staleTime: 60_000,
  });
}

export function useSystemEvents(start: number, end: number) {
  return useQuery<AdminEventRow[]>({
    queryKey: ['systemEvents', start, end],
    queryFn: () => api.get_system_events(start, end),
    enabled: start >= 0 && end >= start,
    staleTime: 60_000,
  });
}
