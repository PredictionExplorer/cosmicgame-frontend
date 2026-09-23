import { getLocale } from 'next-intl/server';

import { protocolFacts } from '@/content/protocol-facts';
import seoMessages from '@/messages/en/seo.json';
import statisticsMessages from '@/messages/en/statistics.json';
import zhSeoMessages from '@/messages/zh/seo.json';

import { HomeObservatoryHero } from '@/components/home/HomeObservatoryHero';

import { render, screen } from '@/test-utils';

import { PublicDataRouteSeoSummary } from '../PublicDataRouteSeoSummary';
import { CodeSeoSummary } from '../code/CodeSeoSummary';
import { ContractsSeoSummary } from '../contracts/ContractsSeoSummary';
import { CurrentCycleSeoSummary } from '../current-cycle/CurrentCycleSeoSummary';
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
import { get_donations_both, get_donations_nft_list } from '../../../../services/api/donations';
import { get_coordination_events } from '../../../../services/api/system';
import { get_named_nfts, get_used_rwlk_nfts } from '../../../../services/api/tokens';
// lexicon-allow-end

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
  get_coordination_events: jest.fn(() => Promise.resolve([])),
}));
jest.mock('../../../../services/api/tokens', () => ({
  get_named_nfts: jest.fn(),
  get_used_rwlk_nfts: jest.fn(),
}));
// lexicon-allow-end

const mockGetDashboardInfo = get_dashboard_info as jest.MockedFunction<typeof get_dashboard_info>;
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
const mockCoordinationEvents = get_coordination_events as jest.MockedFunction<
  typeof get_coordination_events
