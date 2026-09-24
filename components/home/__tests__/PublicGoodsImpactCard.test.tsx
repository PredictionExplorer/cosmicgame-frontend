import type { DashboardInfo } from '@/services/api';

import { checkA11y, render, screen, within } from '@/test-utils';

import { PublicGoodsImpactCard } from '../PublicGoodsImpactCard';

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
  it('shows the vault and what was retrieved as settled figures', () => {
    render(<PublicGoodsImpactCard data={dashboardData} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'home.publicGoods.heading' }),
    ).toBeVisible();
    expect(screen.getByTestId('public-goods-settled-vault')).toHaveTextContent(
      'home.publicGoods.stats.vault0.5000 ETH',
    );
    expect(screen.getByTestId('public-goods-settled-retrieved')).toHaveTextContent('2.5000 ETH');
    // The ledger below totals the contributions; the card does not repeat them.
    expect(screen.queryByText(/11\.2345/)).not.toBeInTheDocument();
  });

  it('labels this cycle’s share as a projection, set apart and explained', () => {
    render(<PublicGoodsImpactCard data={dashboardData} />);
    const projected = screen.getByTestId('public-goods-projected');
    expect(within(projected).getByText('home.publicGoods.projected')).toBeVisible();
    expect(projected).toHaveTextContent('8.6415 ETH');
    expect(projected).toHaveClass('border-dashed');
    expect(
      within(projected).getByRole('button', { name: /home\.publicGoods\.projected/ }),
    ).toBeInTheDocument();
  });

  it('shows an unreadable figure as unavailable, never 0', () => {
    render(
      <PublicGoodsImpactCard
        data={{ ...dashboardData, CharityBalanceEth: undefined } as unknown as DashboardInfo}
      />,
    );
    expect(screen.getByTestId('public-goods-settled-vault')).not.toHaveTextContent('0.0000');
  });

  it('does not render without data or a public-goods share', () => {
    const { rerender, container } = render(<PublicGoodsImpactCard data={null} />);
    expect(container).toBeEmptyDOMElement();
    rerender(<PublicGoodsImpactCard data={{ ...dashboardData, CharityPercentage: 0 }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<PublicGoodsImpactCard data={dashboardData} />);
    await checkA11y(container);
  });
});
