import { render, screen, within, checkA11y } from '@/test-utils';

import GesturePage from '../[id]/GesturePage';

const mockUseGestureInfo = jest.fn();
const mockUseDashboardInfo = jest.fn((): { data?: { CurRoundNum: number }; isError?: boolean } => ({
  data: { CurRoundNum: 9 },
}));
jest.mock('../../../../../hooks/useApiQuery', () => ({
  useGestureInfo: (...args: unknown[]) => mockUseGestureInfo(...args),
  useDashboardInfo: () => mockUseDashboardInfo(),
}));

const mockNeighbours = jest.fn(() => ({
  previous: null as { id: number; position: number } | null,
  next: null as { id: number; position: number } | null,
}));
jest.mock('../[id]/gestureNeighbours', () => ({
  useGestureNeighbours: () => mockNeighbours(),
}));

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
}));

jest.mock('../../../../../components/nft/RandomWalkNFT', () => ({
  __esModule: true,
  default: ({ tokenId }: { tokenId: number }) => <div data-testid="rwlk-nft">{tokenId}</div>,
}));

jest.mock('../../../../../components/nft/NFTImage', () => ({
  __esModule: true,
  default: ({ src, alt = 'NFT' }: { src?: string; alt?: string }) => (
    <img data-testid="nft-image" src={src} alt={alt} />
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockNeighbours.mockReturnValue({ previous: null, next: null });
});

const baseGestureInfo = {
  TxHash: '0x45d7ecb96a242458dd991de97272332c0dc02fdac341af3a0cf549c4f30b0582',
  TimeStamp: 1_780_045_566,
  BidderAddr: '0x76Cd6127403163a2a74Aa4b6968579DC6435034e',
  RoundNum: 5,
  BidPosition: 7,
  GestureType: 0,
  GestureCostEth: 0.10211,
  NumCSTTokensEth: 0,
  ERC20RewardAmountEth: 100,
  RWalkNFTId: -1,
  PrizeTime: 1_780_049_166,
  DonatedERC20TokenAddr: '',
  DonatedERC20TokenAmountEth: 0,
  NFTDonationTokenAddr: '',
  NFTDonationTokenId: -1,
  NFTTokenURI: '',
  Message: 'Hello World',
};

function renderGesture(overrides: Record<string, unknown> = {}, gestureId = 1) {
  mockUseGestureInfo.mockReturnValue({
    data: { ...baseGestureInfo, ...overrides },
    isLoading: false,
  });
  return render(<GesturePage gestureId={gestureId} />);
}

const figure = (container: HTMLElement, id: string) =>
  container.querySelector(`[data-figure="${id}"]`);

describe('GesturePage', () => {
  it('explains an invalid gesture id', () => {
    mockUseGestureInfo.mockReturnValue({ data: null, isLoading: false });
    render(<GesturePage gestureId={-1} />);
    expect(screen.getByRole('heading', { name: 'gesture.invalid.title' })).toBeInTheDocument();
  });

  it('shows the record’s rows as a skeleton while it loads', () => {
    mockUseGestureInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('gesture.header.fallback');
  });

  it('says when no gesture was found', () => {
    mockUseGestureInfo.mockReturnValue({ data: null, isLoading: false });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByRole('heading', { name: 'gesture.empty.title' })).toBeInTheDocument();
  });

  it('names the gesture by its place in the cycle, never by its record id (F173)', () => {
    renderGesture({ BidPosition: 1141 }, 23514);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'gesture.header.title(position=1141)',
    );
    expect(screen.queryByText(/23514/)).not.toBeInTheDocument();
  });

  it('falls back to the generic title without a position', () => {
    renderGesture({ BidPosition: undefined });
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('gesture.header.fallback');
  });

  it('places a finalized cycle’s gesture under that cycle’s record', () => {
    renderGesture();
    const trail = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
    expect(
      within(trail)
        .getAllByRole('link')
        .map((link) => [link.textContent, link.getAttribute('href')]),
    ).toEqual([
      ['common.breadcrumbs.home', '/'],
      ['common.pageHeader.crumbs.allocationRecipients', '/allocation'],
      ['common.pageHeader.crumbs.cycle(cycle=5)', '/allocation/5'],
    ]);
  });

  it('places a live cycle’s gesture under the current cycle', () => {
    mockUseDashboardInfo.mockReturnValue({ data: { CurRoundNum: 5 } });
    renderGesture();
    const trail = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
    expect(
      within(trail)
        .getAllByRole('link')
        .map((link) => [link.textContent, link.getAttribute('href')]),
    ).toEqual([
      ['common.breadcrumbs.home', '/'],
      ['common.pageHeader.sections.explore', '/statistics'],
      ['common.pageHeader.crumbs.cycle(cycle=5)', '/current-cycle'],
    ]);
    expect(screen.getByRole('link', { name: /gesture\.nav\.all/ })).toHaveAttribute(
      'href',
      '/current-cycle#gesture-history',
    );
    mockUseDashboardInfo.mockReturnValue({ data: { CurRoundNum: 9 } });
  });

  it('does not guess the cycle’s page before the dashboard says which cycle is live', () => {
    mockUseDashboardInfo.mockReturnValueOnce({ data: undefined });
    renderGesture();
    const trail = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
    expect(within(trail).getAllByRole('link')).toHaveLength(1);
  });

  it('takes the cycle as finalized when the dashboard cannot be read', () => {
    mockUseDashboardInfo.mockReturnValueOnce({ data: undefined, isError: true });
    renderGesture();
    const trail = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
    expect(
      within(trail).getByRole('link', { name: 'common.pageHeader.crumbs.cycle(cycle=5)' }),
    ).toHaveAttribute('href', '/allocation/5');
  });

  it('carries the cost exactly, the Participation CST and the cycle as header figures', () => {
    const { container } = renderGesture();
    expect(figure(container, 'cost')).toHaveTextContent('0.10211');
    expect(figure(container, 'cost')).toHaveTextContent('ETH');
    expect(figure(container, 'participationCst')).toHaveTextContent('100');
    expect(within(figure(container, 'cycle') as HTMLElement).getByRole('link')).toHaveAttribute(
      'href',
      '/allocation/5',
    );
  });

  it('prices a CST gesture in CST', () => {
    const { container } = renderGesture({
      GestureType: 2,
      GestureCostEth: -1e-18,
      EthPriceEth: -1e-18,
      CstPriceEth: 411.52783099128,
    });
    expect(figure(container, 'cost')).toHaveTextContent('411.527831');
    expect(figure(container, 'cost')).toHaveTextContent('CST');
  });

  it('shows the method once, with the Random Walk NFT when one was used', () => {
    const { unmount } = renderGesture();
    expect(screen.getAllByTestId('gesture-method')[0]).toHaveTextContent('gesture.method.eth');
    expect(screen.queryByTestId('rwlk-nft')).not.toBeInTheDocument();
    unmount();

    renderGesture({ GestureType: 1, RWalkNFTId: 42 });
    expect(screen.getAllByTestId('gesture-method')[0]).toHaveTextContent(
      'gesture.method.ethRandomWalk',
    );
    expect(screen.getByText('#000042')).toBeInTheDocument();
    expect(screen.getByTestId('rwlk-nft')).toHaveTextContent('42');
    // No yes/no rows for the method.
    expect(screen.queryByText(/values\.(yes|no)/)).not.toBeInTheDocument();
  });

  it('quotes the message only when there is one', () => {
    const { unmount } = renderGesture();
    expect(screen.getByTestId('gesture-message')).toHaveTextContent('Hello World');
    unmount();

    renderGesture({ Message: '   ' });
    expect(screen.queryByTestId('gesture-message')).not.toBeInTheDocument();
    expect(screen.queryByText('gesture.sections.message.title')).not.toBeInTheDocument();
  });

  it('shows an unknown cost as unavailable instead of a fake zero', () => {
    const { container } = renderGesture({ GestureCostEth: undefined, EthPriceEth: undefined });
    expect(figure(container, 'cost')).toHaveTextContent('common.status.unavailable');
  });

  it('links the participant and the transaction proof', () => {
    renderGesture();
    expect(
      screen
        .getAllByRole('link')
        .some((link) =>
          link.getAttribute('href')?.includes('/user/0x76Cd6127403163a2a74Aa4b6968579DC6435034e'),
        ),
    ).toBe(true);
    expect(screen.getByRole('link', { name: /gesture\.header\.explorer/ })).toHaveAttribute(
      'href',
      expect.stringContaining(baseGestureInfo.TxHash),
    );
  });

  it('shows the attached ERC-20 when present', () => {
    renderGesture({
      DonatedERC20TokenAddr: '0x1111111111111111111111111111111111111111',
      DonatedERC20TokenAmountEth: 2000,
    });
    expect(screen.getByText('gesture.rows.erc20')).toBeInTheDocument();
    expect(screen.getByText('2,000')).toBeInTheDocument();
  });

  it('steps to the previous and next gesture of the cycle', () => {
    mockNeighbours.mockReturnValue({
      previous: { id: 101, position: 6 },
      next: { id: 108, position: 8 },
    });
    renderGesture();
    const nav = screen.getByRole('navigation', { name: 'gesture.nav.aria' });
    expect(within(nav).getByRole('link', { name: /gesture\.nav\.previous/ })).toHaveAttribute(
      'href',
      '/gesture/101',
    );
    expect(within(nav).getByRole('link', { name: /gesture\.nav\.next/ })).toHaveAttribute(
      'href',
      '/gesture/108',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = renderGesture();
    await checkA11y(container);
  });
});
