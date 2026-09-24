import userEvent from '@testing-library/user-event';

import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';

import { fireEvent, render, screen, within } from '@/test-utils';

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
jest.mock('wagmi', () => ({
  ...jest.requireActual('../../../__mocks__/wagmi'),
  useDisconnect: () => ({ mutateAsync: mockDisconnectAsync, isPending: false }),
}));

function renderWalletButton(props: Partial<React.ComponentProps<typeof ConnectWalletButton>> = {}) {
  return render(
    <ConnectWalletButton
      presentation="menu"
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
    jest.clearAllMocks();
  });

  describe('disconnected', () => {
    beforeEach(() => {
      mockAccount = null;
    });

    it('renders the deferred connect trigger', () => {
      renderWalletButton();
      expect(screen.getByTestId('connect-wallet-button')).toHaveTextContent(
        'wallet.connect.button',
      );
    });

    it('shows a busy spinner while the wallet list downloads', () => {
      mockConnectPending = true;
      renderWalletButton();
      const trigger = screen.getByTestId('connect-wallet-button');
      expect(trigger).toHaveAttribute('aria-busy', 'true');
      expect(trigger).toHaveTextContent('wallet.connect.opening');
    });

    it('opens the lazy wallet modal on click and warms its chunk on hover', () => {
      renderWalletButton();
      const trigger = screen.getByTestId('connect-wallet-button');
      fireEvent.pointerEnter(trigger);
      expect(mockWarmConnectModal).toHaveBeenCalledTimes(1);
      expect(mockRequestConnectModal).not.toHaveBeenCalled();
      fireEvent.click(trigger);
      expect(mockRequestConnectModal).toHaveBeenCalledTimes(1);
    });

    it('shortens its label where the header is tightest', () => {
      renderWalletButton({ compactInHeader: true });
      const trigger = screen.getByTestId('connect-wallet-button');
      expect(within(trigger).getByText('wallet.connect.buttonShort')).toHaveClass('sm:hidden');
      expect(within(trigger).getByText('wallet.connect.button')).toHaveClass('hidden', 'sm:inline');
    });

    it('applies liquid glass only when explicitly requested', () => {
      renderWalletButton({ liquid: true });
      expect(screen.getByTestId('connect-wallet-button')).toHaveClass('liquid-glass-cta');
    });
  });

  describe('connected, desktop menu', () => {
    it('names the trigger after the account', () => {
      renderWalletButton();
      expect(screen.getByTestId('wallet-menu-trigger')).toHaveAccessibleName(
        /wallet\.account\.menuLabel\(address=0xabcd/i,
      );
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
      renderWalletButton({ presentation: 'sheet' });
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

    it('keeps the deprecated isMobileView prop working', () => {
      render(
        <ConnectWalletButton
          isMobileView
          loading={false}
          balance={{ ETH: 0, CosmicToken: 0, CosmicSignature: 0, RWLK: 0 }}
          stakedTokenCount={{ cst: 0, rwalk: 0 }}
        />,
      );
      expect(screen.getByTestId('wallet-account-trigger')).toBeInTheDocument();
      expect(screen.queryByTestId('wallet-menu-trigger')).toBeNull();
    });
  });

  it('renders both triggers, chosen by CSS, in the responsive header mode', () => {
    renderWalletButton({ presentation: 'responsive' });
    expect(screen.getByTestId('wallet-account-trigger')).toHaveClass('md:hidden');
    expect(screen.getByTestId('wallet-menu-trigger')).toHaveClass('hidden', 'md:inline-flex');
  });
});
