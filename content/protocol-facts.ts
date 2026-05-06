/**
 * Frontend-facing protocol facts verified against the deployed Arbitrum One
 * contract configuration and production Solidity defaults.
 */
export const protocolFacts = {
  mainEthPercentage: 25,
  chronoWarriorEthPercentage: 8,
  stellarSelectionEthPercentage: 4,
  anchorDistributionPercentage: 6,
  publicGoodsPercentage: 7,
  ethStellarSelectionRecipients: 3,
  nftStellarSelectionRecipients: 10,
  anchoredRwlkNftSelectionRecipients: 10,
  perGestureCst: 100,
  specialAllocationCst: 1_000,
  typicalNftsPerCycle: 24,
  claimTimeoutHours: 24,
  secondaryRetrievalTimeoutWeeks: 5,
  randomWalkDiscountPercentage: 50,
  initialGestureCostEth: 0.0001,
  initialCycleTimeIncrementHours: 1,
  nextCycleDelayMinutes: 30,
  compoundingReservePercentage: 50,
} as const;
