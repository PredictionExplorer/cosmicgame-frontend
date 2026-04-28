import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen, waitFor, within } from '@/test-utils';

import AllocationInfoPage from '../[id]/AllocationInfoPage';

const mockUseRoundInfo = jest.fn();
const mockUseGestureListByCycle = jest.fn();
const mockUseDonationsNFTByRound = jest.fn();
const mockUseCSTAnchorDistributionsByCycle = jest.fn();
const mockUseDonationsERC20ByRound = jest.fn();
const mockUseRoundList = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useRoundInfo: (...args: unknown[]) => mockUseRoundInfo(...args),
  useGestureListByCycle: (...args: unknown[]) => mockUseGestureListByCycle(...args),
  useDonationsNFTByRound: (...args: unknown[]) => mockUseDonationsNFTByRound(...args),
  useCSTAnchorDistributionsByCycle: (...args: unknown[]) =>
    mockUseCSTAnchorDistributionsByCycle(...args),
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

jest.mock('../../../components/tables/StellarSelectionRecipientTable', () => ({
  __esModule: true,
  default: () => <div data-testid="stellar-selection-recipient-table" />,
}));
jest.mock('../../../components/tables/GestureHistoryTable', () => ({
  __esModule: true,
  default: ({ gestureHistory }: { gestureHistory: unknown[] }) => (
    <div data-testid="gesture-history-table">gestures: {gestureHistory.length}</div>
  ),
}));
jest.mock('../../../components/tables/AnchoringRecipientTable', () => ({
  __esModule: true,
  default: () => <div data-testid="anchoring-recipient-table" />,
}));
jest.mock('../../../components/attachments/AttachedNFTTable', () => ({
  __esModule: true,
  default: () => <div data-testid="attached-nft-table" />,
}));
jest.mock('../../../components/tables/EnduranceChampionsTable', () => ({
  __esModule: true,
  default: () => <div data-testid="endurance-champions-table" />,
}));
jest.mock('../../../components/attachments/AttachedERC20Table', () => ({
  __esModule: true,
  default: () => <div data-testid="attached-erc20-table" />,
}));

const baseAllocationInfo = {
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
  mockUseGestureListByCycle.mockReturnValue({ data: [], isLoading: false });
  mockUseDonationsNFTByRound.mockReturnValue({ data: [], isLoading: false });
  mockUseCSTAnchorDistributionsByCycle.mockReturnValue({ data: [], isLoading: false });
  mockUseDonationsERC20ByRound.mockReturnValue({ data: [], isLoading: false });
  mockUseRoundList.mockReturnValue({ data: defaultRoundList, isLoading: false });
}

beforeEach(() => {
  jest.clearAllMocks();
  setupDefaultMocks();
});

function renderWithData(roundNum = 1, overrides: Record<string, unknown> = {}) {
  mockUseRoundInfo.mockReturnValue({
    data: { ...baseAllocationInfo, ...overrides },
    isLoading: false,
  });
  mockUseGestureListByCycle.mockReturnValue({
    data: [{ EvtLogId: 1, TimeStamp: 1700000000, BidderAddr: '0x1' }],
    isLoading: false,
  });
  return render(<AllocationInfoPage roundNum={roundNum} />);
}

