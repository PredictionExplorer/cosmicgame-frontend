import { renderHook, act } from '@testing-library/react';
import { writeContract as wagmiWriteContract } from '@wagmi/core';

import { useGestureForm } from '../useGestureForm';
import useCosmicGameContract from '../../hooks/useCosmicGameContract';
import api from '../../services/api';

jest.mock('@wagmi/core', () => ({
  getConnectorClient: jest.fn().mockResolvedValue(undefined),
  writeContract: jest.fn().mockResolvedValue('0xhash'),
}));

const mockWagmiWriteContract = wagmiWriteContract as jest.MockedFunction<typeof wagmiWriteContract>;

/* ────────────────────────────────────────────────────────────────── */
/*  Notification                                                     */
/* ────────────────────────────────────────────────────────────────── */

const mockNotify = jest.fn();
const mockNotifyErrorFromEthers = jest.fn();

jest.mock('../../hooks/useNotify', () => ({
  useNotify: () => ({ notify: mockNotify, notifyErrorFromEthers: mockNotifyErrorFromEthers }),
}));

/* ────────────────────────────────────────────────────────────────── */
/*  Web3                                                             */
/* ────────────────────────────────────────────────────────────────── */

jest.mock('../../hooks/web3', () => ({
  useActiveWeb3React: jest.fn().mockReturnValue({ account: '0xUser', chainId: 1, active: true }),
}));

/* ────────────────────────────────────────────────────────────────── */
/*  Wagmi – extracted so individual tests can override behaviour     */
/* ────────────────────────────────────────────────────────────────── */

const mockWaitForTransactionReceipt = jest.fn().mockResolvedValue({});
const mockGetCode = jest.fn().mockResolvedValue('0x1234');
const mockGetBalance = jest.fn().mockResolvedValue(BigInt(10e18));
const mockReadContract = jest.fn().mockResolvedValue(true);
const mockEstimateContractGas = jest.fn().mockResolvedValue(BigInt(500_000));
const mockWriteContract = jest.fn().mockResolvedValue('0xhash');

jest.mock('wagmi', () => ({
  useConfig: jest.fn(() => ({})),
  useChainId: jest.fn(() => 421614),
  useSwitchChain: jest.fn(() => ({ switchChainAsync: jest.fn().mockResolvedValue(undefined) })),
  useConnectorClient: jest.fn(() => ({ data: undefined })),
  usePublicClient: jest.fn(() => ({
    waitForTransactionReceipt: mockWaitForTransactionReceipt,
    getCode: mockGetCode,
    getBalance: mockGetBalance,
    readContract: mockReadContract,
    estimateContractGas: mockEstimateContractGas,
  })),
  useWalletClient: jest.fn(() => ({
    data: {
      writeContract: mockWriteContract,
      account: { address: '0xUser' as `0x${string}` },
      /** Must match jest `activeChain.id` for `NEXT_PUBLIC_NETWORK` in jest.setup (sepolia → 421614). */
      getChainId: jest.fn().mockResolvedValue(421614),
    },
  })),
}));

/* ────────────────────────────────────────────────────────────────── */
/*  CosmicGame contract                                              */
/* ────────────────────────────────────────────────────────────────── */

const mockGestureWithEth = jest.fn().mockResolvedValue('0xhash');
const mockGestureWithCst = jest.fn().mockResolvedValue('0xhash');
const mockGestureWithEthAndContributeNft = jest.fn().mockResolvedValue('0xhash');
const mockGestureWithCstAndContributeNft = jest.fn().mockResolvedValue('0xhash');
const mockGestureWithEthAndContributeToken = jest.fn().mockResolvedValue('0xhash');
const mockGestureWithCstAndContributeToken = jest.fn().mockResolvedValue('0xhash');
const mockGetNextEthGestureCost = jest.fn().mockResolvedValue(BigInt(1e16));
const mockGetNextCstGestureCost = jest.fn().mockResolvedValue(BigInt(100));

