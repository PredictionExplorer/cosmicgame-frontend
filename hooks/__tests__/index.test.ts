import * as barrel from '@/hooks/index';

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({ data: undefined, isLoading: false, error: null })),
  QueryClient: class QueryClient {},
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../../services/api', () => ({
  __esModule: true,
  default: new Proxy({}, { get: () => jest.fn() }),
}));

jest.mock('../useClipboard', () => ({ useClipboard: jest.fn() }));
jest.mock('../web3', () => ({ useActiveWeb3React: jest.fn() }));
jest.mock('../useCosmicGameContract', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../useCosmicSignatureContract', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../useRaffleWalletContract', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../useRWLKNFTContract', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../useStakingWalletCSTContract', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../useStakingWalletRWLKContract', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../useContractNoSigner', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../useArtBlocksContract', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../useTokenPrice', () => ({ useTokenPrice: jest.fn() }));
jest.mock('../useNotify', () => ({ useNotify: jest.fn() }));
jest.mock('../useBidForm', () => ({ useBidForm: jest.fn() }));
jest.mock('../usePrizeClaim', () => ({ usePrizeClaim: jest.fn() }));
jest.mock('../usePrizeNotification', () => ({ usePrizeNotification: jest.fn() }));

const EXISTING_HOOK_EXPORTS = [
  'useClipboard',
  'useActiveWeb3React',
  'useCosmicGameContract',
  'useCosmicSignatureContract',
  'useRaffleWalletContract',
  'useRWLKNFTContract',
  'useStakingWalletCSTContract',
  'useStakingWalletRWLKContract',
  'useContractNoSigner',
  'useArtBlocksContract',
  'useTokenPrice',
  'useNotify',
  'useBidForm',
  'usePrizeClaim',
  'usePrizeNotification',
] as const;

const USE_API_QUERY_EXPORTS = [
  'useDashboardInfo',
  'useRoundList',
  'useRoundInfo',
  'usePrizeTime',
  'useClaimHistory',
  'useClaimHistoryByUser',
  'useBidList',
  'useBidInfo',
  'useBidListByRound',
  'useCurrentSpecialWinners',
  'usePrizeDepositsList',
  'usePrizeDepositsByRound',
  'useBannedBids',
  'useBidEthPrice',
  'useTimeUntilPrize',
  'useCSTList',
  'useCSTTokensByUser',
  'useCSTInfo',
  'useNameHistory',
  'useTokenByName',
  'useNamedNFTs',
  'useCSTTransfers',
  'useCSTDistribution',
  'useCTBalancesDistribution',
  'useCTTransfers',
  'useCTOwnershipTransfers',
  'useCTPrice',
  'useTokenInfo',
  'useUsedRWLKNFTs',
  'useStakingCSTRewardsToClaimByUser',
  'useStakingCSTRewardsCollectedByUser',
  'useStakedCSTTokensByUser',
  'useCSTActionIdsByDepositId',
  'useStakingCSTActionsByUser',
  'useStakingCSTActions',
  'useStakingCSTActionsInfo',
  'useStakingCSTRewards',
  'useStakingCSTRewardsByRound',
  'useStakingCSTRewardPaidRecordsByUser',
  'useStakedCSTTokensGlobal',
  'useStakingRewardsByUser',
  'useStakingRewardsByUserByTokenDetails',
  'useStakingCSTByUserByDepositRewards',
  'useStakingRWLKActionsInfo',
  'useStakingRWLKActions',
  'useStakingRWLKActionsByUser',
  'useStakingRWLKMintsGlobal',
  'useStakingRWLKMintsByUser',
  'useStakedRWLKTokensGlobal',
  'useStakedRWLKTokensByUser',
  'useDonationsCGSimpleList',
  'useDonationsCGSimpleByRound',
  'useDonationsCGWithInfoList',
  'useDonationsCGWithInfoByRound',
  'useDonationsWithInfoById',
  'useDonationsEthByUser',
  'useDonationsBothByRound',
  'useDonationsBoth',
  'useCharityDonationsDeposits',
  'useCharityCGDeposits',
  'useCharityVoluntary',
  'useCharityWithdrawals',
  'useDonationsNFTList',
  'useDonatedNFTInfo',
  'useDonatedNFTClaimsAll',
  'useClaimedDonatedNFTByUser',
  'useNFTDonationStats',
  'useDonationsNFTByRound',
  'useDonationsNFTUnclaimedByRound',
  'useUnclaimedDonatedNFTByUser',
  'useDonationsERC20ByRound',
  'useDonationsERC20ByUser',
  'useUserInfo',
  'useUserBalance',
  'useNotifyRedBox',
  'useUniqueBidders',
  'useUniqueWinners',
  'useUniqueDonors',
  'useUniqueCSTStakers',
  'useUniqueRWLKStakers',
  'useUniqueBothStakers',
  'useRaffleDepositsByUser',
  'useChronoWarriorDepositsByUser',
  'useUnclaimedRaffleDepositsByUser',
  'useRaffleNFTWinnersList',
  'useRaffleNFTWinnersByRound',
  'useRaffleNFTWinningsByUser',
  'useMarketingRewards',
  'useMarketingRewardsByUser',
  'useCurrentTime',
  'useSystemModelist',
  'useSystemEvents',
] as const;

describe('hooks barrel (hooks/index.ts)', () => {
  it.each(EXISTING_HOOK_EXPORTS)('re-exports %s', (name) => {
    expect(barrel).toHaveProperty(name);
    expect((barrel as Record<string, unknown>)[name]).toBeDefined();
  });

  it.each(USE_API_QUERY_EXPORTS)('re-exports useApiQuery hook %s', (name) => {
    expect(barrel).toHaveProperty(name);
    expect(typeof (barrel as Record<string, unknown>)[name]).toBe('function');
  });

  it('exports the expected total count (15 existing + 92 useApiQuery = 107)', () => {
    const exportedKeys = Object.keys(barrel);
    expect(exportedKeys.length).toBe(EXISTING_HOOK_EXPORTS.length + USE_API_QUERY_EXPORTS.length);
  });

  it('has no naming conflicts between existing hooks and useApiQuery hooks', () => {
    const existingSet = new Set<string>(EXISTING_HOOK_EXPORTS);
    for (const name of USE_API_QUERY_EXPORTS) {
      expect(existingSet.has(name)).toBe(false);
    }
  });

  it('every export is a function', () => {
    const allExports = barrel as Record<string, unknown>;
    for (const [name, value] of Object.entries(allExports)) {
      expect(typeof value).toBe('function');
      if (typeof value !== 'function') {
        throw new Error(`Export "${name}" is ${typeof value}, expected function`);
      }
    }
  });

  it('no export is undefined', () => {
    const allExports = barrel as Record<string, unknown>;
    for (const [name, value] of Object.entries(allExports)) {
      expect(value).toBeDefined();
      if (value === undefined) {
        throw new Error(`Export "${name}" is undefined — likely a broken re-export`);
      }
    }
  });
});
