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
    expect(screen.getByText('tables.empty.contributors')).toBeInTheDocument();
  });

  it('renders empty state when list is null/undefined', () => {
    render(<UniqueEthDonorsTable list={null as unknown as never[]} />);
    expect(screen.getByText('tables.empty.contributors')).toBeInTheDocument();
  });

  it('renders short table headers with no info buttons', () => {
    render(<UniqueEthDonorsTable list={[createDonor()]} />);
    // The sorted header's arrow is joined to its label by U+2060.
    const headers = screen
      .getAllByRole('columnheader')
      .map((header) => header.textContent?.replace(/\u2060/g, ''));
    expect(headers).toEqual([
      'tables.columns.contributor',
      'tables.columns.numberOfContributions',
      'tables.columns.totalContributedEth',
    ]);
    expect(
      screen.queryAllByRole('button', { name: /^tables\.tableHeaderHelp\.explainColumn/ }),
    ).toHaveLength(0);
  });

  it('renders contributor data', () => {
    render(<UniqueEthDonorsTable list={[createDonor()]} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('1.2300')).toBeInTheDocument();
  });

  it('shows ETH at the ledger precision', () => {
    render(<UniqueEthDonorsTable list={[createDonor({ TotalDonatedEth: 3.1 })]} />);
    expect(screen.getByText('3.1000')).toBeInTheDocument();
  });

  it('shows 20 rows a page with the row range', () => {
    const list = Array.from({ length: 25 }, (_, i) =>
      createDonor({ DonorAid: i, CountDonations: i + 1 }),
    );
    const { container } = render(<UniqueEthDonorsTable list={list} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(20);
    expect(screen.getByText('tables.pagination.range(from=1,to=20,total=25)')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UniqueEthDonorsTable list={[]} />);
    await checkA11y(container);
  });
});