const mockContractObj = {
  read: {
    getNextEthBidPrice: mockGetNextEthGestureCost,
    getNextCstBidPrice: mockGetNextCstGestureCost,
  },
  write: {
    bidWithEth: mockGestureWithEth,
    bidWithCst: mockGestureWithCst,
    bidWithEthAndDonateNft: mockGestureWithEthAndContributeNft,
    bidWithCstAndDonateNft: mockGestureWithCstAndContributeNft,
    bidWithEthAndDonateToken: mockGestureWithEthAndContributeToken,
    bidWithCstAndDonateToken: mockGestureWithCstAndContributeToken,
  },
};

jest.mock('../../hooks/useCosmicGameContract', () => ({
  __esModule: true,
  default: jest.fn(() => mockContractObj),
}));

/* ────────────────────────────────────────────────────────────────── */
/*  RWLK NFT contract                                                */
/* ────────────────────────────────────────────────────────────────── */

const mockRWLKContract = {
  read: {
    walletOfOwner: jest.fn().mockResolvedValue([BigInt(1), BigInt(2), BigInt(3)]),
  },
};

jest.mock('../../hooks/useRWLKNFTContract', () => ({
  __esModule: true,
  default: jest.fn(() => mockRWLKContract),
}));

/* ────────────────────────────────────────────────────────────────── */
/*  useApiQuery                                                      */
/* ────────────────────────────────────────────────────────────────── */

const mockUseCTPrice = jest.fn().mockReturnValue({
  data: {
    AuctionDuration: '3600',
    CSTPrice: '1000000000000000000',
    SecondsElapsed: '1800',
  },
});
const mockUseGestureEthCost = jest.fn().mockReturnValue({
  data: {
    AuctionDuration: '3600',
    ETHPrice: '10000000000000000',
    SecondsElapsed: '1800',
  },
});
const mockUseUsedRWLKNFTs = jest.fn().mockReturnValue({
  data: [{ RWalkTokenId: 2 }],
});

jest.mock('../../hooks/useApiQuery', () => ({
  useCTPrice: (...args: unknown[]) => mockUseCTPrice(...args),
  useGestureEthCost: (...args: unknown[]) => mockUseGestureEthCost(...args),
  useUsedRWLKNFTs: (...args: unknown[]) => mockUseUsedRWLKNFTs(...args),
}));

/* ────────────────────────────────────────────────────────────────── */
/*  API                                                              */
/* ────────────────────────────────────────────────────────────────── */

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    get_user_balance: jest.fn().mockResolvedValue({
      CosmicTokenBalance: '1000000000000000000000',
    }),
  },
}));

/* ────────────────────────────────────────────────────────────────── */
/*  viem                                                             */
/* ────────────────────────────────────────────────────────────────── */

jest.mock('viem', () => ({
  ...jest.requireActual('../../__mocks__/viem'),
  formatEther: jest.fn((v: bigint) => (Number(v) / 1e18).toString()),
  isAddress: jest.fn().mockReturnValue(true),
  parseEther: jest.fn((v: string) => BigInt(Math.round(Number(v) * 1e18))),
  parseUnits: jest.fn((v: string, d: number) => BigInt(Math.round(Number(v) * 10 ** d))),
  maxUint256: BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
}));

/* ────────────────────────────────────────────────────────────────── */
/*  Config & utilities                                               */
/* ────────────────────────────────────────────────────────────────── */

jest.mock('../../config/networks', () => ({
  networkConfig: {
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 421614,
    apiUrl: 'http://test-api.example/api/cosmicgame/',
    nftApiUrl: 'https://nfts-sepolia.cosmicsignature.com/',
  },
  COSMICGAME_ADDRESS: '0xCosmicGame',
  STELLAR_SELECTION_WALLET_ADDRESS: '0xRaffle',
}));

