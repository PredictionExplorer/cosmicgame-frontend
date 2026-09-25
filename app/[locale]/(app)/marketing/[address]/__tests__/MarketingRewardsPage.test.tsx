import type { MarketingReward } from '@/services/api/types';

import { render, screen, checkA11y, fireEvent, within } from '@/test-utils';

import MarketingRewardsPage from '../MarketingRewardsPage';

const mockUseMarketingRewardsByUser = jest.fn();

jest.mock('@/hooks/useApiQuery', () => ({
  useMarketingRewardsByUser: (...args: unknown[]) => mockUseMarketingRewardsByUser(...args),
}));

const VALID_ADDRESS = '0x1234567890abcdef1234567890abcdef12345678';
// The note sits beside the table's row range (the tables catalog renders
// keys in tests); the unit joins its number with a no-break space.
const SMALL_NOTE = 'tables.outreach.dustNote(amount=0.01\u00a0CST)';

const reward = (id: number, amount: number, timestamp: number): MarketingReward => ({
  EvtLogId: id,
  TxHash: `0x${String(id).padStart(64, '0')}`,
  TimeStamp: timestamp,
  MarketerAddr: VALID_ADDRESS,
  AmountEth: amount,
});

const query = (overrides: Record<string, unknown> = {}) => ({
  data: [],
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
  ...overrides,
});

const figure = (label: string) => {
  const term = screen.getByText(label, { selector: 'dt, dt *' });
  return term.closest('div') as HTMLElement;
};

beforeEach(() => mockUseMarketingRewardsByUser.mockReset());

describe('MarketingRewardsPage', () => {
  it('opens with an identity header under the Outreach Reserve', () => {
    mockUseMarketingRewardsByUser.mockReturnValue(query());
    render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Outreach allocations received' }),
    ).toBeVisible();
    expect(
      screen.getByText('CST this address has received from the Outreach Reserve.'),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Outreach allocations' })).toHaveAttribute(
      'href',
      '/marketing',
    );
    expect(screen.getByRole('link', { name: 'Participant profile' })).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/user\/0x[0-9a-fA-F]{40}$/),
    );
    expect(screen.getByRole('button', { name: 'common.actions.copyAddress' })).toBeVisible();
  });

  it('adds up the allocations and their date range in the header', () => {
    mockUseMarketingRewardsByUser.mockReturnValue(
      query({
        data: [reward(1, 1_000, 1_700_000_000), reward(2, 1_999, 1_720_000_000)],
      }),
    );
    render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    expect(figure('CST received')).toHaveTextContent('2,999');
    expect(figure('Allocations')).toHaveTextContent('2');
    expect(figure('First allocation')).toHaveTextContent('2023');
    expect(figure('Latest allocation')).toHaveTextContent('2024');
  });

  it('dates a single allocation once, at the smaller figure size', () => {
    mockUseMarketingRewardsByUser.mockReturnValue(query({ data: [reward(1, 25, 1_700_000_000)] }));
    render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    expect(screen.queryByText('First allocation')).not.toBeInTheDocument();
    expect(screen.queryByText('Latest allocation')).not.toBeInTheDocument();
    expect(figure('Allocated')).toHaveTextContent('2023');
    expect(figure('Allocated').querySelector('dd')).not.toHaveClass('lg:type-figure-lg');
  });

  it('mutes and explains allocations too small to show, only when there are some', () => {
    mockUseMarketingRewardsByUser.mockReturnValue(
      query({
        data: [
          reward(1, 10, 1_700_000_000),
          reward(2, 3e-15, 1_700_000_100),
          reward(3, 0, 1_700_000_200),
        ],
      }),
    );
    const { unmount } = render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    // The allocations sit under their own heading, with the note beside the
    // row range rather than as a paragraph of its own above the table.
    expect(
      screen.getByRole('heading', { level: 2, name: 'tables.outreach.allocationsTitle' }),
    ).toBeVisible();
    const pager = document.querySelector('[data-slot="table-pagination"]');
    expect(pager?.textContent).toContain(SMALL_NOTE);
    expect(screen.getByText('<0.01')).toHaveClass('text-subtle');
    // A true zero is not dust: it keeps the column's digits and its ink.
    expect(screen.getByText('0.00')).not.toHaveClass('text-subtle');
    unmount();

    mockUseMarketingRewardsByUser.mockReturnValue(query({ data: [reward(1, 10, 1_700_000_000)] }));
    render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    expect(screen.queryByText(/tables\.outreach\.dustNote/)).toBeNull();
  });

  it('shows no date figures, and an explained empty table, without allocations', () => {
    mockUseMarketingRewardsByUser.mockReturnValue(query());
    render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    expect(screen.queryByText('First allocation')).toBeNull();
    expect(screen.getByText('tables.empty.outreachAllocations')).toBeVisible();
    expect(
      screen.getByText('Allocations appear here once the outreach team sends CST to this address.'),
    ).toBeVisible();
  });

  it.each([
    ['allocations', query({ data: [reward(1, 25, 1_700_000_000)] }), true],
    ['a loading list', query({ data: undefined, isLoading: true }), true],
    ['no allocations', query(), false],
    ['a failed read', query({ data: undefined, isError: true }), false],
  ])('puts %s in the reading column only when there are rows to read', (_, state, narrow) => {
    // The empty state sat in the left 48rem column, off-centre.
    mockUseMarketingRewardsByUser.mockReturnValue(state);
    const { container } = render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    expect(container.querySelector('main > .max-w-3xl') !== null).toBe(narrow);
  });

  it('holds the figures and rows while loading', () => {
    mockUseMarketingRewardsByUser.mockReturnValue(query({ data: undefined, isLoading: true }));
    const { container } = render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
    expect(within(figure('CST received')).queryByText('0')).toBeNull();
  });

  it('reports a failed read with a retry', () => {
    const refetch = jest.fn();
    mockUseMarketingRewardsByUser.mockReturnValue(
      query({ data: undefined, isError: true, refetch }),
    );
    render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    expect(screen.getByText('The outreach allocations couldn’t be loaded.')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('checksums the address before reading', () => {
    mockUseMarketingRewardsByUser.mockReturnValue(query());
    render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    expect(mockUseMarketingRewardsByUser.mock.calls[0]?.[0]).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it('explains an invalid address without reading, with a way back', () => {
    mockUseMarketingRewardsByUser.mockReturnValue(query());
    render(<MarketingRewardsPage address="not-an-address" />);
    expect(mockUseMarketingRewardsByUser).toHaveBeenCalledWith(undefined);
    expect(screen.getByRole('heading', { level: 2, name: 'Invalid address' })).toBeVisible();
    expect(screen.getByRole('link', { name: 'All outreach allocations' })).toHaveAttribute(
      'href',
      '/marketing',
    );
  });

  it('has no accessibility violations', async () => {
    mockUseMarketingRewardsByUser.mockReturnValue(query({ data: [reward(1, 10, 1_700_000_000)] }));
    const { container } = render(<MarketingRewardsPage address={VALID_ADDRESS} />);
    await checkA11y(container);
  });
});
