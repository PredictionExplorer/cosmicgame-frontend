/**
 * Historical V2 facts retained for published whitepaper 1.0 editions.
 * Current-facing content uses protocolFacts below.
 *
 * Source of truth:
 * - Proxy: 0x6a714Ae7B5b6eA520F6BCA23d2E609C4Fd5863F2
 * - Implementation (CosmicSignatureGameV2): 0x50eB3d05d2C463949DE9238D419385594f7AdB97
 * - Sourcify match: "perfect" for chain 42161 (all contracts below are
 *   exact-match verified)
 * - Live values cross-checked with `scripts/audit-protocol-facts.ts`
 *
 * Typical per-cycle imprint totals:
 * - 24 Cosmic Signature NFTs = 4 role NFTs + 10 participant Stellar NFTs
 *   + 10 anchored-RWLK Stellar NFTs.
 * - 27,000 fixed CST = 24 NFT-paired 1,000 CST imprints + 3,000 CST outreach.
 *   Dynamic per-gesture CST imprints are additional and depend on gesture timing.
 *
 * Values named `...AtLaunch` or documented as "Solidity default" describe the
 * deployment-time configuration. The live values are stored on-chain and can
 * change (the time increment grows 1% per cycle automatically; several
 * parameters are owner-configurable between cycles). UI surfaces should
 * prefer live contract/API reads and use these facts as verified defaults.
 */
