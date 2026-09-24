import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen, within } from '@/test-utils';

import AllocationInfoPage from '../[id]/AllocationInfoPage';

const mockUseRoundInfo = jest.fn();
const mockUseGestureListByCycle = jest.fn();
const mockUseDonationsNFTByRound = jest.fn();
const mockUseCSTAnchorDistributionsByCycle = jest.fn();
const mockUseDonationsERC20ByRound = jest.fn();
const mockUseRoundList = jest.fn();
const mockUseCSTList = jest.fn();

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useRoundInfo: (...args: unknown[]) => mockUseRoundInfo(...args),
  useGestureListByCycle: (...args: unknown[]) => mockUseGestureListByCycle(...args),
  useDonationsNFTByRound: (...args: unknown[]) => mockUseDonationsNFTByRound(...args),
  useCSTAnchorDistributionsByCycle: (...args: unknown[]) =>
    mockUseCSTAnchorDistributionsByCycle(...args),
  useDonationsERC20ByRound: (...args: unknown[]) => mockUseDonationsERC20ByRound(...args),
  useRoundList: (...args: unknown[]) => mockUseRoundList(...args),
  useCSTList: (...args: unknown[]) => mockUseCSTList(...args),
}));

const mockCopy = jest.fn();
jest.mock('../../../../../hooks/useClipboard', () => ({
  useClipboard: () => ({ copy: mockCopy }),
}));

jest.mock('sonner', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));

jest.mock('../../../../../components/tables/RecipientHistoryTable', () => {
  const STELLAR = new Set([10, 11, 12, 13, 14, 18]);
  return {
    __esModule: true,
    default: ({ winningHistory }: { winningHistory: { RecordType?: number }[] }) => {
      const stellarOnly =
        winningHistory.length > 0 &&
        winningHistory.every((entry) => STELLAR.has(entry.RecordType ?? -1));
      return (
        <div
          data-testid={
            stellarOnly ? 'stellar-selection-ledger-table' : 'cycle-allocation-ledger-table'
          }
        >
          records: {winningHistory.length}
        </div>
      );
    },
  };
});
jest.mock('../../../../../components/tables/GestureHistoryTable', () => ({
  __esModule: true,
  default: ({ gestureHistory }: { gestureHistory: unknown[] }) => (
    <div data-testid="gesture-history-table">gestures: {gestureHistory.length}</div>
  ),
}));
jest.mock('../../../../../components/tables/AnchoringRecipientTable', () => ({
  __esModule: true,
  default: () => <div data-testid="anchoring-recipient-table" />,
}));
jest.mock('../../../../../components/attachments/AttachedNFTTable', () => ({
  __esModule: true,
  default: () => <div data-testid="attached-nft-table" />,
}));
jest.mock('../../../../../components/tables/EnduranceChampionsTable', () => ({
  __esModule: true,
  default: () => <div data-testid="endurance-champions-table" />,
}));
jest.mock('../../../../../components/attachments/AttachedERC20Table', () => ({
  __esModule: true,
  default: () => <div data-testid="attached-erc20-table" />,
}));

const SIGNATURE_RECIPIENT = '0x1111111111111111111111111111111111111111';
const CHRONO = '0x2222222222222222222222222222222222222222';
const ENDURANCE = '0x3333333333333333333333333333333333333333';
const LAST_CST = '0x4444444444444444444444444444444444444444';

