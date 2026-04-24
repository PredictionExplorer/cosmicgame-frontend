import { checkA11y, render, screen } from '@/test-utils';

import UserRaffleETHPage from '../raffle-eth/[address]/UserRaffleETHPage';

const mockRefetchDeposits = jest.fn();
const mockUseRaffleDepositsByUser = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  error: null,
  refetch: mockRefetchDeposits,
});

jest.mock('../../../hooks/useApiQuery', () => ({
  useRaffleDepositsByUser: (...args: unknown[]) => mockUseRaffleDepositsByUser(...args),
}));

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: '0x1234567890123456789012345678901234567890' }),
}));

jest.mock('../../../contexts/ApiDataContext', () => ({
  useApiData: () => ({ apiData: { ETHRaffleToClaim: 0 }, fetchData: jest.fn() }),
}));

jest.mock('../../../hooks/useRaffleWalletContract', () => ({
  __esModule: true,
  default: () => ({ write: {} }),
}));

jest.mock('../../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: jest.fn() }),
}));

beforeEach(() => jest.clearAllMocks());

describe('UserRaffleETHPage', () => {
  const validAddr = '0x1234567890123456789012345678901234567890';

  it('shows loading when query is loading', () => {
    mockUseRaffleDepositsByUser.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: mockRefetchDeposits,
    });
    render(<UserRaffleETHPage address={validAddr} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows invalid address message for bad addresses', () => {
    mockUseRaffleDepositsByUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: mockRefetchDeposits,
    });
    render(<UserRaffleETHPage address="not-an-address" />);
    expect(screen.getByText('Invalid Address')).toBeInTheDocument();
  });

  it('renders deposits after loading', () => {
    mockUseRaffleDepositsByUser.mockReturnValue({
      data: [{ EvtLogId: 1, TxHash: '0xabc', TimeStamp: 1000000, RoundNum: 1, Amount: 1.5 }],
      isLoading: false,
      error: null,
      refetch: mockRefetchDeposits,
    });
    render(<UserRaffleETHPage address={validAddr} />);
    expect(
      screen.getByText('Stellar Selection ETH allocated to this participant'),
    ).toBeInTheDocument();
  });

  it('shows empty state when no deposits', () => {
    mockUseRaffleDepositsByUser.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: mockRefetchDeposits,
    });
    render(<UserRaffleETHPage address={validAddr} />);
    expect(screen.getByText('No Stellar Selection ETH yet.')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <UserRaffleETHPage address="0x1234567890123456789012345678901234567890" />,
    );
    await checkA11y(container);
  });
});
