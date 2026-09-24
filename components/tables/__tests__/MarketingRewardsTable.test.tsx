import MarketingRewardsTable, {
  type MarketingReward,
} from '@/components/tables/MarketingRewardsTable';

import { checkA11y, render, screen } from '@/test-utils';

const reward = (id: number, amount: number): MarketingReward => ({
  EvtLogId: id,
  TxHash: `0x${String(id).padStart(64, '0')}`,
  TimeStamp: 1_700_000_000 + id,
  MarketerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  AmountEth: amount,
});

describe('MarketingRewardsTable', () => {
  it('has no heading of its own, so a profile section heading is not repeated', () => {
    // On /user/[address] the table sits under the "Outreach allocations"
    // section heading; a second "Allocations" heading would stack under it.
    const { container } = render(<MarketingRewardsTable list={[reward(1, 10)]} />);
    expect(screen.queryByRole('heading')).toBeNull();
    expect(
      screen.getByRole('table', { name: 'tables.names.outreachAllocations' }),
    ).toBeInTheDocument();
    expect(container.querySelector('h2, h3, h4')).toBeNull();
  });

  it('takes the heading a page gives it, which then names the table', () => {
    render(<MarketingRewardsTable list={[reward(1, 10)]} title="Allocations" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Allocations' })).toBeVisible();
    expect(screen.getByRole('table', { name: 'Allocations' })).toBeInTheDocument();
  });

  it('passes the accessibility audit', async () => {
    const { container } = render(<MarketingRewardsTable list={[reward(1, 10), reward(2, 0)]} />);
    await checkA11y(container);
  });
});
