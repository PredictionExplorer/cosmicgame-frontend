import { fireEvent, render, screen, checkA11y, within } from '@/test-utils';

import UserStatisticsView from '../UserStatisticsView';

const defaultHookReturn = { data: undefined, isLoading: false, isError: false, refetch: jest.fn() };
const list = { data: [], isLoading: false };

const mockUseDashboardInfo = jest.fn();
const mockUseClaimHistoryByUser = jest.fn();
const mockUseUserInfo = jest.fn();
const mockUseUserBalance = jest.fn();
const mockUseCSTTokensByUser = jest.fn();
const mockUseMarketingRewardsByUser = jest.fn();
const mockMarketingRewardsTable = jest.fn();
const mockUseDepositDistributions = jest.fn();

jest.mock('../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useClaimHistoryByUser: (...args: unknown[]) => mockUseClaimHistoryByUser(...args),
  useUserInfo: (...args: unknown[]) => mockUseUserInfo(...args),
  useUserBalance: (...args: unknown[]) => mockUseUserBalance(...args),
  useCSTTokensByUser: (...args: unknown[]) => mockUseCSTTokensByUser(...args),
  useCSTAnchorActionsByUser: () => list,
  useRWLKAnchorActionsByUser: () => list,
  useMarketingRewardsByUser: (...args: unknown[]) => mockUseMarketingRewardsByUser(...args),
  useAnchorDistributionsByUser: () => list,
  useCSTAnchorDistributionsRetrievedByUser: () => list,
  useCSTAnchorDistributionsByUserByDeposit: (...args: unknown[]) =>
    mockUseDepositDistributions(...args),
  useRWLKAnchorImprintsByUser: () => list,
  useClaimedDonatedNFTByUser: () => list,
  useUnclaimedDonatedNFTByUser: () => list,
  useDonationsERC20ByUser: () => list,
}));

jest.mock('../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: '0xUser' }),
}));
jest.mock('../../hooks/useClaimAllocations', () => ({
  useClaimAllocations: () => ({
    isClaiming: { raffleETH: false, donatedNFT: false, donatedERC20: false },
    claimingDonatedNFTs: [],
    claimDonatedNFT: jest.fn(),
    claimAllDonatedNFTs: jest.fn(),
    claimDonatedERC20: jest.fn(),
    claimAllDonatedERC20: jest.fn(),
  }),
}));
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));
jest.mock('../../contexts/AnchoredTokenContext', () => ({
  useAnchoredToken: () => ({ fetchData: jest.fn() }),
}));

jest.mock('../user-statistics/UserAnchoringSection', () => ({
  UserAnchoringSection: () => <div data-testid="user-anchoring-section" />,
}));
jest.mock('../user-statistics/DonatedAssetsSection', () => ({
  DonatedAssetsSection: () => <div data-testid="attached-assets-section" />,
}));
jest.mock('../user-statistics/ProfileArtworks', () => ({
  ProfileArtworks: () => <div data-testid="profile-artworks" />,
}));
jest.mock('../tables/GestureHistoryTable', () => ({
  __esModule: true,
  default: () => <div data-testid="gesture-history-table" />,
}));
jest.mock('../tables/RecipientHistoryTable', () => ({
  __esModule: true,
  default: () => <div data-testid="winning-history-table" />,
}));
jest.mock('../tables/MarketingRewardsTable', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    mockMarketingRewardsTable(props);
    return <div data-testid="marketing-rewards-table" />;
  },
}));

const ADDRESS = '0xA169574D0d353E3010997A3E64846b7D1B2a63B6';

