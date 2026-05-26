import { checkA11y, render, screen } from '@/test-utils';

import { GestureStatus } from '../GestureStatus';

const mockCountdownProps: Array<Record<string, unknown>> = [];
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

jest.mock('../SmoothCountdown', () => ({
  SmoothCountdown: (props: Record<string, unknown>) => {
    mockCountdownProps.push(props);
    return <div data-testid="countdown" />;
  },
}));
jest.mock('../Counter', () => ({
  __esModule: true,
  default: () => <div data-testid="counter" />,
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockCountdownProps.length = 0;
});

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

  it('displays Signature Allocation and gesture cost info', () => {
    render(
      <GestureStatus
        {...baseProps}
        data={activeData as never}
        allocationTime={Date.now() + 60000}
        ethGestureInfo={{ ETHPrice: 0.01 }}
      />,
    );
    expect(screen.getByText('10.5000 ETH')).toBeInTheDocument();
    expect(screen.getByText('0.01000 ETH')).toBeInTheDocument();
    expect(screen.getByText('0.00500 ETH')).toBeInTheDocument();
    expect(screen.queryByText('Last Participant')).not.toBeInTheDocument();
  });

  it('uses smooth countdown props for cycle finalization countdown', () => {
    render(
      <GestureStatus
        {...baseProps}
        data={activeData as never}
        allocationTime={Date.now() + 60000}
        ethGestureInfo={{ ETHPrice: 0.01 }}
      />,
    );

    expect(mockCountdownProps).toEqual(
      expect.arrayContaining([expect.objectContaining({ date: expect.any(Number) })]),
    );
  });

  it('suppresses the primary countdown while preserving metric cards', () => {
    render(
      <GestureStatus
        {...baseProps}
        data={activeData as never}
        allocationTime={Date.now() + 60000}
        ethGestureInfo={{ ETHPrice: 0.01 }}
        suppressPrimaryTimer
      />,
    );

    expect(screen.queryByText('Cycle finalizes in')).not.toBeInTheDocument();
    expect(mockCountdownProps).toHaveLength(0);
    expect(screen.getByText('Signature Allocation')).toBeInTheDocument();
    expect(screen.getByText('ETH Gesture')).toBeInTheDocument();
  });

  it('shows cycle standing copy without restricted chance wording', () => {
    mockUseUserInfo.mockReturnValueOnce({
      data: { Gestures: [{ RoundNum: 5 }] },
    });

    render(
      <GestureStatus
        {...baseProps}
        data={{ ...activeData, LastBidderAddr: '0xUser' } as never}
        allocationTime={Date.now() + 60000}
        curGestureList={[{ RoundNum: 5 } as never, { RoundNum: 5 } as never]}
        ethGestureInfo={{ ETHPrice: 0.01 }}
      />,
    );

    expect(screen.getByText('Your Cycle Standing')).toBeInTheDocument();
    expect(screen.queryByText('Your Chances')).not.toBeInTheDocument();
  });

  it('includes attached NFTs in the latest gesture maker Signature Allocation copy', () => {
    mockUseUserInfo.mockReturnValueOnce({
      data: { Gestures: [{ RoundNum: 5 }] },
    });

    render(
      <GestureStatus
        {...baseProps}
        data={{ ...activeData, LastBidderAddr: '0xUser' } as never}
        allocationTime={Date.now() + 60000}
        curGestureList={[{ RoundNum: 5 } as never, { RoundNum: 5 } as never]}
        ethGestureInfo={{ ETHPrice: 0.01 }}
        attachedNFTCount={3}
      />,
    );

    expect(screen.getByText(/You made the most recent gesture/)).toHaveTextContent(
      'Signature Allocation (10.5000 ETH, 1,000 CST, 1 Cosmic Signature NFT, plus all 3 attached NFTs shown below).',
    );
  });

  it('omits attached NFT copy when no attached NFTs are available', () => {
    mockUseUserInfo.mockReturnValueOnce({
      data: { Gestures: [{ RoundNum: 5 }] },
    });

    render(
      <GestureStatus
        {...baseProps}
        data={{ ...activeData, LastBidderAddr: '0xUser' } as never}
        allocationTime={Date.now() + 60000}
        curGestureList={[{ RoundNum: 5 } as never, { RoundNum: 5 } as never]}
        ethGestureInfo={{ ETHPrice: 0.01 }}
      />,
    );

    expect(screen.getByText(/You made the most recent gesture/)).toHaveTextContent(
      'Signature Allocation (10.5000 ETH, 1,000 CST, 1 Cosmic Signature NFT).',
    );
    expect(screen.getByText(/You made the most recent gesture/)).not.toHaveTextContent(
      'attached NFT',
    );
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
