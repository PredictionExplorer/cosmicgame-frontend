import { getLocale } from 'next-intl/server';

import { protocolFacts } from '@/content/protocol-facts';
import seoMessages from '@/messages/en/seo.json';
import statisticsMessages from '@/messages/en/statistics.json';
import zhSeoMessages from '@/messages/zh/seo.json';

import { HomeObservatoryHero } from '@/components/home/HomeObservatoryHero';
import { useDashboardInfo } from '@/hooks/useApiQuery';

import { render, screen, within } from '@/test-utils';

import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';
import { CodeRepositories } from '../code/CodeRepositories';
import { CodeSeoSummary } from '../code/CodeSeoSummary';
import { ContractsSeoSummary } from '../contracts/ContractsSeoSummary';
import { CurrentCycleSeoSummary } from '../current-cycle/CurrentCycleSeoSummary';
import { GalleryAbout } from '../gallery/GalleryAbout';
import { GallerySeoSummary } from '../gallery/GallerySeoSummary';
import { StatisticsSeoSummary } from '../statistics/StatisticsSeoSummary';
// lexicon-allow-start: test imports mirror sealed API module filenames.
import {
  get_claim_history,
  get_dashboard_info,
  get_round_list,
} from '../../../../services/api/rounds';
import { get_marketing_rewards } from '../../../../services/api/marketing';
import {
  get_staking_cst_actions,
  get_staking_cst_rewards,
  get_staking_rwalk_actions,
  get_staking_rwalk_mints_global,
} from '../../../../services/api/anchoring';
import {
  get_charity_cg_deposits,
  get_charity_withdrawals,
  get_donations_both,
  get_donations_nft_list,
} from '../../../../services/api/donations';
import { get_system_events, get_system_modelist } from '../../../../services/api/system';
import { get_named_nfts, get_used_rwlk_nfts } from '../../../../services/api/tokens';
// lexicon-allow-end
import { networkConfig } from '../../../../config/networks';

// lexicon-allow-start: test mocks mirror sealed API module filenames.
jest.mock('../../../../services/api/rounds', () => ({
  get_dashboard_info: jest.fn(),
  get_round_list: jest.fn(() => Promise.resolve([])),
  get_claim_history: jest.fn(() => Promise.resolve([])),
}));
jest.mock('../../../../services/api/anchoring', () => ({
  get_staking_cst_actions: jest.fn(),
  get_staking_cst_rewards: jest.fn(() => Promise.resolve([])),
  get_staking_rwalk_actions: jest.fn(),
  get_staking_rwalk_mints_global: jest.fn(() => Promise.resolve([])),
}));
jest.mock('../../../../services/api/donations', () => ({
  get_charity_cg_deposits: jest.fn(() => Promise.resolve([])),
  get_charity_voluntary: jest.fn(() => Promise.resolve([])),
  get_charity_withdrawals: jest.fn(() => Promise.resolve([])),
  get_donations_both: jest.fn(),
  get_donations_nft_list: jest.fn(),
}));
jest.mock('../../../../services/api/marketing', () => ({
  get_marketing_rewards: jest.fn(),
}));
jest.mock('../../../../services/api/system', () => ({
  COORDINATION_EVENTS_END_ID: 9_999_999_999,
  coordinationStartId: jest.requireActual('../../../../services/api/system').coordinationStartId,
  get_system_modelist: jest.fn(() => Promise.resolve([])),
  get_system_events: jest.fn(() => Promise.resolve([])),
}));
jest.mock('../../../../services/api/tokens', () => ({
  get_named_nfts: jest.fn(),
  get_used_rwlk_nfts: jest.fn(),
}));
// lexicon-allow-end
jest.mock('@/hooks/useApiQuery', () => ({
  useDashboardInfo: jest.fn(),
}));

const mockGetDashboardInfo = get_dashboard_info as jest.MockedFunction<typeof get_dashboard_info>;
const mockUseDashboardInfo = useDashboardInfo as jest.MockedFunction<typeof useDashboardInfo>;
const mockGetLocale = getLocale as jest.MockedFunction<typeof getLocale>;
const mockGetRoundList = get_round_list as jest.MockedFunction<typeof get_round_list>;
const mockGetClaimHistory = get_claim_history as jest.MockedFunction<typeof get_claim_history>;
const mockMarketingRewards = get_marketing_rewards as jest.MockedFunction<
  typeof get_marketing_rewards
>;
const mockCstActions = get_staking_cst_actions as jest.MockedFunction<
  typeof get_staking_cst_actions
>;
const mockRwalkActions = get_staking_rwalk_actions as jest.MockedFunction<
  typeof get_staking_rwalk_actions
>;
const mockCstRewards = get_staking_cst_rewards as jest.MockedFunction<
  typeof get_staking_cst_rewards
>;
const mockRwalkImprints = get_staking_rwalk_mints_global as jest.MockedFunction<
  typeof get_staking_rwalk_mints_global