>;
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
  MainStats: {
    NumCSTokenMints: 240,
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

describe('server-visible SEO summaries', () => {
  beforeEach(() => {
    mockGetLocale.mockResolvedValue('en');
    mockGetRoundList.mockResolvedValue([]);
    mockGetClaimHistory.mockResolvedValue([]);
    mockGetDashboardInfo.mockResolvedValue(
      dashboard as unknown as Awaited<ReturnType<typeof get_dashboard_info>>,
    );
    mockMarketingRewards.mockResolvedValue([{ MarketerAddr: '0xabc' }] as Awaited<
      ReturnType<typeof get_marketing_rewards>
    >);
    mockCstActions.mockResolvedValue([{}] as Awaited<ReturnType<typeof get_staking_cst_actions>>);
    mockRwalkActions.mockResolvedValue([{}] as Awaited<
      ReturnType<typeof get_staking_rwalk_actions>
    >);
    mockDirectContributions.mockResolvedValue([{ AmountEth: 1, DonorAddr: '0xabc' }] as Awaited<
      ReturnType<typeof get_donations_both>
    >);
    mockCstRewards.mockResolvedValue([]);
    mockRwalkImprints.mockResolvedValue([]);
    mockCoordinationEvents.mockResolvedValue([]);
    mockAttachedNfts.mockResolvedValue([{ TokenAddr: '0xabc', DonorAddr: '0xdef' }] as Awaited<
      ReturnType<typeof get_donations_nft_list>
    >);
    mockNamedNfts.mockResolvedValue([{ TokenId: 1, CurOwnerAddr: '0xabc' }] as Awaited<
      ReturnType<typeof get_named_nfts>
    >);
    mockUsedRwlkNfts.mockResolvedValue([{}] as Awaited<ReturnType<typeof get_used_rwlk_nfts>>);
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

  it('renders crawler-visible statistics facts and related links', async () => {
    render(await StatisticsSeoSummary());

    expect(
      screen.getByRole('heading', { level: 1, name: statisticsMessages.hub.seo.heading }),
    ).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: statisticsMessages.hub.seo.links.contracts }),
    ).toHaveAttribute('href', '/contracts');
    expect(
      screen.getByText(statisticsMessages.metrics.cosmicSignatureNftsImprinted.label),
    ).toBeInTheDocument();
    for (const metric of [
      'activePerformanceCycle',
      'activeCycleGestures',
      'contractBalance',
      'cosmicSignatureNftsImprinted',
    ] as const) {
      expect(
        screen.getByText(statisticsMessages.metrics[metric].seoDescription),
      ).toBeInTheDocument();
    }
    expect(
      screen.getByRole('button', {
        name: `More information about ${statisticsMessages.metrics.activePerformanceCycle.label}`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: `More information about ${statisticsMessages.metrics.cosmicSignatureNftsImprinted.label}`,
      }),
    ).toBeInTheDocument();
  });

  it('renders contract addresses in raw server content', async () => {
    render(await ContractsSeoSummary());

    expect(
      screen.getByRole('heading', { level: 1, name: 'Cosmic Signature Contracts' }),
    ).toBeInTheDocument();
    expect(screen.getByText('0x1111111111111111111111111111111111111111')).toBeInTheDocument();
    expect(screen.getByText(protocolFacts.contractAddresses.implementation)).toBeInTheDocument();
    expect(
      screen.queryByText('0x7739148013777c485AD9f3d971e1005Eca686661'),
    ).not.toBeInTheDocument();
    expect(screen.getByText('MarketplaceAddr')).toBeInTheDocument();
    expect(screen.getByText('0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')).toBeInTheDocument();
  });

  it('renders gallery and current-cycle H1 summaries', async () => {
    render(await GallerySeoSummary());
    expect(
      screen.getByRole('heading', { level: 1, name: 'Cosmic Signature Gallery' }),
    ).toBeInTheDocument();

    render(await CurrentCycleSeoSummary());
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Current Cosmic Signature Performance Cycle',
      }),
    ).toBeInTheDocument();
  });

  it.each([
    ['anchoring' as const, 'Anchor Distributions'],
    ['marketing' as const, 'Outreach Allocations'],
    ['eth-contribution' as const, 'Direct ETH Contributions'],
    ['attached-nfts' as const, 'Attached NFT Contributions'],
    ['named-nfts' as const, 'Named Cosmic Signature NFTs'],
    ['used-rwlk-nfts' as const, 'Used RandomWalk NFTs'],
  ])('renders crawlable data-route summary for %s', async (route, heading) => {
    render(await PublicDataRouteSeoSummary({ route }));

    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument();
    expect(screen.getByText(/Last updated: .+ Source: /i)).toBeInTheDocument();
  });

  it('renders allocation totals from finalized rounds instead of claim history', async () => {
    mockGetRoundList.mockResolvedValue([
      { AmountEth: 1.25, WinnerAddr: '0xaaa' },
      { AmountEth: 2.5, WinnerAddr: '0xbbb' },
      { AmountEth: 3, WinnerAddr: '0xaaa' },
    ] as Awaited<ReturnType<typeof get_round_list>>);
    mockGetClaimHistory.mockResolvedValue([
      { AmountEth: 24_009.1377, WinnerAddr: '0xclaim' },
    ] as unknown as Awaited<ReturnType<typeof get_claim_history>>);

    render(await PublicDataRouteSeoSummary({ route: 'allocation' }));

    expect(mockGetClaimHistory).not.toHaveBeenCalled();
    expect(screen.getByText('Total Signature Allocation ETH')).toBeInTheDocument();
    expect(screen.getByText('6.75 ETH')).toBeInTheDocument();
    expect(screen.getByText('Signature Allocation Recipients')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('Signature Allocation ETH Retrieved')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: 'More information about Total Signature Allocation ETH',
      }),
    ).toBeInTheDocument();
  });

  describe('figures reconcile with their data source', () => {
    type Rows<F extends (...args: never[]) => unknown> = Awaited<ReturnType<F>>;

    /** The rendered figure of the summary card with the given catalog key. */
    const cardFigure = (key: string) => {
      const card = document.querySelector(`[data-summary-card="${key}"] dd`);
      if (!card) throw new Error(`no summary card ${key}`);
      return card;
    };

    it('sums only ETH allocation record types into ETH Allocated', async () => {
      // The /allocation-finalized card once read "48,028 ETH": every 1,000 CST row was
      // summed as 1,000 ETH, and a timeout retrieval (type 18) repeats a type-10 deposit.
      mockGetClaimHistory.mockResolvedValue([
        { RecordType: 0, AmountEth: 11.0616, WinnerAddr: '0xaaa' },
        { RecordType: 7, AmountEth: 3.5397, WinnerAddr: '0xbbb' },
        { RecordType: 10, AmountEth: 0.4596, WinnerAddr: '0xccc' },
        { RecordType: 15, AmountEth: 2.6548, WinnerAddr: '0xddd' },
        { RecordType: 1, AmountEth: 1000, WinnerAddr: '0xaaa' },
        { RecordType: 11, AmountEth: 1000, WinnerAddr: '0xccc' },
        { RecordType: 2, AmountEth: 0, WinnerAddr: '0xaaa' },
        { RecordType: 18, AmountEth: 0.4596, WinnerAddr: '0xeee' },
      ] as Rows<typeof get_claim_history>);

      render(await PublicDataRouteSeoSummary({ route: 'allocation-finalized' }));

      const copy = seoMessages.publicData.routes['allocation-finalized'].cards;
      expect(screen.getByText(copy.eth.label)).toBeInTheDocument();
      expect(cardFigure('eth')).toHaveTextContent('17.7157 ETH');
      expect(cardFigure('records')).toHaveTextContent('8');
      expect(cardFigure('recipients')).toHaveTextContent('5');
      expect(screen.queryByText(/2,0\d\d/)).not.toBeInTheDocument();
    });

    it('shows the ETH Gesture Cost from CurBidPriceEth, never the CST reward', async () => {
      mockGetDashboardInfo.mockResolvedValue({
        ...dashboard,
        CurBidPriceEth: 0.10210695701197195,
        ParticipationCstReward: 185.6693,
      } as unknown as Awaited<ReturnType<typeof get_dashboard_info>>);

      render(await PublicDataRouteSeoSummary({ route: 'imprint' }));

      expect(cardFigure('cost')).toHaveTextContent('0.1021 ETH');
      expect(screen.queryByText(/185/)).not.toBeInTheDocument();
      expect(cardFigure('discount')).toHaveTextContent(
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
      expect(cardFigure('allocatedCst')).toHaveTextContent('5,999 CST');
      expect(screen.queryByText(/5,999 ETH/)).not.toBeInTheDocument();
    });

    it('builds the direct-contribution cards from the table source', async () => {
      const rows = [
        { AmountEth: 20, DonorAddr: '0x4D39' },
        { AmountEth: 10, DonorAddr: '0xfc79' },
        { AmountEth: 0.5, DonorAddr: '0x4D39' },
      ] as Rows<typeof get_donations_both>;
      mockDirectContributions.mockResolvedValue(rows);

      render(await PublicDataRouteSeoSummary({ route: 'eth-contribution' }));

      expect(mockDirectContributions).toHaveBeenCalled();
      expect(cardFigure('records')).toHaveTextContent(String(rows.length));
      expect(cardFigure('totalEth')).toHaveTextContent('30.5 ETH');
      expect(cardFigure('contributors')).toHaveTextContent('2');
    });

    it('counts the coordination events the table lists, not the mode list', async () => {
      mockCoordinationEvents.mockResolvedValue([{}, {}] as Rows<typeof get_coordination_events>);

      render(await PublicDataRouteSeoSummary({ route: 'coordination-changes' }));

      expect(cardFigure('records')).toHaveTextContent('2');
    });

    it('splits anchoring records into ETH deposits and Stellar Selection imprints', async () => {
      mockCstRewards.mockResolvedValue([{}] as Rows<typeof get_staking_cst_rewards>);
      mockRwalkImprints.mockResolvedValue(
        Array.from({ length: 20 }, () => ({})) as Rows<typeof get_staking_rwalk_mints_global>,
      );

      render(await PublicDataRouteSeoSummary({ route: 'anchoring' }));

      expect(cardFigure('actions')).toHaveTextContent('2');
      expect(cardFigure('ethDeposits')).toHaveTextContent('1');
      expect(cardFigure('stellarImprints')).toHaveTextContent('20');
      expect(document.querySelector('[data-summary-card="tokens"]')).toBeNull();
    });

    it('renders a failed read as unavailable, never as a confident zero', async () => {
      mockDirectContributions.mockRejectedValue(new Error('Network response was not OK'));

      render(await PublicDataRouteSeoSummary({ route: 'eth-contribution' }));

      for (const key of ['records', 'totalEth', 'contributors']) {
        const figure = cardFigure(key);
        expect(figure).toHaveTextContent(seoMessages.publicData.common.unavailable);
        expect(figure).toHaveTextContent('—');
        expect(figure).not.toHaveTextContent(/\d/);
      }
    });

    it('marks only the cards whose read failed as unavailable', async () => {
      mockGetDashboardInfo.mockRejectedValue(new Error('Network response was not OK'));

      render(await PublicDataRouteSeoSummary({ route: 'marketing' }));

      expect(cardFigure('allocatedCst')).toHaveTextContent(
        seoMessages.publicData.common.unavailable,
      );
      expect(cardFigure('records')).toHaveTextContent('1');
      expect(cardFigure('contributors')).toHaveTextContent('1');
    });
  });

  it('renders every shared data-route surface in Chinese without English fallback copy', async () => {
    mockGetLocale.mockResolvedValue('zh');
    render(await PublicDataRouteSeoSummary({ route: 'allocation' }));

    const copy = zhSeoMessages.publicData.routes.allocation;
    expect(screen.getByRole('heading', { level: 1, name: copy.heading })).toBeInTheDocument();
    expect(screen.getByText(copy.cards.totalEth.label)).toBeInTheDocument();
    expect(copy.cards.totalEth.tooltip).toMatch(/[\u3400-\u9fff]/);
    expect(
      screen.getByRole('button', {
        name: `More information about ${copy.cards.totalEth.label}`,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: copy.links.statistics })).toHaveAttribute(
      'href',
      '/statistics',
    );
    expect(screen.getByText(/更新时间：/)).toBeInTheDocument();
    expect(screen.queryByText(/initial HTML for search engines/i)).not.toBeInTheDocument();
  });

  it('renders all dedicated SEO summaries with Chinese headings and links', async () => {
    mockGetLocale.mockResolvedValue('zh');

    const gallery = render(await GallerySeoSummary());
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: zhSeoMessages.gallerySummary.heading,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: zhSeoMessages.gallerySummary.links.code }),
    ).toHaveAttribute('href', '/code');
    gallery.unmount();

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
