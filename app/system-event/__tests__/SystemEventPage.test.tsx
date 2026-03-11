import { render, screen } from '@/test-utils';

import SystemEventPage from '../[round]/[start]/[end]/SystemEventPage';

const mockUseSystemEvents = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  error: null,
});

jest.mock('../../../hooks/useApiQuery', () => ({
  useSystemEvents: (...args: unknown[]) => mockUseSystemEvents(...args),
}));

jest.mock('../../../components/tables/AdminEventsTable', () => ({
  AdminEventsTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="events-table">events: {list.length}</div>
  ),
}));

beforeEach(() => jest.clearAllMocks());

describe('SystemEventPage', () => {
  it('shows loading state', () => {
    mockUseSystemEvents.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<SystemEventPage start={0} end={100} round={1} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders events table after loading', () => {
    mockUseSystemEvents.mockReturnValue({
      data: [{ id: 1 }, { id: 2 }],
      isLoading: false,
      error: null,
    });
    render(<SystemEventPage start={0} end={100} round={1} />);
    expect(screen.getByTestId('events-table')).toHaveTextContent('events: 2');
  });

  it('shows round-specific title when round > 0', () => {
    mockUseSystemEvents.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<SystemEventPage start={0} end={100} round={5} />);
    expect(screen.getByText('System Configuration Made Before Round 5')).toBeInTheDocument();
  });

  it('shows deployment title when round is 0', () => {
    mockUseSystemEvents.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<SystemEventPage start={0} end={100} round={0} />);
    expect(screen.getByText('System Configuration Made Before Deployment')).toBeInTheDocument();
  });

  it('passes correct args to useSystemEvents', () => {
    mockUseSystemEvents.mockReturnValue({ data: [], isLoading: false, error: null });
    render(<SystemEventPage start={10} end={20} round={1} />);
    expect(mockUseSystemEvents).toHaveBeenCalledWith(10, 20);
  });
});
