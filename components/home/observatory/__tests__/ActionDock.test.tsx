import userEvent from '@testing-library/user-event';

import { IDLE_TX_STAGE } from '@/lib/txStage';

import { render, screen, within, checkA11y } from '@/test-utils';

import { ActionDock } from '../ActionDock';

const HOLDER = '0x1111111111111111111111111111111111111111';
const OTHER = '0x2222222222222222222222222222222222222222';
const NOW = Date.now();

const makeData = (overrides: Record<string, unknown> = {}) =>
  ({
    CurRoundNum: 7,
    LastBidderAddr: OTHER,
    PrizeAmountEth: 2.75,
    TsRoundStart: Math.floor(NOW / 1000) - 3600,
    ...overrides,
  }) as never;

const baseProps = {
  stepAside: false,
  data: makeData(),
  loading: false,
  allocationTime: NOW + 6 * 86_400_000 + 3_600_000,
  activationTime: 0,
  now: NOW,
  finalizationConfirmed: true,
  submit: { action: 'home.form.submit.action.eth', cost: '0.10211 ETH' },
  isGesturing: false,
  txStage: IDLE_TX_STAGE,
  account: HOLDER as string | null,
  canClaim: false,
  isClaiming: false,
  claimWait: 0,
  onFinalize: jest.fn(),
  onOpenSheet: jest.fn(),
  onJumpToPanel: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ActionDock', () => {
  it('holds the clock, the Signature Allocation and one priced commit action', async () => {
    const user = userEvent.setup();
    render(<ActionDock {...baseProps} />);

    const dock = screen.getByTestId('action-dock');
    // The day unit comes from the locale, never a hard-coded "d" per locale.
    expect(within(dock).getByRole('timer')).toHaveTextContent(/^6d.\d{2}:\d{2}:\d{2}$/);
    expect(within(dock).getByText('home.observatory.clock.reserveLabel')).toBeInTheDocument();
    expect(dock).not.toHaveTextContent('Reserve ');

    const open = within(dock).getByTestId('dock-open-sheet');
    expect(open).toHaveClass('bg-signature-gradient');
    // The verb and the price sit on their own lines, so the dock never grows.
    expect(within(open).getByText('home.form.submit.action.eth')).toBeInTheDocument();
    expect(within(open).getByText(/^0\.10211.ETH$/)).toBeInTheDocument();
    await user.click(open);
    expect(baseProps.onOpenSheet).toHaveBeenCalledTimes(1);
  });

  it('keeps the visible label as the button name, with the purpose as its description', () => {
    render(<ActionDock {...baseProps} />);
    const open = screen.getByTestId('dock-open-sheet');
    expect(open).not.toHaveAttribute('aria-label');
    expect(open).toHaveAccessibleName(/home\.form\.submit\.action\.eth/);
    expect(open).toHaveAccessibleDescription('home.observatory.dock.openPanelAria');
  });

  it('returns tablets and desktops to the one gesture panel instead of a sheet', async () => {
    const user = userEvent.setup();
    render(<ActionDock {...baseProps} />);
    const jump = screen.getByTestId('dock-jump-to-panel');
    expect(jump).toHaveClass('hidden', 'md:inline-flex');
    await user.click(jump);
    expect(baseProps.onJumpToPanel).toHaveBeenCalledTimes(1);
    expect(baseProps.onOpenSheet).not.toHaveBeenCalled();
  });

  it('steps aside, out of the tab order, while the form it opens is on screen', () => {
    const { container } = render(<ActionDock {...baseProps} stepAside />);
    const layer = container.querySelector('[data-action-dock]');
    expect(layer).toHaveAttribute('aria-hidden', 'true');
    expect(layer).toHaveAttribute('inert');
    expect(layer).toHaveClass('pointer-events-none', 'opacity-0');
  });

  it('shows the transaction stage while a Gesture is in flight', () => {
    render(
      <ActionDock
        {...baseProps}
        isGesturing
        txStage={{ status: 'awaiting-signature', step: 1, total: 1 }}
      />,
    );
    const open = screen.getByTestId('dock-open-sheet');
    expect(open).toHaveAttribute('aria-busy', 'true');
    expect(open).toHaveTextContent('toasts.tx.button.confirm');
  });

  it('says the wallet holds the Last Gesture instead of repeating the allocation', () => {
    render(<ActionDock {...baseProps} data={makeData({ LastBidderAddr: HOLDER })} />);
    expect(screen.getByTestId('action-dock-status')).toHaveTextContent(
      'home.observatory.standing.positionLatest',
    );
  });

  it('marks the moment another participant takes the place', () => {
    render(<ActionDock {...baseProps} moment={{ kind: 'taken', by: OTHER, atMs: NOW }} />);
    expect(screen.getByTestId('action-dock-status')).toHaveTextContent(
      'home.observatory.standing.positionTaken',
    );
  });

  it('turns into Finalize for the Last Gesture holder at zero', async () => {
    const user = userEvent.setup();
    render(
      <ActionDock
        {...baseProps}
        data={makeData({ LastBidderAddr: HOLDER })}
        allocationTime={NOW - 60_000}
        canClaim
        claimWait={NOW + 10 * 60_000}
      />,
    );

    expect(screen.getByTestId('action-dock')).toHaveAttribute('data-phase', 'ready-to-finalize');
    // The phase word is never cut to "Confirmi…".
    expect(screen.getByTestId('action-dock-status')).toHaveTextContent(
      'home.chrono.phase.readyToFinalize.label',
    );
    expect(screen.getByTestId('action-dock-status').innerHTML).not.toMatch(/truncate/);
    const finalize = screen.getByTestId('dock-finalize');
    await user.click(finalize);
    expect(baseProps.onFinalize).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('dock-open-sheet')).not.toBeInTheDocument();
  });

  it('keeps the Gesture action for other wallets during the exclusive window', () => {
    render(
      <ActionDock
        {...baseProps}
        allocationTime={NOW - 60_000}
        canClaim
        claimWait={NOW + 10 * 60_000}
      />,
    );
    expect(screen.queryByTestId('dock-finalize')).not.toBeInTheDocument();
    expect(screen.getByTestId('dock-open-sheet')).toBeInTheDocument();
  });

  it('renders nothing between cycles', () => {
    const { container } = render(
      <ActionDock {...baseProps} activationTime={Math.floor(NOW / 1000) + 3600} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ActionDock {...baseProps} />);
    await checkA11y(container);
  });
});
