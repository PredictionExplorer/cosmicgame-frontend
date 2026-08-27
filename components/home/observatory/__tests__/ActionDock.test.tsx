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

describe('ActionDock', () => {
  it('keeps the phone dock present with the live price and reserve', async () => {
    const user = userEvent.setup();
    render(<ActionDock {...baseProps} />);

    const dock = screen.getByTestId('action-dock-mobile');
    expect(within(dock).getByText('2.7500 ETH')).toBeInTheDocument();

    const open = within(dock).getByTestId('dock-open-sheet');
    expect(open).toHaveTextContent('home.form.submit.eth(cost=0.01020)');
    await user.click(open);
    expect(baseProps.onOpenSheet).toHaveBeenCalledTimes(1);
  });

  it('shows the desktop dock only after the stage scrolls away', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ActionDock {...baseProps} />);
    expect(screen.queryByTestId('action-dock-desktop')).not.toBeInTheDocument();

    rerender(<ActionDock {...baseProps} stageOutOfView />);
    const dock = screen.getByTestId('action-dock-desktop');
    expect(within(dock).getByText('2.7500 ETH')).toBeInTheDocument();

    // The dock never submits — it routes back to the one gesture panel.
    await user.click(within(dock).getByTestId('dock-jump-to-panel'));
    expect(baseProps.onJumpToPanel).toHaveBeenCalledTimes(1);
    expect(baseProps.onOpenSheet).not.toHaveBeenCalled();
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
