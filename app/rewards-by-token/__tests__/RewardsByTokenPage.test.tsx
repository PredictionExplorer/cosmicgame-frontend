import { checkA11y, render, screen } from '@/test-utils';

import RewardsByTokenPage from '../[address]/[tokenId]/RewardsByTokenPage';

const mockUseStakingRewardsByUserByTokenDetails = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  error: null,
});

jest.mock('../../../hooks/useApiQuery', () => ({
  useStakingRewardsByUserByTokenDetails: (...args: unknown[]) =>
    mockUseStakingRewardsByUserByTokenDetails(...args),
}));

beforeEach(() => jest.clearAllMocks());

describe('RewardsByTokenPage', () => {
  it('shows loading state', () => {
    mockUseStakingRewardsByUserByTokenDetails.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<RewardsByTokenPage address="0xUser" tokenId={42} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders rewards table with data', () => {
    mockUseStakingRewardsByUserByTokenDetails.mockReturnValue({
      data: {
        0: {
          DepositTimeStamp: 1000000,
          RoundNum: 1,
          DepositId: 100,
          DepositIndex: 0,
          Claimed: false,
          RewardEth: 0.5,
          Stake: { TxHash: '0xabc', TimeStamp: 1000000, NumStakedNFTs: 3 },
          Unstake: {
            EvtLogId: 0,
            TxHash: '',
            TimeStamp: 0,
            NumStakedNFTs: 0,
            MaxUnpaidDepositIndex: 0,
            RewardAmountEth: 0,
          },
        },
      },
      isLoading: false,
      error: null,
    });
    render(<RewardsByTokenPage address="0xUser" tokenId={42} />);
    expect(screen.getByText('Staking Rewards Details for Token 42')).toBeInTheDocument();
  });

  it('passes correct arguments to the hook', () => {
    mockUseStakingRewardsByUserByTokenDetails.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    render(<RewardsByTokenPage address="0xABC" tokenId={7} />);
    expect(mockUseStakingRewardsByUserByTokenDetails).toHaveBeenCalledWith('0xABC', 7);
  });

  it('handles empty response', () => {
    mockUseStakingRewardsByUserByTokenDetails.mockReturnValue({
      data: {},
      isLoading: false,
      error: null,
    });
    render(<RewardsByTokenPage address="0xUser" tokenId={42} />);
    expect(screen.getByText('Staking Rewards Details for Token 42')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RewardsByTokenPage address="0xUser" tokenId={42} />);
    await checkA11y(container);
  });
});
