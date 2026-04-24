import { render, screen, checkA11y } from '@/test-utils';

import EthDonationDetailPage from '../[id]/EthDonationDetailPage';

const mockUseDonationsWithInfoById = jest.fn();

jest.mock('../../../../hooks/useApiQuery', () => ({
  useDonationsWithInfoById: (...args: unknown[]) => mockUseDonationsWithInfoById(...args),
}));

jest.mock('../../../../utils', () => ({
  getExplorerUrl: (type: string, hash: string) => `https://explorer/${type}/${hash}`,
  convertTimestampToDateTime: (ts: number) => `date-${ts}`,
  getMetadata: jest.fn(() => Promise.resolve({})),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

beforeEach(() => jest.clearAllMocks());

const baseDonation = {
  TxHash: '0xTX123',
  TimeStamp: 1000,
  DonorAddr: '0xDonor',
  RoundNum: 3,
  AmountEth: 5.25,
};

describe('EthDonationDetailPage', () => {
  it('shows error for negative id', () => {
    mockUseDonationsWithInfoById.mockReturnValue({ data: null, isLoading: false });
    render(<EthDonationDetailPage id={-1} />);
    expect(screen.getByText('Invalid Contribution Id')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseDonationsWithInfoById.mockReturnValue({ data: null, isLoading: true });
    render(<EthDonationDetailPage id={1} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows "not found" when data is null', () => {
    mockUseDonationsWithInfoById.mockReturnValue({ data: null, isLoading: false });
    render(<EthDonationDetailPage id={1} />);
    expect(screen.getByText('Contribution not found.')).toBeInTheDocument();
  });

  it('renders donation heading', () => {
    mockUseDonationsWithInfoById.mockReturnValue({ data: baseDonation, isLoading: false });
    render(<EthDonationDetailPage id={1} />);
    expect(screen.getByText('Direct ETH Contribution Detail')).toBeInTheDocument();
  });

  it('renders donor address', () => {
    mockUseDonationsWithInfoById.mockReturnValue({ data: baseDonation, isLoading: false });
    render(<EthDonationDetailPage id={1} />);
    expect(screen.getByText('0xDonor')).toBeInTheDocument();
  });

  it('renders round number', () => {
    mockUseDonationsWithInfoById.mockReturnValue({ data: baseDonation, isLoading: false });
    render(<EthDonationDetailPage id={1} />);
    expect(screen.getByRole('link', { name: /cycle 3/i })).toHaveAttribute('href', '/allocation/3');
  });

  it('renders amount in ETH', () => {
    mockUseDonationsWithInfoById.mockReturnValue({ data: baseDonation, isLoading: false });
    render(<EthDonationDetailPage id={1} />);
    expect(screen.getByText('5.25 ETH')).toBeInTheDocument();
  });

  it('passes id to the hook', () => {
    mockUseDonationsWithInfoById.mockReturnValue({ data: null, isLoading: false });
    render(<EthDonationDetailPage id={42} />);
    expect(mockUseDonationsWithInfoById).toHaveBeenCalledWith(42);
  });

  it('has no accessibility violations', async () => {
    mockUseDonationsWithInfoById.mockReturnValue({ data: baseDonation, isLoading: false });
    const { container } = render(<EthDonationDetailPage id={1} />);
    await checkA11y(container);
  });
});
