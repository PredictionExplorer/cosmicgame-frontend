import userEvent from '@testing-library/user-event';

import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';

import { checkA11y, fireEvent, render, screen, waitFor, within } from '@/test-utils';

import ConnectWalletButton from '../ConnectWalletButton';

const ACCOUNT = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

let mockAccount: string | null = ACCOUNT;
const mockAddCst = jest.fn();

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount }),
}));

jest.mock('../../../hooks/useMetaMaskWatchAsset', () => ({
  useMetaMaskWatchAsset: () => ({
    isMetaMaskConnected: true,
    isAddingCst: false,
    isAddingNft: false,
    addCst: mockAddCst,
    addCosmicSignatureNft: jest.fn(),
  }),
}));

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
    // test-utils wraps every render with the real provider component name.
    WalletUiProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

const mockDisconnectAsync = jest.fn().mockResolvedValue(undefined);
/** The wallet's chain: the app chain (Arbitrum Sepolia in tests) unless a test moves it. */
let mockWalletChainId = 421614;
jest.mock('wagmi', () => ({
  ...jest.requireActual('../../../__mocks__/wagmi'),
  useConnection: () => ({
    address: mockAccount ?? undefined,
    isConnected: mockAccount !== null,
    chainId: mockWalletChainId,
    status: mockAccount ? 'connected' : 'disconnected',
    connector: undefined,
  }),
  useDisconnect: () => ({ mutateAsync: mockDisconnectAsync, isPending: false }),
}));

function renderWalletButton(props: Partial<React.ComponentProps<typeof ConnectWalletButton>> = {}) {
  return render(
    <ConnectWalletButton
      loading={false}
      balance={{ ETH: 1, CosmicToken: 25, CosmicSignature: 2, RWLK: 3 }}
      stakedTokenCount={{ cst: 4, rwalk: 5 }}
      {...props}
    />,
  );
}

async function openMenu() {
  const user = userEvent.setup();
  await user.click(screen.getByTestId('wallet-menu-trigger'));
  return { user, menu: await screen.findByRole('menu') };
}