export const historicalV2ProtocolFacts = {
  contractAddresses: {
    proxy: '0x6a714Ae7B5b6eA520F6BCA23d2E609C4Fd5863F2',
    implementation: '0x50eB3d05d2C463949DE9238D419385594f7AdB97',
    cstToken: '0xAD91843e6A58Ba560F577E676986AFb1dba6FBA0',
    cosmicSignatureNft: '0xbb84Be3500A63581d3F2d5AC3bdF8685AAedad25',
    randomWalkNft: '0x895a6F444BE4ba9d124F61DF736605792B35D66b',
    cosmicCouncil: '0xF3D52E1c681949be7E624778dB13DaD7F8c729db',
    publicGoodsVault: '0x96bB0ADB414d5350f435E52f94946B6C7A0760a9',
    outreachReserve: '0xa3802c799f5e3D3D3562A9B513a41C6aAF92e25e',
    allocationsWallet: '0xE1b619e9B39ea4109D2F429Ea5eAA307759b0011',
    cosmicSignatureNftAnchoringWallet: '0x6308A405B4FF1eA890870Efe2a6D036750B81F7C',
    rwlkAnchoringWallet: '0x5EB3396092841E6c5b0b51141699F6711E830529',
  },
  /**
   * Where the Public Goods Vault sends its retrievals: `charityAddress()` on the
   * vault (read 2026-09-23), which the site names Protocol Guild. The owner can
   * change it, so pages name an address only when it matches this one and show
   * any other address as hex.
   */
  publicGoodsBeneficiary: {
    name: 'Protocol Guild',
    address: '0xdddd576bAF106bAAe54bDE40BCac602bB4a7cf79',
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
  /**
   * The same rule for readers, with neutral symbols: Δt is the seconds since
   * the previous gesture, m the Participation CST multiplier and i the cycle
   * time increment in microseconds. Reader-facing copy shows this and keeps
   * the contract identifiers above for verification.
   */
  participationCstNotation: 'CST = ⌊√(Δt × m ÷ i)⌋',
  /**
   * The notation's symbols, in legend order. Copy interpolates them rather
   * than typing Δ: the display face has no Greek, and copy modules must stay
   * in the letters it covers (lib/__tests__/display-font-coverage.test.ts).
   */
  participationCstSymbols: ['Δt', 'm', 'i'],
  /**
   * Computed at the launch parameters (time increment = exactly 1 hour).
   * The increment grows 1% per cycle, so live amounts drift slightly lower
   * over time; the app preview and the contract are the source of truth.
   */
  dynamicCstRewardExamples: [
    { elapsed: '0 seconds', cst: '0' },
    { elapsed: '1 second', cst: '1.73' },
    { elapsed: '60 seconds', cst: '13.4' },
    { elapsed: '1 hour', cst: '104' },
    { elapsed: '1 day', cst: '509' },
  ],
  dynamicCstRewardExamplesAssumeIncrementHours: 1,
  initialCstCalibrationWindowHours: 12,
  cstCalibrationWindowChangeDivisor: 250,
  cstCalibrationWindowIncreasePercentPerCstGesture: 0.4,
  cstCalibrationWindowDecreasePercentPerEthGesture: 0.398,
  /** CST Calibration Window ceiling = 2x the last CST Gesture Cost paid. */
  cstCalibrationCeilingMultiplier: 2,
  /** The CST Calibration ceiling never starts below 200 CST (Solidity default). */
  cstCalibrationCeilingMinCst: 200,
  /** CST Gesture Cost descends linearly to zero when the window fully elapses. */
  cstCalibrationFloorCst: 0,
  /** ETH Calibration Window ceiling = 2x the previous cycle's opening ETH Gesture Cost. */
  ethCalibrationCeilingMultiplier: 2,
  /** ETH Calibration floor = ceiling / 200 (+1 wei); live divisor is on-chain. */
  ethCalibrationFloorDivisor: 200,
  /** Each ETH gesture raises the next ETH Gesture Cost by 1% (+1 wei). */
  ethGestureCostStepUpPercent: 1,
  specialAllocationCst: 1_000,
  outreachReserveCst: 3_000,
  /**
   * Cosmic Signature NFTs imprinted for the Signature Allocation recipient.
   * V3 raises this to 3 (`v3.mainPrizeNftsPerCycleDefault`); static copy must
   * read `nftAllocationFacts.mainPrizeNfts` rather than assuming either value.
   */
  mainPrizeNftsPerCycle: 1,
  roleNftsPerCycle: 4,
  stellarNftsPerCycle: 20,
  typicalNftsPerCycle: 24,
  typicalCstImprintsPerCycle: 27_000,
  finalGestureExclusivityHours: 48,
  secondaryRetrievalTimeoutWeeks: 5,
  randomWalkDiscountPercentage: 50,
  initialGestureCostEth: 0.0001,
  initialCycleTimeIncrementHours: 1,
  /**
   * The time increment grows by exactly 1% each cycle
   * (mainPrizeTimeIncrementIncreaseDivisor = 100, applied at finalization).
   */
  cycleTimeIncrementIncreasePercentPerCycle: 1,
  /** Initial Cycle Finalization Time at launch: increment x ~24 (about one day). */
  initialCycleFinalizationHoursAtLaunch: 24,
  /**
   * Solidity default only. The live delay before the next cycle activates is
   * stored on-chain (`delayDurationBeforeRoundActivation`) and is
   * owner-configurable at any time; it can differ substantially from this
   * default. Never present this value as the live delay.
   */
  defaultNextCycleDelayMinutes: 30,
  compoundingReservePercentage: 50,
  /** Every NFT (Cosmic Signature or RandomWalk) can be anchored only once, ever. */
  anchoringOncePerNft: true,
  gestureMessageMaxLength: 280,
  councilVotingDelayDays: 2,
  councilVotingPeriodWeeks: 2,
  councilProposalThresholdCst: 100,
  councilQuorumPercent: 3,
  /**
   * CosmicSignatureGameV3 settings, installed on Arbitrum One on October 21, 2026.
   * Live contract reads remain authoritative for owner-configurable values.
   *
   * Verified against the v3.1-2026-10-13 deployment branch Solidity defaults at
   * commit 9d1a6447 (`CosmicSignatureConstants.sol`). Values are unchanged from
   * the earlier v3-2026-07-24 verification at commit 51221556; that branch only
   * added the two Calibration Window safeguards noted below.
   */
  v3: {
    /** Linear Participation CST (replaces the V2 sqrt formula). */
    dynamicCstRewardFormula:
      'elapsedSinceLastGesture * bidCstRewardAmountMultiplier / mainPrizeTimeIncrementInMicroSeconds',
    /** Reader notation of the linear rule, same symbols as `participationCstSymbols`. */
    participationCstNotation: 'CST units = floor(Δt × m ÷ i)',
    /**
     * Computed at the launch parameters (time increment = exactly 1 hour,
     * accrual ~1 CST per minute). The increment grows 1% per cycle, so live
     * amounts drift slightly lower over time; the app preview and the
     * contract are the source of truth.
     */
    dynamicCstRewardExamples: [
      { elapsed: '0 seconds', cst: '0' },
      { elapsed: '1 second', cst: '0.017' },
      { elapsed: '60 seconds', cst: '1' },
      { elapsed: '1 hour', cst: '60' },
      { elapsed: '1 day', cst: '1,440' },
    ],
    /** Initial accrual with launch parameters: ~1 CST per minute (declines ~1% per cycle). */
    dynamicCstRewardPerMinuteAtLaunch: 1,
    /**
     * The entire Participation CST imprint is minted to the participant being
     * outbid (nothing is minted on a cycle's first gesture); the gesturer earns
     * the next gesture's full CST when someone outbids them.
     */
    cstRewardToOutbidParticipantPercent: 100,
    /** ETH distribution (reinitialize defaults): 20/15/5/5/5 = 50% paid, 50% rollover. */
    mainEthPercentage: 20,
    chronoWarriorEthPercentage: 15,
    stellarSelectionEthPercentage: 5,
    anchorDistributionPercentage: 5,
    publicGoodsPercentage: 5,
    /** CST Gesture Cost declines ~1 CST per minute at launch (cstBidPriceDeclineMultiplier ≈ 1 ether / 60 per second). */
    cstGestureCostDeclinePerMinuteAtLaunch: 1,
    /** The decline speed shifts ~1% per gesture (change divisor 100): up on ETH gestures, down on CST gestures. */
    cstGestureCostDeclineChangePercentPerGesture: 1,
    /** The CST Calibration ceiling floor drops from 200 CST to 1 CST at reinitialize. */
    cstCalibrationCeilingMinCst: 1,
    /**
     * Hard floor on the CST Calibration Window (CST_DUTCH_AUCTION_DURATION_MIN_LIMIT,
     * not owner-configurable): a decline-speed increase from an ETH gesture is
     * skipped whenever it would let the cost reach zero in under 3 minutes.
     */
    cstCalibrationWindowMinMinutes: 3,
    /**
     * After a CST gesture the next Calibration Ceiling restarts at
     * max(2 x the premium-free CST base cost, the 1 CST ceiling floor, decline speed x 3 minutes),
     * so the window never opens shorter than the 3-minute floor.
     */
    cstCalibrationCeilingRestartMultiplier: 2,
    /** Signature Allocation recipient receives this many sequential Cosmic Signature NFTs. */
    mainPrizeNftsPerCycleDefault: 3,
    /** 24 V2-era NFTs + 2 extra Signature Allocation NFTs; CST imprint totals are unchanged. */
    typicalNftsPerCycle: 26,
    /** Late-gesture window before the Cycle Finalization Time (Solidity default: ~20 minutes). */
    lateGestureWindowMinutesAtLaunch: 20,
    /** Gesture cost at the end of the late window is about 5x the unadjusted cost. */
    lateGestureMaxCostMultiplier: 5,
    /**
     * The late-window premium is a one-time toll on the gesture that pays it:
     * subsequent posted costs resume from the premium-free base once the
     * window closes.
     */
    lateGesturePremiumIsOneTimeToll: true,
    /** Both participant Stellar Selections use each gesture's undiscounted, premium-free ETH base cost as weight. */
    weightedStellarSelection: true,
  },
} as const;

/**
 * Current V3 snapshot checked at Arbitrum One block 517046699 (October 21, 2026).
 * The implementation runtime matches the reviewed production artifact. Public
 * source verification is a separate status: V3 is not verified on Sourcify.
 * Legacy duration fields are retained for V2 compatibility only; V3 uses a rate.
 */
export const protocolFacts = {
  ...historicalV2ProtocolFacts,
  contractAddresses: {
    ...historicalV2ProtocolFacts.contractAddresses,
    implementation: '0xc1b97E1b0baC86248653B18706dbC5c8898c5c06',
  },
  mainEthPercentage: 20,
  chronoWarriorEthPercentage: 15,
  stellarSelectionEthPercentage: 5,
  anchorDistributionPercentage: 5,
  publicGoodsPercentage: 5,
  mainPrizeNftsPerCycle: 3,
  roleNftsPerCycle: 6,
  typicalNftsPerCycle: 26,
  nftBearingAllocations: 24,
  participationCstRewardMultiplier: '60000000000000000000000000',
  dynamicCstRewardFormula: historicalV2ProtocolFacts.v3.dynamicCstRewardFormula,
  participationCstNotation: historicalV2ProtocolFacts.v3.participationCstNotation,
  dynamicCstRewardExamples: historicalV2ProtocolFacts.v3.dynamicCstRewardExamples,
  cstCalibrationCeilingMinCst: 1,
  cstDeclineRateChangeDivisor: 100,
  cstCalibrationRestartMinimumSeconds: 180,
  currentNextCycleDelayDays: 7,
} as const;

/** V3 is deployed. Only an explicit V2 environment opts into historical copy. */
export const contractMechanicsVersion: 2 | 3 =
  process.env.NEXT_PUBLIC_CONTRACT_MECHANICS_VERSION === '2' ? 2 : 3;

/** True once the copy should describe V3 mechanics (linear CST accrual, reward split, multi-NFT allocation). */
export const isV3Mechanics = contractMechanicsVersion === 3;

/**
 * Version-appropriate dynamic Participation CST facts. Static content must use
 * this instead of reading `protocolFacts.dynamicCstRewardFormula` directly, so
 * that FAQ/learn/landing/legal copy flips from the V2 square-root wording to
 * the V3 linear wording together with `contractMechanicsVersion`.
 */
/**
 * Version-appropriate ETH distribution percentages. Static content must use
 * this instead of reading `protocolFacts.mainEthPercentage` (etc.) directly,
 * so that copy flips from the live V2 split (25/8/4/6/7) to the V3 reinitialize
 * defaults (20/15/5/5/5) together with `contractMechanicsVersion`. Both splits
 * pay out 50% and roll the remaining 50% into the next cycle.
 */
export const ethDistributionFacts: {
  mainEthPercentage: number;
  chronoWarriorEthPercentage: number;
  stellarSelectionEthPercentage: number;
  anchorDistributionPercentage: number;
  publicGoodsPercentage: number;
} = isV3Mechanics
  ? {
      mainEthPercentage: protocolFacts.v3.mainEthPercentage,
      chronoWarriorEthPercentage: protocolFacts.v3.chronoWarriorEthPercentage,
      stellarSelectionEthPercentage: protocolFacts.v3.stellarSelectionEthPercentage,
      anchorDistributionPercentage: protocolFacts.v3.anchorDistributionPercentage,
      publicGoodsPercentage: protocolFacts.v3.publicGoodsPercentage,
    }
  : {
      mainEthPercentage: historicalV2ProtocolFacts.mainEthPercentage,
      chronoWarriorEthPercentage: historicalV2ProtocolFacts.chronoWarriorEthPercentage,
      stellarSelectionEthPercentage: historicalV2ProtocolFacts.stellarSelectionEthPercentage,
      anchorDistributionPercentage: historicalV2ProtocolFacts.anchorDistributionPercentage,
      publicGoodsPercentage: historicalV2ProtocolFacts.publicGoodsPercentage,
    };

export const cstRewardFacts: {
  formula: string;
  /** Reader notation of the rule; the symbols are `protocolFacts.participationCstSymbols` in both versions. */
  notation: string;
  /** Keeps the literal elapsed labels so locale copy can index its translation map by them. */
  examples:
    | typeof historicalV2ProtocolFacts.dynamicCstRewardExamples
    | typeof protocolFacts.v3.dynamicCstRewardExamples;
  /** 'sqrt' = V2 (sublinear, slowing growth); 'linear' = V3 (constant accrual rate). */
  curve: 'sqrt' | 'linear';
} = isV3Mechanics
  ? {
      formula: protocolFacts.v3.dynamicCstRewardFormula,
      notation: protocolFacts.v3.participationCstNotation,
      examples: protocolFacts.v3.dynamicCstRewardExamples,
      curve: 'linear',
    }
  : {
      formula: historicalV2ProtocolFacts.dynamicCstRewardFormula,
      notation: historicalV2ProtocolFacts.participationCstNotation,
      examples: historicalV2ProtocolFacts.dynamicCstRewardExamples,
      curve: 'sqrt',
    };

/**
 * Version-appropriate Cosmic Signature NFT counts. Static content must use this
 * instead of spelling out "one Cosmic Signature NFT" or reading
 * `protocolFacts.typicalNftsPerCycle` directly, so that FAQ/learn/landing/legal
 * copy follows `contractMechanicsVersion` the way the live UI already does.
 *
 * Only the Signature Allocation changes in V3: it mints
 * `v3.mainPrizeNftsPerCycleDefault` sequential NFTs instead of one. Every other
 * track (Endurance Champion, Chrono-Warrior, Final CST Gesture, and both
 * Stellar Selections) still mints exactly one, so copy describing those must
 * keep saying "one" and must not use `mainPrizeNfts`.
 *
 * The extra V3 NFTs carry no extra CST: the number of NFT-bearing allocations
 * stays at `nftBearingAllocations`, which is why `typicalCstImprintsPerCycle`
 * is unchanged between the two versions.
 */
export const nftAllocationFacts: {
  /** NFTs imprinted for the Signature Allocation recipient (V2: 1, V3: 3). */
  mainPrizeNfts: number;
  /** Total NFTs imprinted in a typical cycle across every track (V2: 24, V3: 26). */
  typicalNftsPerCycle: number;
  /** Allocations that each pair an NFT with `specialAllocationCst`. Same in both versions. */
  nftBearingAllocations: number;
  /** Ready-made noun phrase for the Signature Allocation NFTs, per locale (zhHant serves zh-TW and zh-HK). */
  mainPrizeNftPhrase: { en: string; zh: string; zhHant: string; uk: string };
  /** Bare cardinal for `mainPrizeNfts`, for prose that supplies its own noun. */
  mainPrizeNftsWord: { en: string; zh: string; zhHant: string; uk: string };
} = isV3Mechanics
  ? {
      mainPrizeNfts: protocolFacts.v3.mainPrizeNftsPerCycleDefault,
      typicalNftsPerCycle: protocolFacts.v3.typicalNftsPerCycle,
      nftBearingAllocations: historicalV2ProtocolFacts.typicalNftsPerCycle,
      mainPrizeNftPhrase: {
        en: 'three sequential Cosmic Signature NFTs',
        zh: '3 枚连续编号的 Cosmic Signature NFT',
        zhHant: '3 枚連續編號的 Cosmic Signature NFT',
        uk: '3 послідовні Cosmic Signature NFT',
      },
      mainPrizeNftsWord: { en: 'three', zh: '3', zhHant: '3', uk: '3' },
    }
  : {
      mainPrizeNfts: historicalV2ProtocolFacts.mainPrizeNftsPerCycle,
      typicalNftsPerCycle: historicalV2ProtocolFacts.typicalNftsPerCycle,
      nftBearingAllocations: historicalV2ProtocolFacts.typicalNftsPerCycle,
      mainPrizeNftPhrase: {
        en: 'one Cosmic Signature NFT',
        zh: '1 枚 Cosmic Signature NFT',
        zhHant: '1 枚 Cosmic Signature NFT',
        uk: '1 Cosmic Signature NFT',
      },
      mainPrizeNftsWord: { en: 'one', zh: '1', zhHant: '1', uk: '1' },
    };

/**
 * English edition 1.3 snapshot: Arbitrum One block 517046699,
 * 2026-10-21 22:29:53 UTC. V3 source: CosmicSignatureGameV3,
 * BiddingV3, MainPrizeV3 and CosmicSignatureConstants.
 * Kept separate so the published translated 1.0 editions remain citable.
 */
export const whitePaperV13Facts = {
  ...protocolFacts,
  contractAddresses: {
    ...protocolFacts.contractAddresses,
    implementation: '0xc1b97E1b0baC86248653B18706dbC5c8898c5c06',
  },
  mainEthPercentage: 20,
  chronoWarriorEthPercentage: 15,
  stellarSelectionEthPercentage: 5,
  anchorDistributionPercentage: 5,
  publicGoodsPercentage: 5,
  mainAllocationNfts: 3,
  roleNftsPerCycle: 6,
  typicalNftsPerCycle: 26,
  cstCalibrationCeilingMinCst: 1,
  cstDeclineRateChangeDivisor: 100,
  cstRestartMinimumSeconds: 180,
  nextCycleDelayDaysAtSnapshot: 7,
  currentCycleIncrementMicroseconds: 3_709_083_600,
  lateWindowSecondsAtSnapshot: 1_236,
  lateWindowDurationDivisor: 3_000_000,
  latePremiumBaseMultiplier: 29_228_998_656,
  latePremiumExponent: 8,
  dynamicCstRewardFormula: 'floor(elapsedSeconds * multiplier / incrementMicroseconds)',
  participationCstNotation: 'CST units = floor(t * m / i)',
  participationCstSymbols: ['t', 'm', 'i'],
  dynamicCstRewardExamples: [
    { elapsed: '0 seconds', cst: '0' },
    { elapsed: '1 second', cst: '0.0167' },
    { elapsed: '60 seconds', cst: '1' },
    { elapsed: '1 hour', cst: '60' },
    { elapsed: '1 day', cst: '1,440' },
  ],
} as const;
