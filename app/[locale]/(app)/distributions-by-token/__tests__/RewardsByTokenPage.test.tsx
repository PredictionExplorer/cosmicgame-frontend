import { checkA11y, fireEvent, render, screen } from '@/test-utils';

import RewardsByTokenPage from '../[address]/[tokenId]/RewardsByTokenPage';

const mockConvertTimestampToDateTime = jest.fn();
jest.mock('@/utils', () => {
  const actual = jest.requireActual<typeof import('@/utils')>('@/utils');
  return {
    ...actual,
    convertTimestampToDateTime: (timestamp: number, showSecond?: boolean, locale?: string) => {
      mockConvertTimestampToDateTime(timestamp, showSecond, locale);
      return actual.convertTimestampToDateTime(timestamp, showSecond, locale);
    },
  };
});

const mockUseAnchorDistributionsByUserByTokenDetails = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  error: null,
});

jest.mock('../../../../../hooks/useApiQuery', () => ({
  useAnchorDistributionsByUserByTokenDetails: (...args: unknown[]) =>
    mockUseAnchorDistributionsByUserByTokenDetails(...args),
}));

beforeEach(() => jest.clearAllMocks());

describe('RewardsByTokenPage', () => {
  it('shows loading state', () => {
    mockUseAnchorDistributionsByUserByTokenDetails.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<RewardsByTokenPage address="0xUser" tokenId={42} />);
    expect(screen.getByText('anchoring.common.loading')).toBeInTheDocument();
  });

  it('renders rewards table with data', () => {
    mockUseAnchorDistributionsByUserByTokenDetails.mockReturnValue({
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
    expect(
      screen.getByText('anchoring.distributionsByToken.title(tokenId=42)'),
    ).toBeInTheDocument();
  });

  it('passes correct arguments to the hook', () => {
    mockUseAnchorDistributionsByUserByTokenDetails.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    render(<RewardsByTokenPage address="0xABC" tokenId={7} />);
    expect(mockUseAnchorDistributionsByUserByTokenDetails).toHaveBeenCalledWith('0xABC', 7);
  });

  it('passes the locale to all three timestamp formats', () => {
    mockUseAnchorDistributionsByUserByTokenDetails.mockReturnValue({
      data: {
        0: {
          DepositTimeStamp: 1000,
          RoundNum: 1,
          DepositId: 100,
          DepositIndex: 0,
          Claimed: true,
          RewardEth: 0.5,
          Stake: { TxHash: '0xstake', TimeStamp: 2000, NumStakedNFTs: 3 },
          Unstake: {
            EvtLogId: 1,
            TxHash: '0xunstake',
            TimeStamp: 3000,
            NumStakedNFTs: 3,
            MaxUnpaidDepositIndex: 0,
            RewardAmountEth: 0.5,
          },
        },
      },
      isLoading: false,
      error: null,
    });

    render(<RewardsByTokenPage address="0xUser" tokenId={42} />);
    fireEvent.click(screen.getByRole('button', { name: 'anchoring.common.aria.expandRow' }));

    expect(mockConvertTimestampToDateTime).toHaveBeenCalledWith(1000, false, 'en');
    expect(mockConvertTimestampToDateTime).toHaveBeenCalledWith(2000, false, 'en');
    expect(mockConvertTimestampToDateTime).toHaveBeenCalledWith(3000, false, 'en');
  });

  it('handles empty response', () => {
    mockUseAnchorDistributionsByUserByTokenDetails.mockReturnValue({
      data: {},
      isLoading: false,
      error: null,
    });
    render(<RewardsByTokenPage address="0xUser" tokenId={42} />);
    expect(
      screen.getByText('anchoring.distributionsByToken.title(tokenId=42)'),
    ).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<RewardsByTokenPage address="0xUser" tokenId={42} />);
    await checkA11y(container);
  });
});
