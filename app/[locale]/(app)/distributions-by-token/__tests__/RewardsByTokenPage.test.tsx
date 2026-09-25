import userEvent from '@testing-library/user-event';

import type { AnchorAction } from '@/services/api/types';

import { checkA11y, render, screen, within } from '@/test-utils';

import RewardsByTokenPage, {
  depositsFromDetails,
  tokenAnchorState,
} from '../[address]/[tokenId]/RewardsByTokenPage';

const mockDetails = jest.fn();
const mockCstInfo = jest.fn();
const mockActions = jest.fn();
const mockDashboard = jest.fn();

jest.mock('@/hooks/useApiQuery', () => ({
  useAnchorDistributionsByUserByTokenDetails: (address: string, tokenId: number) =>
    mockDetails(address, tokenId),
  useCSTAnchorActionsByUser: (address: string) => mockActions(address),
  useCSTInfo: (tokenId: number | null) => mockCstInfo(tokenId),
  useDashboardInfo: () => mockDashboard(),
}));

const HOLDER = '0xA169574D0d353E3010997A3E64846b7D1B2a63B6';

const deposit = (overrides = {}) => ({
  DepositId: 18,
  DepositTimeStamp: 1_786_491_506,
  RoundNum: 1,
  RewardEth: 0.1562,
  Claimed: false,
  ...overrides,
});

const action = (overrides: Partial<AnchorAction> = {}): AnchorAction => ({
  EvtLogId: 18890,
  BlockNum: 1,
  TxId: 1,
  DateTime: '',
  TxHash: '0xanchor',
  TimeStamp: 1_781_506_867,
  ActionId: 1,
  ActionType: 0,
  TokenId: 0,
  TokenAddr: '0x0',
  NumStakedNFTs: 1,
  StakerAddr: HOLDER,
  ...overrides,
});

const details = (...rows: unknown[]) =>
  Object.fromEntries(rows.map((row, index) => [String(index), row]));

const ok = (data: unknown) => ({ data, isLoading: false, isError: false, refetch: jest.fn() });

beforeEach(() => {
  jest.clearAllMocks();
  mockCstInfo.mockReturnValue({ data: { TokenId: 0, Seed: 'abc', RoundNum: 0 }, isLoading: false });
  mockDetails.mockReturnValue(
    ok(details(deposit(), deposit({ DepositId: 19, RoundNum: 2, RewardEth: 0.25, Claimed: true }))),
  );
  mockActions.mockReturnValue(ok([action(), action({ ActionId: 2, TokenId: 7 })]));
  mockDashboard.mockReturnValue({
    data: {
      CurRoundNum: 3,
      StakingAmountEth: 2,
      MainStats: { StakeStatisticsCST: { TotalTokensStaked: 4 } },
    },
    isLoading: false,
  });
});

/** The figure with the given id, beside the plate. */
const figure = (id: string) => document.querySelector(`[data-figure="${id}"]`);

describe('depositsFromDetails', () => {
  it('reads the numbered deposits of the payload and skips everything else', () => {
    expect(depositsFromDetails({ '0': deposit(), '1': null, TokenId: 0 })).toHaveLength(1);
    expect(depositsFromDetails(null)).toEqual([]);
  });
});

describe('tokenAnchorState', () => {
  it('finds the NFT’s one anchor and its release among the holder’s actions', () => {
    const actions = [
      action({ ActionId: 5, TokenId: 3 }),
      action({ ActionId: 6, TokenId: 4 }),
      action({ ActionId: 5, TokenId: 3, ActionType: 1, TimeStamp: 1_790_000_000 }),
    ];
    expect(tokenAnchorState(actions, 3)).toMatchObject({
      anchor: { ActionId: 5, ActionType: 0 },
      release: { ActionId: 5, ActionType: 1 },
    });
    expect(tokenAnchorState(actions, 4)).toMatchObject({ release: null });
    expect(tokenAnchorState(actions, 9)).toEqual({ anchor: null, release: null });
  });
});

