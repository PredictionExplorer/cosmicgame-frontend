/**
 * API response types for Cosmic Game frontend.
 * These interfaces type the return values of API methods.
 */

// ---------------------------------------------------------------------------
// Base transaction info (from flattenTx helper)
// ---------------------------------------------------------------------------

export interface TxInfo {
  EvtLogId: number;
  BlockNum: number;
  TxId: number;
  TxHash: string;
  TimeStamp: number;
  DateTime: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Dashboard / Statistics
// ---------------------------------------------------------------------------

export interface StakeStatistics {
  NumActiveStakers: number;
  NumDeposits: number;
  TotalRewardEth: number;
  TotalTokensMinted: number;
  TotalTokensStaked: number;
  UnclaimedRewardEth?: number;
}

export interface MainStats {
  /** Same as dashboard root `TotalPrizeAwards` when MainStats embeds full server stats. */
  TotalPrizeAwards?: number;
  CgPrizeRowCount?: number;
  TotalPrizes?: number;
  NumCSTokenMints: number;
  TotalRaffleEthDeposits: number;
  TotalCSTConsumedEth: number;
  TotalMktRewardsEth: number;
  NumMktRewards: number;
  TotalRaffleEthWithdrawn: number;
  NumBidsCST: number;
  NumUniqueBidders: number;
  NumUniqueWinners: number;
  NumUniqueDonors: number;
  TotalNamedTokens: number;
  NumUniqueStakersCST: number;
  NumUniqueStakersRWalk: number;
  NumWinnersWithPendingRaffleWithdrawal?: number;
  NumCosmicGameDonations?: number;
  SumCosmicGameDonationsEth?: number;
  NumWithdrawals?: number;
  SumWithdrawals?: number;
  TotalEthDonatedAmountEth?: number;
  DonatedTokenDistribution?: DonatedTokenDistributionEntry[];
  StakeStatisticsCST: StakeStatistics;
  StakeStatisticsRWalk: StakeStatistics;
}

export interface DonatedTokenDistributionEntry {
  TokenAddr: string;
  NumDonations: number;
  [key: string]: unknown;
}

export interface ContractAddresses {
  CosmicGameAddr: string;
  CosmicTokenAddr: string;
  CosmicSignatureAddr: string;
  RandomWalkAddr: string;
  CosmicDaoAddr: string;
  CharityWalletAddr: string;
  MarketingWalletAddr: string;
  PrizesWalletAddr: string;
  StakingWalletCSTAddr: string;
  StakingWalletRWalkAddr: string;
  RaffleWalletAddr?: string;
  StakingWalletAddr?: string;
  BusinessLogicAddr?: string;
  [key: string]: string | undefined;
}

export interface DashboardInfo {
  CurNumBids: number;
  CurPrizeAmountEth: number;
  CurBidPriceEth?: number;
  CurRoundNum: number;
  PrizeClaimTs: number;
  TsRoundStart: number;
  LastBidderAddr: string;
  BidPriceEth: number;
  StakingAmountEth: number;
  CurRoundPrizeTime?: number;
  MainStats: MainStats;
  ContractAddrs?: ContractAddresses;
  PrizePercentage?: number;
  ChronoWarriorPercentage?: number;
  RafflePercentage?: number;
  StakingPercentage?: number;
  NumRaffleEthWinnersBidding?: number;
  NumRaffleNFTWinnersBidding: number;
  NumRaffleNFTWinnersStakingRWalk: number;
  CharityPercentage?: number;
  RoundStartCSTAuctionLength?: number;
  TimeoutClaimPrize?: number;
  InitialSecondsUntilPrize?: number;
  PrizeAmountEth?: number;
  RaffleAmountEth?: number;
  CosmicGameBalanceEth?: number;
  CurRoundStats?: RoundStats;
  /** Main prize claims completed (roughly one per finished round). */
  TotalPrizes?: number;
  /** Sum of cg_winner.prizes_count (may be lower than cg_prize rows). */
  TotalPrizeAwards?: number;
  /** COUNT(*) FROM cg_prize — every unified prize row (matches your SQL). */
  CgPrizeRowCount?: number;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Rounds
// ---------------------------------------------------------------------------

export interface RoundStats {
  TotalBids: number;
  TotalDonatedAmountEth?: number;
  TotalDonatedNFTs?: number;
  TotalRaffleEthDepositsEth?: number;
  TotalRaffleNFTs?: number;
  /** Unix seconds; contract `roundActivationTime` (dashboard). */
  ActivationTime?: number;
  DelayDurationBeforeRoundActivation?: number;
  [key: string]: unknown;
}

export interface RaffleNFTWinner {
  EvtLogId?: number;
  TxHash?: string;
  TimeStamp?: number;
  DateTime?: string;
  RoundNum?: number;
  WinnerAddr?: string;
  TokenId?: number;
  IsRWalk?: boolean;
  IsStaker?: boolean;
  [key: string]: unknown;
}

export interface RaffleETHDeposit {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  DateTime?: string;
  RoundNum: number;
  Amount: number;
  WinnerAddr?: string;
  Claimed?: boolean;
  [key: string]: unknown;
}

export interface WinningHistoryEntry extends TxInfo {
  RoundNum: number;
  RecordType: number;
  WinnerAddr?: string;
  AmountEth?: number;
  TokenAddress?: string;
  TokenId?: number;
  WinnerIndex?: number;
  Claimed?: boolean;
  [key: string]: unknown;
}

export interface PrizeEntry {
  EvtLogId?: number;
  RoundNum?: number;
  WinnerAddr?: string;
  TokenId?: number;
  Amount?: number;
  [key: string]: unknown;
}

export interface RoundInfo {
  RoundNum: number;
  WinnerAddr: string;
  AmountEth: number;
  TokenId: number;
  TxHash: string;
  TimeStamp: number;
  DateTime: string;
  EvtLogId?: number;
  BlockNum?: number;
  TxId?: number;
  RoundStats: RoundStats;
  RaffleNFTWinners: RaffleNFTWinner[];
  StakingNFTWinners: RaffleNFTWinner[];
  RaffleETHDeposits: RaffleETHDeposit[];
  AllPrizes: PrizeEntry[];
  CSTAmountEth: number;
  CharityAddress: string;
  CharityAmountETH: number;
  StakingDepositAmountEth: number;
  StakingPerTokenEth: number;
  StakingNumStakedTokens: number;
  EnduranceWinnerAddr: string;
  EnduranceERC721TokenId: number;
  EnduranceERC20AmountEth: number;
  LastCstBidderAddr: string;
  LastCstBidderERC721TokenId: number;
  LastCstBidderERC20AmountEth: number;
  ChronoWarriorAddr: string;
  ChronoWarriorAmountEth: number;
  ChronoWarriorCstAmountEth: number;
  ChronoWarriorNftTokenId: number;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Bids
// ---------------------------------------------------------------------------

export interface BidInfo extends TxInfo {
  BidPrice?: number;
  RoundNum: number;
  BidderAddr: string;
  Message?: string;
  BidType: number;
  BidPriceEth: number;
  NumCSTokensEth?: number;
  NumCSTTokensEth?: number;
  NFTDonationTokenId?: number;
  NFTTokenURI?: string;
  ERC20RewardAmountEth: number;
  EthPriceEth?: number;
  CstPriceEth?: number;
  RWalkNFTId?: number;
  NFTDonationTokenAddr?: string;
  DonatedERC20TokenAddr?: string;
  DonatedERC20TokenAmount?: string;
  DonatedERC20TokenAmountEth?: number;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export interface UserInfo {
  NumBids: number;
  NumPrizes: number;
  MaxBidAmountEth?: number;
  MaxBidAmount?: number;
  MaxWinAmount?: number;
  CosmicSignatureNumTransfers?: number;
  TotalCSTokensWon?: number;
  [key: string]: unknown;
}

export interface UserBalance {
  ETH_Balance: string;
  CosmicTokenBalance: string;
  [key: string]: unknown;
}

/** User info response with flattened arrays (from get_user_info) */
export interface UserInfoWithLists {
  UserInfo?: UserInfo;
  Bids: BidInfo[];
  PrizeHistory: TxInfo[];
  CosmicSignatureTokensOwned: CSTTokenInfo[];
  CurrentlyStakedTokens: StakedTokenInfo[];
  DonatedNFTsClaimed: DonatedNFT[];
  DonatedTokensClaimed: unknown[];
  ERC20Transfers: TxInfo[];
  ERC721Transfers: TxInfo[];
  ETHDonationsMade: TxInfo[];
  MainPrizeClaims: TxInfo[];
  MarketingRewardsAwarded: TxInfo[];
  StakingActions: StakingAction[];
  TokenDonationsMade: TxInfo[];
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Tokens (CST, CT)
// ---------------------------------------------------------------------------

export interface CSTTokenInfo extends TxInfo {
  TokenId: number;
  TokenName?: string;
  OwnerAddr?: string;
  CurOwnerAddr?: string;
  RoundNum?: number;
  Seed?: string | number;
  WasUnstaked?: boolean;
  MintTimeStamp?: number;
  WinnerAddr?: string;
  Staked?: boolean;
  RecordType?: number;
  [key: string]: unknown;
}

export interface TokenDistribution {
  OwnerAddr: string;
  OwnerAid: string | number;
  NumTokens: number;
}

export interface CTBalanceDistribution {
  OwnerAddr: string;
  OwnerAid: string | number;
  BalanceFloat: number;
}

export interface NameHistoryRecord extends TxInfo {
  TokenName: string;
  TokenId?: number;
  [key: string]: unknown;
}

export interface UsedRWLKNFT {
  RWalkTokenId: number;
  BidderAddr: string;
  RoundNum: number;
  [key: string]: unknown;
}

export interface CSTTransferRecord extends TxInfo {
  TokenId: number;
  FromAddr?: string;
  ToAddr?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Staking
// ---------------------------------------------------------------------------

export interface StakingAction extends TxInfo {
  ActionId: number;
  ActionType: number;
  TokenAddr: string;
  TokenId: number;
  StakerAddr: string;
  NumStakedNFTs: number;
  IsRWLK?: boolean;
  [key: string]: unknown;
}

export interface StakedTokenInfo {
  StakeActionId: number;
  StakedTokenId: number;
  TokenInfo?: {
    TokenId: number;
    Seed?: number;
    StakeActionId?: number;
  };
  StakeTimeStamp: number;
  IsRWLK?: boolean;
  UserAddr?: string;
  StakeEvtLogId?: number;
  [key: string]: unknown;
}

export interface StakingCSTReward {
  EvtLogId: number;
  RoundNum: number;
  TokenId: number;
  AmountEth?: number;
  TxHash?: string;
  TimeStamp?: number;
  DepositRoundNum?: number;
  DepositId?: number;
  DepositAmountEth?: number;
  ClaimedAmountEth?: number;
  YourClaimableAmountEth?: number;
  StakerAddr?: string;
  StakerNumStakedNFTs?: number;
  StakerAmountEth?: number;
  FullyClaimed?: boolean;
  NumStakedNFTs?: number;
  NumTokensCollected?: number;
  YourTokensStaked?: number;
  TotalDepositAmountEth?: number;
  PendingToCollectEth?: number;
  DepositTimeStamp?: number;
  YourCollectedAmountEth?: number;
  NumUnclaimedTokens?: number;
  YourRewardAmountEth?: number;
  PendingToClaimEth?: number;
  [key: string]: unknown;
}

export interface CombinedStakingRecordInfo {
  Stake: StakingAction | null;
  Unstake: StakingAction | null;
  [key: string]: unknown;
}

export interface RewardsByToken {
  TokenId: number;
  TotalRewardEth?: number;
  RewardToCollectEth?: number;
  [key: string]: unknown;
}

export interface StakingRewardMint {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  DateTime?: string;
  WinnerAddr: string;
  RoundNum: number;
  TokenId: number;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Donations
// ---------------------------------------------------------------------------

export interface DonatedNFT extends TxInfo {
  RecordId?: number | string;
  RoundNum: number;
  DonorAddr: string;
  TokenAddr: string;
  TokenId?: number | string;
  NFTTokenId?: number | string;
  NFTTokenURI?: string;
  TokenAddress?: string;
  Index?: number;
  [key: string]: unknown;
}

export interface ETHDonation extends TxInfo {
  RoundNum: number;
  DonorAddr: string;
  AmountEth: number;
  RecordType?: number;
  CGRecordId?: string | number;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Special Winners
// ---------------------------------------------------------------------------

export interface CharityWithdrawal {
  EvtLogId: string | number;
  TxHash: string;
  TimeStamp: number;
  DestinationAddr: string;
  AmountEth: number;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Special Winners
// ---------------------------------------------------------------------------

export interface SpecialWinners {
  EnduranceChampionAddress?: string;
  EnduranceChampionDuration?: number;
  LastCstBidderAddress?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Banned Bids
// ---------------------------------------------------------------------------

export interface BannedBid {
  bid_id: number;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Price Info
// ---------------------------------------------------------------------------

export interface BidEthPriceInfo {
  AuctionDuration: string;
  ETHPrice: string;
  SecondsElapsed: string;
  [key: string]: unknown;
}

export interface CTPriceInfo {
  AuctionDuration: string;
  CSTPrice: string;
  SecondsElapsed: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Token Mint Info (GET /api/cosmicgame/randomwalk/tokens/info/:id or /api/randomwalk/tokens/info/:id)
// ---------------------------------------------------------------------------

export interface TokenMintInfo {
  CurName?: string;
  CurOwnerAddr?: string;
  SeedHex?: string;
  TokenId?: number;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Unique Address Statistics
// ---------------------------------------------------------------------------

export interface Bidder {
  BidderAid: string;
  BidderAddr: string;
  NumBids: number;
  MaxBidAmountEth: number;
  [key: string]: unknown;
}

export interface Winner {
  WinnerAid: string;
  WinnerAddr: string;
  PrizesCount: number;
  MaxWinAmountEth: number;
  PrizesSum: number;
  [key: string]: unknown;
}

export interface UniqueStakerCST {
  StakerAid: string | number;
  StakerAddr: string;
  NumStakeActions: number;
  NumUnstakeActions: number;
  TotalTokensMinted: number;
  TotalTokensStaked: number;
  TotalRewardEth: number;
  UnclaimedRewardEth: number;
  [key: string]: unknown;
}

export interface UniqueStakerRWLK {
  StakerAid: string | number;
  StakerAddr: string;
  NumStakeActions: number;
  NumUnstakeActions: number;
  TotalTokensStaked: number;
  TotalTokensMinted: number;
  [key: string]: unknown;
}

export interface UniqueEthDonor {
  DonorAid: string | number;
  DonorAddr: string;
  CountDonations: number;
  TotalDonatedEth: number;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Notify Red Box
// ---------------------------------------------------------------------------

export interface NotifyRedBoxResult {
  ETHRaffleToClaim: number;
  ETHRaffleToClaimWei: number;
  NumDonatedNFTToClaim: number;
  UnclaimedStakingReward: number;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Marketing
// ---------------------------------------------------------------------------

export interface MarketingReward {
  EvtLogId: number;
  TxHash: string;
  TimeStamp: number;
  MarketerAddr: string;
  AmountEth: number;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// System
// ---------------------------------------------------------------------------

export interface SystemModeChangeEvent {
  RoundNum: number;
  EvtLogId: string | number;
  NextEvtLogId?: string | number;
  TimeStamp: number;
  [key: string]: unknown;
}

export interface AdminEventRow {
  EvtLogId: string | number;
  RecordType: number;
  TransferType: number;
  TimeStamp: number;
  TxHash: string;
  IntegerValue: number;
  AddressValue: string;
  StringValue: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Donated ERC20 Tokens
// ---------------------------------------------------------------------------

export interface DonatedERC20Token extends TxInfo {
  RoundNum: number;
  TokenAddr: string;
  AmountDonatedEth: number;
  AmountClaimedEth: number;
  AmountEth?: number;
  WinnerAddr: string;
  DonorAddr?: string;
  Claimed?: boolean;
  DonateClaimDiffEth?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// NFT Donation Stats
// ---------------------------------------------------------------------------

export interface NFTDonationStatsEntry {
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// Staking Action IDs with Claim Info
// ---------------------------------------------------------------------------

export interface ActionIdWithClaimInfo {
  DepositId: number;
  StakeActionId: number;
  Claimed: boolean;
  [key: string]: unknown;
}
