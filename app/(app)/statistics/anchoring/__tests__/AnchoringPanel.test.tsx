import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import AnchoringPanel from '../AnchoringPanel';
import { createDashboardInfo } from '../../test-support/statisticsTestFixtures';

const mockUseDashboardInfo = jest.fn();
const mockUseCSTAnchorActions = jest.fn();
const mockUseRWLKAnchorActions = jest.fn();
const mockUseGlobalAnchoredCSTokens = jest.fn();
const mockUseGlobalAnchoredRWLKTokens = jest.fn();
const mockUseUniqueCSTAnchorHolders = jest.fn();
const mockUseUniqueRWLKAnchorHolders = jest.fn();

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useCSTAnchorActions: (...args: unknown[]) => mockUseCSTAnchorActions(...args),
  useRWLKAnchorActions: (...args: unknown[]) => mockUseRWLKAnchorActions(...args),
  useGlobalAnchoredCSTokens: (...args: unknown[]) => mockUseGlobalAnchoredCSTokens(...args),
  useGlobalAnchoredRWLKTokens: (...args: unknown[]) => mockUseGlobalAnchoredRWLKTokens(...args),
  useUniqueCSTAnchorHolders: (...args: unknown[]) => mockUseUniqueCSTAnchorHolders(...args),
  useUniqueRWLKAnchorHolders: (...args: unknown[]) => mockUseUniqueRWLKAnchorHolders(...args),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), prefetch: jest.fn() }),
}));

jest.mock('../../../../../components/anchoring/GlobalAnchorActionsTable', () => ({
  GlobalAnchorActionsTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="global-anchor-actions-table">{list.length} actions</div>
  ),
}));
jest.mock('../../../../../components/anchoring/GlobalAnchoredTokensTable', () => ({
  GlobalAnchoredTokensTable: () => <div data-testid="global-anchored-tokens-table" />,
}));
jest.mock('../../../../../components/tables/UniqueAnchorHoldersCSTTable', () => ({
  UniqueAnchorHoldersCSTTable: () => <div data-testid="unique-anchor-holders-cst-table" />,
}));
jest.mock('../../../../../components/tables/UniqueAnchorHoldersRWLKTable', () => ({
  UniqueAnchorHoldersRWLKTable: () => <div data-testid="unique-anchor-holders-rwlk-table" />,
}));

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDashboardInfo.mockReturnValue(okQuery(createDashboardInfo()));
  mockUseCSTAnchorActions.mockReturnValue(
    okQuery([{ ActionId: 1, ActionType: 0, TokenId: 7, StakerAddr: '0xabc', NumStakedNFTs: 1 }]),
  );
  mockUseRWLKAnchorActions.mockReturnValue(okQuery([]));
  mockUseGlobalAnchoredCSTokens.mockReturnValue(okQuery([]));
  mockUseGlobalAnchoredRWLKTokens.mockReturnValue(okQuery([]));
  mockUseUniqueCSTAnchorHolders.mockReturnValue(okQuery([]));
  mockUseUniqueRWLKAnchorHolders.mockReturnValue(okQuery([]));
});

describe('AnchoringPanel', () => {
  it('renders the anchoring snapshot stats from the dashboard', () => {
    render(<AnchoringPanel />);
    expect(screen.getByText('Cosmic Signature NFTs Anchored')).toBeInTheDocument();
    expect(screen.getAllByText('11').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('RandomWalk NFTs Anchored')).toBeInTheDocument();
    expect(screen.getAllByText('26').length).toBeGreaterThanOrEqual(1);
  });

  it('renders CST/RWLK anchoring tabs', () => {
    render(<AnchoringPanel />);
    expect(screen.getByRole('tab', { name: 'Cosmic Signature NFT' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'RandomWalk NFT' })).toBeInTheDocument();
  });

  it('passes anchor-action data through to the actions table', () => {
    render(<AnchoringPanel />);
    expect(screen.getByTestId('global-anchor-actions-table')).toHaveTextContent('1 actions');
  });

  it('shows skeleton stat cards while the dashboard loads', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    render(<AnchoringPanel />);
    expect(screen.getAllByRole('status', { name: 'Loading stat' }).length).toBeGreaterThan(0);
  });

  it('shows a section error with retry when anchor actions fail', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseCSTAnchorActions.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<AnchoringPanel />);
    expect(screen.getByText(/failed to load anchor \/ release actions/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('links to the full anchor history page', () => {
    render(<AnchoringPanel />);
    expect(screen.getByRole('link', { name: /view anchor history/i })).toHaveAttribute(
      'href',
      '/anchoring',
    );
  });

  it('requests the dashboard without polling', () => {
    render(<AnchoringPanel />);
    expect(mockUseDashboardInfo).toHaveBeenCalledWith(undefined, { poll: false });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AnchoringPanel />);
    await checkA11y(container);
  });
});
