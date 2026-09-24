import '@testing-library/jest-dom';

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
    expect(screen.getByText('tables.empty.participants')).toBeInTheDocument();
  });

  it('renders short table headers', () => {
    render(<UniqueParticipantsTable list={[createParticipant()]} />);
    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers).toEqual([
      'tables.columns.participant',
      'tables.columns.gestureCount',
      'tables.columns.maxGestureEth',
    ]);
  });

  it('carries no info button on headers that say what they hold', () => {
    render(<UniqueParticipantsTable list={[createParticipant()]} />);
    expect(
      screen.queryAllByRole('button', { name: /^tables\.tableHeaderHelp\.explainColumn/ }),
    ).toHaveLength(0);
  });

  it('renders participant data', () => {
    render(<UniqueParticipantsTable list={[createParticipant()]} />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('1.2346')).toBeInTheDocument();
  });

  it('formats MaxBidAmountEth to the fixed 4-decimal table precision', () => {
    render(<UniqueParticipantsTable list={[createParticipant({ MaxBidAmountEth: 0.1 })]} />);
    expect(screen.getByText('0.1000')).toBeInTheDocument();
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
    // Zero keeps the column's four digits, so the decimals line up.
    expect(screen.getByText('0.0000')).toBeInTheDocument();
    expect(screen.getByText('<0.0001')).toBeInTheDocument();
  });

  it('shows 20 rows a page with the row range', () => {
    const list = Array.from({ length: 25 }, (_, i) =>
      createParticipant({
        BidderAid: String(i),
        BidderAddr: `0x${String(i).padStart(40, '0')}`,
        NumBids: i + 1,
      }),
    );
    const { container } = render(<UniqueParticipantsTable list={list} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(20);
    expect(screen.getByText('tables.pagination.range(from=1,to=20,total=25)')).toBeInTheDocument();
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
