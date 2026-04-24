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
jest.mock('wagmi', () => ({
  usePublicClient: jest.fn(() => ({
    waitForTransactionReceipt: jest.fn().mockResolvedValue({}),
  })),
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
  isUserRejection: jest.fn(() => false),
  reportError: jest.fn(),
  getContractErrorMessage: (...args: unknown[]) => mockGetContractErrorMessage(...args),
  WALLET_TRANSACTION_CANCELLED_MESSAGE: 'Transaction cancelled by user',
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
  mockReadRoundNum.mockResolvedValueOnce(BigInt(5)).mockResolvedValueOnce(BigInt(6));
  mockGetContractErrorMessage.mockReturnValue(null);
});

const baseData = {
  CurRoundNum: 5,
  NumRaffleNFTWinnersBidding: 2,
  NumRaffleNFTWinnersStakingRWalk: 1,
  MainStats: { StakeStatisticsRWalk: { TotalTokensStaked: 0 } },
  LastBidderAddr: '0xabc',
} as Partial<DashboardInfo> as DashboardInfo;

describe('usePrizeClaim', () => {
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

  it('onClaimPrize success: estimates gas, claims, detects round increment, redirects, returns true', async () => {
    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onClaimPrize();
    });

    expect(success).toBe(true);
    expect(mockEstimateGas).toHaveBeenCalled();
    expect(mockClaimMainPrize).toHaveBeenCalled();
    expect(mockReadRoundNum).toHaveBeenCalledTimes(2);
    expect(mockApi.create).toHaveBeenCalledWith(5, 5);
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/allocation-finalized'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('round=5'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('message=success'));
  });

  it('onClaimPrize error: reports error, shows notification, returns false', async () => {
    const claimError = new Error('transaction failed');
    mockClaimMainPrize.mockRejectedValueOnce(claimError);

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onClaimPrize();
    });

    expect(success).toBe(false);
    expect(mockReportError).toHaveBeenCalledWith(claimError, 'claim-main-prize');
    expect(mockNotifyErrorFromEthers).toHaveBeenCalledWith(claimError);
  });

  it('onClaimPrize user rejection: silently returns false', async () => {
    mockIsUserRejection.mockReturnValueOnce(true);
    mockClaimMainPrize.mockRejectedValueOnce(new Error('user rejected'));

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onClaimPrize();
    });

    expect(success).toBe(false);
    expect(mockNotifyErrorFromEthers).not.toHaveBeenCalled();
    expect(mockNotify).toHaveBeenCalledWith('info', expect.any(String));
  });

  it('onClaimPrize with no contract: notifies error, returns false', async () => {
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
  });

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
});
