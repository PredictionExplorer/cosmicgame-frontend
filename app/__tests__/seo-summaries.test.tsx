import { AppHomeSeoSummary } from '@/app/AppHomeSeoSummary';
import { PublicDataRouteSeoSummary } from '@/app/PublicDataRouteSeoSummary';
import { ContractsSeoSummary } from '@/app/contracts/ContractsSeoSummary';
import { CurrentCycleSeoSummary } from '@/app/current-cycle/CurrentCycleSeoSummary';
import { GallerySeoSummary } from '@/app/gallery/GallerySeoSummary';
import { StatisticsSeoSummary } from '@/app/statistics/StatisticsSeoSummary';
import { statisticsCopy } from '@/content/statistics-copy';

import { render, screen } from '@/test-utils';

// lexicon-allow-start: test imports mirror sealed API module filenames.
import { get_dashboard_info } from '../../services/api/rounds';
import { get_marketing_rewards } from '../../services/api/marketing';
import { get_staking_cst_actions, get_staking_rwalk_actions } from '../../services/api/anchoring';
import {
  get_donations_cg_with_info_list,
  get_donations_nft_list,
} from '../../services/api/donations';
import { get_named_nfts, get_used_rwlk_nfts } from '../../services/api/tokens';
// lexicon-allow-end

// lexicon-allow-start: test mocks mirror sealed API module filenames.
jest.mock('../../services/api/rounds', () => ({
  get_dashboard_info: jest.fn(),
  get_round_list: jest.fn(() => Promise.resolve([])),
  get_claim_history: jest.fn(() => Promise.resolve([])),
}));
jest.mock('../../services/api/anchoring', () => ({
  get_staked_cst_tokens: jest.fn(() => Promise.resolve([])),
  get_staked_rwalk_tokens: jest.fn(() => Promise.resolve([])),
  get_staking_cst_actions: jest.fn(),
  get_staking_cst_rewards: jest.fn(() => Promise.resolve([])),
  get_staking_rwalk_actions: jest.fn(),
  get_staking_rwalk_mints_global: jest.fn(() => Promise.resolve([])),
}));
jest.mock('../../services/api/donations', () => ({
  get_charity_cg_deposits: jest.fn(() => Promise.resolve([])),
  get_charity_voluntary: jest.fn(() => Promise.resolve([])),
  get_charity_withdrawals: jest.fn(() => Promise.resolve([])),
  get_donations_cg_with_info_list: jest.fn(),
  get_donations_nft_list: jest.fn(),
}));
jest.mock('../../services/api/marketing', () => ({
  get_marketing_rewards: jest.fn(),
}));
jest.mock('../../services/api/system', () => ({
  get_system_modelist: jest.fn(() => Promise.resolve([])),
}));
jest.mock('../../services/api/tokens', () => ({
  get_named_nfts: jest.fn(),
  get_used_rwlk_nfts: jest.fn(),
}));
// lexicon-allow-end

const mockGetDashboardInfo = get_dashboard_info as jest.MockedFunction<typeof get_dashboard_info>;
const mockMarketingRewards = get_marketing_rewards as jest.MockedFunction<
  typeof get_marketing_rewards
>;
const mockCstActions = get_staking_cst_actions as jest.MockedFunction<
  typeof get_staking_cst_actions
>;
const mockRwalkActions = get_staking_rwalk_actions as jest.MockedFunction<
  typeof get_staking_rwalk_actions
>;
const mockDirectContributions = get_donations_cg_with_info_list as jest.MockedFunction<
  typeof get_donations_cg_with_info_list
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
  },
};

describe('server-visible SEO summaries', () => {
  beforeEach(() => {
    mockGetDashboardInfo.mockResolvedValue(
      dashboard as Awaited<ReturnType<typeof get_dashboard_info>>,
    );
    mockMarketingRewards.mockResolvedValue([{ MarketerAddr: '0xabc' }] as Awaited<
      ReturnType<typeof get_marketing_rewards>
    >);
    mockCstActions.mockResolvedValue([{}] as Awaited<ReturnType<typeof get_staking_cst_actions>>);
    mockRwalkActions.mockResolvedValue([{}] as Awaited<
      ReturnType<typeof get_staking_rwalk_actions>
    >);
    mockDirectContributions.mockResolvedValue([{ AmountEth: 1, DonorAddr: '0xabc' }] as Awaited<
      ReturnType<typeof get_donations_cg_with_info_list>
    >);
    mockAttachedNfts.mockResolvedValue([{ TokenAddr: '0xabc', DonorAddr: '0xdef' }] as Awaited<
      ReturnType<typeof get_donations_nft_list>
    >);
    mockNamedNfts.mockResolvedValue([{ TokenId: 1, CurOwnerAddr: '0xabc' }] as Awaited<
      ReturnType<typeof get_named_nfts>
    >);
    mockUsedRwlkNfts.mockResolvedValue([{}] as Awaited<ReturnType<typeof get_used_rwlk_nfts>>);
  });

  it('renders an app home H1 and crawlable app links before hydration', async () => {
    render(await AppHomeSeoSummary());

    expect(screen.getByRole('region', { name: 'Cosmic Signature App' })).toHaveAttribute(
      'aria-labelledby',
      'app-home-seo-heading',
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Cosmic Signature App' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /protocol statistics/i })).toHaveAttribute(
      'href',
      '/statistics',
    );
  });

  it('keeps the app home summary clear of fixed app chrome', async () => {
    render(await AppHomeSeoSummary());

    const summary = screen.getByRole('region', { name: 'Cosmic Signature App' });

    expect(summary).toHaveClass('pt-40');
    expect(summary).toHaveClass('max-sm:pt-36');
    expect(summary).toHaveClass('lg:pt-72');
    expect(summary).toHaveClass('print:pt-0');
    expect(summary).not.toHaveClass('mt-8');
  });

  it('renders crawler-visible statistics facts and related links', async () => {
    render(await StatisticsSeoSummary());

    expect(
      screen.getByRole('heading', { level: 1, name: 'Cosmic Signature Protocol Statistics' }),
    ).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /verified Arbitrum contracts/i })).toHaveAttribute(
      'href',
      '/contracts',
    );
    expect(
      screen.getByText(statisticsCopy.metrics.cosmicSignatureNftsImprinted.label),
    ).toBeInTheDocument();
    for (const metric of [
      statisticsCopy.metrics.activePerformanceCycle,
      statisticsCopy.metrics.activeCycleGestures,
      statisticsCopy.metrics.contractBalance,
      statisticsCopy.metrics.cosmicSignatureNftsImprinted,
    ]) {
      expect(screen.getByText(metric.seoDescription)).toBeInTheDocument();
    }
    expect(
      screen.getByRole('button', {
        name: `More information about ${statisticsCopy.metrics.activePerformanceCycle.label}`,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: `More information about ${statisticsCopy.metrics.cosmicSignatureNftsImprinted.label}`,
      }),
    ).toBeInTheDocument();
  });

  it('renders contract addresses in raw server content', async () => {
    render(await ContractsSeoSummary());

    expect(
      screen.getByRole('heading', { level: 1, name: 'Cosmic Signature Contracts' }),
    ).toBeInTheDocument();
    expect(screen.getByText('0x1111111111111111111111111111111111111111')).toBeInTheDocument();
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
    expect(
      screen.getByText(/initial HTML for search engines and AI crawlers/i),
    ).toBeInTheDocument();
  });
});
