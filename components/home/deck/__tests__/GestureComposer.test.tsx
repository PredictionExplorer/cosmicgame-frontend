import '@testing-library/jest-dom';

import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen, within } from '@/test-utils';

import { GestureComposer } from '../GestureComposer';

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

function makeProps(overrides: Partial<React.ComponentProps<typeof GestureComposer>> = {}) {
  return {
    message: '',
    setMessage: jest.fn(),
    gestureType: 'ETH',
    onSelectGestureType: jest.fn(),
    showCstOption: true,
    rwlkId: -1,
    account: '0xUser',
    isGesturing: false,
    canGesture: true,
    submitLabel: 'home.form.submit.eth(cost=0.01020)',
    onGesture: jest.fn(),
    onOpenFullConsole: jest.fn(),
    ...overrides,
  };
}

describe('GestureComposer', () => {
  it('renders the message input with the send button labeled as the live gesture cost', () => {
    render(<GestureComposer {...makeProps()} />);

    expect(screen.getByText('home.deck.composer.title')).toBeInTheDocument();
    expect(screen.getByTestId('composer-message-input')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /home\.form\.submit\.eth\(cost=0\.01020\)/ }),
    ).toBeEnabled();
    expect(screen.getByText('home.deck.composer.note')).toBeInTheDocument();
  });

  it('drafts the shared on-chain message and shows the character budget', async () => {
    const user = userEvent.setup();
    const setMessage = jest.fn();
    render(<GestureComposer {...makeProps({ message: 'gm cosmos', setMessage })} />);

    expect(screen.getByTestId('composer-message-input')).toHaveValue('gm cosmos');
    expect(screen.getByTestId('composer-char-count')).toHaveTextContent('9/280');

    await user.type(screen.getByTestId('composer-message-input'), '!');
    expect(setMessage).toHaveBeenCalledWith('gm cosmos!');
  });

  it('sends by invoking the shared gesture handler', async () => {
    const user = userEvent.setup();
    const onGesture = jest.fn();
    render(<GestureComposer {...makeProps({ onGesture })} />);

    await user.click(screen.getByRole('button', { name: /home\.form\.submit\.eth/ }));

    expect(onGesture).toHaveBeenCalledTimes(1);
  });

  it('switches methods through the shared handler and hides CST before the first gesture', async () => {
    const user = userEvent.setup();
    const onSelectGestureType = jest.fn();
    const { rerender } = render(<GestureComposer {...makeProps({ onSelectGestureType })} />);

    await user.click(screen.getByRole('button', { name: /home\.form\.method\.cst\.label/ }));
    expect(onSelectGestureType).toHaveBeenCalledWith('CST');

    rerender(<GestureComposer {...makeProps({ showCstOption: false })} />);
    expect(
      screen.queryByRole('button', { name: /home\.form\.method\.cst\.label/ }),
    ).not.toBeInTheDocument();
  });

  it('surfaces the RandomWalk state as a chip that opens the full console', async () => {
    const user = userEvent.setup();
    const onOpenFullConsole = jest.fn();
    const { rerender } = render(
      <GestureComposer
        {...makeProps({ gestureType: 'RandomWalk', rwlkId: -1, onOpenFullConsole })}
      />,
    );

    const chooseChip = screen.getByRole('button', { name: 'home.deck.composer.rwlkChoose' });
    await user.click(chooseChip);
    expect(onOpenFullConsole).toHaveBeenCalledTimes(1);
    // Send stays disabled until a token is picked.
    expect(screen.getByRole('button', { name: /home\.form\.submit/ })).toBeDisabled();

    rerender(
      <GestureComposer
        {...makeProps({
          gestureType: 'RandomWalk',
          rwlkId: 123,
          submitLabel: 'home.form.submit.randomWalkWithToken(tokenId=123,cost=0.00510)',
        })}
      />,
    );
    expect(
      screen.getByRole('button', { name: 'home.deck.composer.rwlkChip(id=123)' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /home\.form\.submit/ })).toBeEnabled();
  });

  it('disables sending while a gesture is processing or the wallet cannot gesture', () => {
    const { rerender } = render(<GestureComposer {...makeProps({ isGesturing: true })} />);
    expect(screen.getByRole('button', { name: /home\.form\.processing/ })).toBeDisabled();

    rerender(<GestureComposer {...makeProps({ canGesture: false })} />);
    expect(screen.getByRole('button', { name: /home\.form\.submit/ })).toBeDisabled();
    expect(screen.getByText('home.form.finalGestureMade')).toBeInTheDocument();
  });

  it('shows a connect prompt when the wallet is disconnected', () => {
    render(<GestureComposer {...makeProps({ account: null })} />);

    const connect = screen.getByTestId('composer-connect');
    expect(within(connect).getByText('home.deck.composer.connectBody')).toBeInTheDocument();
    expect(screen.queryByTestId('composer-message-input')).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<GestureComposer {...makeProps()} />);
    await checkA11y(container);
  });
});
