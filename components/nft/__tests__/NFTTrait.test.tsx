import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';

import { render, screen, fireEvent, checkA11y, waitFor, act } from '@/test-utils';

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

const mockWaitForTransactionReceipt = jest.fn();
jest.mock('wagmi', () => ({
  usePublicClient: () => ({ waitForTransactionReceipt: mockWaitForTransactionReceipt }),
}));

const mockEnsureCorrectChain = jest.fn<Promise<boolean>, []>();
jest.mock('../../../hooks/useRequireChain', () => ({
  useRequireChain: () => ({
    requiredChainId: 421614,
    connectedChainId: 421614,
    isWrongChain: false,
    isConnected: true,
    switchToRequiredChain: jest.fn(),
    ensureCorrectChain: mockEnsureCorrectChain,
  }),
}));

const mockRouterPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

const mockTransferFrom = jest.fn();
const mockSetNftName = jest.fn();
jest.mock('../../../hooks/useCosmicSignatureContract', () => ({
  __esModule: true,
  default: () => ({
    read: { totalSupply: jest.fn().mockResolvedValue(BigInt(100)) },
    write: { transferFrom: mockTransferFrom, setNftName: mockSetNftName },
  }),
}));

const mockSetNotification = jest.fn();
jest.mock('../../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: mockSetNotification }),
}));

const mockReportError = jest.fn();
jest.mock('../../../utils/errors', () => {
  const actual = jest.requireActual('../../../utils/errors');
  return {
    ...actual,
    reportError: (...args: unknown[]) => mockReportError(...args),
  };
});

jest.mock('../../../hooks/useClipboard', () => ({
  useClipboard: () => ({ copy: jest.fn() }),
}));

