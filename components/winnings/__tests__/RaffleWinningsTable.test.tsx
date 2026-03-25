import { render, screen, waitFor, checkA11y } from '@/test-utils';

import { RaffleWinningsTable, type RaffleWinning } from '../RaffleWinningsTable';

jest.mock('../../styled', () => ({
  TablePrimary: ({ children }: { children: React.ReactNode }) => (
    <table data-testid="table-primary">{children}</table>
  ),
  TablePrimaryContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TablePrimaryHead: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
  TablePrimaryHeadCell: ({ children }: { children: React.ReactNode; align?: string }) => (
    <th>{children}</th>
  ),
  TablePrimaryRow: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
  TablePrimaryCell: ({ children }: { children: React.ReactNode; align?: string }) => (
    <td>{children}</td>
  ),
}));

jest.mock('../../../hooks/useRaffleWalletContract', () => ({
  __esModule: true,
  default: () => ({
    read: {
      roundTimeoutTimesToWithdrawPrizes: jest.fn().mockResolvedValue(0),
    },
  }),
}));

jest.mock('react-super-responsive-table', () => ({
  Tr: ({ children }: { children: React.ReactNode }) => <tr>{children}</tr>,
  Tbody: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
}));

jest.mock('react-super-responsive-table/dist/SuperResponsiveTableStyle.css', () => ({}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

jest.mock('../../../utils', () => ({
  getExplorerUrl: (type: string, hash: string) => `https://explorer/${type}/${hash}`,
  convertTimestampToDateTime: (ts: number) => `date-${ts}`,
  formatSeconds: (s: number) => `${s}s`,
  shortenHex: (hex: string, len: number) => hex.slice(0, len),
}));

const winning: RaffleWinning = {
  EvtLogId: 1,
  TxHash: '0xABC123',
  TimeStamp: 1700000000,
  RoundNum: 42,
  Amount: 1.2345678,
  WinnerAddr: '0xWinner1234567890',
  Claimed: false,
};

async function renderAndFlush(list: RaffleWinning[]) {
  const result = render(<RaffleWinningsTable list={list} />);
  await waitFor(() => {});
  return result;
}

describe('RaffleWinningsTable', () => {
  it('renders table headers', async () => {
    await renderAndFlush([]);
    expect(screen.getByText('Datetime')).toBeInTheDocument();
    expect(screen.getByText('Round')).toBeInTheDocument();
    expect(screen.getByText('Winner')).toBeInTheDocument();
    expect(screen.getByText('Amount (ETH)')).toBeInTheDocument();
    expect(screen.getByText('Claimed')).toBeInTheDocument();
  });

  it('renders a winning row with correct data', async () => {
    await renderAndFlush([winning]);
    expect(screen.getByText('date-1700000000')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('1.2345678')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
  });

  it('shows "Yes" for claimed winnings', async () => {
    await renderAndFlush([{ ...winning, Claimed: true }]);
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('renders multiple rows', async () => {
    const list = [
      winning,
      { ...winning, EvtLogId: 2, RoundNum: 43 },
      { ...winning, EvtLogId: 3, RoundNum: 44 },
    ];
    await renderAndFlush(list);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('43')).toBeInTheDocument();
    expect(screen.getByText('44')).toBeInTheDocument();
  });

  it('renders empty table when list is empty', async () => {
    await renderAndFlush([]);
    expect(screen.getByTestId('table-primary')).toBeInTheDocument();
  });

  it('links round number to /prize/{round}', async () => {
    await renderAndFlush([winning]);
    const roundLink = screen.getByText('42').closest('a');
    expect(roundLink).toHaveAttribute('href', '/prize/42');
  });

  it('has no accessibility violations', async () => {
    const { container } = await renderAndFlush([winning]);
    await checkA11y(container);
  });
});
