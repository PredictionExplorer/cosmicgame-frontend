import { checkA11y, render, screen } from '@/test-utils';

import PrizeWinnersPage from '../PrizeWinnersPage';

const mockUseRoundList = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useRoundList: (...args: unknown[]) => mockUseRoundList(...args),
}));

let capturedList: unknown[] = [];
jest.mock('../../../components/tables/PrizeTable', () => ({
  PrizeTable: ({ list, loading }: { list: unknown[]; loading: boolean }) => {
    capturedList = list;
    return <div data-testid="prize-table">{loading ? 'Loading...' : `rows: ${list.length}`}</div>;
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  capturedList = [];
});

describe('PrizeWinnersPage', () => {
  it('renders the heading', () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    render(<PrizeWinnersPage />);
    expect(screen.getByText('Prize Winners')).toBeInTheDocument();
  });

  it('passes loading state to PrizeTable', () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: true });
    render(<PrizeWinnersPage />);
    expect(screen.getByTestId('prize-table')).toHaveTextContent('Loading...');
  });

  it('sorts data by TimeStamp descending', () => {
    mockUseRoundList.mockReturnValue({
      data: [
        { TimeStamp: 100, id: 'a' },
        { TimeStamp: 300, id: 'c' },
        { TimeStamp: 200, id: 'b' },
      ],
      isLoading: false,
    });
    render(<PrizeWinnersPage />);
    expect(capturedList).toEqual([
      { TimeStamp: 300, id: 'c' },
      { TimeStamp: 200, id: 'b' },
      { TimeStamp: 100, id: 'a' },
    ]);
  });

  it('renders empty table for no data', () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    render(<PrizeWinnersPage />);
    expect(screen.getByTestId('prize-table')).toHaveTextContent('rows: 0');
  });

  it('has no accessibility violations', async () => {
    mockUseRoundList.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<PrizeWinnersPage />);
    await checkA11y(container);
  });
});
