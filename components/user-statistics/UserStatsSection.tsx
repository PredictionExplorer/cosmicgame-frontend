import type { DashboardInfo } from '@/services/api';

import { HeroStats } from './HeroStats';
import { ActivitySummary } from './ActivitySummary';
import { QuickActions } from './QuickActions';
import { RafflePerformance } from './RafflePerformance';

/** User profile info shape. */
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

/** Props for the user stats section. */
export interface UserStatsSectionProps {
  userInfo: UserProfileInfo;
  balanceETH: number;
  balanceCST: number;
  raffleETHProbability: number;
  raffleNFTProbability: number;
  data: DashboardInfo | null;
  isOwnProfile?: boolean;
  totalStakeRewardEth?: number;
}

/** Orchestrates the hero stats, activity summary, quick actions, and raffle performance sections. */
export function UserStatsSection({
  userInfo,
  balanceETH,
  balanceCST,
  raffleETHProbability,
  raffleNFTProbability,
  data,
  isOwnProfile = false,
  totalStakeRewardEth = 0,
}: UserStatsSectionProps) {
  if (!userInfo) {
    return null;
  }

  return (
    <div className="space-y-8" data-testid="user-stats-section">
      <HeroStats
        userInfo={userInfo}
        balanceETH={balanceETH}
        balanceCST={balanceCST}
        raffleETHProbability={raffleETHProbability}
        raffleNFTProbability={raffleNFTProbability}
      />

      <ActivitySummary userInfo={userInfo} totalStakeRewardEth={totalStakeRewardEth} />

      {isOwnProfile && userInfo.Address && <QuickActions address={userInfo.Address} />}

      <RafflePerformance
        userInfo={userInfo}
        raffleETHProbability={raffleETHProbability}
        raffleNFTProbability={raffleNFTProbability}
        data={data}
      />
    </div>
  );
}
