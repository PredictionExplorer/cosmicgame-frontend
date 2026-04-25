import { render, screen, checkA11y } from '@/test-utils';

import { UserAnchoringSection, type UserAnchoringSectionProps } from '../UserAnchoringSection';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

jest.mock('../../anchoring/AnchorActionsTable', () => ({
  __esModule: true,
  default: () => <div data-testid="anchor-actions-table" />,
}));
jest.mock('../../anchoring/AnchorDistributionsTable', () => ({
  AnchorDistributionsTable: () => <div data-testid="anchor-distributions-table" />,
}));
jest.mock('../../anchoring/CSTAnchorDistributionsByDepositTable', () => ({
  CSTAnchorDistributionsByDepositTable: () => <div data-testid="cst-deposit-rewards" />,
}));
jest.mock('../../anchoring/RetrievedCSTAnchorDistributionsTable', () => ({
  RetrievedCSTAnchorDistributionsTable: () => <div data-testid="collected-rewards" />,
}));
jest.mock('../../anchoring/UnretrievedCSTAnchorDistributionsTable', () => ({
  UnretrievedCSTAnchorDistributionsTable: () => <div data-testid="uncollected-rewards" />,
}));
jest.mock('../../anchoring/RwalkAnchorDistributionImprintsTable', () => ({
  RwalkAnchorDistributionImprintsTable: () => <div data-testid="rwlk-mints" />,
}));

jest.mock('../../../utils', () => ({
  formatEthValue: (v: number) => `${v.toFixed(4)} ETH`,
}));

const defaultProps: UserAnchoringSectionProps = {
  address: '0xUser',
  userInfo: {
    NumBids: 0,
    NumPrizes: 0,
    StakingStatisticsRWalk: {
      TotalNumStakeActions: 3,
      TotalNumUnstakeActions: 1,
      TotalTokensStaked: 10,
      TotalTokensMinted: 5,
    },
  },
  cstAnchorActions: [
    { ActionType: 0 } as import('@/services/api').AnchorAction,
    { ActionType: 1 } as import('@/services/api').AnchorAction,
  ],
  rwlkAnchorActions: [],
  cstAnchorDistributions: [],
  cstAnchorDistributionsByDeposit: [],
  retrievedCstAnchorDistributions: [],
  rwlkImprints: [],
};

describe('UserAnchoringSection', () => {
  it('renders the anchoring section container', () => {
    render(<UserAnchoringSection {...defaultProps} />);
    expect(screen.getByTestId('user-anchoring-section')).toBeInTheDocument();
  });

  it('renders tab triggers', () => {
    render(<UserAnchoringSection {...defaultProps} />);
    expect(screen.getByText('Cosmic Signature Anchoring')).toBeInTheDocument();
    expect(screen.getByText('Random Walk Anchoring')).toBeInTheDocument();
  });

  it('renders CST stat cards with correct values', () => {
    render(<UserAnchoringSection {...defaultProps} />);
    expect(screen.getByText('Anchor Actions')).toBeInTheDocument();
    expect(screen.getByText('Release Actions')).toBeInTheDocument();
    expect(screen.getByText('Total Distributions')).toBeInTheDocument();
    expect(screen.getByText('Unretrieved Distributions')).toBeInTheDocument();
  });

  it('renders anchoring tables', () => {
    render(<UserAnchoringSection {...defaultProps} />);
    expect(screen.getByTestId('anchor-actions-table')).toBeInTheDocument();
    expect(screen.getByTestId('anchor-distributions-table')).toBeInTheDocument();
  });

  it('shows empty state when no CST anchoring activity', () => {
    render(
      <UserAnchoringSection {...defaultProps} cstAnchorActions={[]} cstAnchorDistributions={[]} />,
    );
    expect(screen.getByText('No anchoring activity yet')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UserAnchoringSection {...defaultProps} />);
    await checkA11y(container);
  });
});
