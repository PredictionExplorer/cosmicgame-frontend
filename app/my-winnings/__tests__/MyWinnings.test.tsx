import { checkA11y, render, screen } from '@/test-utils';

import MyWinnings from '../MyWinnings';

const mockRefetchNFTs = jest.fn();
const mockRefetchRaffle = jest.fn();
const mockRefetchERC20 = jest.fn();

const mockUseUnclaimedDonatedNFTByUser = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  isError: false,
  refetch: mockRefetchNFTs,
});
const mockUseUnclaimedRaffleDepositsByUser = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  isError: false,
  refetch: mockRefetchRaffle,
});
const mockUseDonationsERC20ByUser = jest.fn().mockReturnValue({
  data: [],
  isLoading: false,
  refetch: mockRefetchERC20,
});

jest.mock('../../../hooks/useApiQuery', () => ({
  useUnclaimedDonatedNFTByUser: (...args: unknown[]) => mockUseUnclaimedDonatedNFTByUser(...args),
  useUnclaimedRaffleDepositsByUser: (...args: unknown[]) =>
    mockUseUnclaimedRaffleDepositsByUser(...args),
  useDonationsERC20ByUser: (...args: unknown[]) => mockUseDonationsERC20ByUser(...args),
}));

let mockAccount: string | null = '0xUser';
jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount }),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('../../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: jest.fn() }),
}));
jest.mock('../../../contexts/ApiDataContext', () => ({
  useApiData: () => ({
    apiData: { ETHRaffleToClaim: 0, NumDonatedNFTToClaim: 0 },
    fetchData: jest.fn(),
  }),
}));
jest.mock('../../../hooks/useRaffleWalletContract', () => ({
  __esModule: true,
  default: () => ({
    write: {
      withdrawEverything: jest.fn(),
      claimDonatedNft: jest.fn(),
      claimManyDonatedNfts: jest.fn(),
      claimDonatedToken: jest.fn(),
      claimManyDonatedTokens: jest.fn(),
    },
    read: { roundTimeoutTimesToWithdrawPrizes: jest.fn() },
  }),
}));

jest.mock('../../../components/winnings/RaffleWinningsTable', () => ({
  RaffleWinningsTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="raffle-winnings-table">rows: {list.length}</div>
  ),
}));

jest.mock('../../../components/donations/DonatedNFTTable', () => ({
  __esModule: true,
  default: ({ list }: { list: unknown[] }) => (
    <div data-testid="donated-nft-table">nfts: {list.length}</div>
  ),
}));
jest.mock('../../../components/staking/UncollectedCSTStakingRewardsTable', () => ({
  UncollectedCSTStakingRewardsTable: () => <div data-testid="uncollected-rewards" />,
}));
jest.mock('../../../components/donations/DonatedERC20Table', () => ({
  __esModule: true,
  default: () => <div data-testid="donated-erc20-table" />,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount = '0xUser';
});

describe('MyWinnings', () => {
  it('prompts login when no account is connected', () => {
    mockAccount = null;
    render(<MyWinnings />);
    expect(screen.getByText('Wallet not connected')).toBeInTheDocument();
    expect(
      screen.getByText('Connect your wallet to view and claim your winnings.'),
    ).toBeInTheDocument();
  });

  it('shows error state when queries fail', () => {
    mockUseUnclaimedDonatedNFTByUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetchNFTs,
    });
    render(<MyWinnings />);
    expect(screen.getByText('Failed to load')).toBeInTheDocument();
  });

  it('shows loading for raffle section', () => {
    mockUseUnclaimedDonatedNFTByUser.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetchNFTs,
    });
    mockUseUnclaimedRaffleDepositsByUser.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetchRaffle,
    });
    render(<MyWinnings />);
    const loadingElements = screen.getAllByText('Loading...');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('shows "No winnings yet." when raffle data is empty', () => {
    mockUseUnclaimedDonatedNFTByUser.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: mockRefetchNFTs,
    });
    mockUseUnclaimedRaffleDepositsByUser.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: mockRefetchRaffle,
    });
    render(<MyWinnings />);
    expect(screen.getByText('No ETH allocations yet')).toBeInTheDocument();
  });

  it('renders page heading and sections with data', () => {
    mockUseUnclaimedDonatedNFTByUser.mockReturnValue({
      data: [
        {
          Index: 0,
          TimeStamp: 1700000000,
          RecordId: 1,
          TxHash: '0x',
          DonorAddr: '0x',
          RoundNum: 1,
          TokenAddr: '0x',
        },
      ],
      isLoading: false,
      isError: false,
      refetch: mockRefetchNFTs,
    });
    mockUseUnclaimedRaffleDepositsByUser.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      refetch: mockRefetchRaffle,
    });
    render(<MyWinnings />);

    expect(screen.getByText('My Allocations')).toBeInTheDocument();
    expect(screen.getByText('Retrievable ETH Allocations')).toBeInTheDocument();
    expect(screen.getByText('Attached NFTs')).toBeInTheDocument();
    expect(screen.getByTestId('donated-nft-table')).toHaveTextContent('nfts: 1');
    expect(screen.getByTestId('uncollected-rewards')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<MyWinnings />);
    await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
  });
});
