import '@testing-library/jest-dom';

import { statisticsCopy } from '@/content/statistics-copy';

import { UniqueParticipantsTable } from '@/components/tables/UniqueParticipantsTable';

import { checkA11y, render, screen } from '@/test-utils';

const createParticipant = (overrides = {}) => ({
  BidderAid: '1',
  BidderAddr: '0x1234567890abcdef1234567890abcdef12345678',
  NumBids: 42,
  MaxBidAmountEth: 1.234567,
  ...overrides,
});

describe('UniqueParticipantsTable', () => {
  it('renders empty state when list is empty', () => {
    render(<UniqueParticipantsTable list={[]} />);
    expect(screen.getByText('No participants yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<UniqueParticipantsTable list={[createParticipant()]} />);
    expect(screen.getAllByText('Participant Address').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Number of Gestures').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Max Gesture (ETH)').length).toBeGreaterThanOrEqual(1);
  });

  it('renders header help triggers for confusing columns', () => {
    render(<UniqueParticipantsTable list={[createParticipant()]} />);
    expect(
      screen.getAllByRole('button', { name: /^Explain column:/ }).length,
    ).toBeGreaterThanOrEqual(3);
    expect(statisticsCopy.tables.numberOfGestures).toMatch(/gestures/);
  });

  it('renders participant data', () => {
    render(<UniqueParticipantsTable list={[createParticipant()]} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('1.234567')).toBeInTheDocument();
  });

  it('formats MaxBidAmountEth without a trailing-zero wall', () => {
    render(<UniqueParticipantsTable list={[createParticipant({ MaxBidAmountEth: 0.1 })]} />);
    expect(screen.getByText('0.1')).toBeInTheDocument();
  });

  it('renders zero and dust amounts distinctly', () => {
    render(
      <UniqueParticipantsTable
        list={[
          createParticipant({
            BidderAid: 'zero',
            BidderAddr: `0x${'1'.repeat(40)}`,
            MaxBidAmountEth: 0,
          }),
          createParticipant({
            BidderAid: 'dust',
            BidderAddr: `0x${'2'.repeat(40)}`,
            MaxBidAmountEth: 0.00000001,
          }),
        ]}
      />,
    );
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('<0.0001')).toBeInTheDocument();
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createParticipant({
        BidderAid: String(i),
        BidderAddr: `0x${String(i).padStart(40, '0')}`,
        NumBids: i + 1,
      }),
    );
    render(<UniqueParticipantsTable list={list} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('6')).not.toBeInTheDocument();
  });

  it('renders address as link to user page', () => {
    const addr = '0xaabbccddee112233445566778899aabbccddeeff';
    render(<UniqueParticipantsTable list={[createParticipant({ BidderAddr: addr })]} />);
    const links = screen.getAllByRole('link');
    const userLink = links.find((l) => l.getAttribute('href')?.startsWith('/user/'));
    expect(userLink).toHaveAttribute('href', `/user/${addr}`);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UniqueParticipantsTable list={[]} />);
    await checkA11y(container);
  });
});
