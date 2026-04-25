import '@testing-library/jest-dom';
import { render, screen, checkA11y } from '@/test-utils';

jest.mock('@rainbow-me/rainbowkit');
jest.mock('wagmi');
jest.mock('viem');

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    return <img {...props} />;
  },
}));

jest.mock('../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: null, chainId: 421614, active: false }),
}));

jest.mock('../../contexts/ApiDataContext', () => ({
  useApiData: () => ({
    apiData: {
      ETHRaffleToClaim: 0,
      ETHRaffleToClaimWei: 0,
      NumDonatedNFTToClaim: 0,
      UnretrievedAnchorDistribution: 0,
      releasableActionIds: [],
    },
    setApiData: jest.fn(),
    fetchData: jest.fn(),
    unclaimedRewards: [],
  }),
}));

jest.mock('../../contexts/AnchoredTokenContext', () => ({
  useAnchoredToken: () => ({ cstokens: [], rwlktokens: [], fetchData: jest.fn() }),
}));

jest.mock('../../contexts/SystemModeContext', () => ({
  useSystemMode: () => ({ data: 0, fetchData: jest.fn() }),
}));

jest.mock('../../hooks/useRWLKNFTContract', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    get_user_balance: jest.fn(),
    get_user_info: jest.fn(),
  },
}));

// eslint-disable-next-line import/order
import Header from '@/components/layout/Header';

beforeEach(() => {
  jest.clearAllMocks();
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1200 });
});

describe('Header', () => {
  it('renders the logo', () => {
    render(<Header />);
    const logo = screen.getByAltText('Cosmic Signature');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/images/logo2.svg');
  });

  it('renders navigation links with lexicon-safe labels', () => {
    render(<Header />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Gallery')).toBeInTheDocument();
    expect(screen.getByText('Explore')).toBeInTheDocument();
    expect(screen.getByText('Help')).toBeInTheDocument();
  });

  it('renders the cross-host link to the protocol site', () => {
    render(<Header />);
    const link = screen.getByText(/protocol site/i);
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', 'https://cosmicsignature.com');
  });

  it('does not render a maintenance banner when systemMode is 0', () => {
    render(<Header />);
    expect(screen.queryByText(/MAINTENANCE/)).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(<Header />);
    await checkA11y(container);
  });
});
