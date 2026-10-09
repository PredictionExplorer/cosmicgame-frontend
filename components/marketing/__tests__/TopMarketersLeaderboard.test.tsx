import type { MarketingReward } from '@/services/api/types';

import { render, screen, checkA11y, within } from '@/test-utils';

import { TopMarketersLeaderboard } from '../TopMarketersLeaderboard';

const address = (digit: number) => `0x${String(digit).repeat(40)}`;

const makeReward = (addr: string, amount: number, id: number): MarketingReward => ({
  EvtLogId: id,
  TxHash: `0x${id}`,
  TimeStamp: 1_700_000_000 + id,
  MarketerAddr: addr,
  AmountEth: amount,
});

const bodyRows = (container: HTMLElement) => Array.from(container.querySelectorAll('tbody tr'));

describe('TopMarketersLeaderboard', () => {
  it('is a titled ledger with a line on how it is ranked', () => {
    render(<TopMarketersLeaderboard rewards={[makeReward(address(1), 10, 1)]} />);
    expect(
      screen.getByRole('heading', { level: 2, name: 'marketing.leaderboard.title' }),
    ).toBeVisible();
    expect(screen.getByText('marketing.leaderboard.description')).toBeVisible();
  });

  it('ranks contributors by CST received, each linked to their outreach history', () => {
    const { container } = render(
      <TopMarketersLeaderboard
        rewards={[
          makeReward(address(1), 10, 1),
          makeReward(address(2), 50, 2),
          makeReward(address(1), 30, 3),
        ]}
      />,
    );
    const rows = bodyRows(container);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('1');
    expect(within(rows[0] as HTMLElement).getByRole('link')).toHaveAttribute(
      'href',
      `/marketing/${address(2)}`,
    );
    expect(within(rows[1] as HTMLElement).getByRole('link')).toHaveAttribute(
      'href',
      `/marketing/${address(1)}`,
    );
  });

  it('shows each share of all outreach CST, CST received and the allocation count', () => {
    const { container } = render(
      <TopMarketersLeaderboard
        rewards={[
          makeReward(address(1), 10, 1),
          makeReward(address(2), 50, 2),
          makeReward(address(1), 40, 3),
        ]}
      />,
    );
    const [first] = bodyRows(container);
    expect(first).toHaveTextContent('50.0%');
    expect(first).toHaveTextContent('50.00');
    expect(first?.querySelector('.bg-track-outreach')).toHaveStyle({ width: '50%' });
    const second = bodyRows(container)[1] as HTMLElement;
    expect(second).toHaveTextContent('2');
  });

  it('explains the share column from its header', () => {
    render(<TopMarketersLeaderboard rewards={[makeReward(address(1), 10, 1)]} />);
    expect(
      screen.getAllByRole('button', { name: /marketing\.leaderboard\.columns\.share/ }).length,
    ).toBeGreaterThan(0);
  });

  it('keeps one neutral row style for every rank', () => {
    const { container } = render(
      <TopMarketersLeaderboard
        rewards={[1, 2, 3].map((digit) => makeReward(address(digit), digit * 10, digit))}
      />,
    );
    expect(container.innerHTML).not.toMatch(/yellow-|amber-|gray-300|lucide-trophy/);
  });

  it('ranks every contributor, ten to a page (regression)', () => {
    // Seven contributors were shown as five, with nothing saying two were missing.
    const seven = Array.from({ length: 7 }, (_, index) =>
      makeReward(address(index + 1), (7 - index) * 10, index),
    );
    const { container, unmount } = render(<TopMarketersLeaderboard rewards={seven} />);
    expect(bodyRows(container)).toHaveLength(7);
    unmount();

    const twelve = Array.from({ length: 12 }, (_, index) =>
      makeReward(address(index + 1), (12 - index) * 10, index),
    );
    const paged = render(<TopMarketersLeaderboard rewards={twelve} />);
    expect(bodyRows(paged.container)).toHaveLength(10);
    expect(paged.container).toHaveTextContent('tables.pagination.range(from=1,to=10,total=12)');
  });

  it('hands its loading and error states to the table', () => {
    const onRetry = jest.fn();
    render(<TopMarketersLeaderboard rewards={[]} error="Nope" onRetry={onRetry} />);
    expect(screen.getByText('Nope')).toBeVisible();
    screen.getByRole('button', { name: 'Try again' }).click();
    expect(onRetry).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <TopMarketersLeaderboard rewards={[makeReward(address(1), 10, 1)]} />,
    );
    await checkA11y(container);
  });
});
