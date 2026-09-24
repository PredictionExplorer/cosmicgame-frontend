import userEvent from '@testing-library/user-event';

import { render, screen, within, checkA11y } from '@/test-utils';

import { CycleStanding, CycleStandingPreview, type CycleStandingProps } from '../CycleStanding';

const TAKER = '0x6cA7000000000000000000000000000000003FFa';
const NOW = 1_790_000_000_000;

const baseProps: CycleStandingProps = {
  isLatest: false,
  isReadyToFinalize: false,
  isConfirmingFinalization: false,
  exclusiveWindowOpen: false,
  holdSeconds: null,
  moment: null,
  nowMs: NOW,
  participation: { status: 'ready', gestures: 6, spentEth: 0.3, spentCst: 845 },
  totalGestures: 1141,
  retrieve: { state: 'none' },
};

describe('CycleStanding', () => {
  it('states the position, the wallet share of this cycle and what waits to retrieve', () => {
    render(<CycleStanding {...baseProps} />);

    expect(screen.getByRole('heading', { name: 'home.observatory.standing.title' })).toBeVisible();
    expect(screen.getByTestId('personal-standing')).toHaveTextContent(
      'home.observatory.standing.positionOther',
    );
    // The count is the wallet's own Gestures out of the cycle's, read from the
    // index — never the length of a partly loaded feed.
    expect(screen.getByTestId('personal-gesture-count')).toHaveTextContent(
      'home.observatory.standing.gestures(count=6,total=1,141)',
    );
    expect(screen.getByTestId('personal-gesture-count')).toHaveTextContent(
      /home\.observatory\.standing\.share\(percent=0\.53%\)/,
    );
    expect(screen.getByTestId('personal-retrieve-status')).toHaveTextContent(
      'home.observatory.standing.waitingNothing',
    );
  });

  it('shows the hold while the wallet holds the Last Gesture', () => {
    render(<CycleStanding {...baseProps} isLatest holdSeconds={3 * 3600 + 16 * 60} />);
    const position = screen.getByTestId('personal-standing');
    expect(position).toHaveTextContent('home.observatory.standing.positionLatest');
    expect(position).toHaveTextContent('home.deck.personal.heldFor(duration=3h 16m)');
  });

  it('says only this wallet can finalize during its exclusive window, and leads there', async () => {
    const user = userEvent.setup();
    const onGoToFinalize = jest.fn();
    render(
      <CycleStanding
        {...baseProps}
        isLatest
        isReadyToFinalize
        exclusiveWindowOpen
        onGoToFinalize={onGoToFinalize}
      />,
    );
    const position = screen.getByTestId('personal-standing');
    expect(position).toHaveTextContent('home.observatory.standing.positionExclusive');
    await user.click(within(position).getByRole('button', { name: /goToFinalize/ }));
    expect(onGoToFinalize).toHaveBeenCalledTimes(1);
  });

  it('says when the exclusive window has ended', () => {
    render(<CycleStanding {...baseProps} isLatest isReadyToFinalize />);
    const position = screen.getByTestId('personal-standing');
    expect(position).toHaveTextContent('home.observatory.standing.positionWindowEnded');
    expect(position).toHaveTextContent('home.observatory.clock.finalize.openNow');
  });

  it('marks the moment another participant takes the place, with who and when', async () => {
    const user = userEvent.setup();
    const onDismissMoment = jest.fn();
    render(
      <CycleStanding
        {...baseProps}
        moment={{ kind: 'taken', by: TAKER, atMs: NOW - 5 * 60_000 }}
        onDismissMoment={onDismissMoment}
      />,
    );
    const position = screen.getByTestId('personal-standing');
    expect(position).toHaveTextContent('home.observatory.standing.positionTaken');
    expect(within(position).getByRole('link', { name: /0x6ca7/i })).toHaveAttribute(
      'href',
      `/user/${TAKER}`,
    );
    expect(position).toHaveTextContent(/5 minutes ago/);
    await user.click(
      within(position).getByRole('button', { name: 'home.observatory.standing.dismiss' }),
    );
    expect(onDismissMoment).toHaveBeenCalledTimes(1);
  });

  it('never reports a false count: pending while loading or indexing, unknown after a failure', async () => {
    const user = userEvent.setup();
    const retry = jest.fn();
    const { rerender } = render(
      <CycleStanding {...baseProps} participation={{ status: 'loading' }} />,
    );
    expect(screen.getByTestId('personal-gesture-count')).not.toHaveTextContent(/\d/);

    rerender(<CycleStanding {...baseProps} participationUpdating />);
    expect(screen.getByTestId('personal-gesture-count')).toHaveTextContent(
      'home.observatory.standing.updating',
    );

    rerender(<CycleStanding {...baseProps} participation={{ status: 'error', retry }} />);
    const count = screen.getByTestId('personal-gesture-count');
    expect(count).toHaveTextContent('—');
    await user.click(
      within(count).getByRole('button', { name: 'home.observatory.standing.retry' }),
    );
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('never says "nothing to retrieve" before the read succeeded', async () => {
    const user = userEvent.setup();
    const retry = jest.fn();
    const { rerender } = render(<CycleStanding {...baseProps} retrieve={{ state: 'loading' }} />);
    const status = () => screen.getByTestId('personal-retrieve-status');
    expect(status()).not.toHaveTextContent('waitingNothing');

    rerender(<CycleStanding {...baseProps} retrieve={{ state: 'unknown', retry }} />);
    expect(status()).toHaveTextContent('home.observatory.standing.checkFailed');
    await user.click(
      within(status()).getByRole('button', { name: 'home.observatory.standing.retry' }),
    );
    expect(retry).toHaveBeenCalledTimes(1);
  });

  it('names what waits and links to where it is retrieved', () => {
    render(<CycleStanding {...baseProps} retrieve={{ state: 'waiting', eth: 0.1, nfts: 2 }} />);
    const link = screen.getByTestId('personal-retrieve');
    expect(link).toHaveAttribute('href', '/my-allocations');
    expect(link).toHaveTextContent(
      /0\.1000.ETH · home\.observatory\.standing\.waitingNfts\(count=2\)/,
    );
  });

  it('says so plainly when the wallet has not made a Gesture this cycle', () => {
    render(
      <CycleStanding
        {...baseProps}
        participation={{ status: 'ready', gestures: 0, spentEth: 0, spentCst: 0 }}
      />,
    );
    expect(screen.getByTestId('personal-standing')).toHaveTextContent(
      'home.observatory.standing.positionNone',
    );
    expect(screen.getByTestId('personal-gesture-count')).not.toHaveTextContent('share');
  });

  it('keeps its shape before a wallet connects', () => {
    render(<CycleStandingPreview />);
    expect(screen.getByTestId('cycle-standing-preview')).toHaveTextContent(
      'home.observatory.standing.connectBody',
    );
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <CycleStanding {...baseProps} retrieve={{ state: 'waiting', eth: 0.1, nfts: 0 }} />,
    );
    await checkA11y(container);
  });
});
