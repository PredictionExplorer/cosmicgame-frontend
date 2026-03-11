import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';

import { render, screen } from '@/test-utils';

jest.mock('@rainbow-me/rainbowkit');
jest.mock('wagmi');

const mockUseActiveWeb3React = jest.fn();
jest.mock('../../hooks/web3', () => ({
  useActiveWeb3React: () => mockUseActiveWeb3React(),
}));

// eslint-disable-next-line import/order
import ConnectWalletButton from '@/components/common/ConnectWalletButton';

const defaultBalance = { ETH: 1.5, CosmicToken: 100, CosmicSignature: 3, RWLK: 2 };
const defaultStaked = { cst: 1, rwalk: 0 };

beforeEach(() => {
  jest.clearAllMocks();
  mockUseActiveWeb3React.mockReturnValue({ account: null, chainId: 421614, active: false });
});

describe('ConnectWalletButton', () => {
  it('renders the RainbowKit ConnectButton when wallet is not connected', () => {
    const { container } = render(
      <ConnectWalletButton
        isMobileView={false}
        loading={false}
        balance={defaultBalance}
        stakedTokenCount={defaultStaked}
      />,
    );
    expect(container).toBeInTheDocument();
  });

  it('renders the shortened wallet address when connected (desktop)', () => {
    mockUseActiveWeb3React.mockReturnValue({
      account: '0x1234567890abcdef1234567890abcdef12345678',
      chainId: 421614,
      active: true,
    });

    render(
      <ConnectWalletButton
        isMobileView={false}
        loading={false}
        balance={defaultBalance}
        stakedTokenCount={defaultStaked}
      />,
    );

    expect(screen.getByText(/0x1234\.{4}5678/)).toBeInTheDocument();
  });

  it('renders the shortened wallet address in mobile view when connected', () => {
    mockUseActiveWeb3React.mockReturnValue({
      account: '0x1234567890abcdef1234567890abcdef12345678',
      chainId: 421614,
      active: true,
    });

    render(
      <ConnectWalletButton
        isMobileView={true}
        loading={false}
        balance={defaultBalance}
        stakedTokenCount={defaultStaked}
      />,
    );

    expect(screen.getByText(/0x1234\.{4}5678/)).toBeInTheDocument();
  });

  it('renders dropdown trigger with address when connected (desktop)', () => {
    mockUseActiveWeb3React.mockReturnValue({
      account: '0x1234567890abcdef1234567890abcdef12345678',
      chainId: 421614,
      active: true,
    });

    render(
      <ConnectWalletButton
        isMobileView={false}
        loading={false}
        balance={defaultBalance}
        stakedTokenCount={defaultStaked}
      />,
    );

    const trigger = screen.getByText(/0x1234\.{4}5678/);
    expect(trigger).toBeInTheDocument();
  });

  it('shows balance after opening dropdown', async () => {
    const user = userEvent.setup();
    mockUseActiveWeb3React.mockReturnValue({
      account: '0x1234567890abcdef1234567890abcdef12345678',
      chainId: 421614,
      active: true,
    });

    render(
      <ConnectWalletButton
        isMobileView={false}
        loading={false}
        balance={{ ETH: 2.5, CosmicToken: 50, CosmicSignature: 5, RWLK: 3 }}
        stakedTokenCount={defaultStaked}
      />,
    );

    await user.click(screen.getByText(/0x1234\.{4}5678/));

    expect(screen.getByText('BALANCE:')).toBeInTheDocument();
    expect(screen.getByText('2.50')).toBeInTheDocument();
  });

  it('shows "Loading..." in dropdown when loading is true', async () => {
    const user = userEvent.setup();
    mockUseActiveWeb3React.mockReturnValue({
      account: '0x1234567890abcdef1234567890abcdef12345678',
      chainId: 421614,
      active: true,
    });

    render(
      <ConnectWalletButton
        isMobileView={false}
        loading={true}
        balance={defaultBalance}
        stakedTokenCount={defaultStaked}
      />,
    );

    await user.click(screen.getByText(/0x1234\.{4}5678/));

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows staked token counts in dropdown', async () => {
    const user = userEvent.setup();
    mockUseActiveWeb3React.mockReturnValue({
      account: '0x1234567890abcdef1234567890abcdef12345678',
      chainId: 421614,
      active: true,
    });

    render(
      <ConnectWalletButton
        isMobileView={false}
        loading={false}
        balance={defaultBalance}
        stakedTokenCount={{ cst: 7, rwalk: 2 }}
      />,
    );

    await user.click(screen.getByText(/0x1234\.{4}5678/));

    expect(screen.getByText('STAKED CST NFT:')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders nav links with correct hrefs in dropdown', async () => {
    const user = userEvent.setup();
    mockUseActiveWeb3React.mockReturnValue({
      account: '0x1234567890abcdef1234567890abcdef12345678',
      chainId: 421614,
      active: true,
    });

    render(
      <ConnectWalletButton
        isMobileView={false}
        loading={false}
        balance={defaultBalance}
        stakedTokenCount={defaultStaked}
      />,
    );

    await user.click(screen.getByText(/0x1234\.{4}5678/));

    expect(screen.getByText('MY STATISTICS')).toBeInTheDocument();
    expect(screen.getByText('MY TOKENS')).toBeInTheDocument();

    const statLink = screen.getByText('MY STATISTICS').closest('a');
    expect(statLink).toHaveAttribute('href', '/my-statistics');
  });
});
