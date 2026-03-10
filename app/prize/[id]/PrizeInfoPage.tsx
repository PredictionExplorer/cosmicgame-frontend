'use client';

import { useEffect, useState, useMemo, type ComponentProps } from 'react';

import {
  getExplorerUrl,
  convertTimestampToDateTime,
  formatEthValue,
  getEnduranceChampions,
} from '@/utils';

import { MainWrapper } from '@/components/styled';
import api from '@/services/api';
import { useNotification } from '@/contexts/NotificationContext';
import { reportError } from '@/utils/errors';
import RaffleWinnerTable from '@/components/tables/RaffleWinnerTable';
import BiddingHistoryTable from '@/components/tables/BiddingHistoryTable';
import StakingWinnerTable from '@/components/tables/StakingWinnerTable';
import DonatedNFTTable from '@/components/donations/DonatedNFTTable';
import EnduranceChampionsTable from '@/components/tables/EnduranceChampionsTable';
import DonatedERC20Table from '@/components/donations/DonatedERC20Table';

/* ------------------------------------------------------------------
  Helper Sub-Component: InfoRow
------------------------------------------------------------------ */
interface InfoRowProps {
  label: string;
  value: string | number;
  link?: string;
  monospace?: boolean;
}
const InfoRow = ({ label, value, link, monospace = false }: InfoRowProps) => {
  return (
    <div className="mb-2">
      <span className="text-primary">{label}</span>
      &nbsp;
      {link ? (
        <span>
          <a
            href={link}
            className={`text-inherit text-[inherit] ${monospace ? 'font-mono' : ''}`}
            target={link.startsWith('http') ? '_blank' : undefined}
            rel={link.startsWith('http') ? 'noreferrer' : undefined}
          >
            {value}
          </a>
        </span>
      ) : (
        <span className={monospace ? 'font-mono' : ''}>{value}</span>
      )}
    </div>
  );
};

/* ------------------------------------------------------------------
  Sub-Component: PrizeDetails
------------------------------------------------------------------ */
interface PrizeDetailsProps {
  prizeInfo: import('@/services/api/types').RoundInfo;
  stakingRewards: unknown[];
}
const PrizeDetails = ({ prizeInfo, stakingRewards }: PrizeDetailsProps) => {
  return (
    <>
      <InfoRow
        label="Datetime:"
        value={convertTimestampToDateTime(prizeInfo.TimeStamp)}
        link={getExplorerUrl('tx', prizeInfo.TxHash)}
      />
      <InfoRow label="Prize Amount:" value={`${prizeInfo.AmountEth.toFixed(4)} ETH`} />
      <InfoRow
        label="Prize Token ID:"
        value={prizeInfo.TokenId}
        link={`/detail/${prizeInfo.TokenId}`}
      />
      <InfoRow
        label="Winner Address:"
        value={prizeInfo.WinnerAddr}
        link={`/user/${prizeInfo.WinnerAddr}`}
        monospace
      />
      <InfoRow label="Charity Address:" value={prizeInfo.CharityAddress} monospace />
      <InfoRow label="Charity Amount:" value={`${prizeInfo.CharityAmountETH.toFixed(4)} ETH`} />
      <InfoRow
        label="Endurance Champion Prize Winner Address:"
        value={prizeInfo.EnduranceWinnerAddr}
        link={`/user/${prizeInfo.EnduranceWinnerAddr}`}
      />
      <InfoRow
        label="Endurance Champion rewarded with CST NFT Token ID:"
        value={prizeInfo.EnduranceERC721TokenId}
        link={`/detail/${prizeInfo.EnduranceERC721TokenId}`}
      />
      <InfoRow
        label="Endurance Champion rewarded with CST (ERC20):"
        value={`${(prizeInfo.EnduranceERC20AmountEth ?? 0).toFixed(4)} CST`}
      />
      <InfoRow
        label="Last CST Bidder Address:"
        value={prizeInfo.LastCstBidderAddr}
        link={`/user/${prizeInfo.LastCstBidderAddr}`}
      />
      <InfoRow
        label="Last CST Bidder NFT Token ID:"
        value={prizeInfo.LastCstBidderERC721TokenId}
        link={`/detail/${prizeInfo.LastCstBidderERC721TokenId}`}
      />
      <InfoRow
        label="Last CST Bidder CST Reward:"
        value={`${(prizeInfo.LastCstBidderERC20AmountEth ?? 0).toFixed(4)} CST`}
      />
      <InfoRow
        label="Chrono Warrior Address:"
        value={prizeInfo.ChronoWarriorAddr}
        link={`/user/${prizeInfo.ChronoWarriorAddr}`}
      />
      <InfoRow
        label="Chrono Warrior ETH Amount:"
        value={`${prizeInfo.ChronoWarriorAmountEth.toFixed(4)} ETH`}
      />
      <InfoRow label="Total Bids:" value={prizeInfo.RoundStats.TotalBids} />
      <InfoRow
        label="Total Donated Amount:"
        value={formatEthValue(prizeInfo.RoundStats.TotalDonatedAmountEth ?? 0)}
      />
      <InfoRow label="Total Donated NFTs:" value={prizeInfo.RoundStats.TotalDonatedNFTs ?? 0} />
      <InfoRow
        label="Total Raffle Eth Deposits:"
        value={`${(prizeInfo.RoundStats.TotalRaffleEthDepositsEth ?? 0).toFixed(4)} ETH`}
      />
      <InfoRow label="Total Raffle NFTs:" value={prizeInfo.RoundStats.TotalRaffleNFTs ?? 0} />
      <InfoRow
        label="Total Staking Deposit Amount:"
        value={`${prizeInfo.StakingDepositAmountEth.toFixed(4)} ETH`}
      />
      <InfoRow label="Number of Staked Tokens:" value={prizeInfo.StakingNumStakedTokens} />
      <InfoRow label="Number of Stakers:" value={stakingRewards.length} />
    </>
  );
};