describe('ConnectWalletButton', () => {
  beforeEach(() => {
    mockAccount = ACCOUNT;
    mockConnectPending = false;
    mockWalletChainId = 421614;
    jest.clearAllMocks();
  });

  it('renders nothing without a wallet: the header shows its own connect button', () => {
    mockAccount = null;
    const { container } = renderWalletButton();
    expect(container).toBeEmptyDOMElement();
  });

  describe('connected, desktop menu', () => {
    it('names the trigger after the account and shows its short address', () => {
      renderWalletButton();
      const trigger = screen.getByTestId('wallet-menu-trigger');
      expect(trigger).toHaveAccessibleName(/wallet\.account\.menuLabel\(address=0xabcd/i);
      expect(within(trigger).getByText(/0xAbCd…⁠abcd/i)).toBeInTheDocument();
    });

    it('says in its name that the wallet is on another network, where only the badge shows it', () => {
      mockWalletChainId = 1;
      renderWalletButton();
      for (const testId of ['wallet-menu-trigger', 'wallet-account-trigger']) {
        const trigger = screen.getByTestId(testId);
        expect(trigger).toHaveAccessibleName(
          /^wallet\.account\.menuLabelWrongNetwork\(menu=wallet\.account\.menuLabel\(address=0xabcd/i,
        );
        // The badge is drawn only; the name carries the state.
        expect(within(trigger).getByTestId('wrong-network-badge')).toHaveAttribute(
          'aria-hidden',
          'true',
        );
      }
    });

    it('lists balances and anchored NFTs as figures, units in the labels', async () => {
      renderWalletButton({
        balance: { ETH: 2.5, CosmicToken: 50, CosmicSignature: 5, RWLK: 3 },
        stakedTokenCount: { cst: 7, rwalk: 2 },
      });
      const { menu } = await openMenu();
      expect(within(menu).getByText('wallet.labels.balancesHeading')).toBeInTheDocument();
      const figure = (label: string) =>
        within(menu).getByText(label).closest('div')?.querySelector('dd')?.textContent;
      expect(figure('wallet.balances.eth')).toMatch(/^2\.5/);
      expect(figure('wallet.balances.cosmicNfts')).toBe('5');
      expect(figure('wallet.balances.anchoredCst')).toBe('7');
      expect(figure('wallet.balances.anchoredRwlk')).toBe('2');
    });

    it('shows a loading mark instead of figures while balances load', async () => {
      renderWalletButton({ loading: true });
      const { menu } = await openMenu();
      expect(
        within(menu).getByText('wallet.balances.eth').closest('div')?.querySelector('dd'),
      ).toHaveTextContent('…');
    });

    it('groups the account pages under one heading, in taxonomy order', async () => {
      renderWalletButton();
      const { menu } = await openMenu();
      expect(within(menu).getByText('nav.sections.account')).toBeInTheDocument();
      const pages = [
        ['myStatistics', '/my-statistics'],
        ['myAllocations', '/my-allocations'],
        ['myNfts', '/my-tokens'],
        ['myAnchors', '/my-anchors'],
        ['allocationHistory', '/recipient-history'],
        ['transferCst', '/transfer-cst'],
      ];
      for (const [id, href] of pages) {
        expect(
          within(menu).getByRole('menuitem', { name: new RegExp(`nav\\.routes\\.${id}\\.label`) }),
        ).toHaveAttribute('href', href);
      }
      expect(document.querySelector('a[href="/internal/cst-outreach-transfer"]')).toBeNull();
    });

    it('offers copy, explorer, switch wallet and disconnect', async () => {
      renderWalletButton();
      const { user, menu } = await openMenu();
      expect(
        within(menu).getByRole('menuitem', { name: 'wallet.accessibility.copyAddress' }),
      ).toBeInTheDocument();
      expect(
        within(menu).getByRole('menuitem', { name: /wallet\.account\.viewOnExplorer/ }),
      ).toHaveAttribute('href', expect.stringContaining(`/address/${ACCOUNT}`));
      expect(
        within(menu).getByRole('menuitem', { name: 'wallet.account.switchWallet' }),
      ).toBeVisible();
      await user.click(within(menu).getByRole('menuitem', { name: 'wallet.account.disconnect' }));
      expect(mockDisconnectAsync).toHaveBeenCalledTimes(1);
    });

    it('lets MetaMask users add CST and links trading, never Chaos Zero', async () => {
      renderWalletButton();
      const { user, menu } = await openMenu();
      const trade = within(menu).getByRole('menuitem', { name: /nav\.outbound\.uniswap\.label/ });
      expect(trade).toHaveAttribute('href', CST_UNISWAP_SWAP_URL);
      expect(trade).toHaveAttribute('target', '_blank');
      expect(trade).toHaveAttribute('rel', 'noopener noreferrer');
      expect(
        within(menu).getByRole('menuitem', { name: /nav\.outbound\.axiomZero\.label/ }),
      ).toHaveAttribute('href', COSMIC_SIGNATURE_MARKETPLACE_URL);
      expect(document.querySelector(`a[href="${CHAOS_ZERO_PREDICTIONS_URL}"]`)).toBeNull();

      await user.click(
        within(menu).getByRole('menuitem', { name: 'wallet.account.addCstToMetaMask' }),
      );
      expect(mockAddCst).toHaveBeenCalledTimes(1);
    });

    it('says in words how much waits in My Allocations', async () => {
      renderWalletButton({ hasUnclaimedRewards: true, retrievableEth: 0.25 });
      expect(screen.getByTestId('wallet-menu-trigger')).toHaveAccessibleName(
        /wallet\.account\.menuLabelWithAlert/,
      );
      const { menu } = await openMenu();
      expect(
        within(menu).getByRole('menuitem', { name: /nav\.routes\.myAllocations\.label/ }),
      ).toHaveTextContent(/wallet\.account\.retrieveAmount\(amount=0\.25/);
    });

    it('falls back to a plain note when nothing waits in ETH', async () => {
      renderWalletButton({ hasUnclaimedRewards: true, retrievableEth: null });
      const { menu } = await openMenu();
      expect(
        within(menu).getByRole('menuitem', { name: /nav\.routes\.myAllocations\.label/ }),
      ).toHaveTextContent('wallet.account.retrieveReady');
    });
  });

  describe('connected, phone sheet', () => {
    it('opens the account sheet with the wallet actions and the account pages', async () => {
      renderWalletButton();
      const trigger = screen.getByTestId('wallet-account-trigger');
      expect(trigger).toHaveAccessibleName(/0xabcd/i);
      fireEvent.click(trigger);

      const sheet = await screen.findByRole('dialog');
      expect(within(sheet).getByTestId('wallet-account-panel')).toBeInTheDocument();
      expect(
        within(sheet).getByRole('link', { name: /nav\.routes\.transferCst\.label/ }),
      ).toHaveAttribute('href', '/transfer-cst');
      fireEvent.click(within(sheet).getByRole('button', { name: 'wallet.account.disconnect' }));
      expect(mockDisconnectAsync).toHaveBeenCalledTimes(1);
    });

    it('shows the account title once, not again over the pages', async () => {
      renderWalletButton();
      fireEvent.click(screen.getByTestId('wallet-account-trigger'));
      const sheet = await screen.findByRole('dialog');
      expect(within(sheet).getAllByText('wallet.account.heading')).toHaveLength(1);
      expect(within(sheet).queryByText('nav.sections.account')).toBeNull();
      expect(within(sheet).getByRole('navigation')).toHaveAccessibleName('nav.sections.account');
    });

    it('closes the sheet when an account page is picked', async () => {
      renderWalletButton();
      fireEvent.click(screen.getByTestId('wallet-account-trigger'));
      const sheet = await screen.findByRole('dialog');

      // jsdom cannot follow the link; the router (mocked) would.
      const stayHere = (event: Event) => event.preventDefault();
      document.addEventListener('click', stayHere);
      try {
        fireEvent.click(within(sheet).getByRole('link', { name: /nav\.routes\.myAnchors\.label/ }));
      } finally {
        document.removeEventListener('click', stayHere);
      }

      await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      expect(screen.getByTestId('wallet-account-trigger')).toHaveAttribute('data-state', 'closed');
    });

    it('closes the sheet when the route changes under it (back, forward)', async () => {
      const navigation = jest.requireMock('next/navigation') as { usePathname: () => string };
      const realPathname = navigation.usePathname;
      let pathname = '/';
      navigation.usePathname = () => pathname;
      try {
        const { rerender } = renderWalletButton();
        fireEvent.click(screen.getByTestId('wallet-account-trigger'));
        expect(await screen.findByRole('dialog')).toBeInTheDocument();

        pathname = '/my-anchors';
        rerender(
          <ConnectWalletButton
            loading={false}
            balance={{ ETH: 1, CosmicToken: 25, CosmicSignature: 2, RWLK: 3 }}
            stakedTokenCount={{ cst: 4, rwalk: 5 }}
          />,
        );

        await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
      } finally {
        navigation.usePathname = realPathname;
      }
    });
  });

  it('shows a figure it could not read as unavailable, never as zero', async () => {
    renderWalletButton({
      balance: { ETH: 1, CosmicToken: null, CosmicSignature: null, RWLK: 3 },
    });
    const { menu } = await openMenu();
    const cst = within(menu).getByText('wallet.balances.cst').closest('div')!;
    expect(within(cst).getByText('common.status.unavailable')).toBeInTheDocument();
    expect(within(cst).queryByText('0')).toBeNull();
    const nfts = within(menu).getByText('wallet.balances.cosmicNfts').closest('div')!;
    expect(within(nfts).getByText('common.status.unavailable')).toBeInTheDocument();
    const rwlk = within(menu).getByText('wallet.balances.rwlkNfts').closest('div')!;
    expect(within(rwlk).getByText('3')).toBeInTheDocument();
  });

  it('renders both triggers and lets CSS choose: the sheet on phones, the menu from 768px', () => {
    renderWalletButton();
    expect(screen.getByTestId('wallet-account-trigger')).toHaveClass('md:hidden');
    expect(screen.getByTestId('wallet-menu-trigger')).toHaveClass('hidden', 'md:inline-flex');
  });

  it('has no accessibility violations', async () => {
    const { container } = renderWalletButton();
    await checkA11y(container);
  });
});
