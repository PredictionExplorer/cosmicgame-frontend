import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';

import { isV3Mechanics, protocolFacts } from '@/content/protocol-facts';

import type { DashboardInfo, GestureInfo } from '@/services/api';

import { checkA11y, render, screen, within } from '@/test-utils';

import { CycleMonument } from '../CycleMonument';

// Signature Allocation NFT count baked into the copy (V3: 3, V2: 1).
const cscNftCount = isV3Mechanics ? protocolFacts.v3.mainPrizeNftsPerCycleDefault : 1;

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
    // The console itself is owned by HomePage; the monument only hosts it.
    gestureConsole: <div data-testid="console-stub" />,
    ...overrides,
  };
}

describe('CycleMonument', () => {
  // Moved here from GestureStatus: the Signature Allocation is now stated once,
  // by this card, so the attached-asset tooltip variants belong to it.
  it('names attached ERC20 deposits in the Signature Allocation tooltip', async () => {
    const user = userEvent.setup();
    render(<CycleMonument {...makeProps({ attachedERC20Count: 1 })} />);

    const reserve = screen.getByTestId('monument-reserve');
    await user.hover(within(reserve).getByRole('button', { name: /^More information/ }));

    expect(
      await screen.findAllByText(
        `home.status.metrics.signatureTooltip.withErc20(cscNftCount=${cscNftCount},erc20Count=1)`,
      ),
    ).not.toHaveLength(0);
  });

  it('names attached NFTs in the Signature Allocation tooltip', async () => {
    const user = userEvent.setup();
    render(<CycleMonument {...makeProps({ attachedNFTCount: 3 })} />);

    const reserve = screen.getByTestId('monument-reserve');
    await user.hover(within(reserve).getByRole('button', { name: /^More information/ }));

    expect(
      await screen.findAllByText(
        `home.status.metrics.signatureTooltip.withNft(cscNftCount=${cscNftCount},nftCount=3)`,
      ),
    ).not.toHaveLength(0);
  });

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

    // The gesture console is a slot owned by HomePage; the monument hosts it
    // under the clock so the cycle and the act of gesturing are one surface.
    expect(within(monument).getByTestId('console-stub')).toBeInTheDocument();
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

  it('enters the ready-to-finalize phase once the clock passes', () => {
    // The finalize action lives in the hosted console (see HomePage tests);
    // the monument's own job is the phase presentation.
    render(<CycleMonument {...makeProps({ allocationTime: Date.now() - 60 * 60_000 })} />);

    expect(screen.getByTestId('cycle-monument')).toHaveAttribute('data-phase', 'ready-to-finalize');
  });

  it('holds the confirming phase without a finalize action until the chain verifies', () => {
    render(
      <CycleMonument
        {...makeProps({
          allocationTime: Date.now() - 60 * 60_000,
          finalizationConfirmed: false,
        })}
      />,
    );

    expect(screen.getByTestId('cycle-monument')).toHaveAttribute('data-phase', 'confirming');
    expect(screen.queryByRole('button', { name: /home\.form\.finalize/ })).not.toBeInTheDocument();
  });

  it('collapses to a cycle-details link while the next cycle is opening', () => {
    render(
      <CycleMonument
        {...makeProps({
          activationTime: Math.floor(Date.now() / 1000) + 3600,
          // HomePage passes no console outside an active round.
          gestureConsole: undefined,
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
          gestureConsole: undefined,
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

  it('hosts an optional side panel as a second column without touching the console', () => {
    const { rerender } = render(<CycleMonument {...makeProps()} />);
    expect(screen.queryByTestId('monument-side-panel')).not.toBeInTheDocument();
    expect(screen.getByTestId('monument-body')).not.toHaveClass('xl:grid');

    rerender(<CycleMonument {...makeProps({ sidePanel: <div data-testid="panel-stub" /> })} />);
    const side = screen.getByTestId('monument-side-panel');
    expect(side).toContainElement(screen.getByTestId('panel-stub'));
    expect(screen.getByTestId('monument-body')).toHaveClass('xl:grid');
    // The panel is absolutely positioned at xl so it cannot grow the card.
    expect(side.firstElementChild).toHaveClass('xl:absolute', 'xl:inset-0', 'xl:overflow-y-auto');
    expect(screen.getByTestId('monument-console')).toContainElement(
      screen.getByTestId('console-stub'),
    );
  });
});
