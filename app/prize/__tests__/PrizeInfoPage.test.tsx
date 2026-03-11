import { render, screen } from '@/test-utils';

import PrizeInfoPage from '../[id]/PrizeInfoPage';

const mockUseRoundInfo = jest.fn().mockReturnValue({ data: undefined, isLoading: false });
const mockUseBidListByRound = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseDonationsNFTByRound = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseStakingCSTRewardsByRound = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseDonationsERC20ByRound = jest.fn().mockReturnValue({ data: [], isLoading: false });

jest.mock('../../../hooks/useApiQuery', () => ({
  useRoundInfo: (...args: unknown[]) => mockUseRoundInfo(...args),
  useBidListByRound: (...args: unknown[]) => mockUseBidListByRound(...args),
  useDonationsNFTByRound: (...args: unknown[]) => mockUseDonationsNFTByRound(...args),
  useStakingCSTRewardsByRound: (...args: unknown[]) => mockUseStakingCSTRewardsByRound(...args),
  useDonationsERC20ByRound: (...args: unknown[]) => mockUseDonationsERC20ByRound(...args),
}));

jest.mock('../../../components/tables/RaffleWinnerTable', () => ({
  __esModule: true,
  default: () => <div data-testid="raffle-winner-table" />,
}));
jest.mock('../../../components/tables/BiddingHistoryTable', () => ({
  __esModule: true,
  default: ({ biddingHistory }: { biddingHistory: unknown[] }) => (
    <div data-testid="bidding-history-table">bids: {biddingHistory.length}</div>
  ),
}));
jest.mock('../../../components/tables/StakingWinnerTable', () => ({
  __esModule: true,
  default: () => <div data-testid="staking-winner-table" />,
}));
jest.mock('../../../components/donations/DonatedNFTTable', () => ({
  __esModule: true,
  default: () => <div data-testid="donated-nft-table" />,
}));
jest.mock('../../../components/tables/EnduranceChampionsTable', () => ({
  __esModule: true,
  default: () => <div data-testid="endurance-champions-table" />,
}));
jest.mock('../../../components/donations/DonatedERC20Table', () => ({
  __esModule: true,
  default: () => <div data-testid="donated-erc20-table" />,
}));

beforeEach(() => jest.clearAllMocks());

const basePrizeInfo = {
  TimeStamp: 1700000000,
  TxHash: '0xabc',
  AmountEth: 1.5,
  TokenId: 42,
  WinnerAddr: '0xWinner',
  CharityAddress: '0xCharity',
  CharityAmountETH: 0.1,
  EnduranceWinnerAddr: '0xEndurance',
  EnduranceERC721TokenId: 10,
  EnduranceERC20AmountEth: 0.05,
  LastCstBidderAddr: '0xLastCST',
  LastCstBidderERC721TokenId: 11,
  LastCstBidderERC20AmountEth: 0.03,
  ChronoWarriorAddr: '0xChrono',
  ChronoWarriorAmountEth: 0.02,
  StakingDepositAmountEth: 0.5,
  StakingNumStakedTokens: 100,
  RaffleETHDeposits: [],
  RaffleNFTWinners: [],
  RoundStats: {
    TotalBids: 50,
    TotalDonatedAmountEth: 2.0,
    TotalDonatedNFTs: 3,
    TotalRaffleEthDepositsEth: 1.0,
    TotalRaffleNFTs: 2,
  },
};

describe('PrizeInfoPage', () => {
  it('shows invalid round for negative roundNum', () => {
    render(<PrizeInfoPage roundNum={-1} />);
    expect(screen.getByText('Invalid Round Number')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<PrizeInfoPage roundNum={1} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows not found when prizeInfo is null after loading', () => {
    mockUseRoundInfo.mockReturnValue({ data: null, isLoading: false });
    render(<PrizeInfoPage roundNum={1} />);
    expect(screen.getByText('Prize data not found!')).toBeInTheDocument();
  });

  it('renders prize details and sub-tables with data', () => {
    mockUseRoundInfo.mockReturnValue({ data: basePrizeInfo, isLoading: false });
    mockUseBidListByRound.mockReturnValue({
      data: [{ EvtLogId: 1, TimeStamp: 1700000000, BidderAddr: '0x1' }],
      isLoading: false,
    });
    render(<PrizeInfoPage roundNum={1} />);

    expect(screen.getByText('Round #1')).toBeInTheDocument();
    expect(screen.getByText('Prize Information')).toBeInTheDocument();
    expect(screen.getByText('1.5000 ETH')).toBeInTheDocument();
    expect(screen.getByText('Bid History')).toBeInTheDocument();
    expect(screen.getByTestId('bidding-history-table')).toHaveTextContent('bids: 1');
    expect(screen.getByTestId('raffle-winner-table')).toBeInTheDocument();
    expect(screen.getByTestId('staking-winner-table')).toBeInTheDocument();
    expect(screen.getByTestId('donated-nft-table')).toBeInTheDocument();
    expect(screen.getByTestId('donated-erc20-table')).toBeInTheDocument();
  });

  it('shows loading when any sub-query is still loading', () => {
    mockUseRoundInfo.mockReturnValue({ data: basePrizeInfo, isLoading: false });
    mockUseDonationsNFTByRound.mockReturnValue({ data: [], isLoading: true });
    render(<PrizeInfoPage roundNum={1} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
