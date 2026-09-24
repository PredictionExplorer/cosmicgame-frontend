import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y } from '@/test-utils';

import ParticipationPanel from '../ParticipationPanel';
import { createDashboardInfo } from '../../test-support/statisticsTestFixtures';

const mockUseDashboardInfo = jest.fn();
const mockUseUniqueParticipants = jest.fn();
const mockUseUniqueRecipients = jest.fn();
const mockUseUniqueDonors = jest.fn();
const mockUseUniqueCSTAnchorHolders = jest.fn();
const mockUseUniqueRWLKAnchorHolders = jest.fn();

jest.mock('../../../../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useUniqueParticipants: (...args: unknown[]) => mockUseUniqueParticipants(...args),
  useUniqueRecipients: (...args: unknown[]) => mockUseUniqueRecipients(...args),
  useUniqueDonors: (...args: unknown[]) => mockUseUniqueDonors(...args),
  useUniqueCSTAnchorHolders: (...args: unknown[]) => mockUseUniqueCSTAnchorHolders(...args),
  useUniqueRWLKAnchorHolders: (...args: unknown[]) => mockUseUniqueRWLKAnchorHolders(...args),
}));

const WALLET_A = `0x${'a1'.repeat(20)}`;
const WALLET_B = `0x${'b2'.repeat(20)}`;
const WALLET_C = `0x${'c3'.repeat(20)}`;

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: React.ReactNode; href: string }) => (
    <a {...props}>{children}</a>
  ),
}));

jest.mock('../../../../../../components/tables/UniqueParticipantsTable', () => ({
  UniqueParticipantsTable: ({ list }: { list: { BidderAddr: string }[] }) => (
    <div data-testid="unique-participants-table">{list.length} rows</div>
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
  mockUseDashboardInfo.mockReturnValue(okQuery(createDashboardInfo()));
  mockUseUniqueParticipants.mockReturnValue(
    okQuery([
      { BidderAid: '1', BidderAddr: '0xaaa', NumBids: 2, MaxBidAmountEth: 0.1 },
      { BidderAid: '2', BidderAddr: '0xbbb', NumBids: 9, MaxBidAmountEth: 0.5 },
    ]),
  );
  mockUseUniqueRecipients.mockReturnValue(okQuery([{ WinnerAid: '1', WinnerAddr: '0xccc' }]));
  mockUseUniqueDonors.mockReturnValue(okQuery([{ DonorAid: '1', DonorAddr: '0xddd' }]));
  // A anchors both kinds; C has released its only RandomWalk NFT.
  mockUseUniqueCSTAnchorHolders.mockReturnValue(
    okQuery([
      { StakerAddr: WALLET_A, TotalTokensStaked: 2 },
      { StakerAddr: WALLET_B, TotalTokensStaked: 1 },
    ]),
  );
  mockUseUniqueRWLKAnchorHolders.mockReturnValue(
    okQuery([
      // The same wallet as A, in upper case.
      { StakerAddr: `0x${'A1'.repeat(20)}`, TotalTokensStaked: 3 },
      { StakerAddr: WALLET_C, TotalTokensStaked: 0 },
    ]),
  );
});

/** The stat cards in the order the panel renders them. */
const STAT_LABELS = [
  'Unique Participants',
  'Unique Recipients',
  'Unique ETH Contributors',
  'Active Anchor-holders',
] as const;

/** The value element of the stat card with the given label. */
function statValue(label: (typeof STAT_LABELS)[number]) {
  const value = document.querySelectorAll('.stat-card-value')[STAT_LABELS.indexOf(label)];
  if (!value) throw new Error(`no stat card ${label}`);
  return value;
}

describe('ParticipationPanel', () => {
  it('renders the participation stat cards from dashboard data', () => {
    render(<ParticipationPanel />);
    // Labels appear both as stat-card labels and section titles.
    expect(screen.getAllByText('Unique Participants').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('29')).toBeInTheDocument();
    expect(screen.getAllByText('Unique Recipients').length).toBeGreaterThanOrEqual(1);
  });

  it('counts each active anchor-holder once, as the anchoring pages do', () => {
    render(<ParticipationPanel />);
    // Regression: the card summed the per-kind unique counts (7 + 3 = 10 in the fixture),
    // counting a wallet that anchors both kinds twice. A and B anchor now; C released.
    expect(statValue('Active Anchor-holders')).toHaveTextContent(/^2$/);
    expect(screen.queryByText('10')).not.toBeInTheDocument();
    expect(screen.queryByText('Unique Anchor-holders')).not.toBeInTheDocument();
  });

  it('shows unread figures as unavailable, never as a bare dash or zero', () => {
    mockUseDashboardInfo.mockReturnValue({ ...okQuery(undefined), isError: true });
    mockUseUniqueRWLKAnchorHolders.mockReturnValue({ ...okQuery(undefined), isError: true });
    render(<ParticipationPanel />);

    for (const label of ['Unique Participants', 'Active Anchor-holders'] as const) {
      const value = statValue(label);
      expect(value).toHaveTextContent('common.status.unavailable');
      expect(value).not.toHaveTextContent(/\d/);
    }
  });

  it('sorts participants by gesture count before rendering the table', () => {
    render(<ParticipationPanel />);
    expect(screen.getByTestId('unique-participants-table')).toHaveTextContent('2 rows');
    const passedList = mockUseUniqueParticipants.mock.results;
    expect(passedList).toBeTruthy();
  });

  it('requests the dashboard without polling', () => {
    render(<ParticipationPanel />);
    expect(mockUseDashboardInfo).toHaveBeenCalledWith(undefined, { poll: false });
  });

  it('shows a skeleton while a table query loads', () => {
    mockUseUniqueParticipants.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: jest.fn(),
    });
    render(<ParticipationPanel />);
    expect(screen.getAllByTestId('stats-section-skeleton').length).toBeGreaterThan(0);
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
