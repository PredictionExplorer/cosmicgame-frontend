import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';

import { render, screen } from '@/test-utils';

import ConnectWalletButton from '../ConnectWalletButton';

const ACCOUNT = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

let mockAccount: string | null = ACCOUNT;

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({
    account: mockAccount,
  }),
}));

jest.mock('@rainbow-me/rainbowkit', () => ({
  ConnectButton: () => <button type="button">Connect Wallet</button>,
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

function renderWalletButton() {
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
    />,
  );
}

describe('ConnectWalletButton', () => {
  beforeEach(() => {
    mockAccount = ACCOUNT;
  });

  it('renders the RainbowKit connect button when disconnected', () => {
    mockAccount = null;

    renderWalletButton();

    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
  });

  it('links connected users to the CST transfer page', async () => {
    renderWalletButton();

    const transferLink = await screen.findByText('Transfer CST');
    expect(transferLink.closest('a')).toHaveAttribute('href', '/transfer-cst');
  });

  it('links connected users to trade CST on Uniswap', async () => {
    renderWalletButton();

    const tradeLink = await screen.findByRole('link', { name: 'Trade CST on Uniswap' });
    expect(tradeLink).toHaveAttribute('href', CST_UNISWAP_SWAP_URL);
    expect(tradeLink).toHaveAttribute('target', '_blank');
    expect(tradeLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('links connected users to the Axiom Zero marketplace', async () => {
    renderWalletButton();

    const marketplaceLink = await screen.findByRole('link', {
      name: 'Axiom Zero NFT marketplace',
    });
    expect(marketplaceLink).toHaveAttribute('href', COSMIC_SIGNATURE_MARKETPLACE_URL);
    expect(marketplaceLink).toHaveAttribute('target', '_blank');
    expect(marketplaceLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(marketplaceLink).toHaveTextContent('Axiom Zero Marketplace');
  });

  it('links connected users to Chaos Zero predictions', async () => {
    renderWalletButton();

    const predictionsLink = await screen.findByRole('link', {
      name: 'Make predictions on Chaos Zero',
    });
    expect(predictionsLink).toHaveAttribute('href', CHAOS_ZERO_PREDICTIONS_URL);
    expect(predictionsLink).toHaveAttribute('target', '_blank');
    expect(predictionsLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(predictionsLink).toHaveTextContent('Chaos Zero Predictions');
  });

  it('links connected users to the My NFTs page', async () => {
    renderWalletButton();

    const nftsLink = await screen.findByText('My NFTs');
    expect(nftsLink.closest('a')).toHaveAttribute('href', '/my-tokens');
    expect(screen.queryByText('Transfer NFTs')).not.toBeInTheDocument();
    expect(document.querySelector('a[href="/transfer-cosmic-signature-nfts"]')).toBeNull();
  });

  it('does not expose the hidden marketing transfer URL in the wallet menu', async () => {
    renderWalletButton();

    await screen.findByText('Transfer CST');

    expect(screen.queryByText('CST Outreach Transfer')).not.toBeInTheDocument();
    expect(document.querySelector('a[href="/internal/cst-outreach-transfer"]')).toBeNull();
  });
});
