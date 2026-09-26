import { renderHook, act, waitFor } from '@testing-library/react';

import { useGestureForm } from '../useGestureForm';
import useCosmicGameContract from '../../hooks/useCosmicGameContract';
import { resetUxScenarioForTest } from '../../lib/uxCycleScenarios';
import { createFakeTxFlow } from '../../test-utils/txFlow';
import { ERC20_TRANSFER_TOPIC } from '../../lib/receiptTransfers';

// The chain guard, receipt wait and lifecycle toast belong to useTxFlow (see
// useTxFlow.test.ts); the fake runs the gesture's callbacks in the same order.
const mockTx = createFakeTxFlow('0xUser' as `0x${string}`);
jest.mock('../useTxFlow', () => ({ useTxFlow: () => mockTx.flow }));

jest.mock('@wagmi/core', () => ({
  getConnectorClient: jest.fn().mockResolvedValue(undefined),
  writeContract: jest.fn().mockResolvedValue('0xhash'),
}));

interface LiveCstPreviewTestGlobals {
  __COSMIC_ENABLE_LIVE_CST_PREVIEW_TEST_TIMERS__?: boolean;
  __COSMIC_LIVE_CST_PREVIEW_TEST_INTERVAL_MS__?: number;
}

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

const mockWaitForTransactionReceipt = jest.fn().mockResolvedValue({ status: 'success' });
const mockGetCode = jest.fn().mockResolvedValue('0x1234');
const mockGetBalance = jest.fn().mockResolvedValue(BigInt(10e18));
const mockReadContract = jest.fn().mockResolvedValue(true);
const mockEstimateContractGas = jest.fn().mockResolvedValue(BigInt(500_000));
const mockWriteContract = jest.fn().mockResolvedValue('0xhash');
const mockSwitchChainAsync = jest.fn().mockResolvedValue(undefined);
const mockWalletGetChainId = jest.fn().mockResolvedValue(421614);
const mockGetSignerChainId = jest.fn().mockResolvedValue(421614);

jest.mock('wagmi', () => ({
  useConfig: jest.fn(() => ({})),
  useChainId: jest.fn(() => 421614),
  useConnection: jest.fn(() => ({ address: '0xUser', isConnected: true, chainId: 421614 })),
  useSwitchChain: jest.fn(() => ({ mutateAsync: mockSwitchChainAsync })),
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
      getChainId: mockWalletGetChainId,
    },
  })),
}));

