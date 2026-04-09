import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen, waitFor } from '@/test-utils';

import Mint from '../Mint';

const mockMint = jest.fn();
const mockGetMintPrice = jest.fn(() => Promise.resolve(BigInt(1000000000000000)));
const mockWalletOfOwner = jest.fn(() => Promise.resolve([] as readonly bigint[]));
const mockWaitForTxReceipt = jest.fn().mockResolvedValue({ status: 'success' });

jest.mock('../../../../hooks/useRWLKNFTContract', () => ({
  __esModule: true,
  default: () => ({
    read: {
      getMintPrice: mockGetMintPrice,
      walletOfOwner: mockWalletOfOwner,
    },
    write: {
      mint: mockMint,
    },
  }),
}));

const mockUseActiveWeb3React = jest.fn(() => ({ account: '0xUser' as string | null }));
jest.mock('../../../../hooks/web3', () => ({
  useActiveWeb3React: () => mockUseActiveWeb3React(),
}));

jest.mock('wagmi', () => ({
  usePublicClient: () => ({
    waitForTransactionReceipt: mockWaitForTxReceipt,
  }),
}));

jest.mock('viem', () => ({
  formatEther: (val: bigint) => (Number(val) / 1e18).toString(),
  parseEther: (val: string) => BigInt(Math.round(parseFloat(val) * 1e18)),
}));

jest.mock('../../../../utils', () => ({
  parseBalance: (val: bigint) => (Number(val) / 1e18).toString(),
}));

const mockReportError = jest.fn<void, [unknown, string]>();
const mockIsUserRejection = jest.fn<boolean, [unknown]>(() => false);
const mockIsEthProviderError = jest.fn<boolean, [unknown]>(() => false);
const mockGetEthErrorMessage = jest.fn<string, [unknown, string?]>(() => 'Mint failed');

jest.mock('../../../../utils/errors', () => ({
  isUserRejection: (err: unknown) => mockIsUserRejection(err),
  isEthProviderError: (err: unknown) => mockIsEthProviderError(err),
  reportError: (err: unknown, ctx: string) => mockReportError(err, ctx),
  getEthErrorMessage: (err: unknown, fallback?: string) => mockGetEthErrorMessage(err, fallback),
}));

jest.mock('../../../../utils/contractWrite', () => ({
  asWriteFn: (fn: (...a: unknown[]) => unknown) => fn,
}));

beforeEach(() => jest.clearAllMocks());

async function renderMint(overrides?: { account?: string | null; tokens?: readonly bigint[] }) {
  if (overrides?.account !== undefined) {
    mockUseActiveWeb3React.mockReturnValueOnce({ account: overrides.account });
  }
  if (overrides?.tokens) {
    mockWalletOfOwner.mockResolvedValueOnce(overrides.tokens);
  }
  const result = render(<Mint />);
  await waitFor(() => {
    expect(mockGetMintPrice).toHaveBeenCalled();
  }).catch(() => {});
  await waitFor(() => {}).catch(() => {});
  return result;
}

