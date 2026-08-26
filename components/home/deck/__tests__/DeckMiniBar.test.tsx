import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';

import type { DashboardInfo } from '@/services/api';

import { checkA11y, render, screen } from '@/test-utils';

import { DeckMiniBar } from '../DeckMiniBar';

const data = {
  CurRoundNum: 7,
  LastBidderAddr: '0x1111111111111111111111111111111111111111',
  PrizeAmountEth: 2.75,
  TsRoundStart: Math.floor(Date.now() / 1000) - 3600,
} as unknown as DashboardInfo;

function makeProps(overrides: Partial<React.ComponentProps<typeof DeckMiniBar>> = {}) {
  return {
    visible: true,
    data,
    loading: false,
    allocationTime: Date.now() + 13 * 60 * 60_000,
    activationTime: 0,
    now: Date.now(),
    finalizationConfirmed: true,
    account: '0xUser',
    canGesture: true,
    isGesturing: false,
    submitLabel: 'home.form.submit.eth(cost=0.01020)',
    onGesture: jest.fn(),
    onJumpToDeck: jest.fn(),
    ...overrides,
  };
}

describe('DeckMiniBar', () => {
  it('renders nothing until the Deck scrolls out of view', () => {
    render(<DeckMiniBar {...makeProps({ visible: false })} />);
    expect(screen.queryByTestId('deck-mini-bar')).not.toBeInTheDocument();
  });

  it('renders nothing while the dashboard is loading', () => {
    render(<DeckMiniBar {...makeProps({ loading: true })} />);
    expect(screen.queryByTestId('deck-mini-bar')).not.toBeInTheDocument();
  });

  it('shows the countdown, reserve, and a live gesture action for connected wallets', async () => {
    const user = userEvent.setup();
    const onGesture = jest.fn();
    render(<DeckMiniBar {...makeProps({ onGesture })} />);

    const bar = screen.getByTestId('deck-mini-bar');
    expect(bar).toBeInTheDocument();
    expect(screen.getByText('2.7500 ETH')).toBeInTheDocument();
    expect(screen.getByText('home.deck.miniBar.reserve')).toBeInTheDocument();

    await user.click(screen.getByTestId('mini-bar-gesture'));
    expect(onGesture).toHaveBeenCalledTimes(1);
  });

  it('falls back to a jump-to-Deck action when the wallet cannot gesture', async () => {
    const user = userEvent.setup();
    const onJumpToDeck = jest.fn();
    render(<DeckMiniBar {...makeProps({ account: null, onJumpToDeck })} />);

    expect(screen.queryByTestId('mini-bar-gesture')).not.toBeInTheDocument();
    await user.click(screen.getByTestId('mini-bar-jump'));
    expect(onJumpToDeck).toHaveBeenCalledTimes(1);
  });

  it('disables the gesture action while a transaction is processing', () => {
    render(<DeckMiniBar {...makeProps({ isGesturing: true })} />);
    expect(screen.getByTestId('mini-bar-gesture')).toBeDisabled();
    expect(screen.getByTestId('mini-bar-gesture')).toHaveTextContent('home.form.processing');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<DeckMiniBar {...makeProps()} />);
    await checkA11y(container);
  });
});
