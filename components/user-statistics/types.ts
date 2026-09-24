/** A participant's totals from `user/info` (`UserInfo`), as the profile reads them. */
export interface UserProfileInfo {
  NumBids: number;
  NumPrizes: number;
  MaxBidAmount?: number;
  MaxWinAmount?: number;
  CosmicSignatureNumTransfers?: number;
  TotalCSTokensWon?: number;
  Address?: string;
  SumRaffleEthWinnings?: number;
  SumRaffleEthWithdrawal?: number;
  UnclaimedNFTs?: number;
  NumRaffleEthWinnings?: number;
  RaffleNFTsCount?: number;
  RewardNFTsCount?: number;
  StakingStatisticsRWalk?: {
    TotalNumStakeActions: number;
    TotalNumUnstakeActions: number;
    TotalTokensStaked: number;
    TotalTokensMinted: number;
  };
  [key: string]: unknown;
}
