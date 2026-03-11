import { renderHook, act, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { ApiDataProvider, useApiData } from '../ApiDataContext';

const mockRefetchRedBox = jest.fn().mockResolvedValue({ data: {} });
const mockRefetchRewards = jest.fn().mockResolvedValue({ data: [] });

const mockUseNotifyRedBox = jest.fn().mockReturnValue({
  data: undefined,
  refetch: mockRefetchRedBox,
});
const mockUseStakingCSTRewardsToClaimByUser = jest.fn().mockReturnValue({
  data: undefined,
  refetch: mockRefetchRewards,
});

jest.mock('../../hooks/useApiQuery', () => ({
  useNotifyRedBox: (...args: unknown[]) => mockUseNotifyRedBox(...args),
  useStakingCSTRewardsToClaimByUser: (...args: unknown[]) =>
    mockUseStakingCSTRewardsToClaimByUser(...args),
}));

const mockAccount = jest.fn<string | null, []>(() => '0xUser');
jest.mock('../../hooks/web3', () => ({
  useActiveWeb3React: () => ({ account: mockAccount() }),
}));

const mockStakedTokens = jest.fn((): unknown[] => []);
jest.mock('../StakedTokenContext', () => ({
  useStakedToken: () => ({ cstokens: mockStakedTokens(), rwlktokens: [], fetchData: jest.fn() }),
}));

const mockGetCstActionIds = jest.fn();
jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    get_cst_action_ids_by_deposit_id: (...args: unknown[]) => mockGetCstActionIds(...args),
  },
}));

jest.mock('../../utils/errors', () => ({
  reportError: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockAccount.mockReturnValue('0xUser');
  mockStakedTokens.mockReturnValue([]);
  mockUseNotifyRedBox.mockReturnValue({ data: undefined, refetch: mockRefetchRedBox });
  mockUseStakingCSTRewardsToClaimByUser.mockReturnValue({
    data: undefined,
    refetch: mockRefetchRewards,
  });
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <ApiDataProvider>{children}</ApiDataProvider>
);

describe('ApiDataContext', () => {
  it('provides default apiData values', () => {
    const { result } = renderHook(() => useApiData(), { wrapper });
    expect(result.current.apiData).toEqual({
      ETHRaffleToClaim: 0,
      ETHRaffleToClaimWei: 0,
      NumDonatedNFTToClaim: 0,
      UnclaimedStakingReward: 0,
      unstakeableActionIds: [],
    });
    expect(result.current.unclaimedRewards).toEqual([]);
  });

  it('provides red box data when available', async () => {
    const redBox = {
      ETHRaffleToClaim: 5,
      ETHRaffleToClaimWei: 5000,
      NumDonatedNFTToClaim: 2,
      UnclaimedStakingReward: 0,
    };
    mockUseNotifyRedBox.mockReturnValue({ data: redBox, refetch: mockRefetchRedBox });

    const { result } = renderHook(() => useApiData(), { wrapper });

    await waitFor(() => {
      expect(result.current.apiData.ETHRaffleToClaim).toBe(5);
    });
    expect(result.current.apiData.NumDonatedNFTToClaim).toBe(2);
    expect(result.current.apiData.unstakeableActionIds).toEqual([]);
    expect(result.current.apiData.claimableActionIds).toEqual([]);
  });

  it('provides unclaimed rewards from the hook', () => {
    const rewards = [{ EvtLogId: 1, RoundNum: 1, TokenId: 10, DepositId: 5 }];
    mockUseStakingCSTRewardsToClaimByUser.mockReturnValue({
      data: rewards,
      refetch: mockRefetchRewards,
    });

    const { result } = renderHook(() => useApiData(), { wrapper });
    expect(result.current.unclaimedRewards).toEqual(rewards);
  });

  it('passes account to both hooks', () => {
    mockAccount.mockReturnValue('0xABC');
    renderHook(() => useApiData(), { wrapper });

    expect(mockUseNotifyRedBox).toHaveBeenCalledWith('0xABC');
    expect(mockUseStakingCSTRewardsToClaimByUser).toHaveBeenCalledWith('0xABC');
  });

  it('fetchData triggers refetch on both hooks', async () => {
    const { result } = renderHook(() => useApiData(), { wrapper });

    await act(async () => {
      await result.current.fetchData();
    });

    expect(mockRefetchRedBox).toHaveBeenCalledTimes(1);
    expect(mockRefetchRewards).toHaveBeenCalledTimes(1);
  });

  it('processes action IDs when unclaimed rewards exist', async () => {
    const redBox = {
      ETHRaffleToClaim: 1,
      ETHRaffleToClaimWei: 1000,
      NumDonatedNFTToClaim: 0,
      UnclaimedStakingReward: 3,
    };
    const rewards = [{ EvtLogId: 1, RoundNum: 1, TokenId: 10, DepositId: 5 }];

    mockUseNotifyRedBox.mockReturnValue({ data: redBox, refetch: mockRefetchRedBox });
    mockUseStakingCSTRewardsToClaimByUser.mockReturnValue({
      data: rewards,
      refetch: mockRefetchRewards,
    });
    mockStakedTokens.mockReturnValue([
      {
        StakeActionId: 100,
        StakedTokenId: 10,
        StakeTimeStamp: 1,
        TokenInfo: { TokenId: 10, StakeActionId: 100 },
      },
    ]);
    mockGetCstActionIds.mockResolvedValue([
      { DepositId: 5, StakeActionId: 100, Claimed: false },
      { DepositId: 5, StakeActionId: 200, Claimed: true },
    ]);

    const { result } = renderHook(() => useApiData(), { wrapper });

    await waitFor(() => {
      expect(result.current.apiData.unstakeableActionIds).toContain(100);
    });
    expect(result.current.apiData.claimableActionIds).toEqual([
      { DepositId: 5, StakeActionId: 100 },
    ]);
  });

  it('throws when used outside of ApiDataProvider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useApiData())).toThrow(
      'useApiData must be used within an ApiDataProvider',
    );
    consoleSpy.mockRestore();
  });

  it('does not process data when account is null', async () => {
    mockAccount.mockReturnValue(null);
    const redBox = { ETHRaffleToClaim: 1, UnclaimedStakingReward: 1 };
    mockUseNotifyRedBox.mockReturnValue({ data: redBox, refetch: mockRefetchRedBox });
    mockUseStakingCSTRewardsToClaimByUser.mockReturnValue({
      data: [{ EvtLogId: 1, RoundNum: 1, TokenId: 1, DepositId: 1 }],
      refetch: mockRefetchRewards,
    });

    const { result } = renderHook(() => useApiData(), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(mockGetCstActionIds).not.toHaveBeenCalled();
    expect(result.current.apiData.ETHRaffleToClaim).toBe(0);
  });

  it('allows consumers to update apiData via setApiData', () => {
    const { result } = renderHook(() => useApiData(), { wrapper });

    act(() => {
      result.current.setApiData((prev) => ({ ...prev, ETHRaffleToClaim: 99 }));
    });

    expect(result.current.apiData.ETHRaffleToClaim).toBe(99);
  });
});
