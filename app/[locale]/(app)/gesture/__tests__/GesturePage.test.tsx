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

jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
}));

jest.mock('../../../../../utils', () => ({
  getExplorerUrl: (type: string, hash: string) => `https://explorer/${type}/${hash}`,
  convertTimestampToDateTime: (ts: number) => `date-${ts}`,
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

beforeEach(() => jest.clearAllMocks());

const baseGestureInfo = {
  TxHash: '0xABC',
  TimeStamp: 1000,
  BidderAddr: '0xBidder',
  RoundNum: 5,
  BidPosition: 7,
  GestureType: 0,
  GestureCostEth: 1.5,
  NumCSTTokensEth: 0,
  ERC20RewardAmountEth: 100,
  RWalkNFTId: -1,
  DonatedERC20TokenAddr: '',
  DonatedERC20TokenAmountEth: 0,
  NFTDonationTokenAddr: '',
  NFTDonationTokenId: -1,
  NFTTokenURI: '',
  Message: 'Hello World',
};

describe('GesturePage', () => {
  it('shows error for negative gesture id', () => {
    mockUseGestureInfo.mockReturnValue({ data: null, isLoading: false });
    render(<GesturePage gestureId={-1} />);
    expect(screen.getByText('gesture.invalid.title')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseGestureInfo.mockReturnValue({ data: null, isLoading: true });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows "no gesture information" when data is null', () => {
    mockUseGestureInfo.mockReturnValue({ data: null, isLoading: false });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('gesture.empty.title')).toBeInTheDocument();
  });

  it('names the gesture by its position in the H1, falling back to the generic title', () => {
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    const { unmount } = render(<GesturePage gestureId={1} />);
    expect(
      screen.getByRole('heading', { name: 'gesture.header.positionLabel(position=7)', level: 1 }),
    ).toBeInTheDocument();
    unmount();

    mockUseGestureInfo.mockReturnValue({
      data: { ...baseGestureInfo, BidPosition: undefined },
      isLoading: false,
    });
    render(<GesturePage gestureId={1} />);
    expect(
      screen.getByRole('heading', { name: 'gesture.header.title', level: 1 }),
    ).toBeInTheDocument();
  });

  it('shows the gesture position (bid_position) instead of the event-log id', () => {
    mockUseGestureInfo.mockReturnValue({
      data: { ...baseGestureInfo, BidPosition: 7 },
      isLoading: false,
    });
    render(<GesturePage gestureId={23514} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'gesture.header.positionLabel(position=7)',
    );
    expect(
      screen.queryByText('gesture.header.positionLabel(position=23514)'),
    ).not.toBeInTheDocument();
  });

  it('places a finalized cycle’s gesture under that cycle’s record', () => {
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    render(<GesturePage gestureId={1} />);
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
    mockUseDashboardInfo.mockReturnValueOnce({ data: { CurRoundNum: 5 } });
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    render(<GesturePage gestureId={1} />);
    const trail = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
    expect(
      within(trail)
        .getAllByRole('link')
        .map((link) => [link.textContent, link.getAttribute('href')]),
    ).toEqual([
      ['common.breadcrumbs.home', '/'],
      ['common.pageHeader.crumbs.cycle(cycle=5)', '/current-cycle'],
    ]);
  });

  it('does not guess the cycle’s page before the dashboard says which cycle is live', () => {
    mockUseDashboardInfo.mockReturnValueOnce({ data: undefined });
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    render(<GesturePage gestureId={1} />);
    const trail = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
    expect(within(trail).getAllByRole('link')).toHaveLength(1);
    expect(within(trail).queryByText('common.pageHeader.crumbs.cycle(cycle=5)')).toBeNull();
  });

  it('takes the cycle as finalized when the dashboard cannot be read', () => {
    mockUseDashboardInfo.mockReturnValueOnce({ data: undefined, isError: true });
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    render(<GesturePage gestureId={1} />);
    const trail = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
    expect(
      within(trail).getByRole('link', { name: 'common.pageHeader.crumbs.cycle(cycle=5)' }),
    ).toHaveAttribute('href', '/allocation/5');
  });

  it('renders participant address', () => {
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('0xBidder')).toBeInTheDocument();
  });

  it('renders round number', () => {
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByRole('link', { name: 'gesture.rows.cycleValue(round=5)' })).toHaveAttribute(
      'href',
      '/allocation/5',
    );
  });

  it('renders ETH gesture cost for GestureType !== 2', () => {
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('1.50 ETH')).toBeInTheDocument();
  });

  it('renders CST gesture cost for GestureType === 2', () => {
    mockUseGestureInfo.mockReturnValue({
      data: { ...baseGestureInfo, GestureType: 2, NumCSTTokensEth: 50 },
      isLoading: false,
    });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('50.0000 CST')).toBeInTheDocument();
  });

  it('renders live-shape CST cost and Participation CST for gesture 18482', () => {
    mockUseGestureInfo.mockReturnValue({
      data: {
        ...baseGestureInfo,
        GestureType: 2,
        CstCost: 411.52783099128,
        NumCSTokensEth: 411.52783099128,
        NumCSTTokensEth: 411.52783099128,
        CstPriceEth: 411.52783099128,
        ParticipationCST: 100,
        CSTRewardEth: 100,
        ERC20RewardAmountEth: 100,
      },
      isLoading: false,
    });

    render(<GesturePage gestureId={18482} />);

    const costSection = screen.getByRole('region', { name: 'gesture.sections.cost.title' });
    expect(within(costSection).getByText('411.5278 CST')).toBeInTheDocument();
    expect(within(costSection).getByText('gesture.rows.participationCst')).toBeInTheDocument();
    expect(within(costSection).getByText('100.00 CST')).toBeInTheDocument();
    expect(within(costSection).queryByText('0.00 CST')).not.toBeInTheDocument();
  });

  it('shows explicit missing values instead of fake zeroes', () => {
    mockUseGestureInfo.mockReturnValue({
      data: {
        ...baseGestureInfo,
        GestureType: 2,
        CstCost: undefined,
        NumCSTokensEth: undefined,
        NumCSTTokensEth: undefined,
        CstPriceEth: undefined,
        ParticipationCST: undefined,
        CSTRewardEth: undefined,
        ERC20RewardAmountEth: undefined,
      },
      isLoading: false,
    });

    render(<GesturePage gestureId={18482} />);

    const costSection = screen.getByRole('region', { name: 'gesture.sections.cost.title' });
    expect(within(costSection).getAllByText('—')).toHaveLength(2);
  });

  it('renders message', () => {
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('shows "No" for ETH + RandomWalk attachment when RWalkNFTId < 0', () => {
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('gesture.rows.attachedRandomWalk')).toBeInTheDocument();
    const noTexts = screen.getAllByText('gesture.values.no');
    expect(noTexts.length).toBeGreaterThanOrEqual(1);
  });

  it('shows RWLK NFT id when RWalkNFTId >= 0', () => {
    mockUseGestureInfo.mockReturnValue({
      data: { ...baseGestureInfo, RWalkNFTId: 42 },
      isLoading: false,
    });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('gesture.rows.randomWalkId')).toBeInTheDocument();
    const matches = screen.getAllByText('42');
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('shows attached ERC20 info when present', () => {
    mockUseGestureInfo.mockReturnValue({
      data: {
        ...baseGestureInfo,
        DonatedERC20TokenAddr: '0xToken',
        DonatedERC20TokenAmountEth: 10.5,
      },
      isLoading: false,
    });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByText('gesture.rows.erc20Address')).toBeInTheDocument();
    expect(screen.getByText('0xToken')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseGestureInfo.mockReturnValue({ data: baseGestureInfo, isLoading: false });
    const { container } = render(<GesturePage gestureId={1} />);
    await checkA11y(container);
  });
});