jest.mock('../../../hooks/useMetaMaskWatchAsset', () => ({
  useMetaMaskWatchAsset: () => ({
    isMetaMaskConnected: false,
    isAddingCst: false,
    isAddingNft: false,
    addCst: jest.fn(),
    addCosmicSignatureNft: jest.fn(),
  }),
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
  NFTOwnerActions: (props: {
    onAddressChange: (value: string) => void;
    onTransfer: () => void;
    onSetName: () => void;
    onClearName: () => void;
  }) => (
    <div data-testid="owner-actions">
      <button
        type="button"
        onClick={() => props.onAddressChange('0x1111111111111111111111111111111111111111')}
      >
        Set recipient
      </button>
      <button type="button" onClick={props.onTransfer}>
        Transfer test NFT
      </button>
      <button type="button" onClick={props.onSetName}>
        Set test name
      </button>
      <button type="button" onClick={props.onClearName}>
        Clear test name
      </button>
    </div>
  ),
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
  mockEnsureCorrectChain.mockResolvedValue(true);
  mockRouterPush.mockClear();
  mockTransferFrom.mockResolvedValue('0xtransfer');
  mockSetNftName.mockResolvedValue('0xname');
  mockWaitForTransactionReceipt.mockResolvedValue({ status: 'success' });
  Object.defineProperty(window, 'ethereum', {
    configurable: true,
    value: { request: jest.fn().mockResolvedValue('0x1') },
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

  it('links to the Cosmic Signature marketplace from the token actions', () => {
    withDashboard();
    withNft();
    withNameHistory();
    render(<NFTTrait tokenId={5} />);

    expect(screen.getByRole('link', { name: 'nav.ecosystem.axiomZero.ariaLabel' })).toHaveAttribute(
      'href',
      COSMIC_SIGNATURE_MARKETPLACE_URL,
    );
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
    expect(screen.getByText('detail.hero.unnamedToken')).toBeInTheDocument();
  });

  it('renders token badges', () => {
    withDashboard();
    withNft();
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByTestId('token-badges')).toBeInTheDocument();
  });

  it('renders anchoring eligible badge when not anchored', () => {
    withDashboard();
    withNft({ Staked: false, WasUnstaked: false });
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByText('detail.badges.eligibleForAnchoring')).toBeInTheDocument();
  });

  it('renders already anchored badge when anchored', () => {
    withDashboard();
    withNft({ Staked: true });
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByText('detail.badges.alreadyAnchored')).toBeInTheDocument();
  });

  it('renders allocation type badge for Round Recipient', () => {
    withDashboard();
    withNft({ RecordType: 3 });
    render(<NFTTrait tokenId={5} />);
    expect(screen.getByText('detail.badges.cycleRecipient')).toBeInTheDocument();
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

  it('shows a localized success notification after a confirmed NFT transfer', async () => {
    withDashboard();
    withNft();
    withNameHistory();
    render(<NFTTrait tokenId={5} />);
    fireEvent.click(screen.getByRole('button', { name: 'Set recipient' }));
    fireEvent.click(screen.getByRole('button', { name: 'Transfer test NFT' }));

    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.transfer.nft.detailTransferConfirmed',
        type: 'success',
        visible: true,
      }),
    );
    expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xtransfer' });
  });

  it('treats wallet rejection code 4001 as informational', async () => {
    mockTransferFrom.mockRejectedValueOnce({ code: 4001 });
    withDashboard();
    withNft();
    render(<NFTTrait tokenId={5} />);
    fireEvent.click(screen.getByRole('button', { name: 'Set recipient' }));
    fireEvent.click(screen.getByRole('button', { name: 'Transfer test NFT' }));

    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.walletTransactionCancelled',
        type: 'info',
        visible: true,
      }),
    );
    expect(mockReportError).not.toHaveBeenCalled();
  });

  it('reports transfer RPC failures with a localized fallback', async () => {
    const error = new Error('RPC failed');
    mockTransferFrom.mockRejectedValueOnce(error);
    withDashboard();
    withNft();
    render(<NFTTrait tokenId={5} />);
    fireEvent.click(screen.getByRole('button', { name: 'Set recipient' }));
    fireEvent.click(screen.getByRole('button', { name: 'Transfer test NFT' }));

    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.transfer.nft.failed',
        type: 'error',
        visible: true,
      }),
    );
    expect(mockReportError).toHaveBeenCalledWith(error, 'transfer Cosmic Signature NFT');
  });

  it('does not report a reverted transfer receipt as success', async () => {
    mockWaitForTransactionReceipt.mockResolvedValueOnce({ status: 'reverted' });
    withDashboard();
    withNft();
    render(<NFTTrait tokenId={5} />);
    fireEvent.click(screen.getByRole('button', { name: 'Set recipient' }));
    fireEvent.click(screen.getByRole('button', { name: 'Transfer test NFT' }));

    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.transfer.nft.failed',
        type: 'error',
        visible: true,
      }),
    );
    expect(mockSetNotification).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: 'success' }),
    );
  });

  it('localizes token naming success and failure notifications', async () => {
    withDashboard();
    withNft();
    render(<NFTTrait tokenId={5} />);

    fireEvent.click(screen.getByRole('button', { name: 'Set test name' }));
    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.transfer.nft.nameSet',
        type: 'success',
        visible: true,
      }),
    );

    const error = new Error('clear failed');
    mockSetNftName.mockRejectedValueOnce(error);
    fireEvent.click(screen.getByRole('button', { name: 'Clear test name' }));
    await waitFor(() =>
      expect(mockSetNotification).toHaveBeenCalledWith({
        text: 'toasts.transfer.nft.nameClearFailed',
        type: 'error',
        visible: true,
      }),
    );
    expect(mockReportError).toHaveBeenCalledWith(error, 'clear Cosmic Signature NFT name');
  });

  it('has no accessibility violations', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    const { container } = render(<NFTTrait tokenId={5} />);
    await checkA11y(container);
  });

  describe('transaction failure feedback', () => {
    it('tells the user when no injected wallet is available to check the recipient', async () => {
      Object.defineProperty(window, 'ethereum', { configurable: true, value: undefined });
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);

      fireEvent.click(screen.getByRole('button', { name: 'Set recipient' }));
      fireEvent.click(screen.getByRole('button', { name: 'Transfer test NFT' }));

      await waitFor(() =>
        expect(mockSetNotification).toHaveBeenCalledWith({
          text: 'toasts.wallet.notReady',
          type: 'error',
          visible: true,
        }),
      );
      expect(mockTransferFrom).not.toHaveBeenCalled();
    });

    it('reports and surfaces a failed recipient pre-check instead of doing nothing', async () => {
      const checkError = new Error('eth_getTransactionCount failed');
      Object.defineProperty(window, 'ethereum', {
        configurable: true,
        value: { request: jest.fn().mockRejectedValue(checkError) },
      });
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);

      fireEvent.click(screen.getByRole('button', { name: 'Set recipient' }));
      fireEvent.click(screen.getByRole('button', { name: 'Transfer test NFT' }));

      await waitFor(() =>
        expect(mockSetNotification).toHaveBeenCalledWith({
          text: 'toasts.transfer.nft.recipientCheckFailed',
          type: 'error',
          visible: true,
        }),
      );
      expect(mockReportError).toHaveBeenCalledWith(checkError, 'check transfer destination');
    });
  });

  describe('chain guard', () => {
    it('blocks the transfer write when the wallet is on the wrong chain', async () => {
      mockEnsureCorrectChain.mockResolvedValue(false);
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);

      fireEvent.click(screen.getByRole('button', { name: 'Set recipient' }));
      fireEvent.click(screen.getByRole('button', { name: 'Transfer test NFT' }));

      await waitFor(() => expect(mockEnsureCorrectChain).toHaveBeenCalled());
      expect(mockTransferFrom).not.toHaveBeenCalled();
    });

    it('blocks the naming writes on the same mismatch', async () => {
      mockEnsureCorrectChain.mockResolvedValue(false);
      withDashboard();
      withNft();
      render(<NFTTrait tokenId={5} />);

      fireEvent.click(screen.getByRole('button', { name: 'Set test name' }));
      await waitFor(() => expect(mockEnsureCorrectChain).toHaveBeenCalled());
      expect(mockSetNftName).not.toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: 'Clear test name' }));
      await waitFor(() => expect(mockEnsureCorrectChain).toHaveBeenCalledTimes(2));
      expect(mockSetNftName).not.toHaveBeenCalled();
    });
  });

  describe('deferred name refetch cleanup', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('does not refetch after the page unmounts before the delay elapses', async () => {
      const refetchCSTInfo = jest.fn();
      const refetchNameHistory = jest.fn();
      withDashboard();
      mockUseCSTInfo.mockReturnValue({
        data: baseNft,
        isLoading: false,
        refetch: refetchCSTInfo,
      });
      mockUseNameHistory.mockReturnValue({
        data: [{ TokenName: 'MyToken' }],
        isLoading: false,
        refetch: refetchNameHistory,
      });

      const { unmount } = render(<NFTTrait tokenId={5} />);

      fireEvent.click(screen.getByRole('button', { name: 'Set test name' }));
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });

      unmount();

      await act(async () => {
        jest.advanceTimersByTime(5000);
        await Promise.resolve();
      });

      expect(refetchCSTInfo).not.toHaveBeenCalled();
      expect(refetchNameHistory).not.toHaveBeenCalled();
    });

    it('still refetches after the delay while the page stays mounted', async () => {
      const refetchCSTInfo = jest.fn();
      const refetchNameHistory = jest.fn();
      withDashboard();
      mockUseCSTInfo.mockReturnValue({
        data: baseNft,
        isLoading: false,
        refetch: refetchCSTInfo,
      });
      mockUseNameHistory.mockReturnValue({
        data: [{ TokenName: 'MyToken' }],
        isLoading: false,
        refetch: refetchNameHistory,
      });

      render(<NFTTrait tokenId={5} />);

      fireEvent.click(screen.getByRole('button', { name: 'Set test name' }));
      await act(async () => {
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();
      });

      await act(async () => {
        jest.advanceTimersByTime(5000);
        await Promise.resolve();
      });

      expect(refetchCSTInfo).toHaveBeenCalled();
      expect(refetchNameHistory).toHaveBeenCalled();
    });
  });
});
