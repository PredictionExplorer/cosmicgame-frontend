import { renderHook } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';

import {
  useDashboardInfo,
  useRoundList,
  useRoundInfo,
  usePrizeTime,
  useClaimHistory,
  useClaimHistoryByUser,
  useBidList,
  useBidInfo,
  useBidListByRound,
  useCurrentSpecialWinners,
  usePrizeDepositsList,
  usePrizeDepositsByRound,
  useBannedBids,
  useBidEthPrice,
  useTimeUntilPrize,
  useCSTList,
  useCSTTokensByUser,
  useCSTInfo,
  useNameHistory,
  useTokenByName,
  useNamedNFTs,
  useCSTTransfers,
  useCSTDistribution,
  useCTBalancesDistribution,
  useCTTransfers,
  useCTOwnershipTransfers,
  useCTPrice,
  useTokenInfo,
  useUsedRWLKNFTs,
  useStakingCSTRewardsToClaimByUser,
  useStakingCSTRewardsCollectedByUser,
  useStakedCSTTokensByUser,
  useCSTActionIdsByDepositId,
  useStakingCSTActionsByUser,
  useStakingCSTActions,
  useStakingCSTActionsInfo,
  useStakingCSTRewards,
  useStakingCSTRewardsByRound,
  useStakingCSTRewardPaidRecordsByUser,
  useStakedCSTTokensGlobal,
  useStakingRewardsByUser,
  useStakingRewardsByUserByTokenDetails,
  useStakingCSTByUserByDepositRewards,
  useStakingRWLKActionsInfo,
  useStakingRWLKActions,
  useStakingRWLKActionsByUser,
  useStakingRWLKMintsGlobal,
  useStakingRWLKMintsByUser,
  useStakedRWLKTokensGlobal,
  useStakedRWLKTokensByUser,
  useDonationsCGSimpleList,
  useDonationsCGSimpleByRound,
  useDonationsCGWithInfoList,
  useDonationsCGWithInfoByRound,
  useDonationsWithInfoById,
  useDonationsEthByUser,
  useDonationsBothByRound,
  useDonationsBoth,
  useCharityDonationsDeposits,
  useCharityCGDeposits,
  useCharityVoluntary,
  useCharityWithdrawals,
  useDonationsNFTList,
  useDonatedNFTInfo,
  useDonatedNFTClaimsAll,
  useClaimedDonatedNFTByUser,
  useNFTDonationStats,
  useDonationsNFTByRound,
  useDonationsNFTUnclaimedByRound,
  useUnclaimedDonatedNFTByUser,
  useDonationsERC20ByRound,
  useDonationsERC20ByUser,
  useUserInfo,
  useUserBalance,
  useNotifyRedBox,
  useUniqueBidders,
  useUniqueWinners,
  useUniqueDonors,
  useUniqueCSTStakers,
  useUniqueRWLKStakers,
  useUniqueBothStakers,
  useRaffleDepositsByUser,
  useChronoWarriorDepositsByUser,
  useUnclaimedRaffleDepositsByUser,
  useRaffleNFTWinnersList,
  useRaffleNFTWinnersByRound,
  useRaffleNFTWinningsByUser,
  useMarketingRewards,
  useMarketingRewardsByUser,
  useCurrentTime,
  useSystemModelist,
  useSystemEvents,
} from '@/hooks/useApiQuery';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: undefined, isLoading: false, error: null })),
  QueryClient: class QueryClient {},
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: new Proxy(
    {},
    { get: (_target, prop) => (typeof prop === 'string' ? jest.fn() : undefined) },
  ),
}));

const mockUseQuery = useQuery as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getOptions() {
  return mockUseQuery.mock.calls[0][0];
}

