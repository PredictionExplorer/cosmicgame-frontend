import '@testing-library/jest-dom';

import { convertTimestampToDateTime } from '@/utils';

import { CharityDepositTable } from '@/components/tables/CharityDepositTable';

import { checkA11y, render, screen } from '@/test-utils';

const createDonation = (overrides = {}) => ({
  EvtLogId: 1,
  TxHash: '0xabc123def456abc123def456abc123def456abc123def456abc123def456abc1',
  TimeStamp: 1701346718,
  RoundNum: 5,
  DonorAddr: '0x1234567890abcdef1234567890abcdef12345678',
  AmountEth: 0.5,
  ...overrides,
});

describe('CharityDepositTable', () => {
  it('renders empty state when list is empty', () => {
    render(<CharityDepositTable list={[]} />);
    expect(screen.getByText('No contributions yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<CharityDepositTable list={[createDonation()]} />);
    expect(screen.getAllByText('Datetime').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Cycle Num').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Contributor Address').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Contribution amount (ETH)').length).toBeGreaterThanOrEqual(1);
  });

  it('renders datetime as explorer link', () => {
    const donation = createDonation();
    render(<CharityDepositTable list={[donation]} />);
    const datetime = screen.getByText(convertTimestampToDateTime(donation.TimeStamp));
    expect(datetime.closest('a')).toHaveAttribute('target', '_blank');
    expect(datetime.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders round number as a link', () => {
    render(<CharityDepositTable list={[createDonation({ RoundNum: 5 })]} />);
    const roundLink = screen.getByText('5');
    expect(roundLink.closest('a')).toHaveAttribute('href', '/prize/5');
  });

  it('renders blank cell for negative RoundNum', () => {
    render(<CharityDepositTable list={[createDonation({ RoundNum: -1 })]} />);
    expect(screen.queryByText('-1')).not.toBeInTheDocument();
  });

  it('formats AmountEth to 6 decimal places', () => {
    render(<CharityDepositTable list={[createDonation({ AmountEth: 1.5 })]} />);
    expect(screen.getByText('1.500000')).toBeInTheDocument();
  });

  it('uses perPage=10 for pagination', () => {
    const list = Array.from({ length: 12 }, (_, i) =>
      createDonation({ EvtLogId: i, RoundNum: i + 1 }),
    );
    render(<CharityDepositTable list={list} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.queryByText('11')).not.toBeInTheDocument();
  });

  it('sets rel="noopener noreferrer" on all target="_blank" links', () => {
    render(<CharityDepositTable list={[createDonation()]} />);
    const links = screen.getAllByRole('link');
    for (const link of links) {
      if (link.getAttribute('target') === '_blank') {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      }
    }
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CharityDepositTable list={[]} />);
    await checkA11y(container);
  });
});