jest.mock('../../config/constants', () => ({
  ERC721_INTERFACE_ID: '0x80ac58cd',
  GESTURE_GAS_LIMIT: BigInt(30000000),
}));

jest.mock('../../contracts/abis', () => ({
  randomWalkNftAbi: [],
  cosmicTokenAbi: [],
  cosmicGameAbi: [],
}));

const mockIsUserRejection = jest.fn().mockReturnValue(false);
const mockReportError = jest.fn();
const mockGetContractErrorMessage = jest.fn().mockReturnValue(null);

jest.mock('../../utils/errors', () => ({
  isUserRejection: (...args: unknown[]) => mockIsUserRejection(...args),
  reportError: (...args: unknown[]) => mockReportError(...args),
}));

jest.mock('../../utils/contractErrors', () => ({
  getContractErrorMessage: (...args: unknown[]) => mockGetContractErrorMessage(...args),
}));

/* ────────────────────────────────────────────────────────────────── */
/*  Typed references for per-test overrides                          */
/* ────────────────────────────────────────────────────────────────── */

const mockUseCosmicGameContract = useCosmicGameContract as jest.Mock;
const mockApiGetUserBalance = api.get_user_balance as jest.Mock;

const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');

/* ────────────────────────────────────────────────────────────────── */
/*  Setup / Teardown                                                 */
/* ────────────────────────────────────────────────────────────────── */