jest.mock('viem/actions', () => ({
  getChainId: (...args: unknown[]) => mockGetSignerChainId(...args),
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
const mockGetNextCstGestureCost = jest.fn().mockResolvedValue(BigInt('1000000000000000000'));
const mockGetGestureCstRewardAmount = jest.fn().mockResolvedValue(BigInt('100000000000000000000'));
const mockGetGestureCstRewardAmountAdvanced = jest
  .fn()
  .mockResolvedValue(BigInt('100000000000000000000'));

const mockContractObj = {
  read: {
    getNextEthBidPrice: mockGetNextEthGestureCost,
    getNextCstBidPrice: mockGetNextCstGestureCost,
    getBidCstRewardAmount: mockGetGestureCstRewardAmount,
    getBidCstRewardAmountAdvanced: mockGetGestureCstRewardAmountAdvanced,
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

jest.mock('../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => ({
    randomWalkNft: '0x0',
    cosmicGame: '0xCosmicGame',
    cosmicSignature: '0x0',
    cosmicToken: '0x0',
    cosmicDao: '0x0',
    charity: '0x0',
    prizesWallet: '0xRaffle',
    stakingCst: '0x0',
    stakingRwalk: '0x0',
    marketing: '0x0',
    implementation: '0x0',
  }),
}));

jest.mock('../../config/networks', () => ({
  networkConfig: {
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 421614,
    chainName: 'Arbitrum Sepolia',
    explorerUrl: 'https://sepolia.arbiscan.io',
    apiUrl: 'http://test-api.example/api/cosmicgame/',
    nftApiUrl: 'https://nfts-sepolia.cosmicsignature.com/',
  },
}));

jest.mock('../../config/constants', () => ({
  ERC721_INTERFACE_ID: '0x80ac58cd',
}));

jest.mock('../../contracts/abis', () => ({
  randomWalkNftAbi: [],
  cosmicTokenAbi: [],
  cosmicGameAbi: [],
}));

const mockReportError = jest.fn();
const mockGetContractErrorDescriptor = jest.fn().mockReturnValue(null);

jest.mock('../../utils/errors', () => ({
  ...jest.requireActual('../../utils/errors'),
  reportError: (...args: unknown[]) => mockReportError(...args),
}));

jest.mock('../../utils/contractErrors', () => ({
  getContractErrorDescriptor: (...args: unknown[]) => mockGetContractErrorDescriptor(...args),
}));

/* ────────────────────────────────────────────────────────────────── */
/*  Typed references for per-test overrides                          */
/* ────────────────────────────────────────────────────────────────── */

const mockUseCosmicGameContract = useCosmicGameContract as jest.Mock;

const MAX_UINT256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
/** The wallet's CST, read on-chain (`balanceOf`), never from the lagging indexer. */
const CST_BALANCE = BigInt('1000000000000000000000');

/* ────────────────────────────────────────────────────────────────── */
/*  Setup / Teardown                                                 */
/* ────────────────────────────────────────────────────────────────── */

beforeEach(() => {
  jest.clearAllMocks();
  mockTx.reset();
  mockTx.receipt = { ...mockTx.receipt, logs: [] };
  process.env.NEXT_PUBLIC_UX_SCENARIO = '';
  const liveCstGlobals = globalThis as LiveCstPreviewTestGlobals;
  liveCstGlobals.__COSMIC_ENABLE_LIVE_CST_PREVIEW_TEST_TIMERS__ = false;
  liveCstGlobals.__COSMIC_LIVE_CST_PREVIEW_TEST_INTERVAL_MS__ = undefined;
  window.history.pushState({}, '', '/');
  resetUxScenarioForTest();
  mockTx.writeContract.mockResolvedValue('0xhash' as `0x${string}`);

  mockGestureWithEth.mockResolvedValue('0xhash');
  mockGestureWithCst.mockResolvedValue('0xhash');
  mockGestureWithEthAndContributeNft.mockResolvedValue('0xhash');
  mockGestureWithEthAndContributeToken.mockResolvedValue('0xhash');
  mockGestureWithCstAndContributeNft.mockResolvedValue('0xhash');
  mockGestureWithCstAndContributeToken.mockResolvedValue('0xhash');
  mockGetNextEthGestureCost.mockResolvedValue(BigInt(1e16));
  mockGetNextCstGestureCost.mockResolvedValue(BigInt('1000000000000000000'));
  mockGetGestureCstRewardAmount.mockResolvedValue(BigInt('100000000000000000000'));
  mockGetGestureCstRewardAmountAdvanced.mockResolvedValue(BigInt('100000000000000000000'));
  mockGetBalance.mockResolvedValue(BigInt(10e18));
  mockGetCode.mockResolvedValue('0x1234');
  mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
    if (functionName === 'allowance') return MAX_UINT256;
    if (functionName === 'balanceOf') return CST_BALANCE;
    return true;
  });
  mockWriteContract.mockResolvedValue('0xhash');
  mockSwitchChainAsync.mockResolvedValue(undefined);
  mockWalletGetChainId.mockResolvedValue(421614);
  mockGetSignerChainId.mockResolvedValue(421614);
  mockWaitForTransactionReceipt.mockResolvedValue({ status: 'success' });
  mockGetContractErrorDescriptor.mockReturnValue(null);
  mockEstimateContractGas.mockResolvedValue(BigInt(500_000));
  mockUseCosmicGameContract.mockReturnValue(mockContractObj);

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
  resetUxScenarioForTest();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const flushAsyncWork = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

/* ────────────────────────────────────────────────────────────────── */
/*  Tests                                                            */
/* ────────────────────────────────────────────────────────────────── */

describe('useGestureForm', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useGestureForm());

    expect(result.current.gestureType).toBe('ETH');
    // No attachment until one is picked (the Advanced panel shows no empty NFT fields).
    expect(result.current.contributionType).toBe('');
    expect(result.current.gestureTxStage).toEqual({ status: 'idle' });
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
    expect(result.current.cstGestureData).toMatchObject({
      AuctionDuration: 3600,
      CSTPrice: 1,
      SecondsElapsed: 1800,
      CSTPriceWei: BigInt('1000000000000000000'),
      isFree: false,
      source: 'api',
    });
    expect(result.current.ethGestureInfo).toEqual({
      AuctionDuration: 3600,
      ETHPrice: 0.01,
      // The exact wei the funding check compares against the wallet balance.
      ETHPriceWei: BigInt('10000000000000000'),
      SecondsElapsed: 1800,
    });
  });

  it('derives cstGestureData from useCTPrice query', () => {
    const { result } = renderHook(() => useGestureForm());

    expect(result.current.cstGestureData).toMatchObject({
      AuctionDuration: 3600,
      CSTPrice: 1,
      SecondsElapsed: 1800,
      isFree: false,
    });
  });

  it('derives ethGestureInfo from useGestureEthCost query', () => {
    const { result } = renderHook(() => useGestureForm());

    expect(result.current.ethGestureInfo).toEqual({
      AuctionDuration: 3600,
      ETHPrice: 0.01,
      // The exact wei the funding check compares against the wallet balance.
      ETHPriceWei: BigInt('10000000000000000'),
      SecondsElapsed: 1800,
    });
  });

  it('returns empty cstGestureData when useCTPrice returns no data', () => {
    mockUseCTPrice.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useGestureForm());

    expect(result.current.cstGestureData).toMatchObject({
      AuctionDuration: 0,
      CSTPrice: 0,
      SecondsElapsed: 0,
      CSTPriceWei: 0n,
      isFree: false,
      source: 'empty',
    });
  });

  it('derives dynamic CST duration from contract read when available', async () => {
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'getCstDutchAuctionDurations') return [43200n, 1200n];
      return true;
    });

    const { result } = renderHook(() => useGestureForm());
    await waitFor(() => expect(result.current.cstGestureData.source).toBe('contract'));

    expect(result.current.cstGestureData).toMatchObject({
      AuctionDuration: 43200,
      SecondsElapsed: 1200,
      CSTPrice: 1,
      CSTPriceWei: BigInt('1000000000000000000'),
      source: 'contract',
      apiAuctionDuration: 3600,
      apiSecondsElapsed: 1800,
    });
  });

  it('uses live contract CST price when it differs from the API fallback', async () => {
    mockGetNextCstGestureCost.mockResolvedValue(BigInt('2500000000000000000'));
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'getCstDutchAuctionDurations') return [5400n, 2700n];
      return true;
    });

    const { result } = renderHook(() => useGestureForm());
    await waitFor(() => expect(result.current.cstGestureData.CSTPrice).toBe(2.5));

    expect(result.current.cstGestureData).toMatchObject({
      AuctionDuration: 5400,
      SecondsElapsed: 2700,
      CSTPriceWei: BigInt('2500000000000000000'),
      source: 'contract',
      apiAuctionDuration: 3600,
      apiSecondsElapsed: 1800,
    });
  });

  it('refreshes live CST reward and duration data on an interval', async () => {
    const liveCstGlobals = globalThis as LiveCstPreviewTestGlobals;
    liveCstGlobals.__COSMIC_ENABLE_LIVE_CST_PREVIEW_TEST_TIMERS__ = true;
    liveCstGlobals.__COSMIC_LIVE_CST_PREVIEW_TEST_INTERVAL_MS__ = 50;
    const rewardValues = [BigInt('100000000000000000000'), BigInt('125000000000000000000')];
    const priceValues = [BigInt('1000000000000000000'), BigInt('2000000000000000000')];
    const durationValues = [
      [43200n, 1200n],
      [43200n, 1201n],
    ];

    let rewardReadCount = 0;
    let priceReadCount = 0;
    let durationReadCount = 0;
    mockGetNextCstGestureCost.mockImplementation(
      async () => priceValues[Math.min(priceReadCount++, priceValues.length - 1)]!,
    );
    mockGetGestureCstRewardAmount.mockImplementation(
      async () => rewardValues[Math.min(rewardReadCount++, rewardValues.length - 1)]!,
    );
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'getCstDutchAuctionDurations') {
        return durationValues[Math.min(durationReadCount++, durationValues.length - 1)]!;
      }
      if (functionName === 'allowance') return MAX_UINT256;
      return true;
    });

    const { result } = renderHook(() => useGestureForm());
    await waitFor(() => expect(result.current.gestureCstRewardAmount).toBe(125));

    expect(mockGetGestureCstRewardAmount.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(mockGetNextCstGestureCost.mock.calls.length).toBeGreaterThanOrEqual(2);
    expect(result.current.gestureCstRewardAmount).toBe(125);
    expect(result.current.gestureCstRewardAmountMin).toBe(123.75);
    expect(result.current.cstGestureData.SecondsElapsed).toBe(1201);
    expect(result.current.cstGestureData.CSTPrice).toBe(2);
  });

  it('refreshes the CST preview immediately when a gesture event lands', async () => {
    let liveReward = BigInt('100000000000000000000');
    mockGetGestureCstRewardAmount.mockImplementation(async () => liveReward);

    const { result } = renderHook(() => useGestureForm());
    await waitFor(() => expect(result.current.gestureCstRewardAmount).toBe(100));
    await flushAsyncWork();

    expect(result.current.gestureCstRewardAmount).toBe(100);

    liveReward = BigInt('110000000000000000000');
    act(() => {
      window.dispatchEvent(new CustomEvent('cosmic:gesture-placed'));
    });
    await waitFor(() => expect(result.current.gestureCstRewardAmount).toBe(110));

    expect(result.current.gestureCstRewardAmount).toBe(110);
  });

  it('skips overlapping live CST preview refreshes', async () => {
    const liveCstGlobals = globalThis as LiveCstPreviewTestGlobals;
    liveCstGlobals.__COSMIC_ENABLE_LIVE_CST_PREVIEW_TEST_TIMERS__ = true;
    liveCstGlobals.__COSMIC_LIVE_CST_PREVIEW_TEST_INTERVAL_MS__ = 10;
    let resolveReward!: (value: bigint) => void;
    mockGetGestureCstRewardAmount.mockImplementation(
      () =>
        new Promise<bigint>((resolve) => {
          resolveReward = resolve;
        }),
    );

    const { result } = renderHook(() => useGestureForm());
    await waitFor(() => expect(mockGetGestureCstRewardAmount).toHaveBeenCalled());
    const callsWhilePending = mockGetGestureCstRewardAmount.mock.calls.length;

    await new Promise((resolve) => window.setTimeout(resolve, 35));

    expect(mockGetGestureCstRewardAmount.mock.calls.length).toBeLessThanOrEqual(
      callsWhilePending + 1,
    );

    await act(async () => {
      resolveReward(BigInt('100000000000000000000'));
      await flushAsyncWork();
    });

    expect(result.current.gestureCstRewardAmount).toBe(100);
  });

  it('falls back to getBidCstRewardAmountAdvanced when the primary reward selector is unavailable', async () => {
    mockGetGestureCstRewardAmount.mockRejectedValue(
      new Error('function selector was not recognized'),
    );
    mockGetGestureCstRewardAmountAdvanced.mockResolvedValue(BigInt('80000000000000000000'));

    const { result } = renderHook(() => useGestureForm());
    await waitFor(() => expect(result.current.gestureCstRewardAmount).toBe(80));

    expect(mockGetGestureCstRewardAmountAdvanced).toHaveBeenCalledWith([0n]);
    expect(result.current.gestureCstRewardAmount).toBe(80);
    expect(result.current.gestureCstRewardAmountMin).toBe(79.2);
  });

  it('reports a failed CST preview read, and clears it when a later read succeeds', async () => {
    mockGetGestureCstRewardAmount.mockRejectedValue(new Error('execution reverted'));
    mockGetGestureCstRewardAmountAdvanced.mockRejectedValue(new Error('execution reverted'));

    const { result } = renderHook(() => useGestureForm());
    await waitFor(() => expect(result.current.cstRewardReadFailed).toBe(true));
    // Regression: the preview pulsed as "loading" forever after a failed read.
    expect(result.current.gestureCstRewardAmount).toBeNull();
    expect(result.current.isCstRewardLoading).toBe(false);

    mockGetGestureCstRewardAmount.mockResolvedValue(BigInt('90000000000000000000'));
    act(() => {
      window.dispatchEvent(new CustomEvent('cosmic:gesture-placed'));
    });
    await waitFor(() => expect(result.current.gestureCstRewardAmount).toBe(90));
    expect(result.current.cstRewardReadFailed).toBe(false);
  });

  it('cleans up the CST preview timer and gesture event listener on unmount', async () => {
    (globalThis as LiveCstPreviewTestGlobals).__COSMIC_ENABLE_LIVE_CST_PREVIEW_TEST_TIMERS__ = true;
    const clearTimeoutSpy = jest.spyOn(window, 'clearTimeout');
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'cosmic:gesture-placed',
      expect.any(Function),
    );
  });

  it('treats zero CST price as free even before elapsed duration crosses threshold', () => {
    mockUseCTPrice.mockReturnValue({
      data: {
        AuctionDuration: '43200',
        CSTPrice: '0',
        SecondsElapsed: '1200',
      },
    });
    const { result } = renderHook(() => useGestureForm());

    expect(result.current.cstGestureData).toMatchObject({
      AuctionDuration: 43200,
      CSTPrice: 0,
      SecondsElapsed: 1200,
      isFree: true,
    });
  });

  it('keeps local UX scenarios aligned with normal gesture form defaults', async () => {
    process.env.NEXT_PUBLIC_UX_SCENARIO = 'live-low-time';
    resetUxScenarioForTest();

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    expect(result.current.gestureType).toBe('ETH');
    expect(result.current.advancedExpanded).toBe(false);
    expect(result.current.gestureCstRewardAmount).toBe(100);
    expect(mockGetGestureCstRewardAmount).not.toHaveBeenCalled();

    expect(mockGetGestureCstRewardAmount).not.toHaveBeenCalled();
  });

  it('returns null ethGestureInfo when useGestureEthCost returns no data', () => {
    mockUseGestureEthCost.mockReturnValue({ data: undefined });
    const { result } = renderHook(() => useGestureForm());

    expect(result.current.ethGestureInfo).toBeNull();
  });

  it('filters RWLK NFTs using useUsedRWLKNFTs data', async () => {
    const { result } = renderHook(() => useGestureForm());

    // The useEffect runs asynchronously using usedRWLKData from the query hook
    await waitFor(() => expect(result.current.rwlknftIds).toEqual([3, 1]));

    // Wallet owns [1,2,3]; token 2 is already used → available [1,3] reversed → [3,1]
    expect(result.current.rwlknftIds).toEqual([3, 1]);
  });

  it("reports the wallet's Random Walk NFT list as loading until it is read", async () => {
    const { result } = renderHook(() => useGestureForm());
    // Read, not yet answered: never an empty list that looks final.
    expect(result.current.rwlkListStatus).toBe('loading');
    await waitFor(() => expect(result.current.rwlknftIds).toEqual([3, 1]));
    expect(result.current.rwlkListStatus).toBe('ready');
  });

  it('reports a Random Walk NFT list that could not be read as failed, not empty', async () => {
    mockRWLKContract.read.walletOfOwner.mockRejectedValue(new Error('rpc down'));
    const { result } = renderHook(() => useGestureForm());
    await waitFor(() => expect(result.current.rwlkListStatus).toBe('error'));
    expect(mockReportError).toHaveBeenCalledWith(expect.any(Error), 'getRwlkNFTIds');
  });

  it('ignores a walletOfOwner read that resolves after unmount', async () => {
    let resolveTokens!: (tokens: bigint[]) => void;
    mockRWLKContract.read.walletOfOwner.mockReturnValueOnce(
      new Promise<bigint[]>((resolve) => {
        resolveTokens = resolve;
      }),
    );

    const { result, unmount } = renderHook(() => useGestureForm());
    await flushAsyncWork();
    expect(result.current.rwlknftIds).toEqual([]);

    unmount();

    await act(async () => {
      resolveTokens([BigInt(7), BigInt(8)]);
      await flushAsyncWork();
    });

    // Nothing to assert on state after unmount; the contract is that the late
    // resolution neither throws nor reports, which jest.setup would surface as
    // a failing console.error.
    expect(mockReportError).not.toHaveBeenCalled();
  });

  it('does not report a walletOfOwner rejection that lands after unmount', async () => {
    let rejectTokens!: (err: Error) => void;
    mockRWLKContract.read.walletOfOwner.mockReturnValueOnce(
      new Promise<bigint[]>((_resolve, reject) => {
        rejectTokens = reject;
      }),
    );

    const { unmount } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    unmount();

    await act(async () => {
      rejectTokens(new Error('wallet disconnected'));
      await flushAsyncWork();
    });

    expect(mockReportError).not.toHaveBeenCalledWith(expect.anything(), 'getRwlkNFTIds');
  });

  it('still reports a walletOfOwner rejection while mounted', async () => {
    const readError = new Error('rpc down');
    mockRWLKContract.read.walletOfOwner.mockRejectedValueOnce(readError);

    renderHook(() => useGestureForm());
    await flushAsyncWork();

    expect(mockReportError).toHaveBeenCalledWith(readError, 'getRwlkNFTIds');
  });

  it('onGesture succeeds with ETH gesture and returns true', async () => {
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    let success!: boolean;
    success = await result.current.onGesture();
    await flushAsyncWork();

    expect(success).toBe(true);
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'bidWithEth', account: '0xUser' }),
    );
    expect(mockTx.sentApprovals()).toEqual([]);
    expect(mockTx.runs[0]!.errorContext).toBe('gesture-eth');
    expect(mockTx.lastSuccessMessage()).toBe('toasts.gesture.confirmed');
    expect(result.current.isGesturing).toBe(false);
    // The confirmed hash is readable at once, for the chat's explorer link.
    expect(result.current.getLastGestureHash()).toMatch(/^0x/);
  });

  it('names the Participation CST the receipt shows was imprinted', async () => {
    const userTopic = `0x${'user'.padStart(64, '0')}`;
    mockTx.receipt = {
      ...mockTx.receipt,
      logs: [
        {
          address: '0x0',
          topics: [ERC20_TRANSFER_TOPIC, `0x${'0'.repeat(64)}`, userTopic],
          data: `0x${(100n * 10n ** 18n).toString(16)}`,
        },
      ],
    } as unknown as typeof mockTx.receipt;
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    await result.current.onGesture();

    expect(mockTx.lastSuccessMessage()).toBe('toasts.gesture.confirmedWithCst(cst=100)');
  });

  it('onGesture succeeds with NFT contribution', async () => {
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'ownerOf') return '0xUser';
      return true;
    });

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    act(() => {
      result.current.setContributionType('NFT');
      result.current.setNftDonateAddress('0xNftContract');
      result.current.setNftId('42');
    });

    let success!: boolean;
    success = await result.current.onGesture();
    await flushAsyncWork();

    expect(success).toBe(true);
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'bidWithEthAndDonateNft' }),
    );
    await waitFor(() => expect(result.current.nftDonateAddress).toBe(''));
    expect(result.current.nftId).toBe('');
  });

  it('approves only the attached NFT, as step 1 of 2, never the whole collection', async () => {
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'ownerOf') return '0xUser';
      if (functionName === 'getApproved') return '0x0000000000000000000000000000000000000000';
      if (functionName === 'isApprovedForAll') return false;
      return true;
    });

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();
    act(() => {
      result.current.setContributionType('NFT');
      result.current.setNftDonateAddress('0xNftContract');
      result.current.setNftId('42');
    });

    await result.current.onGesture();

    expect(mockTx.sentApprovals()).toEqual(['toasts.gesture.approval.nft(tokenId=42)']);
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'approve', args: ['0xRaffle', 42n] }),
    );
    expect(mockTx.writeContract).not.toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'setApprovalForAll' }),
    );
  });

  it('skips the NFT approval when the token is already approved', async () => {
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'ownerOf') return '0xUser';
      if (functionName === 'getApproved') return '0xRaffle';
      if (functionName === 'isApprovedForAll') return false;
      return true;
    });

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();
    act(() => {
      result.current.setContributionType('NFT');
      result.current.setNftDonateAddress('0xNftContract');
      result.current.setNftId('42');
    });

    await result.current.onGesture();

    expect(mockTx.sentApprovals()).toEqual([]);
  });

  it('onGesture succeeds with token contribution', async () => {
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'decimals') return 18;
      if (functionName === 'balanceOf') return BigInt(1000e18);
      if (functionName === 'allowance') return MAX_UINT256;
      return true;
    });

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    act(() => {
      result.current.setContributionType('Token');
      result.current.setTokenDonateAddress('0xTokenContract');
      result.current.setTokenAmount('10');
    });

    let success!: boolean;
    success = await result.current.onGesture();
    await flushAsyncWork();

    expect(success).toBe(true);
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'bidWithEthAndDonateToken' }),
    );
    await waitFor(() => expect(result.current.tokenDonateAddress).toBe(''));
    expect(result.current.tokenAmount).toBe('');
  });

  it('approves exactly the attached token amount, never an unlimited allowance', async () => {
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'decimals') return 18;
      if (functionName === 'balanceOf') return BigInt(1000e18);
      if (functionName === 'allowance') return 0n;
      return true;
    });

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();
    act(() => {
      result.current.setContributionType('Token');
      result.current.setTokenDonateAddress('0xTokenContract');
      result.current.setTokenAmount('10');
    });

    await result.current.onGesture();

    expect(mockTx.sentApprovals()).toEqual(['toasts.gesture.approval.token(amount=10)']);
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'approve', args: ['0xRaffle', BigInt(10e18)] }),
    );
    expect(mockTx.writeContract).not.toHaveBeenCalledWith(
      expect.objectContaining({ args: ['0xRaffle', MAX_UINT256] }),
    );
  });

  it('reads the attached token amount in the reader’s marks and names what the wallet asks for', async () => {
    // Regression: the attached amount was read with English marks, so a
    // Vietnamese "1.000" (a thousand, as the app prints it) approved 1 token
    // and a Vietnamese "0,5" was refused.
    const nextIntl = jest.requireMock('next-intl') as { useLocale: () => string };
    const locale = jest.spyOn(nextIntl, 'useLocale').mockReturnValue('vi');
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'decimals') return 6;
      if (functionName === 'balanceOf') return 5_000n * 10n ** 6n;
      if (functionName === 'allowance') return 0n;
      return true;
    });

    try {
      const { result } = renderHook(() => useGestureForm());
      await flushAsyncWork();
      act(() => {
        result.current.setContributionType('Token');
        result.current.setTokenDonateAddress('0xTokenContract');
        result.current.setTokenAmount('1.000');
      });

      // The locale's own thousands mark is never guessed at: refused, not sent as 1.
      await result.current.onGesture();
      expect(mockNotify).toHaveBeenCalledWith(
        'error',
        'toasts.gesture.validation.invalidTokenAmount',
      );
      expect(mockTx.writeContract).not.toHaveBeenCalledWith(
        expect.objectContaining({ functionName: 'approve' }),
      );

      act(() => result.current.setTokenAmount('1000,5'));
      await result.current.onGesture();

      expect(mockTx.writeContract).toHaveBeenCalledWith(
        expect.objectContaining({ functionName: 'approve', args: ['0xRaffle', 1_000_500_000n] }),
      );
      expect(mockTx.sentApprovals()).toEqual(['toasts.gesture.approval.token(amount=1.000,5)']);
    } finally {
      locale.mockRestore();
    }
  });

  it('onGestureWithCST succeeds and returns true', async () => {
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    expect(result.current.cstGestureData.CSTPrice).toBe(1);

    let success!: boolean;
    success = await result.current.onGestureWithCST();
    await flushAsyncWork();

    expect(success).toBe(true);
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'bidWithCst' }),
    );
    expect(mockReadContract).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'balanceOf', args: ['0xUser'] }),
    );
    expect(result.current.isGesturing).toBe(false);
  });

  it('passes selected minimum CST reward to V2 CST gesture writes', async () => {
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    act(() => {
      result.current.setCstRewardTolerancePercent(5);
    });

    await result.current.onGestureWithCST();
    await flushAsyncWork();

    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'bidWithCst',
        args: [BigInt('1000000000000000000'), '', BigInt('95000000000000000000')],
      }),
    );
  });

  it('submits zero minimum CST reward when accepting any reward', async () => {
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    act(() => {
      result.current.setAcceptAnyCstReward(true);
    });

    await result.current.onGestureWithCST();
    await flushAsyncWork();

    expect(result.current.gestureCstRewardAmountMinLimitWei).toBe(0n);
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'bidWithCst',
        args: [BigInt('1000000000000000000'), '', 0n],
      }),
    );
  });

  it('onGestureWithCST handles free gesture when window closed', async () => {
    mockUseCTPrice.mockReturnValue({ data: undefined });
    mockGetNextCstGestureCost.mockResolvedValue(0n);
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    expect(result.current.cstGestureData.CSTPrice).toBe(0);

    let success!: boolean;
    success = await result.current.onGestureWithCST();
    await flushAsyncWork();

    expect(success).toBe(true);
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'bidWithCst' }),
    );
    expect(mockReadContract).not.toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'balanceOf' }),
    );
  });

  it('onGesture notifies on insufficient ETH balance', async () => {
    mockGetBalance.mockResolvedValue(BigInt(0));

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    let success!: boolean;
    success = await result.current.onGesture();
    await flushAsyncWork();

    expect(success).toBe(false);
    // The shortfall names both amounts and the network.
    expect(mockNotify).toHaveBeenCalledWith(
      'error',
      'toasts.gesture.validation.insufficientEth(required=0.0102,available=0,network=Arbitrum Sepolia)',
    );
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });

  it('lets the wallet decide when the ETH balance cannot be read', async () => {
    mockGetBalance.mockRejectedValue(new Error('rpc down'));

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    const success = await result.current.onGesture();

    expect(success).toBe(true);
    expect(mockNotify).not.toHaveBeenCalledWith(
      'error',
      expect.stringContaining('insufficientEth'),
    );
  });

  it('onGestureWithCST notifies on insufficient CST balance', async () => {
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) =>
      functionName === 'balanceOf' ? 0n : true,
    );

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    expect(result.current.cstGestureData.CSTPrice).toBe(1);

    let success!: boolean;
    success = await result.current.onGestureWithCST();
    await flushAsyncWork();

    expect(success).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith(
      'error',
      'toasts.gesture.validation.insufficientCst(required=1,available=0)',
    );
    expect(mockGestureWithCst).not.toHaveBeenCalled();
  });

  it('onGesture notifies when no contract available', async () => {
    mockUseCosmicGameContract.mockReturnValue(null);

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    let success!: boolean;
    success = await result.current.onGesture();
    await flushAsyncWork();

    expect(success).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.wallet.connectCorrectNetwork');
  });

  it('onGesture treats a dismissed wallet prompt as cancelled, not failed', async () => {
    const rejectionError = { code: 4001, message: 'User rejected' };
    mockTx.writeContract.mockRejectedValueOnce(rejectionError);

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    let success!: boolean;
    success = await result.current.onGesture();
    await flushAsyncWork();

    expect(success).toBe(false);
    expect(mockTx.lastFailureMessage()).toBeUndefined();
    expect(mockNotifyErrorFromEthers).not.toHaveBeenCalled();
    expect(result.current.isGesturing).toBe(false);
  });

  it('resets isGesturing after gesture completion', async () => {
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    expect(result.current.isGesturing).toBe(false);

    await result.current.onGesture();
    await flushAsyncWork();

    expect(result.current.isGesturing).toBe(false);
  });

  /* ────────────────────────────────────────────────────────────────
   *  Error-boundary + blockchain-interaction edge cases
   * ──────────────────────────────────────────────────────────────── */

  it('onGesture without connected account notifies error', async () => {
    const useWeb3 = jest.requireMock('../../hooks/web3');
    useWeb3.useActiveWeb3React.mockReturnValue({ account: null, chainId: 1, active: false });

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    let ok: boolean | undefined;
    ok = await result.current.onGesture();
    await flushAsyncWork();

    expect(ok).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.wallet.connect');
    expect(mockTx.writeContract).not.toHaveBeenCalled();
    // Restore
    useWeb3.useActiveWeb3React.mockReturnValue({ account: '0xUser', chainId: 1, active: true });
  });

  it('onGesture falls back to the gesture failure sentence for unnamed errors', async () => {
    mockTx.writeContract.mockRejectedValueOnce(new Error('something odd'));
    mockGetContractErrorDescriptor.mockReturnValue(null);

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    const ok = await result.current.onGesture();

    expect(ok).toBe(false);
    expect(mockTx.runs[0]!.errorContext).toBe('gesture-eth');
    expect(mockTx.lastFailureMessage()).toBe('toasts.gesture.transaction.failed');
  });

  it('onGesture selects the localized descriptor key for a known contract revert', async () => {
    const revertErr = new Error('execution reverted');
    mockTx.writeContract.mockRejectedValueOnce(revertErr);
    mockGetContractErrorDescriptor.mockReturnValueOnce({
      key: 'gesture.contractErrors.insufficientReceivedBidAmount',
      errorName: 'InsufficientReceivedBidAmount',
    });

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    let ok: boolean | undefined;
    ok = await result.current.onGesture();
    await flushAsyncWork();

    expect(ok).toBe(false);
    expect(mockTx.lastFailureMessage()).toBe(
      'toasts.gesture.contractErrors.insufficientReceivedBidAmount',
    );
    mockGetContractErrorDescriptor.mockReturnValue(null);
  });

  it('onGestureWithCST runs under the "gesture-cst" error context', async () => {
    mockTx.writeContract.mockRejectedValueOnce(new Error('cst failure'));
    mockGetContractErrorDescriptor.mockReturnValue(null);

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    await result.current.onGestureWithCST();

    expect(mockTx.runs[0]!.errorContext).toBe('gesture-cst');
    expect(mockTx.lastFailureMessage()).toBe('toasts.gesture.transaction.failed');
  });

  it('explains CST protection reverts when no specific contract message is decoded', async () => {
    const cstErr = new Error('execution reverted');
    mockTx.writeContract.mockRejectedValueOnce(cstErr);
    mockGetContractErrorDescriptor.mockReturnValue(null);

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    await result.current.onGestureWithCST();
    await flushAsyncWork();

    expect(mockTx.lastFailureMessage()).toBe('toasts.gesture.transaction.cstReverted');
  });

  it('onGesture aborts if ensureNftOwnership reports wrong owner', async () => {
    mockReadContract.mockImplementation(async (args: { functionName: string }) => {
      if (args.functionName === 'supportsInterface') return true;
      if (args.functionName === 'ownerOf') return '0xOtherOwner';
      return true;
    });

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();
    act(() => {
      result.current.setContributionType('NFT');
      result.current.setNftDonateAddress('0xNft');
      result.current.setNftId('1');
    });

    let ok: boolean | undefined;
    ok = await result.current.onGesture();
    await flushAsyncWork();

    expect(ok).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.gesture.validation.notNftOwner');
    mockReadContract.mockResolvedValue(true);
  });

  it('onGesture with non-ERC721 attached NFT aborts with error', async () => {
    mockReadContract.mockImplementation(async (args: { functionName: string }) => {
      if (args.functionName === 'supportsInterface') return false;
      return true;
    });

    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();
    act(() => {
      result.current.setContributionType('NFT');
      result.current.setNftDonateAddress('0xNft');
      result.current.setNftId('1');
    });

    let ok: boolean | undefined;
    ok = await result.current.onGesture();
    await flushAsyncWork();

    expect(ok).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.gesture.validation.notErc721');
    mockReadContract.mockResolvedValue(true);
  });

  /* ────────────────────────────────────────────────────────────────
   *  Pre-flight: gas, balances, attachments, the Participation CST floor
   * ──────────────────────────────────────────────────────────────── */

  it('sends an ETH gesture with the estimate plus headroom, never a fixed 30M gas limit', async () => {
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    await result.current.onGesture();

    const request = mockTx.writeContract.mock.calls[0]![0] as { gas?: bigint };
    expect(request.gas).toBe(1_000_000n);
    expect(request.gas).not.toBe(30_000_000n);
  });

  it('stops before the wallet when the gas estimate says the contract would reject', async () => {
    mockEstimateContractGas.mockRejectedValueOnce(
      Object.assign(new Error('execution reverted'), { name: 'ContractFunctionExecutionError' }),
    );
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    const ok = await result.current.onGesture();

    expect(ok).toBe(false);
    expect(mockTx.writeContract).not.toHaveBeenCalled();
    expect(mockTx.lastFailureMessage()).toBe('toasts.gesture.transaction.failed');
  });

  it('lets the wallet estimate when the gas estimate cannot run', async () => {
    mockEstimateContractGas.mockRejectedValueOnce(
      Object.assign(new Error('HTTP request failed.'), { name: 'HttpRequestError' }),
    );
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    const ok = await result.current.onGesture();

    expect(ok).toBe(true);
    expect(mockTx.writeContract.mock.calls[0]![0]).not.toHaveProperty('gas');
  });

  it('reads CST on-chain, so CST that just arrived is not refused by a lagging indexer', async () => {
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    const ok = await result.current.onGestureWithCST();

    expect(ok).toBe(true);
    expect(mockReadContract).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'balanceOf', args: ['0xUser'] }),
    );
  });

  it('does not block a CST gesture when the on-chain balance cannot be read', async () => {
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'balanceOf') throw new Error('rpc down');
      return true;
    });
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    const ok = await result.current.onGestureWithCST();

    expect(ok).toBe(true);
    expect(mockNotify).not.toHaveBeenCalledWith(
      'error',
      expect.stringContaining('insufficientCst'),
    );
  });

  it('keeps hash-sized NFT ids exact instead of rounding them through Number', async () => {
    const hugeId = '77194726158210796949047323339125271902179989777093709359638389338608753093290';
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'ownerOf') return '0xUser';
      return true;
    });
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();
    act(() => {
      result.current.setContributionType('NFT');
      result.current.setNftDonateAddress('0xNftContract');
      result.current.setNftId(hugeId);
    });

    await result.current.onGesture();

    expect(mockReadContract).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'ownerOf', args: [BigInt(hugeId)] }),
    );
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'bidWithEthAndDonateNft',
        args: expect.arrayContaining([BigInt(hugeId)]),
      }),
    );
  });

  it.each(['1e3', '-1', '4.5', 'abc'])('refuses the NFT id %s with a named error', async (id) => {
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();
    act(() => {
      result.current.setContributionType('NFT');
      result.current.setNftDonateAddress('0xNftContract');
      result.current.setNftId(id);
    });

    const ok = await result.current.onGesture();

    expect(ok).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.gesture.validation.invalidNftId');
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });

  it.each(['-5', '1e3', '0', '0.0000000000000000001'])(
    'refuses the token amount %s with a named error',
    async (amount) => {
      mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
        if (functionName === 'decimals') return 18;
        if (functionName === 'balanceOf') return BigInt(1000e18);
        return true;
      });
      const { result } = renderHook(() => useGestureForm());
      await flushAsyncWork();
      act(() => {
        result.current.setContributionType('Token');
        result.current.setTokenDonateAddress('0xTokenContract');
        result.current.setTokenAmount(amount);
      });

      const ok = await result.current.onGesture();

      expect(ok).toBe(false);
      expect(mockNotify).toHaveBeenCalledWith(
        'error',
        'toasts.gesture.validation.invalidTokenAmount',
      );
      expect(mockTx.writeContract).not.toHaveBeenCalled();
    },
  );

  it('reads the Participation CST fresh when the preview is missing, keeping the floor', async () => {
    // The preview's read fails; the one in prepare succeeds.
    mockGetGestureCstRewardAmount.mockRejectedValueOnce(new Error('execution reverted'));
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();
    expect(result.current.gestureCstRewardAmountMinLimitWei).toBe(0n);

    await result.current.onGestureWithCST();

    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({
        functionName: 'bidWithCst',
        args: [BigInt('1000000000000000000'), '', BigInt('99000000000000000000')],
      }),
    );
  });

  it('stops and explains when no Participation CST can be read for the floor', async () => {
    mockGetGestureCstRewardAmount.mockRejectedValue(new Error('execution reverted'));
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    const ok = await result.current.onGestureWithCST();

    expect(ok).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith(
      'error',
      'toasts.gesture.validation.cstRewardUnavailable',
    );
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });

  it('needs no reward read when the person accepts any Participation CST', async () => {
    mockGetGestureCstRewardAmount.mockRejectedValue(new Error('execution reverted'));
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();
    act(() => {
      result.current.setAcceptAnyCstReward(true);
    });

    const ok = await result.current.onGesture();

    expect(ok).toBe(true);
    expect(mockTx.writeContract).toHaveBeenCalledWith(
      expect.objectContaining({ functionName: 'bidWithEth', args: [-1n, '', 0n] }),
    );
  });
});

