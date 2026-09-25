import { ApiReadError } from '@/services/api/readError';
import { formatTimeZoneLabel } from '@/utils/format';

import { fireEvent, render, screen, within, checkA11y } from '@/test-utils';

import GesturePage, { clockExtension, gestureHold, gestureTrail } from '../[id]/GesturePage';
import type { GestureNeighbour } from '../[id]/gestureNeighbours';

const mockUseGestureInfo = jest.fn();
const mockUseDashboardInfo = jest.fn(
  (): { data?: { CurRoundNum: number; CurNumBids?: number }; isError?: boolean } => ({
    data: { CurRoundNum: 9 },
  }),
);
const mockUseRoundInfo = jest.fn(
  (_cycle: number): { data?: Record<string, unknown> | null; isPending: boolean } => ({
    data: undefined,
    isPending: true,
  }),
);
jest.mock('../../../../../hooks/useApiQuery', () => ({
  useGestureInfo: (...args: unknown[]) => mockUseGestureInfo(...args),
  useDashboardInfo: () => mockUseDashboardInfo(),
  useRoundInfo: (cycle: number) => mockUseRoundInfo(cycle),
}));

const neighbour = (
  id: number,
  position: number,
  timestamp: number | null = null,
  finalizationTime: number | null = null,
): GestureNeighbour => ({ id, position, timestamp, finalizationTime });

const mockNeighbours = jest.fn(() => ({
  previous: null as GestureNeighbour | null,
  next: null as GestureNeighbour | null,
  settled: false,
}));
jest.mock('../[id]/gestureNeighbours', () => ({
  useGestureNeighbours: () => mockNeighbours(),
}));

const mockNftMetadata = jest.fn(
  (): { isLoading: boolean; data: Record<string, string> | null | undefined } => ({
    isLoading: false,
    data: undefined,
  }),
);
jest.mock('../../../../../components/attachments/useAttachedNftMetadata', () => ({
  useAttachedNftMetadata: () => mockNftMetadata(),
}));

jest.mock('../../../../../components/nft/RandomWalkPlate', () => ({
  RandomWalkPlate: ({ tokenId, alt }: { tokenId: number; alt: string }) => (
    <div data-testid="rwlk-nft" data-alt={alt}>
      {tokenId}
    </div>
  ),
}));

