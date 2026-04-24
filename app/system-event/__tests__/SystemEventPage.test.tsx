import { reportError } from '@/utils/errors';

import { checkA11y, render, screen } from '@/test-utils';

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

jest.mock('../../../utils/errors', () => ({
  reportError: jest.fn(),
}));

const mockReportError = reportError as jest.Mock;

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
    expect(screen.getByText('System Configuration Made Before Cycle 5')).toBeInTheDocument();
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

  describe('error handling', () => {
    it('renders error message when query returns an error', () => {
      mockUseSystemEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network response was not OK'),
      });
      render(<SystemEventPage start={0} end={100} round={1} />);
      expect(screen.getByText('Network response was not OK')).toBeInTheDocument();
    });

    it('renders generic fallback when error.message is empty', () => {
      mockUseSystemEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error(''),
      });
      render(<SystemEventPage start={0} end={100} round={1} />);
      expect(screen.getByText('Failed to load system events')).toBeInTheDocument();
    });

    it('does not render loading text when in error state', () => {
      mockUseSystemEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('fail'),
      });
      render(<SystemEventPage start={0} end={100} round={1} />);
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    it('does not render the events table when in error state', () => {
      mockUseSystemEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('fail'),
      });
      render(<SystemEventPage start={0} end={100} round={1} />);
      expect(screen.queryByTestId('events-table')).not.toBeInTheDocument();
    });

    it('still shows round title when in error state (round > 0)', () => {
      mockUseSystemEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('fail'),
      });
      render(<SystemEventPage start={0} end={100} round={3} />);
      expect(screen.getByText('System Configuration Made Before Cycle 3')).toBeInTheDocument();
    });

    it('still shows deployment title when in error state (round === 0)', () => {
      mockUseSystemEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('fail'),
      });
      render(<SystemEventPage start={0} end={100} round={0} />);
      expect(screen.getByText('System Configuration Made Before Deployment')).toBeInTheDocument();
    });

    it('applies text-destructive styling to the error message', () => {
      mockUseSystemEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Server error'),
      });
      render(<SystemEventPage start={0} end={100} round={1} />);
      const errorEl = screen.getByText('Server error');
      expect(errorEl).toHaveClass('text-destructive');
    });
  });

  describe('reportError integration', () => {
    it('calls reportError with the error and context when error is present', () => {
      const error = new Error('Network response was not OK');
      mockUseSystemEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        error,
      });
      render(<SystemEventPage start={0} end={100} round={1} />);
      expect(mockReportError).toHaveBeenCalledWith(error, 'fetch system events');
    });

    it('does not call reportError when there is no error', () => {
      mockUseSystemEvents.mockReturnValue({ data: [], isLoading: false, error: null });
      render(<SystemEventPage start={0} end={100} round={1} />);
      expect(mockReportError).not.toHaveBeenCalled();
    });

    it('calls reportError again when the error changes', () => {
      const error1 = new Error('first');
      const error2 = new Error('second');

      mockUseSystemEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: error1,
      });
      const { rerender } = render(<SystemEventPage start={0} end={100} round={1} />);
      expect(mockReportError).toHaveBeenCalledTimes(1);
      expect(mockReportError).toHaveBeenCalledWith(error1, 'fetch system events');

      mockUseSystemEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: error2,
      });
      rerender(<SystemEventPage start={0} end={100} round={1} />);
      expect(mockReportError).toHaveBeenCalledTimes(2);
      expect(mockReportError).toHaveBeenLastCalledWith(error2, 'fetch system events');
    });
  });

  describe('recovery', () => {
    it('renders the table again when error clears', () => {
      mockUseSystemEvents.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('temporary failure'),
      });
      const { rerender } = render(<SystemEventPage start={0} end={100} round={1} />);
      expect(screen.getByText('temporary failure')).toBeInTheDocument();
      expect(screen.queryByTestId('events-table')).not.toBeInTheDocument();

      mockUseSystemEvents.mockReturnValue({
        data: [{ id: 1 }],
        isLoading: false,
        error: null,
      });
      rerender(<SystemEventPage start={0} end={100} round={1} />);
      expect(screen.queryByText('temporary failure')).not.toBeInTheDocument();
      expect(screen.getByTestId('events-table')).toHaveTextContent('events: 1');
    });
  });

  it('has no accessibility violations', async () => {
    mockUseSystemEvents.mockReturnValue({ data: [], isLoading: false, error: null });
    const { container } = render(<SystemEventPage start={0} end={100} round={1} />);
    await checkA11y(container);
  });
});