const userInfo = {
  UserInfo: {
    NumBids: 3,
    NumPrizes: 2,
    MaxBidAmount: 0.1456,
    CosmicSignatureNumTransfers: 6,
    TotalCSTokensWon: 3,
    SumRaffleEthWinnings: 0.5,
    SumRaffleEthWithdrawal: 0.2,
    UnclaimedNFTs: 1,
    NumRaffleEthWinnings: 3,
    RaffleNFTsCount: 2,
    RewardNFTsCount: 3,
    StakingStatisticsRWalk: {
      TotalNumStakeActions: 1,
      TotalNumUnstakeActions: 0,
      TotalTokensStaked: 2,
      TotalTokensMinted: 1,
    },
  },
  Gestures: [
    { EvtLogId: 1, RoundNum: 1, TimeStamp: 100, GestureType: 0, GestureCostEth: 0.25 },
    { EvtLogId: 2, RoundNum: 2, TimeStamp: 200, GestureType: 2, CstCost: 120 },
    { EvtLogId: 3, RoundNum: 2, TimeStamp: 300, GestureType: 0, GestureCostEth: 0.5 },
  ],
  CurrentlyStakedTokens: [],
};

const claims = [
  { RoundNum: 1, RecordType: 0, AmountEth: 11 },
  { RoundNum: 1, RecordType: 1, AmountEth: 1000 },
  { RoundNum: 1, RecordType: 5, AmountEth: 0 },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDashboardInfo.mockReturnValue({
    data: {
      CurRoundNum: 2,
      TsRoundStart: 1,
      CurNumBids: 20,
      NumRaffleEthWinnersBidding: 3,
      NumRaffleNFTWinnersBidding: 10,
    },
  });
  mockUseUserInfo.mockReturnValue({ ...defaultHookReturn, data: userInfo });
  mockUseClaimHistoryByUser.mockReturnValue({ ...defaultHookReturn, data: claims });
  mockUseUserBalance.mockReturnValue({
    ...defaultHookReturn,
    data: { CosmicTokenBalance: '1000000000000000000', ETH_Balance: '2000000000000000000' },
  });
  mockUseCSTTokensByUser.mockReturnValue(list);
  mockUseMarketingRewardsByUser.mockReturnValue(list);
  mockUseDepositDistributions.mockReturnValue(list);
});

