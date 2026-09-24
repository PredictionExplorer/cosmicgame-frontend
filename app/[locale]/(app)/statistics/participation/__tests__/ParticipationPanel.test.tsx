import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import ParticipationPanel from '../ParticipationPanel';

const mockUseUniqueParticipants = jest.fn();
const mockUseUniqueRecipients = jest.fn();
const mockUseUniqueDonors = jest.fn();

jest.mock('../../../../../../hooks/useApiQuery', () => ({
  useUniqueParticipants: (...args: unknown[]) => mockUseUniqueParticipants(...args),
  useUniqueRecipients: (...args: unknown[]) => mockUseUniqueRecipients(...args),
  useUniqueDonors: (...args: unknown[]) => mockUseUniqueDonors(...args),
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

jest.mock('../../../../../../components/tables/UniqueParticipantsTable', () => ({
  UniqueParticipantsTable: ({ list }: { list: { BidderAddr: string }[] }) => (
    <div data-testid="unique-participants-table">
      {list.length} rows: {list.map((row) => row.BidderAddr).join(' ')}
    </div>
  ),
}));
jest.mock('../../../../../../components/tables/UniqueRecipientsTable', () => ({
  UniqueRecipientsTable: () => <div data-testid="unique-recipients-table" />,
}));
jest.mock('../../../../../../components/tables/UniqueEthDonorsTable', () => ({
  UniqueEthDonorsTable: () => <div data-testid="unique-eth-contributors-table" />,
}));

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseUniqueParticipants.mockReturnValue(
    okQuery([
      { BidderAid: '1', BidderAddr: '0xaaa', NumBids: 2, MaxBidAmountEth: 0.1 },
      { BidderAid: '2', BidderAddr: '0xbbb', NumBids: 9, MaxBidAmountEth: 0.5 },
    ]),
  );
  mockUseUniqueRecipients.mockReturnValue(okQuery([{ WinnerAid: '1', WinnerAddr: '0xccc' }]));
  mockUseUniqueDonors.mockReturnValue(okQuery([{ DonorAid: '1', DonorAddr: '0xddd' }]));
});

describe('ParticipationPanel', () => {
  it('renders the three ledgers under H2 sections, leaving the counts to the header', () => {
    render(<ParticipationPanel />);
    expect(
      screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent),
    ).toEqual(['Unique participants', 'Unique recipients', 'Unique ETH contributors']);
    expect(document.querySelector('.stat-card-value')).not.toBeInTheDocument();
  });

  it('sorts participants by gesture count before rendering the table', () => {
    render(<ParticipationPanel />);
    expect(screen.getByTestId('unique-participants-table')).toHaveTextContent(
      '2 rows: 0xbbb 0xaaa',
    );
  });

  it('shows a skeleton while a table query loads', () => {
    mockUseUniqueParticipants.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    render(<ParticipationPanel />);
    const section = screen.getByRole('heading', { name: 'Unique participants' }).closest('section');
    expect(section).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByTestId('unique-participants-table')).not.toBeInTheDocument();
  });

  it('shows an error state with retry when a table query fails', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseUniqueRecipients.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<ParticipationPanel />);
    expect(screen.getByText(/failed to load unique recipients/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows empty states when lists are empty', () => {
    mockUseUniqueDonors.mockReturnValue(okQuery([]));
    render(<ParticipationPanel />);
    expect(screen.getByText('No ETH contributions yet')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ParticipationPanel />);
    await checkA11y(container);
  });
});
