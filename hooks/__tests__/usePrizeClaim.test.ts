import type { DashboardInfo } from '@/services/api/types';

import { act, renderHook } from '@/test-utils';

const mockNotify = jest.fn();
const mockNotifyErrorFromEthers = jest.fn();
const mockPush = jest.fn();

jest.mock('../../hooks/useNotify', () => ({
  useNotify: () => ({ notify: mockNotify, notifyErrorFromEthers: mockNotifyErrorFromEthers }),
}));
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockWaitForReceipt = jest.fn().mockResolvedValue({ status: 'success' });
const mockUsePublicClient = jest.fn(() => ({ waitForTransactionReceipt: mockWaitForReceipt }));
jest.mock('wagmi', () => ({
  usePublicClient: () => mockUsePublicClient(),
}));

const mockEstimateGas = jest.fn().mockResolvedValue(BigInt(500000));
const mockClaimMainPrize = jest.fn().mockResolvedValue('0xhash');
const mockReadRoundNum = jest.fn();
const mockReadActivationTime = jest.fn().mockResolvedValue(BigInt(1000));
const mockReadTimeout = jest.fn().mockResolvedValue(BigInt(3600));

jest.mock('../../hooks/useCosmicGameContract', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    estimateGas: { claimMainPrize: mockEstimateGas },
    write: { claimMainPrize: mockClaimMainPrize },
    read: {
      roundNum: mockReadRoundNum,
      roundActivationTime: mockReadActivationTime,
      timeoutDurationToClaimMainPrize: mockReadTimeout,
    },
  })),
}));

jest.mock('../useApiQuery', () => ({
  usePrizeTime: jest.fn(() => ({ data: 1000 })),
  useCurrentTime: jest.fn(() => ({ data: Math.floor(Date.now() / 1000) })),
  useClaimHistory: jest.fn(() => ({ data: [{ round: 1, prize: '1.0' }] })),
}));

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    create: jest.fn().mockResolvedValue(undefined),
  },
}));

const mockGetContractErrorMessage = jest.fn().mockReturnValue(null);

jest.mock('../../utils/errors', () => ({
  isUserRejection: jest.fn((_err: unknown) => false),
  reportError: jest.fn(),
  WALLET_TRANSACTION_CANCELLED_MESSAGE: 'Transaction cancelled by user',
}));

jest.mock('../../utils/contractErrors', () => ({
  getContractErrorMessage: (...args: unknown[]) => mockGetContractErrorMessage(...args),
}));

import { usePrizeClaim } from '../usePrizeClaim';
import api from '../../services/api';
import { isUserRejection, reportError } from '../../utils/errors';
import useCosmicGameContract from '../../hooks/useCosmicGameContract';

const mockApi = api as jest.Mocked<typeof api>;
const mockIsUserRejection = isUserRejection as jest.MockedFunction<typeof isUserRejection>;
const mockReportError = reportError as jest.MockedFunction<typeof reportError>;
const mockUseCosmicGameContract = useCosmicGameContract as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockClaimMainPrize.mockResolvedValue('0xhash');
  mockEstimateGas.mockResolvedValue(BigInt(500000));
  mockReadRoundNum.mockReset();
  mockReadRoundNum.mockResolvedValueOnce(BigInt(5)).mockResolvedValueOnce(BigInt(6));
  mockGetContractErrorMessage.mockReturnValue(null);
  mockUsePublicClient.mockReturnValue({ waitForTransactionReceipt: mockWaitForReceipt });
  mockWaitForReceipt.mockResolvedValue({ status: 'success' });
});

const baseData = {
  CurRoundNum: 5,
  NumRaffleNFTWinnersBidding: 2,
  NumRaffleNFTWinnersStakingRWalk: 1,
  MainStats: { StakeStatisticsRWalk: { TotalTokensStaked: 0 } },
  LastBidderAddr: '0xabc',
} as Partial<DashboardInfo> as DashboardInfo;