const baseAllocationInfo = {
  TimeStamp: 1700000000,
  TxHash: '0xabc',
  AmountEth: 1.5,
  TokenId: 42,
  WinnerAddr: SIGNATURE_RECIPIENT,
  CharityAddress: '0x5555555555555555555555555555555555555555',
  CharityAmountETH: 0.1,
  EnduranceWinnerAddr: ENDURANCE,
  EnduranceERC721TokenId: 10,
  EnduranceERC20AmountEth: 1000,
  LastCstBidderAddr: LAST_CST,
  LastCstBidderERC721TokenId: 11,
  LastCstBidderERC20AmountEth: 1000,
  ChronoWarriorAddr: CHRONO,
  ChronoWarriorAmountEth: 0.2,
  ChronoWarriorCstAmountEth: 1000,
  ChronoWarriorNftTokenId: 15,
  StakingDepositAmountEth: 0.5,
  StakingNumStakedTokens: 100,
  StakingPerTokenEth: 0.005,
  RaffleETHDeposits: [],
  RaffleNFTWinners: [],
  StakingNFTWinners: [],
  AllPrizes: [
    { RecordType: 0, WinnerAddr: SIGNATURE_RECIPIENT, AmountEth: 1.5 },
    { RecordType: 7, WinnerAddr: CHRONO, AmountEth: 0.2 },
    { RecordType: 10, WinnerAddr: CHRONO, AmountEth: 0.1 },
  ],
  CSTAmountEth: 1000,
  RoundNum: 1,
  DateTime: '',
  RoundStats: {
    TotalBids: 1141,
    TotalDonatedAmountEth: 20,
    TotalDonatedNFTs: 3,
    TotalRaffleEthDepositsEth: 0.2,
    TotalRaffleNFTs: 2,
  },
};

const defaultRoundList = [{ RoundNum: 0 }, { RoundNum: 1 }, { RoundNum: 2 }, { RoundNum: 3 }];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: false });
  mockUseGestureListByCycle.mockReturnValue({ data: [], isLoading: false });
  mockUseDonationsNFTByRound.mockReturnValue({ data: [], isLoading: false });
  mockUseCSTAnchorDistributionsByCycle.mockReturnValue({ data: [], isLoading: false });
  mockUseDonationsERC20ByRound.mockReturnValue({ data: [], isLoading: false });
  mockUseRoundList.mockReturnValue({ data: defaultRoundList, isLoading: false });
  mockUseCSTList.mockReturnValue({
    data: [
      { TokenId: 42, Seed: 'aa', TokenName: '' },
      { TokenId: 15, Seed: 'bb', TokenName: '' },
    ],
    isLoading: false,
  });
});

function withCycle(overrides: Record<string, unknown> = {}) {
  mockUseRoundInfo.mockReturnValue({
    data: { ...baseAllocationInfo, ...overrides },
    isLoading: false,
  });
}

function renderCycle(roundNum = 1, overrides: Record<string, unknown> = {}) {
  withCycle(overrides);
  mockUseGestureListByCycle.mockReturnValue({
    data: [{ EvtLogId: 1, TimeStamp: 1700000000, BidderAddr: SIGNATURE_RECIPIENT }],
    isLoading: false,
  });
  return render(<AllocationInfoPage roundNum={roundNum} />);
}

const figure = (container: HTMLElement, id: string) =>
  container.querySelector(`[data-figure="${id}"]`);

