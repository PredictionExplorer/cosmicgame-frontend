import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { convertTimestampToDateTime } from '@/utils';

import { act, render, screen, waitFor, checkA11y } from '@/test-utils';

const mockSetNotification = jest.fn();
const mockFetchData = jest.fn();
const mockReleaseMany = jest.fn();
const mockWaitForTxReceipt = jest.fn().mockResolvedValue({ status: 'success' });
const mockAccount = { current: null as string | null };

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount.current }),
}));

jest.mock('../../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: mockSetNotification }),
}));

const mockContextRewards = { current: null as unknown[] | null };
const mockUnretrievedAnchorDistribution = { current: 0 };

jest.mock('../../../contexts/ApiDataContext', () => ({
  useApiData: () => ({
    apiData: { UnretrievedAnchorDistribution: mockUnretrievedAnchorDistribution.current },
    fetchData: mockFetchData,
    unclaimedRewards: mockContextRewards.current,
  }),
}));

jest.mock('../../../hooks/useAnchoringWalletCSTContract', () => ({
  __esModule: true,
  default: () => ({ write: { unstakeMany: mockReleaseMany } }),
}));

jest.mock('../../../services/api', () => ({
  __esModule: true,
  default: {
    get_staking_cst_rewards_to_claim_by_user: jest.fn().mockResolvedValue([]),
    get_staking_cst_by_user_by_deposit_rewards: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('wagmi', () => ({
  usePublicClient: () => ({ waitForTransactionReceipt: mockWaitForTxReceipt }),
}));

jest.mock('../../../utils/errors', () => ({
  isUserRejection: jest.fn(() => false),
  reportError: jest.fn(),
  getEthErrorMessage: jest.fn(() => 'An error occurred'),
}));

jest.mock('../../../utils/alert', () => ({
  __esModule: true,
  default: jest.fn((msg: string) => msg),
}));

import { UnretrievedCSTAnchorDistributionsTable } from '../UnretrievedCSTAnchorDistributionsTable';

const createRow = (overrides = {}) => ({
  EvtLogId: 1,
  DepositTimeStamp: 1701346718,
  DepositId: 5,
  YourTokensStaked: 2,
  NumStakedNFTs: 10,
  NumUnclaimedTokens: 3,
  DepositAmountEth: 1.234567,
  YourRewardAmountEth: 0.567891,
  PendingToClaimEth: 0.123456,
  ...overrides,
});

const mockApi = jest.requireMock('../../../services/api').default;

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount.current = null;
  mockContextRewards.current = null;
  mockUnretrievedAnchorDistribution.current = 0;
});

describe('UnretrievedCSTAnchorDistributionsTable', () => {
  it('renders loading state when list is null (non-own account)', async () => {
    mockApi.get_staking_cst_rewards_to_claim_by_user.mockResolvedValue(null);
    await act(async () => {
      render(<UnretrievedCSTAnchorDistributionsTable user="0xOtherUser" />);
    });
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders empty state when list is empty', async () => {
    mockApi.get_staking_cst_rewards_to_claim_by_user.mockResolvedValue([]);
    render(<UnretrievedCSTAnchorDistributionsTable user="0xOtherUser" />);
    expect(await screen.findByText('No distributions yet.')).toBeInTheDocument();
  });

  it('renders table headers', async () => {
    mockApi.get_staking_cst_rewards_to_claim_by_user.mockResolvedValue([createRow()]);
    render(<UnretrievedCSTAnchorDistributionsTable user="0xOtherUser" />);
    for (const header of [
      'Deposit Datetime',
      'Deposit ID',
      'Anchored Tokens (You / Total)',
      'Unretrieved Tokens',
      'Deposit Amount (ETH)',
      'Distribution Amount (ETH)',
      'Unretrieved Amount (ETH)',
    ]) {
      expect((await screen.findAllByText(header)).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders row data correctly', async () => {
    mockApi.get_staking_cst_rewards_to_claim_by_user.mockResolvedValue([createRow()]);
    render(<UnretrievedCSTAnchorDistributionsTable user="0xOtherUser" />);
    expect(
      (await screen.findAllByText(convertTimestampToDateTime(1701346718))).length,
    ).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText('5')).length).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText('2 / 10')).length).toBeGreaterThanOrEqual(1);
    expect((await screen.findAllByText('3')).length).toBeGreaterThanOrEqual(1);
  });

  it('formats ETH amounts to 6 decimal places', async () => {
    mockApi.get_staking_cst_rewards_to_claim_by_user.mockResolvedValue([
      createRow({ DepositAmountEth: 1.5, YourRewardAmountEth: 0.1, PendingToClaimEth: 0.2 }),
    ]);
    render(<UnretrievedCSTAnchorDistributionsTable user="0xOtherUser" />);
    expect(await screen.findByText('1.500000')).toBeInTheDocument();
    expect(screen.getByText('0.100000')).toBeInTheDocument();
    expect(screen.getByText('0.200000')).toBeInTheDocument();
  });

  it('renders only first page of results (perPage=5)', async () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createRow({ EvtLogId: i, DepositId: 100 + i }),
    );
    mockApi.get_staking_cst_rewards_to_claim_by_user.mockResolvedValue(list);
    render(<UnretrievedCSTAnchorDistributionsTable user="0xOtherUser" />);
    expect(await screen.findByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });

  it('does not show Unstake button for non-own accounts', async () => {
    mockApi.get_staking_cst_rewards_to_claim_by_user.mockResolvedValue([createRow()]);
    render(<UnretrievedCSTAnchorDistributionsTable user="0xOtherUser" />);
    await screen.findByText('5');
    expect(screen.queryByText('Release & Retrieve All')).not.toBeInTheDocument();
  });

  it('calls API to fetch uncollected rewards on mount', async () => {
    await act(async () => {
      render(<UnretrievedCSTAnchorDistributionsTable user="0xSomeUser" />);
    });
    expect(mockApi.get_staking_cst_rewards_to_claim_by_user).toHaveBeenCalledWith('0xSomeUser');
  });

  it('shows Unstake & Claim All for own account with unclaimed rewards', async () => {
    mockAccount.current = '0xOwner';
    mockUnretrievedAnchorDistribution.current = 1.5;
    mockContextRewards.current = [createRow()];
    await act(async () => {
      render(<UnretrievedCSTAnchorDistributionsTable user="0xOwner" />);
    });

    expect(screen.getByRole('button', { name: 'Release & Retrieve All' })).toBeInTheDocument();
  });

  it('own account uses context rewards without API fetch', async () => {
    mockAccount.current = '0xowner';
    mockContextRewards.current = [createRow()];
    await act(async () => {
      render(<UnretrievedCSTAnchorDistributionsTable user="0xOwner" />);
    });

    expect(mockApi.get_staking_cst_rewards_to_claim_by_user).not.toHaveBeenCalled();
  });

  it('displays claimable reward amount for own account', async () => {
    mockAccount.current = '0xOwner';
    mockUnretrievedAnchorDistribution.current = 2.345;
    mockContextRewards.current = [createRow()];
    await act(async () => {
      render(<UnretrievedCSTAnchorDistributionsTable user="0xOwner" />);
    });

    expect(screen.getByText(/2\.345000 ETH/)).toBeInTheDocument();
  });

  it('Unstake & Claim All opens confirmation dialog', async () => {
    const user = userEvent.setup();
    mockAccount.current = '0xOwner';
    mockUnretrievedAnchorDistribution.current = 1.0;
    mockContextRewards.current = [createRow()];
    await act(async () => {
      render(<UnretrievedCSTAnchorDistributionsTable user="0xOwner" />);
    });

    await user.click(screen.getByRole('button', { name: 'Release & Retrieve All' }));

    expect(screen.getByText('Release Tokens & Retrieve Distributions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Release & Retrieve' })).toBeInTheDocument();
  });

  it('Cancel button closes dialog without unstaking', async () => {
    const user = userEvent.setup();
    mockAccount.current = '0xOwner';
    mockUnretrievedAnchorDistribution.current = 1.0;
    mockContextRewards.current = [createRow()];
    await act(async () => {
      render(<UnretrievedCSTAnchorDistributionsTable user="0xOwner" />);
    });

    await user.click(screen.getByRole('button', { name: 'Release & Retrieve All' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(mockReleaseMany).not.toHaveBeenCalled();
  });

  it('Unstake & Claim calls unstakeMany and shows success notification', async () => {
    const user = userEvent.setup();
    mockAccount.current = '0xOwner';
    mockUnretrievedAnchorDistribution.current = 1.0;
    mockContextRewards.current = [createRow()];
    mockReleaseMany.mockResolvedValueOnce('0xTxHash');
    mockApi.get_staking_cst_by_user_by_deposit_rewards.mockResolvedValue([
      { Actions: [{ Claimed: false, Stake: { ActionId: 99 } }] },
    ]);
    await act(async () => {
      render(<UnretrievedCSTAnchorDistributionsTable user="0xOwner" />);
    });

    await user.click(screen.getByRole('button', { name: 'Release & Retrieve All' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Release & Retrieve' })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: 'Release & Retrieve' }));

    await waitFor(() => {
      expect(mockReleaseMany).toHaveBeenCalled();
    });
  });

  it('hides Unstake button when UnretrievedAnchorDistribution is 0', async () => {
    mockAccount.current = '0xOwner';
    mockUnretrievedAnchorDistribution.current = 0;
    mockContextRewards.current = [createRow()];
    await act(async () => {
      render(<UnretrievedCSTAnchorDistributionsTable user="0xOwner" />);
    });

    expect(screen.queryByText('Release & Retrieve All')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<UnretrievedCSTAnchorDistributionsTable user="0xOtherUser" />);
      container = result.container;
    });
    await checkA11y(container!);
  });
});
