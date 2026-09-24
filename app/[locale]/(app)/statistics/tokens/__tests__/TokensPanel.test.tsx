import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y, within } from '@/test-utils';

import TokensPanel from '../TokensPanel';
import { createDashboardInfo } from '../../test-support/statisticsTestFixtures';

const mockUseDashboardInfo = jest.fn();
const mockUseCSTDistribution = jest.fn();
const mockUseCTBalancesDistribution = jest.fn();
const mockUseCTStatistics = jest.fn();
const mockUseDonationsNFTList = jest.fn();
const mockUseDonationsERC20ByRound = jest.fn();

jest.mock('../../../../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useCSTDistribution: (...args: unknown[]) => mockUseCSTDistribution(...args),
  useCTBalancesDistribution: (...args: unknown[]) => mockUseCTBalancesDistribution(...args),
  useCTStatistics: (...args: unknown[]) => mockUseCTStatistics(...args),
  useDonationsNFTList: (...args: unknown[]) => mockUseDonationsNFTList(...args),
  useDonationsERC20ByRound: (...args: unknown[]) => mockUseDonationsERC20ByRound(...args),
}));

jest.mock('../../../../../../components/tokens/CSTokenDistributionTable', () => ({
  CSTokenDistributionTable: ({ list }: { list: unknown[] }) => (
    <div data-testid="cs-token-distribution-table">{list.length} holders</div>
  ),
}));
jest.mock('../../../../../../components/statistics/CstSupplyHistory', () => ({
  CstSupplyHistory: () => <div data-testid="cst-supply-history" />,
}));
jest.mock('../../../../../../components/attachments/AttachedNFTDistributionTable', () => ({
  __esModule: true,
  default: () => <div data-testid="attached-nft-distribution-table" />,
}));
jest.mock('../../../../../../components/attachments/AttachedNFT', () => ({
  __esModule: true,
  default: ({ nft }: { nft: { RoundNum?: number } }) => (
    <div data-testid="attached-nft-card">round {nft.RoundNum}</div>
  ),
}));
jest.mock('../../../../../../components/attachments/AttachedERC20Table', () => ({
  __esModule: true,
  default: ({ list }: { list: unknown[] }) => (
    <div data-testid="attached-erc20-table">{list.length} tokens</div>
  ),
}));

function okQuery<T>(data: T) {
  return { data, isLoading: false, isError: false, refetch: jest.fn() };
}

const nfts = [
  { RecordId: 1, RoundNum: 1, DonorAddr: '0xd1', TokenAddr: '0xt1', TokenId: 10 },
  { RecordId: 2, RoundNum: 3, DonorAddr: '0xd2', TokenAddr: '0xt2', TokenId: 20 },
  { RecordId: 3, RoundNum: 3, DonorAddr: '0xd3', TokenAddr: '0xt3', TokenId: 30 },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDashboardInfo.mockReturnValue(okQuery(createDashboardInfo()));
  mockUseCSTDistribution.mockReturnValue(
    okQuery([{ OwnerAddr: '0x1', OwnerAid: '1', NumTokens: 11 }]),
  );
  mockUseCTBalancesDistribution.mockReturnValue(
    okQuery([
      { OwnerAddr: '0x1', OwnerAid: '1', BalanceFloat: 12096.25 },
      { OwnerAddr: '0x2', OwnerAid: '2', BalanceFloat: 10080.58 },
    ]),
  );
  mockUseCTStatistics.mockReturnValue(okQuery({ TotalSupplyEth: 44352.66 }));
  mockUseDonationsNFTList.mockReturnValue(okQuery(nfts));
  mockUseDonationsERC20ByRound.mockReturnValue(okQuery([]));
});

describe('TokensPanel', () => {
  it('renders the distribution sections with data', () => {
    render(<TokensPanel />);
    expect(screen.getByTestId('cs-token-distribution-table')).toHaveTextContent('1 holders');
    expect(screen.getByTestId('cst-supply-history')).toBeInTheDocument();
  });

  it('lists every CST holder once, with its share of the supply, and says how many there are', () => {
    render(<TokensPanel />);
    // (The jest intl mock leaves ICU plurals unformatted; the supply is interpolated.)
    expect(
      screen.getByText(/Shares are of the total supply, 44,352\.66 CST\.$/),
    ).toBeInTheDocument();
    const ledger = screen.getByRole('table', { name: 'CST (ERC-20) balance distribution' });
    // Two holders, largest first; no second chart repeating the same wallets.
    const rows = within(ledger).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent('27.3%');
    expect(rows[1]).toHaveTextContent('22.7%');
  });

  it('drops the share sentence to the holder count when the supply cannot be read', () => {
    mockUseCTStatistics.mockReturnValue({ ...okQuery(undefined), isError: true });
    render(<TokensPanel />);
    expect(screen.getByText(/CST, largest balance first\.$/)).toBeInTheDocument();
    expect(screen.queryByText(/Shares are of the total supply/)).not.toBeInTheDocument();
  });

  it('shows an error state with retry when a distribution query fails', async () => {
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseCSTDistribution.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<TokensPanel />);
    expect(
      screen.getByText(/failed to load cosmic signature nft \(erc-721\)/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  describe('attached assets section', () => {
    it('shows all attached NFTs by default', () => {
      render(<TokensPanel />);
      expect(screen.getAllByTestId('attached-nft-card')).toHaveLength(3);
    });

    it('filters to the current cycle when the scope toggle is used', async () => {
      const user = userEvent.setup();
      render(<TokensPanel />);
      await user.click(screen.getByRole('radio', { name: 'Current cycle' }));
      // Fixture dashboard has CurRoundNum 3; two of the three NFTs are from round 3.
      expect(screen.getAllByTestId('attached-nft-card')).toHaveLength(2);
      expect(screen.getByRole('radio', { name: 'Current cycle' })).toBeChecked();
    });

    it('shows a scoped empty state when the current cycle has no attached NFTs', async () => {
      const user = userEvent.setup();
      mockUseDonationsNFTList.mockReturnValue(
        okQuery([{ RecordId: 1, RoundNum: 1, DonorAddr: '0xd1', TokenAddr: '0xt1', TokenId: 1 }]),
      );
      render(<TokensPanel />);
      await user.click(screen.getByRole('radio', { name: 'Current cycle' }));
      expect(screen.getByText('No NFTs attached this cycle')).toBeInTheDocument();
    });

    it('shows the ERC-20 tab content', async () => {
      const user = userEvent.setup();
      mockUseDonationsERC20ByRound.mockReturnValue(okQuery([{ TokenAddr: '0xe1' }]));
      render(<TokensPanel />);
      await user.click(screen.getByRole('tab', { name: 'Tokens (ERC-20)' }));
      expect(await screen.findByTestId('attached-erc20-table')).toHaveTextContent('1 tokens');
    });

    it('shows an error state with retry when the NFT list fails', async () => {
      const user = userEvent.setup();
      const refetch = jest.fn();
      mockUseDonationsNFTList.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch,
      });
      render(<TokensPanel />);
      expect(screen.getByText(/failed to load attached nfts/i)).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: /try again/i }));
      expect(refetch).toHaveBeenCalled();
    });
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<TokensPanel />);
    await checkA11y(container);
  });
});
