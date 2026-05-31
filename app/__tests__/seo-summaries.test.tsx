import { AppHomeSeoSummary } from '@/app/AppHomeSeoSummary';
import { ContractsSeoSummary } from '@/app/contracts/ContractsSeoSummary';
import { CurrentCycleSeoSummary } from '@/app/current-cycle/CurrentCycleSeoSummary';
import { GallerySeoSummary } from '@/app/gallery/GallerySeoSummary';
import { StatisticsSeoSummary } from '@/app/statistics/StatisticsSeoSummary';

import { render, screen } from '@/test-utils';

import { get_dashboard_info } from '../../services/api/rounds';

jest.mock('../../services/api/rounds', () => ({
  get_dashboard_info: jest.fn(),
}));

const mockGetDashboardInfo = get_dashboard_info as jest.MockedFunction<typeof get_dashboard_info>;

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
});
