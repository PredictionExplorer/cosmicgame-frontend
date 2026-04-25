import { checkA11y, render, screen } from '@/test-utils';

import { GestureStatus } from '../GestureStatus';

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
  curGestureList: [] as import('@/services/api').GestureInfo[],
  ethGestureInfo: null,
  allocationTime: 0,
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

describe('GestureStatus', () => {
  it('renders nothing when loading is true', () => {
    const { container } = render(<GestureStatus {...baseProps} loading={true} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows first-gesture prompt when no cycle started', () => {
    render(
      <GestureStatus
        {...baseProps}
        data={{ ...activeData, TsRoundStart: 0, CurRoundNum: 0 } as never}
      />,
    );
    expect(screen.getByText('Open the Cycle')).toBeInTheDocument();
  });

  it('shows cycle opened message for first gesture in existing cycle', () => {
    render(
      <GestureStatus
        {...baseProps}
        data={{ ...activeData, TsRoundStart: 0, CurRoundNum: 5 } as never}
      />,
    );
    expect(screen.getByText('Cycle 5')).toBeInTheDocument();
    expect(screen.getByText(/Calibration Window/)).toBeInTheDocument();
  });

  it('displays Signature Allocation and last participant info', () => {
    render(
      <GestureStatus
        {...baseProps}
        data={activeData as never}
        allocationTime={Date.now() + 60000}
        ethGestureInfo={{ ETHPrice: 0.01 }}
      />,
    );
    expect(screen.getByText('10.5000 ETH')).toBeInTheDocument();
    expect(screen.getByText(/0xBidder/)).toBeInTheDocument();
    expect(screen.getByText('0.01000 ETH')).toBeInTheDocument();
    expect(screen.getByText('0.00500 ETH')).toBeInTheDocument();
  });

  it('shows cycle closed when finalization time has passed', () => {
    render(
      <GestureStatus
        {...baseProps}
        data={activeData as never}
        allocationTime={Date.now() - 60000}
        ethGestureInfo={{ ETHPrice: 0.01 }}
      />,
    );
    expect(screen.getByText('Cycle Closed')).toBeInTheDocument();
    expect(screen.getByText('Waiting for the cycle to finalize.')).toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <GestureStatus
        {...baseProps}
        data={activeData as never}
        allocationTime={Date.now() + 60000}
        ethGestureInfo={{ ETHPrice: 0.01 }}
      />,
    );
    await checkA11y(container);
  });
});
