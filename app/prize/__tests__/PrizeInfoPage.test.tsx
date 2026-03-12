import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen, waitFor } from '@/test-utils';

import PrizeInfoPage from '../[id]/PrizeInfoPage';

const mockUseRoundInfo = jest.fn();
const mockUseBidListByRound = jest.fn();
const mockUseDonationsNFTByRound = jest.fn();
const mockUseStakingCSTRewardsByRound = jest.fn();
const mockUseDonationsERC20ByRound = jest.fn();
const mockUseRoundList = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useRoundInfo: (...args: unknown[]) => mockUseRoundInfo(...args),
  useBidListByRound: (...args: unknown[]) => mockUseBidListByRound(...args),
  useDonationsNFTByRound: (...args: unknown[]) => mockUseDonationsNFTByRound(...args),
  useStakingCSTRewardsByRound: (...args: unknown[]) => mockUseStakingCSTRewardsByRound(...args),
  useDonationsERC20ByRound: (...args: unknown[]) => mockUseDonationsERC20ByRound(...args),
  useRoundList: (...args: unknown[]) => mockUseRoundList(...args),
}));

const mockCopy = jest.fn();
jest.mock('../../../hooks/useClipboard', () => ({
  useClipboard: () => ({ copy: mockCopy }),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
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

const basePrizeInfo = {
  TimeStamp: 1700000000,
  TxHash: '0xabc',
  AmountEth: 1.5,
  TokenId: 42,
  WinnerAddr: '0xWinnerAddr1234567890abcdef12345678',
  CharityAddress: '0xCharity1234567890abcdef1234567890',
  CharityAmountETH: 0.1,
  EnduranceWinnerAddr: '0xEndurance234567890abcdef12345678',
  EnduranceERC721TokenId: 10,
  EnduranceERC20AmountEth: 0.05,
  LastCstBidderAddr: '0xLastCST1234567890abcdef12345678ab',
  LastCstBidderERC721TokenId: 11,
  LastCstBidderERC20AmountEth: 0.03,
  ChronoWarriorAddr: '0xChronoWarr234567890abcdef1234567',
  ChronoWarriorAmountEth: 0.02,
  ChronoWarriorCstAmountEth: 0,
  ChronoWarriorNftTokenId: 15,
  StakingDepositAmountEth: 0.5,
  StakingNumStakedTokens: 100,
  StakingPerTokenEth: 0.005,
  RaffleETHDeposits: [{ EvtLogId: 1 }],
  RaffleNFTWinners: [{ EvtLogId: 2 }],
  StakingNFTWinners: [],
  AllPrizes: [],
  CSTAmountEth: 0,
  RoundNum: 1,
  DateTime: '',
  RoundStats: {
    TotalBids: 50,
    TotalDonatedAmountEth: 2.0,
    TotalDonatedNFTs: 3,
    TotalRaffleEthDepositsEth: 1.0,
    TotalRaffleNFTs: 2,
  },
};

const defaultRoundList = [{ RoundNum: 0 }, { RoundNum: 1 }, { RoundNum: 2 }, { RoundNum: 3 }];

function setupDefaultMocks() {
  mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: false });
  mockUseBidListByRound.mockReturnValue({ data: [], isLoading: false });
  mockUseDonationsNFTByRound.mockReturnValue({ data: [], isLoading: false });
  mockUseStakingCSTRewardsByRound.mockReturnValue({ data: [], isLoading: false });
  mockUseDonationsERC20ByRound.mockReturnValue({ data: [], isLoading: false });
  mockUseRoundList.mockReturnValue({ data: defaultRoundList, isLoading: false });
}

beforeEach(() => {
  jest.clearAllMocks();
  setupDefaultMocks();
});

function renderWithData(roundNum = 1, overrides: Record<string, unknown> = {}) {
  mockUseRoundInfo.mockReturnValue({
    data: { ...basePrizeInfo, ...overrides },
    isLoading: false,
  });
  mockUseBidListByRound.mockReturnValue({
    data: [{ EvtLogId: 1, TimeStamp: 1700000000, BidderAddr: '0x1' }],
    isLoading: false,
  });
  return render(<PrizeInfoPage roundNum={roundNum} />);
}

describe('PrizeInfoPage', () => {
  describe('error and loading states', () => {
    it('shows invalid round message for negative roundNum', () => {
      render(<PrizeInfoPage roundNum={-1} />);
      expect(screen.getByText('Invalid Round Number')).toBeInTheDocument();
      expect(screen.getByText(/Back to Prize Winners/i)).toBeInTheDocument();
    });

    it('shows skeleton loading state', () => {
      mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: true });
      const { container } = render(<PrizeInfoPage roundNum={1} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows loading when any sub-query is still loading', () => {
      mockUseRoundInfo.mockReturnValue({ data: basePrizeInfo, isLoading: false });
      mockUseDonationsNFTByRound.mockReturnValue({ data: [], isLoading: true });
      const { container } = render(<PrizeInfoPage roundNum={1} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows not found when prizeInfo is null after loading', () => {
      mockUseRoundInfo.mockReturnValue({ data: null, isLoading: false });
      render(<PrizeInfoPage roundNum={1} />);
      expect(screen.getByText('Prize Data Not Found')).toBeInTheDocument();
      expect(screen.getByText(/Back to Prize Winners/i)).toBeInTheDocument();
    });
  });

  describe('hero / round header', () => {
    it('renders round number and breadcrumbs', () => {
      renderWithData(1);
      expect(screen.getByText('Round #1')).toBeInTheDocument();
      expect(screen.getByText('Prize Winners')).toBeInTheDocument();
      expect(screen.getByText('Round 1')).toBeInTheDocument();
    });

    it('renders finalized timestamp in subtitle', () => {
      renderWithData(1);
      expect(screen.getByText(/Finalized/i)).toBeInTheDocument();
    });

    it('renders explorer transaction link', () => {
      renderWithData(1);
      expect(screen.getByText('View transaction')).toBeInTheDocument();
    });
  });

  describe('round navigation', () => {
    it('renders round navigation with prev and next links', () => {
      renderWithData(1);
      const nav = screen.getByTestId('round-navigation');
      expect(nav).toBeInTheDocument();
      expect(screen.getByLabelText('Previous round')).toBeInTheDocument();
      expect(screen.getByLabelText('Next round')).toBeInTheDocument();
    });

    it('hides previous button for round 0', () => {
      renderWithData(0);
      expect(screen.queryByLabelText('Previous round')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Next round')).toBeInTheDocument();
    });

    it('hides next button when at max round', () => {
      mockUseRoundList.mockReturnValue({
        data: [{ RoundNum: 0 }, { RoundNum: 1 }],
        isLoading: false,
      });
      renderWithData(1);
      expect(screen.getByLabelText('Previous round')).toBeInTheDocument();
      expect(screen.queryByLabelText('Next round')).not.toBeInTheDocument();
    });
  });

  describe('winner spotlight cards', () => {
    it('renders all three spotlight cards', () => {
      renderWithData(1);
      expect(screen.getByText('Winner Spotlight')).toBeInTheDocument();
      expect(screen.getByTestId('winner-spotlight-main-prize-winner')).toBeInTheDocument();
      expect(screen.getByTestId('winner-spotlight-chrono-warrior')).toBeInTheDocument();
      expect(screen.getByTestId('winner-spotlight-endurance-champion')).toBeInTheDocument();
    });

    it('displays main prize amount in spotlight and stats', () => {
      renderWithData(1);
      const elements = screen.getAllByText('1.5000 ETH');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('displays chrono warrior amount in spotlight and details', () => {
      renderWithData(1);
      const elements = screen.getAllByText('0.0200 ETH');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('displays endurance champion CST amount in spotlight and details', () => {
      renderWithData(1);
      const elements = screen.getAllByText('0.0500 CST');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('shows token links for NFT rewards', () => {
      renderWithData(1);
      expect(screen.getByText('Token #42')).toBeInTheDocument();
      expect(screen.getByText('Token #10')).toBeInTheDocument();
    });
  });

  describe('stat cards', () => {
    it('renders all 6 stat cards', () => {
      renderWithData(1);
      expect(screen.getByText('Round Statistics')).toBeInTheDocument();
      expect(screen.getByTestId('stat-card-prize-pool')).toBeInTheDocument();
      expect(screen.getByTestId('stat-card-charity')).toBeInTheDocument();
      expect(screen.getByTestId('stat-card-staking-deposit')).toBeInTheDocument();
      expect(screen.getByTestId('stat-card-raffle-deposits')).toBeInTheDocument();
      expect(screen.getByTestId('stat-card-total-bids')).toBeInTheDocument();
      expect(screen.getByTestId('stat-card-donated-nfts')).toBeInTheDocument();
    });

    it('displays correct stat values', () => {
      renderWithData(1);
      expect(screen.getByTestId('stat-card-total-bids')).toHaveTextContent('50');
      expect(screen.getByTestId('stat-card-donated-nfts')).toHaveTextContent('3');
    });
  });

  describe('special prize recipients', () => {
    it('renders all three special prize cards', () => {
      renderWithData(1);
      expect(screen.getByText('Special Prize Recipients')).toBeInTheDocument();
      expect(screen.getByTestId('special-prize-endurance-champion')).toBeInTheDocument();
      expect(screen.getByTestId('special-prize-chrono-warrior')).toBeInTheDocument();
      expect(screen.getByTestId('special-prize-last-cst-bidder')).toBeInTheDocument();
    });

    it('displays staked tokens count', () => {
      renderWithData(1);
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('renders additional details row', () => {
      renderWithData(1);
      expect(screen.getByText('Staked Tokens')).toBeInTheDocument();
      expect(screen.getByText('Number of Stakers')).toBeInTheDocument();
      expect(screen.getByText('Total Donated')).toBeInTheDocument();
    });
  });

  describe('tabbed data sections', () => {
    it('renders all tab triggers', () => {
      renderWithData(1);
      expect(screen.getByRole('tab', { name: /Bid History/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Endurance Champions/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Raffle Rewards/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Staking Rewards/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Donations/i })).toBeInTheDocument();
    });

    it('shows bid history table by default', () => {
      renderWithData(1);
      expect(screen.getByTestId('bidding-history-table')).toBeInTheDocument();
    });

    it('switches to endurance champions tab', async () => {
      const user = userEvent.setup();
      renderWithData(1);
      await user.click(screen.getByRole('tab', { name: /Endurance Champions/i }));
      await waitFor(() => {
        expect(screen.getByTestId('endurance-champions-table')).toBeInTheDocument();
      });
    });

    it('switches to raffle rewards tab', async () => {
      const user = userEvent.setup();
      renderWithData(1);
      await user.click(screen.getByRole('tab', { name: /Raffle Rewards/i }));
      await waitFor(() => {
        expect(screen.getByTestId('raffle-winner-table')).toBeInTheDocument();
      });
    });

    it('switches to staking rewards tab and shows empty state', async () => {
      const user = userEvent.setup();
      renderWithData(1);
      await user.click(screen.getByRole('tab', { name: /Staking Rewards/i }));
      await waitFor(() => {
        expect(
          screen.getByText('No staking rewards distributed in this round.'),
        ).toBeInTheDocument();
      });
    });

    it('switches to donations tab and shows both NFT and ERC20 tables', async () => {
      const user = userEvent.setup();
      mockUseDonationsNFTByRound.mockReturnValue({
        data: [{ id: 1 }],
        isLoading: false,
      });
      mockUseDonationsERC20ByRound.mockReturnValue({
        data: [{ id: 1 }],
        isLoading: false,
      });
      renderWithData(1);
      await user.click(screen.getByRole('tab', { name: /Donations/i }));
      await waitFor(() => {
        expect(screen.getByTestId('donated-nft-table')).toBeInTheDocument();
        expect(screen.getByTestId('donated-erc20-table')).toBeInTheDocument();
      });
    });
  });

  describe('empty states', () => {
    it('shows empty state for bid history when no bids', () => {
      mockUseRoundInfo.mockReturnValue({ data: basePrizeInfo, isLoading: false });
      mockUseBidListByRound.mockReturnValue({ data: [], isLoading: false });
      render(<PrizeInfoPage roundNum={1} />);
      expect(screen.getByText('No bids were placed in this round.')).toBeInTheDocument();
    });

    it('shows empty state for raffle when no deposits or winners', async () => {
      const user = userEvent.setup();
      mockUseRoundInfo.mockReturnValue({
        data: {
          ...basePrizeInfo,
          RaffleETHDeposits: [],
          RaffleNFTWinners: [],
        },
        isLoading: false,
      });
      mockUseBidListByRound.mockReturnValue({ data: [], isLoading: false });
      render(<PrizeInfoPage roundNum={1} />);
      await user.click(screen.getByRole('tab', { name: /Raffle Rewards/i }));
      await waitFor(() => {
        expect(screen.getByText('No raffle rewards for this round.')).toBeInTheDocument();
      });
    });
  });

  describe('copy address', () => {
    it('copies address to clipboard on copy button click', async () => {
      const user = userEvent.setup();
      renderWithData(1);
      const copyButtons = screen.getAllByLabelText(/Copy address/i);
      expect(copyButtons.length).toBeGreaterThan(0);
      await user.click(copyButtons[0]!);
      await waitFor(() => {
        expect(mockCopy).toHaveBeenCalled();
      });
    });
  });

  describe('tab badges', () => {
    it('shows bid count badge on bid history tab', () => {
      renderWithData(1);
      const bidsTab = screen.getByRole('tab', { name: /Bid History/i });
      expect(bidsTab).toHaveTextContent('1');
    });
  });

  describe('accessibility', () => {
    it('has no accessibility violations with data', async () => {
      const { container } = renderWithData(1);
      await checkA11y(container);
    });

    it('has no accessibility violations for invalid round', async () => {
      const { container } = render(<PrizeInfoPage roundNum={-1} />);
      await checkA11y(container);
    });

    it('has no accessibility violations for not found state', async () => {
      mockUseRoundInfo.mockReturnValue({ data: null, isLoading: false });
      const { container } = render(<PrizeInfoPage roundNum={1} />);
      await checkA11y(container);
    });

    it('sections have aria labels', () => {
      renderWithData(1);
      expect(screen.getByLabelText('Winner Spotlight')).toBeInTheDocument();
      expect(screen.getByLabelText('Round Statistics')).toBeInTheDocument();
      expect(screen.getByLabelText('Special Prize Recipients')).toBeInTheDocument();
      expect(screen.getByLabelText('Round Data')).toBeInTheDocument();
    });
  });
});