/* ------------------------------------------------------------------
  Sub-Components for Sections
------------------------------------------------------------------ */
interface BiddingHistorySectionProps {
  bidHistory: import('@/services/api/types').BidInfo[];
}
const BiddingHistorySection = ({ bidHistory }: BiddingHistorySectionProps) => (
  <div className="mt-8">
    <h6 className="text-lg font-semibold leading-none">Bid History</h6>
    <BiddingHistoryTable biddingHistory={bidHistory} />
  </div>
);

interface EnduranceChampionsSectionProps {
  championList: import('@/utils').EnduranceChampion[];
}
const EnduranceChampionsSection = ({ championList }: EnduranceChampionsSectionProps) => (
  <div className="mt-8">
    <h6 className="text-lg font-semibold">Endurance Champions</h6>
    <EnduranceChampionsTable championList={championList} />
  </div>
);

interface RaffleWinnersSectionProps {
  RaffleETHDeposits: import('@/services/api/types').RaffleETHDeposit[];
  RaffleNFTWinners: import('@/services/api/types').RaffleNFTWinner[];
}
const RaffleWinnersSection = ({
  RaffleETHDeposits,
  RaffleNFTWinners,
}: RaffleWinnersSectionProps) => (
  <div className="mt-8">
    <h6 className="text-lg font-semibold mb-4">Raffle Rewards</h6>
    <RaffleWinnerTable RaffleETHDeposits={RaffleETHDeposits} RaffleNFTWinners={RaffleNFTWinners} />
  </div>
);

interface StakingRewardsSectionProps {
  stakingRewards: unknown[];
}
const StakingRewardsSection = ({ stakingRewards }: StakingRewardsSectionProps) => (
  <div className="mt-8">
    <h6 className="text-lg font-semibold mb-4">Staking Rewards</h6>
    <StakingWinnerTable
      list={stakingRewards as ComponentProps<typeof StakingWinnerTable>['list']}
    />
  </div>
);

interface DonatedNFTsSectionProps {
  nftDonations: import('@/components/donations/DonatedNFTTable').NFTRecord[];
}
const DonatedNFTsSection = ({ nftDonations }: DonatedNFTsSectionProps) => {
  return (
    <div className="mt-16">
      <h6 className="text-lg font-semibold mb-4">Donated NFTs</h6>
      <DonatedNFTTable list={nftDonations} handleClaim={undefined} claimingTokens={[]} />
    </div>
  );
};

