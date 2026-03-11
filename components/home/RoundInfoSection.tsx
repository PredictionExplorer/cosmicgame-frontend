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
    <>
      <div>
        <p className="text-sm mt-8">
          When you bid, you will get 100 Cosmic Tokens as a reward. These tokens allow you to
          participate in the DAO.
        </p>
        <div className="mt-4">
          <span className="text-sm text-primary">*</span>
          <span className="text-sm">
            When you bid, you are also buying a raffle ticket. {data?.NumRaffleEthWinnersBidding}{' '}
            raffle tickets will be chosen and these people will win {data?.RafflePercentage}% of the
            pot. Also, {data?.NumRaffleNFTWinnersBidding} additional winners and{' '}
            {data?.NumRaffleNFTWinnersStakingRWalk} Random Walk NFT stakers will be chosen which
            will receive a Cosmic Signature NFT.
          </span>
        </div>
        <p className="text-sm mt-4">
          When this round ends, Ethereum Protocol Guild (
          <a
            href="https://protocol-guild.readthedocs.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-inherit"
          >
            https://protocol-guild.readthedocs.io
          </a>
          ) will receive {data?.CharityPercentage ?? 0}% of the prize pool (at least{' '}
          {(
            (Number(data?.CosmicGameBalanceEth) || 0) *
            ((data?.CharityPercentage ?? 0) / 100)
          ).toFixed(4)}{' '}
          ETH).
        </p>
      </div>
      <div className="mt-12">
        <p className="text-base font-medium text-primary text-center">
          Distribution of funds on each round
        </p>
        <ChartOrPie data={data ?? undefined} />
      </div>

      {data && <Prize data={data} />}

      <div className="mt-20">
        <h6 className="text-lg font-semibold">TOP RAFFLE TICKETS HOLDERS</h6>
        <RaffleHolderTable
          list={curBidList}
          numRaffleEthWinner={data?.NumRaffleEthWinnersBidding}
          numRaffleNFTWinner={data?.NumRaffleNFTWinnersBidding}
        />
      </div>
      <div className="mt-20">
        <h6 className="text-lg font-semibold">TOP ETH SPENDERS FOR BID</h6>
        <ETHSpentTable list={curBidList as ComponentProps<typeof ETHSpentTable>['list']} />
      </div>
      <div className="mt-20">
        <h6 className="text-lg font-semibold">ENDURANCE CHAMPIONS FOR CURRENT ROUND</h6>
        <EnduranceChampionsTable championList={championList} />
      </div>
      {ethDonations.length > 0 && (
        <div className="mt-20">
          <h6 className="text-lg font-semibold">ETH DONATIONS FOR CURRENT ROUND</h6>
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
      <div className="mt-20">
        <div>
          <span className="text-lg font-semibold">CURRENT ROUND BID HISTORY</span>
          <span className="text-lg font-semibold text-primary ml-2">
            (ROUND {data?.CurRoundNum})
          </span>
        </div>
        <BiddingHistory biddingHistory={curBidList} showRound={false} />
      </div>
    </>
  );
}