describe('usePrizeClaim', () => {
  // ─────────────────────────────────────────────
  //  initial state
  // ─────────────────────────────────────────────

  it('initializes with correct default state', async () => {
    mockUseCosmicGameContract.mockReturnValueOnce(null);
    let result: { current: ReturnType<typeof usePrizeClaim> };
    await act(async () => {
      const hookResult = renderHook(() => usePrizeClaim({ data: null, offset: 0 }));
      result = hookResult.result;
    });

    expect(result!.current.prizeTime).toBeGreaterThan(0);
    expect(result!.current.timeoutClaimPrize).toBe(0);
    expect(result!.current.isClaiming).toBe(false);
    expect(typeof result!.current.onClaimPrize).toBe('function');
    expect(typeof result!.current.fetchActivationTime).toBe('function');
  });

  // ─────────────────────────────────────────────
  //  happy path
  // ─────────────────────────────────────────────

  it('onClaimPrize success: estimates gas, claims, detects round increment, redirects, returns true', async () => {
    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onClaimPrize();
    });

    expect(success).toBe(true);
    expect(mockEstimateGas).toHaveBeenCalled();
    expect(mockClaimMainPrize).toHaveBeenCalled();
    expect(mockWaitForReceipt).toHaveBeenCalledWith({ hash: '0xhash' });
    expect(mockReadRoundNum).toHaveBeenCalledTimes(2);
    expect(mockApi.create).toHaveBeenCalledWith(5, 5);
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/allocation-finalized'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('cycle=5'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('message=success'));
  });

  it('uses estimate + GAS_EXTRA when gas estimation succeeds', async () => {
    mockEstimateGas.mockResolvedValueOnce(BigInt(300_000));

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    await act(async () => {
      await result.current.onClaimPrize();
    });

    expect(mockClaimMainPrize).toHaveBeenCalledWith({ gas: BigInt(300_000) + BigInt(1_000_000) });
  });

  it('falls back to GAS_FLOOR when estimateGas returns undefined', async () => {
    mockEstimateGas.mockResolvedValueOnce(undefined as unknown as bigint);

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    await act(async () => {
      await result.current.onClaimPrize();
    });

    expect(mockClaimMainPrize).toHaveBeenCalledWith({ gas: BigInt(2_000_000) });
  });

  it('falls back to GAS_FLOOR when estimateGas throws (still claims)', async () => {
    const estimateErr = new Error('estimate reverted');
    mockEstimateGas.mockRejectedValueOnce(estimateErr);

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    await act(async () => {
      await result.current.onClaimPrize();
    });

    expect(mockReportError).toHaveBeenCalledWith(estimateErr, 'finalize-cycle-gas-estimate');
    expect(mockClaimMainPrize).toHaveBeenCalledWith({ gas: BigInt(2_000_000) });
  });

  it('includes NumRaffleNFTWinnersStakingRWalk in count when RWLK tokens are staked', async () => {
    const data = {
      ...baseData,
      MainStats: { StakeStatisticsRWalk: { TotalTokensStaked: 10 } },
    } as DashboardInfo;

    const { result } = renderHook(() => usePrizeClaim({ data, offset: 0 }));

    await act(async () => {
      await result.current.onClaimPrize();
    });

    // base: NumRaffleNFTWinnersBidding (2) + 3 = 5; +1 (NumRaffleNFTWinnersStakingRWalk)
    expect(mockApi.create).toHaveBeenCalledWith(5, 6);
  });

  it('uses Number(roundBefore) for claimedRound when data.CurRoundNum is undefined', async () => {
    mockReadRoundNum.mockReset();
    mockReadRoundNum.mockResolvedValueOnce(BigInt(7)).mockResolvedValueOnce(BigInt(8));

    const { result } = renderHook(() =>
      usePrizeClaim({
        data: { ...baseData, CurRoundNum: undefined } as unknown as DashboardInfo,
        offset: 0,
      }),
    );

    await act(async () => {
      await result.current.onClaimPrize();
    });

    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('cycle=7'));
  });

  // ─────────────────────────────────────────────
  //  error paths
  // ─────────────────────────────────────────────

  it('onClaimPrize error: reports error, shows notification, returns false', async () => {
    const claimError = new Error('transaction failed');
    mockClaimMainPrize.mockRejectedValueOnce(claimError);

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onClaimPrize();
    });

    expect(success).toBe(false);
    expect(mockReportError).toHaveBeenCalledWith(claimError, 'finalize-cycle');
    expect(mockNotifyErrorFromEthers).toHaveBeenCalledWith(claimError);
  });

  it('onClaimPrize user rejection: silently returns false with info toast', async () => {
    mockIsUserRejection.mockReturnValueOnce(true);
    mockClaimMainPrize.mockRejectedValueOnce(new Error('user rejected'));

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onClaimPrize();
    });

    expect(success).toBe(false);
    expect(mockNotifyErrorFromEthers).not.toHaveBeenCalled();
    expect(mockNotify).toHaveBeenCalledWith('info', 'Transaction cancelled by user');
  });

  it('shows the decoded contract error message when getContractErrorMessage returns one', async () => {
    const err = new Error('MainPrizeEarlyClaim revert');
    mockClaimMainPrize.mockRejectedValueOnce(err);
    mockGetContractErrorMessage.mockReturnValueOnce(
      'Not enough time has elapsed to retrieve the Signature Allocation.',
    );

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    await act(async () => {
      await result.current.onClaimPrize();
    });

    expect(mockNotify).toHaveBeenCalledWith(
      'error',
      'Not enough time has elapsed to retrieve the Signature Allocation.',
    );
    expect(mockNotifyErrorFromEthers).not.toHaveBeenCalled();
  });

  it('waitForTransactionReceipt failure is caught and surfaced as error', async () => {
    const rxErr = new Error('tx reverted on mine');
    mockWaitForReceipt.mockRejectedValueOnce(rxErr);

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onClaimPrize();
    });

    expect(success).toBe(false);
    expect(mockReportError).toHaveBeenCalledWith(rxErr, 'finalize-cycle');
  });

  it('onClaimPrize with no contract: notifies error, returns false, never calls write', async () => {
    mockUseCosmicGameContract.mockReturnValueOnce(null);

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onClaimPrize();
    });

    expect(success).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith(
      'error',
      'Please connect your wallet and ensure you are on the correct network.',
    );
    expect(mockClaimMainPrize).not.toHaveBeenCalled();
  });

  it('onClaimPrize with no publicClient: notifies error, returns false, never calls write', async () => {
    mockUsePublicClient.mockReturnValueOnce(
      null as unknown as ReturnType<typeof mockUsePublicClient>,
    );

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onClaimPrize();
    });

    expect(success).toBe(false);
    expect(mockNotify).toHaveBeenCalledWith(
      'error',
      'Network unavailable — please reconnect your wallet.',
    );
    expect(mockClaimMainPrize).not.toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────
  //  round-advance guard
  // ─────────────────────────────────────────────

  it('warns if on-chain round did not advance after successful tx', async () => {
    mockReadRoundNum.mockReset();
    mockReadRoundNum.mockResolvedValueOnce(BigInt(5)).mockResolvedValueOnce(BigInt(5));

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onClaimPrize();
    });

    expect(success).toBe(true); // still true — tx succeeded
    expect(mockNotify).toHaveBeenCalledWith('warning', expect.stringContaining('did not advance'));
    expect(mockApi.create).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('warns if on-chain round went backwards (chain reorg edge case)', async () => {
    mockReadRoundNum.mockReset();
    mockReadRoundNum.mockResolvedValueOnce(BigInt(5)).mockResolvedValueOnce(BigInt(4));

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    await act(async () => {
      await result.current.onClaimPrize();
    });

    expect(mockNotify).toHaveBeenCalledWith('warning', expect.stringContaining('did not advance'));
  });

  // ─────────────────────────────────────────────
  //  post-tx api failure
  // ─────────────────────────────────────────────

  it('swallows post-claim api.create failure and still navigates', async () => {
    const apiErr = new Error('api 500');
    mockApi.create.mockRejectedValueOnce(apiErr);

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onClaimPrize();
    });

    expect(success).toBe(true);
    expect(mockReportError).toHaveBeenCalledWith(apiErr, 'post-claim-api');
    expect(mockNotify).toHaveBeenCalledWith(
      'warning',
      expect.stringContaining('Token metadata may still be updating'),
    );
    expect(mockPush).toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────
  //  concurrency
  // ─────────────────────────────────────────────

  it('prevents concurrent claim attempts (returns false on second call while first in flight)', async () => {
    mockReadRoundNum.mockReset();
    mockReadRoundNum
      .mockResolvedValueOnce(BigInt(5))
      .mockResolvedValueOnce(BigInt(6))
      .mockResolvedValueOnce(BigInt(5))
      .mockResolvedValueOnce(BigInt(6));

    let resolveFirstClaim!: (hash: string) => void;
    mockClaimMainPrize.mockImplementationOnce(
      () =>
        new Promise<string>((resolve) => {
          resolveFirstClaim = resolve;
        }),
    );

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    let firstPromise: Promise<boolean>;
    act(() => {
      firstPromise = result.current.onClaimPrize();
    });

    // second call while first is in flight
    let secondResult: boolean | undefined;
    await act(async () => {
      secondResult = await result.current.onClaimPrize();
    });

    expect(secondResult).toBe(false);
    expect(mockClaimMainPrize).toHaveBeenCalledTimes(1);

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
    mockClaimMainPrize.mockReturnValueOnce(pendingPromise);

    const { result, unmount } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    let claimPromise!: Promise<boolean>;
    await act(async () => {
      claimPromise = result.current.onClaimPrize();
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
    let result: { current: ReturnType<typeof usePrizeClaim> };
    await act(async () => {
      const hookResult = renderHook(() => usePrizeClaim({ data: null, offset: 0 }));
      result = hookResult.result;
    });
    expect(result!.current.claimHistory).toEqual([{ round: 1, prize: '1.0' }]);
  });

  it('prizeTime is derived from usePrizeTime and useCurrentTime hooks', async () => {
    let result: { current: ReturnType<typeof usePrizeClaim> };
    await act(async () => {
      const hookResult = renderHook(() => usePrizeClaim({ data: null, offset: 0 }));
      result = hookResult.result;
    });
    expect(result!.current.prizeTime).toBeGreaterThan(0);
  });

  it('isClaiming state transitions (true during claim, false after)', async () => {
    mockReadRoundNum.mockReset().mockResolvedValueOnce(BigInt(5)).mockResolvedValue(BigInt(6));

    let resolveClaim!: (value: string) => void;
    mockClaimMainPrize.mockReturnValueOnce(
      new Promise<string>((resolve) => {
        resolveClaim = resolve;
      }),
    );

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    expect(result.current.isClaiming).toBe(false);

    let claimPromise: Promise<boolean>;
    act(() => {
      claimPromise = result.current.onClaimPrize();
    });

    expect(result.current.isClaiming).toBe(true);

    await act(async () => {
      resolveClaim('0xhash');
      await claimPromise;
    });

    expect(result.current.isClaiming).toBe(false);
  });

  it('fetchActivationTime pulls from contract and applies offset', async () => {
    mockReadActivationTime.mockResolvedValue(BigInt(2500));

    let renderResult!: ReturnType<typeof renderHook<ReturnType<typeof usePrizeClaim>, unknown>>;
    await act(async () => {
      renderResult = renderHook(() => usePrizeClaim({ data: baseData, offset: 10_000 }));
    });

    await act(async () => {
      await renderResult.result.current.fetchActivationTime();
    });

    expect(renderResult.result.current.activationTime).toBe(2500 - 10);
    // Restore default
    mockReadActivationTime.mockResolvedValue(BigInt(1000));
  });

  it('fetchActivationTime is a no-op when contract is null', async () => {
    mockUseCosmicGameContract.mockReturnValue(null);

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    await act(async () => {
      await result.current.fetchActivationTime();
    });

    expect(result.current.activationTime).toBe(0);

    mockUseCosmicGameContract.mockReturnValue({
      estimateGas: { claimMainPrize: mockEstimateGas },
      write: { claimMainPrize: mockClaimMainPrize },
      read: {
        roundNum: mockReadRoundNum,
        roundActivationTime: mockReadActivationTime,
        timeoutDurationToClaimMainPrize: mockReadTimeout,
      },
    });
  });
});
