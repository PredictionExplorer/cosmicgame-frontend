import { act, renderHook } from '@testing-library/react';

const CST_ADDRESS = '0x1111111111111111111111111111111111111111';
const NFT_ADDRESS = '0x2222222222222222222222222222222222222222';

const mockNotify = jest.fn();
const mockEnsureCorrectChain = jest.fn<Promise<boolean>, []>();
const mockUseAccount = jest.fn();
const mockUseContractAddresses = jest.fn();
const mockReportError = jest.fn();

jest.mock('viem');

jest.mock('../useNotify', () => ({
  useNotify: () => ({ notify: mockNotify, notifyErrorFromEthers: jest.fn() }),
}));

jest.mock('../useRequireChain', () => ({
  useRequireChain: () => ({ ensureCorrectChain: mockEnsureCorrectChain }),
}));

jest.mock('../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => mockUseContractAddresses(),
}));

jest.mock('wagmi', () => ({
  useAccount: () => mockUseAccount(),
}));

jest.mock('../../utils/errors', () => ({
  isUserRejection: (error: unknown) =>
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 4001,
  reportError: (...args: unknown[]) => mockReportError(...args),
}));

import { isMetaMaskConnector, useMetaMaskWatchAsset } from '../useMetaMaskWatchAsset';

const mockRequest = jest.fn<Promise<unknown>, [unknown]>();
const mockGetProvider = jest.fn<Promise<unknown>, []>();
const metaMaskConnector = {
  id: 'io.metamask',
  name: 'MetaMask',
  getProvider: mockGetProvider,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockRequest.mockResolvedValue(true);
  mockGetProvider.mockResolvedValue({ request: mockRequest });
  mockEnsureCorrectChain.mockResolvedValue(true);
  mockUseAccount.mockReturnValue({
    isConnected: true,
    connector: metaMaskConnector,
  });
  mockUseContractAddresses.mockReturnValue({
    cosmicToken: CST_ADDRESS,
    cosmicSignature: NFT_ADDRESS,
  });
});

describe('isMetaMaskConnector', () => {
  it.each([
    [{ id: 'metaMask' }, true],
    [{ id: 'io.metamask' }, true],
    [{ name: 'MetaMask' }, true],
    [{ id: 'walletConnect', name: 'WalletConnect' }, false],
    [null, false],
  ])('identifies MetaMask connector metadata', (connector, expected) => {
    expect(isMetaMaskConnector(connector)).toBe(expected);
  });
});

