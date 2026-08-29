import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';

import { fireEvent, render, screen } from '@/test-utils';

import ConnectWalletButton from '../ConnectWalletButton';

const ACCOUNT = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

let mockAccount: string | null = ACCOUNT;
const mockAddCst = jest.fn();

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({
    account: mockAccount,
  }),
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

jest.mock('../../../contexts/WalletUiContext', () => ({
  useWalletUi: () => ({
    requestConnectModal: mockRequestConnectModal,
    warmConnectModal: mockWarmConnectModal,
  }),
  // test-utils wraps every render with the real provider component name.
  WalletUiProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('../../ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
}));

function renderWalletButton(liquid = false) {
  render(
    <ConnectWalletButton
      isMobileView={false}
      loading={false}
      balance={{
        ETH: 1,
        CosmicToken: 25,
        CosmicSignature: 2,
        RWLK: 3,
      }}
      stakedTokenCount={{ cst: 4, rwalk: 5 }}
      liquid={liquid}
    />,
  );
}

describe('ConnectWalletButton', () => {
  beforeEach(() => {
    mockAccount = ACCOUNT;
    mockRequestConnectModal.mockClear();
    mockWarmConnectModal.mockClear();
  });

  it('renders the deferred connect trigger when disconnected', () => {
    mockAccount = null;

    renderWalletButton();

    expect(screen.getByTestId('connect-wallet-button')).toHaveTextContent('wallet.connect.button');
  });

  it('applies liquid glass only when explicitly requested', () => {
    mockAccount = null;

    renderWalletButton(true);

    expect(screen.getByTestId('connect-wallet-button')).toHaveClass('liquid-glass-cta');
  });

  it('opens the lazy wallet modal on click and warms its chunk on hover', () => {
    mockAccount = null;

    renderWalletButton();
    const trigger = screen.getByTestId('connect-wallet-button');

    fireEvent.pointerEnter(trigger);
    expect(mockWarmConnectModal).toHaveBeenCalledTimes(1);
    expect(mockRequestConnectModal).not.toHaveBeenCalled();

    fireEvent.click(trigger);
    expect(mockRequestConnectModal).toHaveBeenCalledTimes(1);
  });

  it('links connected users to the CST transfer page', async () => {
    renderWalletButton();

    const transferLink = await screen.findByText('wallet.account.transferCst');
    expect(transferLink.closest('a')).toHaveAttribute('href', '/transfer-cst');
  });

  it('lets connected MetaMask users add CST to their wallet', () => {
    renderWalletButton();

    fireEvent.click(screen.getByRole('button', { name: 'wallet.account.addCstToMetaMask' }));

    expect(mockAddCst).toHaveBeenCalledTimes(1);
  });

  it('links connected users to trade CST on Uniswap', async () => {
    renderWalletButton();

    const tradeLink = await screen.findByRole('link', {
      name: 'nav.ecosystem.uniswap.ariaLabel',
    });
    expect(tradeLink).toHaveAttribute('href', CST_UNISWAP_SWAP_URL);
    expect(tradeLink).toHaveAttribute('target', '_blank');
    expect(tradeLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('links connected users to the Axiom Zero marketplace', async () => {
    renderWalletButton();

    const marketplaceLink = await screen.findByRole('link', {
      name: 'nav.ecosystem.axiomZero.ariaLabel',
    });
    expect(marketplaceLink).toHaveAttribute('href', COSMIC_SIGNATURE_MARKETPLACE_URL);
    expect(marketplaceLink).toHaveAttribute('target', '_blank');
    expect(marketplaceLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(marketplaceLink).toHaveTextContent('nav.ecosystem.axiomZero.menuLabel');
  });

  it('links connected users to Chaos Zero predictions', async () => {
    renderWalletButton();

    const predictionsLink = await screen.findByRole('link', {
      name: 'nav.ecosystem.chaosZero.ariaLabel',
    });
    expect(predictionsLink).toHaveAttribute('href', CHAOS_ZERO_PREDICTIONS_URL);
    expect(predictionsLink).toHaveAttribute('target', '_blank');
    expect(predictionsLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(predictionsLink).toHaveTextContent('nav.ecosystem.chaosZero.menuLabel');
  });

  it('links connected users to the My NFTs page', async () => {
    renderWalletButton();

    const nftsLink = await screen.findByText('wallet.account.myNfts');
    expect(nftsLink.closest('a')).toHaveAttribute('href', '/my-tokens');
    expect(screen.queryByText('Transfer NFTs')).not.toBeInTheDocument();
    expect(document.querySelector('a[href="/transfer-cosmic-signature-nfts"]')).toBeNull();
  });

  it('does not expose the hidden marketing transfer URL in the wallet menu', async () => {
    renderWalletButton();

    await screen.findByText('wallet.account.transferCst');

    expect(screen.queryByText('CST Outreach Transfer')).not.toBeInTheDocument();
    expect(document.querySelector('a[href="/internal/cst-outreach-transfer"]')).toBeNull();
  });
});
