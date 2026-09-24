import userEvent from '@testing-library/user-event';

import { render, screen, within, checkA11y } from '@/test-utils';

import { ActionDock } from '../ActionDock';

const makeData = (overrides: Record<string, unknown> = {}) =>
  ({
    CurRoundNum: 7,
    LastBidderAddr: '0xBidder',
    PrizeAmountEth: 2.75,
    TsRoundStart: Math.floor(Date.now() / 1000) - 3600,
    ...overrides,
  }) as never;

const baseProps = {
  stageOutOfView: false,
  data: makeData(),
  loading: false,
  allocationTime: Date.now() + 13 * 60 * 60_000,
  activationTime: 0,
  now: Date.now(),
  finalizationConfirmed: true,
  submitLabel: 'home.form.submit.eth(cost=0.01020)',
  onOpenSheet: jest.fn(),
  onJumpToPanel: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

/** The reserve as the formatting layer renders it: one no-break `<data>` value. */
const reserveAmount = (container: HTMLElement) =>
  within(container).getByText(
    (_, element) => element?.tagName === 'DATA' && element.textContent === '2.7500\u00a0ETH',
  );

describe('ActionDock', () => {
  it('keeps the phone dock present with the live price and reserve', async () => {
    const user = userEvent.setup();
    render(<ActionDock {...baseProps} />);

    const dock = screen.getByTestId('action-dock-mobile');
    expect(reserveAmount(dock)).toHaveAttribute('value', '2.75');

    const open = within(dock).getByTestId('dock-open-sheet');
    expect(open).toHaveTextContent('home.form.submit.eth(cost=0.01020)');
    // The dock carries the one commit action of the view: the signature gradient.
    expect(open).toHaveClass('bg-signature-gradient');
    await user.click(open);
    expect(baseProps.onOpenSheet).toHaveBeenCalledTimes(1);
  });

  it('keeps the dock countdown on one line', () => {
    render(<ActionDock {...baseProps} />);
    const dock = screen.getByTestId('action-dock-mobile');
    const countdown = within(dock).getByText(/\d{2}:\d{2}:\d{2}/);
    // Korean labels squeeze the countdown column; the digits must not wrap.
    expect(countdown).toHaveClass('whitespace-nowrap');
  });

  it('shows the desktop dock only after the stage scrolls away', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ActionDock {...baseProps} />);
    expect(screen.queryByTestId('action-dock-desktop')).not.toBeInTheDocument();

    rerender(<ActionDock {...baseProps} stageOutOfView />);
    const dock = screen.getByTestId('action-dock-desktop');
    expect(reserveAmount(dock)).toHaveClass('whitespace-nowrap');

    // The dock never submits — it routes back to the one gesture panel.
    expect(within(dock).getByTestId('dock-jump-to-panel')).toHaveClass('bg-signature-gradient');
    await user.click(within(dock).getByTestId('dock-jump-to-panel'));
    expect(baseProps.onJumpToPanel).toHaveBeenCalledTimes(1);
    expect(baseProps.onOpenSheet).not.toHaveBeenCalled();
  });

  it('never squeezes the countdown, and lets a phase label truncate for the CTA', () => {
    // Regression: a non-shrinking column kept "Awaiting first Gesture" at full
    // width and crushed the CTA to ~40px at 320px (uk). The column may shrink
    // to the no-wrap timer's width in countdown phases, and to nothing (the
    // label truncates) in label phases.
    const { rerender } = render(<ActionDock {...baseProps} />);
    const column = () => screen.getByTestId('action-dock-mobile').firstElementChild;
    expect(column()).toHaveClass('min-w-min');
    expect(column()).not.toHaveClass('shrink-0');

    rerender(
      <ActionDock
        {...baseProps}
        data={makeData({ LastBidderAddr: '0x0000000000000000000000000000000000000000' })}
      />,
    );
    expect(column()).toHaveClass('min-w-0');
    expect(screen.getByText('home.chrono.phase.waitingFirstGesture.label')).toHaveClass('truncate');
    expect(reserveAmount(screen.getByTestId('action-dock-mobile'))).toBeInTheDocument();
  });

  it('stays hidden while loading and between cycles', () => {
    const { rerender } = render(<ActionDock {...baseProps} loading />);
    expect(screen.queryByTestId('action-dock-mobile')).not.toBeInTheDocument();

    rerender(
      <ActionDock
        {...baseProps}
        loading={false}
        activationTime={Math.floor(Date.now() / 1000) + 3600}
      />,
    );
    // Opening-soon is not an active round: nothing to gesture on yet.
    expect(screen.queryByTestId('action-dock-mobile')).not.toBeInTheDocument();
    expect(screen.queryByTestId('action-dock-desktop')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<ActionDock {...baseProps} stageOutOfView />);
    await checkA11y(container);
  });
});
