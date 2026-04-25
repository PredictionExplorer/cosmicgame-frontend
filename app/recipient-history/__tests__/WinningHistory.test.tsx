import { checkA11y, render, screen } from '@/test-utils';

import WinningHistory from '../WinningHistory';

const mockUseActiveWeb3React = jest.fn();
const mockUseClaimHistoryByUser = jest.fn();

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => mockUseActiveWeb3React(),
}));

jest.mock('../../../hooks/useApiQuery', () => ({
  useClaimHistoryByUser: (...args: unknown[]) => mockUseClaimHistoryByUser(...args),
}));

jest.mock('../../../components/tables/RecipientHistoryTable', () => ({
  __esModule: true,
  default: ({ winningHistory }: { winningHistory: unknown[] }) => (
    <div data-testid="history-table">rows: {winningHistory.length}</div>
  ),
}));

beforeEach(() => jest.clearAllMocks());

describe('WinningHistory', () => {
  it('renders the heading', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0xABC' });
    mockUseClaimHistoryByUser.mockReturnValue({ data: null, isLoading: false, error: null });
    render(<WinningHistory />);
    expect(screen.getByText('History of My Allocations')).toBeInTheDocument();
  });

  it('shows login prompt when no account', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: null });
    mockUseClaimHistoryByUser.mockReturnValue({ data: null, isLoading: false, error: null });
    render(<WinningHistory />);
    expect(
      screen.getByText('Please connect your wallet to see your allocation history.'),
    ).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0xABC' });
    mockUseClaimHistoryByUser.mockReturnValue({ data: null, isLoading: true, error: null });
    render(<WinningHistory />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0xABC' });
    mockUseClaimHistoryByUser.mockReturnValue({
      data: null,
      isLoading: false,
      error: { message: 'Network error' },
    });
    render(<WinningHistory />);
    expect(screen.getByText('Network error')).toBeInTheDocument();
  });

  it('shows empty state when no winnings', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0xABC' });
    mockUseClaimHistoryByUser.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<WinningHistory />);
    expect(screen.getByText('You currently have no recorded allocations.')).toBeInTheDocument();
  });

  it('renders history table with data', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0xABC' });
    mockUseClaimHistoryByUser.mockReturnValue({
      data: [{ id: 1 }, { id: 2 }],
      isLoading: false,
      error: null,
    });
    render(<WinningHistory />);
    expect(screen.getByTestId('history-table')).toHaveTextContent('rows: 2');
  });

  it('passes account to useClaimHistoryByUser', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0xMYACCOUNT' });
    mockUseClaimHistoryByUser.mockReturnValue({ data: null, isLoading: false, error: null });
    render(<WinningHistory />);
    expect(mockUseClaimHistoryByUser).toHaveBeenCalledWith('0xMYACCOUNT');
  });

  it('has no accessibility violations', async () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0xABC' });
    mockUseClaimHistoryByUser.mockReturnValue({ data: null, isLoading: false, error: null });
    const { container } = render(<WinningHistory />);
    await checkA11y(container, {
      rules: { 'heading-order': { enabled: false } },
    });
  });
});