// ---------------------------------------------------------------------------
// Rounds & Bidding
// ---------------------------------------------------------------------------

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

  describe('usePrizeTime', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => usePrizeTime());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['prizeTime'] }),
      );
    });

    it('polls frequently with short staleTime', () => {
      renderHook(() => usePrizeTime());

      const options = getOptions();
      expect(options.staleTime).toBe(5_000);
      expect(options.refetchInterval).toBe(10_000);
      expect(options.refetchIntervalInBackground).toBe(false);
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

  describe('useBidList', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useBidList());

      expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['bidList'] }));
    });

    it('configures polling', () => {
      renderHook(() => useBidList());

      const options = getOptions();
      expect(options.staleTime).toBe(10_000);
      expect(options.refetchInterval).toBe(15_000);
      expect(options.refetchIntervalInBackground).toBe(false);
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

    it('is enabled when evtLogId > 0', () => {
      renderHook(() => useBidInfo(1));

      expect(getOptions().enabled).toBe(true);
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

  describe('useCurrentSpecialWinners', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useCurrentSpecialWinners());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['currentSpecialWinners'] }),
      );
    });

    it('configures polling', () => {
      renderHook(() => useCurrentSpecialWinners());

      const options = getOptions();
      expect(options.staleTime).toBe(15_000);
      expect(options.refetchInterval).toBe(30_000);
      expect(options.refetchIntervalInBackground).toBe(false);
    });
  });

  describe('usePrizeDepositsList', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => usePrizeDepositsList());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['prizeDepositsList'] }),
      );
    });

    it('has staleTime of 30s', () => {
      renderHook(() => usePrizeDepositsList());
      expect(getOptions().staleTime).toBe(30_000);
    });
  });

  describe('usePrizeDepositsByRound', () => {
    it('includes round in the query key', () => {
      renderHook(() => usePrizeDepositsByRound(5));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['prizeDepositsByRound', 5] }),
      );
    });

    it('is enabled for round >= 0', () => {
      renderHook(() => usePrizeDepositsByRound(0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useBannedBids', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useBannedBids());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['bannedBids'] }),
      );
    });

    it('has staleTime of 30s', () => {
      renderHook(() => useBannedBids());
      expect(getOptions().staleTime).toBe(30_000);
    });
  });

  describe('useBidEthPrice', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useBidEthPrice());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['bidEthPrice'] }),
      );
    });

    it('configures polling', () => {
      renderHook(() => useBidEthPrice());

      const options = getOptions();
      expect(options.staleTime).toBe(10_000);
      expect(options.refetchInterval).toBe(15_000);
      expect(options.refetchIntervalInBackground).toBe(false);
    });
  });

  describe('useTimeUntilPrize', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useTimeUntilPrize());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['timeUntilPrize'] }),
      );
    });

    it('polls frequently', () => {
      renderHook(() => useTimeUntilPrize());

      const options = getOptions();
      expect(options.staleTime).toBe(5_000);
      expect(options.refetchInterval).toBe(10_000);
      expect(options.refetchIntervalInBackground).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Tokens (CST / CT)
  // ---------------------------------------------------------------------------

  describe('useCSTList', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useCSTList());

      expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['cstList'] }));
    });
  });

  describe('useCSTTokensByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useCSTTokensByUser('0xabc'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['cstTokensByUser', '0xabc'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useCSTTokensByUser(null));
      expect(getOptions().enabled).toBe(false);
    });

    it('is enabled when address is a non-empty string', () => {
      renderHook(() => useCSTTokensByUser('0xabc'));
      expect(getOptions().enabled).toBe(true);
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

  describe('useNameHistory', () => {
    it('includes tokenId in the query key', () => {
      renderHook(() => useNameHistory(3));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['nameHistory', 3] }),
      );
    });

    it('is disabled when tokenId is null', () => {
      renderHook(() => useNameHistory(null));
      expect(getOptions().enabled).toBe(false);
    });

    it('is enabled for tokenId = 0', () => {
      renderHook(() => useNameHistory(0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useTokenByName', () => {
    it('includes name in the query key', () => {
      renderHook(() => useTokenByName('Alpha'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['tokenByName', 'Alpha'] }),
      );
    });

    it('is disabled when name is null', () => {
      renderHook(() => useTokenByName(null));
      expect(getOptions().enabled).toBe(false);
    });

    it('is enabled for a non-empty name', () => {
      renderHook(() => useTokenByName('test'));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useNamedNFTs', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useNamedNFTs());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['namedNFTs'] }),
      );
    });

    it('has staleTime of 30s', () => {
      renderHook(() => useNamedNFTs());
      expect(getOptions().staleTime).toBe(30_000);
    });
  });

  describe('useCSTTransfers', () => {
    it('includes address in the query key', () => {
      renderHook(() => useCSTTransfers('0xfeed'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['cstTransfers', '0xfeed'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useCSTTransfers(null));
      expect(getOptions().enabled).toBe(false);
    });

    it('is enabled when address is present', () => {
      renderHook(() => useCSTTransfers('0xabc'));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useCSTDistribution', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useCSTDistribution());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['cstDistribution'] }),
      );
    });

    it('has staleTime of 60s', () => {
      renderHook(() => useCSTDistribution());
      expect(getOptions().staleTime).toBe(60_000);
    });
  });

  describe('useCTBalancesDistribution', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useCTBalancesDistribution());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['ctBalancesDistribution'] }),
      );
    });

    it('has staleTime of 60s', () => {
      renderHook(() => useCTBalancesDistribution());
      expect(getOptions().staleTime).toBe(60_000);
    });
  });

  describe('useCTTransfers', () => {
    it('includes address in the query key', () => {
      renderHook(() => useCTTransfers('0xaa'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['ctTransfers', '0xaa'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useCTTransfers(null));
      expect(getOptions().enabled).toBe(false);
    });

    it('is enabled when address is present', () => {
      renderHook(() => useCTTransfers('0xbb'));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useCTOwnershipTransfers', () => {
    it('includes tokenId in the query key', () => {
      renderHook(() => useCTOwnershipTransfers(10));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['ctOwnershipTransfers', 10] }),
      );
    });

    it('is disabled when tokenId is null', () => {
      renderHook(() => useCTOwnershipTransfers(null));
      expect(getOptions().enabled).toBe(false);
    });

    it('is enabled for tokenId = 0', () => {
      renderHook(() => useCTOwnershipTransfers(0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useCTPrice', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useCTPrice());

      expect(mockUseQuery).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['ctPrice'] }));
    });

    it('configures polling', () => {
      renderHook(() => useCTPrice());

      const options = getOptions();
      expect(options.staleTime).toBe(30_000);
      expect(options.refetchInterval).toBe(30_000);
      expect(options.refetchIntervalInBackground).toBe(false);
    });
  });

  describe('useTokenInfo', () => {
    it('includes tokenId in the query key', () => {
      renderHook(() => useTokenInfo(42));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['tokenInfo', 42] }),
      );
    });

    it('accepts string tokenId', () => {
      renderHook(() => useTokenInfo('abc'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['tokenInfo', 'abc'] }),
      );
    });

    it('is disabled when tokenId is null', () => {
      renderHook(() => useTokenInfo(null));
      expect(getOptions().enabled).toBe(false);
    });

    it('is enabled when tokenId is present', () => {
      renderHook(() => useTokenInfo(0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useUsedRWLKNFTs', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useUsedRWLKNFTs());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['usedRWLKNFTs'] }),
      );
    });

    it('has staleTime of 30s', () => {
      renderHook(() => useUsedRWLKNFTs());
      expect(getOptions().staleTime).toBe(30_000);
    });
  });

  // ---------------------------------------------------------------------------
  // Staking – CST
  // ---------------------------------------------------------------------------

  describe('useStakingCSTRewardsToClaimByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useStakingCSTRewardsToClaimByUser('0xaaa'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakingCSTRewardsToClaim', '0xaaa'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useStakingCSTRewardsToClaimByUser(null));
      expect(getOptions().enabled).toBe(false);
    });

    it('configures polling', () => {
      renderHook(() => useStakingCSTRewardsToClaimByUser('0xaaa'));

      const options = getOptions();
      expect(options.refetchInterval).toBe(30_000);
      expect(options.refetchIntervalInBackground).toBe(false);
      expect(options.staleTime).toBe(15_000);
    });
  });

  describe('useStakingCSTRewardsCollectedByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useStakingCSTRewardsCollectedByUser('0xbbb'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakingCSTRewardsCollected', '0xbbb'] }),
      );
    });

    it('is disabled when address is undefined', () => {
      renderHook(() => useStakingCSTRewardsCollectedByUser(undefined));
      expect(getOptions().enabled).toBe(false);
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

    it('configures polling', () => {
      renderHook(() => useStakedCSTTokensByUser('0xdead'));

      const options = getOptions();
      expect(options.refetchInterval).toBe(30_000);
      expect(options.refetchIntervalInBackground).toBe(false);
      expect(options.staleTime).toBe(15_000);
    });
  });

  describe('useCSTActionIdsByDepositId', () => {
    it('includes address and depositId in the query key', () => {
      renderHook(() => useCSTActionIdsByDepositId('0xccc', 7));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['cstActionIdsByDeposit', '0xccc', 7] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useCSTActionIdsByDepositId(null, 7));
      expect(getOptions().enabled).toBe(false);
    });

    it('is disabled when depositId is null', () => {
      renderHook(() => useCSTActionIdsByDepositId('0xccc', null));
      expect(getOptions().enabled).toBe(false);
    });

    it('is enabled when both params are valid', () => {
      renderHook(() => useCSTActionIdsByDepositId('0xccc', 0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useStakingCSTActionsByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useStakingCSTActionsByUser('0xddd'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakingCSTActionsByUser', '0xddd'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useStakingCSTActionsByUser(null));
      expect(getOptions().enabled).toBe(false);
    });
  });

  describe('useStakingCSTActions', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useStakingCSTActions());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakingCSTActions'] }),
      );
    });

    it('has staleTime of 30s', () => {
      renderHook(() => useStakingCSTActions());
      expect(getOptions().staleTime).toBe(30_000);
    });
  });

  describe('useStakingCSTActionsInfo', () => {
    it('includes actionId in the query key', () => {
      renderHook(() => useStakingCSTActionsInfo(5));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakingCSTActionsInfo', 5] }),
      );
    });

    it('is disabled when actionId is null', () => {
      renderHook(() => useStakingCSTActionsInfo(null));
      expect(getOptions().enabled).toBe(false);
    });

    it('is enabled for actionId = 0', () => {
      renderHook(() => useStakingCSTActionsInfo(0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useStakingCSTRewards', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useStakingCSTRewards());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakingCSTRewards'] }),
      );
    });

    it('has staleTime of 30s', () => {
      renderHook(() => useStakingCSTRewards());
      expect(getOptions().staleTime).toBe(30_000);
    });
  });

  describe('useStakingCSTRewardsByRound', () => {
    it('includes round in the query key', () => {
      renderHook(() => useStakingCSTRewardsByRound(3));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakingCSTRewardsByRound', 3] }),
      );
    });

    it('is disabled when round is null', () => {
      renderHook(() => useStakingCSTRewardsByRound(null));
      expect(getOptions().enabled).toBe(false);
    });

    it('is enabled for round = 0', () => {
      renderHook(() => useStakingCSTRewardsByRound(0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useStakingCSTRewardPaidRecordsByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useStakingCSTRewardPaidRecordsByUser('0xeee'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakingCSTRewardPaidRecords', '0xeee'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useStakingCSTRewardPaidRecordsByUser(null));
      expect(getOptions().enabled).toBe(false);
    });
  });

  describe('useStakedCSTTokensGlobal', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useStakedCSTTokensGlobal());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakedCSTTokensGlobal'] }),
      );
    });

    it('has staleTime of 30s', () => {
      renderHook(() => useStakedCSTTokensGlobal());
      expect(getOptions().staleTime).toBe(30_000);
    });
  });

  describe('useStakingRewardsByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useStakingRewardsByUser('0xfff'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakingRewardsByUser', '0xfff'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useStakingRewardsByUser(null));
      expect(getOptions().enabled).toBe(false);
    });
  });

  describe('useStakingRewardsByUserByTokenDetails', () => {
    it('includes address and tokenId in the query key', () => {
      renderHook(() => useStakingRewardsByUserByTokenDetails('0x111', 4));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakingRewardsByUserByToken', '0x111', 4] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useStakingRewardsByUserByTokenDetails(null, 4));
      expect(getOptions().enabled).toBe(false);
    });

    it('is disabled when tokenId is null', () => {
      renderHook(() => useStakingRewardsByUserByTokenDetails('0x111', null));
      expect(getOptions().enabled).toBe(false);
    });

    it('is enabled when both params are valid', () => {
      renderHook(() => useStakingRewardsByUserByTokenDetails('0x111', 0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useStakingCSTByUserByDepositRewards', () => {
    it('includes address in the query key', () => {
      renderHook(() => useStakingCSTByUserByDepositRewards('0x222'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakingCSTByUserByDeposit', '0x222'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useStakingCSTByUserByDepositRewards(null));
      expect(getOptions().enabled).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Staking – RWLK
  // ---------------------------------------------------------------------------

  describe('useStakingRWLKActionsInfo', () => {
    it('includes actionId in the query key', () => {
      renderHook(() => useStakingRWLKActionsInfo(8));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakingRWLKActionsInfo', 8] }),
      );
    });

    it('is disabled when actionId is null', () => {
      renderHook(() => useStakingRWLKActionsInfo(null));
      expect(getOptions().enabled).toBe(false);
    });

    it('is enabled for actionId = 0', () => {
      renderHook(() => useStakingRWLKActionsInfo(0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useStakingRWLKActions', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useStakingRWLKActions());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakingRWLKActions'] }),
      );
    });

    it('has staleTime of 30s', () => {
      renderHook(() => useStakingRWLKActions());
      expect(getOptions().staleTime).toBe(30_000);
    });
  });

  describe('useStakingRWLKActionsByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useStakingRWLKActionsByUser('0x333'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakingRWLKActionsByUser', '0x333'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useStakingRWLKActionsByUser(null));
      expect(getOptions().enabled).toBe(false);
    });
  });

  describe('useStakingRWLKMintsGlobal', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useStakingRWLKMintsGlobal());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakingRWLKMintsGlobal'] }),
      );
    });

    it('has staleTime of 30s', () => {
      renderHook(() => useStakingRWLKMintsGlobal());
      expect(getOptions().staleTime).toBe(30_000);
    });
  });

  describe('useStakingRWLKMintsByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useStakingRWLKMintsByUser('0x444'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakingRWLKMintsByUser', '0x444'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useStakingRWLKMintsByUser(null));
      expect(getOptions().enabled).toBe(false);
    });
  });

  describe('useStakedRWLKTokensGlobal', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useStakedRWLKTokensGlobal());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakedRWLKTokensGlobal'] }),
      );
    });

    it('has staleTime of 30s', () => {
      renderHook(() => useStakedRWLKTokensGlobal());
      expect(getOptions().staleTime).toBe(30_000);
    });
  });

  describe('useStakedRWLKTokensByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useStakedRWLKTokensByUser('0x555'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['stakedRWLKTokens', '0x555'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useStakedRWLKTokensByUser(null));
      expect(getOptions().enabled).toBe(false);
    });

    it('configures polling', () => {
      renderHook(() => useStakedRWLKTokensByUser('0x555'));

      const options = getOptions();
      expect(options.refetchInterval).toBe(30_000);
      expect(options.refetchIntervalInBackground).toBe(false);
      expect(options.staleTime).toBe(15_000);
    });
  });

  // ---------------------------------------------------------------------------
  // Donations – ETH
  // ---------------------------------------------------------------------------

  describe('useDonationsCGSimpleList', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useDonationsCGSimpleList());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['donationsCGSimpleList'] }),
      );
    });

    it('has staleTime of 30s', () => {
      renderHook(() => useDonationsCGSimpleList());
      expect(getOptions().staleTime).toBe(30_000);
    });
  });

  describe('useDonationsCGSimpleByRound', () => {
    it('includes round in the query key', () => {
      renderHook(() => useDonationsCGSimpleByRound(2));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['donationsCGSimpleByRound', 2] }),
      );
    });

    it('is enabled for round >= 0', () => {
      renderHook(() => useDonationsCGSimpleByRound(0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useDonationsCGWithInfoList', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useDonationsCGWithInfoList());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['donationsCGWithInfoList'] }),
      );
    });

    it('has staleTime of 30s', () => {
      renderHook(() => useDonationsCGWithInfoList());
      expect(getOptions().staleTime).toBe(30_000);
    });
  });

  describe('useDonationsCGWithInfoByRound', () => {
    it('includes round in the query key', () => {
      renderHook(() => useDonationsCGWithInfoByRound(4));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['donationsCGWithInfoByRound', 4] }),
      );
    });

    it('is enabled for round >= 0', () => {
      renderHook(() => useDonationsCGWithInfoByRound(0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useDonationsWithInfoById', () => {
    it('includes id in the query key', () => {
      renderHook(() => useDonationsWithInfoById(9));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['donationsWithInfoById', 9] }),
      );
    });

    it('is disabled when id is null', () => {
      renderHook(() => useDonationsWithInfoById(null));
      expect(getOptions().enabled).toBe(false);
    });

    it('is enabled for id = 0', () => {
      renderHook(() => useDonationsWithInfoById(0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useDonationsEthByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useDonationsEthByUser('0x666'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['donationsEthByUser', '0x666'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useDonationsEthByUser(null));
      expect(getOptions().enabled).toBe(false);
    });
  });

  describe('useDonationsBothByRound', () => {
    it('includes round in the query key', () => {
      renderHook(() => useDonationsBothByRound(1));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['donationsBothByRound', 1] }),
      );
    });

    it('is enabled for round >= 0', () => {
      renderHook(() => useDonationsBothByRound(0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useDonationsBoth', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useDonationsBoth());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['donationsBoth'] }),
      );
    });

    it('has staleTime of 30s', () => {
      renderHook(() => useDonationsBoth());
      expect(getOptions().staleTime).toBe(30_000);
    });
  });

  // ---------------------------------------------------------------------------
  // Donations – Charity
  // ---------------------------------------------------------------------------

  describe('useCharityDonationsDeposits', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useCharityDonationsDeposits());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['charityDonationsDeposits'] }),
      );
    });

    it('has staleTime of 60s', () => {
      renderHook(() => useCharityDonationsDeposits());
      expect(getOptions().staleTime).toBe(60_000);
    });
  });

  describe('useCharityCGDeposits', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useCharityCGDeposits());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['charityCGDeposits'] }),
      );
    });

    it('has staleTime of 60s', () => {
      renderHook(() => useCharityCGDeposits());
      expect(getOptions().staleTime).toBe(60_000);
    });
  });

  describe('useCharityVoluntary', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useCharityVoluntary());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['charityVoluntary'] }),
      );
    });

    it('has staleTime of 60s', () => {
      renderHook(() => useCharityVoluntary());
      expect(getOptions().staleTime).toBe(60_000);
    });
  });

  describe('useCharityWithdrawals', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useCharityWithdrawals());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['charityWithdrawals'] }),
      );
    });

    it('has staleTime of 60s', () => {
      renderHook(() => useCharityWithdrawals());
      expect(getOptions().staleTime).toBe(60_000);
    });
  });

  // ---------------------------------------------------------------------------
  // Donations – NFT
  // ---------------------------------------------------------------------------

  describe('useDonationsNFTList', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useDonationsNFTList());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['donationsNFTList'] }),
      );
    });
  });

  describe('useDonatedNFTInfo', () => {
    it('includes recordId in the query key', () => {
      renderHook(() => useDonatedNFTInfo(12));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['donatedNFTInfo', 12] }),
      );
    });

    it('is disabled when recordId is null', () => {
      renderHook(() => useDonatedNFTInfo(null));
      expect(getOptions().enabled).toBe(false);
    });

    it('is enabled for recordId = 0', () => {
      renderHook(() => useDonatedNFTInfo(0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useDonatedNFTClaimsAll', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useDonatedNFTClaimsAll());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['donatedNFTClaimsAll'] }),
      );
    });

    it('has staleTime of 30s', () => {
      renderHook(() => useDonatedNFTClaimsAll());
      expect(getOptions().staleTime).toBe(30_000);
    });
  });

  describe('useClaimedDonatedNFTByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useClaimedDonatedNFTByUser('0x777'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['claimedDonatedNFTByUser', '0x777'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useClaimedDonatedNFTByUser(null));
      expect(getOptions().enabled).toBe(false);
    });
  });

  describe('useNFTDonationStats', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useNFTDonationStats());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['nftDonationStats'] }),
      );
    });

    it('has staleTime of 60s', () => {
      renderHook(() => useNFTDonationStats());
      expect(getOptions().staleTime).toBe(60_000);
    });
  });

  describe('useDonationsNFTByRound', () => {
    it('includes round in the query key', () => {
      renderHook(() => useDonationsNFTByRound(6));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['donationsNFTByRound', 6] }),
      );
    });

    it('is enabled for round >= 0', () => {
      renderHook(() => useDonationsNFTByRound(0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useDonationsNFTUnclaimedByRound', () => {
    it('includes round in the query key', () => {
      renderHook(() => useDonationsNFTUnclaimedByRound(7));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['donationsNFTUnclaimedByRound', 7] }),
      );
    });

    it('is enabled for round >= 0', () => {
      renderHook(() => useDonationsNFTUnclaimedByRound(0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useUnclaimedDonatedNFTByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useUnclaimedDonatedNFTByUser('0x888'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['unclaimedDonatedNFTByUser', '0x888'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useUnclaimedDonatedNFTByUser(null));
      expect(getOptions().enabled).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Donations – ERC20
  // ---------------------------------------------------------------------------

  describe('useDonationsERC20ByRound', () => {
    it('includes round in the query key', () => {
      renderHook(() => useDonationsERC20ByRound(3));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['donationsERC20ByRound', 3] }),
      );
    });

    it('is enabled for round >= 0', () => {
      renderHook(() => useDonationsERC20ByRound(0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useDonationsERC20ByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useDonationsERC20ByUser('0x999'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['donationsERC20ByUser', '0x999'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useDonationsERC20ByUser(null));
      expect(getOptions().enabled).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Users & Statistics
  // ---------------------------------------------------------------------------

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

    it('configures polling', () => {
      renderHook(() => useUserBalance('0xbeef'));

      const options = getOptions();
      expect(options.refetchInterval).toBe(30_000);
      expect(options.refetchIntervalInBackground).toBe(false);
      expect(options.staleTime).toBe(15_000);
    });
  });

  describe('useNotifyRedBox', () => {
    it('includes address in the query key', () => {
      renderHook(() => useNotifyRedBox('0xaaa'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['notifyRedBox', '0xaaa'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useNotifyRedBox(null));
      expect(getOptions().enabled).toBe(false);
    });

    it('configures polling', () => {
      renderHook(() => useNotifyRedBox('0xaaa'));

      const options = getOptions();
      expect(options.refetchInterval).toBe(30_000);
      expect(options.refetchIntervalInBackground).toBe(false);
      expect(options.staleTime).toBe(15_000);
    });
  });

  describe('useUniqueBidders', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useUniqueBidders());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['uniqueBidders'] }),
      );
    });

    it('has staleTime of 60s', () => {
      renderHook(() => useUniqueBidders());
      expect(getOptions().staleTime).toBe(60_000);
    });
  });

  describe('useUniqueWinners', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useUniqueWinners());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['uniqueWinners'] }),
      );
    });

    it('has staleTime of 60s', () => {
      renderHook(() => useUniqueWinners());
      expect(getOptions().staleTime).toBe(60_000);
    });
  });

  describe('useUniqueDonors', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useUniqueDonors());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['uniqueDonors'] }),
      );
    });

    it('has staleTime of 60s', () => {
      renderHook(() => useUniqueDonors());
      expect(getOptions().staleTime).toBe(60_000);
    });
  });

  describe('useUniqueCSTStakers', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useUniqueCSTStakers());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['uniqueCSTStakers'] }),
      );
    });

    it('has staleTime of 60s', () => {
      renderHook(() => useUniqueCSTStakers());
      expect(getOptions().staleTime).toBe(60_000);
    });
  });

  describe('useUniqueRWLKStakers', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useUniqueRWLKStakers());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['uniqueRWLKStakers'] }),
      );
    });

    it('has staleTime of 60s', () => {
      renderHook(() => useUniqueRWLKStakers());
      expect(getOptions().staleTime).toBe(60_000);
    });
  });

  describe('useUniqueBothStakers', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useUniqueBothStakers());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['uniqueBothStakers'] }),
      );
    });

    it('has staleTime of 60s', () => {
      renderHook(() => useUniqueBothStakers());
      expect(getOptions().staleTime).toBe(60_000);
    });
  });

  // ---------------------------------------------------------------------------
  // Raffle
  // ---------------------------------------------------------------------------

  describe('useRaffleDepositsByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useRaffleDepositsByUser('0xbbb'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['raffleDepositsByUser', '0xbbb'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useRaffleDepositsByUser(null));
      expect(getOptions().enabled).toBe(false);
    });
  });

  describe('useChronoWarriorDepositsByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useChronoWarriorDepositsByUser('0xccc'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['chronoWarriorDepositsByUser', '0xccc'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useChronoWarriorDepositsByUser(null));
      expect(getOptions().enabled).toBe(false);
    });
  });

  describe('useUnclaimedRaffleDepositsByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useUnclaimedRaffleDepositsByUser('0xddd'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['unclaimedRaffleDepositsByUser', '0xddd'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useUnclaimedRaffleDepositsByUser(null));
      expect(getOptions().enabled).toBe(false);
    });

    it('configures polling', () => {
      renderHook(() => useUnclaimedRaffleDepositsByUser('0xddd'));

      const options = getOptions();
      expect(options.refetchInterval).toBe(30_000);
      expect(options.refetchIntervalInBackground).toBe(false);
      expect(options.staleTime).toBe(15_000);
    });
  });

  describe('useRaffleNFTWinnersList', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useRaffleNFTWinnersList());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['raffleNFTWinnersList'] }),
      );
    });

    it('has staleTime of 30s', () => {
      renderHook(() => useRaffleNFTWinnersList());
      expect(getOptions().staleTime).toBe(30_000);
    });
  });

  describe('useRaffleNFTWinnersByRound', () => {
    it('includes round in the query key', () => {
      renderHook(() => useRaffleNFTWinnersByRound(5));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['raffleNFTWinnersByRound', 5] }),
      );
    });

    it('is enabled for round >= 0', () => {
      renderHook(() => useRaffleNFTWinnersByRound(0));
      expect(getOptions().enabled).toBe(true);
    });
  });

  describe('useRaffleNFTWinningsByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useRaffleNFTWinningsByUser('0xeee'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['raffleNFTWinningsByUser', '0xeee'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useRaffleNFTWinningsByUser(null));
      expect(getOptions().enabled).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // Marketing
  // ---------------------------------------------------------------------------

  describe('useMarketingRewards', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useMarketingRewards());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['marketingRewards'] }),
      );
    });

    it('has staleTime of 30s', () => {
      renderHook(() => useMarketingRewards());
      expect(getOptions().staleTime).toBe(30_000);
    });
  });

  describe('useMarketingRewardsByUser', () => {
    it('includes address in the query key', () => {
      renderHook(() => useMarketingRewardsByUser('0xfff'));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['marketingRewardsByUser', '0xfff'] }),
      );
    });

    it('is disabled when address is null', () => {
      renderHook(() => useMarketingRewardsByUser(null));
      expect(getOptions().enabled).toBe(false);
    });
  });

  // ---------------------------------------------------------------------------
  // System
  // ---------------------------------------------------------------------------

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

  describe('useSystemModelist', () => {
    it('calls useQuery with the correct query key', () => {
      renderHook(() => useSystemModelist());

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['systemModelist'] }),
      );
    });

    it('has staleTime of 60s', () => {
      renderHook(() => useSystemModelist());
      expect(getOptions().staleTime).toBe(60_000);
    });
  });

  describe('useSystemEvents', () => {
    it('includes start and end in the query key', () => {
      renderHook(() => useSystemEvents(0, 100));

      expect(mockUseQuery).toHaveBeenCalledWith(
        expect.objectContaining({ queryKey: ['systemEvents', 0, 100] }),
      );
    });

    it('is enabled when start >= 0 and end >= start', () => {
      renderHook(() => useSystemEvents(0, 0));
      expect(getOptions().enabled).toBe(true);

      jest.clearAllMocks();
      renderHook(() => useSystemEvents(5, 10));
      expect(getOptions().enabled).toBe(true);
    });

    it('is disabled when end < start', () => {
      renderHook(() => useSystemEvents(10, 5));
      expect(getOptions().enabled).toBe(false);
    });

    it('has staleTime of 60s', () => {
      renderHook(() => useSystemEvents(0, 100));
      expect(getOptions().staleTime).toBe(60_000);
    });
  });

  // ---------------------------------------------------------------------------
  // Cross-cutting
  // ---------------------------------------------------------------------------

  describe('queryFn integration', () => {
    it('provides a queryFn for each hook', () => {
      renderHook(() => useDashboardInfo());

      const options = mockUseQuery.mock.calls[0][0];
      expect(typeof options.queryFn).toBe('function');
    });
  });
});
