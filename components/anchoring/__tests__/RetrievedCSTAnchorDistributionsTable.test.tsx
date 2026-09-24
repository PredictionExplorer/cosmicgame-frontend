import type { CSTAnchorDistribution } from '@/services/api';

import { checkA11y, render, screen } from '@/test-utils';

import { RetrievedCSTAnchorDistributionsTable } from '../RetrievedCSTAnchorDistributionsTable';

const row = (overrides: Partial<CSTAnchorDistribution> = {}): CSTAnchorDistribution => ({
  EvtLogId: 1,
  RoundNum: 2,
  TokenId: 0,
  DepositId: 7,
  DepositTimeStamp: 1_786_491_506,
  TotalDepositAmountEth: 1.5,
  YourCollectedAmountEth: 0.25,
  ...overrides,
});

describe('RetrievedCSTAnchorDistributionsTable', () => {
  it('names the retrieved amount with the coined term and the cycle, not a round', () => {
    render(<RetrievedCSTAnchorDistributionsTable list={[row()]} />);
    expect(
      screen.getByText('anchoring.tables.retrievedDistributions.columns.retrievedAmountEth'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('anchoring.tables.retrievedDistributions.columns.cycle'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('href', '/allocation/2');
    expect(screen.getByText('0.2500')).toBeInTheDocument();
    expect(screen.getByText('1.5000')).toBeInTheDocument();
  });

  it('explains an empty list', () => {
    render(<RetrievedCSTAnchorDistributionsTable list={[]} />);
    expect(
      screen.getByRole('heading', { name: 'anchoring.common.empty.retrieved.title' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RetrievedCSTAnchorDistributionsTable list={[row()]} />);
    await checkA11y(container);
  });
});