/** The first write's arguments (the gesture call), whatever the V1/V2 shape appends. */
function firstWriteArgs(): readonly unknown[] {
  const call = mockTx.writeContract.mock.calls[0];
  return ((call?.[0] as { args?: unknown[] } | undefined)?.args ?? []) as readonly unknown[];
}

describe('useGestureForm message cap (UTF-8 bytes, as the contract counts)', () => {
  afterEach(() => {
    delete (mockContractObj.read as Record<string, unknown>).bidMessageLengthMaxLimit;
  });

  it('cuts a long Chinese message at 280 bytes, after the last whole character', async () => {
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    // 100 characters of three bytes each: 300 bytes, over the default cap.
    act(() => result.current.setMessage('落'.repeat(100)));

    expect(result.current.messageMaxBytes).toBe(280);
    expect(result.current.message).toBe('落'.repeat(93));
    expect(new TextEncoder().encode(result.current.message).length).toBeLessThanOrEqual(280);
  });

  it('never splits an emoji at the cap', async () => {
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();

    act(() => result.current.setMessage(`${'a'.repeat(278)}😀`));

    expect(result.current.message).toBe('a'.repeat(278));
  });

  it("reads the contract's live cap and applies it", async () => {
    (mockContractObj.read as Record<string, unknown>).bidMessageLengthMaxLimit = jest
      .fn()
      .mockResolvedValue(10n);
    const { result } = renderHook(() => useGestureForm());
    await waitFor(() => expect(result.current.messageMaxBytes).toBe(10));

    act(() => result.current.setMessage('abcdefghijklmnop'));

    expect(result.current.message).toBe('abcdefghij');
  });

  it('refuses a message that no longer fits before the wallet prompt', async () => {
    let resolveCap!: (value: bigint) => void;
    (mockContractObj.read as Record<string, unknown>).bidMessageLengthMaxLimit = jest.fn(
      () =>
        new Promise<bigint>((resolve) => {
          resolveCap = resolve;
        }),
    );
    const { result } = renderHook(() => useGestureForm());
    await flushAsyncWork();
    act(() => result.current.setMessage('a'.repeat(50)));
    // The owner lowered the cap after the message was typed.
    resolveCap(20n);
    await waitFor(() => expect(result.current.messageMaxBytes).toBe(20));

    const ok = await result.current.onGesture();

    expect(ok).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith(
      'error',
      'toasts.gesture.contractErrors.tooLongBidMessage',
    );
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });
});

