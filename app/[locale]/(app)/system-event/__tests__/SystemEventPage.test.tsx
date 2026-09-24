import { reportError } from '@/utils/errors';

import { checkA11y, render, screen, within } from '@/test-utils';

import SystemEventPage from '../[round]/[start]/[end]/SystemEventPage';

const mockRefetch = jest.fn();
const mockUseSystemEvents = jest.fn();

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useSystemEvents: (...args: unknown[]) => mockUseSystemEvents(...args),
}));

jest.mock('../../../../../components/tables/AdminEventsTable', () => ({
  AdminEventsTable: ({
    list,
    loading,
    error,
    onRetry,
    emptyDescription,
  }: {
    list: unknown[];
    loading?: boolean;
    error?: string;
    onRetry?: () => void;
    emptyDescription?: string;
  }) => (
    <div data-testid="events-table" data-loading={loading ? 'true' : undefined}>
      events: {list.length}
      {error ? (
        <p role="alert">
          {error}
          <button type="button" onClick={onRetry}>
            Try again
          </button>
        </p>
      ) : null}
      {list.length === 0 && !loading && !error ? <p>{emptyDescription}</p> : null}
    </div>
  ),
}));

jest.mock('../../../../../utils/errors', () => ({
  reportError: jest.fn(),
}));

const mockReportError = reportError as jest.Mock;

/** 2024-01-02 03:04:05 UTC and a day later. */
const FIRST = 1_704_164_645;
const LATEST = FIRST + 86_400;

const rows = [
  { EvtLogId: 101, RecordType: 1, TimeStamp: LATEST, TxHash: '0xb' },
  { EvtLogId: 100, RecordType: 2, TimeStamp: FIRST, TxHash: '0xa' },
];

function mockEvents(state: { data?: unknown[]; isLoading?: boolean; error?: Error | null }) {
  mockUseSystemEvents.mockReturnValue({
    data: state.data,
    isLoading: state.isLoading ?? false,
    error: state.error ?? null,
    refetch: mockRefetch,
  });
}

beforeEach(() => jest.clearAllMocks());

describe('SystemEventPage', () => {
  it('names the window by its cycle, never by its event log ids', () => {
    mockEvents({ data: rows });
    render(<SystemEventPage round={5} start={100} end={200} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Configuration before cycle 5' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The protocol parameters the contract owner changed before cycle 5 opened/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/100/)).not.toBeInTheDocument();
    expect(screen.queryByText(/200/)).not.toBeInTheDocument();
  });

  it('calls the first window the initial configuration', () => {
    mockEvents({ data: rows });
    render(<SystemEventPage round={0} start={0} end={100} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Initial configuration' }),
    ).toBeInTheDocument();
  });

  it('reads the window it names', () => {
    mockEvents({ data: [] });
    render(<SystemEventPage round={1} start={10} end={20} />);
    expect(mockUseSystemEvents).toHaveBeenCalledWith(10, 20);
  });

  it('counts the changes and dates the first and the latest', () => {
    mockEvents({ data: rows });
    render(<SystemEventPage round={1} start={100} end={200} />);
    expect(screen.getByTestId('events-table')).toHaveTextContent('events: 2');
    const changes = screen.getByText('Changes', { selector: 'span' }).closest('div');
    expect(changes).toHaveTextContent('2');
    const first = screen.getByText('First change', { selector: 'span' }).closest('div');
    expect(within(first as HTMLElement).getByText(/2024/)).toBeInTheDocument();
    expect(screen.getByText('Latest change', { selector: 'span' })).toBeInTheDocument();
  });

  it('leaves the dates out of a window with no changes, and says why it is empty', () => {
    mockEvents({ data: [] });
    render(<SystemEventPage round={1} start={100} end={200} />);
    expect(screen.queryByText('First change')).not.toBeInTheDocument();
    expect(
      screen.getByText('The protocol kept its existing settings through this window.'),
    ).toBeInTheDocument();
  });

  it('keeps the header while the list loads and hands the table its loading state', () => {
    mockEvents({ isLoading: true });
    render(<SystemEventPage round={1} start={100} end={200} />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByTestId('events-table')).toHaveAttribute('data-loading', 'true');
  });

  it('links back to every coordination change', () => {
    mockEvents({ data: rows });
    render(<SystemEventPage round={1} start={100} end={200} />);
    const links = screen.getAllByRole('link', { name: /All coordination changes/ });
    expect(links[0]).toHaveAttribute('href', '/coordination-changes');
    expect(screen.getByRole('link', { name: 'Coordination changes' })).toHaveAttribute(
      'href',
      '/coordination-changes',
    );
  });

  describe('a failed read', () => {
    it('explains it in the page language, never the transport message, and retries', () => {
      mockEvents({ error: new Error('Network response was not OK') });
      render(<SystemEventPage round={3} start={100} end={200} />);
      expect(screen.getByRole('alert')).toHaveTextContent(
        'The configuration changes could not be loaded.',
      );
      expect(screen.queryByText(/Network response/)).not.toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 1, name: 'Configuration before cycle 3' }),
      ).toBeInTheDocument();
      screen.getByRole('button', { name: 'Try again' }).click();
      expect(mockRefetch).toHaveBeenCalled();
    });

    it('reports each new error once', () => {
      const first = new Error('first');
      const second = new Error('second');
      mockEvents({ error: first });
      const { rerender } = render(<SystemEventPage round={1} start={100} end={200} />);
      expect(mockReportError).toHaveBeenCalledWith(first, 'fetch system events');

      mockEvents({ error: second });
      rerender(<SystemEventPage round={1} start={100} end={200} />);
      expect(mockReportError).toHaveBeenCalledTimes(2);
      expect(mockReportError).toHaveBeenLastCalledWith(second, 'fetch system events');
    });

    it('does not report a successful read', () => {
      mockEvents({ data: rows });
      render(<SystemEventPage round={1} start={100} end={200} />);
      expect(mockReportError).not.toHaveBeenCalled();
    });
  });

  it.each([
    ['a range that runs backwards', { round: 1, start: 200, end: 100 }],
    ['a range that is not a number', { round: 1, start: Number.NaN, end: 100 }],
    ['a negative cycle', { round: -1, start: 0, end: 100 }],
  ])('refuses %s without reading anything', (_, props) => {
    mockEvents({ data: rows });
    render(<SystemEventPage {...props} />);
    expect(mockUseSystemEvents).toHaveBeenCalledWith(-1, -1);
    expect(
      screen.getByRole('heading', { level: 2, name: 'This configuration window does not exist' }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('events-table')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockEvents({ data: rows });
    const { container } = render(<SystemEventPage round={1} start={100} end={200} />);
    await checkA11y(container);
  });
});
