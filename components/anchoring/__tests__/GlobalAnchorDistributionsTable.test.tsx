import userEvent from '@testing-library/user-event';

import type { CSTAnchorDistribution } from '@/services/api';

import { checkA11y, render, screen } from '@/test-utils';

import { GlobalAnchorDistributionsTable } from '../GlobalAnchorDistributionsTable';

const mockByCycle = jest.fn();
jest.mock('@/hooks/useApiQuery', () => ({
  useCSTAnchorDistributionsByCycle: (cycle: number) => mockByCycle(cycle),
}));

jest.mock('@/components/tables/AnchoringRecipientTable', () => ({
  __esModule: true,
  default: ({ list, loading }: { list: unknown[]; loading?: boolean }) => (
    <div data-testid="recipients">{loading ? 'loading' : `recipients: ${list.length}`}</div>
  ),
}));

const deposit = (overrides: Partial<CSTAnchorDistribution> = {}): CSTAnchorDistribution => ({
  EvtLogId: 1,
  RoundNum: 1,
  TokenId: 0,
  TxHash: '0xdeposit',
  TimeStamp: 1_786_491_506,
  NumStakedNFTs: 17,
  TotalDepositAmountEth: 2.65478,
  PendingToCollectEth: 2.65478,
  FullyClaimed: false,
  ...overrides,
});

beforeEach(() => {
  mockByCycle.mockReturnValue({
    data: [{}, {}],
    isLoading: false,
    error: null,
    refetch: jest.fn(),
  });
});

describe('GlobalAnchorDistributionsTable', () => {
  it('lists each cycle deposit with its NFTs, amount and what is unretrieved', () => {
    render(<GlobalAnchorDistributionsTable list={[deposit()]} />);
    expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('href', '/allocation/1');
    expect(screen.getByText('17')).toBeInTheDocument();
    expect(screen.getAllByText('2.6548')).toHaveLength(2);
    expect(screen.getByText('anchoring.common.no')).toBeInTheDocument();
  });

  it('opens a cycle onto its anchor-holders with a stateful, named toggle', async () => {
    const user = userEvent.setup();
    render(<GlobalAnchorDistributionsTable list={[deposit()]} />);
    const toggle = screen.getByRole('button', {
      name: 'anchoring.tables.globalDistributions.showRecipients',
    });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    // Recipients load only once the reader opens the cycle.
    expect(mockByCycle).not.toHaveBeenCalled();
    await user.click(toggle);
    expect(mockByCycle).toHaveBeenCalledWith(1);
    expect(screen.getByTestId('recipients')).toHaveTextContent('recipients: 2');
    expect(
      screen.getByRole('button', { name: 'anchoring.tables.globalDistributions.hideRecipients' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows the title, description and an empty state that says why', () => {
    render(
      <GlobalAnchorDistributionsTable
        list={[]}
        title="ETH Anchor Distributions"
        description="Why"
      />,
    );
    expect(
      screen.getByRole('heading', { level: 2, name: 'ETH Anchor Distributions' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: 'anchoring.common.empty.distributions.title' }),
    ).toBeInTheDocument();
  });

  it('offers a retry when the ledger fails to load', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    render(<GlobalAnchorDistributionsTable list={[]} error="Unavailable" onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalled();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GlobalAnchorDistributionsTable list={[deposit()]} />);
    await checkA11y(container);
  });
});
