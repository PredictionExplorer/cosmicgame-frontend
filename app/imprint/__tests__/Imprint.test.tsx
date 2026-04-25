import userEvent from '@testing-library/user-event';

import { checkA11y, render, screen, waitFor } from '@/test-utils';

import Imprint from '../Imprint';

const mockImprint = jest.fn();
const mockGetImprintCost = jest.fn(() => Promise.resolve(BigInt(1000000000000000)));
const mockWalletOfOwner = jest.fn(() => Promise.resolve([] as readonly bigint[]));
const mockWaitForTxReceipt = jest.fn().mockResolvedValue({ status: 'success' });

jest.mock('../../../hooks/useRWLKNFTContract', () => ({
  __esModule: true,
  default: () => ({
    read: {
      getMintPrice: mockGetImprintCost,
      walletOfOwner: mockWalletOfOwner,
    },
    write: {
      mint: mockImprint,
    },
  }),
}));

const mockUseActiveWeb3React = jest.fn(() => ({ account: '0xUser' as string | null }));
jest.mock('../../../hooks/web3', () => ({
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

jest.mock('../../../utils', () => ({
  parseBalance: (val: bigint) => (Number(val) / 1e18).toString(),
}));

const mockReportError = jest.fn<void, [unknown, string]>();
const mockIsUserRejection = jest.fn<boolean, [unknown]>(() => false);
const mockIsEthProviderError = jest.fn<boolean, [unknown]>(() => false);
const mockGetEthErrorMessage = jest.fn<string, [unknown, string?]>(() => 'Imprint failed');

jest.mock('../../../utils/errors', () => ({
  isUserRejection: (err: unknown) => mockIsUserRejection(err),
  isEthProviderError: (err: unknown) => mockIsEthProviderError(err),
  reportError: (err: unknown, ctx: string) => mockReportError(err, ctx),
  getEthErrorMessage: (err: unknown, fallback?: string) => mockGetEthErrorMessage(err, fallback),
}));

jest.mock('../../../utils/contractWrite', () => ({
  asWriteFn: (fn: (...a: unknown[]) => unknown) => fn,
}));

beforeEach(() => jest.clearAllMocks());

async function renderImprint(overrides?: { account?: string | null; tokens?: readonly bigint[] }) {
  if (overrides?.account !== undefined) {
    mockUseActiveWeb3React.mockReturnValueOnce({ account: overrides.account });
  }
  if (overrides?.tokens) {
    mockWalletOfOwner.mockResolvedValueOnce(overrides.tokens);
  }
  const result = render(<Imprint />);
  await waitFor(() => {
    expect(mockGetImprintCost).toHaveBeenCalled();
  }).catch(() => {});
  await waitFor(() => {}).catch(() => {});
  return result;
}

describe('Mint', () => {
  it('renders the page header', async () => {
    await renderImprint();
    expect(screen.getByText('Imprint Random Walk NFT')).toBeInTheDocument();
  });

  it('renders the Mint now button', async () => {
    await renderImprint();
    expect(screen.getByRole('button', { name: 'Imprint Now' })).toBeInTheDocument();
  });

  it('renders the My Random Walk NFTs section when tokens exist', async () => {
    mockWalletOfOwner.mockResolvedValueOnce([BigInt(1)] as readonly bigint[]);
    render(<Imprint />);
    expect(await screen.findByText('My Random Walk NFTs')).toBeInTheDocument();
  });

  it('displays mint price with ETH label', async () => {
    await renderImprint();
    expect(screen.getByText('ETH')).toBeInTheDocument();
    expect(screen.getByText('Current imprint cost')).toBeInTheDocument();
  });

  it('calls getMintPrice on mount', async () => {
    await renderImprint();
    expect(mockGetImprintCost).toHaveBeenCalled();
  });

  it('calls walletOfOwner with account on mount', async () => {
    await renderImprint();
    expect(mockWalletOfOwner).toHaveBeenCalledWith(['0xUser']);
  });

  it('renders NFT links when walletOfOwner returns tokens', async () => {
    const tokens: readonly bigint[] = [BigInt(3), BigInt(1), BigInt(2)];
    mockWalletOfOwner.mockResolvedValueOnce(tokens);
    render(<Imprint />);
    const link = await screen.findByText('#3');
    expect(link).toBeInTheDocument();
  });

  it('Mint button calls mint with 1.01x price', async () => {
    const user = userEvent.setup();
    mockImprint.mockResolvedValueOnce('0xTxHash');
    render(<Imprint />);

    await user.click(screen.getByRole('button', { name: 'Imprint Now' }));

    await waitFor(() => {
      expect(mockImprint).toHaveBeenCalledWith(
        expect.objectContaining({ value: expect.anything() }),
      );
    });
  });

  it('waits for transaction receipt after successful mint', async () => {
    const user = userEvent.setup();
    mockImprint.mockResolvedValueOnce('0xTxHash');
    render(<Imprint />);

    await user.click(screen.getByRole('button', { name: 'Imprint Now' }));

    await waitFor(() => {
      expect(mockWaitForTxReceipt).toHaveBeenCalledWith({ hash: '0xTxHash' });
    });
  });

  it('does not call reportError on user rejection', async () => {
    const user = userEvent.setup();
    const rejectionErr = new Error('User rejected');
    mockImprint.mockRejectedValueOnce(rejectionErr);
    mockIsUserRejection.mockReturnValueOnce(true);
    render(<Imprint />);

    await user.click(screen.getByRole('button', { name: 'Imprint Now' }));

    await waitFor(() => {
      expect(mockIsUserRejection).toHaveBeenCalledWith(rejectionErr);
    });
    expect(mockReportError).not.toHaveBeenCalled();
  });

  it('calls reportError on non-user-rejection error', async () => {
    const user = userEvent.setup();
    const imprintErr = new Error('RPC failed');
    mockImprint.mockRejectedValueOnce(imprintErr);
    mockIsUserRejection.mockReturnValueOnce(false);
    mockIsEthProviderError.mockReturnValueOnce(false);
    render(<Imprint />);

    await user.click(screen.getByRole('button', { name: 'Imprint Now' }));

    await waitFor(() => {
      expect(mockReportError).toHaveBeenCalledWith(imprintErr, 'imprint RWLK NFT');
    });
  });

  it('alerts with error message when isEthProviderError is true', async () => {
    const user = userEvent.setup();
    const providerErr = new Error('Provider error');
    mockImprint.mockRejectedValueOnce(providerErr);
    mockIsUserRejection.mockReturnValueOnce(false);
    mockIsEthProviderError.mockReturnValueOnce(true);
    mockGetEthErrorMessage.mockReturnValueOnce('Insufficient funds');
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<Imprint />);

    await user.click(screen.getByRole('button', { name: 'Imprint Now' }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Insufficient funds');
    });
    alertSpy.mockRestore();
  });

  it('renders NFT links sorted descending', async () => {
    const tokens: readonly bigint[] = [BigInt(1), BigInt(5), BigInt(3)];
    mockWalletOfOwner.mockResolvedValueOnce(tokens);
    render(<Imprint />);

    await screen.findByText('#5');
    const links = screen.getAllByRole('link');
    const nftLinks = links.filter((l) => l.getAttribute('href')?.includes('randomwalk'));
    const ids = nftLinks.map((l) => l.textContent);
    expect(ids).toEqual(['#5', '#3', '#1']);
  });

  it('NFT links have correct href format', async () => {
    const tokens: readonly bigint[] = [BigInt(7)];
    mockWalletOfOwner.mockResolvedValueOnce(tokens);
    render(<Imprint />);

    const link = await screen.findByText('#7');
    expect(link.closest('a')).toHaveAttribute('href', '/?randomwalk=true&tokenId=7');
  });

  it('does not call walletOfOwner when account is null', async () => {
    mockUseActiveWeb3React.mockReturnValue({ account: null });
    mockWalletOfOwner.mockClear();
    render(<Imprint />);
    await waitFor(() => expect(mockGetImprintCost).toHaveBeenCalled());
    expect(mockWalletOfOwner).not.toHaveBeenCalled();
    mockUseActiveWeb3React.mockReturnValue({ account: '0xUser' });
  });

  it('has no accessibility violations', async () => {
    const { container } = await renderImprint();
    await checkA11y(container);
  });
});