describe('AllocationInfoPage', () => {
  describe('error and loading states', () => {
    it('shows invalid round message for negative roundNum', () => {
      render(<AllocationInfoPage roundNum={-1} />);
      expect(screen.getByText('Invalid Cycle Number')).toBeInTheDocument();
      expect(screen.getByText(/Back to Allocation Recipients/i)).toBeInTheDocument();
    });

    it('shows skeleton loading state', () => {
      mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: true });
      const { container } = render(<AllocationInfoPage roundNum={1} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows loading when any sub-query is still loading', () => {
      mockUseRoundInfo.mockReturnValue({ data: baseAllocationInfo, isLoading: false });
      mockUseDonationsNFTByRound.mockReturnValue({ data: [], isLoading: true });
      const { container } = render(<AllocationInfoPage roundNum={1} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows loading when anchoring query is still loading', () => {
      mockUseRoundInfo.mockReturnValue({ data: baseAllocationInfo, isLoading: false });
      mockUseCSTAnchorDistributionsByCycle.mockReturnValue({ data: [], isLoading: true });
      const { container } = render(<AllocationInfoPage roundNum={1} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows loading when ERC20 query is still loading', () => {
      mockUseRoundInfo.mockReturnValue({ data: baseAllocationInfo, isLoading: false });
      mockUseDonationsERC20ByRound.mockReturnValue({ data: [], isLoading: true });
      const { container } = render(<AllocationInfoPage roundNum={1} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('shows not found when allocationInfo is null after loading', () => {
      mockUseRoundInfo.mockReturnValue({ data: null, isLoading: false });
      render(<AllocationInfoPage roundNum={1} />);
      expect(screen.getByText('Allocation Data Not Found')).toBeInTheDocument();
      expect(screen.getByText(/Back to Allocation Recipients/i)).toBeInTheDocument();
    });

    it('not found message includes the round number', () => {
      mockUseRoundInfo.mockReturnValue({ data: null, isLoading: false });
      render(<AllocationInfoPage roundNum={99} />);
      expect(screen.getByText(/Cycle #99/i)).toBeInTheDocument();
    });
  });

  describe('hero banner', () => {
    it('renders round number as heading', () => {
      renderWithData(4);
      expect(screen.getByText('Cycle #4')).toBeInTheDocument();
    });

    it('renders breadcrumbs with Allocation Recipients link', () => {
      renderWithData(1);
      const breadcrumbLink = screen.getByText('Allocation Recipients');
      expect(breadcrumbLink).toBeInTheDocument();
      expect(breadcrumbLink.closest('a')).toHaveAttribute('href', '/allocation');
    });

    it('renders current round in breadcrumbs', () => {
      renderWithData(3);
      expect(screen.getByText('Cycle 3')).toBeInTheDocument();
    });

    it('displays large hero allocation amount', () => {
      renderWithData(1);
      const heroAmount = screen.getByTestId('hero-allocation-amount');
      expect(heroAmount).toHaveTextContent('1.5000 ETH');
    });

    it('displays recipient address in hero section', () => {
      renderWithData(1);
      const heroSection = screen.getByLabelText('Cycle Hero');
      expect(within(heroSection).getByText(/0xWinn/)).toBeInTheDocument();
    });

    it('renders NFT token link in hero', () => {
      renderWithData(1);
      const heroSection = screen.getByLabelText('Cycle Hero');
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
      const heroSection = screen.getByLabelText('Cycle Hero');
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
        expect(mockCopy).toHaveBeenCalledWith(expect.stringContaining('Cycle #1'));
      });
    });

    it('share summary includes allocation amount', async () => {
      const user = userEvent.setup();
      renderWithData(1);
      await user.click(screen.getByTestId('share-round-button'));
      await waitFor(() => {
        expect(mockCopy).toHaveBeenCalledWith(expect.stringContaining('1.5000 ETH'));
      });
    });

    it('share summary includes recipient address', async () => {
      const user = userEvent.setup();
      renderWithData(1);
      await user.click(screen.getByTestId('share-round-button'));
      await waitFor(() => {
        expect(mockCopy).toHaveBeenCalledWith(expect.stringContaining('Recipient:'));
      });
    });

    it('shows success toast after sharing', async () => {
      const { toast } = jest.requireMock('sonner');
      const user = userEvent.setup();
      renderWithData(1);
      await user.click(screen.getByTestId('share-round-button'));
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Cycle summary copied to clipboard');
      });
    });
  });

  describe('round navigation', () => {
    it('renders round navigation with prev and next links', () => {
      renderWithData(1);
      const nav = screen.getByTestId('round-navigation');
      expect(nav).toBeInTheDocument();
      expect(screen.getByLabelText('Previous cycle')).toBeInTheDocument();
      expect(screen.getByLabelText('Next cycle')).toBeInTheDocument();
    });

    it('hides previous button for round 0', () => {
      renderWithData(0);
      expect(screen.queryByLabelText('Previous cycle')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Next cycle')).toBeInTheDocument();
    });

    it('hides next button when at max round', () => {
      mockUseRoundList.mockReturnValue({
        data: [{ RoundNum: 0 }, { RoundNum: 1 }],
        isLoading: false,
      });
      renderWithData(1);
      expect(screen.getByLabelText('Previous cycle')).toBeInTheDocument();
      expect(screen.queryByLabelText('Next cycle')).not.toBeInTheDocument();
    });

    it('previous link points to correct round', () => {
      renderWithData(2);
      const prev = screen.getByLabelText('Previous cycle');
      expect(prev).toHaveAttribute('href', '/allocation/1');
    });

    it('next link points to correct round', () => {
      renderWithData(1);
      const next = screen.getByLabelText('Next cycle');
      expect(next).toHaveAttribute('href', '/allocation/2');
    });
  });

  describe('round recipients section', () => {
    it('renders section heading', () => {
      renderWithData(1);
      expect(screen.getByText('Cycle Recipients')).toBeInTheDocument();
    });

    it('renders all four recipient cards', () => {
      renderWithData(1);
      expect(screen.getByTestId('recipient-card-signature-allocation')).toBeInTheDocument();
      expect(screen.getByTestId('recipient-card-chrono-warrior')).toBeInTheDocument();
      expect(screen.getByTestId('recipient-card-endurance-champion')).toBeInTheDocument();
      expect(screen.getByTestId('recipient-card-final-cst-gesture')).toBeInTheDocument();
    });

    it('displays main allocation ETH amount', () => {
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

    it('displays last CST participant amount', () => {
      renderWithData(1);
      const card = screen.getByTestId('recipient-card-final-cst-gesture');
      expect(card).toHaveTextContent('0.0300 CST');
    });

    it('shows token links for NFT rewards', () => {
      renderWithData(1);
      expect(screen.getByText('Token #42')).toBeInTheDocument();
      expect(screen.getByText('Token #15')).toBeInTheDocument();
      expect(screen.getByText('Token #10')).toBeInTheDocument();
      expect(screen.getByText('Token #11')).toBeInTheDocument();
    });

    it('shows "None" when a recipient address is empty', () => {
      renderWithData(1, { EnduranceWinnerAddr: '' });
      const card = screen.getByTestId('recipient-card-endurance-champion');
      expect(within(card).getByText('None')).toBeInTheDocument();
    });

    it('does not show token link when tokenId is 0', () => {
      renderWithData(1, { ChronoWarriorNftTokenId: 0 });
      const card = screen.getByTestId('recipient-card-chrono-warrior');
      expect(within(card).queryByText(/Token #/)).not.toBeInTheDocument();
    });
  });

  describe('allocation distribution bar', () => {
    it('renders distribution bar', () => {
      renderWithData(1);
      expect(screen.getByTestId('allocation-distribution-bar')).toBeInTheDocument();
    });

    it('renders all four distribution segments', () => {
      renderWithData(1);
      expect(screen.getByTestId('distribution-segment-signature-allocation')).toBeInTheDocument();
      expect(screen.getByTestId('distribution-segment-public-goods')).toBeInTheDocument();
      expect(screen.getByTestId('distribution-segment-anchor-distribution')).toBeInTheDocument();
      expect(screen.getByTestId('distribution-segment-stellar-selection')).toBeInTheDocument();
    });

    it('displays distribution labels', () => {
      renderWithData(1);
      const bar = screen.getByTestId('allocation-distribution-bar');
      expect(within(bar).getByText('Signature Allocation')).toBeInTheDocument();
      expect(within(bar).getByText('Public Goods')).toBeInTheDocument();
      expect(within(bar).getByText('Anchor Distribution')).toBeInTheDocument();
      expect(within(bar).getByText('Stellar Selection')).toBeInTheDocument();
    });

    it('displays percentage values', () => {
      renderWithData(1);
      const bar = screen.getByTestId('allocation-distribution-bar');
      const pctElements = within(bar).getAllByText(/%$/);
      expect(pctElements.length).toBe(4);
    });

    it('renders section heading with tooltip', () => {
      renderWithData(1);
      expect(screen.getByText('Allocation Distribution')).toBeInTheDocument();
    });
  });

  describe('round statistics', () => {
    it('renders section heading', () => {
      renderWithData(1);
      expect(screen.getByText('Cycle Statistics')).toBeInTheDocument();
    });

    it('renders all 9 stat cards', () => {
      renderWithData(1);
      const statsSection = screen.getByLabelText('Cycle Statistics');
      expect(within(statsSection).getByText('Cycle Reserve')).toBeInTheDocument();
      expect(within(statsSection).getByText('Public Goods')).toBeInTheDocument();
      expect(within(statsSection).getByText('Anchor Distribution')).toBeInTheDocument();
      expect(within(statsSection).getByText('Stellar Selection Pool')).toBeInTheDocument();
      expect(within(statsSection).getByText('Total Gestures')).toBeInTheDocument();
      expect(within(statsSection).getByText('Attached NFTs')).toBeInTheDocument();
      expect(within(statsSection).getByText('Anchored Tokens')).toBeInTheDocument();
      expect(within(statsSection).getByText('Unique Anchor-holders')).toBeInTheDocument();
      expect(within(statsSection).getByText('Total Contributed')).toBeInTheDocument();
    });

    it('displays correct gesture count', () => {
      renderWithData(1);
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('displays correct attached NFT count', () => {
      renderWithData(1);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('displays anchored tokens count', () => {
      renderWithData(1);
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('displays unique anchorHolders count', () => {
      renderWithData(1);
      const statsSection = screen.getByLabelText('Cycle Statistics');
      expect(within(statsSection).getByText('0')).toBeInTheDocument();
    });

    it('displays total attached value', () => {
      renderWithData(1);
      expect(screen.getByText('2.0000 ETH')).toBeInTheDocument();
    });

    it('displays anchor deposit amount', () => {
      renderWithData(1);
      const statsSection = screen.getByLabelText('Cycle Statistics');
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
      expect(screen.getByRole('tab', { name: /Gesture History/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Endurance Champions/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Stellar Selection/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Anchor Distributions/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /Contributions/i })).toBeInTheDocument();
    });

    it('shows gesture history table by default', () => {
      renderWithData(1);
      expect(screen.getByTestId('gesture-history-table')).toBeInTheDocument();
    });

    it('switches to endurance champions tab', async () => {
      const user = userEvent.setup();
      renderWithData(1);
      await user.click(screen.getByRole('tab', { name: /Endurance Champions/i }));
      await waitFor(() => {
        expect(screen.getByTestId('endurance-champions-table')).toBeInTheDocument();
      });
    });

    it('switches to stellar selection distributions tab', async () => {
      const user = userEvent.setup();
      renderWithData(1);
      await user.click(screen.getByRole('tab', { name: /Stellar Selection/i }));
      await waitFor(() => {
        expect(screen.getByTestId('stellar-selection-recipient-table')).toBeInTheDocument();
      });
    });

    it('switches to anchor distributions tab and shows empty state', async () => {
      const user = userEvent.setup();
      renderWithData(1);
      await user.click(screen.getByRole('tab', { name: /Anchor Distributions/i }));
      await waitFor(() => {
        expect(
          screen.getByText('No Anchor Distributions distributed in this cycle.'),
        ).toBeInTheDocument();
      });
    });

    it('switches to contributions tab and shows both NFT and ERC20 tables', async () => {
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
      await user.click(screen.getByRole('tab', { name: /Contributions/i }));
      await waitFor(() => {
        expect(screen.getByTestId('attached-nft-table')).toBeInTheDocument();
        expect(screen.getByTestId('attached-erc20-table')).toBeInTheDocument();
      });
    });

    it('shows attached NFT and ERC20 headings in contributions tab', async () => {
      const user = userEvent.setup();
      renderWithData(1);
      await user.click(screen.getByRole('tab', { name: /Contributions/i }));
      await waitFor(() => {
        const headings = screen.getAllByText('Attached NFTs');
        expect(headings.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Attached ERC-20 Tokens')).toBeInTheDocument();
      });
    });
  });

  describe('empty states', () => {
    it('shows empty state for gesture history when no gestures', () => {
      mockUseRoundInfo.mockReturnValue({ data: baseAllocationInfo, isLoading: false });
      mockUseGestureListByCycle.mockReturnValue({ data: [], isLoading: false });
      render(<AllocationInfoPage roundNum={1} />);
      expect(screen.getByText('No gestures were made in this cycle.')).toBeInTheDocument();
    });

    it('shows empty state for stellar selection when no deposits or recipients', async () => {
      const user = userEvent.setup();
      mockUseRoundInfo.mockReturnValue({
        data: {
          ...baseAllocationInfo,
          RaffleETHDeposits: [],
          RaffleNFTWinners: [],
        },
        isLoading: false,
      });
      mockUseGestureListByCycle.mockReturnValue({ data: [], isLoading: false });
      render(<AllocationInfoPage roundNum={1} />);
      await user.click(screen.getByRole('tab', { name: /Stellar Selection/i }));
      await waitFor(() => {
        expect(
          screen.getByText('No Stellar Selection recipients for this cycle.'),
        ).toBeInTheDocument();
      });
    });

    it('shows empty state for endurance when no champion data', async () => {
      const user = userEvent.setup();
      mockUseRoundInfo.mockReturnValue({ data: baseAllocationInfo, isLoading: false });
      mockUseGestureListByCycle.mockReturnValue({ data: [], isLoading: false });
      render(<AllocationInfoPage roundNum={1} />);
      await user.click(screen.getByRole('tab', { name: /Endurance Champions/i }));
      await waitFor(() => {
        expect(
          screen.getByText('No Endurance Champion data available for this cycle.'),
        ).toBeInTheDocument();
      });
    });

    it('shows empty state for anchor distributions', async () => {
      const user = userEvent.setup();
      mockUseRoundInfo.mockReturnValue({ data: baseAllocationInfo, isLoading: false });
      mockUseGestureListByCycle.mockReturnValue({ data: [], isLoading: false });
      render(<AllocationInfoPage roundNum={1} />);
      await user.click(screen.getByRole('tab', { name: /Anchor Distributions/i }));
      await waitFor(() => {
        expect(
          screen.getByText('No Anchor Distributions distributed in this cycle.'),
        ).toBeInTheDocument();
      });
    });

    it('shows empty states for NFT and ERC20 contributions when none exist', async () => {
      const user = userEvent.setup();
      mockUseRoundInfo.mockReturnValue({ data: baseAllocationInfo, isLoading: false });
      mockUseGestureListByCycle.mockReturnValue({ data: [], isLoading: false });
      render(<AllocationInfoPage roundNum={1} />);
      await user.click(screen.getByRole('tab', { name: /Contributions/i }));
      await waitFor(() => {
        expect(
          screen.getByText('No NFTs were attached to gestures in this cycle.'),
        ).toBeInTheDocument();
        expect(
          screen.getByText('No ERC-20 tokens were attached to gestures in this cycle.'),
        ).toBeInTheDocument();
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

    it('renders copy buttons for all recipient addresses', () => {
      renderWithData(1);
      const copyButtons = screen.getAllByLabelText(/Copy address/i);
      expect(copyButtons.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('tab badges', () => {
    it('shows gesture count badge on gesture history tab', () => {
      renderWithData(1);
      const gesturesTab = screen.getByRole('tab', { name: /Gesture History/i });
      expect(gesturesTab).toHaveTextContent('1');
    });

    it('shows stellar-selection count badge', () => {
      renderWithData(1);
      const stellarSelectionTab = screen.getByRole('tab', { name: /Stellar Selection/i });
      expect(stellarSelectionTab).toHaveTextContent('2');
    });

    it('shows contributions count badge', () => {
      mockUseDonationsNFTByRound.mockReturnValue({
        data: [{ id: 1 }, { id: 2 }],
        isLoading: false,
      });
      mockUseDonationsERC20ByRound.mockReturnValue({
        data: [{ id: 1 }],
        isLoading: false,
      });
      renderWithData(1);
      const donationsTab = screen.getByRole('tab', { name: /Contributions/i });
      expect(donationsTab).toHaveTextContent('3');
    });
  });

  describe('data fetching', () => {
    it('passes roundNum to useRoundInfo', () => {
      render(<AllocationInfoPage roundNum={5} />);
      expect(mockUseRoundInfo).toHaveBeenCalledWith(5);
    });

    it('passes roundNum and sort direction to useGestureListByCycle', () => {
      render(<AllocationInfoPage roundNum={5} />);
      expect(mockUseGestureListByCycle).toHaveBeenCalledWith(5, 'desc');
    });

    it('passes roundNum to useDonationsNFTByRound', () => {
      render(<AllocationInfoPage roundNum={5} />);
      expect(mockUseDonationsNFTByRound).toHaveBeenCalledWith(5);
    });

    it('passes roundNum to useCSTAnchorDistributionsByCycle', () => {
      render(<AllocationInfoPage roundNum={5} />);
      expect(mockUseCSTAnchorDistributionsByCycle).toHaveBeenCalledWith(5);
    });

    it('passes roundNum to useDonationsERC20ByRound', () => {
      render(<AllocationInfoPage roundNum={5} />);
      expect(mockUseDonationsERC20ByRound).toHaveBeenCalledWith(5);
    });
  });

  describe('accessibility', () => {
    it('has no accessibility violations with data', async () => {
      const { container } = renderWithData(1);
      await checkA11y(container);
    });

    it('has no accessibility violations for invalid round', async () => {
      const { container } = render(<AllocationInfoPage roundNum={-1} />);
      await checkA11y(container);
    });

    it('has no accessibility violations for not found state', async () => {
      mockUseRoundInfo.mockReturnValue({ data: null, isLoading: false });
      const { container } = render(<AllocationInfoPage roundNum={1} />);
      await checkA11y(container);
    });

    it('sections have aria labels', () => {
      renderWithData(1);
      expect(screen.getByLabelText('Cycle Hero')).toBeInTheDocument();
      expect(screen.getByLabelText('Cycle Recipients')).toBeInTheDocument();
      expect(screen.getByLabelText('Allocation Distribution')).toBeInTheDocument();
      expect(screen.getByLabelText('Cycle Statistics')).toBeInTheDocument();
      expect(screen.getByLabelText('Cycle Data')).toBeInTheDocument();
    });

    it('share button has accessible label', () => {
      renderWithData(1);
      expect(screen.getByLabelText('Share cycle summary')).toBeInTheDocument();
    });

    it('navigation links have accessible labels', () => {
      renderWithData(1);
      expect(screen.getByLabelText('Previous cycle')).toBeInTheDocument();
      expect(screen.getByLabelText('Next cycle')).toBeInTheDocument();
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
