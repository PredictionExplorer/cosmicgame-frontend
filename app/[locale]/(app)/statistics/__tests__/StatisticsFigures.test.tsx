import { render, screen } from '@/test-utils';

import {
  ActiveAnchorHoldersFigure,
  CstSupplyFigure,
  DashboardCountFigure,
  NftHoldersFigure,
} from '../StatisticsFigures';
import { dashboardCount } from '../dashboardCounts';
import { createDashboardInfo } from '../test-support/statisticsTestFixtures';

const mockUseDashboardInfo = jest.fn();
const mockUseUniqueCSTAnchorHolders = jest.fn();
const mockUseUniqueRWLKAnchorHolders = jest.fn();
const mockUseCSTDistribution = jest.fn();
const mockUseCTBalancesDistribution = jest.fn();
const mockUseCTStatistics = jest.fn();

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useUniqueCSTAnchorHolders: (...args: unknown[]) => mockUseUniqueCSTAnchorHolders(...args),
  useUniqueRWLKAnchorHolders: (...args: unknown[]) => mockUseUniqueRWLKAnchorHolders(...args),
  useCSTDistribution: (...args: unknown[]) => mockUseCSTDistribution(...args),
  useCTBalancesDistribution: (...args: unknown[]) => mockUseCTBalancesDistribution(...args),
  useCTStatistics: (...args: unknown[]) => mockUseCTStatistics(...args),
}));

const WALLET_A = `0x${'a1'.repeat(20)}`;
const WALLET_B = `0x${'b2'.repeat(20)}`;
const WALLET_C = `0x${'c3'.repeat(20)}`;

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}
const failedQuery = () => ({ ...okQuery(undefined), isError: true });
const loadingQuery = () => ({ ...okQuery(undefined), isLoading: true });

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDashboardInfo.mockReturnValue(okQuery(createDashboardInfo()));
  // A anchors both kinds; C has released its only Random Walk NFT.
  mockUseUniqueCSTAnchorHolders.mockReturnValue(
    okQuery([
      { StakerAddr: WALLET_A, TotalTokensStaked: 2 },
      { StakerAddr: WALLET_B, TotalTokensStaked: 1 },
    ]),
  );
  mockUseUniqueRWLKAnchorHolders.mockReturnValue(
    okQuery([
      // The same wallet as A, in upper case.
      { StakerAddr: `0x${'A1'.repeat(20)}`, TotalTokensStaked: 3 },
      { StakerAddr: WALLET_C, TotalTokensStaked: 0 },
    ]),
  );
});

describe('statistics header figures', () => {
  it('counts each active anchor-holder once, as the anchoring pages do', () => {
    // Regression: the header summed the per-kind unique counts, counting a wallet that
    // anchors both kinds twice. A and B anchor now; C released.
    const { container } = render(<ActiveAnchorHoldersFigure />);
    expect(container).toHaveTextContent(/^2$/);
  });

  it('shows an unread count as unavailable, never as a dash alone or zero', () => {
    mockUseUniqueRWLKAnchorHolders.mockReturnValue(failedQuery());
    const { container } = render(<ActiveAnchorHoldersFigure />);
    expect(container).toHaveTextContent('common.status.unavailable');
    expect(container).not.toHaveTextContent(/\d/);
  });

  it('holds a skeleton, not a number, while a list count loads', () => {
    mockUseCSTDistribution.mockReturnValue(loadingQuery());
    const { container } = render(<NftHoldersFigure />);
    expect(container.querySelector('[aria-hidden]')).toBeInTheDocument();
    expect(container).not.toHaveTextContent(/\d/);
  });

  it('starts a dashboard count from the server read, then follows the live query', () => {
    mockUseDashboardInfo.mockReturnValue(loadingQuery());
    const { container, rerender } = render(
      <DashboardCountFigure metric="uniqueParticipants" seed={1_234} />,
    );
    expect(container).toHaveTextContent('1,234');

    mockUseDashboardInfo.mockReturnValue(okQuery(createDashboardInfo()));
    rerender(<DashboardCountFigure metric="uniqueParticipants" seed={1_234} />);
    expect(container).toHaveTextContent(/^29$/);
    expect(mockUseDashboardInfo).toHaveBeenCalledWith(undefined, { poll: false });
  });

  it('shows the CST supply as an amount, or unavailable when it cannot be read', () => {
    mockUseCTStatistics.mockReturnValue(okQuery({ TotalSupplyEth: 44_352.66 }));
    const { container, rerender } = render(<CstSupplyFigure />);
    expect(container).toHaveTextContent(/^44,352\.66\sCST$/);

    mockUseCTStatistics.mockReturnValue(failedQuery());
    rerender(<CstSupplyFigure />);
    expect(screen.getByText('common.status.unavailable')).toBeInTheDocument();
  });
});

describe('dashboardCount', () => {
  it('reads each count, and null when the dashboard does not carry it', () => {
    const data = createDashboardInfo();
    expect(dashboardCount(data, 'uniqueParticipants')).toBe(29);
    expect(dashboardCount(data, 'uniqueRecipients')).toBe(6);
    expect(dashboardCount(data, 'uniqueContributors')).toBe(2);
    expect(dashboardCount(data, 'attachedNfts')).toBe(4);
    expect(dashboardCount(null, 'attachedNfts')).toBeNull();
    expect(
      dashboardCount(createDashboardInfo({ NumDonatedNFTs: undefined }), 'attachedNfts'),
    ).toBeNull();
  });
});