describe('RewardsByTokenPage', () => {
  it('sits under the Anchor Distributions records, by anchor-holder', () => {
    render(<RewardsByTokenPage address={HOLDER} tokenId={0} />);
    const trail = screen.getByRole('navigation', { name: /breadcrumb/i });
    expect(within(trail).getByRole('link', { name: 'anchoring.overview.title' })).toHaveAttribute(
      'href',
      '/anchoring',
    );
    expect(within(trail).getByRole('link', { name: /0xA169/ })).toHaveAttribute(
      'href',
      `/user/${HOLDER}`,
    );
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'anchoring.distributionsByToken.title(id=#000000)',
      }),
    ).toBeInTheDocument();
  });

  it('sets the totals beside the artwork, and what the NFT would receive now', () => {
    render(<RewardsByTokenPage address={HOLDER} tokenId={0} />);
    expect(screen.getByTestId('art-frame')).toBeInTheDocument();
    // 0.1562 + 0.25 distributed; 0.1562 still unretrieved.
    expect(figure('distributed')).toHaveTextContent('0.4062');
    expect(figure('unretrieved')).toHaveTextContent('0.1562');
    expect(figure('unretrieved')).toHaveTextContent(
      'anchoring.distributionsByToken.figures.unretrievedCaption',
    );
    // Still anchored: the pool (2 ETH) over the 4 anchored NFTs.
    expect(figure('perNft')).toHaveTextContent('0.5');
  });

  it('says once where the anchor stands, instead of on every deposit row', () => {
    render(<RewardsByTokenPage address={HOLDER} tokenId={0} />);
    expect(
      screen.getByText('anchoring.anchorActionDetail.timeline.stillAnchored'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'anchoring.anchorActionDetail.breadcrumbs.action(id=1)' }),
    ).toHaveAttribute('href', '/anchor-action/0/1');
    expect(document.querySelectorAll('a[href*="0xanchor"]')).toHaveLength(1);
    // No per-row expansion repeating the same anchor.
    expect(screen.queryByRole('button', { name: /details\.show/ })).toBeNull();
  });

  it('shows a release and what it retrieved, and no estimate for a released NFT', () => {
    mockActions.mockReturnValue(
      ok([
        action(),
        action({
          ActionType: 1,
          TxHash: '0xrelease',
          TimeStamp: 1_790_000_000,
          RewardAmountEth: 0.4062,
        }),
      ]),
    );
    render(<RewardsByTokenPage address={HOLDER} tokenId={0} />);
    expect(screen.getByText('anchoring.status.released')).toBeInTheDocument();
    expect(document.querySelector('a[href*="0xrelease"]')).toBeInTheDocument();
    expect(
      screen.getByText('anchoring.distributionsByToken.details.distribution'),
    ).toBeInTheDocument();
    expect(figure('perNft')).toBeNull();
  });

  it('says so when this address never anchored the NFT', () => {
    mockActions.mockReturnValue(ok([action({ TokenId: 7 })]));
    render(<RewardsByTokenPage address={HOLDER} tokenId={0} />);
    expect(
      screen.getByText('anchoring.distributionsByToken.anchor.notAnchored'),
    ).toBeInTheDocument();
  });

  it('shows an unread anchor as unknown, never as "not anchored"', () => {
    mockActions.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    render(<RewardsByTokenPage address={HOLDER} tokenId={0} />);
    expect(screen.queryByText('anchoring.distributionsByToken.anchor.notAnchored')).toBeNull();
    expect(screen.getByText('anchoring.flow.unavailable')).toBeInTheDocument();
  });

  it('names each deposit’s cycle as "Cycle N", leading to its record', () => {
    render(<RewardsByTokenPage address={HOLDER} tokenId={0} />);
    expect(screen.getByRole('link', { name: 'tables.allocation.cycle(cycle=2)' })).toHaveAttribute(
      'href',
      '/allocation/2',
    );
  });

  it('names an unnamed token once in its wall label, a named one with its number', () => {
    const { unmount } = render(<RewardsByTokenPage address={HOLDER} tokenId={45} />);
    // The title already reads "Cosmic Signature #000045": the number is not repeated.
    expect(screen.getAllByText('anchoring.art.signatureTitle(id=#000045)').length).toBeGreaterThan(
      0,
    );
    expect(screen.queryByText('#000045')).toBeNull();
    unmount();
    mockCstInfo.mockReturnValue({
      data: { TokenId: 45, Seed: 'abc', RoundNum: 1, TokenName: 'Aurora' },
      isLoading: false,
    });
    render(<RewardsByTokenPage address={HOLDER} tokenId={45} />);
    expect(screen.getByText('#000045')).toBeInTheDocument();
  });

  it('keeps its figures with no deposit yet, and leads to the anchor action', () => {
    mockDetails.mockReturnValue(ok({}));
    render(<RewardsByTokenPage address={HOLDER} tokenId={0} />);
    expect(figure('deposits')).toHaveTextContent('0');
    expect(figure('perNft')).toHaveTextContent('0.5');
    expect(
      screen.getByRole('heading', { name: 'anchoring.distributionsByToken.empty.title' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'anchoring.distributionsByToken.empty.viewAction(id=1)' }),
    ).toHaveAttribute('href', '/anchor-action/0/1');
  });

  it('offers a retry when the record cannot be read', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockDetails.mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch });
    render(<RewardsByTokenPage address={HOLDER} tokenId={0} />);
    expect(screen.getByText('anchoring.distributionsByToken.error')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RewardsByTokenPage address={HOLDER} tokenId={0} />);
    await checkA11y(container);
  });
});
