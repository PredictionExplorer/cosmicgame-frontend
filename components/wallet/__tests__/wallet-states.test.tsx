import { WalletRequiredState } from '@/components/ui/wallet-required-state';

import { checkA11y, fireEvent, render, screen } from '@/test-utils';

import { ChainGuard, SwitchNetworkButton, WrongNetworkChip } from '../NetworkGuard';
import { ConnectWalletAction } from '../ConnectWalletAction';
import { FundingNotice } from '../FundingNotice';

const mockRequestConnectModal = jest.fn();
const mockWarmConnectModal = jest.fn();
let mockConnectPending = false;

jest.mock('../../../contexts/WalletUiContext', () => {
  const walletUi = () => ({
    requestConnectModal: mockRequestConnectModal,
    warmConnectModal: mockWarmConnectModal,
    connectPending: mockConnectPending,
  });
  return {
    useWalletUi: walletUi,
    useOptionalWalletUi: walletUi,
    WalletUiProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

let mockAccountStatus = 'disconnected';
let mockWalletChainId: number | undefined;
let mockBalance: { value: bigint } | undefined;
const mockSwitchChainAsync = jest.fn().mockResolvedValue(undefined);

jest.mock('wagmi', () => ({
  ...jest.requireActual('../../../__mocks__/wagmi'),
  useAccount: () => ({
    address: mockWalletChainId ? '0xUser' : undefined,
    isConnected: mockWalletChainId !== undefined,
    chainId: mockWalletChainId,
    status: mockAccountStatus,
  }),
  useBalance: () => ({ data: mockBalance }),
  useSwitchChain: () => ({ switchChainAsync: mockSwitchChainAsync, isPending: false }),
}));

let mockAccount: string | null = null;
jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount, chainId: 421614, active: !!mockAccount }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockConnectPending = false;
  mockAccountStatus = 'disconnected';
  mockWalletChainId = undefined;
  mockBalance = undefined;
  mockAccount = null;
});

describe('ConnectWalletAction', () => {
  it('opens the wallet list and warms it on hover and focus', () => {
    render(<ConnectWalletAction />);
    const button = screen.getByTestId('connect-wallet-button');
    fireEvent.pointerEnter(button);
    fireEvent.focus(button);
    fireEvent.click(button);
    expect(mockWarmConnectModal).toHaveBeenCalledTimes(2);
    expect(mockRequestConnectModal).toHaveBeenCalledTimes(1);
    expect(button).toHaveTextContent('wallet.connect.button');
  });

  it('shows a busy state while the list downloads', () => {
    mockConnectPending = true;
    render(<ConnectWalletAction label="Connect to retrieve" />);
    const button = screen.getByTestId('connect-wallet-button');
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toHaveTextContent('Connect to retrieve');
    expect(button).toHaveTextContent('wallet.connect.opening');
  });

  it('warms the wallet UI once visible when asked to', () => {
    const observers: IntersectionObserverCallback[] = [];
    const original = window.IntersectionObserver;
    window.IntersectionObserver = jest.fn((callback: IntersectionObserverCallback) => {
      observers.push(callback);
      return { observe: jest.fn(), disconnect: jest.fn() };
    }) as unknown as typeof IntersectionObserver;
    window.requestIdleCallback = jest.fn((task: IdleRequestCallback) => {
      task({} as IdleDeadline);
      return 1;
    });
    window.cancelIdleCallback = jest.fn();

    render(<ConnectWalletAction warmOnVisible />);
    observers[0]!(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );
    expect(mockWarmConnectModal).toHaveBeenCalledTimes(1);

    window.IntersectionObserver = original;
  });
});

