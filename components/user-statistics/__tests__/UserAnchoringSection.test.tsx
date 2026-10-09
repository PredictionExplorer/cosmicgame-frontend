import type { AnchorAction } from '@/services/api';

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
const mockLedger = jest.fn();
jest.mock('../AnchorDistributionsLedger', () => ({
  AnchorDistributionsLedger: (props: Record<string, unknown>) => {
    mockLedger(props);
    return <div data-testid="anchor-distributions-ledger" />;
  },
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
  canRelease: false,
  cstAnchorDistributions: [],
  cstAnchorDistributionsByDeposit: [],
  seeds: new Map(),
  rwlkImprints: [],
};

describe('UserAnchoringSection', () => {
  it('renders the anchoring section container', () => {
    render(<UserAnchoringSection {...defaultProps} />);
    expect(screen.getByTestId('user-anchoring-section')).toBeInTheDocument();
  });

  it('shows the anchor actions of an address without a profile record', () => {
    render(<UserAnchoringSection {...defaultProps} userInfo={null} />);
    const figure = (id: string) => document.querySelector(`[data-figure="${id}"]`);
    expect(figure('anchors')).toHaveTextContent('1');
    expect(screen.getByTestId('anchor-actions-table')).toBeInTheDocument();
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

  it('draws one Anchor Distributions ledger and the history, never a ledger per deposit', () => {
    render(<UserAnchoringSection {...defaultProps} />);
    expect(screen.getByTestId('anchor-actions-table')).toBeInTheDocument();
    expect(screen.getByTestId('anchor-distributions-ledger')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual([
      'myPages.statistics.anchoring.sections.distributionsByToken',
      'myPages.statistics.anchoring.sections.actions',
    ]);
  });

  it('builds one ledger row per anchored NFT with its deposits', () => {
    render(
      <UserAnchoringSection
        {...defaultProps}
        canRelease
        cstAnchorActions={[
          { ActionType: 0, TokenId: 0, TimeStamp: 1_781_506_867 } as unknown as AnchorAction,
        ]}
        cstAnchorDistributions={[
          { TokenId: 0, RewardCollectedEth: 0, RewardToCollectEth: 0.15616353675166347 },
        ]}
        cstAnchorDistributionsByDeposit={[
          {
            DepositId: 18,
            DepositRoundNum: 1,
            TimeStamp: 1_786_491_506,
            NumStakedNFTs: 17,
            DepositAmountEth: 2.6547801247782794,
            Actions: [
              {
                Stake: { TokenId: 0, ActionId: 1 },
                RewardEth: 0.15616353675166347,
                Claimed: false,
              },
            ],
          },
        ]}
      />,
    );
    const props = mockLedger.mock.calls.at(-1)?.[0] as {
      rows: { tokenId: number; anchoredAt: number; deposits: unknown[] }[];
      canRelease: boolean;
    };
    expect(props.canRelease).toBe(true);
    expect(props.rows).toHaveLength(1);
    expect(props.rows[0]).toMatchObject({ tokenId: 0, anchoredAt: 1_781_506_867 });
    expect(props.rows[0]?.deposits).toHaveLength(1);
    const figure = (id: string) => document.querySelector(`[data-figure="${id}"]`);
    expect(figure('unretrieved')).toHaveTextContent('0.1562');
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