describe('useMetaMaskWatchAsset', () => {
  it('requests CST with its runtime address and display metadata', async () => {
    const { result } = renderHook(() => useMetaMaskWatchAsset());

    let added = false;
    await act(async () => {
      added = await result.current.addCst();
    });

    expect(added).toBe(true);
    expect(mockEnsureCorrectChain).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenCalledWith({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20',
        options: {
          address: CST_ADDRESS,
          symbol: 'CST',
          decimals: 18,
          image: 'http://localhost/images/logo2.svg',
        },
      },
    });
    expect(mockNotify).toHaveBeenCalledWith('success', 'toasts.watchAsset.cstAdded');
  });

  it('requests one owned Cosmic Signature token as an ERC-721 asset', async () => {
    const { result } = renderHook(() => useMetaMaskWatchAsset());

    await act(async () => {
      await result.current.addCosmicSignatureNft(42);
    });

    expect(mockRequest).toHaveBeenCalledWith({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC721',
        options: {
          address: NFT_ADDRESS,
          tokenId: '42',
        },
      },
    });
    expect(mockNotify).toHaveBeenCalledWith('success', 'toasts.watchAsset.nftAdded');
  });

  it('switches to the app chain before requesting the asset', async () => {
    const { result } = renderHook(() => useMetaMaskWatchAsset());

    await act(async () => {
      await result.current.addCst();
    });

    expect(mockEnsureCorrectChain.mock.invocationCallOrder[0]).toBeLessThan(
      mockGetProvider.mock.invocationCallOrder[0] ?? Number.MAX_SAFE_INTEGER,
    );
  });

  it('stops when the wallet cannot switch to the app chain', async () => {
    mockEnsureCorrectChain.mockResolvedValue(false);
    const { result } = renderHook(() => useMetaMaskWatchAsset());

    await act(async () => {
      await result.current.addCst();
    });

    expect(mockGetProvider).not.toHaveBeenCalled();
    expect(mockRequest).not.toHaveBeenCalled();
  });

  it('rejects a missing CST contract address before opening MetaMask', async () => {
    mockUseContractAddresses.mockReturnValue({
      cosmicToken: '',
      cosmicSignature: NFT_ADDRESS,
    });
    const { result } = renderHook(() => useMetaMaskWatchAsset());

    await act(async () => {
      await result.current.addCst();
    });

    expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.watchAsset.cstUnavailable');
    expect(mockEnsureCorrectChain).not.toHaveBeenCalled();
  });

  it('rejects a missing NFT contract address before opening MetaMask', async () => {
    mockUseContractAddresses.mockReturnValue({
      cosmicToken: CST_ADDRESS,
      cosmicSignature: '',
    });
    const { result } = renderHook(() => useMetaMaskWatchAsset());

    await act(async () => {
      await result.current.addCosmicSignatureNft(7);
    });

    expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.watchAsset.nftUnavailable');
    expect(mockEnsureCorrectChain).not.toHaveBeenCalled();
  });

  it('requires the current connection to be MetaMask', async () => {
    mockUseAccount.mockReturnValue({
      isConnected: true,
      connector: {
        id: 'walletConnect',
        name: 'WalletConnect',
        getProvider: mockGetProvider,
      },
    });
    const { result } = renderHook(() => useMetaMaskWatchAsset());

    expect(result.current.isMetaMaskConnected).toBe(false);
    await act(async () => {
      await result.current.addCst();
    });

    expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.watchAsset.metaMaskRequired');
    expect(mockEnsureCorrectChain).not.toHaveBeenCalled();
  });

  it('reports a false response as an asset that was not added', async () => {
    mockRequest.mockResolvedValue(false);
    const { result } = renderHook(() => useMetaMaskWatchAsset());

    let added = true;
    await act(async () => {
      added = await result.current.addCst();
    });

    expect(added).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith('info', 'toasts.watchAsset.notAdded');
  });

  it('treats a rejected MetaMask prompt as informational', async () => {
    mockRequest.mockRejectedValue({ code: 4001, message: 'User rejected' });
    const { result } = renderHook(() => useMetaMaskWatchAsset());

    await act(async () => {
      await result.current.addCst();
    });

    expect(mockNotify).toHaveBeenCalledWith('info', 'toasts.watchAsset.cancelled');
    expect(mockReportError).not.toHaveBeenCalled();
  });

  it('reports unexpected CST failures with localized feedback', async () => {
    const error = new Error('method failed');
    mockRequest.mockRejectedValue(error);
    const { result } = renderHook(() => useMetaMaskWatchAsset());

    await act(async () => {
      await result.current.addCst();
    });

    expect(mockReportError).toHaveBeenCalledWith(error, 'MetaMask wallet_watchAsset cst');
    expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.watchAsset.cstFailed');
  });

  it('uses extension-specific feedback when NFT import fails', async () => {
    mockRequest.mockRejectedValue(new Error('unsupported method'));
    const { result } = renderHook(() => useMetaMaskWatchAsset());

    await act(async () => {
      await result.current.addCosmicSignatureNft(9);
    });

    expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.watchAsset.nftFailed');
  });

  it('prevents duplicate prompts while one request is pending', async () => {
    let resolveRequest: ((value: unknown) => void) | undefined;
    mockRequest.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const { result } = renderHook(() => useMetaMaskWatchAsset());

    let firstRequest: Promise<boolean>;
    await act(async () => {
      firstRequest = result.current.addCst();
      await Promise.resolve();
    });
    expect(result.current.isAddingCst).toBe(true);

    let duplicateResult = true;
    await act(async () => {
      duplicateResult = await result.current.addCst();
    });
    expect(duplicateResult).toBe(false);
    expect(mockRequest).toHaveBeenCalledTimes(1);

    resolveRequest?.(true);
    await act(async () => {
      await firstRequest!;
    });
    expect(result.current.isAddingCst).toBe(false);
  });
});