describe('WalletRequiredState', () => {
  it('explains what connecting unlocks and links the public view', async () => {
    const { container } = render(
      <WalletRequiredState
        title="Connect a wallet to see your allocations"
        description="Your allocations appear here."
        publicLink={{ href: '/allocation', label: 'Browse all Allocation Recipients' }}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Connect a wallet to see your allocations' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse all Allocation Recipients' })).toHaveAttribute(
      'href',
      '/allocation',
    );
    expect(screen.getByText('wallet.required.hint')).toBeInTheDocument();
    await checkA11y(container);
  });

  it('shows a quiet connecting line while a session is being restored', () => {
    mockAccountStatus = 'reconnecting';
    render(<WalletRequiredState title="Connect" />);
    expect(screen.queryByTestId('connect-wallet-button')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('common.liveStatus.connecting');
  });
});

describe('network guard', () => {
  it('renders nothing while the wallet is on the app chain', () => {
    mockWalletChainId = 421614;
    render(<WrongNetworkChip />);
    expect(screen.queryByTestId('wrong-network-chip')).not.toBeInTheDocument();
  });

  it('offers a one-click switch naming the network when the wallet is elsewhere', async () => {
    mockWalletChainId = 1;
    const { container } = render(<WrongNetworkChip />);

    const chip = screen.getByTestId('wrong-network-chip');
    expect(chip).toHaveAccessibleName(
      'wallet.network.wrong wallet.network.switchTo(network=Arbitrum Sepolia)',
    );
    expect(chip).toHaveAttribute(
      'title',
      'wallet.network.walletOn(current=Ethereum,network=Arbitrum Sepolia)',
    );
    fireEvent.click(chip);
    expect(mockSwitchChainAsync).toHaveBeenCalledWith({ chainId: 421614 });
    await checkA11y(container);
  });

  it('swaps an action for the switch button and says why', () => {
    mockWalletChainId = 8453;
    render(
      <ChainGuard>
        <button type="button">Retrieve</button>
      </ChainGuard>,
    );
    expect(screen.queryByRole('button', { name: 'Retrieve' })).not.toBeInTheDocument();
    expect(
      screen.getByText('wallet.network.walletOn(current=Base,network=Arbitrum Sepolia)'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'wallet.network.switchTo(network=Arbitrum Sepolia)' }),
    ).toBeInTheDocument();
  });

  it('passes the action through on the right chain, or asks to connect when required', () => {
    mockWalletChainId = 421614;
    const { rerender } = render(
      <ChainGuard requireConnection>
        <button type="button">Retrieve</button>
      </ChainGuard>,
    );
    expect(screen.getByTestId('connect-wallet-button')).toBeInTheDocument();

    mockAccount = '0xUser';
    rerender(
      <ChainGuard requireConnection>
        <button type="button">Retrieve</button>
      </ChainGuard>,
    );
    expect(screen.getByRole('button', { name: 'Retrieve' })).toBeInTheDocument();
  });

  it('keeps the switch button usable on its own', () => {
    mockWalletChainId = 1;
    render(<SwitchNetworkButton />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockSwitchChainAsync).toHaveBeenCalled();
  });
});

describe('FundingNotice', () => {
  it('stays hidden while the balance covers the cost or is unknown', () => {
    mockWalletChainId = 421614;
    const { rerender } = render(<FundingNotice requiredWei={10n ** 16n} />);
    expect(screen.queryByTestId('funding-notice')).not.toBeInTheDocument();

    mockBalance = { value: 10n ** 18n };
    rerender(<FundingNotice requiredWei={10n ** 16n} />);
    expect(screen.queryByTestId('funding-notice')).not.toBeInTheDocument();
  });

  it('names both amounts and links how to add ETH on the network', () => {
    mockWalletChainId = 421614;
    mockBalance = { value: 10n ** 15n };
    render(<FundingNotice requiredWei={2n * 10n ** 16n} />);

    expect(screen.getByTestId('funding-notice')).toHaveTextContent(
      'wallet.funding.short(available=0.001,required=0.02,network=Arbitrum Sepolia)',
    );
    expect(
      screen.getByRole('link', { name: 'wallet.funding.howTo(network=Arbitrum Sepolia)' }),
    ).toHaveAttribute('href', '/faq#how-to-get-eth-on-arbitrum');
  });
});
