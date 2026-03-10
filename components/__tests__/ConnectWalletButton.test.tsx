import '@testing-library/jest-dom';
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
});
