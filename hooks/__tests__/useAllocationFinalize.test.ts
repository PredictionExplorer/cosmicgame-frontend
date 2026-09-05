import { AxiosError } from 'axios';
import { createElement, StrictMode, type ReactNode } from 'react';

import type { DashboardInfo } from '@/services/api/types';
import { activeChain } from '@/config/chains';

import { act, renderHook, waitFor } from '@/test-utils';

const mockNotify = jest.fn();
const mockNotifyErrorFromEthers = jest.fn();
const mockPush = jest.fn();
const mockEnsureCorrectChain = jest.fn().mockResolvedValue(true);
const mockGameAddress = '0x1111111111111111111111111111111111111111';
const mockUseContractAddresses = jest.fn(() => ({ cosmicGame: mockGameAddress }));

jest.mock('../useRequireChain', () => ({
  useRequireChain: () => ({ ensureCorrectChain: mockEnsureCorrectChain }),
}));
jest.mock('../../contexts/ContractAddressesContext', () => ({
  useContractAddresses: () => mockUseContractAddresses(),
}));

jest.mock('../../hooks/useNotify', () => ({
  useNotify: () => ({ notify: mockNotify, notifyErrorFromEthers: mockNotifyErrorFromEthers }),
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockWaitForReceipt = jest.fn().mockResolvedValue({ status: 'success' });
const mockReadContract = jest.fn(({ functionName }: { functionName: string }) => {
  if (functionName === 'roundNum') return mockReadRoundNum();
  if (functionName === 'lastCstBidderAddress') return Promise.resolve(undefined);
  throw new Error(`Unexpected read: ${functionName}`);
});
const mockUsePublicClient = jest.fn((_options?: { chainId: number }) => ({
  waitForTransactionReceipt: mockWaitForReceipt,
  readContract: mockReadContract,
  estimateContractGas: mockEstimateGas,
}));
jest.mock('wagmi', () => ({
  usePublicClient: (options: { chainId: number }) => mockUsePublicClient(options),
  useConfig: () => ({}),
}));
jest.mock('@wagmi/core', () => ({
  getAccount: () => ({ address: '0x2222222222222222222222222222222222222222' }),
  writeContract: (_config: unknown, request: unknown) => mockFinalizeCycle(request),
}));

const mockEstimateGas = jest.fn().mockResolvedValue(BigInt(500000));
const mockFinalizeCycle = jest.fn().mockResolvedValue('0xhash');
const mockReadRoundNum = jest.fn();
const mockReadActivationTime = jest.fn().mockResolvedValue(BigInt(1000));
const mockReadTimeout = jest.fn().mockResolvedValue(BigInt(3600));

jest.mock('../../hooks/useCosmicGameContract', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    estimateGas: { claimMainPrize: mockEstimateGas },
    write: { claimMainPrize: mockFinalizeCycle },
    read: {
      roundNum: mockReadRoundNum,
      roundActivationTime: mockReadActivationTime,
      timeoutDurationToClaimMainPrize: mockReadTimeout,
    },
  })),
}));

jest.mock('../useApiQuery', () => ({
  useAllocationTime: jest.fn(() => ({ data: 1000 })),
  useCurrentTime: jest.fn(() => ({ data: Math.floor(Date.now() / 1000) })),
  useClaimHistory: jest.fn(() => ({ data: [{ round: 1, allocation: '1.0' }] })),
}));

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockGetContractErrorDescriptor = jest.fn().mockReturnValue(null);

jest.mock('../../utils/errors', () => ({
  isUserRejection: jest.fn((_err: unknown) => false),
  reportError: jest.fn(),
}));

jest.mock('../../utils/contractErrors', () => ({
  getContractErrorDescriptor: (...args: unknown[]) => mockGetContractErrorDescriptor(...args),
  isEmptyContractReadError: jest.fn(() => false),
}));

import { useAllocationFinalize } from '../useAllocationFinalize';
import { useAllocationTime, useCurrentTime } from '../useApiQuery';
import api from '../../services/api';
import { isUserRejection, reportError } from '../../utils/errors';
import useCosmicGameContract from '../../hooks/useCosmicGameContract';

