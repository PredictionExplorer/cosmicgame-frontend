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
    expect(
      screen.getByText('myPages.statistics.anchoring.tabs.cosmicSignature'),
    ).toBeInTheDocument();
    expect(screen.getByText('myPages.statistics.anchoring.tabs.randomWalk')).toBeInTheDocument();
  });

  it('renders the Cosmic Signature figure strip with its counts', () => {
    render(<UserAnchoringSection {...defaultProps} />);
    const figure = (id: string) => document.querySelector(`[data-figure="${id}"]`);
    expect(figure('anchors')).toHaveTextContent('myPages.statistics.anchoring.stats.anchorActions');
    expect(figure('anchors')).toHaveTextContent('1');
    expect(figure('releases')).toHaveTextContent('1');
    expect(figure('distributions')).toHaveTextContent('0 ETH');
    expect(figure('unretrieved')).toBeInTheDocument();
  });

  it('draws the NFT kinds as underline tabs with short labels', () => {
    render(<UserAnchoringSection {...defaultProps} />);
    expect(
      screen.getByRole('tablist', { name: 'myPages.statistics.anchoring.tabs.label' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(2);
  });

  it('titles each ledger with an H3', () => {
    render(<UserAnchoringSection {...defaultProps} />);
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'myPages.statistics.anchoring.sections.actions',
      }),
    ).toBeInTheDocument();
  });

  it('renders anchoring tables', () => {
    render(<UserAnchoringSection {...defaultProps} />);
    expect(screen.getByTestId('anchor-actions-table')).toBeInTheDocument();
    expect(screen.getByTestId('anchor-distributions-table')).toBeInTheDocument();
  });

  it('shows empty state when no Cosmic Signature NFT anchoring activity', () => {
    render(
      <UserAnchoringSection {...defaultProps} cstAnchorActions={[]} cstAnchorDistributions={[]} />,
    );
    expect(
      screen.getByText('myPages.statistics.anchoring.empty.cosmicSignatureTitle'),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UserAnchoringSection {...defaultProps} />);
    await checkA11y(container);
  });
});
