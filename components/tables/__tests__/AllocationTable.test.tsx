import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { AllocationTable } from '@/components/tables/AllocationTable';
import type { RoundInfo } from '@/services/api';

import { checkA11y, render, screen, within } from '@/test-utils';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

const ZERO = '0x0000000000000000000000000000000000000000';

const createAllocation = (overrides: Partial<RoundInfo> = {}): RoundInfo => ({
  RoundNum: 1,
  WinnerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  AmountEth: 1.5,
  TokenId: 100,
  TxHash: '0xabc',
  TimeStamp: 1701346718,
  DateTime: '2023-11-30',
  RoundStats: {
    TotalBids: 1042,
    TotalDonatedNFTs: 5,
    TotalRaffleEthDepositsEth: 2.5,
    TotalRaffleNFTs: 3,
  } as RoundInfo['RoundStats'],
  StakingDepositAmountEth: 0.75,
  RaffleNFTWinners: [],
  StakingNFTWinners: [],
  RaffleETHDeposits: [],
  AllPrizes: [],
  CSTAmountEth: 0,
  CharityAddress: ZERO,
  CharityAmountETH: 0,
  StakingPerTokenEth: 0,
  StakingNumStakedTokens: 0,
  EnduranceWinnerAddr: ZERO,
  EnduranceERC721TokenId: 0,
  EnduranceERC20AmountEth: 0,
  LastCstBidderAddr: ZERO,
  LastCstBidderERC721TokenId: 0,
  LastCstBidderERC20AmountEth: 0,
  ChronoWarriorAddr: ZERO,
  ChronoWarriorAmountEth: 0.4,
  ChronoWarriorCstAmountEth: 0,
  ChronoWarriorNftTokenId: 0,
  ...overrides,
});

beforeEach(() => mockPush.mockClear());

describe('AllocationTable', () => {
  it('holds placeholder rows while loading', () => {
    render(<AllocationTable list={[]} loading />);
    expect(screen.getByRole('table')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('tables.skeleton.loadingRows');
  });

  it('renders the empty state when not loading and the list is empty', () => {
    render(<AllocationTable list={[]} loading={false} />);
    expect(screen.getByText('tables.empty.recipientCyclesTitle')).toBeInTheDocument();
    expect(screen.getByText('tables.empty.recipientCyclesDescription')).toBeInTheDocument();
  });

  it('lays every cycle out in one aligned ledger', () => {
    render(<AllocationTable list={[createAllocation()]} loading={false} />);

    expect(screen.getByRole('table', { name: 'tables.allocation.listAria' })).toBeInTheDocument();
    // A header's textContent also carries its tooltip's hidden description.
    const headers = screen
      .getAllByRole('columnheader')
      .map((th) => th.textContent?.replace(/tables\.allocation\.\w+Help$/, ''));
    expect(headers).toEqual(
      expect.arrayContaining([
        'tables.columns.cycle',
        'tables.allocation.columns.finalized',
        'tables.allocation.columns.signatureEth',
        'tables.allocation.columns.chronoEth',
        'tables.allocation.columns.stellarEth',
        'tables.allocation.columns.anchorEth',
        'tables.allocation.columns.nftsViaStellar',
      ]),
    );
    const signature = screen.getByRole('columnheader', {
      name: 'tables.allocation.columns.signatureEth',
    });
    expect(signature).toHaveAttribute('data-align', 'end');
  });

  it('shows each track amount without a repeated unit, and counts grouped', () => {
    render(<AllocationTable list={[createAllocation()]} loading={false} />);
    expect(screen.getByText('1.5000')).toBeInTheDocument();
    expect(screen.getByText('0.4000')).toBeInTheDocument();
    expect(screen.getByText('2.5000')).toBeInTheDocument();
    expect(screen.getByText('0.7500')).toBeInTheDocument();
    expect(screen.getByText('1,042')).toBeInTheDocument();
  });

  it('links the Recipient to their participant page', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    render(<AllocationTable list={[createAllocation({ WinnerAddr: addr })]} loading={false} />);
    const links = screen.getAllByRole('link');
    expect(links.some((link) => link.getAttribute('href') === `/user/${addr}`)).toBe(true);
  });

  it('leaves the Recipient blank when a cycle has none', () => {
    const { container } = render(
      <AllocationTable list={[createAllocation({ WinnerAddr: '' })]} loading={false} />,
    );
    const recipient = container.querySelector('tbody td[data-kind="address"]');
    expect(recipient).toHaveAttribute('data-empty', 'true');
  });

  it('leads each row to its cycle page, from the cycle cell and from anywhere on the row', async () => {
    const user = userEvent.setup();
    render(<AllocationTable list={[createAllocation({ RoundNum: 7 })]} loading={false} />);

    const link = screen.getByRole('link', {
      name: 'tables.allocation.openDetails(cycle=7)',
    });
    expect(link).toHaveAttribute('href', '/allocation/7');
    expect(within(link).getByText('tables.allocation.cycle(cycle=7)')).toBeInTheDocument();

    await user.click(screen.getByText('1,042'));
    expect(mockPush).toHaveBeenCalledWith('/allocation/7');
  });

  it('carries each explanation once, on its column header', () => {
    render(
      <AllocationTable
        list={[createAllocation({ RoundNum: 1 }), createAllocation({ RoundNum: 2 })]}
        loading={false}
      />,
    );
    expect(
      screen.getAllByRole('button', { name: /tables\.tableHeaderHelp\.explainColumn/ }),
    ).toHaveLength(6);
  });

  it('shows 20 cycles a page', () => {
    const list = Array.from({ length: 25 }, (_, i) => createAllocation({ RoundNum: i }));
    const { container } = render(<AllocationTable list={list} loading={false} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(20);
    expect(screen.getByText('tables.pagination.range(from=1,to=20,total=25)')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AllocationTable list={[createAllocation()]} loading={false} />);
    await checkA11y(container);
  });
});
