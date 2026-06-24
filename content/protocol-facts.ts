/**
 * Frontend-facing protocol facts verified against the deployed Arbitrum One
 * contract configuration and production Solidity defaults.
 *
 * Source of truth:
 * - Proxy: 0x6a714Ae7B5b6eA520F6BCA23d2E609C4Fd5863F2
 * - Implementation: 0x50eB3d05d2C463949DE9238D419385594f7AdB97
 * - Sourcify match: "perfect" for chain 42161
 *
 * Typical per-cycle imprint totals:
 * - 24 Cosmic Signature NFTs = 4 role NFTs + 10 participant Stellar NFTs
 *   + 10 anchored-RWLK Stellar NFTs.
 * - 27,000 fixed CST = 24 NFT-paired 1,000 CST imprints + 3,000 CST outreach.
 *   Dynamic per-gesture CST imprints are additional and depend on gesture timing.
 */
export const protocolFacts = {
  contractAddresses: {
    proxy: '0x6a714Ae7B5b6eA520F6BCA23d2E609C4Fd5863F2',
    implementation: '0x50eB3d05d2C463949DE9238D419385594f7AdB97',
  },
  mainEthPercentage: 25,
  chronoWarriorEthPercentage: 8,
  stellarSelectionEthPercentage: 4,
  anchorDistributionPercentage: 6,
  publicGoodsPercentage: 7,
  ethStellarSelectionRecipients: 3,
  nftStellarSelectionRecipients: 10,
  anchoredRwlkNftSelectionRecipients: 10,
  dynamicCstRewardFormula:
    'floor(sqrt(elapsedSinceLastGesture * bidCstRewardAmountMultiplier / mainPrizeTimeIncrementInMicroSeconds))',
  dynamicCstRewardExamples: [
    { elapsed: '0 seconds', cst: '0' },
    { elapsed: '1 second', cst: '1.73' },
    { elapsed: '60 seconds', cst: '13.4' },
    { elapsed: '1 hour', cst: '104' },
    { elapsed: '1 day', cst: '509' },
  ],
  initialCstCalibrationWindowHours: 12,
  cstCalibrationWindowChangeDivisor: 250,
  cstCalibrationWindowIncreasePercentPerCstGesture: 0.4,
  cstCalibrationWindowDecreasePercentPerEthGesture: 0.398,
  specialAllocationCst: 1_000,
  outreachReserveCst: 3_000,
  roleNftsPerCycle: 4,
  stellarNftsPerCycle: 20,
  typicalNftsPerCycle: 24,
  typicalCstImprintsPerCycle: 27_000,
  finalGestureExclusivityHours: 48,
  secondaryRetrievalTimeoutWeeks: 5,
  randomWalkDiscountPercentage: 50,
  initialGestureCostEth: 0.0001,
  initialCycleTimeIncrementHours: 1,
  nextCycleDelayMinutes: 30,
  compoundingReservePercentage: 50,
} as const;
