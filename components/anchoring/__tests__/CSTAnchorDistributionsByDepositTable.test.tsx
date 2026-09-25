import { checkA11y, render, screen } from '@/test-utils';

import {
  CSTAnchorDistributionsByDepositTable,
  type CSTAnchorDistributionByDeposit,
} from '../CSTAnchorDistributionsByDepositTable';

jest.mock('@/hooks/useApiQuery', () => ({
  // The live cycle behind every cycle link (useCycleHref).
  useDashboardInfo: () => ({ data: { CurRoundNum: 99 } }),
}));

const deposit = (
  overrides: Partial<CSTAnchorDistributionByDeposit> = {},
): CSTAnchorDistributionByDeposit => ({
  EvtLogId: 1,
  TxHash: '0xdeposit',
  TimeStamp: 1_786_491_506,
  DepositRoundNum: 1,
  DepositId: 18,
  DepositAmountEth: 2.65478,
  ClaimedAmountEth: 0.5,
  YourClaimableAmountEth: 0.1562,
  FullyClaimed: false,
  NumStakedNFTs: 17,
  NumTokensCollected: 3,
  YourTokensStaked: 1,
  ...overrides,
});

describe('CSTAnchorDistributionsByDepositTable', () => {
  it('shows the deposit, what this address can retrieve and whether it is complete', () => {
    render(<CSTAnchorDistributionsByDepositTable list={[deposit()]} />);
    expect(screen.getByText('2.6548')).toBeInTheDocument();
    expect(screen.getByText('0.1562')).toBeInTheDocument();
    expect(screen.getByText('anchoring.common.no')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
  });

  it('links the cycle and proves the deposit on the explorer', () => {
    render(<CSTAnchorDistributionsByDepositTable list={[deposit()]} />);
    expect(screen.getByRole('link', { name: 'tables.allocation.cycle(cycle=1)' })).toHaveAttribute(
      'href',
      '/allocation/1',
    );
    const proof = document.querySelector('a[href*="0xdeposit"]');
    expect(proof).toHaveAttribute('target', '_blank');
  });

  it('explains an empty list', () => {
    render(<CSTAnchorDistributionsByDepositTable list={[]} />);
    expect(
      screen.getByRole('heading', { name: 'anchoring.common.empty.distributions.title' }),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CSTAnchorDistributionsByDepositTable list={[deposit()]} />);
    await checkA11y(container);
  });
});
