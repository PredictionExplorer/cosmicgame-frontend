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

jest.mock('../../../../../../hooks/useApiQuery', () => ({
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

jest.mock('../../../../../../components/anchoring/GlobalAnchorActionsTable', () => ({
  GlobalAnchorActionsTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="global-anchor-actions-table">{list.length} actions</div>
  ),
}));
jest.mock('../../../../../../components/anchoring/GlobalAnchoredTokensTable', () => ({
  GlobalAnchoredTokensTable: () => <div data-testid="global-anchored-tokens-table" />,
}));
jest.mock('../../../../../../components/tables/UniqueAnchorHoldersCSTTable', () => ({
  UniqueAnchorHoldersCSTTable: () => <div data-testid="unique-anchor-holders-cst-table" />,
}));
jest.mock('../../../../../../components/tables/UniqueAnchorHoldersRWLKTable', () => ({
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
  it('shows anchoring now as one strip of figures no collection tab repeats', () => {
    render(<AnchoringPanel />);
    expect(screen.getByRole('heading', { level: 2, name: 'Anchoring now' })).toBeInTheDocument();
    // The collection overviews below carry figures of their own.
    const strip = screen.getByRole('region', { name: 'Anchoring now' });
    const figures = [...strip.querySelectorAll('[data-figure]')].map((el) =>
      el.getAttribute('data-figure'),
    );
    expect(figures).toEqual(['pool', 'perNft', 'activeHolders']);
    // The per-collection anchored counts lead their own tab, not this strip.
    expect(screen.queryByText('Cosmic Signature NFTs anchored')).not.toBeInTheDocument();
    expect(screen.queryByText('Random Walk NFTs anchored')).not.toBeInTheDocument();
  });

  it('leads the strip with the pool and divides it by the anchored NFTs', () => {
    const { container } = render(<AnchoringPanel />);
    expect(container.querySelector('[data-figure="pool"]')).toHaveTextContent('2.5000');
    // 2.5 ETH over 11 anchored Cosmic Signature NFTs.
    expect(container.querySelector('[data-figure="perNft"]')).toHaveTextContent('0.2273');
  });

  it('counts a wallet anchoring both kinds once in Active Anchor-holders', () => {
    // Regression: the card summed the per-kind active counts (7 + 9 = 16) although five
    // wallets anchor both kinds, contradicting the hub.
    mockUseUniqueCSTAnchorHolders.mockReturnValue(
      okQuery([
        { StakerAddr: '0xAAA', TotalTokensStaked: 9 },
        { StakerAddr: '0xBBB', TotalTokensStaked: 3 },
      ]),
    );
    mockUseUniqueRWLKAnchorHolders.mockReturnValue(
      okQuery([
        { StakerAddr: '0xbbb', TotalTokensStaked: 14 },
        { StakerAddr: '0xCCC', TotalTokensStaked: 1 },
        { StakerAddr: '0xDDD', TotalTokensStaked: 0 },
      ]),
    );
    render(<AnchoringPanel />);

    const strip = screen.getByRole('region', { name: 'Anchoring now' });
    expect(strip.querySelector('[data-figure="activeHolders"] dd')).toHaveTextContent(/^3$/);
    // The per-kind counts below keep their own, per-kind label.
    // (The figure's label, and again as its term under Definitions.)
    expect(screen.getAllByText('Active Cosmic Signature NFT anchor-holders')[0]).toBeVisible();
  });

  it('explains how the pool relates to unretrieved distributions', () => {
    render(<AnchoringPanel />);
    expect(
      screen.getByText(/earlier deposits not yet retrieved show as Unretrieved/),
    ).toBeInTheDocument();
  });

  it('renders CST/RWLK anchoring tabs', () => {
    render(<AnchoringPanel />);
    expect(screen.getByRole('tab', { name: 'Cosmic Signature NFT' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Random Walk NFT' })).toBeInTheDocument();
  });

  it('passes anchor-action data through to the actions table', () => {
    render(<AnchoringPanel />);
    expect(screen.getByTestId('global-anchor-actions-table')).toHaveTextContent('1 actions');
  });

  it('holds the strip with skeletons while the dashboard loads', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    const { container } = render(<AnchoringPanel />);
    const strip = screen.getByRole('region', { name: 'Anchoring now' });
    for (const figure of strip.querySelectorAll('[data-figure]')) {
      expect(figure.querySelector('.animate-pulse')).toBeInTheDocument();
    }
    expect(container).not.toHaveTextContent('2.5000');
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
    expect(screen.getByRole('link', { name: /Anchor Distributions history/ })).toHaveAttribute(
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
    // heading-order included: the collection overviews are h3 under the page's h2s.
    await checkA11y(container);
  });
});