jest.mock('../../../../../components/nft/NFTImage', () => ({
  __esModule: true,
  default: ({ src, alt = 'NFT' }: { src?: string; alt?: string }) => (
    <img data-testid="nft-image" src={src} alt={alt} />
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockNeighbours.mockReturnValue({ previous: null, next: null, settled: false });
  mockUseRoundInfo.mockReturnValue({ data: undefined, isPending: true });
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
  it('explains an invalid gesture id under the page’s one H1, with a way onward', () => {
    mockUseGestureInfo.mockReturnValue({ data: null, isLoading: false });
    render(<GesturePage gestureId={-1} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('gesture.invalid.title');
    expect(screen.getByText('gesture.invalid.help')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /gesture\.empty\.action/ })).toHaveAttribute(
      'href',
      '/current-cycle',
    );
  });

  it('shows the record’s rows as a skeleton while it loads', () => {
    mockUseGestureInfo.mockReturnValue({ data: undefined, isLoading: true });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    // D080: until the record names its place, the H1 names the record by its id.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'gesture.header.fallback(id=1)',
    );
  });

  it('says when no gesture was found, and where to go instead (D321)', () => {
    mockUseGestureInfo.mockReturnValue({ data: null, isLoading: false, isError: false });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByRole('heading', { name: 'gesture.empty.title' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /gesture\.empty\.action/ })).toHaveAttribute(
      'href',
      '/current-cycle',
    );
    expect(screen.queryByRole('heading', { name: 'gesture.error.title' })).not.toBeInTheDocument();
  });

  it('reads the API’s 400 "record not found" as a missing record, not a failed read (D321)', () => {
    // The production API answers an id it does not hold with 400 {"error":"record not found"}.
    const refetch = jest.fn();
    mockUseGestureInfo.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiReadError('Network response was not OK', 400),
      refetch,
    });
    render(<GesturePage gestureId={40000} />);
    expect(screen.getByRole('heading', { name: 'gesture.empty.title' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /gesture\.empty\.action/ })).toHaveAttribute(
      'href',
      '/current-cycle',
    );
    expect(screen.queryByRole('heading', { name: 'gesture.error.title' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /retry|try/i })).not.toBeInTheDocument();
  });

  it('tells a failed read apart from a missing record, and retries it (D321)', () => {
    const refetch = jest.fn();
    mockUseGestureInfo.mockReturnValue({ data: null, isLoading: false, isError: true, refetch });
    render(<GesturePage gestureId={1} />);
    expect(screen.getByRole('heading', { name: 'gesture.error.title' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'gesture.empty.title' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /retry|try/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('sets the record on the site’s content edge, holding only the record to its own width (D256)', () => {
    renderGesture();
    expect(screen.getByRole('heading', { level: 1 }).closest('.max-w-4xl')).toBeNull();
    // Wide enough for the transaction hash and its two buttons on one desktop line.
    expect(
      screen
        .getByRole('heading', { level: 2, name: 'gesture.sections.details.title' })
        .closest('.max-w-4xl'),
    ).not.toBeNull();
    // The message keeps the reading measure.
    expect(screen.getByTestId('gesture-message')).toHaveClass('max-w-3xl');
    expect(document.querySelector('.mx-auto.max-w-4xl, .mx-auto.max-w-3xl')).toBeNull();
  });

  it('names the gesture by its place in the cycle, never by its record id (F173)', () => {
    renderGesture({ BidPosition: 1141 }, 23514);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'gesture.header.title(position=1141)',
    );
    expect(screen.queryByText(/23514/)).not.toBeInTheDocument();
  });

  it('falls back to the record’s id without a position', () => {
    renderGesture({ BidPosition: undefined }, 29434);
    // An id, not a quantity: no digit grouping.
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'gesture.header.fallback(id=29434)',
    );
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
      ['nav.sections.records', '/site-map#records'],
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
      ['nav.sections.explore', '/statistics'],
      ['common.pageHeader.crumbs.cycle(cycle=5)', '/current-cycle'],
    ]);
    expect(screen.getByRole('link', { name: /gesture\.nav\.all/ })).toHaveAttribute(
      'href',
      '/current-cycle#gesture-history',
    );
    mockUseDashboardInfo.mockReturnValue({ data: { CurRoundNum: 9 } });
  });

  it('does not guess the cycle’s page before the dashboard says which cycle is live', () => {
    mockUseDashboardInfo.mockReturnValue({ data: undefined });
    renderGesture();
    const trail = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
    // Home and the Records section, but no cycle page yet.
    expect(
      within(trail)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/', '/site-map#records']);
    // Regression (V084): a live cycle's number never leads to its allocation record meanwhile.
    expect(
      screen.getAllByRole('link').filter((link) => link.getAttribute('href') === '/allocation/5'),
    ).toHaveLength(0);
    expect(screen.queryByRole('link', { name: /gesture\.nav\.all/ })).not.toBeInTheDocument();
    mockUseDashboardInfo.mockReturnValue({ data: { CurRoundNum: 9 } });
  });

  it('takes the cycle as finalized when the dashboard cannot be read', () => {
    mockUseDashboardInfo.mockReturnValueOnce({ data: undefined, isError: true });
    renderGesture();
    const trail = screen.getByRole('navigation', { name: 'common.accessibility.breadcrumb' });
    expect(
      within(trail).getByRole('link', { name: 'common.pageHeader.crumbs.cycle(cycle=5)' }),
    ).toHaveAttribute('href', '/allocation/5');
  });

  it('carries the cost exactly, the Participation CST and how long it held as header figures', () => {
    mockNeighbours.mockReturnValue({
      previous: null,
      next: neighbour(108, 8, baseGestureInfo.TimeStamp + 6768),
      settled: true,
    });
    const { container } = renderGesture();
    expect(figure(container, 'cost')).toHaveTextContent('0.10211');
    expect(figure(container, 'cost')).toHaveTextContent('ETH');
    expect(figure(container, 'participationCst')).toHaveTextContent('100');
    // Held until the next gesture, in the page's one grammar for elapsed times (V224, V239).
    expect(figure(container, 'held')?.querySelector('dd time')).toHaveTextContent('1h 52m 48s');
    // No bare cycle number as a headline figure: the trail and the cycle column name it.
    expect(figure(container, 'cycle')).toBeNull();
  });

  it('says a live cycle’s latest gesture is still holding', () => {
    mockUseDashboardInfo.mockReturnValue({ data: { CurRoundNum: 5, CurNumBids: 7 } });
    mockNeighbours.mockReturnValue({ previous: null, next: null, settled: true });
    const { container } = renderGesture();
    expect(figure(container, 'held')).toHaveTextContent('gesture.figures.heldLive');
    expect(screen.getByTestId('gesture-position')).toHaveTextContent(
      'gesture.rail.positionLive(position=7,total=7)',
    );
    // The Signature does not exist yet: the rail says when it will.
    expect(screen.getByText('gesture.rail.liveNote')).toBeInTheDocument();
    expect(screen.queryByTestId('gesture-cycle-signature')).not.toBeInTheDocument();
    mockUseDashboardInfo.mockReturnValue({ data: { CurRoundNum: 9 } });
  });

  it('sets a finalized cycle’s place and Signature beside the record', () => {
    mockUseRoundInfo.mockReturnValue({
      data: {
        TokenId: 24,
        TokenSeed: '5084a87375896c7103ba17b57264f20de35d9e6eb545314680ad5e074dfc33ad',
        TimeStamp: baseGestureInfo.TimeStamp + 90,
        RoundStats: { TotalBids: 1141 },
      },
      isPending: false,
    });
    mockNeighbours.mockReturnValue({ previous: null, next: null, settled: true });
    const { container } = renderGesture();
    expect(mockUseRoundInfo).toHaveBeenLastCalledWith(5);
    // The cycle's latest gesture held until the cycle finalized.
    expect(figure(container, 'held')?.querySelector('dd time')).toHaveTextContent('1m 30s');
    const rail = screen.getByRole('complementary', {
      name: 'common.pageHeader.crumbs.cycle(cycle=5)',
    });
    expect(within(rail).getByTestId('gesture-position')).toHaveTextContent(
      'gesture.rail.position(position=7,total=1,141)',
    );
    expect(within(rail).getByRole('link', { name: /gesture\.rail\.signature/ })).toHaveAttribute(
      'href',
      '/detail/24',
    );
    expect(within(rail).getByRole('link', { name: /gesture\.nav\.all/ })).toHaveAttribute(
      'href',
      '/allocation/5',
    );
  });

  it('says how far the gesture moved the finalization clock', () => {
    mockNeighbours.mockReturnValue({
      previous: neighbour(101, 6, null, baseGestureInfo.PrizeTime - 3672),
      next: null,
      settled: true,
    });
    renderGesture();
    expect(screen.getByTestId('clock-extension')).toHaveTextContent(
      'gesture.rows.clockExtended(duration=1h 01m 12s)',
    );
  });

  it('prices a CST gesture in CST, at two decimals like the Participation CST', () => {
    const { container } = renderGesture({
      GestureType: 2,
      GestureCostEth: -1e-18,
      EthPriceEth: -1e-18,
      CstPriceEth: 411.52783099128,
    });
    expect(figure(container, 'cost')).toHaveTextContent('411.53 CST');
    // The exact amount stays on hover.
    expect(figure(container, 'cost')?.querySelector('data')).toHaveAttribute(
      'title',
      expect.stringContaining('411.52783099128'),
    );
  });

  it('prints its times in UTC and names the zone, as every record does', () => {
    const { container } = renderGesture();
    // Instants, not durations ("PT…").
    const times = Array.from(container.querySelectorAll('time')).filter(
      (time) => !time.getAttribute('dateTime')?.startsWith('P'),
    );
    expect(times).toHaveLength(2);
    expect(times[0]).toHaveAttribute('dateTime', '2026-05-29T09:06:06.000Z');
    // The same text on the server and after hydration: it never rewrites itself.
    expect(times[0]).toHaveTextContent('May 29, 2026, 09:06:06');
    const zone = formatTimeZoneLabel('utc');
    for (const time of times) expect(time.textContent).toMatch(new RegExp(`\\s${zone}$`));
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
    // The explorer proof is the transaction row's, once (V239).
    const proofs = screen.getAllByRole('link', { name: /gesture\.header\.explorer/ });
    expect(proofs).toHaveLength(1);
    expect(proofs[0]).toHaveAttribute('href', expect.stringContaining(baseGestureInfo.TxHash));
    expect(proofs[0]).toHaveAttribute('target', '_blank');
  });

  it('lets the transaction hash be copied from its row (D080)', () => {
    renderGesture();
    const row = screen.getByText(baseGestureInfo.TxHash).closest('div') as HTMLElement;
    expect(within(row).getByRole('button', { name: 'gesture.rows.copyHash' })).toBeInTheDocument();
  });

  it('shows the attached ERC-20 when present', () => {
    renderGesture({
      DonatedERC20TokenAddr: '0x1111111111111111111111111111111111111111',
      DonatedERC20TokenAmountEth: 2000,
    });
    expect(screen.getByText('gesture.rows.erc20')).toBeInTheDocument();
    expect(screen.getByText('2,000')).toBeInTheDocument();
  });

  describe('attached NFT', () => {
    const attached = {
      NFTDonationTokenAddr: '0x2222222222222222222222222222222222222222',
      NFTDonationTokenId: 8489,
      NFTTokenURI: 'https://example.org/token/8489',
    };

    it('lists only the metadata the token URI names', () => {
      mockNftMetadata.mockReturnValue({
        isLoading: false,
        data: {
          image: 'https://example.org/8489.png',
          name: 'Rexy #8489',
          collection_name: 'Rexy',
        },
      });
      renderGesture(attached);

      expect(screen.getByTestId('nft-image')).toHaveAttribute(
        'src',
        'https://example.org/8489.png',
      );
      expect(screen.getByTestId('nft-image')).toHaveAttribute('alt', 'Rexy #8489');
      expect(screen.getByText('gesture.nftPreview.collectionName')).toBeInTheDocument();
      expect(screen.getByText('Rexy')).toBeInTheDocument();
      // No dash rows for fields the metadata does not carry.
      expect(screen.queryByText('gesture.nftPreview.artist')).not.toBeInTheDocument();
      expect(screen.queryByText('gesture.nftPreview.platform')).not.toBeInTheDocument();
    });

    it('holds a busy plate while the metadata loads, then the unavailable art when it fails', () => {
      mockNftMetadata.mockReturnValue({ isLoading: true, data: undefined });
      const { unmount } = renderGesture(attached);
      expect(screen.getByTestId('pending-plate')).toHaveAttribute('aria-busy', 'true');
      expect(screen.queryByTestId('nft-image')).not.toBeInTheDocument();
      unmount();

      mockNftMetadata.mockReturnValue({ isLoading: false, data: null });
      renderGesture(attached);
      expect(screen.getByTestId('nft-image')).not.toHaveAttribute('src');
      expect(screen.getByText('gesture.rows.nftId')).toBeInTheDocument();
      expect(screen.queryByText('gesture.nftPreview.collectionName')).not.toBeInTheDocument();
    });
  });

  it('steps to the previous and next gesture of the cycle', () => {
    mockNeighbours.mockReturnValue({
      previous: neighbour(101, 6),
      next: neighbour(108, 8),
      settled: true,
    });
    renderGesture();
    // Beside the title from `sm`, after the record on phones (one is hidden at each width).
    const [header, phone] = screen.getAllByRole('navigation', { name: 'gesture.nav.aria' });
    expect(header).toHaveClass('max-sm:hidden');
    expect(phone).toHaveClass('sm:hidden');
    const record = screen.getByRole('heading', {
      level: 2,
      name: 'gesture.sections.details.title',
    });
    expect(record.compareDocumentPosition(phone!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    for (const nav of [header!, phone!]) {
      expect(within(nav).getByRole('link', { name: /gesture\.nav\.previous/ })).toHaveAttribute(
        'href',
        '/gesture/101',
      );
      expect(within(nav).getByRole('link', { name: /gesture\.nav\.next/ })).toHaveAttribute(
        'href',
        '/gesture/108',
      );
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = renderGesture();
    await checkA11y(container);
  });
});

describe('gestureTrail', () => {
  const t = (key: string, values?: Record<string, string | number>) =>
    values ? `${key}(${JSON.stringify(values)})` : key;

  it('links the cycle only once the dashboard says whether it is live (V084)', () => {
    expect(gestureTrail(5, undefined, false, t)).toMatchObject({
      cycleState: 'unknown',
      cycleHref: null,
    });
    expect(gestureTrail(5, 5, false, t)).toMatchObject({
      cycleState: 'live',
      cycleHref: '/current-cycle#gesture-history',
    });
    expect(gestureTrail(5, 9, false, t)).toMatchObject({
      cycleState: 'finalized',
      cycleHref: '/allocation/5',
    });
    expect(gestureTrail(5, null, true, t)).toMatchObject({ cycleState: 'finalized' });
  });
});

describe('gestureHold', () => {
  const base = { timestamp: 1000, settled: true, cycleEnd: null } as const;

  it('holds until the next gesture', () => {
    expect(gestureHold({ ...base, next: neighbour(2, 2, 1600), cycleState: 'finalized' })).toEqual({
      state: 'known',
      seconds: 600,
    });
  });

  it('is still holding as the open cycle’s latest', () => {
    expect(gestureHold({ ...base, next: null, cycleState: 'live' })).toEqual({
      state: 'holding',
      since: 1000,
    });
  });

  it('holds until a finalized cycle ended, once its record is read', () => {
    expect(
      gestureHold({ ...base, next: null, cycleState: 'finalized', cycleEnd: undefined }),
    ).toEqual({ state: 'pending' });
    expect(gestureHold({ ...base, next: null, cycleState: 'finalized', cycleEnd: 1900 })).toEqual({
      state: 'known',
      seconds: 900,
    });
  });

  it('waits for the neighbours and the dashboard, and never guesses a missing time', () => {
    expect(gestureHold({ ...base, next: null, settled: false, cycleState: 'live' })).toEqual({
      state: 'pending',
    });
    expect(gestureHold({ ...base, next: null, cycleState: 'unknown' })).toEqual({
      state: 'pending',
    });
    expect(gestureHold({ ...base, timestamp: null, next: null, cycleState: 'live' })).toEqual({
      state: 'unknown',
    });
    expect(gestureHold({ ...base, next: neighbour(2, 2), cycleState: 'live' })).toEqual({
      state: 'unknown',
    });
  });
});

describe('clockExtension', () => {
  it('is the move from the finalization time the previous gesture left', () => {
    expect(clockExtension(5000, neighbour(1, 1, null, 1400))).toBe(3600);
  });

  it('is unknown for a cycle’s first gesture or a missing time', () => {
    expect(clockExtension(5000, null)).toBeNull();
    expect(clockExtension(null, neighbour(1, 1, null, 1400))).toBeNull();
    expect(clockExtension(5000, neighbour(1, 1))).toBeNull();
  });
});
