import '@testing-library/jest-dom';

import { convertTimestampToDateTime } from '@/utils';

import { render, screen, checkA11y } from '@/test-utils';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

// eslint-disable-next-line import/order
import EthDonationTable from '@/components/tables/EthDonationTable';

const createDonation = (overrides = {}) => ({
  EvtLogId: '1',
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  RecordType: 0,
  CGRecordId: '100',
  RoundNum: '5',
  DonorAddr: '0x1234567890abcdef1234567890abcdef12345678',
  AmountEth: 0.5,
  ...overrides,
});

describe('EthDonationTable', () => {
  it('renders "No contributions yet." when list is empty', () => {
    render(<EthDonationTable list={[]} />);
    expect(screen.getByText('No contributions yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<EthDonationTable list={[createDonation()]} />);
    const headers = screen.getAllByText('Datetime');
    expect(headers.length).toBeGreaterThanOrEqual(1);
  });

  it('renders datetime from data', () => {
    const donation = createDonation();
    render(<EthDonationTable list={[donation]} />);
    expect(screen.getByText(convertTimestampToDateTime(donation.TimeStamp))).toBeInTheDocument();
  });

  it('renders round number', () => {
    render(<EthDonationTable list={[createDonation({ RoundNum: '5' })]} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders amount', () => {
    render(<EthDonationTable list={[createDonation({ AmountEth: 0.5 })]} />);
    expect(screen.getByText('0.50')).toBeInTheDocument();
  });

  it('shows contribution type when showType is true', () => {
    render(<EthDonationTable list={[createDonation({ RecordType: 0 })]} showType={true} />);
    expect(screen.getByText('Simple contribution')).toBeInTheDocument();
  });

  it('shows "Contribution with info" for RecordType > 0', () => {
    render(<EthDonationTable list={[createDonation({ RecordType: 1 })]} showType={true} />);
    expect(screen.getByText('Contribution with info')).toBeInTheDocument();
  });

  it('sets rel="noopener noreferrer" on all target="_blank" links', () => {
    render(<EthDonationTable list={[createDonation()]} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      if (link.getAttribute('target') === '_blank') {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  it('renders TxHash datetime as a link to explorer', () => {
    const donation = createDonation();
    render(<EthDonationTable list={[donation]} />);
    const datetimeLink = screen.getByText(convertTimestampToDateTime(donation.TimeStamp));
    expect(datetimeLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(datetimeLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders round number as a link', () => {
    render(<EthDonationTable list={[createDonation({ RoundNum: '5' })]} />);
    const roundLink = screen.getByText('5');
    expect(roundLink.closest('a')).toHaveAttribute('href', '/allocation/5');
    expect(roundLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(roundLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<EthDonationTable list={[]} />);
    await checkA11y(container);
  });
});
