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

  it('links connected users to the Cosmic Signature NFT transfer page', async () => {
    renderWalletButton();

    const transferLink = await screen.findByText('Transfer NFTs');
    expect(transferLink.closest('a')).toHaveAttribute('href', '/transfer-cosmic-signature-nfts');
  });

  it('does not expose the hidden marketing transfer URL in the wallet menu', async () => {
    renderWalletButton();

    await screen.findByText('Transfer CST');

    expect(screen.queryByText('CST Outreach Transfer')).not.toBeInTheDocument();
    expect(document.querySelector('a[href="/internal/cst-outreach-transfer"]')).toBeNull();
  });
});
