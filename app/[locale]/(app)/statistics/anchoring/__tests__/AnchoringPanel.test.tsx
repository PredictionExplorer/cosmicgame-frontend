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
  it('counts both collections in one strip, named as the hub names them', () => {
    render(<AnchoringPanel />);
    expect(screen.getByRole('heading', { level: 2, name: 'Anchoring now' })).toBeInTheDocument();
    const strip = screen.getByRole('region', { name: 'Anchoring now' });
    const figures = [...strip.querySelectorAll('[data-figure]')].map((el) =>
      el.getAttribute('data-figure'),
    );
    expect(figures).toEqual(['activeHolders', 'anchoredCosmicSignature', 'anchoredRandomWalk']);
    expect(strip.querySelector('[data-figure="anchoredCosmicSignature"] dt')).toHaveTextContent(
      'anchoring.flow.cosmicSignature.anchored.label',
    );
    expect(strip.querySelector('[data-figure="anchoredCosmicSignature"] dd')).toHaveTextContent(
      /^11$/,
    );
    expect(strip.querySelector('[data-figure="anchoredRandomWalk"] dd')).toHaveTextContent(/^26$/);
  });

  it('leaves the pool and the share per NFT to the hub, one link away', () => {
    const { container } = render(<AnchoringPanel />);
    expect(container.querySelector('[data-figure="pool"]')).toBeNull();
    expect(container.querySelector('[data-figure="perNft"]')).toBeNull();
    // One lede on the page: the section adds none of its own before the figures.
    const strip = screen.getByRole('region', { name: 'Anchoring now' });
    expect(strip.querySelector('p')).toBeNull();
  });

  it('never shows a confident zero when the dashboard failed', () => {
    mockUseDashboardInfo.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: jest.fn(),
    });
    render(<AnchoringPanel />);
    const strip = screen.getByRole('region', { name: 'Anchoring now' });
    expect(strip.querySelector('[data-figure="anchoredCosmicSignature"] dd')).toHaveTextContent(
      /^—.*unavailable$/i,
    );
    const overview = screen.getByRole('tabpanel', { name: 'Cosmic Signature NFT' });
    expect(overview.querySelector('dl')).not.toHaveTextContent(/\d/);
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
    // A non-breaking hyphen keeps the coined term on one line when the label wraps.
    expect(screen.getAllByText('Active Cosmic Signature NFT anchor\u2011holders')[0]).toBeVisible();
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
    render(<AnchoringPanel />);
    const strip = screen.getByRole('region', { name: 'Anchoring now' });
    for (const id of ['anchoredCosmicSignature', 'anchoredRandomWalk']) {
      expect(
        strip.querySelector(`[data-figure="${id}"] [data-slot="skeleton"]`),
      ).toBeInTheDocument();
    }
    // The collection overviews below wait too, instead of reading 0.
    const overview = screen.getByRole('tabpanel', { name: 'Cosmic Signature NFT' });
    expect(overview.querySelector('dl [data-slot="skeleton"]')).toBeInTheDocument();
    expect(overview.querySelector('dl')).not.toHaveTextContent(/\d/);
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
    expect(screen.getByText('This section did not load')).toBeInTheDocument();

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
