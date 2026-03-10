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
  Seed?: number;
  WasUnstaked?: boolean;
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
  [key: string]: unknown;
}

export interface StakingCSTReward {
  EvtLogId: number;
  RoundNum: number;
  TokenId: number;
  AmountEth?: number;
  DepositRoundNum?: number;
  DepositId?: number;
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
  RecordId?: number;
  RoundNum: number;
  DonorAddr: string;
  TokenAddr: string;
  TokenId?: number;
  NFTTokenId?: number;
  NFTTokenURI?: string;
  TokenAddress?: string;
  [key: string]: unknown;
}

export interface ETHDonation extends TxInfo {
  RoundNum: number;
  DonorAddr: string;
  AmountEth: number;
  [key: string]: unknown;
}
