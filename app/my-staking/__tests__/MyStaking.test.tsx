import { act, checkA11y, render, screen, waitFor } from '@/test-utils';

import MyStaking from '../MyStaking';

const mockUseDashboardInfo = jest.fn().mockReturnValue({ data: undefined, isLoading: false });
const mockUseStakingCSTActionsByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseCSTTokensByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseStakingRewardsByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseStakingRWLKActionsByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });
const mockUseStakingRWLKMintsByUser = jest.fn().mockReturnValue({ data: [], isLoading: false });

jest.mock('../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useStakingCSTActionsByUser: (...args: unknown[]) => mockUseStakingCSTActionsByUser(...args),
  useCSTTokensByUser: (...args: unknown[]) => mockUseCSTTokensByUser(...args),
  useStakingRewardsByUser: (...args: unknown[]) => mockUseStakingRewardsByUser(...args),
  useStakingRWLKActionsByUser: (...args: unknown[]) => mockUseStakingRWLKActionsByUser(...args),
  useStakingRWLKMintsByUser: (...args: unknown[]) => mockUseStakingRWLKMintsByUser(...args),
}));

let mockAccount: string | null = '0xUser';
jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount }),
}));

jest.mock('wagmi', () => ({
  usePublicClient: () => ({ waitForTransactionReceipt: jest.fn() }),
}));

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

jest.mock('../../../hooks/useStakingWalletCSTContract', () => ({
  __esModule: true,
  default: () => ({ write: { stake: jest.fn(), stakeMany: jest.fn() } }),
}));
jest.mock('../../../hooks/useStakingWalletRWLKContract', () => ({
  __esModule: true,
  default: () => ({ write: { stake: jest.fn(), stakeMany: jest.fn() } }),
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

jest.mock('../../../contexts/StakedTokenContext', () => ({
  useStakedToken: () => ({ cstokens: [], rwlktokens: [], fetchData: jest.fn() }),
}));
jest.mock('../../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: jest.fn() }),
}));
jest.mock('../../../config/networks', () => ({
  STAKING_WALLET_CST_ADDRESS: '0xCST',
  STAKING_WALLET_RWLK_ADDRESS: '0xRWLK',
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

jest.mock('../../../components/staking/CSTStakingPanel', () => ({
  CSTStakingPanel: () => (
    <div data-testid="cst-staking-panel">
      <div data-testid="staking-rewards-table" />
      <div data-testid="staking-actions-table" />
    </div>
  ),
}));
jest.mock('../../../components/staking/RWLKStakingPanel', () => ({
  RWLKStakingPanel: () => <div data-testid="rwlk-staking-panel" />,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount = '0xUser';
});

describe('MyStaking', () => {
  it('prompts login when no account is connected', async () => {
    mockAccount = null;
    await act(async () => {
      render(<MyStaking />);
    });
    expect(
      screen.getByText('Please connect your wallet to manage your staking.'),
    ).toBeInTheDocument();
  });

  it('shows loading state', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<MyStaking />);
    await waitFor(() => {});
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders staking panels with data', async () => {
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
    render(<MyStaking />);
    await waitFor(() => {});

    expect(screen.getByText('My Staking')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByTestId('staking-rewards-table')).toBeInTheDocument();
    expect(screen.getByTestId('staking-actions-table')).toBeInTheDocument();
  });

  it('computes reward per CST when tokens are staked', async () => {
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
    render(<MyStaking />);
    await waitFor(() => {});
    expect(screen.getByText('0.500000')).toBeInTheDocument();
  });

  it('renders page title', async () => {
    mockUseDashboardInfo.mockReturnValue({ data: null, isLoading: false });
    mockAccount = null;
    await act(async () => {
      render(<MyStaking />);
    });
    expect(screen.getByText('My Staking')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    let container: HTMLElement;
    act(() => {
      const result = render(<MyStaking />);
      container = result.container;
    });
    await checkA11y(container!);
  });
});