>;
const mockDirectContributions = get_donations_both as jest.MockedFunction<
  typeof get_donations_both
>;
const mockPublicGoodsDeposits = get_charity_cg_deposits as jest.MockedFunction<
  typeof get_charity_cg_deposits
>;
const mockPublicGoodsRetrievals = get_charity_withdrawals as jest.MockedFunction<
  typeof get_charity_withdrawals
>;
const mockSystemModes = get_system_modelist as jest.MockedFunction<typeof get_system_modelist>;
const mockSystemEvents = get_system_events as jest.MockedFunction<typeof get_system_events>;
const mockAttachedNfts = get_donations_nft_list as jest.MockedFunction<
  typeof get_donations_nft_list
>;
const mockNamedNfts = get_named_nfts as jest.MockedFunction<typeof get_named_nfts>;
const mockUsedRwlkNfts = get_used_rwlk_nfts as jest.MockedFunction<typeof get_used_rwlk_nfts>;

const dashboard = {
  CurRoundNum: 42,
  CurNumBids: 17,
  PrizeAmountEth: 5.5,
  CurPrizeAmountEth: 5.5,
  CosmicGameBalanceEth: 12.34,
  CgPrizeRowCount: 107,
  TsRoundStart: 1_786_000_000,
  MainStats: {
    NumCSTokenMints: 240,
    TotalNamedTokens: 3,
    StakeStatisticsCST: { TotalTokensStaked: 22 },
  },
  ContractAddrs: {
    CosmicGameAddr: '0x1111111111111111111111111111111111111111',
    CosmicTokenAddr: '0x2222222222222222222222222222222222222222',
    CosmicSignatureAddr: '0x3333333333333333333333333333333333333333',
    RandomWalkAddr: '0x4444444444444444444444444444444444444444',
    CosmicDaoAddr: '0x5555555555555555555555555555555555555555',
    CharityWalletAddr: '0x6666666666666666666666666666666666666666',
    MarketingWalletAddr: '0x7777777777777777777777777777777777777777',
    PrizesWalletAddr: '0x8888888888888888888888888888888888888888',
    StakingWalletCSTAddr: '0x9999999999999999999999999999999999999999',
    StakingWalletRWalkAddr: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    MarketplaceAddr: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
    ImplementationAddr: '0x7739148013777c485AD9f3d971e1005Eca686661',
  },
};

/** Wallet addresses for list rows; the summaries count only real addresses. */
const WALLET_A = `0x${'a1'.repeat(20)}`;
const WALLET_B = `0x${'b2'.repeat(20)}`;
const WALLET_C = `0x${'c3'.repeat(20)}`;
const WALLET_E = `0x${'e4'.repeat(20)}`;
/** The recipient production records on Anchor Distribution (type 15) rows: not a wallet. */
const ANCHOR_DISTRIBUTION_RECIPIENT = '(All CS NFT Stakers)'; // lexicon-allow-backend-type

type Rows<F extends (...args: never[]) => unknown> = Awaited<ReturnType<F>>;

/**
 * PageHeader renders its shared chrome strings from the `common` catalog, which the
 * next-intl test mock answers with message keys.
 */
