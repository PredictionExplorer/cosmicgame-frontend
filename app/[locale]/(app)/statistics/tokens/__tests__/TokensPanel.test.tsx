import userEvent from '@testing-library/user-event';

import { flushDynamicImports } from '@/test-utils/dynamic';

import { render, screen, checkA11y, within } from '@/test-utils';

import TokensPanel from '../TokensPanel';
import { createDashboardInfo } from '../../test-support/statisticsTestFixtures';

// The code-split charts render synchronously once their modules resolve.
jest.mock('next/dynamic', () => require('@/test-utils/dynamic').syncDynamic);
beforeAll(() => flushDynamicImports());

const mockUseDashboardInfo = jest.fn();
const mockUseCSTDistribution = jest.fn();
const mockUseCTBalancesDistribution = jest.fn();
const mockUseCTStatistics = jest.fn();
const mockUseDonationsNFTList = jest.fn();
const mockUseDonationsERC20ByRound = jest.fn();
const mockUseUniqueCSTAnchorHolders = jest.fn();

jest.mock('../../../../../../hooks/useApiQuery', () => ({
  useDashboardInfo: (...args: unknown[]) => mockUseDashboardInfo(...args),
  useCSTDistribution: (...args: unknown[]) => mockUseCSTDistribution(...args),
  useCTBalancesDistribution: (...args: unknown[]) => mockUseCTBalancesDistribution(...args),
  useCTStatistics: (...args: unknown[]) => mockUseCTStatistics(...args),
  useDonationsNFTList: (...args: unknown[]) => mockUseDonationsNFTList(...args),
  useDonationsERC20ByRound: (...args: unknown[]) => mockUseDonationsERC20ByRound(...args),
  useUniqueCSTAnchorHolders: (...args: unknown[]) => mockUseUniqueCSTAnchorHolders(...args),
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

/** The Anchoring Wallet: it holds anchored NFTs for their anchor-holders. */
const CUSTODY = '0xc0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0c0';
const HOLDER = '0x1111111111111111111111111111111111111111';
const ANCHORER = '0xa169574d0d353e3010997a3e64846b7d1b2a63b6';

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDashboardInfo.mockReturnValue(
    okQuery(
      createDashboardInfo({
        ContractAddrs: { StakingWalletCSTAddr: CUSTODY } as never,
      }),
    ),
  );
  mockUseCSTDistribution.mockReturnValue(
    okQuery([
      { OwnerAddr: HOLDER, OwnerAid: '1', NumTokens: 11 },
      { OwnerAddr: CUSTODY, OwnerAid: '2', NumTokens: 33 },
    ]),
  );
  mockUseUniqueCSTAnchorHolders.mockReturnValue(
    okQuery([
      { StakerAddr: ANCHORER, TotalTokensStaked: 30 },
      { StakerAddr: HOLDER, TotalTokensStaked: 3 },
    ]),
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
    expect(
      screen.getByRole('table', { name: 'Cosmic Signature NFT (ERC-721)' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('cst-supply-history')).toBeInTheDocument();
  });

  it('credits anchored NFTs to their anchor-holders and keeps the Anchoring Wallet out', () => {
    // V304: the wallet holding 33 anchored NFTs was listed (and counted) as a holder.
    render(<TokensPanel />);
    const ledger = screen.getByRole('table', { name: 'Cosmic Signature NFT (ERC-721)' });
    const rows = within(ledger).getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveTextContent(/0xA169/i);
    expect(rows[0]).toHaveTextContent('30');
    expect(rows[1]).toHaveTextContent('14');
    expect(within(ledger).queryByText(/0xc0c0/i)).toBeNull();
    // (The jest intl mock leaves the ICU plural unformatted.)
    expect(
      screen.getByText(/held by the Anchoring Wallet for their anchor-holders/),
    ).toBeInTheDocument();
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
    // V110: the section's own heading names it; the error never recases its title.
    expect(screen.getByText('This section did not load')).toBeInTheDocument();
    expect(screen.queryByText(/cosmic signature nft \(erc-721\)/)).toBeNull();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(refetch).toHaveBeenCalled();
  });

  it('says the attached token distribution did not load, never that there are no contracts', async () => {
    // V111: a failed dashboard read gave an empty list and the "no contracts" state.
    const user = userEvent.setup();
    const refetch = jest.fn();
    mockUseDashboardInfo.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch,
    });
    render(<TokensPanel />);
    await user.click(screen.getByRole('button', { name: 'Attached token distribution' }));
    const section = screen
      .getByRole('button', { name: 'Attached token distribution' })
      .closest('section')!;
    expect(within(section).getByText('This section did not load')).toBeInTheDocument();
    expect(within(section).queryByText(/no contracts/i)).toBeNull();
    await user.click(within(section).getByRole('button', { name: /try again/i }));
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