const mockApi = api as jest.Mocked<typeof api>;
const mockUseAllocationTime = useAllocationTime as jest.MockedFunction<typeof useAllocationTime>;
const mockUseCurrentTime = useCurrentTime as jest.MockedFunction<typeof useCurrentTime>;
const mockIsUserRejection = isUserRejection as jest.MockedFunction<typeof isUserRejection>;
const mockReportError = reportError as jest.MockedFunction<typeof reportError>;
const mockUseCosmicGameContract = useCosmicGameContract as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockFinalizeCycle.mockResolvedValue('0xhash');
  mockEstimateGas.mockResolvedValue(BigInt(500000));
  mockReadRoundNum.mockReset();
  mockReadRoundNum.mockResolvedValueOnce(BigInt(5)).mockResolvedValueOnce(BigInt(6));
  mockGetContractErrorDescriptor.mockReturnValue(null);
  mockEnsureCorrectChain.mockResolvedValue(true);
  mockUseContractAddresses.mockReturnValue({ cosmicGame: mockGameAddress });
  mockUsePublicClient.mockReturnValue({
    waitForTransactionReceipt: mockWaitForReceipt,
    readContract: mockReadContract,
    estimateContractGas: mockEstimateGas,
  });
  mockWaitForReceipt.mockResolvedValue({ status: 'success' });
  mockUseAllocationTime.mockReturnValue({ data: 1000 } as ReturnType<typeof useAllocationTime>);
  mockUseCurrentTime.mockReturnValue({
    data: Math.floor(Date.now() / 1000),
  } as ReturnType<typeof useCurrentTime>);
});

const baseData = {
  CurRoundNum: 5,
  NumRaffleNFTWinnersBidding: 2,
  NumRaffleNFTWinnersStakingRWalk: 1,
  MainStats: { StakeStatisticsRWalk: { TotalTokensStaked: 0 } },
  LastBidderAddr: '0xabc',
} as Partial<DashboardInfo> as DashboardInfo;

