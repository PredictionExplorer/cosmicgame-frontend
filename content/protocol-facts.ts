/**
 * Frontend-facing protocol facts verified against the deployed Arbitrum One
 * contract configuration and production Solidity defaults.
 *
 * Source of truth:
 * - Proxy: 0x6a714Ae7B5b6eA520F6BCA23d2E609C4Fd5863F2
 * - Implementation: 0x7739148013777c485AD9f3d971e1005Eca686661
 * - Sourcify match: "perfect" for chain 42161
 *
 * Typical per-cycle imprint totals:
 * - 24 Cosmic Signature NFTs = 4 role NFTs + 10 participant Stellar NFTs
 *   + 10 anchored-RWLK Stellar NFTs.
 * - 27,000 CST = 24 NFT-paired 1,000 CST imprints + 3,000 CST outreach.
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
  outreachReserveCst: 3_000,
  roleNftsPerCycle: 4,
  stellarNftsPerCycle: 20,
  typicalNftsPerCycle: 24,
  typicalCstImprintsPerCycle: 27_000,
  claimTimeoutHours: 24,
  secondaryRetrievalTimeoutWeeks: 5,
  randomWalkDiscountPercentage: 50,
  initialGestureCostEth: 0.0001,
  initialCycleTimeIncrementHours: 1,
  nextCycleDelayMinutes: 30,
  compoundingReservePercentage: 50,
} as const;
