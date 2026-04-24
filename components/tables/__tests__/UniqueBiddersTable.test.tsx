import '@testing-library/jest-dom';

import { UniqueBiddersTable } from '@/components/tables/UniqueBiddersTable';

import { checkA11y, render, screen } from '@/test-utils';

const createBidder = (overrides = {}) => ({
  BidderAid: '1',
  BidderAddr: '0x1234567890abcdef1234567890abcdef12345678',
  NumBids: 42,
  MaxBidAmountEth: 1.234567,
  ...overrides,
});

describe('UniqueBiddersTable', () => {
  it('renders empty state when list is empty', () => {
    render(<UniqueBiddersTable list={[]} />);
    expect(screen.getByText('No participants yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<UniqueBiddersTable list={[createBidder()]} />);
    expect(screen.getAllByText('Participant Address').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Number of Gestures').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Max Gesture (ETH)').length).toBeGreaterThanOrEqual(1);
  });

  it('renders participant data', () => {
    render(<UniqueBiddersTable list={[createBidder()]} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('1.234567')).toBeInTheDocument();
  });

  it('formats MaxBidAmountEth to 6 decimal places', () => {
    render(<UniqueBiddersTable list={[createBidder({ MaxBidAmountEth: 0.1 })]} />);
    expect(screen.getByText('0.100000')).toBeInTheDocument();
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createBidder({
        BidderAid: String(i),
        BidderAddr: `0x${String(i).padStart(40, '0')}`,
        NumBids: i + 1,
      }),
    );
    render(<UniqueBiddersTable list={list} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('6')).not.toBeInTheDocument();
  });

  it('renders address as link to user page', () => {
    const addr = '0xaabbccddee112233445566778899aabbccddeeff';
    render(<UniqueBiddersTable list={[createBidder({ BidderAddr: addr })]} />);
    const links = screen.getAllByRole('link');
    const userLink = links.find((l) => l.getAttribute('href')?.startsWith('/user/'));
    expect(userLink).toHaveAttribute('href', `/user/${addr}`);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UniqueBiddersTable list={[]} />);
    await checkA11y(container);
  });
});
