import { render, screen, fireEvent, checkA11y } from '@/test-utils';

import EthDonations from '../EthDonations';

const mockRefetch = jest.fn();
const mockUseDonationsBoth = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  error: null,
  refetch: mockRefetch,
});

jest.mock('../../../../hooks/useApiQuery', () => ({
  useDonationsBoth: (...args: unknown[]) => mockUseDonationsBoth(...args),
}));

jest.mock('../../../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: jest.fn() }),
}));

jest.mock('../../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: '0xUser' }),
}));

jest.mock('../../../../hooks/useCosmicGameContract', () => ({
  __esModule: true,
  default: () => ({
    write: {
      donateEth: jest.fn(),
      donateEthWithInfo: jest.fn(),
    },
  }),
}));

jest.mock('../../../../components/tables/EthDonationTable', () => ({
  __esModule: true,
  default: ({ list }: { list: unknown[] }) => (
    <div data-testid="donation-table">donations: {list.length}</div>
  ),
}));

beforeEach(() => jest.clearAllMocks());

describe('EthDonations', () => {
  it('shows loading state', () => {
    mockUseDonationsBoth.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    });
    render(<EthDonations />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders donation table with data', () => {
    mockUseDonationsBoth.mockReturnValue({
      data: [{ id: 1 }, { id: 2 }],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
    render(<EthDonations />);
    expect(screen.getByTestId('donation-table')).toHaveTextContent('donations: 2');
  });

  it('renders page title', () => {
    mockUseDonationsBoth.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
    render(<EthDonations />);
    expect(screen.getByText('ETH Donations')).toBeInTheDocument();
  });

  it('renders donation form when account is connected', () => {
    mockUseDonationsBoth.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
    render(<EthDonations />);
    expect(screen.getByPlaceholderText('0.0')).toBeInTheDocument();
    expect(screen.getByText('Donate')).toBeInTheDocument();
    expect(screen.getByText('Donate with Info')).toBeInTheDocument();
  });

  it('updates donation amount on input change', () => {
    mockUseDonationsBoth.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
    render(<EthDonations />);
    const input = screen.getByPlaceholderText('0.0');
    fireEvent.change(input, { target: { value: '1.5' } });
    expect(input).toHaveValue(1.5);
  });

  it('has no accessibility violations', async () => {
    mockUseDonationsBoth.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });
    const { container } = render(<EthDonations />);
    await checkA11y(container, { rules: { 'heading-order': { enabled: false } } });
  });
});
