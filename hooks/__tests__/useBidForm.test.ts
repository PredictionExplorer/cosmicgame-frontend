import { renderHook, act } from '@testing-library/react';
import { writeContract as wagmiWriteContract } from '@wagmi/core';

const mockWagmiWriteContract = wagmiWriteContract as jest.Mock;

import { useBidForm } from '../useBidForm';
import useCosmicGameContract from '../../hooks/useCosmicGameContract';
import api from '../../services/api';

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
  usePublicClient: jest.fn(() => ({
    waitForTransactionReceipt: mockWaitForTransactionReceipt,
    getCode: mockGetCode,
    getBalance: mockGetBalance,
    readContract: mockReadContract,
    estimateContractGas: mockEstimateContractGas,
  })),
  useWalletClient: jest.fn(() => ({
    data: { writeContract: mockWriteContract },
  })),
  useConnectorClient: jest.fn(() => ({ data: undefined })),
  useConfig: jest.fn(() => ({})),
  useChainId: jest.fn(() => 1),
  useSwitchChain: jest.fn(() => ({ switchChainAsync: jest.fn() })),
}));

jest.mock('@wagmi/core', () => ({
  getConnectorClient: jest.fn(),
  writeContract: jest.fn().mockResolvedValue('0xhash'),
}));

/* ────────────────────────────────────────────────────────────────── */
/*  CosmicGame contract                                              */
/* ────────────────────────────────────────────────────────────────── */

const mockBidWithEth = jest.fn().mockResolvedValue('0xhash');
const mockBidWithCst = jest.fn().mockResolvedValue('0xhash');
const mockBidWithEthAndDonateNft = jest.fn().mockResolvedValue('0xhash');
const mockBidWithCstAndDonateNft = jest.fn().mockResolvedValue('0xhash');
const mockBidWithEthAndDonateToken = jest.fn().mockResolvedValue('0xhash');
const mockBidWithCstAndDonateToken = jest.fn().mockResolvedValue('0xhash');
const mockGetNextEthBidPrice = jest.fn().mockResolvedValue(BigInt(1e16));
const mockGetNextCstBidPrice = jest.fn().mockResolvedValue(BigInt(100));

