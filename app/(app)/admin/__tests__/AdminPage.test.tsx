import { render, screen, checkA11y } from '@/test-utils';

import AdminPage from '../AdminPage';

const mockUseBidList = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  error: null,
});

jest.mock('../../../../hooks/useApiQuery', () => ({
  useBidList: (...args: unknown[]) => mockUseBidList(...args),
}));

jest.mock('../../../../components/tables/BanBidTable', () => ({
  __esModule: true,
  default: ({ biddingHistory }: { biddingHistory: unknown[] }) => (
    <div data-testid="ban-bid-table">rows: {biddingHistory.length}</div>
  ),
}));

beforeEach(() => jest.clearAllMocks());

describe('AdminPage', () => {
  it('shows loading state when query is loading', () => {
    mockUseBidList.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<AdminPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows loading when data is null', () => {
    mockUseBidList.mockReturnValue({ data: undefined, isLoading: false, error: null });
    render(<AdminPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders BanBidTable with filtered bid list', () => {
    mockUseBidList.mockReturnValue({
      data: [
        { Message: 'Hello', EvtLogId: 1 },
        { Message: '', EvtLogId: 2 },
        { Message: 'World', EvtLogId: 3 },
      ],
      isLoading: false,
      error: null,
    });
    render(<AdminPage />);
    expect(screen.getByTestId('ban-bid-table')).toHaveTextContent('rows: 2');
  });

  it('filters out bids with empty messages', () => {
    mockUseBidList.mockReturnValue({
      data: [
        { Message: '', EvtLogId: 1 },
        { Message: '', EvtLogId: 2 },
      ],
      isLoading: false,
      error: null,
    });
    render(<AdminPage />);
    expect(screen.getByTestId('ban-bid-table')).toHaveTextContent('rows: 0');
  });

  it('renders the page title', () => {
    mockUseBidList.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<AdminPage />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseBidList.mockReturnValue({ data: [], isLoading: false, error: null });
    const { container } = render(<AdminPage />);
    await checkA11y(container);
  });
});
