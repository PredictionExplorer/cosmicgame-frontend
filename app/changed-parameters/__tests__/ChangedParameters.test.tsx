import { render, screen, checkA11y } from '@/test-utils';

import ChangedParameters from '../ChangedParameters';

const mockUseActiveWeb3React = jest.fn();
const mockUseSystemModelist = jest.fn();
const mockUseSystemEvents = jest.fn();

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => mockUseActiveWeb3React(),
}));

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
    mockUseActiveWeb3React.mockReturnValue({ account: '0xABC' });
    mockUseSystemModelist.mockReturnValue({ data: null, isLoading: false });
    mockUseSystemEvents.mockReturnValue({ data: [], isLoading: false });
    render(<ChangedParameters />);
    expect(screen.getByText('Changed Parameters')).toBeInTheDocument();
  });

  it('shows login prompt when no account', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: null });
    mockUseSystemModelist.mockReturnValue({ data: null, isLoading: false });
    mockUseSystemEvents.mockReturnValue({ data: [], isLoading: false });
    render(<ChangedParameters />);
    expect(screen.getByText('Please login to Metamask to see your winnings.')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0xABC' });
    mockUseSystemModelist.mockReturnValue({ data: null, isLoading: true });
    mockUseSystemEvents.mockReturnValue({ data: [], isLoading: false });
    render(<ChangedParameters />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders events table when loaded', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0xABC' });
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
    mockUseActiveWeb3React.mockReturnValue({ account: '0xABC' });
    mockUseSystemModelist.mockReturnValue({
      data: [{ EvtLogId: 42 }],
      isLoading: false,
    });
    mockUseSystemEvents.mockReturnValue({ data: [], isLoading: false });
    render(<ChangedParameters />);
    expect(mockUseSystemEvents).toHaveBeenCalledWith(42, 9999999999);
  });

  it('passes -1 as startId when modeList is null', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0xABC' });
    mockUseSystemModelist.mockReturnValue({ data: null, isLoading: false });
    mockUseSystemEvents.mockReturnValue({ data: [], isLoading: false });
    render(<ChangedParameters />);
    expect(mockUseSystemEvents).toHaveBeenCalledWith(-1, 9999999999);
  });

  it('has no accessibility violations', async () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0xABC' });
    mockUseSystemModelist.mockReturnValue({ data: [{ EvtLogId: 1 }], isLoading: false });
    mockUseSystemEvents.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<ChangedParameters />);
    await checkA11y(container);
  });
});