describe('UserStatisticsView', () => {
  it('shows the invalid-address header', () => {
    // The route passes null when its URL does not hold an address.
    render(<UserStatisticsView address={null} isOwnProfile={false} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'myPages.statistics.page.invalidAddress' }),
    ).toBeInTheDocument();
  });

  it('shows the profile skeleton while the profile loads', () => {
    mockUseUserInfo.mockReturnValue({ ...defaultHookReturn, isLoading: true });
    render(<UserStatisticsView address={ADDRESS} isOwnProfile={false} />);
    expect(screen.getByTestId('statistics-loading-skeleton')).toBeInTheDocument();
  });

  it('offers a retry when the profile read fails', () => {
    const refetch = jest.fn();
    mockUseUserInfo.mockReturnValue({ ...defaultHookReturn, isError: true, refetch });
    render(<UserStatisticsView address={ADDRESS} isOwnProfile={false} />);
    expect(screen.getByText('myPages.statistics.page.loadErrorTitle')).toBeInTheDocument();
    screen.getByRole('button', { name: /try again|retry/i }).click();
    expect(refetch).toHaveBeenCalled();
  });

  it('shows the empty state only when every source is empty', () => {
    mockUseUserInfo.mockReturnValue({ ...defaultHookReturn, data: null });
    mockUseClaimHistoryByUser.mockReturnValue({ ...defaultHookReturn, data: [] });
    render(<UserStatisticsView address={ADDRESS} isOwnProfile={false} />);
    expect(screen.getByText('myPages.statistics.page.emptyTitle')).toBeInTheDocument();
    expect(screen.queryByTestId('winning-history-table')).not.toBeInTheDocument();
  });

  it('keeps allocations, anchoring and attached assets for an address without a profile record', () => {
    // Regression: a recipient who never made a gesture (no UserInfo) saw its allocation
    // figures in the header above "No activity yet", with every section and Retrieve hidden.
    mockUseUserInfo.mockReturnValue({
      ...defaultHookReturn,
      data: { UserInfo: null, Gestures: [], CurrentlyStakedTokens: [] },
    });
    render(<UserStatisticsView address={ADDRESS} isOwnProfile={false} />);
    expect(screen.queryByText('myPages.statistics.page.emptyTitle')).not.toBeInTheDocument();
    for (const key of [
      'page.sections.gestureHistory',
      'page.sections.recipientHistory',
      'page.sections.anchoring',
      'page.sections.claimableAssets',
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name: `myPages.statistics.${key}` }),
      ).toBeInTheDocument();
    }
    expect(screen.getByTestId('winning-history-table')).toBeInTheDocument();
    expect(screen.getByTestId('user-anchoring-section')).toBeInTheDocument();
    expect(screen.getByTestId('attached-assets-section')).toBeInTheDocument();
    // The figures that only the profile record carries are left out, not shown as zeros.
    expect(
      screen.queryByRole('heading', { level: 2, name: 'myPages.statistics.overview.title' }),
    ).not.toBeInTheDocument();
  });

  it('never calls the page empty while a source it could not read might hold activity', () => {
    // Regression: a failed read defaulted to [] and counted as empty, so an address whose
    // NFTs (or anchors, outreach or attached assets) did not load read "No activity yet".
    mockUseUserInfo.mockReturnValue({ ...defaultHookReturn, data: null });
    mockUseClaimHistoryByUser.mockReturnValue({ ...defaultHookReturn, data: [] });
    mockUseCSTTokensByUser.mockReturnValue({ data: undefined, isLoading: false, isError: true });
    render(<UserStatisticsView address={ADDRESS} isOwnProfile={false} />);
    expect(screen.queryByText('myPages.statistics.page.emptyTitle')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 2, name: 'myPages.statistics.page.sections.artworks' }),
    ).toBeInTheDocument();
  });

  it('says an anchoring read failed, with a retry, never "no anchoring"', () => {
    const refetch = jest.fn();
    mockUseDepositDistributions.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<UserStatisticsView address={ADDRESS} isOwnProfile={false} />);
    expect(screen.queryByTestId('user-anchoring-section')).not.toBeInTheDocument();
    expect(screen.getByText('myPages.statistics.page.sectionLoadErrorTitle')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /try again|retry/i }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('holds the header at its loaded height while the reads arrive', () => {
    // Regression (CLS 0.49 at 1440x900): the address row and the figure captions appeared
    // only with the data, so everything under the header moved when it arrived.
    mockUseUserInfo.mockReturnValue({ ...defaultHookReturn, isLoading: true });
    mockUseClaimHistoryByUser.mockReturnValue({ ...defaultHookReturn, isLoading: true });
    render(<UserStatisticsView address={ADDRESS} isOwnProfile={false} />);
    expect(screen.getByText(ADDRESS)).toBeInTheDocument();
    for (const id of ['gestures', 'spent', 'received', 'balance']) {
      const figure = document.querySelector(`[data-figure="${id}"]`) as HTMLElement;
      // The value and its caption line each hold a placeholder.
      expect(figure.querySelectorAll('dd')).toHaveLength(2);
    }
  });

  it('waits for every source before calling the page empty', () => {
    mockUseUserInfo.mockReturnValue({ ...defaultHookReturn, data: null });
    mockUseClaimHistoryByUser.mockReturnValue({ ...defaultHookReturn, isLoading: true });
    render(<UserStatisticsView address={ADDRESS} isOwnProfile={false} />);
    expect(screen.queryByText('myPages.statistics.page.emptyTitle')).not.toBeInTheDocument();
  });

  it('names another participant by address, never as "you"', () => {
    render(<UserStatisticsView address={ADDRESS} isOwnProfile={false} />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('myPages.statistics.page.participant');
    expect(h1).toHaveTextContent('0xA169…⁠63B6');
    // The whole address reads under the figures, not only in the copy button's tooltip.
    expect(screen.getByText(ADDRESS)).not.toBe(h1);
    expect(screen.getByText('myPages.statistics.page.userSubtitle')).toBeInTheDocument();
    expect(screen.queryByTestId('quick-actions')).not.toBeInTheDocument();
  });

  it('shows spending beside receipts, each figure once', () => {
    render(<UserStatisticsView address={ADDRESS} isOwnProfile={false} />);
    const figure = (id: string) => document.querySelector(`[data-figure="${id}"]`) as HTMLElement;
    expect(within(figure('gestures')).getByText('3')).toBeInTheDocument();
    // 0.25 + 0.5 ETH across the ETH gestures; the CST gesture is its own caption.
    expect(figure('spent')).toHaveTextContent('0.7500 ETH');
    expect(figure('spent')).toHaveTextContent('amount=120 CST');
    // Only the ETH allocation row counts as ETH received.
    expect(figure('received')).toHaveTextContent('11.0000 ETH');
    expect(figure('balance')).toHaveTextContent('2.0000 ETH');
    expect(screen.getAllByText('myPages.statistics.figures.gestures.label')).toHaveLength(1);
  });

  it('lists the titles the allocation records carry', () => {
    render(<UserStatisticsView address={ADDRESS} isOwnProfile={false} />);
    const titles = screen.getByRole('list', { name: 'myPages.statistics.titles.label' });
    expect(within(titles).getAllByRole('listitem')).toHaveLength(2);
  });

  it('shows this cycle’s Stellar Selection share as a plain count, never compounded', () => {
    render(<UserStatisticsView address={ADDRESS} isOwnProfile={false} />);
    // Two of the address's gestures are in cycle 2, out of the cycle's 20.
    expect(
      screen.getByText('myPages.statistics.selection.share(mine=2,total=20)'),
    ).toBeInTheDocument();
    expect(screen.getByText('10%')).toBeInTheDocument();
    // 1 - (18/20)^10 would read 65.1%; nothing on the profile compounds the share.
    expect(document.body).not.toHaveTextContent('65.1%');
  });

  it('hides the Stellar Selection share when the address has no gesture this cycle', () => {
    mockUseUserInfo.mockReturnValue({
      ...defaultHookReturn,
      data: { ...userInfo, Gestures: userInfo.Gestures.filter((g) => g.RoundNum !== 2) },
    });
    render(<UserStatisticsView address={ADDRESS} isOwnProfile={false} />);
    expect(screen.queryByText(/statistics\.selection\.share/)).not.toBeInTheDocument();
  });

  it('renders the sections as H2s', () => {
    render(<UserStatisticsView address={ADDRESS} isOwnProfile={false} />);
    for (const key of [
      'overview.title',
      'page.sections.artworks',
      'page.sections.gestureHistory',
      'page.sections.recipientHistory',
      'page.sections.anchoring',
      'page.sections.claimableAssets',
    ]) {
      expect(
        screen.getByRole('heading', { level: 2, name: `myPages.statistics.${key}` }),
      ).toBeInTheDocument();
    }
    expect(screen.getByTestId('gesture-history-table')).toBeInTheDocument();
    expect(screen.getByTestId('profile-artworks')).toBeInTheDocument();
  });

  it('lists outreach allocations under the section heading alone', () => {
    mockUseMarketingRewardsByUser.mockReturnValue({
      data: [{ EvtLogId: 1, TxHash: '0x1', TimeStamp: 100, MarketerAddr: ADDRESS, AmountEth: 5 }],
      isLoading: false,
    });
    render(<UserStatisticsView address={ADDRESS} isOwnProfile={false} />);
    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'myPages.statistics.page.sections.outreachAllocations',
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('marketing-rewards-table')).toBeInTheDocument();
    // The section names the ledger; the table adds no "Allocations" heading under it.
    expect(mockMarketingRewardsTable).toHaveBeenCalledWith(
      expect.not.objectContaining({ title: expect.anything() }),
    );
  });

  it('shows your own statistics with next steps', () => {
    render(<UserStatisticsView address={ADDRESS} isOwnProfile />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'myPages.statistics.page.ownTitle' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('quick-actions')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<UserStatisticsView address={ADDRESS} isOwnProfile={false} />);
    await checkA11y(container);
  });
});
