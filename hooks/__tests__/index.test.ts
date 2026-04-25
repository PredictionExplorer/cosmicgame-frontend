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
jest.mock('../useStellarSelectionWalletContract', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../useRWLKNFTContract', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../useAnchoringWalletCSTContract', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../useAnchoringWalletRWLKContract', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../useContractNoSigner', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('../useTokenPrice', () => ({ useTokenPrice: jest.fn() }));
jest.mock('../useNotify', () => ({ useNotify: jest.fn() }));
jest.mock('../useGestureForm', () => ({ useGestureForm: jest.fn() }));
jest.mock('../useAllocationFinalize', () => ({ useAllocationFinalize: jest.fn() }));
jest.mock('../useAllocationNotification', () => ({ useAllocationNotification: jest.fn() }));

const EXISTING_HOOK_EXPORTS = [
  'useClipboard',
  'useActiveWeb3React',
  'useCosmicGameContract',
  'useCosmicSignatureContract',
  'useStellarSelectionWalletContract',
  'useRWLKNFTContract',
  'useAnchoringWalletCSTContract',
  'useAnchoringWalletRWLKContract',
  'useContractNoSigner',
  'useTokenPrice',
  'useNotify',
  'useGestureForm',
  'useAllocationFinalize',
  'useAllocationNotification',
] as const;

const USE_API_QUERY_EXPORTS = [
  'useDashboardInfo',
  'useRoundList',
  'useRoundInfo',
  'useAllocationTime',
  'useClaimHistory',
  'useClaimHistoryByUser',
  'useGestureList',
  'useGestureInfo',
  'useGestureListByCycle',
  'useCurrentSpecialRecipients',
  'useAllocationDepositsList',
  'useAllocationDepositsByCycle',
  'useBannedGestures',
  'useGestureEthCost',
  'useTimeUntilAllocation',
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
  'useCSTAnchorDistributionsToRetrieveByUser',
  'useCSTAnchorDistributionsRetrievedByUser',
  'useAnchoredCSTokensByUser',
  'useCSTActionIdsByDepositId',
  'useCSTAnchorActionsByUser',
  'useCSTAnchorActions',
  'useCSTAnchorActionInfo',
  'useCSTAnchorDistributions',
  'useCSTAnchorDistributionsByCycle',
  'useCSTAnchorDistributionPaidRecordsByUser',
  'useGlobalAnchoredCSTokens',
  'useAnchorDistributionsByUser',
  'useAnchorDistributionsByUserByTokenDetails',
  'useCSTAnchorDistributionsByUserByDeposit',
  'useRWLKAnchorActionInfo',
  'useRWLKAnchorActions',
  'useRWLKAnchorActionsByUser',
  'useGlobalRWLKAnchorImprints',
  'useRWLKAnchorImprintsByUser',
  'useGlobalAnchoredRWLKTokens',
  'useAnchoredRWLKTokensByUser',
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
  'useUniqueParticipants',
  'useUniqueRecipients',
  'useUniqueDonors',
  'useUniqueCSTAnchorHolders',
  'useUniqueRWLKAnchorHolders',
  'useUniqueBothAnchorHolders',
  'useStellarSelectionDepositsByUser',
  'useChronoWarriorDepositsByUser',
  'useUnretrievedStellarSelectionDepositsByUser',
  'useStellarSelectionNFTRecipientsList',
  'useStellarSelectionNFTRecipientsByCycle',
  'useStellarSelectionNFTAllocationsByUser',
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
