import '@testing-library/jest-dom';

import { convertTimestampToDateTime } from '@/utils';

import { render, screen } from '@/test-utils';

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: null }),
}));

jest.mock('../../../contexts/NotificationContext', () => ({
  useNotification: () => ({ setNotification: jest.fn() }),
}));

jest.mock('../../../contexts/ApiDataContext', () => ({
  useApiData: () => ({
    apiData: { UnclaimedStakingReward: 0 },
    fetchData: jest.fn(),
    unclaimedRewards: null,
  }),
}));

jest.mock('../../../hooks/useStakingWalletCSTContract', () => ({
  __esModule: true,
  default: () => ({ write: { unstakeMany: jest.fn() } }),
}));

jest.mock('../../../services/api', () => ({
  __esModule: true,
  default: {
    get_staking_cst_rewards_to_claim_by_user: jest.fn().mockResolvedValue([]),
    get_staking_cst_by_user_by_deposit_rewards: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('wagmi', () => ({
  usePublicClient: () => ({ waitForTransactionReceipt: jest.fn() }),
}));

 
import { UncollectedCSTStakingRewardsTable } from '../UncollectedCSTStakingRewardsTable';

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
});

describe('UncollectedCSTStakingRewardsTable', () => {
  it('renders loading state when list is null (non-own account)', () => {
    mockApi.get_staking_cst_rewards_to_claim_by_user.mockResolvedValue(null);
    render(<UncollectedCSTStakingRewardsTable user="0xOtherUser" />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders empty state when list is empty', async () => {
    mockApi.get_staking_cst_rewards_to_claim_by_user.mockResolvedValue([]);
    render(<UncollectedCSTStakingRewardsTable user="0xOtherUser" />);
    expect(await screen.findByText('No rewards yet.')).toBeInTheDocument();
  });

  it('renders table headers', async () => {
    mockApi.get_staking_cst_rewards_to_claim_by_user.mockResolvedValue([createRow()]);
    render(<UncollectedCSTStakingRewardsTable user="0xOtherUser" />);
    for (const header of [
      'Deposit Datetime',
      'Deposit ID',
      'Staked Tokens (You / Total)',
      'Unclaimed Tokens',
      'Deposit Amount (ETH)',
      'Reward Amount (ETH)',
      'Uncollected Amount (ETH)',
    ]) {
      expect((await screen.findAllByText(header)).length).toBeGreaterThanOrEqual(1);
    }
  });

  it('renders row data correctly', async () => {
    mockApi.get_staking_cst_rewards_to_claim_by_user.mockResolvedValue([createRow()]);
    render(<UncollectedCSTStakingRewardsTable user="0xOtherUser" />);
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
    render(<UncollectedCSTStakingRewardsTable user="0xOtherUser" />);
    expect(await screen.findByText('1.500000')).toBeInTheDocument();
    expect(screen.getByText('0.100000')).toBeInTheDocument();
    expect(screen.getByText('0.200000')).toBeInTheDocument();
  });

  it('renders only first page of results (perPage=5)', async () => {
    const list = Array.from({ length: 8 }, (_, i) =>
      createRow({ EvtLogId: i, DepositId: 100 + i }),
    );
    mockApi.get_staking_cst_rewards_to_claim_by_user.mockResolvedValue(list);
    render(<UncollectedCSTStakingRewardsTable user="0xOtherUser" />);
    expect(await screen.findByText('104')).toBeInTheDocument();
    expect(screen.queryByText('105')).not.toBeInTheDocument();
  });

  it('does not show Unstake button for non-own accounts', async () => {
    mockApi.get_staking_cst_rewards_to_claim_by_user.mockResolvedValue([createRow()]);
    render(<UncollectedCSTStakingRewardsTable user="0xOtherUser" />);
    await screen.findByText('5');
    expect(screen.queryByText('Unstake & Claim All')).not.toBeInTheDocument();
  });

  it('calls API to fetch uncollected rewards on mount', () => {
    render(<UncollectedCSTStakingRewardsTable user="0xSomeUser" />);
    expect(mockApi.get_staking_cst_rewards_to_claim_by_user).toHaveBeenCalledWith('0xSomeUser');
  });
});
