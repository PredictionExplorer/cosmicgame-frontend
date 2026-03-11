import { render, screen } from '@/test-utils';

import Mint from '../Mint';

const mockGetMintPrice = jest.fn(() => Promise.resolve(BigInt(1000000000000000)));
const mockWalletOfOwner = jest.fn(() => Promise.resolve([] as readonly bigint[]));

jest.mock('../../../hooks/useRWLKNFTContract', () => ({
  __esModule: true,
  default: () => ({
    read: {
      getMintPrice: mockGetMintPrice,
      walletOfOwner: mockWalletOfOwner,
    },
    write: {
      mint: jest.fn(),
    },
  }),
}));

jest.mock('../../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: '0xUser' }),
}));

jest.mock('wagmi', () => ({
  usePublicClient: () => ({
    waitForTransactionReceipt: jest.fn(),
  }),
}));

jest.mock('viem', () => ({
  formatEther: (val: bigint) => (Number(val) / 1e18).toString(),
  parseEther: (val: string) => BigInt(Math.round(parseFloat(val) * 1e18)),
}));

jest.mock('../../../utils', () => ({
  parseBalance: (val: bigint) => (Number(val) / 1e18).toString(),
}));

jest.mock('../../../utils/errors', () => ({
  isUserRejection: () => false,
  isEthProviderError: () => false,
  reportError: jest.fn(),
  getEthErrorMessage: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe('Mint', () => {
  it('renders the "GET A RANDOM WALK NFT FOR" text', () => {
    render(<Mint />);
    expect(screen.getByText('GET A')).toBeInTheDocument();
    expect(screen.getByText('RANDOM WALK')).toBeInTheDocument();
    expect(screen.getByText('NFT FOR')).toBeInTheDocument();
  });

  it('renders the Mint now button', () => {
    render(<Mint />);
    expect(screen.getByRole('button', { name: 'Mint now' })).toBeInTheDocument();
  });

  it('renders the MY RANDOM WALK NFTS section', () => {
    render(<Mint />);
    expect(screen.getByText('MY')).toBeInTheDocument();
    expect(screen.getByText('RANDOM')).toBeInTheDocument();
    expect(screen.getByText('WALK')).toBeInTheDocument();
    expect(screen.getByText('NFTS')).toBeInTheDocument();
  });

  it('displays mint price with ETH symbol', async () => {
    render(<Mint />);
    const priceEl = await screen.findByText(/Ξ/);
    expect(priceEl).toBeInTheDocument();
  });

  it('calls getMintPrice on mount', () => {
    render(<Mint />);
    expect(mockGetMintPrice).toHaveBeenCalled();
  });

  it('calls walletOfOwner with account on mount', () => {
    render(<Mint />);
    expect(mockWalletOfOwner).toHaveBeenCalledWith(['0xUser']);
  });

  it('renders NFT links when walletOfOwner returns tokens', async () => {
    const tokens: readonly bigint[] = [BigInt(3), BigInt(1), BigInt(2)];
    mockWalletOfOwner.mockResolvedValueOnce(tokens);
    render(<Mint />);
    const link = await screen.findByText('3');
    expect(link).toBeInTheDocument();
  });
});
