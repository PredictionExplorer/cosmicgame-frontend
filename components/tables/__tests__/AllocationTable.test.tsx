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

  it('lays every cycle out in one aligned ledger, its tracks under one ETH heading', () => {
    const { container } = render(<AllocationTable list={[createAllocation()]} loading={false} />);

    expect(screen.getByRole('table', { name: 'tables.allocation.listAria' })).toBeInTheDocument();
    const [groupRow, headerRow] = [...container.querySelectorAll('thead tr')];
    // "ETH by track" spans the five tracks, in the order of the reserve
    // split; "NFTs" spans the two NFT counts.
    const groups = [...groupRow!.querySelectorAll('th')].map((th) => [
      th.textContent,
      th.getAttribute('colspan'),
    ]);
    expect(groups).toEqual([
      ['tables.allocation.groups.eth', '5'],
      ['tables.allocation.groups.nfts', '2'],
    ]);
    const headers = [...headerRow!.querySelectorAll('th')].map((th) => th.textContent);
    expect(headers).toEqual([
      'tables.columns.cycle',
      'tables.allocation.columns.finalized',
      'tables.columns.recipient',
      'tables.allocation.columns.signature',
      'tables.allocation.columns.chrono',
      'tables.allocation.columns.stellar',
      'tables.allocation.columns.anchor',
      'tables.allocation.columns.publicGoods',
      'tables.allocation.gestures',
      'tables.allocation.columns.attached',
      'tables.allocation.columns.stellar',
    ]);
    const signature = screen.getByRole('columnheader', {
      name: 'tables.allocation.columns.signature',
    });
    expect(signature).toHaveAttribute('data-align', 'end');
  });

  it('names each grouped value in full in a phone record', () => {
    const { container } = render(<AllocationTable list={[createAllocation()]} loading={false} />);
    const labels = [...container.querySelectorAll('tbody tr:first-child td')].map((cell) =>
      cell.getAttribute('data-label'),
    );
    expect(labels).toEqual(
      expect.arrayContaining([
        'tables.allocation.columns.signatureEth',
        'tables.allocation.columns.publicGoodsEth',
        'tables.allocation.columns.nftsAttached',
        'tables.allocation.columns.nftsViaStellar',
      ]),
    );
    // Attached NFTs stay on a phone: the record has room for them.
    const attached = container.querySelector(
      'tbody td[data-label="tables.allocation.columns.nftsAttached"]',
    );
    expect(attached).toHaveAttribute('data-priority', 'primary');
  });

  it('shows each track amount without a repeated unit, and counts grouped', () => {
    render(
      <AllocationTable list={[createAllocation({ CharityAmountETH: 3.0972 })]} loading={false} />,
    );
    expect(screen.getByText('1.5000')).toBeInTheDocument();
    expect(screen.getByText('0.4000')).toBeInTheDocument();
    expect(screen.getByText('2.5000')).toBeInTheDocument();
    expect(screen.getByText('0.7500')).toBeInTheDocument();
    expect(screen.getByText('3.0972')).toBeInTheDocument();
    expect(screen.getByText('1,042')).toBeInTheDocument();
  });

  it('links the Recipient to their participant page', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    render(<AllocationTable list={[createAllocation({ WinnerAddr: addr })]} loading={false} />);
    const links = screen.getAllByRole('link');
    expect(links.some((link) => link.getAttribute('href') === `/user/${addr}`)).toBe(true);
  });

  it('says a finalized cycle’s missing date or recipient could not be read', () => {
    const { container } = render(
      <AllocationTable
        list={[createAllocation({ WinnerAddr: '', TimeStamp: 0 })]}
        loading={false}
      />,
    );
    const recipient = container.querySelector('tbody td[data-kind="address"]');
    expect(recipient).not.toHaveAttribute('data-empty');
    expect(screen.getAllByText('tables.status.unavailable')).toHaveLength(2);
  });

  it('leads each row to its cycle page, from the cycle cell and from anywhere on the row', async () => {
    const user = userEvent.setup();
    render(<AllocationTable list={[createAllocation({ RoundNum: 7 })]} loading={false} />);

    // The visible "Cycle 7" names the link on its own.
    const link = screen.getByRole('link', { name: 'tables.allocation.cycle(cycle=7)' });
    expect(link).toHaveAttribute('href', '/allocation/7');
    expect(within(link).getByText('tables.allocation.cycle(cycle=7)')).toBeInTheDocument();

    await user.click(screen.getByText('1,042'));
    expect(mockPush).toHaveBeenCalledWith('/allocation/7');
  });

  it('needs no info button: the grouped headers name every column in full', () => {
    render(
      <AllocationTable
        list={[createAllocation({ RoundNum: 1 }), createAllocation({ RoundNum: 2 })]}
        loading={false}
      />,
    );
    expect(
      screen.queryAllByRole('button', { name: /tables\.tableHeaderHelp\.explainColumn/ }),
    ).toHaveLength(0);
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
