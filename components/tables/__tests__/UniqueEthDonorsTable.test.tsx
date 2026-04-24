import '@testing-library/jest-dom';

import { UniqueEthDonorsTable } from '@/components/tables/UniqueEthDonorsTable';

import { checkA11y, render, screen } from '@/test-utils';

const createDonor = (overrides = {}) => ({
  DonorAid: 1,
  DonorAddr: '0x1234567890abcdef1234567890abcdef12345678',
  CountDonations: 5,
  TotalDonatedEth: 1.23,
  ...overrides,
});

describe('UniqueEthDonorsTable', () => {
  it('renders empty state when list is empty', () => {
    render(<UniqueEthDonorsTable list={[]} />);
    expect(screen.getByText('No contributors yet.')).toBeInTheDocument();
  });

  it('renders empty state when list is null/undefined', () => {
    render(<UniqueEthDonorsTable list={null as unknown as never[]} />);
    expect(screen.getByText('No contributors yet.')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<UniqueEthDonorsTable list={[createDonor()]} />);
    expect(screen.getAllByText('Contributor Address').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Number of Contributions').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Total Contributed Amount (ETH)').length).toBeGreaterThanOrEqual(1);
  });

  it('renders donor data', () => {
    render(<UniqueEthDonorsTable list={[createDonor()]} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('1.23')).toBeInTheDocument();
  });

  it('formats TotalDonatedEth to 2 decimal places', () => {
    render(<UniqueEthDonorsTable list={[createDonor({ TotalDonatedEth: 3.1 })]} />);
    expect(screen.getByText('3.10')).toBeInTheDocument();
  });

  it('renders only first page of results (perPage=5)', () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createDonor({ DonorAid: i, CountDonations: i + 1 }),
    );
    render(<UniqueEthDonorsTable list={list} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.queryByText('6')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UniqueEthDonorsTable list={[]} />);
    await checkA11y(container);
  });
});
