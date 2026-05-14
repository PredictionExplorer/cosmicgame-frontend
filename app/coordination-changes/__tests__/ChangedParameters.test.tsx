import { render, screen, checkA11y } from '@/test-utils';

import ChangedParameters from '../ChangedParameters';

const mockUseSystemModelist = jest.fn();
const mockUseSystemEvents = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useSystemModelist: (...args: unknown[]) => mockUseSystemModelist(...args),
  useSystemEvents: (...args: unknown[]) => mockUseSystemEvents(...args),
}));

jest.mock('../../../components/tables/AdminEventsTable', () => ({
  AdminEventsTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="events-table">rows: {list.length}</div>
  ),
}));

beforeEach(() => jest.clearAllMocks());

describe('ChangedParameters', () => {
  it('renders the heading', () => {
    mockUseSystemModelist.mockReturnValue({ data: null, isLoading: false });
    mockUseSystemEvents.mockReturnValue({ data: [], isLoading: false });
    render(<ChangedParameters />);
    expect(screen.getByText('Coordination Changes')).toBeInTheDocument();
  });

  it('renders events table without a connected wallet', () => {
    mockUseSystemModelist.mockReturnValue({
      data: [{ EvtLogId: 100 }],
      isLoading: false,
    });
    mockUseSystemEvents.mockReturnValue({
      data: [{ id: 1 }],
      isLoading: false,
    });
    render(<ChangedParameters />);
    expect(screen.getByTestId('events-table')).toHaveTextContent('rows: 1');
    expect(
      screen.queryByText('Please login to Metamask to see your allocations.'),
    ).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseSystemModelist.mockReturnValue({ data: null, isLoading: true });
    mockUseSystemEvents.mockReturnValue({ data: [], isLoading: false });
    render(<ChangedParameters />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders events table when loaded', () => {
    mockUseSystemModelist.mockReturnValue({
      data: [{ EvtLogId: 100 }],
      isLoading: false,
    });
    mockUseSystemEvents.mockReturnValue({
      data: [{ id: 1 }, { id: 2 }],
      isLoading: false,
    });
    render(<ChangedParameters />);
    expect(screen.getByTestId('events-table')).toHaveTextContent('rows: 2');
  });

  it('passes startId from modeList to useSystemEvents', () => {
    mockUseSystemModelist.mockReturnValue({
      data: [{ EvtLogId: 42 }],
      isLoading: false,
    });
    mockUseSystemEvents.mockReturnValue({ data: [], isLoading: false });
    render(<ChangedParameters />);
    expect(mockUseSystemEvents).toHaveBeenCalledWith(42, 9999999999);
  });

  it('passes -1 as startId when modeList is null', () => {
    mockUseSystemModelist.mockReturnValue({ data: null, isLoading: false });
    mockUseSystemEvents.mockReturnValue({ data: [], isLoading: false });
    render(<ChangedParameters />);
    expect(mockUseSystemEvents).toHaveBeenCalledWith(-1, 9999999999);
  });

  it('has no accessibility violations', async () => {
    mockUseSystemModelist.mockReturnValue({ data: [{ EvtLogId: 1 }], isLoading: false });
    mockUseSystemEvents.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<ChangedParameters />);
    await checkA11y(container);
  });
});
