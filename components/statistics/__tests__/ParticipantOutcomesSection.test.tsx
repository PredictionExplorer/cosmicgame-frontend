import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen, within } from '@/test-utils';

import { ParticipantOutcomesSection } from '../ParticipantOutcomesSection';

const mockUseOutcomes = jest.fn();

jest.mock('../../../hooks/useApiQuery', () => ({
  useRoiLeaderboard: (...args: unknown[]) => mockUseOutcomes(...args),
}));

const entry = (addr: string, gestures: number, spent: number, received: number) => ({
  BidderAid: gestures,
  BidderAddr: addr,
  NumBids: gestures,
  RoundsParticipated: 2,
  RoundsWon: received > 0 ? 1 : 0,
  WinRate: received > 0 ? 0.5 : 0,
  TotalEthSpent: '0',
  TotalEthSpentEth: spent,
  TotalCstSpent: '0',
  TotalCstSpentEth: 120,
  EthWon: '0',
  EthWonEth: received,
  PrizesCount: received > 0 ? 3 : 0,
  CstPrizesCount: received > 0 ? 1 : 0,
  NftPrizesCount: received > 0 ? 1 : 0,
  NetPlEth: received - spent,
  Roi: 0,
});

const list = [
  entry('0x1111111111111111111111111111111111111111', 40, 2, 5),
  entry('0x2222222222222222222222222222222222222222', 810, 4, 1),
  entry('0x3333333333333333333333333333333333333333', 7, 1, 0),
];

const ok = <T,>(data: T) => ({ data, isLoading: false, isError: false, refetch: jest.fn() });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseOutcomes.mockReturnValue(ok(list));
});

describe('ParticipantOutcomesSection', () => {
  it('asks the backend in gesture order and sorts by gestures', () => {
    render(<ParticipantOutcomesSection />);
    expect(mockUseOutcomes).toHaveBeenCalledWith('bids', 5); // lexicon-allow-backend-type
    const rows = within(screen.getByRole('table')).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('810');
    expect(rows[3]).toHaveTextContent('7');
  });

  it('totals spending beside what came back, and nothing more', () => {
    render(<ParticipantOutcomesSection />);
    expect(screen.getByText(/^7(\.0+)? ETH$/)).toBeInTheDocument();
    expect(screen.getByText(/^6(\.0+)? ETH$/)).toBeInTheDocument();
  });

  // V307: a signed Net column and a "received more ETH than spent" count made the
  // page a profit-and-loss board, and the ETH-only net read CST gestures as free.
  it('shows no difference between spent and received, in figures or columns', () => {
    render(<ParticipantOutcomesSection />);
    const table = screen.getByRole('table');
    expect(screen.queryByText(/Received more|of 3$/)).not.toBeInTheDocument();
    expect(
      within(table)
        .getAllByRole('columnheader')
        .map((cell) => cell.textContent),
    ).not.toContainEqual(expect.stringMatching(/^Net/));
    expect(within(table).queryByText(/^[+−-]\d/)).toBeNull();
    expect(table.querySelector('[class*="emerald"], [class*="red-"]')).toBeNull();
    expect(screen.queryByText(/Biggest Spender|Net %/)).not.toBeInTheDocument();
  });

  it('cannot be re-ranked by cycles with an allocation', () => {
    // Regression: sorting by the allocation rate, with a "#" column counting the
    // rows, turned the table into a hit-rate ranking.
    render(<ParticipantOutcomesSection />);
    const table = screen.getByRole('table');
    const header = (name: RegExp) =>
      within(table)
        .getAllByRole('columnheader')
        .find((cell) => name.test(cell.textContent ?? ''))!;
    // A sortable header carries aria-sort; this one carries none.
    expect(header(/^Cycles with an allocation/)).not.toHaveAttribute('aria-sort');
    expect(header(/Gestures/)).toHaveAttribute('aria-sort');
    expect(within(table).queryByRole('columnheader', { name: '#' })).toBeNull();
  });

  it('counts cycles with an allocation, never as a percentage, and each count with its unit', () => {
    render(<ParticipantOutcomesSection />);
    const table = screen.getByRole('table');
    expect(within(table).getAllByText('1 of 2 cycles')).toHaveLength(2);
    expect(within(table).getAllByText('0 of 2 cycles')).toHaveLength(1);
    expect(within(table).queryByText(/%$/)).toBeNull();
    // The unit keeps its count on its line (a no-break space); the dot is visual only.
    const nft = within(table).getAllByText((_, el) => el?.textContent === '1\u00a0NFT')[0]!;
    expect(nft.parentElement!.textContent).toBe('1\u00a0NFT · 1\u00a0CST');
  });

  it('prints a zero spend at the table precision of the figures beside it', () => {
    // Regression: a bare "0" under Spent beside "0.0000" under Received.
    mockUseOutcomes.mockReturnValue(
      ok([entry('0x4444444444444444444444444444444444444444', 3, 0, 0)]),
    );
    render(<ParticipantOutcomesSection />);
    const [, row] = within(screen.getByRole('table')).getAllByRole('row');
    const figures = within(row!)
      .getAllByRole('cell')
      .map((cell) => cell.textContent);
    // Participant, gestures, then Spent (with its CST caption) and Received.
    expect(figures.slice(2, 4).map((text) => text?.slice(0, 6))).toEqual(['0.0000', '0.0000']);
  });

  it('refetches with the gesture floor a reader picks', async () => {
    const user = userEvent.setup();
    render(<ParticipantOutcomesSection />);
    await user.click(screen.getByRole('radio', { name: '25+' }));
    expect(mockUseOutcomes).toHaveBeenLastCalledWith('bids', 25); // lexicon-allow-backend-type
  });

  it('says when no participant meets the floor', () => {
    mockUseOutcomes.mockReturnValue(ok([]));
    render(<ParticipantOutcomesSection />);
    expect(screen.getByText('No participants match this filter yet.')).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<ParticipantOutcomesSection />);
    await checkA11y(container);
  });
});