const mockContractObj = {
  read: {
    getNextEthBidPrice: mockGetNextEthBidPrice,
    getNextCstBidPrice: mockGetNextCstBidPrice,
  },
  write: {
    bidWithEth: mockBidWithEth,
    bidWithCst: mockBidWithCst,
    bidWithEthAndDonateNft: mockBidWithEthAndDonateNft,
    bidWithCstAndDonateNft: mockBidWithCstAndDonateNft,
    bidWithEthAndDonateToken: mockBidWithEthAndDonateToken,
    bidWithCstAndDonateToken: mockBidWithCstAndDonateToken,
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
const mockUseBidEthPrice = jest.fn().mockReturnValue({
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
  useBidEthPrice: (...args: unknown[]) => mockUseBidEthPrice(...args),
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
  ...jest.requireActual('../../__mocks__/viem.js'),
  formatEther: jest.fn((v: bigint) => (Number(v) / 1e18).toString()),
  isAddress: jest.fn().mockReturnValue(true),
  parseEther: jest.fn((v: string) => BigInt(Math.round(Number(v) * 1e18))),
  parseUnits: jest.fn((v: string, d: number) => BigInt(Math.round(Number(v) * 10 ** d))),
  maxUint256: BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'),
}));

/* ────────────────────────────────────────────────────────────────── */
/*  Config & utilities                                               */
/* ────────────────────────────────────────────────────────────────── */

jest.mock('../../config/chains', () => ({
  activeChain: { id: 1, name: 'mainnet' },
}));

jest.mock('../../config/wagmi', () => ({
  wagmiConfig: {},
}));

jest.mock('../../config/networks', () => ({
  COSMICGAME_ADDRESS: '0xCosmicGame',
  RAFFLE_WALLET_ADDRESS: '0xRaffle',
}));

jest.mock('../../config/constants', () => ({
  ERC721_INTERFACE_ID: '0x80ac58cd',
  BID_GAS_LIMIT: BigInt(30000000),
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

  mockBidWithEth.mockResolvedValue('0xhash');
  mockBidWithCst.mockResolvedValue('0xhash');
  mockBidWithEthAndDonateNft.mockResolvedValue('0xhash');
  mockBidWithEthAndDonateToken.mockResolvedValue('0xhash');
  mockBidWithCstAndDonateNft.mockResolvedValue('0xhash');
  mockBidWithCstAndDonateToken.mockResolvedValue('0xhash');
  mockGetNextEthBidPrice.mockResolvedValue(BigInt(1e16));
  mockGetNextCstBidPrice.mockResolvedValue(BigInt(100));
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
  mockUseBidEthPrice.mockReturnValue({
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

describe('useBidForm', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useBidForm());

    expect(result.current.bidType).toBe('ETH');
    expect(result.current.donationType).toBe('NFT');
    expect(result.current.message).toBe('');
    expect(result.current.nftDonateAddress).toBe('');
    expect(result.current.nftId).toBe('');
    expect(result.current.tokenDonateAddress).toBe('');
    expect(result.current.tokenAmount).toBe('');
    expect(result.current.rwlkId).toBe(-1);
    expect(result.current.bidPricePlus).toBe(2);
    expect(result.current.isBidding).toBe(false);
    expect(result.current.advancedExpanded).toBe(false);
    expect(result.current.rwlknftIds).toEqual([]);
    expect(result.current.cstBidData).toEqual({
      AuctionDuration: 3600,
      CSTPrice: 1,
      SecondsElapsed: 1800,
    });
    expect(result.current.ethBidInfo).toEqual({
      AuctionDuration: 3600,
      ETHPrice: 0.01,
      SecondsElapsed: 1800,
    });
  });

  it('derives cstBidData from useCTPrice query', () => {
    const { result } = renderHook(() => useBidForm());

    expect(result.current.cstBidData).toEqual({
      AuctionDuration: 3600,
      CSTPrice: 1,
      SecondsElapsed: 1800,
    });
  });

  it('derives ethBidInfo from useBidEthPrice query', () => {
    const { result } = renderHook(() => useBidForm());

    expect(result.current.ethBidInfo).toEqual({
      AuctionDuration: 3600,
      ETHPrice: 0.01,
      SecondsElapsed: 1800,
    });
  });

  it('returns empty cstBidData when useCTPrice returns no data', () => {
    mockUseCTPrice.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useBidForm());

    expect(result.current.cstBidData).toEqual({
      AuctionDuration: 0,
      CSTPrice: 0,
      SecondsElapsed: 0,
    });
  });

  it('returns null ethBidInfo when useBidEthPrice returns no data', () => {
    mockUseBidEthPrice.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useBidForm());

    expect(result.current.ethBidInfo).toBeNull();
  });

  it('filters RWLK NFTs using useUsedRWLKNFTs data', async () => {
    const { result } = renderHook(() => useBidForm());

    // The useEffect runs asynchronously using usedRWLKData from the query hook
    await act(async () => {});

    // Wallet owns [1,2,3]; token 2 is already used → available [1,3] reversed → [3,1]
    expect(result.current.rwlknftIds).toEqual([3, 1]);
  });

  it('onBid succeeds with ETH bid and returns true', async () => {
    const { result } = renderHook(() => useBidForm());
    await act(async () => {});

    let success!: boolean;
    await act(async () => {
      success = await result.current.onBid();
    });

    expect(success).toBe(true);
    expect(mockWagmiWriteContract).toHaveBeenCalled();
    expect(mockWaitForTransactionReceipt).toHaveBeenCalled();
    expect(result.current.isBidding).toBe(false);
  });

  it('onBid succeeds with NFT donation', async () => {
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'ownerOf') return '0xUser';
      return true;
    });

    const { result } = renderHook(() => useBidForm());
    await act(async () => {});

    act(() => {
      result.current.setNftDonateAddress('0xNftContract');
      result.current.setNftId('42');
    });

    let success!: boolean;
    await act(async () => {
      success = await result.current.onBid();
    });

    expect(success).toBe(true);
    expect(mockWagmiWriteContract).toHaveBeenCalled();
    expect(result.current.nftDonateAddress).toBe('');
    expect(result.current.nftId).toBe('');
  });

  it('onBid succeeds with token donation', async () => {
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'decimals') return 18;
      if (functionName === 'balanceOf') return BigInt(1000e18);
      if (functionName === 'allowance') return MAX_UINT256;
      return true;
    });

    const { result } = renderHook(() => useBidForm());
    await act(async () => {});

    act(() => {
      result.current.setDonationType('Token');
      result.current.setTokenDonateAddress('0xTokenContract');
      result.current.setTokenAmount('10');
    });

    let success!: boolean;
    await act(async () => {
      success = await result.current.onBid();
    });

    expect(success).toBe(true);
    expect(mockWagmiWriteContract).toHaveBeenCalled();
    expect(result.current.tokenDonateAddress).toBe('');
    expect(result.current.tokenAmount).toBe('');
  });

  it('onBidWithCST succeeds and returns true', async () => {
    const { result } = renderHook(() => useBidForm());
    await act(async () => {});

    expect(result.current.cstBidData.CSTPrice).toBe(1);

    let success!: boolean;
    await act(async () => {
      success = await result.current.onBidWithCST();
    });

    expect(success).toBe(true);
    expect(mockWagmiWriteContract).toHaveBeenCalled();
    expect(mockApiGetUserBalance).toHaveBeenCalled();
    expect(result.current.isBidding).toBe(false);
  });

  it('onBidWithCST handles free bid when auction ended', async () => {
    mockUseCTPrice.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useBidForm());
    await act(async () => {});

    expect(result.current.cstBidData.CSTPrice).toBe(0);

    let success!: boolean;
    await act(async () => {
      success = await result.current.onBidWithCST();
    });

    expect(success).toBe(true);
    expect(mockWagmiWriteContract).toHaveBeenCalled();
    expect(mockApiGetUserBalance).not.toHaveBeenCalled();
  });

  it('onBid notifies on insufficient ETH balance', async () => {
    mockGetBalance.mockResolvedValue(BigInt(0));

    const { result } = renderHook(() => useBidForm());
    await act(async () => {});

    let success!: boolean;
    await act(async () => {
      success = await result.current.onBid();
    });

    expect(success).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith('error', expect.stringContaining('Insufficient ETH'));
    expect(mockWagmiWriteContract).not.toHaveBeenCalled();
  });

  it('onBidWithCST notifies on insufficient CST balance', async () => {
    mockApiGetUserBalance.mockResolvedValue({ CosmicTokenBalance: '0' });

    const { result } = renderHook(() => useBidForm());
    await act(async () => {});

    expect(result.current.cstBidData.CSTPrice).toBe(1);

    let success!: boolean;
    await act(async () => {
      success = await result.current.onBidWithCST();
    });

    expect(success).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith('error', expect.stringContaining('Insufficient CST'));
    expect(mockWagmiWriteContract).not.toHaveBeenCalled();
  });

  it('onBid notifies when no contract available', async () => {
    mockUseCosmicGameContract.mockReturnValue(null);

    const { result } = renderHook(() => useBidForm());
    await act(async () => {});

    let success!: boolean;
    await act(async () => {
      success = await result.current.onBid();
    });

    expect(success).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith(
      'error',
      expect.stringContaining('connect your wallet'),
    );
  });

  it('onBid silently ignores user rejection', async () => {
    const rejectionError = { code: 4001, message: 'User rejected' };
    mockWagmiWriteContract.mockRejectedValue(rejectionError);
    mockIsUserRejection.mockReturnValue(true);

    const { result } = renderHook(() => useBidForm());
    await act(async () => {});

    let success!: boolean;
    await act(async () => {
      success = await result.current.onBid();
    });

    expect(success).toBe(false);
    expect(mockNotifyErrorFromEthers).not.toHaveBeenCalled();
    expect(result.current.isBidding).toBe(false);
  });

  it('sets isBidding to true during bid and false after', async () => {
    let resolvePrice!: (v: bigint) => void;
    mockGetNextEthBidPrice.mockImplementation(
      () =>
        new Promise<bigint>((r) => {
          resolvePrice = r;
        }),
    );

    const { result } = renderHook(() => useBidForm());
    await act(async () => {});

    expect(result.current.isBidding).toBe(false);

    let bidPromise!: Promise<boolean>;
    await act(async () => {
      bidPromise = result.current.onBid();
    });

    expect(result.current.isBidding).toBe(true);

    await act(async () => {
      resolvePrice(BigInt(1e16));
      await bidPromise;
    });

    expect(result.current.isBidding).toBe(false);
  });
});