describe('AllocationInfoPage', () => {
  describe('states', () => {
    it('explains a cycle number that is not one, with the way back to the recipients', () => {
      render(<AllocationInfoPage roundNum={-1} />);
      expect(
        screen.getByRole('heading', { level: 1, name: 'allocation.details.invalid.title' }),
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole('link', { name: 'allocation.details.breadcrumbs.recipients' })[0],
      ).toHaveAttribute('href', '/allocation');
    });

    it('says when a cycle has no record yet', () => {
      mockUseRoundInfo.mockReturnValue({ data: null, isLoading: false });
      render(<AllocationInfoPage roundNum={99} />);
      expect(
        screen.getByRole('heading', { level: 1, name: 'allocation.details.notFound.title' }),
      ).toBeInTheDocument();
      expect(screen.getByText('allocation.details.notFound.help(cycle=99)')).toBeInTheDocument();
    });

    it('tells a failed read from a missing cycle and retries it', async () => {
      const refetch = jest.fn();
      mockUseRoundInfo.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch,
      });
      render(<AllocationInfoPage roundNum={1} />);
      expect(screen.getByText('allocation.details.error.title')).toBeInTheDocument();
      expect(screen.queryByText('allocation.details.notFound.title')).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: /try again/i }));
      expect(refetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('progressive rendering', () => {
    it('shows the header at once while the cycle loads, holding the recipients with pending plates', () => {
      mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: true });
      render(<AllocationInfoPage roundNum={1} />);
      expect(
        screen.getByRole('heading', { level: 1, name: 'allocation.formats.cycleHash(cycle=1)' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('status', { name: 'allocation.details.loading' }),
      ).toBeInTheDocument();
    });

    it('draws the recipients and the split while the gesture list is still loading', () => {
      withCycle();
      mockUseGestureListByCycle.mockReturnValue({ data: [], isLoading: true });
      mockUseDonationsNFTByRound.mockReturnValue({ data: [], isLoading: true });
      mockUseCSTAnchorDistributionsByCycle.mockReturnValue({ data: [], isLoading: true });
      render(<AllocationInfoPage roundNum={1} />);

      expect(screen.getByTestId('recipient-card-signature')).toBeInTheDocument();
      expect(screen.getByTestId('allocation-split')).toBeInTheDocument();
      // Only the gesture tab waits for the gestures.
      expect(screen.queryByTestId('gesture-history-table')).not.toBeInTheDocument();
      expect(screen.getByRole('tabpanel')).toHaveTextContent('');
    });
  });

  describe('header', () => {
    it('names the cycle, links the trail and states when it was finalized', () => {
      renderCycle();
      expect(
        screen.getByRole('heading', { level: 1, name: 'allocation.formats.cycleHash(cycle=1)' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'allocation.details.breadcrumbs.recipients' }),
      ).toHaveAttribute('href', '/allocation');
      expect(screen.getByText('allocation.details.hero.finalized')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /allocation\.details\.hero\.viewTransaction/ }),
      ).toHaveAttribute('href', expect.stringContaining('0xabc'));
    });

    it('carries the Signature Allocation, the gestures and the recipients as figures', () => {
      const { container } = renderCycle();
      expect(figure(container, 'signatureEth')).toHaveTextContent('1.5');
      expect(figure(container, 'gestures')).toHaveTextContent('1,141');
      // Two wallets across the ledger's three records.
      expect(figure(container, 'recipients')).toHaveTextContent('2');
    });

    it('labels previous and next cycle links on every screen', () => {
      renderCycle(2);
      const nav = screen.getByTestId('round-navigation');
      expect(within(nav).getByRole('link', { name: /Cycle 1|cycle=1/ })).toHaveAttribute(
        'href',
        '/allocation/1',
      );
      expect(within(nav).getByRole('link', { name: /cycle=3/ })).toHaveAttribute(
        'href',
        '/allocation/3',
      );
    });

    it('offers no previous cycle from the first one and no next from the last', () => {
      renderCycle(0);
      expect(within(screen.getByTestId('round-navigation')).getAllByRole('link')).toHaveLength(1);
      renderCycle(3);
      expect(
        within(screen.getAllByTestId('round-navigation')[1]!).queryByRole('link', {
          name: /cycle=4/,
        }),
      ).toBeNull();
    });

    it('copies a formatted cycle summary', async () => {
      renderCycle();
      await userEvent.click(screen.getByTestId('share-round-button'));
      expect(mockCopy).toHaveBeenCalledWith(
        expect.stringContaining('allocation.details.share.summary(cycle=1,amount=1.5'),
      );
      expect(mockCopy.mock.calls[0]![0]).toContain('gestures=1,141');
    });
  });

  describe('recipients', () => {
    it('shows each role by the Signature it received, its token and its recipient', () => {
      renderCycle();
      const signature = screen.getByTestId('recipient-card-signature');
      expect(within(signature).getByRole('link', { name: '#000042' })).toHaveAttribute(
        'href',
        '/detail/42',
      );
      expect(within(signature).getByRole('heading', { level: 3 })).toHaveTextContent(
        'allocation.details.recipientSection.cards.signature.title',
      );
      expect(within(signature).getByRole('link', { name: /0x1111/ })).toHaveAttribute(
        'href',
        `/user/${SIGNATURE_RECIPIENT}`,
      );
      for (const role of ['chrono', 'endurance', 'finalCst']) {
        expect(screen.getByTestId(`recipient-card-${role}`)).toBeInTheDocument();
      }
    });

    it('leaves out a role nobody filled', () => {
      renderCycle(1, { LastCstBidderAddr: '', LastCstBidderERC721TokenId: -1 });
      expect(screen.queryByTestId('recipient-card-finalCst')).not.toBeInTheDocument();
    });
  });

  describe('split and statistics', () => {
    it('splits the distributed ETH across the five tracks, each with its amount and share', () => {
      renderCycle();
      const split = screen.getByTestId('allocation-split');
      for (const track of ['signature', 'chrono', 'stellar', 'anchor', 'publicGoods']) {
        expect(split.querySelector(`dt`)).not.toBeNull();
        expect(split.querySelector(`div[data-track="${track}"]`)).not.toBeNull();
      }
      // 1.5 of 2.5 distributed ETH is the Signature Allocation.
      expect(split.querySelector('div[data-track="signature"]')).toHaveTextContent('60%');
    });

    it('shows no ETH figure the split already carries (no public goods, anchor or stellar card)', () => {
      const { container } = renderCycle();
      const statistics = screen.getByRole('region', {
        name: 'allocation.details.statistics.title',
      });
      expect(within(statistics).queryByText(/publicGoods|stellar/i)).toBeNull();
      expect(figure(container, 'distributed')).toBeNull();
      expect(
        screen.getByText(/allocation\.details\.distribution\.total\(amount=2\.5/),
      ).toBeInTheDocument();
      expect(figure(container, 'attachedNfts')).toHaveTextContent('3');
      expect(figure(container, 'anchoredTokens')).toHaveTextContent('100');
      expect(
        within(figure(container, 'totalContributed') as HTMLElement).getByRole('link'),
      ).toHaveAttribute('href', '/eth-contribution/round/1');
    });

    it('lists every allocation record, grouped by recipient', () => {
      renderCycle();
      expect(screen.getByTestId('cycle-allocation-ledger-table')).toHaveTextContent('records: 3');
    });
  });

  describe('detailed data', () => {
    it('opens on the gesture history, with each tab counting its rows', () => {
      renderCycle();
      expect(screen.getByTestId('gesture-history-table')).toHaveTextContent('gestures: 1');
      expect(
        screen.getByRole('tab', { name: /allocation\.details\.data\.tabs\.stellar/ }),
      ).toHaveTextContent('1');
    });

    it('shows the Stellar Selection records of the ledger in their tab', async () => {
      renderCycle();
      await userEvent.click(
        screen.getByRole('tab', { name: /allocation\.details\.data\.tabs\.stellar/ }),
      );
      expect(screen.getByTestId('stellar-selection-ledger-table')).toHaveTextContent('records: 1');
    });

    it('shows designed empty states for tabs with nothing in them', async () => {
      renderCycle();
      await userEvent.click(
        screen.getByRole('tab', { name: /allocation\.details\.data\.tabs\.anchoring/ }),
      );
      expect(screen.getByText('allocation.details.data.empty.anchoring')).toBeInTheDocument();
      await userEvent.click(
        screen.getByRole('tab', { name: /allocation\.details\.data\.tabs\.contributions/ }),
      );
      expect(screen.getByText('allocation.details.data.empty.nfts')).toBeInTheDocument();
      expect(screen.getByText('allocation.details.data.empty.erc20')).toBeInTheDocument();
    });
  });

  describe('data fetching', () => {
    it('asks every query for the cycle it shows', () => {
      renderCycle(7);
      expect(mockUseRoundInfo).toHaveBeenCalledWith(7);
      expect(mockUseGestureListByCycle).toHaveBeenCalledWith(7, 'desc');
      expect(mockUseDonationsNFTByRound).toHaveBeenCalledWith(7);
      expect(mockUseCSTAnchorDistributionsByCycle).toHaveBeenCalledWith(7);
      expect(mockUseDonationsERC20ByRound).toHaveBeenCalledWith(7);
    });
  });

  describe('accessibility', () => {
    it('has no violations with data', async () => {
      const { container } = renderCycle();
      await checkA11y(container);
    });

    it('has no violations while the cycle loads', async () => {
      mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: true });
      const { container } = render(<AllocationInfoPage roundNum={1} />);
      await checkA11y(container);
    });
  });
});
