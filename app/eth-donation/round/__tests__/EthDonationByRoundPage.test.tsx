import { render, screen } from '@/test-utils';

import EthDonationByRoundPage from '../[round]/EthDonationByRoundPage';

const mockUseDonationsBothByRound = jest.fn();

jest.mock('../../../../hooks/useApiQuery', () => ({
  useDonationsBothByRound: (...args: unknown[]) => mockUseDonationsBothByRound(...args),
}));

jest.mock('../../../../components/tables/EthDonationTable', () => ({
  __esModule: true,
  default: ({ list }: { list: unknown[] }) => (
    <div data-testid="donation-table">rows: {list.length}</div>
  ),
}));

beforeEach(() => jest.clearAllMocks());

describe('EthDonationByRoundPage', () => {
  it('renders the heading with round number', () => {
    mockUseDonationsBothByRound.mockReturnValue({ data: [], isLoading: false });
    render(<EthDonationByRoundPage round={7} />);
    expect(screen.getByText('Direct (ETH) Donations for Round 7')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseDonationsBothByRound.mockReturnValue({ data: [], isLoading: true });
    render(<EthDonationByRoundPage round={1} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders the table when loaded', () => {
    mockUseDonationsBothByRound.mockReturnValue({
      data: [{ id: 1 }],
      isLoading: false,
    });
    render(<EthDonationByRoundPage round={1} />);
    expect(screen.getByTestId('donation-table')).toHaveTextContent('rows: 1');
  });

  it('shows error for negative round', () => {
    mockUseDonationsBothByRound.mockReturnValue({ data: [], isLoading: false });
    render(<EthDonationByRoundPage round={-1} />);
    expect(screen.getByText('Invalid Round Number')).toBeInTheDocument();
  });

  it('does not render table for negative round', () => {
    mockUseDonationsBothByRound.mockReturnValue({ data: [], isLoading: false });
    render(<EthDonationByRoundPage round={-1} />);
    expect(screen.queryByTestId('donation-table')).not.toBeInTheDocument();
  });
});
