import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';

import { ApiReadError } from '@/services/api/readError';

import { checkA11y, render, screen, within } from '@/test-utils';

import AllocationInfoPage from '../[id]/AllocationInfoPage';

const mockUseRoundInfo = jest.fn();
const mockUseGestureListByCycle = jest.fn();
const mockUseDonationsNFTByRound = jest.fn();
const mockUseCSTAnchorDistributionsByCycle = jest.fn();
const mockUseDonationsERC20ByRound = jest.fn();
const mockUseRoundList = jest.fn();
const mockUseCSTList = jest.fn();
const mockUseDashboardInfo = jest.fn();

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useRoundInfo: (...args: unknown[]) => mockUseRoundInfo(...args),
  useGestureListByCycle: (...args: unknown[]) => mockUseGestureListByCycle(...args),
  useDonationsNFTByRound: (...args: unknown[]) => mockUseDonationsNFTByRound(...args),
  useCSTAnchorDistributionsByCycle: (...args: unknown[]) =>
    mockUseCSTAnchorDistributionsByCycle(...args),
  useDonationsERC20ByRound: (...args: unknown[]) => mockUseDonationsERC20ByRound(...args),
  useRoundList: (...args: unknown[]) => mockUseRoundList(...args),
  useCSTList: (...args: unknown[]) => mockUseCSTList(...args),
  // The live cycle (useLiveCycle, useCycleHref); unread here, so the cycle list stands in.
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
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
  mockCopy.mockResolvedValue(true);
  mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: false });
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
    /** What the API answers for a cycle it holds no record of: HTTP 400 "record not found". */
    function answerNoRecord() {
      const refetch = jest.fn();
      mockUseRoundInfo.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new ApiReadError('Network response was not OK', 400),
        refetch,
      });
      return refetch;
    }

    it('shows the live cycle as still open, with the way to follow it, not as an error', () => {
      answerNoRecord();
      // Cycles 0–3 are finalized, so Cycle 4 is the one open now.
      render(<AllocationInfoPage roundNum={4} />);
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'allocation.missingCycle.open.title(cycle=4)',
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'allocation.missingCycle.currentCycle' }),
      ).toHaveAttribute('href', '/current-cycle');
      expect(
        screen.getByRole('link', {
          name: 'allocation.details.navigation.previousAria(cycle=allocation.formats.cycle(cycle=3))',
        }),
      ).toHaveAttribute('href', '/allocation/3');
      expect(screen.queryByText('allocation.details.error.title')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
    });

    it('says a cycle beyond the live one has not started, naming the live one', () => {
      answerNoRecord();
      render(<AllocationInfoPage roundNum={99} />);
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'allocation.missingCycle.notStarted.title(cycle=99)',
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByText('allocation.missingCycle.notStarted.body(cycle=99,live=4)'),
      ).toBeInTheDocument();
      expect(screen.getByTestId('current-cycle-link')).toHaveAttribute('href', '/current-cycle');
    });

    it('takes the live cycle from the chain’s count before the indexer’s list', () => {
      answerNoRecord();
      // The indexer lists cycles 0–3, but the chain has already finalized Cycle 4.
      mockUseDashboardInfo.mockReturnValue({ data: { CurRoundNum: 5 }, isLoading: false });
      render(<AllocationInfoPage roundNum={4} />);
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'allocation.missingCycle.unknown.title(cycle=4)',
        }),
      ).toBeInTheDocument();
    });

    it('says only that there is no record yet while the cycle list is unknown', () => {
      answerNoRecord();
      mockUseRoundList.mockReturnValue({ data: undefined, isLoading: true });
      render(<AllocationInfoPage roundNum={7} />);
      expect(
        screen.getByRole('heading', {
          level: 1,
          name: 'allocation.missingCycle.unknown.title(cycle=7)',
        }),
      ).toBeInTheDocument();
      expect(screen.getByTestId('current-cycle-link')).toBeInTheDocument();
    });

    it('tells a failed read from a missing cycle and retries it', async () => {
      const refetch = jest.fn();
      mockUseRoundInfo.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new ApiReadError('Network response was not OK', 502),
        refetch,
      });
      render(<AllocationInfoPage roundNum={1} />);
      expect(screen.getByText('allocation.details.error.title')).toBeInTheDocument();
      expect(screen.queryByTestId('current-cycle-link')).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: /try again/i }));
      expect(refetch).toHaveBeenCalledTimes(1);
    });

    it('treats a network failure (no status) as a failed read', () => {
      mockUseRoundInfo.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new ApiReadError('Network response was not OK'),
        refetch: jest.fn(),
      });
      render(<AllocationInfoPage roundNum={1} />);
      expect(screen.getByText('allocation.details.error.title')).toBeInTheDocument();
    });
  });

  describe('progressive rendering', () => {
    it('shows the header at once while the cycle loads, holding the recipients with pending plates', () => {
      mockUseRoundInfo.mockReturnValue({ data: undefined, isLoading: true });
      render(<AllocationInfoPage roundNum={1} />);
      expect(
        screen.getByRole('heading', { level: 1, name: 'allocation.formats.cycle(cycle=1)' }),
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
        screen.getByRole('heading', { level: 1, name: 'allocation.formats.cycle(cycle=1)' }),
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

    describe('sharing', () => {
      const original = navigator.share;
      afterEach(() => {
        Object.defineProperty(navigator, 'share', { value: original, configurable: true });
      });

      it('opens the share sheet with the cycle, a short summary and the link', async () => {
        const share = jest.fn().mockResolvedValue(undefined);
        Object.defineProperty(navigator, 'share', { value: share, configurable: true });
        renderCycle();
        await userEvent.click(screen.getByTestId('share-round-button'));
        expect(share).toHaveBeenCalledWith({
          title: 'allocation.formats.cycle(cycle=1)',
          text: expect.stringContaining('allocation.details.share.summary(cycle=1,amount=1.5'),
          url: window.location.href,
        });
        expect(share.mock.calls[0]![0].text).toContain('gestures=1,141');
        expect(mockCopy).not.toHaveBeenCalled();
      });

      it('copies the link where there is no share sheet, and says so on its button', async () => {
        Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
        renderCycle();
        const button = screen.getByTestId('share-round-button');
        expect(button).toHaveTextContent('allocation.details.share.copyLink');
        await userEvent.click(button);
        expect(mockCopy).toHaveBeenCalledWith(window.location.href);
        expect(toast.success).toHaveBeenCalledWith('allocation.details.share.linkCopied');
      });

      it('never confirms a copy that did not happen', async () => {
        Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
        mockCopy.mockResolvedValue(false);
        renderCycle();
        await userEvent.click(screen.getByTestId('share-round-button'));
        expect(toast.success).not.toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith('allocation.details.share.failed');
      });
    });
  });

  describe('recipient art', () => {
    it('draws every plate from the server’s seeds, without reading the collection', () => {
      withCycle();
      render(
        <AllocationInfoPage
          roundNum={1}
          roleSeeds={{
            '42': { seed: 'aa' },
            '15': { seed: 'bb' },
            '10': { seed: 'cc' },
            '11': { seed: 'dd' },
          }}
        />,
      );
      expect(mockUseCSTList).toHaveBeenCalled();
      for (const [options] of mockUseCSTList.mock.calls) {
        expect(options).toEqual({ enabled: false });
      }
      expect(screen.queryAllByTestId('pending-plate')).toHaveLength(0);
    });

    it('reads the collection only for a plate the server had no seed for', () => {
      withCycle();
      render(
        <AllocationInfoPage
          roundNum={1}
          roleSeeds={{ '42': { seed: 'aa' }, '15': { seed: 'bb' } }}
        />,
      );
      expect(mockUseCSTList).toHaveBeenLastCalledWith({ enabled: true });
    });

    it('holds busy plates, never "Artwork unavailable", while the collection index loads', () => {
      mockUseCSTList.mockReturnValue({ data: undefined, isLoading: true, isError: false });
      renderCycle();
      const card = screen.getByTestId('recipient-card-signature');
      expect(within(card).getByTestId('pending-plate')).toHaveAttribute('aria-busy', 'true');
      expect(screen.queryByText('detail.image.artworkUnavailable')).not.toBeInTheDocument();
    });

    it('says once that the artwork could not be loaded, with a retry, when the index fails', async () => {
      const refetch = jest.fn();
      mockUseCSTList.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });
      renderCycle();
      expect(screen.getAllByText('allocation.art.failed')).toHaveLength(1);
      expect(screen.queryByText('detail.image.artworkUnavailable')).not.toBeInTheDocument();
      await userEvent.click(screen.getByRole('button', { name: /try again/i }));
      expect(refetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('recipients', () => {
    it('shows each role by the Signature it received, its token and its recipient', () => {
      renderCycle();
      const signature = screen.getByTestId('recipient-card-signature');
      // The title is the way to the Signature, like every other card of a Signature; the
      // token number beside it is plain text, so the card has one link to its token.
      const heading = within(signature).getByRole('heading', { level: 3 });
      expect(within(heading).getByRole('link')).toHaveAttribute('href', '/detail/42');
      expect(heading).toHaveTextContent(
        'allocation.details.recipientSection.cards.signature.title',
      );
      expect(within(signature).getByText('#000042')).toBeInTheDocument();
      expect(within(signature).queryByRole('link', { name: '#000042' })).toBeNull();
      expect(within(signature).getByRole('link', { name: /0x1111/ })).toHaveAttribute(
        'href',
        `/user/${SIGNATURE_RECIPIENT}`,
      );
      for (const role of ['chrono', 'endurance', 'finalCst']) {
        expect(screen.getByTestId(`recipient-card-${role}`)).toBeInTheDocument();
      }
    });

    it('says what each role received by one rule: its ETH and its CST', () => {
      renderCycle();
      const signature = screen.getByTestId('recipient-card-signature');
      expect(signature).toHaveTextContent(/1,000.CST/);
      // The Signature Allocation's card names its ETH too, so the cards read as a set.
      expect(signature).toHaveTextContent(/1\.5000.ETH/);
      const chrono = screen.getByTestId('recipient-card-chrono');
      expect(chrono).toHaveTextContent(/0\.2000.ETH/);
      expect(chrono).toHaveTextContent(/1,000.CST/);
      expect(screen.getByTestId('recipient-card-endurance')).toHaveTextContent(/1,000.CST/);
      expect(screen.getByTestId('recipient-card-finalCst')).toHaveTextContent(/1,000.CST/);
    });

    it('leaves out a role nobody filled', () => {
      renderCycle(1, { LastCstBidderAddr: '', LastCstBidderERC721TokenId: -1 });
      expect(screen.queryByTestId('recipient-card-finalCst')).not.toBeInTheDocument();
    });
  });

  describe('split and statistics', () => {
    it('splits the Cycle Reserve on the base /allocation uses, the remainder included', () => {
      renderCycle();
      const split = screen.getByTestId('allocation-split');
      for (const track of [
        'signature',
        'chrono',
        'stellar',
        'anchor',
        'publicGoods',
        'nextCycle',
      ]) {
        expect(split.querySelector(`div[data-track="${track}"]`)).not.toBeNull();
      }
      // 1.5 ETH is the Signature Allocation's 25%: a 6 ETH reserve, not 60% of 2.5 distributed.
      expect(split.querySelector('div[data-track="signature"]')).toHaveTextContent('25%');
      // The 3.5 ETH the tracks did not take carried into the next cycle, marked approximate.
      const next = split.querySelector('div[data-track="nextCycle"]');
      expect(next).toHaveTextContent(/~3\.5000.ETH/);
      expect(next).toHaveTextContent(/~58\.3/);
    });

    it('keeps the cycle’s other facts with the split, one heading fewer', () => {
      const { container } = renderCycle();
      const distribution = screen.getByRole('region', {
        name: 'allocation.details.distribution.title',
      });
      expect(figure(distribution, 'attachedNfts')).toHaveTextContent('3');
      expect(figure(distribution, 'anchoredTokens')).toHaveTextContent('100');
      expect(figure(container, 'distributed')).toBeNull();
      expect(
        screen.getByText(/allocation\.details\.distribution\.total\(amount=2\.5/),
      ).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: /details\.statistics\.title/ })).toBeNull();
    });

    it('prints the direct contributions as ETH with its unit, linked as a record', () => {
      const { container } = renderCycle();
      const contributed = figure(container, 'totalContributed') as HTMLElement;
      expect(contributed).toHaveTextContent(/20\.0000.ETH/);
      const link = within(contributed).getByRole('link');
      expect(link).toHaveAttribute('href', '/eth-contribution/round/1');
      expect(link).toHaveClass('link-entity');
    });

    it('reads the anchor-holders as unknown, never 0, when their list could not be read', () => {
      mockUseCSTAnchorDistributionsByCycle.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: jest.fn(),
      });
      const { container } = renderCycle();
      expect(figure(container, 'uniqueAnchorHolders')).toHaveTextContent(
        'common.status.unavailable',
      );
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
        screen.getByRole('tab', { name: /allocation\.details\.data\.tabs\.endurance/ }),
      ).toBeInTheDocument();
    });

    it('lists the Stellar Selection records once, in the grouped ledger, not again in a tab', () => {
      renderCycle();
      expect(screen.queryByRole('tab', { name: /tabs\.stellar/ })).toBeNull();
      expect(screen.getByTestId('cycle-allocation-ledger-table')).toHaveTextContent('records: 3');
    });

    it('shows a tab whose list failed as an error with a retry, never as "no gestures"', async () => {
      const refetch = jest.fn();
      withCycle();
      mockUseGestureListByCycle.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch,
      });
      render(<AllocationInfoPage roundNum={1} />);
      expect(screen.queryByText('allocation.details.data.empty.gestures')).toBeNull();
      expect(screen.getByText('allocation.details.data.error.title')).toBeInTheDocument();
      // No count on a tab whose list is unknown.
      expect(
        screen.getByRole('tab', { name: 'allocation.details.data.tabs.gestures' }).textContent,
      ).toBe('allocation.details.data.tabs.gestures');
      await userEvent.click(screen.getByRole('button', { name: /try again/i }));
      expect(refetch).toHaveBeenCalledTimes(1);
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
