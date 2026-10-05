import type { MarketingReward } from '@/services/api/types';

import { render, screen, checkA11y } from '@/test-utils';

import { RewardsHistorySection } from '../RewardsHistorySection';

const reward = (id: number): MarketingReward => ({
  EvtLogId: id,
  TxHash: `0x${String(id).padStart(64, '0')}`,
  TimeStamp: 1_700_000_000 + id,
  MarketerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  AmountEth: 100 + id,
});

describe('RewardsHistorySection', () => {
  it('titles and describes the ledger of every allocation', () => {
    const { container } = render(<RewardsHistorySection rewards={[reward(1), reward(2)]} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'marketing.history.title' }),
    ).toBeVisible();
    expect(screen.getByText('marketing.history.description')).toBeVisible();
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2);
  });

  it('explains an empty history', () => {
    render(<RewardsHistorySection rewards={[]} />);
    expect(screen.getByText('tables.empty.outreachAllocations')).toBeVisible();
    expect(screen.getByText('marketing.history.emptyDescription')).toBeVisible();
  });

  it('holds its place while loading', () => {
    const { container } = render(<RewardsHistorySection rewards={[]} loading />);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(screen.queryByText('tables.empty.outreachAllocations')).toBeNull();
  });

  it('reports a failed read with a retry', () => {
    const onRetry = jest.fn();
    render(<RewardsHistorySection rewards={[]} error="Could not load" onRetry={onRetry} />);
    expect(screen.getByText('Could not load')).toBeVisible();
    screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RewardsHistorySection rewards={[reward(1)]} />);
    await checkA11y(container);
  });
});
