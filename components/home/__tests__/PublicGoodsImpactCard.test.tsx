import '@testing-library/jest-dom';

import type { DashboardInfo } from '@/services/api';

import { checkA11y, render, screen } from '@/test-utils';

import { PublicGoodsImpactCard } from '../PublicGoodsImpactCard';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

const dashboardData = {
  CharityPercentage: 7,
  CosmicGameBalanceEth: 123.45,
  CharityBalanceEth: '0.5',
  SumVoluntaryDonationsEth: '10',
  MainStats: {
    SumCosmicGameDonationsEth: 1.2345,
    SumWithdrawals: 2.5,
  },
} as unknown as DashboardInfo;

describe('PublicGoodsImpactCard', () => {
  it('renders the current-cycle public-goods ETH amount', () => {
    render(<PublicGoodsImpactCard data={dashboardData} />);
    expect(screen.getByText('8.6415 ETH')).toBeInTheDocument();
    expect(screen.getByText('home.publicGoods.body(percent=7)')).toBeInTheDocument();
  });

  it('uses the full-width default layout by default', () => {
    render(<PublicGoodsImpactCard data={dashboardData} />);

    const card = screen.getByTestId('public-goods-impact-card');
    expect(card).toHaveAttribute('data-variant', 'default');
    expect(card).toHaveClass('mt-10', 'p-6', 'sm:p-8');
  });

  it('supports a compact rail layout without changing content or accessibility hooks', () => {
    render(
      <PublicGoodsImpactCard data={dashboardData} variant="rail" className="rail-companion-card" />,
    );

    const card = screen.getByTestId('public-goods-impact-card');
    expect(card).toHaveAttribute('data-variant', 'rail');
    expect(card).toHaveClass('p-5', 'sm:p-6', 'rail-companion-card');
    expect(card).not.toHaveClass('mt-10');
    expect(screen.getByRole('heading', { name: 'home.publicGoods.heading' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home\.publicGoods\.cta/ })).toHaveAttribute(
      'href',
      '/public-goods-contributions-cg',
    );
  });

  it('supports a small summary layout for the dedicated Public Goods page', () => {
    render(<PublicGoodsImpactCard data={dashboardData} variant="compact" />);

    const card = screen.getByTestId('public-goods-impact-card');
    expect(card).toHaveAttribute('data-variant', 'compact');
    expect(card).toHaveClass('p-4');
    expect(card).toHaveTextContent('8.6415 ETH');
    expect(card).toHaveTextContent('11.23 ETH');
    expect(card).toHaveTextContent('0.5000 ETH');
    expect(card).toHaveTextContent('2.5000 ETH');
    expect(screen.queryByRole('link', { name: /home\.publicGoods\.cta/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/not a charitable contribution/)).not.toBeInTheDocument();
  });

  it('renders supporting public-goods totals', () => {
    render(<PublicGoodsImpactCard data={dashboardData} />);
    expect(screen.getByText('home.publicGoods.stats.lifetime')).toBeInTheDocument();
    expect(screen.getByText('11.23 ETH')).toBeInTheDocument();
    expect(screen.getByText('home.publicGoods.stats.vault')).toBeInTheDocument();
    expect(screen.getByText('0.5000 ETH')).toBeInTheDocument();
    expect(screen.getByText('home.publicGoods.stats.retrieved')).toBeInTheDocument();
    expect(screen.getByText('2.5000 ETH')).toBeInTheDocument();
  });

  it('links to protocol public-goods contributions', () => {
    render(<PublicGoodsImpactCard data={dashboardData} />);
    expect(screen.getByRole('link', { name: /home\.publicGoods\.cta/ })).toHaveAttribute(
      'href',
      '/public-goods-contributions-cg',
    );
  });

  it('keeps the English legal disclaimer from the landing content module', () => {
    render(<PublicGoodsImpactCard data={dashboardData} />);
    expect(screen.getByText(/not a charitable contribution in the U\.S\. tax sense/)).toHaveClass(
      'text-white/45',
    );
  });

  it('does not render without dashboard data', () => {
    const { container } = render(<PublicGoodsImpactCard data={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('does not render when the public-goods percentage is absent or zero', () => {
    const { rerender, container } = render(
      <PublicGoodsImpactCard data={{ ...dashboardData, CharityPercentage: 0 }} />,
    );
    expect(container).toBeEmptyDOMElement();

    rerender(
      <PublicGoodsImpactCard
        data={{ ...dashboardData, CharityPercentage: undefined } as DashboardInfo}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('has no accessibility violations in the rail layout', async () => {
    const { container } = render(<PublicGoodsImpactCard data={dashboardData} variant="rail" />);
    await checkA11y(container);
  });

  it('has no accessibility violations in the compact layout', async () => {
    const { container } = render(<PublicGoodsImpactCard data={dashboardData} variant="compact" />);
    await checkA11y(container);
  });
});
