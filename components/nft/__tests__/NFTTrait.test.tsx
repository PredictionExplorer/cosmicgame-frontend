import '@testing-library/jest-dom';

import { render, screen, fireEvent, checkA11y } from '@/test-utils';

import NFTTrait from '../NFTTrait';

/* ── framer-motion mock ───────────────────────────────────────── */
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy(
      {},
      {
        get: (_t: unknown, prop: string) => {
          const Comp = React.forwardRef(function MotionProxy(
            props: Record<string, unknown>,
            ref: React.Ref<HTMLElement>,
          ) {
            const {
              initial: _i,
              animate: _a,
              exit: _e,
              transition: _tr,
              whileInView: _w,
              viewport: _v,
              variants: _va,
              layout: _l,
              ...rest
            } = props;
            return React.createElement(prop, { ...rest, ref });
          });
          Comp.displayName = `motion.${prop}`;
          return Comp;
        },
      },
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

/* ── API hooks ────────────────────────────────────────────────── */
const mockUseDashboardInfo = jest.fn().mockReturnValue({ data: undefined, isLoading: false });
const mockUseCSTInfo = jest
  .fn()
  .mockReturnValue({ data: undefined, isLoading: false, refetch: jest.fn() });
const mockUseNameHistory = jest
  .fn()
  .mockReturnValue({ data: [], isLoading: false, refetch: jest.fn() });
const mockUseCTOwnershipTransfers = jest.fn().mockReturnValue({
  data: [],
  isLoading: false,
  refetch: jest.fn(),
});

jest.mock('../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useCSTInfo: (...args: unknown[]) => mockUseCSTInfo(...args),
  useNameHistory: (...args: unknown[]) => mockUseNameHistory(...args),
  useCTOwnershipTransfers: (...args: unknown[]) => mockUseCTOwnershipTransfers(...args),
}));

const mockAccount = { current: '0xOwner' };
jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount.current }),
}));

jest.mock('wagmi', () => ({
  usePublicClient: () => ({ waitForTransactionReceipt: jest.fn() }),
}));

const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

jest.mock('../../../hooks/useCosmicSignatureContract', () => ({
  __esModule: true,
  default: () => ({
    read: { totalSupply: jest.fn().mockResolvedValue(BigInt(100)) },
    write: { transferFrom: jest.fn(), setNftName: jest.fn() },
  }),
}));

jest.mock('../../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: jest.fn() }),
}));

