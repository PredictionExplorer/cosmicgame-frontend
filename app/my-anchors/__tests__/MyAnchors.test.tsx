import { act, checkA11y, render, screen, waitFor } from '@/test-utils';

import MyAnchors from '../MyAnchors';

const mockUseDashboardInfo = jest.fn().mockReturnValue({ data: undefined, isLoading: false });
const mockUseCSTAnchorActionsByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseCSTTokensByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseAnchorDistributionsByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseRWLKAnchorActionsByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseRWLKAnchorImprintsByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });

jest.mock('../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useCSTAnchorActionsByUser: (...args: unknown[]) => mockUseCSTAnchorActionsByUser(...args),
  useCSTTokensByUser: (...args: unknown[]) => mockUseCSTTokensByUser(...args),
  useAnchorDistributionsByUser: (...args: unknown[]) => mockUseAnchorDistributionsByUser(...args),
  useRWLKAnchorActionsByUser: (...args: unknown[]) => mockUseRWLKAnchorActionsByUser(...args),
  useRWLKAnchorImprintsByUser: (...args: unknown[]) => mockUseRWLKAnchorImprintsByUser(...args),
}));

let mockAccount: string | null = '0xUser';
jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount }),
}));

jest.mock('wagmi', () => ({
  usePublicClient: () => ({ waitForTransactionReceipt: jest.fn() }),
  useWalletClient: () => ({ data: undefined }),
  useConnectorClient: () => ({ data: undefined }),
  useConfig: () => ({}),
}));

jest.mock('@wagmi/core', () => ({
  getConnectorClient: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock('../../../hooks/useAnchoringWalletCSTContract', () => ({
  __esModule: true,
  default: () => ({ write: { anchor: jest.fn(), stakeMany: jest.fn() } }),
}));
jest.mock('../../../hooks/useAnchoringWalletRWLKContract', () => ({
  __esModule: true,
  default: () => ({ write: { anchor: jest.fn(), stakeMany: jest.fn() } }),
}));
jest.mock('../../../hooks/useCosmicSignatureContract', () => ({
  __esModule: true,
  default: () => ({
    read: { isApprovedForAll: jest.fn() },
    write: { setApprovalForAll: jest.fn() },
  }),
}));
jest.mock('../../../hooks/useRWLKNFTContract', () => ({
  __esModule: true,
  default: () => ({
    read: { isApprovedForAll: jest.fn(), walletOfOwner: jest.fn().mockResolvedValue([]) },
    write: { setApprovalForAll: jest.fn() },
  }),
}));

jest.mock('../../../contexts/AnchoredTokenContext', () => ({
  useAnchoredToken: () => ({ cstokens: [], rwlktokens: [], fetchData: jest.fn() }),
}));
jest.mock('../../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: jest.fn() }),
}));
jest.mock('../../../config/networks', () => ({
  ...jest.requireActual('../../../config/networks'),
  networkConfig: {
    chainId: 421614,
    rpcUrl: 'http://test-rpc.example',
  },
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

jest.mock('../../../components/anchoring/AnchoringHeroStats', () => ({
  AnchoringHeroStats: ({ stats }: { stats: { label: string; value: string }[] }) => (
    <div data-testid="anchoring-hero-stats">
      {stats.map((s) => (
        <span key={s.label} data-testid={`stat-${s.label}`}>
          {s.label}: {s.value}
        </span>
      ))}
    </div>
  ),
}));

jest.mock('../../../components/anchoring/CSTAnchoringPanel', () => ({
  CSTAnchoringPanel: () => (
    <div data-testid="cst-anchoring-panel">
      <div data-testid="anchor-distributions-table" />
      <div data-testid="anchor-actions-table" />
    </div>
  ),
}));
jest.mock('../../../components/anchoring/RWLKAnchoringPanel', () => ({
  RWLKAnchoringPanel: () => <div data-testid="rwlk-anchoring-panel" />,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount = '0xUser';
});

describe('MyAnchors', () => {
  it('prompts login when no account is connected', async () => {
    mockAccount = null;
    await act(async () => {
      render(<MyAnchors />);
    });
    expect(
      screen.getByText('Please connect your wallet to manage your anchors.'),
    ).toBeInTheDocument();
  });

  it('shows skeleton loading state', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<MyAnchors />);
    await waitFor(() => {});
    expect(screen.getByTestId('my-anchors-skeleton')).toBeInTheDocument();
  });

  it('renders anchoring panels with data', async () => {
    mockUseDashboardInfo.mockReturnValue({
      data: {
        MainStats: {
          StakeStatisticsCST: { TotalTokensStaked: 10 },
          StakeStatisticsRWalk: { TotalTokensStaked: 5 },
        },
        StakingAmountEth: 2.0,
      },
      isLoading: false,
    });
    render(<MyAnchors />);
    await waitFor(() => {});

    expect(screen.getByText('My Anchors')).toBeInTheDocument();
    expect(screen.getByTestId('anchoring-hero-stats')).toBeInTheDocument();
    expect(screen.getByTestId('anchor-distributions-table')).toBeInTheDocument();
    expect(screen.getByTestId('anchor-actions-table')).toBeInTheDocument();
  });

  it('renders stat cards in the hero stats section', async () => {
    mockUseDashboardInfo.mockReturnValue({
      data: {
        MainStats: {
          StakeStatisticsCST: { TotalTokensStaked: 4 },
          StakeStatisticsRWalk: { TotalTokensStaked: 0 },
        },
        StakingAmountEth: 2.0,
      },
      isLoading: false,
    });
    render(<MyAnchors />);
    await waitFor(() => {});
    expect(screen.getByTestId('stat-Your Anchored CST')).toBeInTheDocument();
    expect(screen.getByTestId('stat-Your Anchored RWLK')).toBeInTheDocument();
    expect(screen.getByTestId('stat-Unretrieved Distributions')).toBeInTheDocument();
    expect(screen.getByTestId('stat-Distribution per CST')).toBeInTheDocument();
  });

  it('renders page title', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: null, isLoading: false });
    mockAccount = null;
    await act(async () => {
      render(<MyAnchors />);
    });
    expect(screen.getByText('My Anchors')).toBeInTheDocument();
  });

  it('does not render hero stats when wallet is not connected', async () => {
    mockAccount = null;
    await act(async () => {
      render(<MyAnchors />);
    });
    expect(screen.queryByTestId('anchoring-hero-stats')).not.toBeInTheDocument();
  });

  it('does not render hero stats during loading', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<MyAnchors />);
    await waitFor(() => {});
    expect(screen.queryByTestId('anchoring-hero-stats')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    let container: HTMLElement;
    act(() => {
      const result = render(<MyAnchors />);
      container = result.container;
    });
    await checkA11y(container!);
  });
});
