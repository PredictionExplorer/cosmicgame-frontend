import { render, screen, checkA11y } from '@/test-utils';

import EthDonationByRoundPage from '../[round]/EthDonationByRoundPage';

const mockUseDonationsBothByRound = jest.fn();

jest.mock('../../../../hooks/useApiQuery', () => ({
  useDonationsBothByRound: (...args: unknown[]) => mockUseDonationsBothByRound(...args),
}));

jest.mock('../../../../components/tables/EthDonationTable', () => ({
  __esModule: true,
  default: ({ list }: { list: unknown[] }) => (
    <div data-testid="contribution-table">rows: {list.length}</div>
  ),
}));

beforeEach(() => jest.clearAllMocks());

describe('EthDonationByRoundPage', () => {
  it('renders the heading with round number', () => {
    mockUseDonationsBothByRound.mockReturnValue({ data: [], isLoading: false });
    render(<EthDonationByRoundPage round={7} />);
    expect(screen.getByText('Direct (ETH) Contributions for Cycle 7')).toBeInTheDocument();
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
    expect(screen.getByTestId('contribution-table')).toHaveTextContent('rows: 1');
  });

  it('shows error for negative round', () => {
    mockUseDonationsBothByRound.mockReturnValue({ data: [], isLoading: false });
    render(<EthDonationByRoundPage round={-1} />);
    expect(screen.getByText('Invalid Cycle Number')).toBeInTheDocument();
  });

  it('does not render table for negative round', () => {
    mockUseDonationsBothByRound.mockReturnValue({ data: [], isLoading: false });
    render(<EthDonationByRoundPage round={-1} />);
    expect(screen.queryByTestId('contribution-table')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    mockUseDonationsBothByRound.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<EthDonationByRoundPage round={7} />);
    await checkA11y(container);
  });
});