describe('useAllocationFinalize', () => {
  // ─────────────────────────────────────────────
  //  initial state
  // ─────────────────────────────────────────────

  it('initializes with correct default state', async () => {
    mockUseCosmicGameContract.mockReturnValueOnce(null);
    let result: { current: ReturnType<typeof useAllocationFinalize> };
    await act(async () => {
      const hookResult = renderHook(() => useAllocationFinalize({ data: null, offset: 0 }));
      result = hookResult.result;
    });

    expect(result!.current.allocationTime).toBeGreaterThan(0);
    expect(result!.current.timeoutFinalize).toBe(0);
    expect(result!.current.isClaiming).toBe(false);
    expect(typeof result!.current.onFinalize).toBe('function');
    expect(typeof result!.current.fetchActivationTime).toBe('function');
  });

  it('keeps allocationTime stable between server time refetches', () => {
    mockUseAllocationTime.mockReturnValue({ data: 1_300 } as ReturnType<typeof useAllocationTime>);
    mockUseCurrentTime.mockReturnValue({
      data: 1_000,
      dataUpdatedAt: 50_000,
    } as ReturnType<typeof useCurrentTime>);

    const { result, rerender } = renderHook(() =>
      useAllocationFinalize({ data: baseData, offset: 0 }),
    );
    const initial = result.current.allocationTime;

    expect(initial).toBe(350_000);
    rerender();
    expect(result.current.allocationTime).toBe(initial);
  });

  // ─────────────────────────────────────────────
  //  happy path
  // ─────────────────────────────────────────────

  it('onFinalize success: estimates gas, claims, detects round increment, redirects, returns true', async () => {
    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onFinalize();
    });

    expect(success).toBe(true);
    expect(mockEnsureCorrectChain).toHaveBeenCalledTimes(1);
    expect(mockUsePublicClient).toHaveBeenCalledWith({ chainId: activeChain.id });
    expect(mockEstimateGas).toHaveBeenCalled();
    expect(mockFinalizeCycle).toHaveBeenCalledWith(
      expect.objectContaining({
        address: mockGameAddress,
        chainId: activeChain.id,
        functionName: 'claimMainPrize',
      }),
    );
    expect(mockWaitForReceipt).toHaveBeenCalledWith({ hash: '0xhash' });
    expect(mockReadRoundNum).toHaveBeenCalledTimes(2);
    expect(mockApi.create).toHaveBeenCalledWith(5, 5);
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/allocation-finalized'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('cycle=5'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('message=success'));
  });

  it('uses estimate + GAS_EXTRA when gas estimation succeeds', async () => {
    mockEstimateGas.mockResolvedValueOnce(BigInt(300_000));

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    await act(async () => {
      await result.current.onFinalize();
    });

    expect(mockFinalizeCycle).toHaveBeenCalledWith(
      expect.objectContaining({ gas: BigInt(300_000) + BigInt(1_000_000) }),
    );
  });

  it('falls back to GAS_FLOOR when estimateGas returns undefined', async () => {
    mockEstimateGas.mockResolvedValueOnce(undefined as unknown as bigint);

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    await act(async () => {
      await result.current.onFinalize();
    });

    expect(mockFinalizeCycle).toHaveBeenCalledWith(
      expect.objectContaining({ gas: BigInt(2_000_000) }),
    );
  });

  it('falls back to GAS_FLOOR when estimateGas throws (still claims)', async () => {
    const estimateErr = new Error('estimate reverted');
    mockEstimateGas.mockRejectedValueOnce(estimateErr);

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    await act(async () => {
      await result.current.onFinalize();
    });

    expect(mockReportError).toHaveBeenCalledWith(estimateErr, 'finalize-cycle-gas-estimate');
    expect(mockFinalizeCycle).toHaveBeenCalledWith(
      expect.objectContaining({ gas: BigInt(2_000_000) }),
    );
  });

  it('includes NumRaffleNFTWinnersStakingRWalk in count when RWLK tokens are anchored', async () => {
    const data = {
      ...baseData,
      MainStats: { StakeStatisticsRWalk: { TotalTokensStaked: 10 } },
    } as DashboardInfo;

    const { result } = renderHook(() => useAllocationFinalize({ data, offset: 0 }));

    await act(async () => {
      await result.current.onFinalize();
    });

    // base: NumRaffleNFTWinnersBidding (2) + 3 = 5; +1 (NumRaffleNFTWinnersStakingRWalk)
    expect(mockApi.create).toHaveBeenCalledWith(5, 6);
  });

  it('uses Number(roundBefore) for claimedRound when data.CurRoundNum is undefined', async () => {
    mockReadRoundNum.mockReset();
    mockReadRoundNum.mockResolvedValueOnce(BigInt(7)).mockResolvedValueOnce(BigInt(8));

    const { result } = renderHook(() =>
      useAllocationFinalize({
        data: { ...baseData, CurRoundNum: undefined } as unknown as DashboardInfo,
        offset: 0,
      }),
    );

    await act(async () => {
      await result.current.onFinalize();
    });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('cycle=7'));
  });

  it('redirect uses on-chain roundBefore, not dashboard CurRoundNum', async () => {
    mockReadRoundNum.mockReset();
    mockReadRoundNum.mockResolvedValueOnce(BigInt(3)).mockResolvedValueOnce(BigInt(4));

    const { result } = renderHook(() =>
      useAllocationFinalize({
        data: { ...baseData, CurRoundNum: 99 } as DashboardInfo,
        offset: 0,
      }),
    );

    await act(async () => {
      await result.current.onFinalize();
    });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('cycle=3'));
  });

  // ─────────────────────────────────────────────
  //  error paths
  // ─────────────────────────────────────────────

  it('onFinalize error: reports error, shows notification, returns false', async () => {
    const claimError = new Error('transaction failed');
    mockFinalizeCycle.mockRejectedValueOnce(claimError);

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onFinalize();
    });

    expect(success).toBe(false);
    expect(mockReportError).toHaveBeenCalledWith(claimError, 'finalize-cycle');
    expect(mockNotifyErrorFromEthers).toHaveBeenCalledWith(claimError, 'toasts.finalize.failed');
  });

  it('onFinalize user rejection: silently returns false with info toast', async () => {
    mockIsUserRejection.mockReturnValueOnce(true);
    mockFinalizeCycle.mockRejectedValueOnce(new Error('user rejected'));

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onFinalize();
    });

    expect(success).toBe(false);
    expect(mockNotifyErrorFromEthers).not.toHaveBeenCalled();
    expect(mockNotify).toHaveBeenCalledWith('info', 'toasts.walletTransactionCancelled');
  });

  it('selects the localized key for a decoded contract error', async () => {
    const err = new Error('MainPrizeEarlyClaim revert');
    mockFinalizeCycle.mockRejectedValueOnce(err);
    mockGetContractErrorDescriptor.mockReturnValueOnce({
      key: 'finalize.contractErrors.mainPrizeEarlyClaim',
      errorName: 'MainPrizeEarlyClaim',
    });

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    await act(async () => {
      await result.current.onFinalize();
    });

    expect(mockNotify).toHaveBeenCalledWith(
      'error',
      'toasts.finalize.contractErrors.mainPrizeEarlyClaim',
    );
    expect(mockNotifyErrorFromEthers).not.toHaveBeenCalled();
  });

  it('waitForTransactionReceipt failure is caught and surfaced as error', async () => {
    const rxErr = new Error('tx reverted on mine');
    mockWaitForReceipt.mockRejectedValueOnce(rxErr);

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onFinalize();
    });

    expect(success).toBe(false);
    expect(mockReportError).toHaveBeenCalledWith(rxErr, 'finalize-cycle');
    expect(mockNotifyErrorFromEthers).toHaveBeenCalledWith(rxErr, 'toasts.finalize.failed');
  });

  it('treats a reverted receipt status as a localized finalize failure', async () => {
    mockWaitForReceipt.mockResolvedValueOnce({ status: 'reverted' });
    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onFinalize();
    });

    expect(success).toBe(false);
    expect(mockReportError).toHaveBeenCalledWith(expect.any(Error), 'finalize-cycle');
    expect(mockNotifyErrorFromEthers).toHaveBeenCalledWith(
      expect.any(Error),
      'toasts.finalize.failed',
    );
  });

  it('onFinalize with no contract address: notifies error, returns false, never calls write', async () => {
    mockUseContractAddresses.mockReturnValueOnce({ cosmicGame: '' });

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onFinalize();
    });

    expect(success).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.wallet.connectCorrectNetwork');
    expect(mockFinalizeCycle).not.toHaveBeenCalled();
  });

  it('onFinalize with no publicClient: notifies error, returns false, never calls write', async () => {
    mockUsePublicClient.mockReturnValueOnce(
      null as unknown as ReturnType<typeof mockUsePublicClient>,
    );

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onFinalize();
    });

    expect(success).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith('error', 'toasts.network.unavailable');
    expect(mockFinalizeCycle).not.toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────
  //  round-advance guard
  // ─────────────────────────────────────────────

  it('warns if on-chain round did not advance after successful tx', async () => {
    mockReadRoundNum.mockReset();
    mockReadRoundNum.mockResolvedValueOnce(BigInt(5)).mockResolvedValueOnce(BigInt(5));

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onFinalize();
    });

    expect(success).toBe(true); // still true — tx succeeded
    expect(mockNotify).toHaveBeenCalledWith('warning', 'toasts.finalize.roundDidNotAdvance');
    expect(mockApi.create).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('warns if on-chain round went backwards (chain reorg edge case)', async () => {
    mockReadRoundNum.mockReset();
    mockReadRoundNum.mockResolvedValueOnce(BigInt(5)).mockResolvedValueOnce(BigInt(4));

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    await act(async () => {
      await result.current.onFinalize();
    });

    expect(mockNotify).toHaveBeenCalledWith('warning', 'toasts.finalize.roundDidNotAdvance');
  });

  // ─────────────────────────────────────────────
  //  post-tx api failure
  // ─────────────────────────────────────────────

  it('swallows post-claim api.create failure and still navigates', async () => {
    const apiErr = new Error('api 500');
    mockApi.create.mockRejectedValueOnce(apiErr);

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onFinalize();
    });

    expect(success).toBe(true);
    expect(mockReportError).toHaveBeenCalledWith(apiErr, 'post-claim-api');
    expect(mockNotify).toHaveBeenCalledWith('warning', 'toasts.finalize.metadataUpdating');
    expect(mockPush).toHaveBeenCalled();
  });

  it('post-claim api 404 does not reportError or spam notifications', async () => {
    const api404 = new AxiosError('Not Found', '404', undefined, undefined, {
      status: 404,
      statusText: 'Not Found',
      headers: {},
      config: {} as never,
      data: {},
    });

    mockApi.create.mockRejectedValueOnce(api404);

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onFinalize();
    });

    expect(success).toBe(true);
    expect(mockReportError).not.toHaveBeenCalled();
    expect(mockNotify).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────
  //  concurrency
  // ─────────────────────────────────────────────

  it('stops before transaction reads or writes when the network guard rejects', async () => {
    mockEnsureCorrectChain.mockResolvedValueOnce(false);
    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onFinalize();
    });

    expect(success).toBe(false);
    expect(result.current.isClaiming).toBe(false);
    expect(mockReadContract).not.toHaveBeenCalled();
    expect(mockEstimateGas).not.toHaveBeenCalled();
    expect(mockFinalizeCycle).not.toHaveBeenCalled();
    expect(mockApi.create).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();

    await act(async () => {
      success = await result.current.onFinalize();
    });
    expect(success).toBe(true);
  });

  it('holds the submission lock during a network switch, then writes without a render-time signer', async () => {
    let finishSwitch!: (allowed: boolean) => void;
    mockEnsureCorrectChain.mockReturnValueOnce(
      new Promise<boolean>((resolve) => {
        finishSwitch = resolve;
      }),
    );
    // A wallet can switch successfully before React supplies a new contract
    // with a signer. The action uses the current wagmi connector instead.
    mockUseCosmicGameContract.mockReturnValueOnce(null);
    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));
    let firstAttempt!: Promise<boolean>;
    act(() => {
      firstAttempt = result.current.onFinalize();
    });

    expect(result.current.isClaiming).toBe(true);
    expect(mockReadContract).not.toHaveBeenCalled();
    expect(mockFinalizeCycle).not.toHaveBeenCalled();
    await act(async () => {
      expect(await result.current.onFinalize()).toBe(false);
    });
    expect(mockEnsureCorrectChain).toHaveBeenCalledTimes(1);

    await act(async () => {
      finishSwitch(true);
      expect(await firstAttempt).toBe(true);
    });
    expect(mockFinalizeCycle).toHaveBeenCalledTimes(1);
    expect(mockFinalizeCycle).toHaveBeenCalledWith(
      expect.objectContaining({
        chainId: activeChain.id,
        address: mockGameAddress,
      }),
    );
    expect(result.current.isClaiming).toBe(false);
  });

  it('prevents concurrent claim attempts (returns false on second call while first in flight)', async () => {
    mockReadRoundNum.mockReset();
    mockReadRoundNum
      .mockResolvedValueOnce(BigInt(5))
      .mockResolvedValueOnce(BigInt(6))
      .mockResolvedValueOnce(BigInt(5))
      .mockResolvedValueOnce(BigInt(6));

    let resolveFirstClaim!: (hash: string) => void;
    mockFinalizeCycle.mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          resolveFirstClaim = resolve;
        }),
    );

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    let firstPromise: Promise<boolean>;
    act(() => {
      firstPromise = result.current.onFinalize();
    });

    // second call while first is in flight
    let secondResult: boolean | undefined;
    await act(async () => {
      secondResult = await result.current.onFinalize();
    });

    expect(secondResult).toBe(false);
    expect(mockFinalizeCycle).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFirstClaim('0xhash');
      await firstPromise;
    });
  });

  // ─────────────────────────────────────────────
  //  unmount safety
  // ─────────────────────────────────────────────

  it('does not crash if component unmounts mid-transaction', async () => {
    let resolveClaim!: (hash: string) => void;
    const pendingPromise = new Promise<string>((resolve) => {
      resolveClaim = resolve;
    });
    mockFinalizeCycle.mockReturnValueOnce(pendingPromise);

    const { result, unmount } = renderHook(() =>
      useAllocationFinalize({ data: baseData, offset: 0 }),
    );

    let claimPromise!: Promise<boolean>;
    await act(async () => {
      claimPromise = result.current.onFinalize();
      // allow roundNum + estimateGas awaits to flush so claimMainPrize is invoked
      await Promise.resolve();
      await Promise.resolve();
    });

    unmount();

    await act(async () => {
      resolveClaim('0xhash');
      await claimPromise;
    });
    // No error thrown — React warning for setState after unmount should not fire
  });

  // ─────────────────────────────────────────────
  //  derived state
  // ─────────────────────────────────────────────

  it('claimHistory is derived from useClaimHistory hook', async () => {
    let result: { current: ReturnType<typeof useAllocationFinalize> };
    await act(async () => {
      const hookResult = renderHook(() => useAllocationFinalize({ data: null, offset: 0 }));
      result = hookResult.result;
    });
    expect(result!.current.claimHistory).toEqual([{ round: 1, allocation: '1.0' }]);
  });

  it('allocationTime is derived from useAllocationTime and useCurrentTime hooks', async () => {
    let result: { current: ReturnType<typeof useAllocationFinalize> };
    await act(async () => {
      const hookResult = renderHook(() => useAllocationFinalize({ data: null, offset: 0 }));
      result = hookResult.result;
    });
    expect(result!.current.allocationTime).toBeGreaterThan(0);
  });

  it('isClaiming state transitions (true during claim, false after)', async () => {
    mockReadRoundNum.mockReset().mockResolvedValueOnce(BigInt(5)).mockResolvedValue(BigInt(6));

    let resolveClaim!: (value: string) => void;
    mockFinalizeCycle.mockReturnValueOnce(
      new Promise<string>((resolve) => {
        resolveClaim = resolve;
      }),
    );

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    expect(result.current.isClaiming).toBe(false);

    let claimPromise: Promise<boolean>;
    act(() => {
      claimPromise = result.current.onFinalize();
    });

    expect(result.current.isClaiming).toBe(true);

    await act(async () => {
      resolveClaim('0xhash');
      await claimPromise;
    });

    expect(result.current.isClaiming).toBe(false);
  });

  it('projects contract activation time through the sampled server clock', async () => {
    mockReadActivationTime.mockResolvedValue(BigInt(2500));
    mockUseCurrentTime.mockReturnValue({
      data: 2000,
      dataUpdatedAt: 1_000_000,
    } as ReturnType<typeof useCurrentTime>);

    let renderResult!: ReturnType<
      typeof renderHook<ReturnType<typeof useAllocationFinalize>, unknown>
    >;
    await act(async () => {
      renderResult = renderHook(() => useAllocationFinalize({ data: baseData, offset: 10_000 }));
    });

    await act(async () => {
      await renderResult.result.current.fetchActivationTime();
    });

    expect(renderResult.result.current.activationTime).toBe(1500);
    // Restore default
    mockReadActivationTime.mockResolvedValue(BigInt(1000));
  });

  it('keeps activation updates enabled through Strict Mode effect replay', async () => {
    mockReadActivationTime.mockResolvedValue(BigInt(2500));
    mockUseCurrentTime.mockReturnValue({
      data: 2000,
      dataUpdatedAt: 1_000_000,
    } as ReturnType<typeof useCurrentTime>);

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }), {
      wrapper: ({ children }: { children: ReactNode }) => createElement(StrictMode, null, children),
    });

    await waitFor(() => expect(result.current.activationTime).toBe(1500));
    mockReadActivationTime.mockResolvedValue(BigInt(1000));
  });

  it('fetchActivationTime is a no-op when contract is null', async () => {
    mockUseCosmicGameContract.mockReturnValue(null);

    const { result } = renderHook(() => useAllocationFinalize({ data: baseData, offset: 0 }));

    await act(async () => {
      await result.current.fetchActivationTime();
    });

    expect(result.current.activationTime).toBe(0);

    mockUseCosmicGameContract.mockReturnValue({
      estimateGas: { claimMainPrize: mockEstimateGas },
      write: { claimMainPrize: mockFinalizeCycle },
      read: {
        roundNum: mockReadRoundNum,
        roundActivationTime: mockReadActivationTime,
        timeoutDurationToClaimMainPrize: mockReadTimeout,
      },
    });
  });
});
