import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen, waitFor, within } from '@/test-utils';

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

    it('shows loading when staking query is still loading', () => {
      mockUseRoundInfo.mockReturnValue({ data: basePrizeInfo, isLoading: false });
      mockUseStakingCSTRewardsByRound.mockReturnValue({ data: [], isLoading: true });
      const { container } = render(<PrizeInfoPage roundNum={1} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows loading when ERC20 query is still loading', () => {
      mockUseRoundInfo.mockReturnValue({ data: basePrizeInfo, isLoading: false });
      mockUseDonationsERC20ByRound.mockReturnValue({ data: [], isLoading: true });
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

    it('not found message includes the round number', () => {
      mockUseRoundInfo.mockReturnValue({ data: null, isLoading: false });
      render(<PrizeInfoPage roundNum={99} />);
      expect(screen.getByText(/round #99/i)).toBeInTheDocument();
    });
  });

  describe('hero banner', () => {
    it('renders round number as heading', () => {
      renderWithData(4);
      expect(screen.getByText('Round #4')).toBeInTheDocument();
    });

    it('renders breadcrumbs with Prize Winners link', () => {
      renderWithData(1);
      const breadcrumbLink = screen.getByText('Prize Winners');
      expect(breadcrumbLink).toBeInTheDocument();
      expect(breadcrumbLink.closest('a')).toHaveAttribute('href', '/prize');
    });

    it('renders current round in breadcrumbs', () => {
      renderWithData(3);
      expect(screen.getByText('Round 3')).toBeInTheDocument();
    });

    it('displays large hero prize amount', () => {
      renderWithData(1);
      const heroAmount = screen.getByTestId('hero-prize-amount');
      expect(heroAmount).toHaveTextContent('1.5000 ETH');
    });

    it('displays winner address in hero section', () => {
      renderWithData(1);
      const heroSection = screen.getByLabelText('Round Hero');
      expect(within(heroSection).getByText(/0xWinn/)).toBeInTheDocument();
    });

    it('renders NFT token link in hero', () => {
      renderWithData(1);
      const heroSection = screen.getByLabelText('Round Hero');
      expect(within(heroSection).getByText('Cosmic Signature #42')).toBeInTheDocument();
    });

    it('renders finalized timestamp', () => {
      renderWithData(1);
      expect(screen.getByText(/Finalized/i)).toBeInTheDocument();
    });

    it('renders explorer transaction link', () => {
      renderWithData(1);
      expect(screen.getByText('View transaction')).toBeInTheDocument();
    });

    it('does not show NFT link when tokenId is 0', () => {
      renderWithData(1, { TokenId: 0 });
      const heroSection = screen.getByLabelText('Round Hero');
      expect(within(heroSection).queryByText(/Cosmic Signature #/)).not.toBeInTheDocument();
    });
  });

  describe('share round button', () => {
    it('renders share button', () => {
      renderWithData(1);
      expect(screen.getByTestId('share-round-button')).toBeInTheDocument();
    });

    it('copies round summary to clipboard when clicked', async () => {
      const user = userEvent.setup();
      renderWithData(1);
      await user.click(screen.getByTestId('share-round-button'));
      await waitFor(() => {
        expect(mockCopy).toHaveBeenCalledWith(expect.stringContaining('Round #1'));
      });
    });

    it('share summary includes prize amount', async () => {
      const user = userEvent.setup();
      renderWithData(1);
      await user.click(screen.getByTestId('share-round-button'));
      await waitFor(() => {
        expect(mockCopy).toHaveBeenCalledWith(expect.stringContaining('1.5000 ETH'));
      });
    });

    it('share summary includes winner address', async () => {
      const user = userEvent.setup();
      renderWithData(1);
      await user.click(screen.getByTestId('share-round-button'));
      await waitFor(() => {
        expect(mockCopy).toHaveBeenCalledWith(expect.stringContaining('Winner:'));
      });
    });

    it('shows success toast after sharing', async () => {
      const { toast } = jest.requireMock('sonner');
      const user = userEvent.setup();
      renderWithData(1);
      await user.click(screen.getByTestId('share-round-button'));
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Round summary copied to clipboard');
      });
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

    it('previous link points to correct round', () => {
      renderWithData(2);
      const prev = screen.getByLabelText('Previous round');
      expect(prev).toHaveAttribute('href', '/prize/1');
    });

    it('next link points to correct round', () => {
      renderWithData(1);
      const next = screen.getByLabelText('Next round');
      expect(next).toHaveAttribute('href', '/prize/2');
    });
  });

  describe('round winners section', () => {
    it('renders section heading', () => {
      renderWithData(1);
      expect(screen.getByText('Round Winners')).toBeInTheDocument();
    });

    it('renders all four winner cards', () => {
      renderWithData(1);
      expect(screen.getByTestId('winner-card-main-prize-winner')).toBeInTheDocument();
      expect(screen.getByTestId('winner-card-chrono-warrior')).toBeInTheDocument();
      expect(screen.getByTestId('winner-card-endurance-champion')).toBeInTheDocument();
      expect(screen.getByTestId('winner-card-last-cst-bidder')).toBeInTheDocument();
    });

    it('displays main prize ETH amount', () => {
      renderWithData(1);
      const elements = screen.getAllByText('1.5000 ETH');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('displays chrono warrior ETH amount', () => {
      renderWithData(1);
      const elements = screen.getAllByText('0.0200 ETH');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('displays endurance champion CST amount', () => {
      renderWithData(1);
      const elements = screen.getAllByText('0.0500 CST');
      expect(elements.length).toBeGreaterThanOrEqual(1);
    });

    it('displays last CST bidder amount', () => {
      renderWithData(1);
      const card = screen.getByTestId('winner-card-last-cst-bidder');
      expect(card).toHaveTextContent('0.0300 CST');
    });

    it('shows token links for NFT rewards', () => {
      renderWithData(1);
      expect(screen.getByText('Token #42')).toBeInTheDocument();
      expect(screen.getByText('Token #15')).toBeInTheDocument();
      expect(screen.getByText('Token #10')).toBeInTheDocument();
      expect(screen.getByText('Token #11')).toBeInTheDocument();
    });

    it('shows "None" when a winner address is empty', () => {
      renderWithData(1, { EnduranceWinnerAddr: '' });
      const card = screen.getByTestId('winner-card-endurance-champion');
      expect(within(card).getByText('None')).toBeInTheDocument();
    });

    it('does not show token link when tokenId is 0', () => {
      renderWithData(1, { ChronoWarriorNftTokenId: 0 });
      const card = screen.getByTestId('winner-card-chrono-warrior');
      expect(within(card).queryByText(/Token #/)).not.toBeInTheDocument();
    });
  });

  describe('prize distribution bar', () => {
    it('renders distribution bar', () => {
      renderWithData(1);
      expect(screen.getByTestId('prize-distribution-bar')).toBeInTheDocument();
    });

    it('renders all four distribution segments', () => {
      renderWithData(1);
      expect(screen.getByTestId('distribution-segment-main-prize')).toBeInTheDocument();
      expect(screen.getByTestId('distribution-segment-charity')).toBeInTheDocument();
      expect(screen.getByTestId('distribution-segment-staking')).toBeInTheDocument();
      expect(screen.getByTestId('distribution-segment-raffle')).toBeInTheDocument();
    });

    it('displays distribution labels', () => {
      renderWithData(1);
      const bar = screen.getByTestId('prize-distribution-bar');
      expect(within(bar).getByText('Main Prize')).toBeInTheDocument();
      expect(within(bar).getByText('Charity')).toBeInTheDocument();
      expect(within(bar).getByText('Staking')).toBeInTheDocument();
      expect(within(bar).getByText('Raffle')).toBeInTheDocument();
    });

    it('displays percentage values', () => {
      renderWithData(1);
      const bar = screen.getByTestId('prize-distribution-bar');
      const pctElements = within(bar).getAllByText(/%$/);
      expect(pctElements.length).toBe(4);
    });

    it('renders section heading with tooltip', () => {
      renderWithData(1);
      expect(screen.getByText('Prize Distribution')).toBeInTheDocument();
    });
  });

  describe('round statistics', () => {
    it('renders section heading', () => {
      renderWithData(1);
      expect(screen.getByText('Round Statistics')).toBeInTheDocument();
    });

    it('renders all 9 stat cards', () => {
      renderWithData(1);
      const statsSection = screen.getByLabelText('Round Statistics');
      expect(within(statsSection).getByText('Prize Pool')).toBeInTheDocument();
      expect(within(statsSection).getByText('Charity')).toBeInTheDocument();
      expect(within(statsSection).getByText('Staking Deposit')).toBeInTheDocument();
      expect(within(statsSection).getByText('Raffle Deposits')).toBeInTheDocument();
      expect(within(statsSection).getByText('Total Bids')).toBeInTheDocument();
      expect(within(statsSection).getByText('Donated NFTs')).toBeInTheDocument();
      expect(within(statsSection).getByText('Staked Tokens')).toBeInTheDocument();
      expect(within(statsSection).getByText('Unique Stakers')).toBeInTheDocument();
      expect(within(statsSection).getByText('Total Donated')).toBeInTheDocument();
    });

    it('displays correct bid count', () => {
      renderWithData(1);
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('displays correct donated NFT count', () => {
      renderWithData(1);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('displays staked tokens count', () => {
      renderWithData(1);
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('displays unique stakers count', () => {
      renderWithData(1);
      const statsSection = screen.getByLabelText('Round Statistics');
      expect(within(statsSection).getByText('0')).toBeInTheDocument();
    });

    it('displays total donated value', () => {
      renderWithData(1);
      expect(screen.getByText('2.0000 ETH')).toBeInTheDocument();
    });

    it('displays staking deposit amount', () => {
      renderWithData(1);
      const statsSection = screen.getByLabelText('Round Statistics');
      expect(within(statsSection).getByText('0.5000 ETH')).toBeInTheDocument();
    });
  });

  describe('section divider', () => {
    it('renders detailed data section divider', () => {
      renderWithData(1);
      expect(screen.getByText('Detailed Data')).toBeInTheDocument();
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

    it('shows donated NFT and ERC20 headings in donations tab', async () => {
      const user = userEvent.setup();
      renderWithData(1);
      await user.click(screen.getByRole('tab', { name: /Donations/i }));
      await waitFor(() => {
        const headings = screen.getAllByText('Donated NFTs');
        expect(headings.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Donated ERC20 Tokens')).toBeInTheDocument();
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

    it('shows empty state for endurance when no champion data', async () => {
      const user = userEvent.setup();
      mockUseRoundInfo.mockReturnValue({ data: basePrizeInfo, isLoading: false });
      mockUseBidListByRound.mockReturnValue({ data: [], isLoading: false });
      render(<PrizeInfoPage roundNum={1} />);
      await user.click(screen.getByRole('tab', { name: /Endurance Champions/i }));
      await waitFor(() => {
        expect(
          screen.getByText('No endurance champion data available for this round.'),
        ).toBeInTheDocument();
      });
    });

    it('shows empty state for staking rewards', async () => {
      const user = userEvent.setup();
      mockUseRoundInfo.mockReturnValue({ data: basePrizeInfo, isLoading: false });
      mockUseBidListByRound.mockReturnValue({ data: [], isLoading: false });
      render(<PrizeInfoPage roundNum={1} />);
      await user.click(screen.getByRole('tab', { name: /Staking Rewards/i }));
      await waitFor(() => {
        expect(
          screen.getByText('No staking rewards distributed in this round.'),
        ).toBeInTheDocument();
      });
    });

    it('shows empty states for NFT and ERC20 donations when none exist', async () => {
      const user = userEvent.setup();
      mockUseRoundInfo.mockReturnValue({ data: basePrizeInfo, isLoading: false });
      mockUseBidListByRound.mockReturnValue({ data: [], isLoading: false });
      render(<PrizeInfoPage roundNum={1} />);
      await user.click(screen.getByRole('tab', { name: /Donations/i }));
      await waitFor(() => {
        expect(screen.getByText('No NFTs were donated in this round.')).toBeInTheDocument();
        expect(screen.getByText('No ERC20 tokens were donated in this round.')).toBeInTheDocument();
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

    it('shows toast on address copy', async () => {
      const { toast } = jest.requireMock('sonner');
      const user = userEvent.setup();
      renderWithData(1);
      const copyButtons = screen.getAllByLabelText(/Copy address/i);
      await user.click(copyButtons[0]!);
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Address copied to clipboard');
      });
    });

    it('renders copy buttons for all winner addresses', () => {
      renderWithData(1);
      const copyButtons = screen.getAllByLabelText(/Copy address/i);
      expect(copyButtons.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('tab badges', () => {
    it('shows bid count badge on bid history tab', () => {
      renderWithData(1);
      const bidsTab = screen.getByRole('tab', { name: /Bid History/i });
      expect(bidsTab).toHaveTextContent('1');
    });

    it('shows raffle count badge', () => {
      renderWithData(1);
      const raffleTab = screen.getByRole('tab', { name: /Raffle Rewards/i });
      expect(raffleTab).toHaveTextContent('2');
    });

    it('shows donations count badge', () => {
      mockUseDonationsNFTByRound.mockReturnValue({
        data: [{ id: 1 }, { id: 2 }],
        isLoading: false,
      });
      mockUseDonationsERC20ByRound.mockReturnValue({
        data: [{ id: 1 }],
        isLoading: false,
      });
      renderWithData(1);
      const donationsTab = screen.getByRole('tab', { name: /Donations/i });
      expect(donationsTab).toHaveTextContent('3');
    });
  });

  describe('data fetching', () => {
    it('passes roundNum to useRoundInfo', () => {
      render(<PrizeInfoPage roundNum={5} />);
      expect(mockUseRoundInfo).toHaveBeenCalledWith(5);
    });

    it('passes roundNum and sort direction to useBidListByRound', () => {
      render(<PrizeInfoPage roundNum={5} />);
      expect(mockUseBidListByRound).toHaveBeenCalledWith(5, 'desc');
    });

    it('passes roundNum to useDonationsNFTByRound', () => {
      render(<PrizeInfoPage roundNum={5} />);
      expect(mockUseDonationsNFTByRound).toHaveBeenCalledWith(5);
    });

    it('passes roundNum to useStakingCSTRewardsByRound', () => {
      render(<PrizeInfoPage roundNum={5} />);
      expect(mockUseStakingCSTRewardsByRound).toHaveBeenCalledWith(5);
    });

    it('passes roundNum to useDonationsERC20ByRound', () => {
      render(<PrizeInfoPage roundNum={5} />);
      expect(mockUseDonationsERC20ByRound).toHaveBeenCalledWith(5);
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
      expect(screen.getByLabelText('Round Hero')).toBeInTheDocument();
      expect(screen.getByLabelText('Round Winners')).toBeInTheDocument();
      expect(screen.getByLabelText('Prize Distribution')).toBeInTheDocument();
      expect(screen.getByLabelText('Round Statistics')).toBeInTheDocument();
      expect(screen.getByLabelText('Round Data')).toBeInTheDocument();
    });

    it('share button has accessible label', () => {
      renderWithData(1);
      expect(screen.getByLabelText('Share round summary')).toBeInTheDocument();
    });

    it('navigation links have accessible labels', () => {
      renderWithData(1);
      expect(screen.getByLabelText('Previous round')).toBeInTheDocument();
      expect(screen.getByLabelText('Next round')).toBeInTheDocument();
    });

    it('copy buttons have accessible labels', () => {
      renderWithData(1);
      const copyButtons = screen.getAllByLabelText(/Copy address/i);
      copyButtons.forEach((button) => {
        expect(button).toHaveAttribute('aria-label');
      });
    });
  });
});