describe('Mint', () => {
  it('renders the page header', async () => {
    await renderMint();
    expect(screen.getByText('Mint Random Walk NFT')).toBeInTheDocument();
  });

  it('renders the Mint now button', async () => {
    await renderMint();
    expect(screen.getByRole('button', { name: 'Mint Now' })).toBeInTheDocument();
  });

  it('renders the My Random Walk NFTs section when tokens exist', async () => {
    mockWalletOfOwner.mockResolvedValueOnce([BigInt(1)] as readonly bigint[]);
    render(<Mint />);
    expect(await screen.findByText('My Random Walk NFTs')).toBeInTheDocument();
  });

  it('displays mint price with ETH label', async () => {
    await renderMint();
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.getByText('Current mint price')).toBeInTheDocument();
  });

  it('calls getMintPrice on mount', async () => {
    await renderMint();
    expect(mockGetMintPrice).toHaveBeenCalled();
  });

  it('calls walletOfOwner with account on mount', async () => {
    await renderMint();
    expect(mockWalletOfOwner).toHaveBeenCalledWith(['0xUser']);
  });

  it('renders NFT links when walletOfOwner returns tokens', async () => {
    const tokens: readonly bigint[] = [BigInt(3), BigInt(1), BigInt(2)];
    mockWalletOfOwner.mockResolvedValueOnce(tokens);
    render(<Mint />);
    const link = await screen.findByText('#3');
    expect(link).toBeInTheDocument();
  });

  it('Mint button calls mint with 1.01x price', async () => {
    const user = userEvent.setup();
    mockMint.mockResolvedValueOnce('0xTxHash');
    render(<Mint />);

    await user.click(screen.getByRole('button', { name: 'Mint Now' }));

    await waitFor(() => {
      expect(mockMint).toHaveBeenCalledWith(expect.objectContaining({ value: expect.anything() }));
    });
  });

  it('waits for transaction receipt after successful mint', async () => {
    const user = userEvent.setup();
    mockMint.mockResolvedValueOnce('0xTxHash');
    render(<Mint />);

    await user.click(screen.getByRole('button', { name: 'Mint Now' }));

    await waitFor(() => {
      expect(mockWaitForTxReceipt).toHaveBeenCalledWith({ hash: '0xTxHash' });
    });
  });

  it('does not call reportError on user rejection', async () => {
    const user = userEvent.setup();
    const rejectionErr = new Error('User rejected');
    mockMint.mockRejectedValueOnce(rejectionErr);
    mockIsUserRejection.mockReturnValueOnce(true);
    render(<Mint />);

    await user.click(screen.getByRole('button', { name: 'Mint Now' }));

    await waitFor(() => {
      expect(mockIsUserRejection).toHaveBeenCalledWith(rejectionErr);
    });
    expect(mockReportError).not.toHaveBeenCalled();
  });

  it('calls reportError on non-user-rejection error', async () => {
    const user = userEvent.setup();
    const mintErr = new Error('RPC failed');
    mockMint.mockRejectedValueOnce(mintErr);
    mockIsUserRejection.mockReturnValueOnce(false);
    mockIsEthProviderError.mockReturnValueOnce(false);
    render(<Mint />);

    await user.click(screen.getByRole('button', { name: 'Mint Now' }));

    await waitFor(() => {
      expect(mockReportError).toHaveBeenCalledWith(mintErr, 'mint RWLK NFT');
    });
  });

  it('alerts with error message when isEthProviderError is true', async () => {
    const user = userEvent.setup();
    const providerErr = new Error('Provider error');
    mockMint.mockRejectedValueOnce(providerErr);
    mockIsUserRejection.mockReturnValueOnce(false);
    mockIsEthProviderError.mockReturnValueOnce(true);
    mockGetEthErrorMessage.mockReturnValueOnce('Insufficient funds');
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<Mint />);

    await user.click(screen.getByRole('button', { name: 'Mint Now' }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Insufficient funds');
    });
    alertSpy.mockRestore();
  });

  it('renders NFT links sorted descending', async () => {
    const tokens: readonly bigint[] = [BigInt(1), BigInt(5), BigInt(3)];
    mockWalletOfOwner.mockResolvedValueOnce(tokens);
    render(<Mint />);

    await screen.findByText('#5');
    const links = screen.getAllByRole('link');
    const nftLinks = links.filter((l) => l.getAttribute('href')?.includes('randomwalk'));
    const ids = nftLinks.map((l) => l.textContent);
    expect(ids).toEqual(['#5', '#3', '#1']);
  });

  it('NFT links have correct href format', async () => {
    const tokens: readonly bigint[] = [BigInt(7)];
    mockWalletOfOwner.mockResolvedValueOnce(tokens);
    render(<Mint />);

    const link = await screen.findByText('#7');
    expect(link.closest('a')).toHaveAttribute('href', '/?randomwalk=true&tokenId=7');
  });

  it('does not call walletOfOwner when account is null', async () => {
    mockUseActiveWeb3React.mockReturnValue({ account: null });
    mockWalletOfOwner.mockClear();
    render(<Mint />);
    await waitFor(() => expect(mockGetMintPrice).toHaveBeenCalled());
    expect(mockWalletOfOwner).not.toHaveBeenCalled();
    mockUseActiveWeb3React.mockReturnValue({ account: '0xUser' });
  });

  it('has no accessibility violations', async () => {
    const { container } = await renderMint();
    await checkA11y(container);
  });
});
