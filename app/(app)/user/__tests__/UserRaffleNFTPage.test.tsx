import { checkA11y, render, screen } from '@/test-utils';

import UserRaffleNFTPage from '../raffle-nft/[address]/UserRaffleNFTPage';

const mockUseRaffleNFTWinningsByUser = jest.fn().mockReturnValue({
  data: undefined,
  isLoading: false,
  error: null,
});

jest.mock('../../../../hooks/useApiQuery', () => ({
  useRaffleNFTWinningsByUser: (...args: unknown[]) => mockUseRaffleNFTWinningsByUser(...args),
}));

beforeEach(() => jest.clearAllMocks());

describe('UserRaffleNFTPage', () => {
  const validAddr = '0x1234567890123456789012345678901234567890';

  it('shows loading when query is loading', () => {
    mockUseRaffleNFTWinningsByUser.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    render(<UserRaffleNFTPage address={validAddr} />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows invalid address message for bad addresses', () => {
    mockUseRaffleNFTWinningsByUser.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    render(<UserRaffleNFTPage address="bad" />);
    expect(screen.getByText('Invalid Address')).toBeInTheDocument();
  });

  it('renders winnings after loading', () => {
    mockUseRaffleNFTWinningsByUser.mockReturnValue({
      data: [
        {
          EvtLogId: 1,
          TxHash: '0xabc',
          TimeStamp: 1000000,
          RoundNum: 1,
          IsRWalk: false,
          IsStaker: true,
          TokenId: 42,
        },
      ],
      isLoading: false,
      error: null,
    });
    render(<UserRaffleNFTPage address={validAddr} />);
    expect(screen.getByText('Raffle NFTs User Won')).toBeInTheDocument();
  });

  it('shows empty state when no winnings', () => {
    mockUseRaffleNFTWinningsByUser.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    render(<UserRaffleNFTPage address={validAddr} />);
    expect(screen.getByText('No NFT winnings yet.')).toBeInTheDocument();
  });

  it('sorts winnings by timestamp descending', () => {
    mockUseRaffleNFTWinningsByUser.mockReturnValue({
      data: [
        {
          EvtLogId: 1,
          TxHash: '0x1',
          TimeStamp: 100,
          RoundNum: 1,
          IsRWalk: false,
          IsStaker: false,
          TokenId: 1,
        },
        {
          EvtLogId: 2,
          TxHash: '0x2',
          TimeStamp: 300,
          RoundNum: 2,
          IsRWalk: true,
          IsStaker: true,
          TokenId: 2,
        },
        {
          EvtLogId: 3,
          TxHash: '0x3',
          TimeStamp: 200,
          RoundNum: 3,
          IsRWalk: false,
          IsStaker: false,
          TokenId: 3,
        },
      ],
      isLoading: false,
      error: null,
    });
    render(<UserRaffleNFTPage address={validAddr} />);
    expect(screen.getByText('Raffle NFTs User Won')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <UserRaffleNFTPage address="0x1234567890123456789012345678901234567890" />,
    );
    await checkA11y(container);
  });
});
