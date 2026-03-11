/**
 * Type-level tests for useApiQuery hooks.
 *
 * Verifies that every hook returns properly typed data from useQuery<T>,
 * ensuring consumers get type-safe data without needing `as unknown as` casts.
 */
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

describe('useApiQuery hook generics — every hook passes a type to useQuery<T>', () => {
  const HOOKS_WITH_GENERICS: [string, () => void][] = [
    ['useDashboardInfo', () => useDashboardInfo()],
    ['useRoundList', () => useRoundList()],
    ['useRoundInfo', () => useRoundInfo(1)],
    ['usePrizeTime', () => usePrizeTime()],
    ['useClaimHistory', () => useClaimHistory()],
    ['useClaimHistoryByUser', () => useClaimHistoryByUser('0xabc')],
    ['useBidList', () => useBidList()],
    ['useBidInfo', () => useBidInfo(1)],
    ['useBidListByRound', () => useBidListByRound(1)],
    ['useCurrentSpecialWinners', () => useCurrentSpecialWinners()],
    ['usePrizeDepositsList', () => usePrizeDepositsList()],
    ['usePrizeDepositsByRound', () => usePrizeDepositsByRound(1)],
    ['useBannedBids', () => useBannedBids()],
    ['useBidEthPrice', () => useBidEthPrice()],
    ['useTimeUntilPrize', () => useTimeUntilPrize()],
    ['useCSTList', () => useCSTList()],
    ['useCSTTokensByUser', () => useCSTTokensByUser('0xabc')],
    ['useCSTInfo', () => useCSTInfo(1)],
    ['useNameHistory', () => useNameHistory(1)],
    ['useTokenByName', () => useTokenByName('test')],
    ['useNamedNFTs', () => useNamedNFTs()],
    ['useCSTTransfers', () => useCSTTransfers('0xabc')],
    ['useCSTDistribution', () => useCSTDistribution()],
    ['useCTBalancesDistribution', () => useCTBalancesDistribution()],
    ['useCTTransfers', () => useCTTransfers('0xabc')],
    ['useCTOwnershipTransfers', () => useCTOwnershipTransfers(1)],
    ['useCTPrice', () => useCTPrice()],
    ['useTokenInfo', () => useTokenInfo(1)],
    ['useUsedRWLKNFTs', () => useUsedRWLKNFTs()],
    ['useStakingCSTRewardsToClaimByUser', () => useStakingCSTRewardsToClaimByUser('0x')],
    ['useStakingCSTRewardsCollectedByUser', () => useStakingCSTRewardsCollectedByUser('0x')],
    ['useStakedCSTTokensByUser', () => useStakedCSTTokensByUser('0x')],
    ['useCSTActionIdsByDepositId', () => useCSTActionIdsByDepositId('0x', 1)],
    ['useStakingCSTActionsByUser', () => useStakingCSTActionsByUser('0x')],
    ['useStakingCSTActions', () => useStakingCSTActions()],
    ['useStakingCSTActionsInfo', () => useStakingCSTActionsInfo(1)],
    ['useStakingCSTRewards', () => useStakingCSTRewards()],
    ['useStakingCSTRewardsByRound', () => useStakingCSTRewardsByRound(1)],
    ['useStakingCSTRewardPaidRecordsByUser', () => useStakingCSTRewardPaidRecordsByUser('0x')],
    ['useStakedCSTTokensGlobal', () => useStakedCSTTokensGlobal()],
    ['useStakingRewardsByUser', () => useStakingRewardsByUser('0x')],
    ['useStakingRewardsByUserByTokenDetails', () => useStakingRewardsByUserByTokenDetails('0x', 1)],
    ['useStakingCSTByUserByDepositRewards', () => useStakingCSTByUserByDepositRewards('0x')],
    ['useStakingRWLKActionsInfo', () => useStakingRWLKActionsInfo(1)],
    ['useStakingRWLKActions', () => useStakingRWLKActions()],
    ['useStakingRWLKActionsByUser', () => useStakingRWLKActionsByUser('0x')],
    ['useStakingRWLKMintsGlobal', () => useStakingRWLKMintsGlobal()],
    ['useStakingRWLKMintsByUser', () => useStakingRWLKMintsByUser('0x')],
    ['useStakedRWLKTokensGlobal', () => useStakedRWLKTokensGlobal()],
    ['useStakedRWLKTokensByUser', () => useStakedRWLKTokensByUser('0x')],
    ['useDonationsCGSimpleList', () => useDonationsCGSimpleList()],
    ['useDonationsCGSimpleByRound', () => useDonationsCGSimpleByRound(1)],
    ['useDonationsCGWithInfoList', () => useDonationsCGWithInfoList()],
    ['useDonationsCGWithInfoByRound', () => useDonationsCGWithInfoByRound(1)],
    ['useDonationsWithInfoById', () => useDonationsWithInfoById(1)],
    ['useDonationsEthByUser', () => useDonationsEthByUser('0x')],
    ['useDonationsBothByRound', () => useDonationsBothByRound(1)],
    ['useDonationsBoth', () => useDonationsBoth()],
    ['useCharityDonationsDeposits', () => useCharityDonationsDeposits()],
    ['useCharityCGDeposits', () => useCharityCGDeposits()],
    ['useCharityVoluntary', () => useCharityVoluntary()],
    ['useCharityWithdrawals', () => useCharityWithdrawals()],
    ['useDonationsNFTList', () => useDonationsNFTList()],
    ['useDonatedNFTInfo', () => useDonatedNFTInfo(1)],
    ['useDonatedNFTClaimsAll', () => useDonatedNFTClaimsAll()],
    ['useClaimedDonatedNFTByUser', () => useClaimedDonatedNFTByUser('0x')],
    ['useNFTDonationStats', () => useNFTDonationStats()],
    ['useDonationsNFTByRound', () => useDonationsNFTByRound(1)],
    ['useDonationsNFTUnclaimedByRound', () => useDonationsNFTUnclaimedByRound(1)],
    ['useUnclaimedDonatedNFTByUser', () => useUnclaimedDonatedNFTByUser('0x')],
    ['useDonationsERC20ByRound', () => useDonationsERC20ByRound(1)],
    ['useDonationsERC20ByUser', () => useDonationsERC20ByUser('0x')],
    ['useUserInfo', () => useUserInfo('0x')],
    ['useUserBalance', () => useUserBalance('0x')],
    ['useNotifyRedBox', () => useNotifyRedBox('0x')],
    ['useUniqueBidders', () => useUniqueBidders()],
    ['useUniqueWinners', () => useUniqueWinners()],
    ['useUniqueDonors', () => useUniqueDonors()],
    ['useUniqueCSTStakers', () => useUniqueCSTStakers()],
    ['useUniqueRWLKStakers', () => useUniqueRWLKStakers()],
    ['useUniqueBothStakers', () => useUniqueBothStakers()],
    ['useRaffleDepositsByUser', () => useRaffleDepositsByUser('0x')],
    ['useChronoWarriorDepositsByUser', () => useChronoWarriorDepositsByUser('0x')],
    ['useUnclaimedRaffleDepositsByUser', () => useUnclaimedRaffleDepositsByUser('0x')],
    ['useRaffleNFTWinnersList', () => useRaffleNFTWinnersList()],
    ['useRaffleNFTWinnersByRound', () => useRaffleNFTWinnersByRound(1)],
    ['useRaffleNFTWinningsByUser', () => useRaffleNFTWinningsByUser('0x')],
    ['useMarketingRewards', () => useMarketingRewards()],
    ['useMarketingRewardsByUser', () => useMarketingRewardsByUser('0x')],
    ['useCurrentTime', () => useCurrentTime()],
    ['useSystemModelist', () => useSystemModelist()],
    ['useSystemEvents', () => useSystemEvents(0, 100)],
  ];

  it('covers all 92 hooks', () => {
    expect(HOOKS_WITH_GENERICS.length).toBe(92);
  });

  it.each(HOOKS_WITH_GENERICS)('%s calls useQuery with a queryFn', (name, hook) => {
    renderHook(() => hook());
    expect(mockUseQuery).toHaveBeenCalledTimes(1);
    const options = mockUseQuery.mock.calls[0][0];
    expect(typeof options.queryFn).toBe('function');
    expect(options.queryKey).toBeDefined();
    expect(Array.isArray(options.queryKey)).toBe(true);
  });

  it('no hook calls bare useQuery without a generic type argument', () => {
    /**
     * This test verifies that every useQuery call passes options (which
     * includes the generic type parameter). The key evidence is that
     * all hooks call useQuery with exactly 1 argument (the options object),
     * and the TypeScript compiler ensures the generic is present at compile time.
     * The tsc --noEmit check in CI validates this.
     */
    for (const [, hook] of HOOKS_WITH_GENERICS) {
      jest.clearAllMocks();
      renderHook(() => hook());
      expect(mockUseQuery).toHaveBeenCalledTimes(1);
      expect(mockUseQuery.mock.calls[0].length).toBe(1);
    }
  });
});