/* ------------------------------------------------------------------
  Main Component: PrizeInfoPage
------------------------------------------------------------------ */
interface PrizeInfoPageProps {
  roundNum: number;
}
const PrizeInfoPage = ({ roundNum }: PrizeInfoPageProps) => {
  const { setNotification } = useNotification();

  const [donatedERC20Tokens, setDonatedERC20Tokens] = useState<
    import('@/components/donations/DonatedERC20Table').DonatedERC20Token[]
  >([]);
  const [bidHistory, setBidHistory] = useState<import('@/services/api/types').BidInfo[]>([]);
  const [nftDonations, setNftDonations] = useState<
    import('@/components/donations/DonatedNFTTable').NFTRecord[]
  >([]);
  const [prizeInfo, setPrizeInfo] = useState<import('@/services/api/types').RoundInfo | null>(null);
  const [stakingRewards, setStakingRewards] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDonatedERC20Tokens = async () => {
    try {
      const donatedERC20Tokens = await api.get_donations_erc20_by_round(roundNum);
      setDonatedERC20Tokens(
        donatedERC20Tokens as import('@/components/donations/DonatedERC20Table').DonatedERC20Token[],
      );
    } catch (error) {
      reportError(error, 'fetch donated ERC20 tokens');
      setNotification({
        text: 'Failed to load donated ERC20 tokens.',
        type: 'error',
        visible: true,
      });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [nftDonationsData, prizeInfoData, bidHistoryData, stakingRewardsData] =
          await Promise.all([
            api.get_donations_nft_by_round(roundNum),
            api.get_round_info(roundNum),
            api.get_bid_list_by_round(roundNum, 'desc'),
            api.get_staking_cst_rewards_by_round(roundNum),
          ]);
        setNftDonations(
          nftDonationsData as import('@/components/donations/DonatedNFTTable').NFTRecord[],
        );
        setPrizeInfo(prizeInfoData);
        setBidHistory(bidHistoryData);
        setStakingRewards(stakingRewardsData);
      } catch (error) {
        reportError(error, 'fetch prize round data');
        setNotification({
          text: 'Failed to load data. Please try again later.',
          type: 'error',
          visible: true,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    fetchDonatedERC20Tokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundNum, setNotification]);

  const championList = useMemo(() => {
    if (bidHistory.length > 0 && prizeInfo) {
      const champions = getEnduranceChampions(bidHistory, prizeInfo.TimeStamp);
      return champions.sort((a, b) => b.chronoWarrior - a.chronoWarrior);
    }
    return [];
  }, [bidHistory, prizeInfo]);

  if (roundNum < 0) {
    return (
      <MainWrapper>
        <h6 className="text-lg font-semibold">Invalid Round Number</h6>
      </MainWrapper>
    );
  }

  if (loading) {
    return (
      <MainWrapper>
        <h6 className="text-lg font-semibold">Loading...</h6>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <div className="mb-8">
        <span className="text-2xl font-bold text-primary mr-4">{`Round #${roundNum}`}</span>
        <span className="text-2xl font-bold">Prize Information</span>
      </div>

      {!prizeInfo ? (
        <p>Prize data not found!</p>
      ) : (
        <div>
          <PrizeDetails prizeInfo={prizeInfo} stakingRewards={stakingRewards} />

          <BiddingHistorySection bidHistory={bidHistory} />

          <EnduranceChampionsSection championList={championList} />

          <RaffleWinnersSection
            RaffleETHDeposits={prizeInfo.RaffleETHDeposits}
            RaffleNFTWinners={prizeInfo.RaffleNFTWinners}
          />

          <StakingRewardsSection stakingRewards={stakingRewards} />

          <DonatedNFTsSection nftDonations={nftDonations} />

          <div className="mt-16">
            <h6 className="text-lg font-semibold mb-4">Donated ERC20 Tokens</h6>
            <DonatedERC20Table list={donatedERC20Tokens} handleClaim={null} />
          </div>
        </div>
      )}
    </MainWrapper>
  );
};

export default PrizeInfoPage;
