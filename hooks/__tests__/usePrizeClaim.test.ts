import { renderHook, act } from '@testing-library/react';

import type { DashboardInfo } from '@/services/api/types';

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
const mockReadActivationTime = jest.fn().mockResolvedValue(BigInt(1000));
const mockReadTimeout = jest.fn().mockResolvedValue(BigInt(3600));

jest.mock('../../hooks/useCosmicGameContract', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    estimateGas: { claimMainPrize: mockEstimateGas },
    write: { claimMainPrize: mockClaimMainPrize },
    read: {
      roundActivationTime: mockReadActivationTime,
      timeoutDurationToClaimMainPrize: mockReadTimeout,
    },
  })),
}));

jest.mock('../../hooks/useCosmicSignatureContract', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    read: { totalSupply: jest.fn().mockResolvedValue(BigInt(10)) },
  })),
}));

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    get_prize_time: jest.fn().mockResolvedValue(1000),
    get_current_time: jest.fn().mockResolvedValue(Math.floor(Date.now() / 1000)),
    get_claim_history: jest.fn().mockResolvedValue([{ round: 1, prize: '1.0' }]),
    create: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../utils/errors', () => ({
  isUserRejection: jest.fn(() => false),
  reportError: jest.fn(),
}));

import { usePrizeClaim } from '../usePrizeClaim';
import api from '../../services/api';
import { isUserRejection } from '../../utils/errors';
import useCosmicGameContract from '../../hooks/useCosmicGameContract';

const mockApi = api as jest.Mocked<typeof api>;
const mockIsUserRejection = isUserRejection as jest.MockedFunction<typeof isUserRejection>;
const mockUseCosmicGameContract = useCosmicGameContract as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockClaimMainPrize.mockResolvedValue('0xhash');
  mockEstimateGas.mockResolvedValue(BigInt(500000));
});

const baseData = {
  CurRoundNum: 5,
  NumRaffleNFTWinnersBidding: 2,
  NumRaffleNFTWinnersStakingRWalk: 1,
  MainStats: { StakeStatisticsRWalk: { TotalTokensStaked: 0 } },
  LastBidderAddr: '0xabc',
} as Partial<DashboardInfo> as DashboardInfo;

describe('usePrizeClaim', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => usePrizeClaim({ data: null, offset: 0 }));

    expect(result.current.prizeTime).toBe(0);
    expect(result.current.timeoutClaimPrize).toBe(0);
    expect(result.current.isClaiming).toBe(false);
    expect(result.current.claimHistory).toBeNull();
    expect(result.current.activationTime).toBe(0);
    expect(typeof result.current.onClaimPrize).toBe('function');
    expect(typeof result.current.fetchPrizeTime).toBe('function');
    expect(typeof result.current.fetchClaimHistory).toBe('function');
    expect(typeof result.current.fetchActivationTime).toBe('function');
  });

  it('onClaimPrize success: estimates gas, claims, creates token, redirects, returns true', async () => {
    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onClaimPrize();
    });

    expect(success).toBe(true);
    expect(mockEstimateGas).toHaveBeenCalled();
    expect(mockClaimMainPrize).toHaveBeenCalled();
    expect(mockApi.create).toHaveBeenCalledWith(9, 5);
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/prize-claimed'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('round=5'));
    expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('message=success'));
  });

  it('onClaimPrize error: shows notification, returns false', async () => {
    const claimError = new Error('transaction failed');
    mockClaimMainPrize.mockRejectedValueOnce(claimError);

    const { result } = renderHook(() => usePrizeClaim({ data: baseData, offset: 0 }));

    let success: boolean | undefined;
    await act(async () => {
      success = await result.current.onClaimPrize();
    });

    expect(success).toBe(false);
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
    expect(mockNotify).not.toHaveBeenCalled();
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

  it('fetchClaimHistory fetches and sets history', async () => {
    const { result } = renderHook(() => usePrizeClaim({ data: null, offset: 0 }));

    await act(async () => {
      await result.current.fetchClaimHistory();
    });

    expect(mockApi.get_claim_history).toHaveBeenCalled();
    expect(result.current.claimHistory).toEqual([{ round: 1, prize: '1.0' }]);
  });

  it('fetchPrizeTime calculates adjusted prize time', async () => {
    const { result } = renderHook(() => usePrizeClaim({ data: null, offset: 0 }));

    await act(async () => {
      await result.current.fetchPrizeTime();
    });

    expect(mockApi.get_prize_time).toHaveBeenCalled();
    expect(mockApi.get_current_time).toHaveBeenCalled();
    expect(result.current.prizeTime).toBeGreaterThan(0);
  });

  it('isClaiming state transitions (true during claim, false after)', async () => {
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
