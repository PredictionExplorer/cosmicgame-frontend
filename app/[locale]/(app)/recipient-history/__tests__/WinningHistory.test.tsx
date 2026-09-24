import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen } from '@/test-utils';

import WinningHistory from '../WinningHistory';

const mockUseActiveWeb3React = jest.fn();
const mockUseClaimHistoryByUser = jest.fn();
const mockRefetch = jest.fn();

jest.mock('../../../../../hooks/web3', () => ({
  useActiveWeb3React: () => mockUseActiveWeb3React(),
}));

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useClaimHistoryByUser: (...args: unknown[]) => mockUseClaimHistoryByUser(...args),
}));

jest.mock('../../../../../components/tables/RecipientHistoryTable', () => ({
  __esModule: true,
  default: ({ winningHistory, loading }: { winningHistory: unknown[]; loading?: boolean }) => (
    <div data-testid="history-table" data-loading={loading ? 'true' : undefined}>
      rows: {winningHistory.length}
    </div>
  ),
}));

function history(state: { data?: unknown[] | null; isLoading?: boolean; error?: unknown }) {
  mockUseClaimHistoryByUser.mockReturnValue({
    data: null,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
    ...state,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseActiveWeb3React.mockReturnValue({ account: '0xABC' });
});

describe('WinningHistory', () => {
  it('keeps one title whether or not a wallet is connected', () => {
    history({ data: [] });
    const { unmount } = render(<WinningHistory />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'My Allocation History' }),
    ).toBeInTheDocument();
    unmount();

    mockUseActiveWeb3React.mockReturnValue({ account: null });
    render(<WinningHistory />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'My Allocation History' }),
    ).toBeInTheDocument();
  });

  it('links to where allocations are retrieved and to the public record', () => {
    history({ data: [{ id: 1 }] });
    render(<WinningHistory />);
    // The nav namespace is not loaded in unit tests, so the links read as their keys.
    expect(screen.getByRole('link', { name: 'nav.routes.myAllocations.label' })).toHaveAttribute(
      'href',
      '/my-allocations',
    );
    expect(
      screen.getByRole('link', { name: 'nav.routes.allocationRecipients.label' }),
    ).toHaveAttribute('href', '/allocation');
  });

  it('asks to connect and says what the page shows, once', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: null });
    history({});
    render(<WinningHistory />);
    expect(
      screen.getByRole('heading', { name: 'wallet.required.history.title' }),
    ).toBeInTheDocument();
    expect(screen.getByText('wallet.required.history.description')).toBeInTheDocument();
    // The connected view's intro is not repeated above the prompt, and no stub lede stands
    // in for it: the prompt alone says what the page shows.
    expect(screen.queryByText(/cycle by cycle/)).not.toBeInTheDocument();
    expect(document.querySelector('header p.type-lede')).toBeNull();
  });

  it('shows loading state', () => {
    history({ isLoading: true });
    render(<WinningHistory />);
    expect(screen.getByTestId('history-table')).toHaveAttribute('data-loading', 'true');
  });

  it('explains a failed load in the reader’s words and offers a retry', async () => {
    history({ error: { message: 'Network error' } });
    render(<WinningHistory />);
    // The localized explanation, never the raw transport message.
    expect(screen.getByText('Please try again in a moment.')).toBeInTheDocument();
    expect(screen.queryByText('Network error')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it('shows a designed empty state that says when records appear', () => {
    history({ data: [] });
    render(<WinningHistory />);
    expect(screen.getByRole('heading', { level: 2, name: 'No allocations yet' })).toBeVisible();
    expect(
      screen.getByText(
        'When a finalized cycle allocates something to this wallet, it is recorded here.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('history-table')).not.toBeInTheDocument();
  });

  it('renders history table with data', () => {
    history({ data: [{ id: 1 }, { id: 2 }] });
    render(<WinningHistory />);
    expect(screen.getByTestId('history-table')).toHaveTextContent('rows: 2');
  });

  it('passes account to useClaimHistoryByUser', () => {
    mockUseActiveWeb3React.mockReturnValue({ account: '0xMYACCOUNT' });
    history({});
    render(<WinningHistory />);
    expect(mockUseClaimHistoryByUser).toHaveBeenCalledWith('0xMYACCOUNT');
  });

  it('has no accessibility violations', async () => {
    history({ data: [] });
    const { container } = render(<WinningHistory />);
    await checkA11y(container);
  });
});
