import { checkA11y, render, screen } from '@/test-utils';

import { BiddingStatus } from '../BiddingStatus';

const mockUseCurrentTime = jest.fn().mockReturnValue({ data: undefined });
const mockUseUserInfo = jest.fn().mockReturnValue({ data: undefined });
const mockUseCTPrice = jest.fn().mockReturnValue({ data: undefined });

jest.mock('../../../hooks/useApiQuery', () => ({
  useCurrentTime: (...args: unknown[]) => mockUseCurrentTime(...args),
  useUserInfo: (...args: unknown[]) => mockUseUserInfo(...args),
  useCTPrice: (...args: unknown[]) => mockUseCTPrice(...args),
}));

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: '0xUser' }),
}));

jest.mock('react-countdown', () => ({
  __esModule: true,
  default: () => <div data-testid="countdown" />,
}));
jest.mock('../Counter', () => ({
  __esModule: true,
  default: () => <div data-testid="counter" />,
}));

beforeEach(() => jest.clearAllMocks());

const baseProps = {
  data: null,
  loading: false,
  activationTime: 0,
  curBidList: [] as import('@/services/api').BidInfo[],
  ethBidInfo: null,
  prizeTime: 0,
};

const activeData = {
  CurRoundNum: 5,
  TsRoundStart: Math.floor(Date.now() / 1000) - 3600,
  LastBidderAddr: '0xBidder',
  PrizeAmountEth: 10.5,
  RaffleAmountEth: 2.0,
  NumRaffleEthWinnersBidding: 3,
  NumRaffleNFTWinnersBidding: 2,
};

describe('BiddingStatus', () => {
  it('renders nothing when loading is true', () => {
    const { container } = render(<BiddingStatus {...baseProps} loading={true} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows first-bid prompt when no round started', () => {
    render(
      <BiddingStatus
        {...baseProps}
        data={{ ...activeData, TsRoundStart: 0, CurRoundNum: 0 } as never}
      />,
    );
    expect(screen.getByText('Start the game with your first bid!')).toBeInTheDocument();
  });

  it('shows round started message for first bid in existing round', () => {
    render(
      <BiddingStatus
        {...baseProps}
        data={{ ...activeData, TsRoundStart: 0, CurRoundNum: 5 } as never}
      />,
    );
    expect(screen.getByText('Round 5 started')).toBeInTheDocument();
    expect(screen.getByText(/Dutch auction/)).toBeInTheDocument();
  });

  it('displays main prize reward and last bidder info', () => {
    render(
      <BiddingStatus
        {...baseProps}
        data={activeData as never}
        prizeTime={Date.now() + 60000}
        ethBidInfo={{ ETHPrice: 0.01 }}
      />,
    );
    expect(screen.getByText('10.5000 ETH')).toBeInTheDocument();
    expect(screen.getByText('0xBidder')).toBeInTheDocument();
    expect(screen.getByText('0.01000 ETH')).toBeInTheDocument();
    expect(screen.getByText('0.00500 ETH')).toBeInTheDocument();
  });

  it('shows bids exhausted when prize time has passed', () => {
    render(
      <BiddingStatus
        {...baseProps}
        data={activeData as never}
        prizeTime={Date.now() - 60000}
        ethBidInfo={{ ETHPrice: 0.01 }}
      />,
    );
    expect(screen.getByText('Bids exhausted!')).toBeInTheDocument();
    expect(screen.getByText('Waiting for the winner to claim the prize.')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <BiddingStatus
        {...baseProps}
        data={activeData as never}
        prizeTime={Date.now() + 60000}
        ethBidInfo={{ ETHPrice: 0.01 }}
      />,
    );
    await checkA11y(container);
  });
});
