import { checkA11y, render, screen } from '@/test-utils';

import PrizeWinnersPage from '../PrizeWinnersPage';

const mockUseRoundList = jest.fn();

jest.mock('../../../../hooks/useApiQuery', () => ({
  useRoundList: (...args: unknown[]) => mockUseRoundList(...args),
}));

let capturedList: unknown[] = [];
jest.mock('../../../../components/tables/PrizeTable', () => ({
  PrizeTable: ({ list, loading }: { list: unknown[]; loading: boolean }) => {
    capturedList = list;
    return <div data-testid="prize-table">{loading ? 'Loading...' : `rows: ${list.length}`}</div>;
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  capturedList = [];
});

const createRound = (overrides = {}) => ({
  TimeStamp: 100,
  AmountEth: 1.5,
  WinnerAddr: '0xWinner',
  RoundStats: { TotalBids: 10 },
  ...overrides,
});

describe('PrizeWinnersPage', () => {
  it('renders the heading', () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    render(<PrizeWinnersPage />);
    expect(screen.getByText('Prize Winners')).toBeInTheDocument();
  });

  it('renders the enhanced subtitle', () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    render(<PrizeWinnersPage />);
    expect(screen.getByText(/Browse the complete history of prize winners/i)).toBeInTheDocument();
  });

  it('passes loading state to PrizeTable', () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: true });
    render(<PrizeWinnersPage />);
    expect(screen.getByTestId('prize-table')).toHaveTextContent('Loading...');
  });

  it('sorts data by TimeStamp descending', () => {
    mockUseRoundList.mockReturnValue({
      data: [
        createRound({ TimeStamp: 100, id: 'a' }),
        createRound({ TimeStamp: 300, id: 'c' }),
        createRound({ TimeStamp: 200, id: 'b' }),
      ],
      isLoading: false,
    });
    render(<PrizeWinnersPage />);
    expect(capturedList).toEqual([
      expect.objectContaining({ TimeStamp: 300, id: 'c' }),
      expect.objectContaining({ TimeStamp: 200, id: 'b' }),
      expect.objectContaining({ TimeStamp: 100, id: 'a' }),
    ]);
  });

  it('renders empty table for no data', () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    render(<PrizeWinnersPage />);
    expect(screen.getByTestId('prize-table')).toHaveTextContent('rows: 0');
  });

  describe('summary statistics', () => {
    it('renders summary stats when data is available', () => {
      mockUseRoundList.mockReturnValue({
        data: [
          createRound({ AmountEth: 1.5, WinnerAddr: '0xA', RoundStats: { TotalBids: 10 } }),
          createRound({ AmountEth: 2.5, WinnerAddr: '0xB', RoundStats: { TotalBids: 20 } }),
          createRound({ AmountEth: 3.0, WinnerAddr: '0xA', RoundStats: { TotalBids: 30 } }),
        ],
        isLoading: false,
      });
      render(<PrizeWinnersPage />);

      const statsContainer = screen.getByTestId('summary-stats');
      expect(statsContainer).toBeInTheDocument();

      expect(screen.getByTestId('summary-stat-total-rounds')).toHaveTextContent('3');
      expect(screen.getByTestId('summary-stat-total-eth-awarded')).toHaveTextContent('7.00 ETH');
      expect(screen.getByTestId('summary-stat-total-bids')).toHaveTextContent('60');
      expect(screen.getByTestId('summary-stat-unique-winners')).toHaveTextContent('2');
    });

    it('does not render summary stats when data is empty', () => {
      mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
      render(<PrizeWinnersPage />);
      expect(screen.queryByTestId('summary-stats')).not.toBeInTheDocument();
    });

    it('shows skeleton loading for summary stats while loading', () => {
      mockUseRoundList.mockReturnValue({ data: [], isLoading: true });
      const { container } = render(<PrizeWinnersPage />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  it('has no accessibility violations', async () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<PrizeWinnersPage />);
    await checkA11y(container);
  });

  it('has no accessibility violations with data', async () => {
    mockUseRoundList.mockReturnValue({
      data: [createRound(), createRound({ TimeStamp: 200, WinnerAddr: '0xB' })],
      isLoading: false,
    });
    const { container } = render(<PrizeWinnersPage />);
    await checkA11y(container);
  });
});
