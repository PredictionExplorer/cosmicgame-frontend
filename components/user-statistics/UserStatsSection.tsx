import Link from 'next/link';

import { formatEthValue } from '@/utils';

import type { DashboardInfo } from '@/services/api';

/** A label/value row for user profile stats. */
export function StatRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <span className="text-primary">{label}</span>
      &nbsp;
      <span>{children}</span>
    </div>
  );
}

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
}

/** Displays the user's bidding stats, balances, raffle probabilities, and profile links. */
export function UserStatsSection({
  userInfo,
  balanceETH,
  balanceCST,
  raffleETHProbability,
  raffleNFTProbability,
  data,
}: UserStatsSectionProps) {
  if (!userInfo) {
    return <h6 className="text-xl font-medium">There is no user information yet.</h6>;
  }

  return (
    <>
      {balanceETH !== 0 && <StatRow label="ETH Balance:">{balanceETH.toFixed(6)} ETH</StatRow>}
      {balanceCST !== 0 && (
        <StatRow label="Cosmic Tokens Balance:">{balanceCST.toFixed(2)} CST</StatRow>
      )}

      <StatRow label="Number of Bids:">{userInfo.NumBids}</StatRow>
      <StatRow label="Number of Cosmic Signature Transfers:">
        {userInfo.CosmicSignatureNumTransfers}
      </StatRow>
      <StatRow label="Maximum Bid Amount:">{formatEthValue(userInfo.MaxBidAmount ?? 0)}</StatRow>
      <StatRow label="Number of Prizes Taken:">{userInfo.NumPrizes}</StatRow>
      <StatRow label="Maximum Amount Gained (in prize winnings):">
        {(userInfo.MaxWinAmount ?? 0).toFixed(6)} ETH
      </StatRow>
      <StatRow label="Amount of Winnings in ETH raffles:">
        {(userInfo.SumRaffleEthWinnings ?? 0).toFixed(6)} ETH
      </StatRow>
      <StatRow label="Amount Withdrawn from ETH raffles:">
        {(userInfo.SumRaffleEthWithdrawal ?? 0).toFixed(6)} ETH
      </StatRow>
      <StatRow label="Unclaimed Donated NFTs:">{userInfo.UnclaimedNFTs}</StatRow>
      <StatRow label="Total ETH Won in raffles:">
        <Link href={`/user/raffle-eth/${userInfo.Address}`} className="text-inherit">
          {((userInfo.SumRaffleEthWinnings ?? 0) + (userInfo.SumRaffleEthWithdrawal ?? 0)).toFixed(
            6,
          )}{' '}
          ETH
        </Link>
      </StatRow>
      <StatRow label="Number of (ETH) raffles Participated in:">
        {userInfo.NumRaffleEthWinnings}
      </StatRow>
      <StatRow label="Raffle NFTs Count (Raffle Mints):">
        <Link href={`/user/raffle-nft/${userInfo.Address}`} className="text-inherit">
          {userInfo.RaffleNFTsCount}
        </Link>
      </StatRow>
      <StatRow label="Reward NFTs Count (All Mints):">{userInfo.RewardNFTsCount}</StatRow>
      <StatRow label="Number of Cosmic Signature Tokens Won:">{userInfo.TotalCSTokensWon}</StatRow>

      {!((data?.CurRoundNum ?? 0) > 0 && data?.TsRoundStart === 0) && raffleETHProbability >= 0 && (
        <>
          <StatRow label="Probability of Winning ETH:">
            {(raffleETHProbability * 100).toFixed(2)}%
          </StatRow>
          <StatRow label="Probability of Winning NFT:">
            {(raffleNFTProbability * 100).toFixed(2)}%
          </StatRow>
        </>
      )}

      <p className="mt-6">
        This account has {userInfo.CosmicSignatureNumTransfers} CosmicSignature (ERC721) transfers.
        Click{' '}
        <Link
          href={`/cosmic-signature-transfer/${userInfo.Address}`}
          className="text-primary underline"
        >
          here
        </Link>{' '}
        to see all the transfers made by this account.
      </p>
      <p className="mt-2">
        Click{' '}
        <Link
          href={`/cosmic-token-transfer/${userInfo.Address}`}
          className="text-primary underline"
        >
          here
        </Link>{' '}
        to see all CosmicToken (ERC20) transfers made by this account.
      </p>
    </>
  );
}
