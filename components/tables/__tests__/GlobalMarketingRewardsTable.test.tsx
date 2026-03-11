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
    expect(screen.getByText('No rewards yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<GlobalMarketingRewardsTable list={[createReward()]} />);
    expect(screen.getAllByText('Datetime').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Marketing Agent').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Amount').length).toBeGreaterThanOrEqual(1);
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
    expect(screen.getByText('100.10 CST')).toBeInTheDocument();
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

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createReward({ EvtLogId: i, AmountEth: (i + 1) * 100 }),
    );
    render(<GlobalMarketingRewardsTable list={list} />);
    expect(screen.getByText('500.00 CST')).toBeInTheDocument();
    expect(screen.queryByText('600.00 CST')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GlobalMarketingRewardsTable list={[]} />);
    await checkA11y(container);
  });
});
