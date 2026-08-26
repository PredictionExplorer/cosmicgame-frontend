import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';

import type { DashboardInfo, GestureInfo } from '@/services/api';

import { checkA11y, render, screen, within } from '@/test-utils';

import { CycleMonument } from '../CycleMonument';

jest.mock('@rainbow-me/rainbowkit');

jest.mock('../../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: null }),
}));

// ConnectWalletButton transitively imports wagmi/core ESM through the
// MetaMask watch-asset hook; mock it exactly like the HomePage suite does.
jest.mock('../../../../hooks/useMetaMaskWatchAsset', () => ({
  useMetaMaskWatchAsset: () => ({
    isMetaMaskConnected: false,
    isAddingCst: false,
    isAddingNft: false,
    addCst: jest.fn(),
    addCosmicSignatureNft: jest.fn(),
  }),
}));

const makeDashboardData = (overrides: Partial<Record<string, unknown>> = {}) =>
  ({
    CurRoundNum: 7,
    CurNumBids: 10,
    LastBidderAddr: '0x1111111111111111111111111111111111111111',
    PrizeAmountEth: 2.75,
    TsRoundStart: Math.floor(Date.now() / 1000) - 3600,
    MainStats: { NumCSTokenMints: 100 },
    ...overrides,
  }) as unknown as DashboardInfo;

const latestGesture = {
  EvtLogId: 42,
  TimeStamp: Math.floor(Date.now() / 1000) - 150,
  BidderAddr: '0x1111111111111111111111111111111111111111',
  RoundNum: 7,
  GestureType: 0,
  Message: '',
} as unknown as GestureInfo;

function makeProps(overrides: Partial<React.ComponentProps<typeof CycleMonument>> = {}) {
  return {
    data: makeDashboardData(),
    loading: false,
    allocationTime: Date.now() + 13 * 60 * 60_000,
    activationTime: 0,
    now: Date.now(),
    finalizationConfirmed: true,
    latestGesture,
    pulseKey: 0,
    account: '0xUser',
    ethGestureInfo: { AuctionDuration: 3600, ETHPrice: 0.01, SecondsElapsed: 1800 },
    cstGestureData: {
      AuctionDuration: 3600,
      CSTPrice: 1,
      CSTPriceWei: 1000000000000000000n,
      SecondsElapsed: 1800,
      isFree: false,
      source: 'api' as const,
    },
    gestureType: 'ETH',
    onSelectGestureType: jest.fn(),
    canGesture: true,
    canClaim: false,
    isGesturing: false,
    isClaiming: false,
    claimWait: 0,
    rwlkId: -1,
    gestureCostPlus: 2,
    onGesture: jest.fn(),
    onFinalize: jest.fn(),
    onOpenFullConsole: jest.fn(),
    ...overrides,
  };
}

