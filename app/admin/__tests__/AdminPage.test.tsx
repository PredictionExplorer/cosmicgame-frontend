import { render, screen, checkA11y } from '@/test-utils';

import AdminPage from '../AdminPage';

const mockUseGestureList = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  error: null,
});

jest.mock('../../../hooks/useApiQuery', () => ({
  useGestureList: (...args: unknown[]) => mockUseGestureList(...args),
}));

jest.mock('../../../components/tables/BanGestureTable', () => ({
  __esModule: true,
  default: ({ gestureHistory }: { gestureHistory: unknown[] }) => (
    <div data-testid="ban-gesture-table">rows: {gestureHistory.length}</div>
  ),
}));

beforeEach(() => jest.clearAllMocks());

describe('AdminPage', () => {
  it('shows loading state when query is loading', () => {
    mockUseGestureList.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<AdminPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows loading when data is null', () => {
    mockUseGestureList.mockReturnValue({ data: undefined, isLoading: false, error: null });
    render(<AdminPage />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders BanGestureTable with filtered gesture list', () => {
    mockUseGestureList.mockReturnValue({
      data: [
        { Message: 'Hello', EvtLogId: 1 },
        { Message: '', EvtLogId: 2 },
        { Message: 'World', EvtLogId: 3 },
      ],
      isLoading: false,
      error: null,
    });
    render(<AdminPage />);
    expect(screen.getByTestId('ban-gesture-table')).toHaveTextContent('rows: 2');
  });

  it('filters out gestures with empty messages', () => {
    mockUseGestureList.mockReturnValue({
      data: [
        { Message: '', EvtLogId: 1 },
        { Message: '', EvtLogId: 2 },
      ],
      isLoading: false,
      error: null,
    });
    render(<AdminPage />);
    expect(screen.getByTestId('ban-gesture-table')).toHaveTextContent('rows: 0');
  });

  it('renders the page title', () => {
    mockUseGestureList.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<AdminPage />);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseGestureList.mockReturnValue({ data: [], isLoading: false, error: null });
    const { container } = render(<AdminPage />);
    await checkA11y(container);
  });
});
