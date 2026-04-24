import { act, checkA11y, render, screen } from '@/test-utils';

import MintArtBlocks from '../MintArtBlocks';

const mockCurTokenId = jest.fn(() => Promise.resolve(BigInt(100)));

jest.mock('../../../hooks/useArtBlocksContract', () => ({
  __esModule: true,
  default: () => ({
    read: {
      curTokenId: mockCurTokenId,
    },
    write: {
      multimint: jest.fn(),
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

jest.mock('../../../utils/errors', () => ({
  isUserRejection: () => false,
  isEthProviderError: () => false,
  reportError: jest.fn(),
  getEthErrorMessage: jest.fn(),
}));

beforeEach(() => jest.clearAllMocks());

describe('MintArtBlocks', () => {
  it('renders the "GET AN ART BLOCKS NFT FOR" text', async () => {
    await act(async () => {
      render(<MintArtBlocks />);
    });
    expect(screen.getByText('GET AN')).toBeInTheDocument();
    expect(screen.getByText('ART BLOCKS')).toBeInTheDocument();
    expect(screen.getByText('NFT FOR')).toBeInTheDocument();
  });

  it('renders the Mint now button', async () => {
    await act(async () => {
      render(<MintArtBlocks />);
    });
    expect(screen.getByRole('button', { name: 'Imprint now' })).toBeInTheDocument();
  });

  it('renders "Current Token ID" label', async () => {
    await act(async () => {
      render(<MintArtBlocks />);
    });
    expect(screen.getByText(/Current Token ID/)).toBeInTheDocument();
  });

  it('calls curTokenId on mount', async () => {
    await act(async () => {
      render(<MintArtBlocks />);
    });
    expect(mockCurTokenId).toHaveBeenCalled();
  });

  it('displays the current token ID from contract', async () => {
    render(<MintArtBlocks />);
    const tokenIdEl = await screen.findByText('100');
    expect(tokenIdEl).toBeInTheDocument();
  });

  it('renders the count selector', async () => {
    await act(async () => {
      render(<MintArtBlocks />);
    });
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('Mint button is not disabled by default', async () => {
    await act(async () => {
      render(<MintArtBlocks />);
    });
    expect(screen.getByRole('button', { name: 'Imprint now' })).not.toBeDisabled();
  });

  it('has no accessibility violations', async () => {
    let container: HTMLElement;
    await act(async () => {
      const result = render(<MintArtBlocks />);
      container = result.container;
    });
    await checkA11y(container!);
  });
});