const COMMON = {
  section: (id: string) => `common.pageHeader.sections.${id}`,
  unavailable: 'common.status.unavailable',
  snapshot: /^common\.pageHeader\.snapshot\(date=/,
};

/** The rendered value of the header figure with the given id. */
const figureValue = (id: string) => {
  const figure = document.querySelector(`[data-figure="${id}"] dd`);
  if (!figure) throw new Error(`no header figure ${id}`);
  return figure;
};

describe('server-rendered page headers', () => {
  beforeEach(() => {
    mockGetLocale.mockResolvedValue('en');
    mockGetRoundList.mockResolvedValue([]);
    mockGetClaimHistory.mockResolvedValue([]);
    mockGetDashboardInfo.mockResolvedValue(
      dashboard as unknown as Awaited<ReturnType<typeof get_dashboard_info>>,
    );
    mockUseDashboardInfo.mockReturnValue({
      data: dashboard,
      isLoading: false,
    } as unknown as ReturnType<typeof useDashboardInfo>);
    mockMarketingRewards.mockResolvedValue([{ MarketerAddr: WALLET_A }] as Rows<
      typeof get_marketing_rewards
    >);
    mockCstActions.mockResolvedValue([{}] as Rows<typeof get_staking_cst_actions>);
    mockRwalkActions.mockResolvedValue([{}] as Rows<typeof get_staking_rwalk_actions>);
    mockDirectContributions.mockResolvedValue([{ AmountEth: 1, DonorAddr: WALLET_A }] as Rows<
      typeof get_donations_both
    >);
    mockCstRewards.mockResolvedValue([]);
    mockRwalkImprints.mockResolvedValue([]);
    mockPublicGoodsDeposits.mockResolvedValue([]);
    mockPublicGoodsRetrievals.mockResolvedValue([]);
    mockSystemModes.mockResolvedValue([]);
    mockSystemEvents.mockResolvedValue([]);
    mockAttachedNfts.mockResolvedValue([{ TokenAddr: WALLET_A, DonorAddr: WALLET_B }] as Rows<
      typeof get_donations_nft_list
    >);
    mockNamedNfts.mockResolvedValue([{ TokenId: 1, CurOwnerAddr: WALLET_A }] as Rows<
      typeof get_named_nfts
    >);
    mockUsedRwlkNfts.mockResolvedValue([{ BidderAddr: WALLET_A }] as Rows<
      typeof get_used_rwlk_nfts
    >);
  });

  it('renders the app home H1 and crawlable app links in the live hero', () => {
    render(
      <HomeObservatoryHero
        data={dashboard as unknown as Parameters<typeof HomeObservatoryHero>[0]['data']}
        bannerToken={{ seed: '0xabc123', id: 17 }}
        canOpenGesturePanel
        phase="live"
      />,
    );

    expect(screen.getByRole('region', { name: 'home.hero.phase.live.headline' })).toHaveAttribute(
      'aria-labelledby',
      'home-observatory-title',
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'home.hero.phase.live.headline' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home\.hero\.phase\.live\.cta/ })).toHaveAttribute(
      'href',
      '#make-gesture',
    );
    expect(screen.getByText('17')).toBeInTheDocument();
  });

  describe('statistics hub', () => {
    it('renders one H1, the Explore eyebrow and one live figure row', async () => {
      render(await StatisticsSeoSummary());

      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
      expect(
        screen.getByRole('heading', { level: 1, name: statisticsMessages.hub.seo.heading }),
      ).toBeInTheDocument();
      // The hub names its section without linking to itself.
      expect(screen.getByText(COMMON.section('explore'))).not.toHaveAttribute('href');
      expect(figureValue('activePerformanceCycle')).toHaveTextContent('42');
      // The gestures caption sits under the cycle figure.
      expect(document.querySelectorAll('[data-figure="activePerformanceCycle"] dd')).toHaveLength(
        2,
      );
      expect(figureValue('allocationsDistributed')).toHaveTextContent('107');
      expect(figureValue('cosmicSignatureNftsImprinted')).toHaveTextContent('240');
      expect(figureValue('contractBalance')).toHaveTextContent('12.3400 ETH');
      // The related pages close the hub body, so the section tabs follow the figures.
      expect(
        screen.queryByRole('link', { name: statisticsMessages.hub.seo.links.contracts }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('button', {
          name: `More information about ${statisticsMessages.metrics.activePerformanceCycle.label}`,
        }),
      ).toBeInTheDocument();
    });

    it('shows live freshness instead of a server render time', async () => {
      render(await StatisticsSeoSummary());
      expect(screen.queryByText(/Last updated/)).not.toBeInTheDocument();
      expect(document.querySelector('[data-live-state]')).toBeInTheDocument();
    });

    it('renders the server read before the first client read', async () => {
      mockUseDashboardInfo.mockReturnValue({
        data: undefined,
        isLoading: true,
      } as unknown as ReturnType<typeof useDashboardInfo>);
      render(await StatisticsSeoSummary());
      expect(figureValue('activePerformanceCycle')).toHaveTextContent('42');
      expect(figureValue('contractBalance')).toHaveTextContent('12.3400 ETH');
    });

    it('renders a figure the dashboard lacks as unavailable, never as zero', async () => {
      const withoutBalance = { ...dashboard, CosmicGameBalanceEth: undefined };
      mockGetDashboardInfo.mockResolvedValue(
        withoutBalance as unknown as Awaited<ReturnType<typeof get_dashboard_info>>,
      );
      mockUseDashboardInfo.mockReturnValue({
        data: undefined,
        isLoading: true,
      } as unknown as ReturnType<typeof useDashboardInfo>);
      render(await StatisticsSeoSummary());
      expect(figureValue('contractBalance')).toHaveTextContent(COMMON.unavailable);
      expect(figureValue('contractBalance')).not.toHaveTextContent(/\d/);
    });

    it('waits for the client read when the server read failed', async () => {
      mockGetDashboardInfo.mockRejectedValue(new Error('offline'));
      mockUseDashboardInfo.mockReturnValue({
        data: undefined,
        isLoading: true,
      } as unknown as ReturnType<typeof useDashboardInfo>);
      render(await StatisticsSeoSummary());
      expect(figureValue('contractBalance')).not.toHaveTextContent(COMMON.unavailable);
      expect(figureValue('contractBalance')).not.toHaveTextContent(/\d/);
    });

    it('says unavailable once neither read has the figure', async () => {
      mockGetDashboardInfo.mockRejectedValue(new Error('offline'));
      mockUseDashboardInfo.mockReturnValue({
        data: undefined,
        isLoading: false,
      } as unknown as ReturnType<typeof useDashboardInfo>);
      render(await StatisticsSeoSummary());
      expect(figureValue('contractBalance')).toHaveTextContent(COMMON.unavailable);
    });
  });

  describe('contracts', () => {
    it('renders the header without repeating the body’s address list', async () => {
      render(await ContractsSeoSummary());

      expect(
        screen.getByRole('heading', { level: 1, name: 'Cosmic Signature contracts' }),
      ).toBeInTheDocument();
      expect(screen.getByText(`Chain ${networkConfig.chainId}`)).toBeInTheDocument();
      // The address grid in the page body lists every contract (with verified fallbacks).
      expect(
        screen.queryByText('0x1111111111111111111111111111111111111111'),
      ).not.toBeInTheDocument();
      expect(screen.getByRole('link', { name: COMMON.section('trust') })).toHaveAttribute(
        'href',
        '/security',
      );
    });

    it('says when the addresses come from the verified fallback', async () => {
      mockGetDashboardInfo.mockRejectedValue(new Error('offline'));
      render(await ContractsSeoSummary());
      expect(screen.getByText(/static fallback/)).toBeInTheDocument();
    });
  });

  it('renders the code header and the crawlable repository index', async () => {
    render(
      <>
        {await CodeSeoSummary()}
        <CodeRepositories />
      </>,
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Cosmic Signature source code' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Project repositories' }),
    ).toBeInTheDocument();
  });

  it('renders the gallery header with the collection figures', async () => {
    render(await GallerySeoSummary());
    expect(
      screen.getByRole('heading', { level: 1, name: 'Cosmic Signature Gallery' }),
    ).toBeInTheDocument();
    expect(figureValue('imprinted')).toHaveTextContent('240');
    expect(figureValue('anchored')).toHaveTextContent('22');
    expect(figureValue('named')).toHaveTextContent('3');
    expect(screen.getByText(COMMON.snapshot)).toBeInTheDocument();
    // The header stays short so the art reaches the first screen: its related
    // pages sit in "About the collection" after the wall.
    expect(
      screen.queryByRole('navigation', { name: seoMessages.gallerySummary.relatedAria }),
    ).not.toBeInTheDocument();
  });

  it('renders the gallery’s closing section with the pages to read next', async () => {
    render(await GalleryAbout({ locale: 'en' }));
    expect(screen.getByRole('region')).toHaveAccessibleName(
      screen.getByRole('heading', { level: 2 }).textContent ?? '',
    );
    const related = screen.getByRole('navigation', {
      name: seoMessages.gallerySummary.relatedAria,
    });
    expect(
      within(related)
        .getAllByRole('link')
        .map((link) => link.getAttribute('href')),
    ).toEqual(['/how-it-works', '/code', '/statistics']);
  });

  it('renders the current-cycle header with live cycle figures', async () => {
    render(await CurrentCycleSeoSummary());
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Current Cosmic Signature Performance Cycle',
      }),
    ).toBeInTheDocument();
    // The status block names the cycle; the header does not repeat its number.
    expect(document.querySelector('[data-figure="cycle"]')).toBeNull();
    expect(figureValue('gestures')).toHaveTextContent('17');
    expect(figureValue('signatureAllocation')).toHaveTextContent('5.5000 ETH');
    // /current-cycle belongs to Explore, as in the navigation (config/siteNav).
    expect(screen.getByRole('link', { name: COMMON.section('explore') })).toHaveAttribute(
      'href',
      '/statistics',
    );
    // The gestures and Signature Allocation figures define themselves behind an info button.
    const cards = seoMessages.currentCycleSummary.cards;
    for (const label of [cards.gestures, cards.signatureAllocation]) {
      expect(
        screen.getByRole('button', { name: `More information about ${label}` }),
      ).toBeInTheDocument();
    }
  });

  it('holds the server-read cycle figures before the first client read', async () => {
    mockUseDashboardInfo.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as unknown as ReturnType<typeof useDashboardInfo>);
    render(await CurrentCycleSeoSummary());
    // The status block names the cycle; the header does not repeat its number.
    expect(document.querySelector('[data-figure="cycle"]')).toBeNull();
    expect(figureValue('gestures')).toHaveTextContent('17');
    expect(figureValue('signatureAllocation')).toHaveTextContent('5.5000 ETH');
  });

  it('prefers the client read over the server read', async () => {
    mockUseDashboardInfo.mockReturnValue({
      data: { ...dashboard, CurNumBids: 18 },
      isLoading: false,
    } as unknown as ReturnType<typeof useDashboardInfo>);
    render(await CurrentCycleSeoSummary());
    expect(figureValue('gestures')).toHaveTextContent('18');
  });

  it.each([
    ['anchoring' as const, 'Anchor Distributions', 'records', null],
    ['marketing' as const, 'Outreach allocations', 'records', null],
    ['eth-contribution' as const, 'Direct ETH contributions', 'records', null],
    ['attached-nfts' as const, 'Attached NFT Contributions', 'collection', '/gallery'],
    ['named-nfts' as const, 'Named Cosmic Signature NFTs', 'collection', '/gallery'],
    ['used-rwlk-nfts' as const, 'Used RandomWalk NFTs', 'collection', '/gallery'],
  ])(
    'renders %s as one header: H1, section eyebrow, snapshot and source',
    async (route, heading, section, hub) => {
      render(await PublicDataRouteSeoSummary({ route }));

      expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
      expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
      if (hub) {
        expect(screen.getByRole('link', { name: COMMON.section(section) })).toHaveAttribute(
          'href',
          hub,
        );
      } else {
        // Records has no hub page: the eyebrow names it without a link.
        expect(screen.getByText(COMMON.section(section))).not.toHaveAttribute('href');
        expect(screen.queryByRole('link', { name: COMMON.section(section) })).toBeNull();
      }
      expect(screen.getByText(COMMON.snapshot)).toBeInTheDocument();
      // The stamp and its source are one item of the meta line, so they flow as one line.
      const source = screen.getByText(/^· Source: /);
      expect(source).toContainElement(screen.getByText(COMMON.snapshot));
      // The eyebrow names the section, never the H1 with "· Arbitrum".
      expect(screen.queryByText(/· Arbitrum/)).not.toBeInTheDocument();
    },
  );

  it('drops the snapshot stamp when every read failed', async () => {
    mockDirectContributions.mockRejectedValue(new Error('Network response was not OK'));
    render(await PublicDataRouteSeoSummary({ route: 'eth-contribution' }));
    expect(screen.queryByText(COMMON.snapshot)).not.toBeInTheDocument();
    expect(screen.queryByText(/Source: /)).not.toBeInTheDocument();
  });

  it('renders allocation totals from finalized rounds, gestures included', async () => {
    mockGetRoundList.mockResolvedValue([
      { AmountEth: 1.25, WinnerAddr: WALLET_A, RoundStats: { TotalBids: 10 } },
      { AmountEth: 2.5, WinnerAddr: WALLET_B, RoundStats: { TotalBids: 20 } },
      { AmountEth: 3, WinnerAddr: WALLET_A, RoundStats: { TotalBids: 30 } },
    ] as Rows<typeof get_round_list>);
    mockGetClaimHistory.mockResolvedValue([
      { AmountEth: 24_009.1377, WinnerAddr: WALLET_C },
    ] as unknown as Rows<typeof get_claim_history>);

    render(await PublicDataRouteSeoSummary({ route: 'allocation', note: <span>scope</span> }));

    expect(mockGetClaimHistory).not.toHaveBeenCalled();
    expect(figureValue('finalizedCycles')).toHaveTextContent(/^3$/);
    expect(figureValue('recipients')).toHaveTextContent(/^2$/);
    expect(figureValue('totalEth')).toHaveTextContent('6.7500 ETH');
    expect(figureValue('totalGestures')).toHaveTextContent('60');
    expect(screen.getByText('scope')).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'More information about Total Signature Allocation ETH',
      }),
    ).toBeInTheDocument();
  });

  it('links anchoring to its statistics section, not the statistics overview', async () => {
    render(await PublicDataRouteSeoSummary({ route: 'anchoring' }));
    expect(
      screen.getByRole('link', {
        name: seoMessages.publicData.routes.anchoring.links.statistics,
      }),
    ).toHaveAttribute('href', '/statistics/anchoring');
  });

  it('sends direct ETH contributors to how the Cycle Reserve is split', async () => {
    render(await PublicDataRouteSeoSummary({ route: 'eth-contribution' }));
    const copy = seoMessages.publicData.routes['eth-contribution'];
    expect(copy.description).toMatch(/Cycle Reserve/);
    expect(copy.description).not.toMatch(/Public Goods Vault/);
    const related = screen.getByRole('navigation', { name: /related pages/ });
    expect(within(related).getByRole('link', { name: copy.links.reserve })).toHaveAttribute(
      'href',
      '/how-it-works',
    );
    expect(within(related).getByRole('link', { name: copy.links.protocol })).toHaveAttribute(
      'href',
      '/public-goods-contributions-cg',
    );
    expect(within(related).getAllByRole('link')).toHaveLength(3);
  });

  describe('figures reconcile with their data source', () => {
    it('sums only ETH allocation record types into ETH Allocated', async () => {
      // The /allocation-finalized card once read "48,028 ETH": every 1,000 CST row was
      // summed as 1,000 ETH, and a timeout retrieval (type 18) repeats a type-10 deposit.
      mockGetClaimHistory.mockResolvedValue([
        { RecordType: 0, AmountEth: 11.0616, WinnerAddr: WALLET_A },
        { RecordType: 7, AmountEth: 3.5397, WinnerAddr: WALLET_B },
        { RecordType: 10, AmountEth: 0.4596, WinnerAddr: WALLET_C },
        { RecordType: 15, AmountEth: 2.6548, WinnerAddr: ANCHOR_DISTRIBUTION_RECIPIENT },
        { RecordType: 1, AmountEth: 1000, WinnerAddr: `0x${'A1'.repeat(20)}` },
        { RecordType: 11, AmountEth: 1000, WinnerAddr: WALLET_C },
        { RecordType: 2, AmountEth: 0, WinnerAddr: WALLET_A },
        { RecordType: 18, AmountEth: 0.4596, WinnerAddr: WALLET_E },
      ] as Rows<typeof get_claim_history>);

      render(await PublicDataRouteSeoSummary({ route: 'allocation-finalized' }));

      const copy = seoMessages.publicData.routes['allocation-finalized'].cards;
      expect(screen.getByText(copy.eth.label)).toBeInTheDocument();
      expect(figureValue('eth')).toHaveTextContent('17.7157 ETH');
      expect(figureValue('records')).toHaveTextContent('8');
      // A, B, C and E: the placeholder is not a wallet, and case does not split a wallet.
      expect(figureValue('recipients')).toHaveTextContent(/^4$/);
      expect(screen.queryByText(/2,0\d\d/)).not.toBeInTheDocument();
    });

    it('shows the ETH Gesture Cost from CurBidPriceEth, never the CST reward', async () => {
      mockGetDashboardInfo.mockResolvedValue({
        ...dashboard,
        CurBidPriceEth: 0.10210695701197195,
        ParticipationCstReward: 185.6693,
      } as unknown as Awaited<ReturnType<typeof get_dashboard_info>>);

      render(await PublicDataRouteSeoSummary({ route: 'imprint' }));

      // The same quote format as the home tabs and submit button (five significant digits),
      // set like every other ETH figure: a no-break space and a muted unit.
      expect(figureValue('cost').textContent).toBe('0.10211\u00a0ETH');
      expect(within(figureValue('cost') as HTMLElement).getByText('ETH')).toHaveClass(
        'text-muted-foreground',
      );
      expect(screen.queryByText(/185/)).not.toBeInTheDocument();
      expect(figureValue('discount')).toHaveTextContent(
        `${protocolFacts.randomWalkDiscountPercentage}%`,
      );
    });

    it('shows Outreach CST Allocated in CST, not as an ETH reserve', async () => {
      mockGetDashboardInfo.mockResolvedValue({
        ...dashboard,
        MainStats: { ...dashboard.MainStats, TotalMktRewardsEth: 5999 },
      } as unknown as Awaited<ReturnType<typeof get_dashboard_info>>);

      render(await PublicDataRouteSeoSummary({ route: 'marketing' }));

      const copy = seoMessages.publicData.routes.marketing.cards;
      expect(screen.getByText(copy.allocatedCst.label)).toBeInTheDocument();
      expect(figureValue('allocatedCst')).toHaveTextContent('5,999 CST');
      expect(screen.queryByText(/5,999 ETH/)).not.toBeInTheDocument();
    });

    it('builds the direct-contribution figures from the table source', async () => {
      const rows = [
        { AmountEth: 20, DonorAddr: '0x4D3949CD8980E942eb9Dd24d4eCc27584a8D71fA' },
        { AmountEth: 10, DonorAddr: WALLET_B },
        // The same wallet in lower case: still one contributor.
        { AmountEth: 0.5, DonorAddr: '0x4d3949cd8980e942eb9dd24d4ecc27584a8d71fa' },
      ] as Rows<typeof get_donations_both>;
      mockDirectContributions.mockResolvedValue(rows);

      render(await PublicDataRouteSeoSummary({ route: 'eth-contribution' }));

      expect(mockDirectContributions).toHaveBeenCalled();
      expect(figureValue('records')).toHaveTextContent(String(rows.length));
      expect(figureValue('totalEth')).toHaveTextContent('30.5000 ETH');
      expect(figureValue('contributors')).toHaveTextContent('2');
    });

    it('counts the coordination events the table lists, with the latest change', async () => {
      mockSystemModes.mockResolvedValue([{ EvtLogId: 500 }] as Rows<typeof get_system_modelist>);
      mockSystemEvents.mockResolvedValue([
        { RecordType: 3, TimeStamp: 1_786_000_000 },
        { RecordType: 3, TimeStamp: 1_786_100_000 },
        { RecordType: 7, TimeStamp: 1_785_000_000 },
      ] as Rows<typeof get_system_events>);

      render(await PublicDataRouteSeoSummary({ route: 'coordination-changes' }));

      // The table's rows: events from the latest system-mode change onward.
      expect(mockSystemEvents).toHaveBeenCalledWith(500, 9_999_999_999);
      expect(figureValue('records')).toHaveTextContent('3');
      expect(figureValue('parameters')).toHaveTextContent('2');
      expect(figureValue('latest').querySelector('time')).toHaveAttribute(
        'datetime',
        new Date(1_786_100_000 * 1000).toISOString(),
      );
      // A date stays at figure-md beside the counts.
      expect(figureValue('latest')).not.toHaveClass('lg:type-figure-lg');
      expect(figureValue('records')).toHaveClass('lg:type-figure-lg');
      // No constant filler: the governance surface and the network are not figures.
      expect(document.querySelector('[data-figure="governance"]')).toBeNull();
      expect(document.querySelector('[data-figure="network"]')).toBeNull();
    });

    it('shows the live Public Goods share, falling back to the documented one', async () => {
      mockGetDashboardInfo.mockResolvedValue({
        ...dashboard,
        CharityPercentage: 9,
      } as unknown as Awaited<ReturnType<typeof get_dashboard_info>>);
      const view = render(
        await PublicDataRouteSeoSummary({ route: 'public-goods-contributions-cg' }),
      );
      expect(figureValue('share')).toHaveTextContent('9%');
      view.unmount();

      mockGetDashboardInfo.mockRejectedValue(new Error('offline'));
      render(await PublicDataRouteSeoSummary({ route: 'public-goods-contributions-cg' }));
      expect(figureValue('share')).toHaveTextContent(`${protocolFacts.publicGoodsPercentage}%`);
      expect(document.querySelector('[data-figure="track"]')).toBeNull();
    });

    it('shows "None yet" for the latest record of an empty but successful read', async () => {
      const cg = render(
        await PublicDataRouteSeoSummary({ route: 'public-goods-contributions-cg' }),
      );
      expect(figureValue('latest')).toHaveTextContent('None yet');
      expect(figureValue('latest')).not.toHaveTextContent(COMMON.unavailable);
      cg.unmount();

      const retrievals = render(
        await PublicDataRouteSeoSummary({ route: 'public-goods-retrievals' }),
      );
      expect(figureValue('latest')).toHaveTextContent('None yet');
      expect(figureValue('beneficiary')).toHaveTextContent('None yet');
      retrievals.unmount();

      render(await PublicDataRouteSeoSummary({ route: 'coordination-changes' }));
      expect(figureValue('latest')).toHaveTextContent('None yet');
    });

    it('keeps the unavailable dash when the list could not be read', async () => {
      mockPublicGoodsRetrievals.mockRejectedValue(new Error('offline'));
      render(await PublicDataRouteSeoSummary({ route: 'public-goods-retrievals' }));
      expect(figureValue('latest')).toHaveTextContent(COMMON.unavailable);
      expect(figureValue('beneficiary')).toHaveTextContent(COMMON.unavailable);
      expect(figureValue('beneficiary')).not.toHaveTextContent('None yet');
    });

    it('names the documented Public Goods beneficiary on its chip', async () => {
      const { address, name } = protocolFacts.publicGoodsBeneficiary;
      mockPublicGoodsRetrievals.mockResolvedValue([
        { AmountEth: 1, TimeStamp: 100, DestinationAddr: address },
      ] as Rows<typeof get_charity_withdrawals>);

      render(await PublicDataRouteSeoSummary({ route: 'public-goods-retrievals' }));

      const chip = within(figureValue('beneficiary') as HTMLElement).getByRole('link');
      expect(chip).toHaveTextContent(name);
      expect(chip).toHaveAttribute('href', `/user/${address}`);
    });

    it('names the latest Public Goods beneficiary from the retrievals', async () => {
      mockPublicGoodsRetrievals.mockResolvedValue([
        { AmountEth: 1, TimeStamp: 100, DestinationAddr: WALLET_B },
        { AmountEth: 2, TimeStamp: 200, DestinationAddr: WALLET_C },
      ] as Rows<typeof get_charity_withdrawals>);

      render(await PublicDataRouteSeoSummary({ route: 'public-goods-retrievals' }));

      expect(figureValue('totalEth')).toHaveTextContent('3.0000 ETH');
      expect(within(figureValue('beneficiary') as HTMLElement).getByRole('link')).toHaveAttribute(
        'href',
        `/user/${WALLET_C}`,
      );
    });

    it('omits the owners figure when the names endpoint carries no owners', async () => {
      // Regression: the endpoint returns names without owner fields, which printed
      // "Current Owners 0" beside 3 named NFTs.
      mockNamedNfts.mockResolvedValue([
        { TokenId: 1, TokenName: 'NUMBA 1' },
        { TokenId: 25, TokenName: 'Twisted Mind' },
      ] as Rows<typeof get_named_nfts>);

      render(await PublicDataRouteSeoSummary({ route: 'named-nfts' }));

      expect(figureValue('named')).toHaveTextContent('2');
      expect(document.querySelector('[data-figure="owners"]')).toBeNull();
      expect(figureValue('imprinted')).toHaveTextContent('240');
    });

    it('counts the owners the names endpoint does return', async () => {
      render(await PublicDataRouteSeoSummary({ route: 'named-nfts' }));
      expect(figureValue('owners')).toHaveTextContent(/^1$/);
    });

    it('counts participant wallets for used RandomWalk NFTs instead of a constant scope', async () => {
      mockUsedRwlkNfts.mockResolvedValue([
        { BidderAddr: WALLET_A },
        { BidderAddr: WALLET_A },
        { BidderAddr: WALLET_B },
      ] as Rows<typeof get_used_rwlk_nfts>);
      render(await PublicDataRouteSeoSummary({ route: 'used-rwlk-nfts' }));
      expect(figureValue('used')).toHaveTextContent('3');
      expect(figureValue('wallets')).toHaveTextContent('2');
      expect(document.querySelector('[data-figure="scope"]')).toBeNull();
    });

    it('splits anchoring records into ETH deposits and Stellar Selection imprints', async () => {
      mockCstRewards.mockResolvedValue([{}] as Rows<typeof get_staking_cst_rewards>);
      mockRwalkImprints.mockResolvedValue(
        Array.from({ length: 20 }, () => ({})) as Rows<typeof get_staking_rwalk_mints_global>,
      );

      render(await PublicDataRouteSeoSummary({ route: 'anchoring' }));

      expect(figureValue('actions')).toHaveTextContent('2');
      expect(figureValue('ethDeposits')).toHaveTextContent('1');
      expect(figureValue('stellarImprints')).toHaveTextContent('20');
      expect(document.querySelector('[data-figure="tokens"]')).toBeNull();
    });

    it('renders a failed read as unavailable, never as a confident zero', async () => {
      mockDirectContributions.mockRejectedValue(new Error('Network response was not OK'));

      render(await PublicDataRouteSeoSummary({ route: 'eth-contribution' }));

      for (const key of ['records', 'totalEth', 'contributors']) {
        const figure = figureValue(key);
        expect(figure).toHaveTextContent(COMMON.unavailable);
        expect(figure).toHaveTextContent('—');
        expect(figure).not.toHaveTextContent(/\d/);
      }
    });

    it('marks only the figures whose read failed as unavailable', async () => {
      mockGetDashboardInfo.mockRejectedValue(new Error('Network response was not OK'));

      render(await PublicDataRouteSeoSummary({ route: 'marketing' }));

      expect(figureValue('allocatedCst')).toHaveTextContent(COMMON.unavailable);
      expect(figureValue('records')).toHaveTextContent('1');
      expect(figureValue('contributors')).toHaveTextContent('1');
    });
  });

  it('renders every shared data-route surface in Chinese without English fallback copy', async () => {
    mockGetLocale.mockResolvedValue('zh');
    render(await PublicDataRouteSeoSummary({ route: 'allocation' }));

    const copy = zhSeoMessages.publicData.routes.allocation;
    expect(screen.getByRole('heading', { level: 1, name: copy.heading })).toBeInTheDocument();
    expect(screen.getByText(copy.cards.totalEth.label)).toBeInTheDocument();
    expect(copy.cards.totalEth.tooltip).toMatch(/[㐀-鿿]/);
    expect(
      screen.getByRole('button', {
        name: `More information about ${copy.cards.totalEth.label}`,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.links.statistics })).toHaveAttribute(
      'href',
      '/statistics',
    );
    expect(screen.getByText(/^· 数据来源：/)).toBeInTheDocument();
    expect(screen.queryByText(/initial HTML for search engines/i)).not.toBeInTheDocument();
  });

  it('keeps the reader’s locale on related landing pages', async () => {
    mockGetLocale.mockResolvedValue('zh');
    render(await PublicDataRouteSeoSummary({ route: 'coordination-changes' }));
    const learn = screen.getByRole('link', {
      name: zhSeoMessages.publicData.routes['coordination-changes'].links.learn,
    });
    expect(learn.getAttribute('href')).toMatch(/\/zh\/learn\/cst-token-and-cosmic-council$/);
  });

  it('renders all dedicated headers with Chinese headings and links', async () => {
    mockGetLocale.mockResolvedValue('zh');

    const gallery = render(await GallerySeoSummary());
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: zhSeoMessages.gallerySummary.heading,
      }),
    ).toBeInTheDocument();
    gallery.unmount();

    const galleryAbout = render(await GalleryAbout({ locale: 'zh' }));
    expect(
      screen.getByRole('link', { name: zhSeoMessages.gallerySummary.links.code }),
    ).toHaveAttribute('href', '/code');
    galleryAbout.unmount();

    const currentCycle = render(await CurrentCycleSeoSummary());
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: zhSeoMessages.currentCycleSummary.heading,
      }),
    ).toBeInTheDocument();
    currentCycle.unmount();

    const statistics = render(await StatisticsSeoSummary());
    expect(screen.getByRole('heading', { level: 1, name: /协议统计/ })).toBeInTheDocument();
    statistics.unmount();

    const contracts = render(await ContractsSeoSummary());
    expect(screen.getByRole('heading', { level: 1, name: /合约/ })).toBeInTheDocument();
    contracts.unmount();

    const code = render(await CodeSeoSummary());
    expect(screen.getByRole('heading', { level: 1, name: /源代码/ })).toBeInTheDocument();
    code.unmount();
  });
});