describe('CycleMonument', () => {
  it('fuses the countdown, reserve, latest gesture, and gesture action in one section', () => {
    render(<CycleMonument {...makeProps()} />);

    const monument = screen.getByTestId('cycle-monument');
    expect(monument).toHaveAttribute('data-phase', 'live');
    expect(within(monument).getByRole('timer')).toBeInTheDocument();

    const reserve = screen.getByTestId('monument-reserve');
    expect(within(reserve).getByText('home.deck.monument.reserveLabel')).toBeInTheDocument();
    expect(within(reserve).getByText('2.7500 ETH')).toBeInTheDocument();
    expect(within(reserve).getByText('home.deck.monument.reserveExtras')).toBeInTheDocument();

    const latest = screen.getByTestId('monument-latest-gesture');
    expect(latest).toHaveAttribute('href', '/gesture/42');

    expect(
      within(monument).getByRole('button', { name: /home\.form\.submit\.eth\(cost=0\.01020\)/ }),
    ).toBeEnabled();
    expect(within(monument).getByText('home.deck.monument.microcopy')).toBeInTheDocument();
  });

  it('marks the connected wallet on its own latest gesture', () => {
    render(
      <CycleMonument {...makeProps({ account: '0x1111111111111111111111111111111111111111' })} />,
    );

    expect(
      within(screen.getByTestId('monument-latest-gesture')).getByText('home.deck.monument.youChip'),
    ).toBeInTheDocument();
  });

  it('submits through the provided gesture handler', async () => {
    const user = userEvent.setup();
    const onGesture = jest.fn();
    render(<CycleMonument {...makeProps({ onGesture })} />);

    await user.click(screen.getByRole('button', { name: /home\.form\.submit\.eth/ }));

    expect(onGesture).toHaveBeenCalledTimes(1);
  });

  it('selects gesture methods through the shared handler', async () => {
    const user = userEvent.setup();
    const onSelectGestureType = jest.fn();
    render(<CycleMonument {...makeProps({ onSelectGestureType })} />);

    const pills = screen.getByTestId('monument-method-pills');
    await user.click(within(pills).getByRole('button', { name: /home\.form\.method\.cst\.label/ }));

    expect(onSelectGestureType).toHaveBeenCalledWith('CST');
  });

  it('offers only the ETH method before the first gesture of a cycle', () => {
    render(
      <CycleMonument
        {...makeProps({
          data: makeDashboardData({
            LastBidderAddr: '0x0000000000000000000000000000000000000000',
            TsRoundStart: 0,
          }),
          latestGesture: null,
        })}
      />,
    );

    const pills = screen.getByTestId('monument-method-pills');
    expect(
      within(pills).getByRole('button', { name: /home\.form\.method\.eth\.label/ }),
    ).toBeInTheDocument();
    expect(
      within(pills).queryByRole('button', { name: /home\.form\.method\.cst\.label/ }),
    ).not.toBeInTheDocument();
    expect(
      within(pills).queryByRole('button', { name: /home\.form\.method\.randomWalk\.label/ }),
    ).not.toBeInTheDocument();
  });

  it('guards the RandomWalk method until a token is chosen and points at the console', async () => {
    const user = userEvent.setup();
    const onOpenFullConsole = jest.fn();
    render(
      <CycleMonument
        {...makeProps({ gestureType: 'RandomWalk', rwlkId: -1, onOpenFullConsole })}
      />,
    );

    expect(screen.getByRole('button', { name: /home\.form\.submit\.randomWalk/ })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: /home\.deck\.monument\.chooseRwlkToken/ }));
    expect(onOpenFullConsole).toHaveBeenCalledTimes(1);
  });

  it('shows the finalize action once the cycle is ready and the claim is verified', async () => {
    const user = userEvent.setup();
    const onFinalize = jest.fn();
    render(
      <CycleMonument
        {...makeProps({
          allocationTime: Date.now() - 60 * 60_000,
          canGesture: false,
          canClaim: true,
          onFinalize,
        })}
      />,
    );

    expect(screen.getByTestId('cycle-monument')).toHaveAttribute('data-phase', 'ready-to-finalize');
    await user.click(screen.getByRole('button', { name: /home\.form\.finalize/ }));
    expect(onFinalize).toHaveBeenCalledTimes(1);
  });

  it('holds the confirming phase without a finalize action until the chain verifies', () => {
    render(
      <CycleMonument
        {...makeProps({
          allocationTime: Date.now() - 60 * 60_000,
          finalizationConfirmed: false,
          canGesture: false,
          canClaim: false,
        })}
      />,
    );

    expect(screen.getByTestId('cycle-monument')).toHaveAttribute('data-phase', 'confirming');
    expect(screen.queryByRole('button', { name: /home\.form\.finalize/ })).not.toBeInTheDocument();
  });

  it('shows a connect prompt instead of the action for disconnected visitors', () => {
    render(<CycleMonument {...makeProps({ account: null })} />);

    expect(screen.getByTestId('monument-connect')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /home\.form\.submit\.eth/ }),
    ).not.toBeInTheDocument();
  });

  it('collapses to a cycle-details link while the next cycle is opening', () => {
    render(
      <CycleMonument
        {...makeProps({
          activationTime: Math.floor(Date.now() / 1000) + 3600,
        })}
      />,
    );

    expect(screen.getByTestId('cycle-monument')).toHaveAttribute('data-phase', 'opening-soon');
    expect(screen.queryByTestId('monument-method-pills')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /home\.chrono\.cta\.viewCycle/ })).toHaveAttribute(
      'href',
      '/current-cycle',
    );
  });

  it('offers the opening as a calendar invite while the next cycle is scheduled', () => {
    render(
      <CycleMonument
        {...makeProps({
          activationTime: Math.floor(Date.now() / 1000) + 3600,
        })}
      />,
    );

    const calendarLink = screen.getByTestId('monument-calendar-link');
    expect(calendarLink).toHaveAttribute('download', 'cosmic-cycle-7-opening.ics');
    expect(calendarLink.getAttribute('href')).toContain('data:text/calendar');
    const body = decodeURIComponent(
      calendarLink.getAttribute('href')!.split(',').slice(1).join(','),
    );
    expect(body).toContain('BEGIN:VEVENT');
    expect(body).toContain('home.deck.monument.calendarTitle(number=7)');
  });

  it('lets participants choose the notify-before-finalization threshold', async () => {
    const user = userEvent.setup();
    const onNotifyThresholdChange = jest.fn();
    render(<CycleMonument {...makeProps({ notifyThresholdMin: 5, onNotifyThresholdChange })} />);

    const control = screen.getByTestId('monument-notify-control');
    const fiveMinutes = within(control).getByRole('button', {
      name: 'home.deck.monument.notifyMinutes(minutes=5)',
    });
    expect(fiveMinutes).toHaveAttribute('aria-pressed', 'true');

    await user.click(
      within(control).getByRole('button', {
        name: 'home.deck.monument.notifyMinutes(minutes=30)',
      }),
    );
    expect(onNotifyThresholdChange).toHaveBeenCalledWith(30);
  });

  it('hides the notify control once no finalization countdown is running', () => {
    render(
      <CycleMonument
        {...makeProps({
          allocationTime: Date.now() - 60 * 60_000,
          canGesture: false,
          canClaim: true,
          notifyThresholdMin: 5,
          onNotifyThresholdChange: jest.fn(),
        })}
      />,
    );

    expect(screen.queryByTestId('monument-notify-control')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<CycleMonument {...makeProps()} />);
    await checkA11y(container);
  });
});
