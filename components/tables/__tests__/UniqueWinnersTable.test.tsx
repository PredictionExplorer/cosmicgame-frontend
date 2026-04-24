import '@testing-library/jest-dom';

import { UniqueWinnersTable } from '@/components/tables/UniqueWinnersTable';

import { checkA11y, render, screen } from '@/test-utils';

const createWinner = (overrides = {}) => ({
  WinnerAid: '1',
  WinnerAddr: '0x1234567890abcdef1234567890abcdef12345678',
  PrizesCount: 10,
  MaxWinAmountEth: 2.5,
  PrizesSum: 15.75,
  ...overrides,
});

describe('UniqueWinnersTable', () => {
  it('renders empty state when list is empty', () => {
    render(<UniqueWinnersTable list={[]} />);
    expect(screen.getByText('No recipients yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<UniqueWinnersTable list={[createWinner()]} />);
    expect(screen.getAllByText('Recipient Address').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Allocations Received').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Max Allocation (ETH)').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Allocations Sum (ETH)').length).toBeGreaterThanOrEqual(1);
  });

  it('renders recipient data', () => {
    render(<UniqueWinnersTable list={[createWinner()]} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('2.500000')).toBeInTheDocument();
    expect(screen.getByText('15.750000')).toBeInTheDocument();
  });

  it('formats ETH values to 6 decimal places', () => {
    render(<UniqueWinnersTable list={[createWinner({ MaxWinAmountEth: 0.1, PrizesSum: 0.2 })]} />);
    expect(screen.getByText('0.100000')).toBeInTheDocument();
    expect(screen.getByText('0.200000')).toBeInTheDocument();
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 7 }, (_, i) =>
      createWinner({ WinnerAid: String(i), PrizesCount: i + 1 }),
    );
    render(<UniqueWinnersTable list={list} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('6')).not.toBeInTheDocument();
  });

  it('renders address as link to user page', () => {
    const addr = '0xaabbccddee112233445566778899aabbccddeeff';
    render(<UniqueWinnersTable list={[createWinner({ WinnerAddr: addr })]} />);
    const links = screen.getAllByRole('link');
    const userLink = links.find((l) => l.getAttribute('href')?.startsWith('/user/'));
    expect(userLink).toHaveAttribute('href', `/user/${addr}`);
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UniqueWinnersTable list={[]} />);
    await checkA11y(container);
  });
});
