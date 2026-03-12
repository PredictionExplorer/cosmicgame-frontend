'use client';

import { type SyntheticEvent, type ComponentProps } from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

import type { EnduranceChampion } from '@/utils';

import Prize from '@/components/common/Prize';
import BiddingHistory from '@/components/tables/BiddingHistoryTable';
import RaffleHolderTable from '@/components/tables/RaffleHolderTable';
import ETHSpentTable from '@/components/tables/ETHSpentTable';
import EnduranceChampionsTable from '@/components/tables/EnduranceChampionsTable';
import EthDonationTable from '@/components/tables/EthDonationTable';
import { FundDistribution } from '@/components/tokens/FundDistribution';
import { DonatedTokensSection } from '@/components/home/DonatedTokensSection';
import { SectionDivider } from '@/components/ui/section-divider';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import type { DashboardInfo, BidInfo, DonatedNFT } from '@/services/api/types';

interface RoundInfoSectionProps {
  data: DashboardInfo | null;
  curBidList: BidInfo[];
  championList: EnduranceChampion[] | null;
  ethDonations: import('@/components/tables/EthDonationTable').EthDonation[];
  donatedNFTs: DonatedNFT[];
  donatedERC20Tokens: import('@/components/donations/DonatedERC20Table').DonatedERC20Token[];
  donatedTokensTab: number;
  onTabChange: (_event: SyntheticEvent, newValue: number) => void;
  curPage: number;
  setCurPage: (page: number) => void;
  perPage: number;
}

const sectionFade = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: 'easeOut' as const },
  }),
};

/** Displays full round details: prize info, fund distribution, leaderboards, bid history, donations, and rules. */
export function RoundInfoSection({
  data,
  curBidList,
  championList,
  ethDonations,
  donatedNFTs,
  donatedERC20Tokens,
  donatedTokensTab,
  onTabChange,
  curPage,
  setCurPage,
  perPage,
}: RoundInfoSectionProps) {
  return (
    <div className="space-y-16">
      {/* 1. Prize Breakdown */}
      <motion.div custom={0} variants={sectionFade} initial="hidden" animate="visible">
        {data && <Prize data={data} />}
      </motion.div>

      {/* 2. Fund Distribution */}
      <motion.div custom={1} variants={sectionFade} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-6">
          <SectionDivider title="Fund Distribution" className="flex-1" />
          <InfoTooltip content="How the total prize pool is split across prizes, raffle, charity, staking, and next round." />
        </div>
        <FundDistribution data={data ?? undefined} />
      </motion.div>

      {/* 3. Raffle Ticket Holders */}
      <motion.div custom={2} variants={sectionFade} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-6">
          <SectionDivider title="Raffle Ticket Holders" className="flex-1" />
          <InfoTooltip content="Each bid earns one raffle ticket. More bids = higher chance of winning ETH or NFT raffle prizes." />
        </div>
        <RaffleHolderTable
          list={curBidList}
          numRaffleEthWinner={data?.NumRaffleEthWinnersBidding}
          numRaffleNFTWinner={data?.NumRaffleNFTWinnersBidding}
        />
      </motion.div>

      {/* 4. Top ETH Spenders */}
      <motion.div custom={3} variants={sectionFade} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-6">
          <SectionDivider title="Top ETH Spenders" className="flex-1" />
          <InfoTooltip content="Addresses ranked by total ETH spent on bids this round." />
        </div>
        <ETHSpentTable list={curBidList as ComponentProps<typeof ETHSpentTable>['list']} />
      </motion.div>

      {/* 5. Endurance Champions */}
      <motion.div custom={4} variants={sectionFade} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-6">
          <SectionDivider title="Endurance Champions" className="flex-1" />
          <InfoTooltip content="Bidders ranked by how long they remained the last bidder. The one with the longest consecutive reign wins CST tokens and an NFT." />
        </div>
        <EnduranceChampionsTable championList={championList} />
      </motion.div>

      {/* 6. Bid History (moved above donations for engagement) */}
      <motion.div custom={5} variants={sectionFade} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-6">
          <SectionDivider
            title={`Bid History — Round ${data?.CurRoundNum ?? ''}`}
            className="flex-1"
          />
          <InfoTooltip content="Chronological record of every bid placed in this round, newest first." />
        </div>
        <BiddingHistory biddingHistory={curBidList} showRound={false} />
      </motion.div>

      {/* 7. ETH Donations (conditional) */}
      {ethDonations.length > 0 && (
        <motion.div custom={6} variants={sectionFade} initial="hidden" animate="visible">
          <div className="flex items-center gap-2 mb-6">
            <SectionDivider title="ETH Donations" className="flex-1" />
            <InfoTooltip content="Direct ETH donations made by community members during this round." />
          </div>
          <EthDonationTable list={ethDonations} showType={false} />
        </motion.div>
      )}

      {/* 8. Donated Tokens */}
      <motion.div custom={7} variants={sectionFade} initial="hidden" animate="visible">
        <DonatedTokensSection
          donatedNFTs={donatedNFTs}
          donatedERC20Tokens={donatedERC20Tokens}
          donatedTokensTab={donatedTokensTab}
          onTabChange={onTabChange}
          curPage={curPage}
          setCurPage={setCurPage}
          perPage={perPage}
        />
      </motion.div>

      {/* 9. Round Rules (reference material at the bottom) */}
      <motion.div custom={8} variants={sectionFade} initial="hidden" animate="visible">
        <div className="flex items-center gap-2 mb-4">
          <SectionDivider title="Round Rules" className="flex-1" />
          <InfoTooltip content="Key rules and reward mechanics for this round." />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 text-sm text-muted-foreground space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-4 w-4 text-primary/60" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              How it works
            </span>
          </div>
          <p>
            When you bid, you receive{' '}
            <span className="text-white font-medium">100 Cosmic Tokens</span> as a reward, enabling
            DAO participation.
          </p>
          <p>
            Each bid is also a raffle ticket. {data?.NumRaffleEthWinnersBidding} tickets win{' '}
            {data?.RafflePercentage}% of the pot. {data?.NumRaffleNFTWinnersBidding} additional
            winners and {data?.NumRaffleNFTWinnersStakingRWalk} Random Walk NFT stakers receive a
            Cosmic Signature NFT.
          </p>
          <p>
            Ethereum Protocol Guild receives {data?.CharityPercentage ?? 0}% of the prize pool (at
            least{' '}
            {(
              (Number(data?.CosmicGameBalanceEth) || 0) *
              ((data?.CharityPercentage ?? 0) / 100)
            ).toFixed(4)}{' '}
            ETH) each round.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
