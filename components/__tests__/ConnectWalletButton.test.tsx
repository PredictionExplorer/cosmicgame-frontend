import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { render, screen, checkA11y, within } from '@/test-utils';

jest.mock('@rainbow-me/rainbowkit');
jest.mock('wagmi');

const mockUseActiveWeb3React = jest.fn();
jest.mock('../../hooks/web3', () => ({
  useActiveWeb3React: () => mockUseActiveWeb3React(),
}));

jest.mock('../../hooks/useMetaMaskWatchAsset', () => ({
  useMetaMaskWatchAsset: () => ({
    isMetaMaskConnected: false,
    isAddingCst: false,
    isAddingNft: false,
    addCst: jest.fn(),
    addCosmicSignatureNft: jest.fn(),
  }),
}));

// eslint-disable-next-line import/order -- the mocks above must load before the component
import ConnectWalletButton from '@/components/common/ConnectWalletButton';

const ACCOUNT = '0x1234567890abcdef1234567890abcdef12345678';
const defaultBalance = { ETH: 1.5, CosmicToken: 100, CosmicSignature: 3, RWLK: 2 };

function renderConnected(props: Partial<React.ComponentProps<typeof ConnectWalletButton>> = {}) {
  mockUseActiveWeb3React.mockReturnValue({ account: ACCOUNT, chainId: 421614, active: true });
  return render(
    <ConnectWalletButton
      presentation="menu"
      loading={false}
      balance={defaultBalance}
      stakedTokenCount={{ cst: 1, rwalk: 0 }}
      {...props}
    />,
  );
}

async function openMenu() {
  await userEvent.setup().click(screen.getByTestId('wallet-menu-trigger'));
  return screen.findByRole('menu');
}

beforeEach(() => {
  jest.clearAllMocks();
  mockUseActiveWeb3React.mockReturnValue({ account: null, chainId: 421614, active: false });
});

describe('ConnectWalletButton balances', () => {
  it('shows the short address on the pill', () => {
    renderConnected();
    expect(
      within(screen.getByTestId('wallet-menu-trigger')).getByText(/0x1234…⁠5678/),
    ).toBeInTheDocument();
  });

  it('lists balances and anchored NFTs as figures, units in the labels', async () => {
    renderConnected({
      balance: { ETH: 2.5, CosmicToken: 50, CosmicSignature: 5, RWLK: 3 },
      stakedTokenCount: { cst: 7, rwalk: 2 },
    });
    const menu = await openMenu();
    expect(within(menu).getByText('wallet.labels.balancesHeading')).toBeInTheDocument();
    const figure = (label: string) =>
      within(menu).getByText(label).closest('div')?.querySelector('dd')?.textContent;
    expect(figure('wallet.balances.eth')).toMatch(/^2\.5/);
    expect(figure('wallet.balances.cosmicNfts')).toBe('5');
    expect(figure('wallet.balances.anchoredCst')).toBe('7');
    expect(figure('wallet.balances.anchoredRwlk')).toBe('2');
  });

  it('shows a loading mark instead of figures while balances load', async () => {
    renderConnected({ loading: true });
    const menu = await openMenu();
    expect(
      within(menu).getByText('wallet.balances.eth').closest('div')?.querySelector('dd'),
    ).toHaveTextContent('…');
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <ConnectWalletButton
        loading={false}
        balance={defaultBalance}
        stakedTokenCount={{ cst: 1, rwalk: 0 }}
      />,
    );
    await checkA11y(container);
  });
});
