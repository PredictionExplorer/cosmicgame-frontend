import '@testing-library/jest-dom';

import { UniqueRecipientsTable } from '@/components/tables/UniqueRecipientsTable';

import { checkA11y, render, screen } from '@/test-utils';

const createRecipient = (overrides = {}) => ({
  WinnerAid: '1',
  WinnerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  AllocationsCount: 10,
  MaxWinAmountEth: 2.5,
  PrizesSum: 15.75,
  ...overrides,
});

describe('UniqueRecipientsTable', () => {
  it('renders empty state when list is empty', () => {
    render(<UniqueRecipientsTable list={[]} />);
    expect(screen.getByText('No recipients yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<UniqueRecipientsTable list={[createRecipient()]} />);
    expect(screen.getAllByText('Recipient Address').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Allocations Received').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Max Allocation (ETH)').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Allocations Sum (ETH)').length).toBeGreaterThanOrEqual(1);
  });

  it('renders recipient data', () => {
    render(<UniqueRecipientsTable list={[createRecipient()]} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('2.500000')).toBeInTheDocument();
    expect(screen.getByText('15.750000')).toBeInTheDocument();
  });

  it('formats ETH values to 6 decimal places', () => {
    render(
      <UniqueRecipientsTable list={[createRecipient({ MaxWinAmountEth: 0.1, PrizesSum: 0.2 })]} />,
    );
    expect(screen.getByText('0.100000')).toBeInTheDocument();
    expect(screen.getByText('0.200000')).toBeInTheDocument();
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 7 }, (_, i) =>
      createRecipient({ WinnerAid: String(i), AllocationsCount: i + 1 }),
    );
    render(<UniqueRecipientsTable list={list} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('6')).not.toBeInTheDocument();
  });

  it('renders address as link to user page', () => {
    const addr = '0xaabbccddee112233445566778899aabbccddeeff';
    render(<UniqueRecipientsTable list={[createRecipient({ WinnerAddr: addr })]} />);
    const links = screen.getAllByRole('link');
    const userLink = links.find((l) => l.getAttribute('href')?.startsWith('/user/'));
    expect(userLink).toHaveAttribute('href', `/user/${addr}`);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UniqueRecipientsTable list={[]} />);
    await checkA11y(container);
  });
});
