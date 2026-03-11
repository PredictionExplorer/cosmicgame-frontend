import { type SyntheticEvent, type ComponentProps } from 'react';

import type { EnduranceChampion } from '@/utils';

import Prize from '@/components/common/Prize';
import BiddingHistory from '@/components/tables/BiddingHistoryTable';
import RaffleHolderTable from '@/components/tables/RaffleHolderTable';
import ETHSpentTable from '@/components/tables/ETHSpentTable';
import EnduranceChampionsTable from '@/components/tables/EnduranceChampionsTable';
import EthDonationTable from '@/components/tables/EthDonationTable';
import ChartOrPie from '@/components/tokens/ChartOrPie';
import { DonatedTokensSection } from '@/components/home/DonatedTokensSection';
import { SectionDivider } from '@/components/ui/section-divider';
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

/** Displays full round details: prize info, bid history, endurance champions, ETH donations, donated tokens, and charts. */
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
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 text-sm text-muted-foreground space-y-3">
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

      <div>
        <SectionDivider title="Fund Distribution" className="mb-6" />
        <ChartOrPie data={data ?? undefined} />
      </div>

      {data && <Prize data={data} />}

      <div>
        <SectionDivider title="Raffle Ticket Holders" className="mb-6" />
        <RaffleHolderTable
          list={curBidList}
          numRaffleEthWinner={data?.NumRaffleEthWinnersBidding}
          numRaffleNFTWinner={data?.NumRaffleNFTWinnersBidding}
        />
      </div>

      <div>
        <SectionDivider title="Top ETH Spenders" className="mb-6" />
        <ETHSpentTable list={curBidList as ComponentProps<typeof ETHSpentTable>['list']} />
      </div>

      <div>
        <SectionDivider title="Endurance Champions" className="mb-6" />
        <EnduranceChampionsTable championList={championList} />
      </div>

      {ethDonations.length > 0 && (
        <div>
          <SectionDivider title="ETH Donations" className="mb-6" />
          <EthDonationTable list={ethDonations} showType={false} />
        </div>
      )}

      <DonatedTokensSection
        donatedNFTs={donatedNFTs}
        donatedERC20Tokens={donatedERC20Tokens}
        donatedTokensTab={donatedTokensTab}
        onTabChange={onTabChange}
        curPage={curPage}
        setCurPage={setCurPage}
        perPage={perPage}
      />

      <div>
        <SectionDivider title={`Bid History — Round ${data?.CurRoundNum ?? ''}`} className="mb-6" />
        <BiddingHistory biddingHistory={curBidList} showRound={false} />
      </div>
    </div>
  );
}