describe('useGestureForm first Gesture of a cycle', () => {
  it('holds ETH once the cycle has no Gesture, whatever was chosen before', async () => {
    const { result, rerender } = renderHook(
      ({ firstGesture }: { firstGesture: boolean }) => useGestureForm({ firstGesture }),
      { initialProps: { firstGesture: false } },
    );
    await flushAsyncWork();
    act(() => result.current.setBidType('CST'));
    expect(result.current.gestureType).toBe('CST');

    // The page stays open into the next cycle, which opens with no Gesture.
    rerender({ firstGesture: true });

    expect(result.current.gestureType).toBe('ETH');
    expect(result.current.rwlkId).toBe(-1);
  });

  it('lets a Random Walk deep link go before the first Gesture', async () => {
    const { result } = renderHook(() => useGestureForm({ firstGesture: true }));
    await flushAsyncWork();

    act(() => {
      result.current.setBidType('RandomWalk');
      result.current.setRwlkId(3);
    });

    expect(result.current.gestureType).toBe('ETH');
    expect(result.current.rwlkId).toBe(-1);
  });

  it('refuses a CST first Gesture instead of sending one that reverts', async () => {
    const { result } = renderHook(() => useGestureForm({ firstGesture: true }));
    await flushAsyncWork();

    const ok = await result.current.onGestureWithCST();

    expect(ok).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.gesture.contractErrors.wrongBidType');
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });
});

