import { checkA11y, render, screen } from '@/test-utils';

import AdminPage from '../AdminPage';

const mockUseGestureList = jest.fn();
const mockRefetch = jest.fn();
let mockWallet: { account: string | null; active: boolean } = { account: null, active: false };
let mockRoles: { status: 'loading' | 'ready' | 'error'; roles: string[] } = {
  status: 'ready',
  roles: ['protocolOwner'],
};
const mockUseOperatorRoles = jest.fn((_account: string | null) => mockRoles);

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useGestureList: (...args: unknown[]) => mockUseGestureList(...args),
}));

jest.mock('../../../../../hooks/web3', () => ({
  useActiveWeb3React: () => mockWallet,
}));

jest.mock('../../../../../components/admin/useOperatorRoles', () => ({
  useOperatorRoles: (account: string | null) => mockUseOperatorRoles(account),
}));

interface TableProps {
  gestureHistory: unknown[];
  loading?: boolean;
  error?: string;
  moderatorAddress?: string | null;
  actionsDisabled?: boolean;
  actionsDisabledReasonId?: string;
  notice?: React.ReactNode;
  title?: string;
}

jest.mock('../../../../../components/tables/BanGestureTable', () => ({
  __esModule: true,
  default: ({
    gestureHistory,
    loading,
    error,
    moderatorAddress,
    actionsDisabled,
    actionsDisabledReasonId,
    notice,
    title,
  }: TableProps) => (
    <section aria-label={title}>
      {notice}
      <div
        data-testid="ban-gesture-table"
        data-loading={loading ? 'true' : undefined}
        data-moderator={moderatorAddress ?? ''}
        data-actions-disabled={actionsDisabled ? 'true' : 'false'}
        data-reason={actionsDisabledReasonId ?? ''}
        data-error={error ?? ''}
      >
        rows: {gestureHistory.length}
      </div>
    </section>
  ),
}));

const MODERATOR = '0x1111111111111111111111111111111111111111';

beforeEach(() => {
  jest.clearAllMocks();
  mockWallet = { account: null, active: false };
  mockRoles = { status: 'ready', roles: ['protocolOwner'] };
  mockUseGestureList.mockReturnValue({
    data: [],
    isLoading: false,
    isError: false,
    refetch: mockRefetch,
  });
});

describe('AdminPage', () => {
  it('lists only gestures that carry a message', () => {
    mockUseGestureList.mockReturnValue({
      data: [
        { Message: 'Hello', EvtLogId: 1 },
        { Message: '', EvtLogId: 2 },
        { Message: 'World', EvtLogId: 3 },
      ],
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
    render(<AdminPage />);
    expect(screen.getByTestId('ban-gesture-table')).toHaveTextContent('rows: 2');
  });

  it('shows placeholder rows while the list loads', () => {
    mockUseGestureList.mockReturnValue({ data: undefined, isLoading: true, isError: false });
    render(<AdminPage />);
    expect(screen.getByTestId('ban-gesture-table')).toHaveAttribute('data-loading', 'true');
  });

  it('says the list could not be loaded instead of loading forever', () => {
    mockUseGestureList.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    });
    render(<AdminPage />);
    const table = screen.getByTestId('ban-gesture-table');
    expect(table).not.toHaveAttribute('data-loading');
    expect(table).toHaveAttribute('data-error', 'The gesture messages could not be loaded.');
  });

  it('keeps the list read-only, with no moderation controls, until a wallet connects', () => {
    render(<AdminPage />);
    expect(screen.getByTestId('ban-gesture-table')).toHaveAttribute('data-moderator', '');
    expect(screen.getByTestId('moderation-read-only')).toHaveTextContent(
      'Read-only. Connect the moderator wallet to hide or restore messages.',
    );
    expect(screen.getByRole('button', { name: /wallet\.connect/ })).toBeInTheDocument();
  });

  it('hands the connected wallet to the table as the moderator', () => {
    mockWallet = { account: MODERATOR, active: true };
    render(<AdminPage />);
    const table = screen.getByTestId('ban-gesture-table');
    expect(table).toHaveAttribute('data-moderator', MODERATOR);
    expect(table).toHaveAttribute('data-actions-disabled', 'false');
    expect(mockUseOperatorRoles).toHaveBeenCalledWith(MODERATOR);
    expect(screen.queryByTestId('moderation-read-only')).not.toBeInTheDocument();
    expect(screen.queryByTestId('moderation-no-role')).not.toBeInTheDocument();
  });

  it('switches Hide and Restore off, and says why, for a wallet with no operator role (regression)', () => {
    mockWallet = { account: MODERATOR, active: true };
    mockRoles = { status: 'ready', roles: [] };
    render(<AdminPage />);
    const table = screen.getByTestId('ban-gesture-table');
    expect(table).toHaveAttribute('data-actions-disabled', 'true');
    const notice = screen.getByTestId('moderation-no-role');
    expect(notice).toHaveTextContent('This wallet holds no on-chain operator role');
    // The buttons are described by the notice's sentence.
    const reasonId = table.getAttribute('data-reason');
    expect(reasonId).toBeTruthy();
    expect(document.getElementById(reasonId ?? '')).toHaveTextContent(/no on-chain operator role/);
  });

  it('holds the controls while the roles are read, without a notice', () => {
    mockWallet = { account: MODERATOR, active: true };
    mockRoles = { status: 'loading', roles: [] };
    render(<AdminPage />);
    expect(screen.getByTestId('ban-gesture-table')).toHaveAttribute(
      'data-actions-disabled',
      'true',
    );
    expect(screen.queryByTestId('moderation-no-role')).not.toBeInTheDocument();
  });

  it('leaves the controls live when the roles cannot be read', () => {
    mockWallet = { account: MODERATOR, active: true };
    mockRoles = { status: 'error', roles: [] };
    render(<AdminPage />);
    expect(screen.getByTestId('ban-gesture-table')).toHaveAttribute(
      'data-actions-disabled',
      'false',
    );
  });

  it('titles the list', () => {
    render(<AdminPage />);
    expect(screen.getByRole('region', { name: 'Gesture messages' })).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AdminPage />);
    await checkA11y(container);
  });
});
