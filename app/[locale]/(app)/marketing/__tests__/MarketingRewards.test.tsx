import type { MarketingReward } from '@/services/api/types';

import { render, screen, checkA11y, fireEvent } from '@/test-utils';

import MarketingRewards from '../MarketingRewards';

const mockUseMarketingRewards = jest.fn();

jest.mock('@/hooks/useApiQuery', () => ({
  useMarketingRewards: (...args: unknown[]) => mockUseMarketingRewards(...args),
}));

const reward = (id: number, addr: string, amount: number): MarketingReward => ({
  EvtLogId: id,
  TxHash: `0x${String(id).padStart(64, '0')}`,
  TimeStamp: 1_700_000_000 + id,
  MarketerAddr: addr,
  AmountEth: amount,
});

const query = (overrides: Record<string, unknown> = {}) => ({
  data: undefined,
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
  ...overrides,
});

beforeEach(() => mockUseMarketingRewards.mockReset());

describe('MarketingRewards', () => {
  it('ranks the top contributors and lists every allocation from one read', () => {
    mockUseMarketingRewards.mockReturnValue(
      query({
        data: [
          reward(1, '0x1111111111111111111111111111111111111111', 10),
          reward(2, '0x2222222222222222222222222222222222222222', 20),
        ],
      }),
    );
    render(<MarketingRewards />);
    expect(screen.getByRole('heading', { name: 'marketing.leaderboard.title' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'marketing.history.title' })).toBeVisible();
    expect(mockUseMarketingRewards).toHaveBeenCalledTimes(1);
  });

  it('holds both ledgers’ places while the read is in flight', () => {
    mockUseMarketingRewards.mockReturnValue(query({ isLoading: true }));
    const { container } = render(<MarketingRewards />);
    expect(screen.getByRole('heading', { name: 'marketing.leaderboard.title' })).toBeVisible();
    expect(container.querySelectorAll('[aria-busy="true"]')).toHaveLength(2);
  });

  it('says once that there are no allocations yet, without an empty ranking', () => {
    mockUseMarketingRewards.mockReturnValue(query({ data: [] }));
    render(<MarketingRewards />);
    expect(screen.queryByRole('heading', { name: 'marketing.leaderboard.title' })).toBeNull();
    expect(screen.getByText('tables.empty.outreachAllocations')).toBeVisible();
  });

  it('reports a failed read once, with a retry', () => {
    const refetch = jest.fn();
    mockUseMarketingRewards.mockReturnValue(query({ isError: true, refetch }));
    render(<MarketingRewards />);
    expect(screen.getAllByText("The outreach allocations couldn't be loaded.")).toHaveLength(1);
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations', async () => {
    mockUseMarketingRewards.mockReturnValue(
      query({ data: [reward(1, '0x1111111111111111111111111111111111111111', 10)] }),
    );
    const { container } = render(<MarketingRewards />);
    await checkA11y(container);
  });
});