describe('useGestureForm Random Walk token', () => {
  it("lets go of a token that is not one of this wallet's unused NFTs, and says which", async () => {
    const { result } = renderHook(() => useGestureForm());
    act(() => {
      result.current.setBidType('RandomWalk');
      // A deep link to another wallet's token (the wallet holds 1, 2 and 3; 2 is used).
      result.current.setRwlkId(7);
    });
    // Kept while the list is still being read.
    expect(result.current.rwlkId).toBe(7);

    await waitFor(() => expect(result.current.rwlkListStatus).toBe('ready'));

    expect(result.current.rwlkId).toBe(-1);
    expect(result.current.rwlkRejectedId).toBe(7);

    // A new pick clears the note.
    act(() => result.current.setRwlkId(3));
    expect(result.current.rwlkId).toBe(3);
    expect(result.current.rwlkRejectedId).toBeNull();
  });

  it('lets go of a used token', async () => {
    const { result } = renderHook(() => useGestureForm());
    act(() => {
      result.current.setBidType('RandomWalk');
      result.current.setRwlkId(2);
    });
    await waitFor(() => expect(result.current.rwlkListStatus).toBe('ready'));
    expect(result.current.rwlkId).toBe(-1);
  });

  it('lets go of a token picked for another wallet once the new list is read', async () => {
    const web3 = jest.requireMock('../../hooks/web3') as { useActiveWeb3React: jest.Mock };
    const { result, rerender } = renderHook(() => useGestureForm());
    await waitFor(() => expect(result.current.rwlknftIds).toEqual([3, 1]));
    act(() => {
      result.current.setBidType('RandomWalk');
      result.current.setRwlkId(3);
    });
    expect(result.current.rwlkId).toBe(3);

    web3.useActiveWeb3React.mockReturnValue({ account: '0xOther', chainId: 1, active: true });
    mockRWLKContract.read.walletOfOwner.mockResolvedValue([BigInt(9)]);
    try {
      rerender();
      await waitFor(() => expect(result.current.rwlknftIds).toEqual([9]));
      expect(result.current.rwlkId).toBe(-1);
    } finally {
      web3.useActiveWeb3React.mockReturnValue({ account: '0xUser', chainId: 1, active: true });
    }
  });

  it('sends the chosen token, then lets it go once it is used', async () => {
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'ownerOf') return '0xUser';
      if (functionName === 'usedRandomWalkNfts') return 0n;
      return true;
    });
    const { result } = renderHook(() => useGestureForm());
    await waitFor(() => expect(result.current.rwlknftIds).toEqual([3, 1]));
    act(() => {
      result.current.setBidType('RandomWalk');
      result.current.setRwlkId(3);
    });

    // The page ticks between these renders, so the call runs outside act()
    // like the other submit tests.
    const ok = await result.current.onGesture();

    expect(ok).toBe(true);
    expect(firstWriteArgs()[0]).toBe(3n);
    await waitFor(() => expect(result.current.rwlkId).toBe(-1));
    expect(result.current.rwlknftIds).toEqual([1]);
  });

  it('checks ownership on-chain before the wallet prompt', async () => {
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'ownerOf') return '0xSomeoneElse';
      if (functionName === 'usedRandomWalkNfts') return 0n;
      return true;
    });
    const { result } = renderHook(() => useGestureForm());
    await waitFor(() => expect(result.current.rwlknftIds).toEqual([3, 1]));
    act(() => {
      result.current.setBidType('RandomWalk');
      result.current.setRwlkId(3);
    });

    const ok = await result.current.onGesture();

    expect(ok).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith(
      'error',
      'toasts.gesture.contractErrors.callerIsNotNftOwner',
    );
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });

  it('refuses a token the contract already counts as used', async () => {
    mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
      if (functionName === 'ownerOf') return '0xUser';
      if (functionName === 'usedRandomWalkNfts') return 1n;
      return true;
    });
    const { result } = renderHook(() => useGestureForm());
    await waitFor(() => expect(result.current.rwlknftIds).toEqual([3, 1]));
    act(() => {
      result.current.setBidType('RandomWalk');
      result.current.setRwlkId(3);
    });

    const ok = await result.current.onGesture();

    expect(ok).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith(
      'error',
      'toasts.gesture.contractErrors.usedRandomWalkNft',
    );
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });

  it("asks for one of the wallet's unused tokens when none is chosen", async () => {
    const { result } = renderHook(() => useGestureForm());
    await waitFor(() => expect(result.current.rwlknftIds).toEqual([3, 1]));
    act(() => result.current.setBidType('RandomWalk'));

    const ok = await result.current.onGesture();

    expect(ok).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith(
      'error',
      'toasts.gesture.validation.chooseRandomWalkNft',
    );
    expect(mockNotify).not.toHaveBeenCalledWith(
      'error',
      'toasts.gesture.contractErrors.usedRandomWalkNft',
    );
    expect(mockTx.writeContract).not.toHaveBeenCalled();
  });

  describe("with a token the wallet's list has not confirmed", () => {
    // The list is still being read, so the token (a deep link, say) is kept
    // and only the chain can say what is wrong with it.
    const submitUnlistedToken = async () => {
      mockRWLKContract.read.walletOfOwner.mockReturnValue(new Promise(() => undefined));
      const { result } = renderHook(() => useGestureForm());
      act(() => {
        result.current.setBidType('RandomWalk');
        result.current.setRwlkId(7);
      });
      expect(result.current.rwlkListStatus).toBe('loading');
      return result.current.onGesture();
    };

    it("names another wallet's token as not owned, not as used", async () => {
      mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
        if (functionName === 'ownerOf') return '0xSomeoneElse';
        if (functionName === 'usedRandomWalkNfts') return 0n;
        return true;
      });

      expect(await submitUnlistedToken()).toBe(false);
      expect(mockNotify).toHaveBeenCalledWith(
        'error',
        'toasts.gesture.contractErrors.callerIsNotNftOwner',
      );
      expect(mockNotify).not.toHaveBeenCalledWith(
        'error',
        'toasts.gesture.contractErrors.usedRandomWalkNft',
      );
      expect(mockTx.writeContract).not.toHaveBeenCalled();
    });

    it('lets the chain vouch for a token it confirms as owned and unused', async () => {
      mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
        if (functionName === 'ownerOf') return '0xUser';
        if (functionName === 'usedRandomWalkNfts') return 0n;
        return true;
      });

      expect(await submitUnlistedToken()).toBe(true);
      expect(firstWriteArgs()[0]).toBe(7n);
    });

    it('asks for a listed token when the chain cannot be read', async () => {
      mockReadContract.mockImplementation(async ({ functionName }: { functionName: string }) => {
        if (functionName === 'ownerOf' || functionName === 'usedRandomWalkNfts') {
          throw new Error('RPC unavailable');
        }
        return true;
      });

      expect(await submitUnlistedToken()).toBe(false);
      expect(mockNotify).toHaveBeenCalledWith(
        'error',
        'toasts.gesture.validation.chooseRandomWalkNft',
      );
      expect(mockTx.writeContract).not.toHaveBeenCalled();
    });
  });

  it('never sends a token with a plain ETH Gesture', async () => {
    const { result } = renderHook(() => useGestureForm());
    await waitFor(() => expect(result.current.rwlknftIds).toEqual([3, 1]));
    act(() => result.current.setRwlkId(3));
    expect(result.current.gestureType).toBe('ETH');

    await result.current.onGesture();

    expect(firstWriteArgs()[0]).toBe(-1n);
  });
});
