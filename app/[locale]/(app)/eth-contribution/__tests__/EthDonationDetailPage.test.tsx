import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen } from '@/test-utils';

import EthDonationDetailPage from '../detail/[id]/EthDonationDetailPage';

const mockUseDonationsWithInfoById = jest.fn();
jest.mock('../../../../../hooks/useApiQuery', () => ({
  useDonationsWithInfoById: (...args: unknown[]) => mockUseDonationsWithInfoById(...args),
}));

const record = {
  EvtLogId: 18955,
  TxHash: '0x7545e61f9ae02f59dc2b1951edf97549b258eab28a40927f78178c11fec384c5',
  TimeStamp: 1782078578,
  DonorAddr: '0x4D3949CD8980E942eb9Dd24d4eCc27584a8D71fA',
  RoundNum: 1,
  AmountEth: 20,
  DataJson: '',
};

const query = (overrides: Record<string, unknown>) => ({
  data: undefined,
  isLoading: false,
  isError: false,
  refetch: jest.fn(),
  ...overrides,
});

beforeEach(() => jest.clearAllMocks());

describe('EthDonationDetailPage', () => {
  it('renders a found contribution with its contributor link', () => {
    mockUseDonationsWithInfoById.mockReturnValue(query({ data: record }));
    render(<EthDonationDetailPage id={3} />);

    expect(screen.getByRole('link', { name: record.DonorAddr })).toHaveAttribute(
      'href',
      `/user/${record.DonorAddr}`,
    );
    expect(screen.getByText('20.00 ETH')).toBeInTheDocument();
  });

  it('shows not found, not a zero record, when the id has no contribution', () => {
    mockUseDonationsWithInfoById.mockReturnValue(query({ data: null }));
    render(<EthDonationDetailPage id={7} />);

    expect(screen.getByText('Contribution not found.')).toBeInTheDocument();
    expect(screen.queryByText(/0\.00 ETH/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: '' })).not.toBeInTheDocument();
  });

  it('offers a retry instead of "not found" when the read fails', async () => {
    const refetch = jest.fn();
    mockUseDonationsWithInfoById.mockReturnValue(query({ isError: true, refetch }));
    render(<EthDonationDetailPage id={7} />);

    expect(screen.queryByText('Contribution not found.')).not.toBeInTheDocument();
    // The shared error state, as a section heading under the page title.
    expect(
      screen.getByRole('heading', { level: 2, name: 'Something went wrong' }),
    ).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('never renders an empty contributor link', async () => {
    mockUseDonationsWithInfoById.mockReturnValue(query({ data: { ...record, DonorAddr: '' } }));
    const { container } = render(<EthDonationDetailPage id={3} />);

    expect(container.querySelector('a[href="/user/"]')).toBeNull();
    expect(screen.getByText('common.status.unavailable')).toBeInTheDocument();
    await checkA11y(container);
  });
});
