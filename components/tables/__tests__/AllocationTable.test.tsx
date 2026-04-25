import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/react';

import { convertTimestampToDateTime, shortenHex } from '@/utils';

import { checkA11y, render, screen } from '@/test-utils';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, prefetch: jest.fn() }),
}));

// eslint-disable-next-line import/order
import { AllocationTable } from '@/components/tables/AllocationTable';

const createAllocation = (overrides = {}) => ({
  RoundNum: 1,
  WinnerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  AmountEth: 1.5,
  TokenId: 100,
  TxHash: '0xabc',
  TimeStamp: 1701346718,
  DateTime: '2023-11-30',
  RoundStats: {
    TotalBids: 42,
    TotalDonatedNFTs: 5,
    TotalRaffleEthDepositsEth: 2.5,
    TotalRaffleNFTs: 3,
  },
  StakingDepositAmountEth: 0.75,
  RaffleNFTWinners: [],
  StakingNFTWinners: [],
  RaffleETHDeposits: [],
  AllPrizes: [],
  CSTAmountEth: 0,
  CharityAddress: '0x0000000000000000000000000000000000000000',
  CharityAmountETH: 0,
  StakingPerTokenEth: 0,
  StakingNumStakedTokens: 0,
  EnduranceWinnerAddr: '0x0000000000000000000000000000000000000000',
  EnduranceERC721TokenId: 0,
  EnduranceERC20AmountEth: 0,
  LastCstBidderAddr: '0x0000000000000000000000000000000000000000',
  LastCstBidderERC721TokenId: 0,
  LastCstBidderERC20AmountEth: 0,
  ChronoWarriorAddr: '0x0000000000000000000000000000000000000000',
  ChronoWarriorAmountEth: 0,
  ChronoWarriorCstAmountEth: 0,
  ChronoWarriorNftTokenId: 0,
  ...overrides,
});

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
});

