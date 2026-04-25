import type { DashboardInfo } from '@/services/api';

import { HeroStats } from './HeroStats';
import { ActivitySummary } from './ActivitySummary';
import { QuickActions } from './QuickActions';
import { StellarSelectionPerformance } from './StellarSelectionPerformance';

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
  stellarSelectionETHProbability: number;
  stellarSelectionNFTProbability: number;
  data: DashboardInfo | null;
  isOwnProfile?: boolean;
  totalAnchorDistributionEth?: number;
}

/** Orchestrates the hero stats, activity summary, quick actions, and stellarSelection performance sections. */
export function UserStatsSection({
  userInfo,
  balanceETH,
  balanceCST,
  stellarSelectionETHProbability,
  stellarSelectionNFTProbability,
  data,
  isOwnProfile = false,
  totalAnchorDistributionEth = 0,
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
        stellarSelectionETHProbability={stellarSelectionETHProbability}
        stellarSelectionNFTProbability={stellarSelectionNFTProbability}
      />

      <ActivitySummary
        userInfo={userInfo}
        totalAnchorDistributionEth={totalAnchorDistributionEth}
      />

      {isOwnProfile && userInfo.Address && <QuickActions address={userInfo.Address} />}

      <StellarSelectionPerformance
        userInfo={userInfo}
        stellarSelectionETHProbability={stellarSelectionETHProbability}
        stellarSelectionNFTProbability={stellarSelectionNFTProbability}
        data={data}
      />
    </div>
  );
}
