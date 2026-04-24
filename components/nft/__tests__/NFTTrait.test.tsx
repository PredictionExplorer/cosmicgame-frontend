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

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: '0xOwner' }),
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

beforeEach(() => {
  jest.clearAllMocks();
  mockRouterPush.mockClear();
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

const withDashboard = () =>
  mockUseDashboardInfo.mockReturnValue({
    data: { MainStats: { NumCSTokenMints: 10, TotalNamedTokens: 3 } },
    isLoading: false,
  });

const withNft = (overrides = {}) =>
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

describe('NFTTrait', () => {
  it('shows skeleton loading state', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByTestId('nft-detail-skeleton')).toBeInTheDocument();
  });

  it('renders hero section after data loads', () => {
    withDashboard();
    withNft();
    withNameHistory();
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  it('renders breadcrumb', () => {
    withDashboard();
    withNft();
    withNameHistory();
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByTestId('nft-breadcrumb')).toBeInTheDocument();
  });

  it('renders token identity with name', () => {
    withDashboard();
    withNft();
    withNameHistory([{ TokenName: 'MyToken' }]);
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByTestId('token-identity')).toBeInTheDocument();
    expect(screen.getAllByText('MyToken').length).toBeGreaterThanOrEqual(1);
  });

  it('renders "Unnamed Token" when no name history', () => {
    withDashboard();
    withNft();
    mockUseNameHistory.mockReturnValue({ data: [], isLoading: false, refetch: jest.fn() });
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByText('Unnamed Token')).toBeInTheDocument();
  });

  it('renders token badges', () => {
    withDashboard();
    withNft();
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByTestId('token-badges')).toBeInTheDocument();
  });

  it('renders staking eligible badge when not staked', () => {
    withDashboard();
    withNft({ Staked: false, WasUnstaked: false });
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByText('Eligible for Anchoring')).toBeInTheDocument();
  });

  it('renders already staked badge when staked', () => {
    withDashboard();
    withNft({ Staked: true });
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByText('Already Anchored')).toBeInTheDocument();
  });

  it('renders prize type badge for Round Winner', () => {
    withDashboard();
    withNft({ RecordType: 3 });
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByText('Cycle Recipient')).toBeInTheDocument();
  });

  it('renders NFT image', () => {
    withDashboard();
    withNft();
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByTestId('nft-image')).toBeInTheDocument();
  });

  it('renders metadata section', () => {
    withDashboard();
    withNft();
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByTestId('nft-metadata')).toBeInTheDocument();
  });

  it('renders name history table when history exists', () => {
    withDashboard();
    withNft();
    withNameHistory([{ TokenName: 'MyToken' }]);
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByTestId('name-history-table')).toBeInTheDocument();
  });

  it('does not render name history table when no history', () => {
    withDashboard();
    withNft();
    mockUseNameHistory.mockReturnValue({ data: [], isLoading: false, refetch: jest.fn() });
    render(<NFTTrait tokenId={5} />);
    expect(screen.queryByTestId('name-history-table')).not.toBeInTheDocument();
  });

  it('renders owner actions when account matches owner', () => {
    withDashboard();
    withNft({ CurOwnerAddr: '0xOwner' });
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByTestId('owner-actions')).toBeInTheDocument();
  });

  it('hides owner actions when account does not match', () => {
    withDashboard();
    withNft({ CurOwnerAddr: '0xSomeoneElse' });
    render(<NFTTrait tokenId={5} />);
    expect(screen.queryByTestId('owner-actions')).not.toBeInTheDocument();
  });

  it('supports keyboard navigation with ArrowLeft', () => {
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

  it('does not trigger keyboard nav when typing in input', () => {
    withDashboard();
    withNft({ CurOwnerAddr: '0xOwner' });
    const { container } = render(<NFTTrait tokenId={5} />);
    const input = container.querySelector('input');
    if (input) {
      fireEvent.keyDown(input, { key: 'ArrowLeft' });
      expect(mockRouterPush).not.toHaveBeenCalled();
    }
  });

  it('has no accessibility violations', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<NFTTrait tokenId={5} />);
    await checkA11y(container);
  });
});