jest.mock('../../../hooks/useClipboard', () => ({
  useClipboard: () => ({ copy: jest.fn() }),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

/* ── Child component mocks ────────────────────────────────────── */
jest.mock('../NFTImage', () => ({
  __esModule: true,
  default: () => <div data-testid="nft-image" />,
}));
jest.mock('../NFTVideo', () => ({
  __esModule: true,
  default: () => <div data-testid="nft-video" />,
}));
jest.mock('../NFTMetadata', () => ({
  NFTMetadata: () => <div data-testid="nft-metadata" />,
}));
jest.mock('../NFTOwnerActions', () => ({
  NFTOwnerActions: () => <div data-testid="owner-actions" />,
}));
jest.mock('../../../components/tables/NameHistoryTable', () => ({
  __esModule: true,
  default: () => <div data-testid="name-history-table" />,
}));
jest.mock('../../../components/tables/TransferHistoryTable', () => ({
  TransferHistoryTable: () => <div data-testid="transfer-history-table" />,
}));
jest.mock('../../../components/common/VideoPlayerDialog', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('yet-another-react-lightbox', () => ({
  __esModule: true,
  default: () => null,
}));

/* ── Helpers ──────────────────────────────────────────────────── */
beforeEach(() => {
  jest.clearAllMocks();
  mockAccount.current = '0xOwner';

  mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: false });
  mockUseCSTInfo.mockReturnValue({ data: undefined, isLoading: false, refetch: jest.fn() });
  mockUseNameHistory.mockReturnValue({ data: [], isLoading: false, refetch: jest.fn() });
  mockUseCTOwnershipTransfers.mockReturnValue({
    data: [],
    isLoading: false,
    refetch: jest.fn(),
  });
});

const baseNft = {
  TokenId: 5,
  Seed: 'abc123',
  TimeStamp: 1700000000,
  TxHash: '0xTx',
  WinnerAddr: '0xWinner',
  CurOwnerAddr: '0xOwner',
  RoundNum: 3,
  RecordType: 3,
  TokenName: 'MyToken',
  Staked: false,
  WasUnstaked: false,
};

const withDashboard = (mintOverrides: Record<string, unknown> = {}) =>
  mockUseDashboardInfo.mockReturnValue({
    data: { MainStats: { NumCSTokenMints: 10, TotalNamedTokens: 3, ...mintOverrides } },
    isLoading: false,
  });

const withNft = (overrides: Record<string, unknown> = {}) =>
  mockUseCSTInfo.mockReturnValue({
    data: { ...baseNft, ...overrides },
    isLoading: false,
    refetch: jest.fn(),
  });

const withNameHistory = (names: Array<{ TokenName: string }> = [{ TokenName: 'MyToken' }]) =>
  mockUseNameHistory.mockReturnValue({
    data: names,
    isLoading: false,
    refetch: jest.fn(),
  });

const withTransferHistory = (
  transfers: Array<Record<string, unknown>> = [{ from: '0xA', to: '0xB' }],
) =>
  mockUseCTOwnershipTransfers.mockReturnValue({
    data: transfers,
    isLoading: false,
    refetch: jest.fn(),
  });

/* ================================================================
 * Tests
 * ================================================================ */

describe('NFTTrait', () => {
  // ─── Loading states ─────────────────────────────────────────────
  describe('loading states', () => {
    it('shows skeleton when dashboard is loading', () => {
      mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('nft-detail-skeleton')).toBeInTheDocument();
    });

    it('shows skeleton when NFT data is loading', () => {
      mockUseCSTInfo.mockReturnValue({ data: undefined, isLoading: true, refetch: jest.fn() });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('nft-detail-skeleton')).toBeInTheDocument();
    });

    it('shows skeleton when name history is loading', () => {
      mockUseNameHistory.mockReturnValue({ data: [], isLoading: true, refetch: jest.fn() });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('nft-detail-skeleton')).toBeInTheDocument();
    });

    it('shows skeleton when transfer history is loading', () => {
      mockUseCTOwnershipTransfers.mockReturnValue({
        data: [],
        isLoading: true,
        refetch: jest.fn(),
      });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('nft-detail-skeleton')).toBeInTheDocument();
    });

    it('does not show skeleton when all data is loaded', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);
      expect(screen.queryByTestId('nft-detail-skeleton')).not.toBeInTheDocument();
    });
  });

  // ─── Hero section ───────────────────────────────────────────────
  describe('hero section', () => {
    it('renders hero section after data loads', () => {
      withDashboard();
      withNft();
      withNameHistory();
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });

    it('renders breadcrumb with token name', () => {
      withDashboard();
      withNft();
      withNameHistory([{ TokenName: 'CosmicBeast' }]);
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('nft-breadcrumb')).toBeInTheDocument();
    });

    it('renders NFT image container', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('nft-image-container')).toBeInTheDocument();
    });

    it('renders NFT image', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('nft-image')).toBeInTheDocument();
    });

    it('renders NFT video component', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('nft-video')).toBeInTheDocument();
    });
  });

  // ─── Token identity / naming ────────────────────────────────────
  describe('token identity', () => {
    it('renders token identity section', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('token-identity')).toBeInTheDocument();
    });

    it('displays token name when name history exists', () => {
      withDashboard();
      withNft();
      withNameHistory([{ TokenName: 'CosmicBeast' }]);
      render(<NFTTrait tokenId={5} />);
      expect(screen.getAllByText('CosmicBeast').length).toBeGreaterThanOrEqual(1);
    });

    it('displays "Unnamed Token" when name history is empty', () => {
      withDashboard();
      withNft();
      mockUseNameHistory.mockReturnValue({ data: [], isLoading: false, refetch: jest.fn() });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByText('Unnamed Token')).toBeInTheDocument();
    });

    it('uses first entry from name history as the current name', () => {
      withDashboard();
      withNft();
      withNameHistory([{ TokenName: 'LatestName' }, { TokenName: 'OldName' }]);
      render(<NFTTrait tokenId={5} />);
      expect(screen.getAllByText('LatestName').length).toBeGreaterThanOrEqual(1);
    });

    it('shows "Unnamed Token" when nameHistory has entries with empty TokenName', () => {
      withDashboard();
      withNft();
      withNameHistory([{ TokenName: '' }]);
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByText('Unnamed Token')).toBeInTheDocument();
    });
  });

  // ─── Prize type badges (getPrizeTypeConfig) ─────────────────────
  describe('prize type badges', () => {
    it('renders badge container', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('token-badges')).toBeInTheDocument();
    });

    it('renders Raffle Winner badge for RecordType 1', () => {
      withDashboard();
      withNft({ RecordType: 1 });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByText('Raffle Winner')).toBeInTheDocument();
    });

    it('renders Staking Winner badge for RecordType 2', () => {
      withDashboard();
      withNft({ RecordType: 2 });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByText('Staking Winner')).toBeInTheDocument();
    });

    it('renders Round Winner badge for RecordType 3', () => {
      withDashboard();
      withNft({ RecordType: 3 });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByText('Round Winner')).toBeInTheDocument();
    });

    it('renders Endurance Champion badge for RecordType 4', () => {
      withDashboard();
      withNft({ RecordType: 4 });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByText('Endurance Champion')).toBeInTheDocument();
    });

    it('does not render any prize badge when RecordType is undefined', () => {
      withDashboard();
      withNft({ RecordType: undefined });
      render(<NFTTrait tokenId={5} />);
      expect(screen.queryByText('Raffle Winner')).not.toBeInTheDocument();
      expect(screen.queryByText('Staking Winner')).not.toBeInTheDocument();
      expect(screen.queryByText('Round Winner')).not.toBeInTheDocument();
      expect(screen.queryByText('Endurance Champion')).not.toBeInTheDocument();
    });

    it('does not render prize badge for unknown RecordType value', () => {
      withDashboard();
      withNft({ RecordType: 99 });
      render(<NFTTrait tokenId={5} />);
      expect(screen.queryByText('Raffle Winner')).not.toBeInTheDocument();
      expect(screen.queryByText('Round Winner')).not.toBeInTheDocument();
    });

    it('does not render prize badge for RecordType 0', () => {
      withDashboard();
      withNft({ RecordType: 0 });
      render(<NFTTrait tokenId={5} />);
      expect(screen.queryByText('Raffle Winner')).not.toBeInTheDocument();
      expect(screen.queryByText('Round Winner')).not.toBeInTheDocument();
    });
  });

  // ─── Staking eligibility ───────────────────────────────────────
  describe('staking eligibility', () => {
    it('shows "Eligible for Staking" when not staked and never unstaked', () => {
      withDashboard();
      withNft({ Staked: false, WasUnstaked: false });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByText('Eligible for Staking')).toBeInTheDocument();
      expect(screen.queryByText('Already Staked')).not.toBeInTheDocument();
    });

    it('shows "Already Staked" when Staked is true', () => {
      withDashboard();
      withNft({ Staked: true, WasUnstaked: false });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByText('Already Staked')).toBeInTheDocument();
      expect(screen.queryByText('Eligible for Staking')).not.toBeInTheDocument();
    });

    it('shows "Already Staked" when WasUnstaked is true', () => {
      withDashboard();
      withNft({ Staked: false, WasUnstaked: true });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByText('Already Staked')).toBeInTheDocument();
    });

    it('shows "Already Staked" when both Staked and WasUnstaked are true', () => {
      withDashboard();
      withNft({ Staked: true, WasUnstaked: true });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByText('Already Staked')).toBeInTheDocument();
    });
  });

  // ─── Round link ─────────────────────────────────────────────────
  describe('round link', () => {
    it('renders round details button when RoundNum is present', () => {
      withDashboard();
      withNft({ RoundNum: 7 });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByText(/View Round #7 Details/)).toBeInTheDocument();
    });

    it('navigates to prize page when round button is clicked', () => {
      withDashboard();
      withNft({ RoundNum: 7 });
      render(<NFTTrait tokenId={5} />);
      fireEvent.click(screen.getByText(/View Round #7 Details/));
      expect(mockRouterPush).toHaveBeenCalledWith('/prize/7');
    });

    it('does not render round button when RoundNum is null', () => {
      withDashboard();
      withNft({ RoundNum: null });
      render(<NFTTrait tokenId={5} />);
      expect(screen.queryByText(/View Round #/)).not.toBeInTheDocument();
    });

    it('does not render round button when RoundNum is undefined', () => {
      withDashboard();
      withNft({ RoundNum: undefined });
      render(<NFTTrait tokenId={5} />);
      expect(screen.queryByText(/View Round #/)).not.toBeInTheDocument();
    });

    it('renders round button for RoundNum 0', () => {
      withDashboard();
      withNft({ RoundNum: 0 });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByText(/View Round #0 Details/)).toBeInTheDocument();
    });
  });

  // ─── Metadata section ──────────────────────────────────────────
  describe('metadata section', () => {
    it('renders metadata section with test id', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('metadata-section')).toBeInTheDocument();
    });

    it('renders NFTMetadata child component', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('nft-metadata')).toBeInTheDocument();
    });
  });

  // ─── Owner actions ─────────────────────────────────────────────
  describe('owner actions', () => {
    it('shows owner actions when connected account matches CurOwnerAddr', () => {
      withDashboard();
      withNft({ CurOwnerAddr: '0xOwner' });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('owner-actions')).toBeInTheDocument();
    });

    it('hides owner actions when connected account differs from CurOwnerAddr', () => {
      withDashboard();
      withNft({ CurOwnerAddr: '0xSomeoneElse' });
      render(<NFTTrait tokenId={5} />);
      expect(screen.queryByTestId('owner-actions')).not.toBeInTheDocument();
    });

    it('hides owner actions when account is null', () => {
      mockAccount.current = null as unknown as string;
      withDashboard();
      withNft({ CurOwnerAddr: '0xOwner' });
      render(<NFTTrait tokenId={5} />);
      expect(screen.queryByTestId('owner-actions')).not.toBeInTheDocument();
    });

    it('hides owner actions when NFT data is null', () => {
      withDashboard();
      mockUseCSTInfo.mockReturnValue({ data: null, isLoading: false, refetch: jest.fn() });
      render(<NFTTrait tokenId={5} />);
      expect(screen.queryByTestId('owner-actions')).not.toBeInTheDocument();
    });
  });

  // ─── Name history table ────────────────────────────────────────
  describe('name history table', () => {
    it('renders table and section title when history exists', () => {
      withDashboard();
      withNft();
      withNameHistory([{ TokenName: 'Alpha' }]);
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('name-history-table')).toBeInTheDocument();
      expect(screen.getByText('Name History')).toBeInTheDocument();
    });

    it('renders with multiple history entries', () => {
      withDashboard();
      withNft();
      withNameHistory([{ TokenName: 'Second' }, { TokenName: 'First' }]);
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('name-history-table')).toBeInTheDocument();
    });

    it('does not render when name history is empty', () => {
      withDashboard();
      withNft();
      mockUseNameHistory.mockReturnValue({ data: [], isLoading: false, refetch: jest.fn() });
      render(<NFTTrait tokenId={5} />);
      expect(screen.queryByTestId('name-history-table')).not.toBeInTheDocument();
      expect(screen.queryByText('Name History')).not.toBeInTheDocument();
    });
  });

  // ─── Transfer history table ────────────────────────────────────
  describe('transfer history table', () => {
    it('renders when transfers exist without TransferType', () => {
      withDashboard();
      withNft();
      withTransferHistory([{ from: '0xA', to: '0xB' }]);
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('transfer-history-table')).toBeInTheDocument();
      expect(screen.getByText('Ownership History')).toBeInTheDocument();
    });

    it('renders with multiple transfer entries', () => {
      withDashboard();
      withNft();
      withTransferHistory([
        { from: '0xA', to: '0xB' },
        { from: '0xB', to: '0xC' },
      ]);
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('transfer-history-table')).toBeInTheDocument();
    });

    it('does not render when transfer history is empty', () => {
      withDashboard();
      withNft();
      mockUseCTOwnershipTransfers.mockReturnValue({
        data: [],
        isLoading: false,
        refetch: jest.fn(),
      });
      render(<NFTTrait tokenId={5} />);
      expect(screen.queryByTestId('transfer-history-table')).not.toBeInTheDocument();
    });

    it('does not render when first transfer entry has TransferType', () => {
      withDashboard();
      withNft();
      withTransferHistory([{ from: '0xA', to: '0xB', TransferType: 1 }]);
      render(<NFTTrait tokenId={5} />);
      expect(screen.queryByTestId('transfer-history-table')).not.toBeInTheDocument();
    });

    it('does not render when first transfer has TransferType even with subsequent entries', () => {
      withDashboard();
      withNft();
      withTransferHistory([
        { from: '0xA', to: '0xB', TransferType: 2 },
        { from: '0xB', to: '0xC' },
      ]);
      render(<NFTTrait tokenId={5} />);
      expect(screen.queryByTestId('transfer-history-table')).not.toBeInTheDocument();
    });
  });

  // ─── Navigation buttons ────────────────────────────────────────
  describe('navigation buttons', () => {
    it('enables previous button when tokenId > 0', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByLabelText('Previous token')).not.toBeDisabled();
    });

    it('disables previous button when tokenId is 0', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={0} />);
      expect(screen.getByLabelText('Previous token')).toBeDisabled();
    });

    it('enables next button when tokenId < totalMints - 1', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByLabelText('Next token')).not.toBeDisabled();
    });

    it('disables next button when tokenId equals last mint index', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={9} />);
      expect(screen.getByLabelText('Next token')).toBeDisabled();
    });

    it('disables next button when no mints exist', () => {
      mockUseDashboardInfo.mockReturnValue({
        data: { MainStats: { NumCSTokenMints: 0 } },
        isLoading: false,
      });
      withNft();
      render(<NFTTrait tokenId={0} />);
      expect(screen.getByLabelText('Next token')).toBeDisabled();
    });

    it('navigates to previous token on prev button click', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);
      fireEvent.click(screen.getByLabelText('Previous token'));
      expect(mockRouterPush).toHaveBeenCalledWith('/detail/4');
    });

    it('does not navigate when clicking disabled previous button', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={0} />);
      fireEvent.click(screen.getByLabelText('Previous token'));
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  // ─── Keyboard navigation ───────────────────────────────────────
  describe('keyboard navigation', () => {
    it('navigates left with ArrowLeft key', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(mockRouterPush).toHaveBeenCalledWith('/detail/4');
    });

    it('does not navigate left when tokenId is 0', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={0} />);
      fireEvent.keyDown(window, { key: 'ArrowLeft' });
      expect(mockRouterPush).not.toHaveBeenCalled();
    });

    it('does not trigger keyboard nav when typing in an input', () => {
      withDashboard();
      withNft({ CurOwnerAddr: '0xOwner' });
      const { container } = render(<NFTTrait tokenId={5} />);
      const input = container.querySelector('input');
      if (input) {
        fireEvent.keyDown(input, { key: 'ArrowLeft' });
        expect(mockRouterPush).not.toHaveBeenCalled();
      }
    });

    it('ignores unrelated keys', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);
      fireEvent.keyDown(window, { key: 'Enter' });
      fireEvent.keyDown(window, { key: 'Escape' });
      fireEvent.keyDown(window, { key: 'Space' });
      expect(mockRouterPush).not.toHaveBeenCalled();
    });
  });

  // ─── Share dropdown ────────────────────────────────────────────
  describe('share dropdown', () => {
    it('renders Share button', () => {
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByText('Share')).toBeInTheDocument();
    });
  });

  // ─── Edge cases ────────────────────────────────────────────────
  describe('edge cases', () => {
    it('handles null NFT data gracefully', () => {
      withDashboard();
      mockUseCSTInfo.mockReturnValue({ data: null, isLoading: false, refetch: jest.fn() });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByText('Unnamed Token')).toBeInTheDocument();
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });

    it('renders with tokenId 0', () => {
      withDashboard();
      withNft({ TokenId: 0 });
      render(<NFTTrait tokenId={0} />);
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });

    it('handles missing dashboard data (null)', () => {
      mockUseDashboardInfo.mockReturnValue({ data: null, isLoading: false });
      withNft();
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });

    it('handles NFT without Seed', () => {
      withDashboard();
      withNft({ Seed: undefined });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('nft-image')).toBeInTheDocument();
    });

    it('handles NFT with empty Seed', () => {
      withDashboard();
      withNft({ Seed: '' });
      render(<NFTTrait tokenId={5} />);
      expect(screen.getByTestId('nft-image')).toBeInTheDocument();
    });

    it('handles large tokenId values', () => {
      withDashboard({ NumCSTokenMints: 1000000 });
      withNft({ TokenId: 999999 });
      render(<NFTTrait tokenId={999999} />);
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });
  });

  // ─── Accessibility ─────────────────────────────────────────────
  describe('accessibility', () => {
    it('has no a11y violations in loading state', async () => {
      mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
      const { container } = render(<NFTTrait tokenId={5} />);
      await checkA11y(container);
    });

    it('has no a11y violations with full data', async () => {
      withDashboard();
      withNft();
      withNameHistory();
      withTransferHistory();
      const { container } = render(<NFTTrait tokenId={5} />);
      await checkA11y(container, {
        rules: { 'heading-order': { enabled: false } },
      });
    });
  });
});
