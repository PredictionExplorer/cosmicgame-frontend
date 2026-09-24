import '@testing-library/jest-dom';

import { convertTimestampToDateTime } from '@/utils';

import { GlobalMarketingRewardsTable } from '@/components/tables/GlobalMarketingRewardsTable';

import { checkA11y, render, screen } from '@/test-utils';

const createReward = (overrides = {}) => ({
  EvtLogId: 1,
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  MarketerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  AmountEth: 150.5,
  ...overrides,
});

describe('GlobalMarketingRewardsTable', () => {
  it('renders empty state when list is empty', () => {
    render(<GlobalMarketingRewardsTable list={[]} />);
    expect(screen.getByText('tables.empty.outreachAllocations')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<GlobalMarketingRewardsTable list={[createReward()]} />);
    expect(screen.getAllByText('tables.columns.datetime').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('tables.columns.outreachContributor').length).toBeGreaterThanOrEqual(
      1,
    );
    expect(screen.getAllByText('tables.columns.amount').length).toBeGreaterThanOrEqual(1);
  });

  it('renders datetime from TxHash as explorer link', () => {
    const reward = createReward();
    render(<GlobalMarketingRewardsTable list={[reward]} />);
    const datetime = screen.getByText(convertTimestampToDateTime(reward.TimeStamp));
    expect(datetime.closest('a')).toHaveAttribute('target', '_blank');
    expect(datetime.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('formats amount to 2 decimal places with CST suffix', () => {
    render(<GlobalMarketingRewardsTable list={[createReward({ AmountEth: 100.1 })]} />);
    const amount = screen.getByText('100.10');
    // The unit joins its number with a no-break space, so the two never split.
    expect(amount.textContent).toBe('100.10\u00a0CST');
  });

  it('sets rel="noopener noreferrer" on all target="_blank" links', () => {
    render(<GlobalMarketingRewardsTable list={[createReward()]} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      if (link.getAttribute('target') === '_blank') {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  it('shows 20 rows a page with the row range', () => {
    const list = Array.from({ length: 25 }, (_, i) =>
      createReward({ EvtLogId: i, AmountEth: (i + 1) * 100 }),
    );
    const { container } = render(<GlobalMarketingRewardsTable list={list} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(20);
    expect(screen.getByText('tables.pagination.range(from=1,to=20,total=25)')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GlobalMarketingRewardsTable list={[]} />);
    await checkA11y(container);
  });
});