beforeEach(() => {
  jest.clearAllMocks();
  mockWagmiWriteContract.mockResolvedValue('0xhash' as `0x${string}`);

  mockGestureWithEth.mockResolvedValue('0xhash');
  mockGestureWithCst.mockResolvedValue('0xhash');
  mockGestureWithEthAndContributeNft.mockResolvedValue('0xhash');
  mockGestureWithEthAndContributeToken.mockResolvedValue('0xhash');
  mockGestureWithCstAndContributeNft.mockResolvedValue('0xhash');
  mockGestureWithCstAndContributeToken.mockResolvedValue('0xhash');
  mockGetNextEthGestureCost.mockResolvedValue(BigInt(1e16));
  mockGetNextCstGestureCost.mockResolvedValue(BigInt(100));
  mockGetBalance.mockResolvedValue(BigInt(10e18));
  mockGetCode.mockResolvedValue('0x1234');
  mockReadContract.mockResolvedValue(true);
  mockWriteContract.mockResolvedValue('0xhash');
  mockWaitForTransactionReceipt.mockResolvedValue({});
  mockIsUserRejection.mockReturnValue(false);
  mockGetContractErrorMessage.mockReturnValue(null);
  mockEstimateContractGas.mockResolvedValue(BigInt(500_000));
  mockUseCosmicGameContract.mockReturnValue(mockContractObj);
  mockApiGetUserBalance.mockResolvedValue({
    CosmicTokenBalance: '1000000000000000000000',
  });

  mockRWLKContract.read.walletOfOwner.mockResolvedValue([BigInt(1), BigInt(2), BigInt(3)]);

  mockUseCTPrice.mockReturnValue({
    data: {
      AuctionDuration: '3600',
      CSTPrice: '1000000000000000000',
      SecondsElapsed: '1800',
    },
  });
  mockUseGestureEthCost.mockReturnValue({
    data: {
      AuctionDuration: '3600',
      ETHPrice: '10000000000000000',
      SecondsElapsed: '1800',
    },
  });
  mockUseUsedRWLKNFTs.mockReturnValue({
    data: [{ RWalkTokenId: 2 }],
  });

  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

/* ────────────────────────────────────────────────────────────────── */
/*  Tests                                                            */
/* ────────────────────────────────────────────────────────────────── */

describe('useGestureForm', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useGestureForm());

    expect(result.current.gestureType).toBe('ETH');
    expect(result.current.contributionType).toBe('NFT');
    expect(result.current.message).toBe('');
    expect(result.current.nftDonateAddress).toBe('');
    expect(result.current.nftId).toBe('');
    expect(result.current.tokenDonateAddress).toBe('');
    expect(result.current.tokenAmount).toBe('');
    expect(result.current.rwlkId).toBe(-1);
    expect(result.current.gestureCostPlus).toBe(2);
    expect(result.current.isGesturing).toBe(false);
    expect(result.current.advancedExpanded).toBe(false);
    expect(result.current.rwlknftIds).toEqual([]);
    expect(result.current.cstGestureData).toEqual({
      AuctionDuration: 3600,
      CSTPrice: 1,
      SecondsElapsed: 1800,
    });
    expect(result.current.ethGestureInfo).toEqual({
      AuctionDuration: 3600,
      ETHPrice: 0.01,
      SecondsElapsed: 1800,
    });
  });

  it('derives cstGestureData from useCTPrice query', () => {
    const { result } = renderHook(() => useGestureForm());

    expect(result.current.cstGestureData).toEqual({
      AuctionDuration: 3600,
      CSTPrice: 1,
      SecondsElapsed: 1800,
    });
  });

  it('derives ethGestureInfo from useGestureEthCost query', () => {
    const { result } = renderHook(() => useGestureForm());

    expect(result.current.ethGestureInfo).toEqual({
      AuctionDuration: 3600,
      ETHPrice: 0.01,
      SecondsElapsed: 1800,
    });
  });

  it('returns empty cstGestureData when useCTPrice returns no data', () => {
    mockUseCTPrice.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useGestureForm());

    expect(result.current.cstGestureData).toEqual({
      AuctionDuration: 0,
      CSTPrice: 0,
      SecondsElapsed: 0,
    });
  });

  it('returns null ethGestureInfo when useGestureEthCost returns no data', () => {
    mockUseGestureEthCost.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useGestureForm());

    expect(result.current.ethGestureInfo).toBeNull();
  });

  it('filters RWLK NFTs using useUsedRWLKNFTs data', async () => {
    const { result } = renderHook(() => useGestureForm());

    // The useEffect runs asynchronously using usedRWLKData from the query hook
    await act(async () => {});

    // Wallet owns [1,2,3]; token 2 is already used → available [1,3] reversed → [3,1]
    expect(result.current.rwlknftIds).toEqual([3, 1]);
  });

  it('onGesture succeeds with ETH gesture and returns true', async () => {
    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});

    let success!: boolean;
    await act(async () => {
      success = await result.current.onGesture();
    });

    expect(success).toBe(true);
    expect(mockWagmiWriteContract).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ functionName: 'bidWithEth' }),
    );
    expect(mockWaitForTransactionReceipt).toHaveBeenCalled();
    expect(result.current.isGesturing).toBe(false);
  });

  it('onGesture succeeds with NFT contribution', async () => {
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'ownerOf') return '0xUser';
      return true;
    });

    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});

    act(() => {
      result.current.setNftDonateAddress('0xNftContract');
      result.current.setNftId('42');
    });

    let success!: boolean;
    await act(async () => {
      success = await result.current.onGesture();
    });

    expect(success).toBe(true);
    expect(mockWagmiWriteContract).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ functionName: 'bidWithEthAndDonateNft' }),
    );
    expect(result.current.nftDonateAddress).toBe('');
    expect(result.current.nftId).toBe('');
  });

  it('onGesture succeeds with token contribution', async () => {
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'decimals') return 18;
      if (functionName === 'balanceOf') return BigInt(1000e18);
      if (functionName === 'allowance') return MAX_UINT256;
      return true;
    });

    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});

    act(() => {
      result.current.setContributionType('Token');
      result.current.setTokenDonateAddress('0xTokenContract');
      result.current.setTokenAmount('10');
    });

    let success!: boolean;
    await act(async () => {
      success = await result.current.onGesture();
    });

    expect(success).toBe(true);
    expect(mockWagmiWriteContract).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ functionName: 'bidWithEthAndDonateToken' }),
    );
    expect(result.current.tokenDonateAddress).toBe('');
    expect(result.current.tokenAmount).toBe('');
  });

  it('onGestureWithCST succeeds and returns true', async () => {
    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});

    expect(result.current.cstGestureData.CSTPrice).toBe(1);

    let success!: boolean;
    await act(async () => {
      success = await result.current.onGestureWithCST();
    });

    expect(success).toBe(true);
    expect(mockWagmiWriteContract).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ functionName: 'bidWithCst' }),
    );
    expect(mockApiGetUserBalance).toHaveBeenCalled();
    expect(result.current.isGesturing).toBe(false);
  });

  it('onGestureWithCST handles free gesture when window closed', async () => {
    mockUseCTPrice.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});

    expect(result.current.cstGestureData.CSTPrice).toBe(0);

    let success!: boolean;
    await act(async () => {
      success = await result.current.onGestureWithCST();
    });

    expect(success).toBe(true);
    expect(mockWagmiWriteContract).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ functionName: 'bidWithCst' }),
    );
    expect(mockApiGetUserBalance).not.toHaveBeenCalled();
  });

  it('onGesture notifies on insufficient ETH balance', async () => {
    mockGetBalance.mockResolvedValue(BigInt(0));

    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});

    let success!: boolean;
    await act(async () => {
      success = await result.current.onGesture();
    });

    expect(success).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith('error', expect.stringContaining('Insufficient ETH'));
    expect(mockWagmiWriteContract).not.toHaveBeenCalled();
  });

  it('onGestureWithCST notifies on insufficient CST balance', async () => {
    mockApiGetUserBalance.mockResolvedValue({ CosmicTokenBalance: '0' });

    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});

    expect(result.current.cstGestureData.CSTPrice).toBe(1);

    let success!: boolean;
    await act(async () => {
      success = await result.current.onGestureWithCST();
    });

    expect(success).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith('error', expect.stringContaining('Insufficient CST'));
    expect(mockGestureWithCst).not.toHaveBeenCalled();
  });

  it('onGesture notifies when no contract available', async () => {
    mockUseCosmicGameContract.mockReturnValue(null);

    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});

    let success!: boolean;
    await act(async () => {
      success = await result.current.onGesture();
    });

    expect(success).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith(
      'error',
      expect.stringContaining('connect your wallet'),
    );
  });

  it('onGesture silently ignores user rejection', async () => {
    const rejectionError = { code: 4001, message: 'User rejected' };
    mockWagmiWriteContract.mockRejectedValueOnce(rejectionError);
    mockIsUserRejection.mockReturnValue(true);

    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});

    let success!: boolean;
    await act(async () => {
      success = await result.current.onGesture();
    });

    expect(success).toBe(false);
    expect(mockNotifyErrorFromEthers).not.toHaveBeenCalled();
    expect(result.current.isGesturing).toBe(false);
  });

  it('sets isGesturing to true during gesture and false after', async () => {
    let resolvePrice!: (v: bigint) => void;
    mockGetNextEthGestureCost.mockImplementation(
      () =>
        new Promise<bigint>((r) => {
          resolvePrice = r;
        }),
    );

    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});

    expect(result.current.isGesturing).toBe(false);

    let gesturePromise!: Promise<boolean>;
    await act(async () => {
      gesturePromise = result.current.onGesture();
    });

    expect(result.current.isGesturing).toBe(true);

    await act(async () => {
      resolvePrice(BigInt(1e16));
      await gesturePromise;
    });

    expect(result.current.isGesturing).toBe(false);
  });

  /* ────────────────────────────────────────────────────────────────
   *  Error-boundary + blockchain-interaction edge cases
   * ──────────────────────────────────────────────────────────────── */

  it('onGesture without connected account notifies error', async () => {
    const useWeb3 = jest.requireMock('../../hooks/web3');
    useWeb3.useActiveWeb3React.mockReturnValueOnce({ account: null, chainId: 1, active: false });

    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.onGesture();
    });

    expect(ok).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith('error', 'Please connect your wallet.');
    expect(mockWagmiWriteContract).not.toHaveBeenCalled();
    // Restore
    useWeb3.useActiveWeb3React.mockReturnValue({ account: '0xUser', chainId: 1, active: true });
  });

  it('onGesture reports error with context "gesture-eth" and falls back to notifyErrorFromEthers', async () => {
    const rpcErr = new Error('rpc timeout');
    mockWagmiWriteContract.mockRejectedValueOnce(rpcErr);
    mockGetContractErrorMessage.mockReturnValue(null);
    mockIsUserRejection.mockReturnValue(false);

    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});

    await act(async () => {
      await result.current.onGesture();
    });

    expect(mockReportError).toHaveBeenCalledWith(rpcErr, 'gesture-eth');
    expect(mockNotifyErrorFromEthers).toHaveBeenCalledWith(rpcErr);
  });

  it('onGesture decodes contract error via getContractErrorMessage when revert hits', async () => {
    const revertErr = new Error('execution reverted');
    mockWagmiWriteContract.mockRejectedValueOnce(revertErr);
    mockGetContractErrorMessage.mockReturnValueOnce(
      'The current Gesture Cost is greater than the amount you transferred.',
    );
    mockIsUserRejection.mockReturnValue(false);

    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.onGesture();
    });

    expect(ok).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith(
      'error',
      'The current Gesture Cost is greater than the amount you transferred.',
    );
    expect(mockNotifyErrorFromEthers).not.toHaveBeenCalled();
    // Restore
    mockGetContractErrorMessage.mockReturnValue(null);
  });

  it('onGestureWithCST reports error with context "gesture-cst"', async () => {
    const cstErr = new Error('cst revert');
    mockWagmiWriteContract.mockRejectedValueOnce(cstErr);
    mockGetContractErrorMessage.mockReturnValue(null);
    mockIsUserRejection.mockReturnValue(false);

    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});

    await act(async () => {
      await result.current.onGestureWithCST();
    });

    expect(mockReportError).toHaveBeenCalledWith(cstErr, 'gesture-cst');
  });

  it('onGesture awaits transaction receipt after writeContract returns a hash', async () => {
    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});

    await act(async () => {
      await result.current.onGesture();
    });

    expect(mockWaitForTransactionReceipt).toHaveBeenCalledWith({ hash: '0xhash' });
  });

  it('onGesture aborts if ensureNftOwnership reports wrong owner', async () => {
    mockReadContract.mockImplementation(async (args: { functionName: string }) => {
      if (args.functionName === 'supportsInterface') return true;
      if (args.functionName === 'ownerOf') return '0xOtherOwner';
      return true;
    });

    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});
    act(() => {
      result.current.setContributionType('NFT');
      result.current.setNftDonateAddress('0xNft');
      result.current.setNftId('1');
    });

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.onGesture();
    });

    expect(ok).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith('error', "You aren't the owner of the token!");
    mockReadContract.mockResolvedValue(true);
  });

  it('onGesture with non-ERC721 attached NFT aborts with error', async () => {
    mockReadContract.mockImplementation(async (args: { functionName: string }) => {
      if (args.functionName === 'supportsInterface') return false;
      return true;
    });

    const { result } = renderHook(() => useGestureForm());
    await act(async () => {});
    act(() => {
      result.current.setContributionType('NFT');
      result.current.setNftDonateAddress('0xNft');
      result.current.setNftId('1');
    });

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.onGesture();
    });

    expect(ok).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith(
      'error',
      'The attached NFT contract is not an ERC721 token contract.',
    );
    mockReadContract.mockResolvedValue(true);
  });
});
