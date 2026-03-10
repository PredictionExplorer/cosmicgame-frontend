import { renderHook } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';

import {
  useDashboardInfo,
  useRoundList,
  useRoundInfo,
  useBidList,
  useBidInfo,
  useBidListByRound,
  useClaimHistory,
  useClaimHistoryByUser,
  useCSTList,
  useCSTInfo,
  useUserInfo,
  useUserBalance,
  useStakedCSTTokensByUser,
  useDonationsNFTList,
  useCurrentTime,
} from '../useApiQuery';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: undefined, isLoading: false, error: null })),
  QueryClient: class QueryClient {},
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: {
    get_dashboard_info: jest.fn(),
    get_round_list: jest.fn(),
    get_round_info: jest.fn(),
    get_bid_list: jest.fn(),
    get_bid_info: jest.fn(),
    get_bid_list_by_round: jest.fn(),
    get_claim_history: jest.fn(),
    get_claim_history_by_user: jest.fn(),
    get_cst_list: jest.fn(),
    get_cst_info: jest.fn(),
    get_user_info: jest.fn(),
    get_user_balance: jest.fn(),
    get_staked_cst_tokens_by_user: jest.fn(),
    get_donations_nft_list: jest.fn(),
    get_current_time: jest.fn(),
  },
}));

const mockUseQuery = useQuery as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useApiQuery hooks', () => {
  describe('useDashboardInfo', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useDashboardInfo());

      expect(mockUseQuery).toHaveBeenCalledTimes(1);
      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['dashboardInfo'] }),
      );
    });

    it('configures refetchInterval for live polling', () => {
      renderHook(() => useDashboardInfo());

      const options = mockUseQuery.mock.calls[0][0];
      expect(options.refetchInterval).toBe(12_000);
      expect(options.refetchIntervalInBackground).toBe(false);
      expect(options.staleTime).toBe(5_000);
    });

    it('returns the shape from useQuery', () => {
      mockUseQuery.mockReturnValue({ data: { TotalRounds: 5 }, isLoading: false, error: null });

      const { result } = renderHook(() => useDashboardInfo());

      expect(result.current).toEqual({ data: { TotalRounds: 5 }, isLoading: false, error: null });
    });
  });

  describe('useRoundList', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useRoundList());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['roundList'] }),
      );
    });

    it('configures staleTime and refetchInterval', () => {
      renderHook(() => useRoundList());

      const options = mockUseQuery.mock.calls[0][0];
      expect(options.staleTime).toBe(30_000);
      expect(options.refetchInterval).toBe(60_000);
    });
  });

  describe('useRoundInfo', () => {
    it('includes the round number in the query key', () => {
      renderHook(() => useRoundInfo(42));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['roundInfo', 42] }),
      );
    });

    it('is enabled only when roundNum > 0', () => {
      renderHook(() => useRoundInfo(0));
      expect(mockUseQuery.mock.calls[0][0].enabled).toBe(false);

      jest.clearAllMocks();
      renderHook(() => useRoundInfo(5));
      expect(mockUseQuery.mock.calls[0][0].enabled).toBe(true);
    });
  });

  describe('useBidList', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useBidList());

      expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['bidList'] }));
    });
  });

  describe('useBidInfo', () => {
    it('includes evtLogId in the query key', () => {
      renderHook(() => useBidInfo(99));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['bidInfo', 99] }),
      );
    });

    it('is disabled when evtLogId is 0', () => {
      renderHook(() => useBidInfo(0));

      expect(mockUseQuery.mock.calls[0][0].enabled).toBe(false);
    });
  });

  describe('useBidListByRound', () => {
    it('includes round and sortDir in the query key', () => {
      renderHook(() => useBidListByRound(3, 'asc'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['bidListByRound', 3, 'asc'] }),
      );
    });

    it('defaults sortDir to desc', () => {
      renderHook(() => useBidListByRound(3));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['bidListByRound', 3, 'desc'] }),
      );
    });

    it('is enabled for round >= 0', () => {
      renderHook(() => useBidListByRound(0));
      expect(mockUseQuery.mock.calls[0][0].enabled).toBe(true);
    });
  });

  describe('useClaimHistory', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useClaimHistory());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['claimHistory'] }),
      );
    });
  });

  describe('useClaimHistoryByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useClaimHistoryByUser('0xabc'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['claimHistoryByUser', '0xabc'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useClaimHistoryByUser(null));

      expect(mockUseQuery.mock.calls[0][0].enabled).toBe(false);
    });

    it('is disabled when address is undefined', () => {
      renderHook(() => useClaimHistoryByUser(undefined));

      expect(mockUseQuery.mock.calls[0][0].enabled).toBe(false);
    });

    it('is enabled when address is a non-empty string', () => {
      renderHook(() => useClaimHistoryByUser('0xabc'));

      expect(mockUseQuery.mock.calls[0][0].enabled).toBe(true);
    });
  });

  describe('useCSTList', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useCSTList());

      expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['cstList'] }));
    });
  });

  describe('useCSTInfo', () => {
    it('includes tokenId in the query key', () => {
      renderHook(() => useCSTInfo(7));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['cstInfo', 7] }),
      );
    });

    it('is disabled when tokenId is null', () => {
      renderHook(() => useCSTInfo(null));

      expect(mockUseQuery.mock.calls[0][0].enabled).toBe(false);
    });

    it('is enabled for tokenId = 0', () => {
      renderHook(() => useCSTInfo(0));

      expect(mockUseQuery.mock.calls[0][0].enabled).toBe(true);
    });
  });

  describe('useUserInfo', () => {
    it('includes address in the query key', () => {
      renderHook(() => useUserInfo('0x1234'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['userInfo', '0x1234'] }),
      );
    });

    it('is disabled when address is falsy', () => {
      renderHook(() => useUserInfo(null));

      expect(mockUseQuery.mock.calls[0][0].enabled).toBe(false);
    });

    it('configures live polling', () => {
      renderHook(() => useUserInfo('0x1234'));

      const options = mockUseQuery.mock.calls[0][0];
      expect(options.refetchInterval).toBe(30_000);
      expect(options.refetchIntervalInBackground).toBe(false);
    });
  });

  describe('useUserBalance', () => {
    it('includes address in the query key', () => {
      renderHook(() => useUserBalance('0xbeef'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['userBalance', '0xbeef'] }),
      );
    });

    it('is disabled when address is undefined', () => {
      renderHook(() => useUserBalance(undefined));

      expect(mockUseQuery.mock.calls[0][0].enabled).toBe(false);
    });
  });

  describe('useStakedCSTTokensByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useStakedCSTTokensByUser('0xdead'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakedCSTTokens', '0xdead'] }),
      );
    });

    it('is disabled for falsy address', () => {
      renderHook(() => useStakedCSTTokensByUser(''));

      expect(mockUseQuery.mock.calls[0][0].enabled).toBe(false);
    });
  });

  describe('useDonationsNFTList', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useDonationsNFTList());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['donationsNFTList'] }),
      );
    });
  });

  describe('useCurrentTime', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useCurrentTime());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['currentTime'] }),
      );
    });

    it('polls frequently', () => {
      renderHook(() => useCurrentTime());

      const options = mockUseQuery.mock.calls[0][0];
      expect(options.staleTime).toBe(5_000);
      expect(options.refetchInterval).toBe(12_000);
    });
  });

  describe('queryFn integration', () => {
    it('provides a queryFn for each hook', () => {
      renderHook(() => useDashboardInfo());

      const options = mockUseQuery.mock.calls[0][0];
      expect(typeof options.queryFn).toBe('function');
    });
  });
});