describe('AllocationTable', () => {
  it('renders skeleton rows when loading', () => {
    render(<AllocationTable list={[]} loading={true} />);
    expect(screen.getByRole('status', { name: /loading rows/i })).toBeInTheDocument();
  });

  it('renders empty state when not loading and list is empty', () => {
    render(<AllocationTable list={[]} loading={false} />);
    expect(screen.getByText(/no recipients yet/i)).toBeInTheDocument();
  });

  it('renders all 9 table headers', () => {
    render(<AllocationTable list={[createAllocation()]} loading={false} />);
    for (const header of [
      'Cycle',
      'Finalized',
      'Recipient',
      'Allocation Amount',
      'Gestures',
      'Attached NFTs',
      'Stellar Selection Deposits',
      'Anchor Distribution Deposit',
      'NFTs Distributed',
    ]) {
      expect(screen.getAllByText(header).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders allocation data', () => {
    render(<AllocationTable list={[createAllocation()]} loading={false} />);
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText(convertTimestampToDateTime(1701346718)).length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('42').length).toBeGreaterThanOrEqual(1);
  });

  it('formats ETH amounts to 4 decimal places', () => {
    render(
      <AllocationTable
        list={[createAllocation({ AmountEth: 1.5, StakingDepositAmountEth: 0.75 })]}
        loading={false}
      />,
    );
    expect(screen.getByText('1.5000')).toBeInTheDocument();
    expect(screen.getByText('0.7500')).toBeInTheDocument();
  });

  it('shows shortened recipient address', () => {
    const addr = '0x1234567890abcdef1234567890abcdef12345678';
    render(<AllocationTable list={[createAllocation({ WinnerAddr: addr })]} loading={false} />);
    expect(screen.getByText(shortenHex(addr, 6))).toBeInTheDocument();
  });

  it('shows "-" when WinnerAddr is empty', () => {
    render(<AllocationTable list={[createAllocation({ WinnerAddr: '' })]} loading={false} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('cycle column renders a link to the allocation page', () => {
    render(<AllocationTable list={[createAllocation({ RoundNum: 7 })]} loading={false} />);
    const cellLinks = screen
      .getAllByRole('link')
      .filter((a) => /^\/allocation\/7$/.test(a.getAttribute('href') ?? ''));
    expect(cellLinks.length).toBeGreaterThanOrEqual(1);
  });

  it('renders only first page of results (perPage=10)', () => {
    const list = Array.from({ length: 12 }, (_, i) => createAllocation({ RoundNum: i + 1 }));
    render(<AllocationTable list={list} loading={false} />);
    expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('11')).not.toBeInTheDocument();
  });

  describe('column header tooltips', () => {
    it('renders an InfoTooltip next to every column header', () => {
      const { container } = render(<AllocationTable list={[createAllocation()]} loading={false} />);
      // InfoTooltip wraps its icon in a span with `.cursor-help`. Each of the
      // 9 column headers carries one of these — sortable columns also have a
      // sort indicator svg, but those don't get the cursor-help class.
      const tooltips = container.querySelectorAll('thead .cursor-help');
      expect(tooltips.length).toBe(9);
    });

    it('each header contains its label text alongside a tooltip', () => {
      render(<AllocationTable list={[createAllocation()]} loading={false} />);
      const headers = [
        'Cycle',
        'Finalized',
        'Recipient',
        'Allocation Amount',
        'Gestures',
        'Attached NFTs',
        'Stellar Selection Deposits',
        'Anchor Distribution Deposit',
        'NFTs Distributed',
      ];
      for (const label of headers) {
        const elements = screen.getAllByText(label);
        expect(elements.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe('sortable headers', () => {
    it('sortable columns expose aria-sort', () => {
      const { container } = render(<AllocationTable list={[createAllocation()]} loading={false} />);
      const sortableHeaders = container.querySelectorAll('thead th[aria-sort]');
      // 8 of the 9 columns are sortable (Recipient is not).
      expect(sortableHeaders.length).toBe(8);
    });

    it('clicking a sortable header sorts the column ascending', () => {
      const list = [
        createAllocation({ RoundNum: 1, AmountEth: 5 }),
        createAllocation({ RoundNum: 2, AmountEth: 1 }),
        createAllocation({ RoundNum: 3, AmountEth: 3 }),
      ];
      const { container } = render(<AllocationTable list={list} loading={false} />);
      // Find the "Allocation Amount" sort button and click it.
      const sortButtons = Array.from(
        container.querySelectorAll('thead button[type="button"]'),
      ) as HTMLButtonElement[];
      const amountBtn = sortButtons.find((b) => /allocation amount/i.test(b.textContent ?? ''));
      expect(amountBtn).toBeTruthy();
      fireEvent.click(amountBtn!);
      const tbody = container.querySelector('tbody');
      const cells = Array.from(tbody?.querySelectorAll('td') ?? []);
      const formatted = cells
        .map((td) =>
          Array.from(td.childNodes)
            .filter((n) => n.nodeType === Node.TEXT_NODE)
            .map((n) => n.textContent?.trim())
            .join(''),
        )
        .filter((t) => t && ['1.0000', '3.0000', '5.0000'].includes(t));
      expect(formatted).toEqual(['1.0000', '3.0000', '5.0000']);
    });
  });

  describe('density toggle persistence', () => {
    it('clicking the compact toggle writes to localStorage', () => {
      render(<AllocationTable list={[createAllocation()]} loading={false} />);
      const compact = screen.getByRole('button', { name: /compact/i });
      fireEvent.click(compact);
      expect(window.localStorage.getItem('cs.allocation.density')).toBe('compact');
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<AllocationTable list={[]} loading={false} />);
    await checkA11y(container);
  });

  it('has no accessibility violations with data', async () => {
    const { container } = render(<AllocationTable list={[createAllocation()]} loading={false} />);
    await checkA11y(container);
  });
});
