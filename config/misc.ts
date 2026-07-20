export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

/**
 * Coordination-parameter event catalog, indexed positionally by the backend's
 * `RecordType` enum (see AdminEventsTable). DO NOT reorder or insert entries
 * mid-array; append only, matching backend enum additions. Names reflect the
 * indexer's event vocabulary (V1-era); the V2 contract emits renamed events
 * (e.g. MainPrizeTimeIncrementInMicroSecondsChanged) that the backend maps
 * onto these same RecordType slots.
 */
export const ADMIN_EVENTS = [
  { name: 'Undefined', messageKey: 'undefined', description: 'Undefined' },
  {
    name: 'CharityPercentageChanged',
    messageKey: 'publicGoodsPercentage',
    type: 'percentage',
    description:
      'The allocation percentage for the funds designated to the Public Goods Vault has been changed.',
  },
  {
    name: 'PrizePercentageChanged',
    messageKey: 'signatureAllocationPercentage',
    type: 'percentage',
    description:
      'The allocation percentage for funds designated for allocation rewards has been changed.',
  },
  {
    name: 'RafflePercentageChanged',
    messageKey: 'stellarSelectionPercentage',
    type: 'percentage',
    description:
      'The allocation percentage for funds designated for Stellar Selection distributions has been changed.',
  },
  {
    name: 'StakingPercentageChanged',
    messageKey: 'anchorDistributionPercentage',
    type: 'percentage',
    description:
      'The allocation percentage for funds designated for anchor distributions has been changed.',
  },
  {
    name: 'NumRaffleWinnersPerRoundChanged',
    messageKey: 'stellarEthRecipients',
    type: 'number',
    description: 'The number of Stellar Selection recipients per cycle has been changed.',
  },
  {
    name: 'NumRaffleNFTWinnersPerRoundChanged',
    messageKey: 'stellarNftRecipients',
    type: 'number',
    description: 'The number of Stellar Selection NFT recipients per cycle has been changed.',
  },
  {
    name: 'DelayDurationBeforeRoundActivationChanged',
    messageKey: 'cycleActivationDelay',
    type: 'time',
    description: 'The delay duration time before cycle activation has been changed.',
  },
  {
    name: 'NumRaffleNFTWinnersStakingRWalkChanged',
    messageKey: 'anchoredRandomWalkRecipients',
    type: 'number',
    description:
      'The number of Stellar Selection NFT recipients for anchored RandomWalk NFTs has been changed.',
  },
  {
    name: 'CharityAddressChanged',
    messageKey: 'publicGoodsVaultAddress',
    type: 'address',
    description: 'The address of the public goods vault has been changed.',
  },
  {
    name: 'RandomWalkAddressChanged',
    messageKey: 'randomWalkContractAddress',
    type: 'address',
    description: 'The address of the RandomWalkNFT contract has been changed.',
  },
  {
    name: 'PrizeWalletAddressChanged',
    messageKey: 'allocationsWalletAddress',
    type: 'address',
    description: 'The address of the Allocations Wallet (allocation escrow) has been changed.',
  },
  {
    name: 'StakingWalletAddressChanged',
    messageKey: 'anchoringWalletAddress',
    type: 'address',
    description: 'The address of the anchoring wallet has been changed.',
  },
  {
    name: 'StakingWalletRWalkAddressChanged',
    messageKey: 'randomWalkAnchoringWalletAddress',
    type: 'address',
    description: 'The address of the RandomWalk NFT anchoring wallet has been changed.',
  },
  {
    name: 'MarketingWalletAddressChanged',
    messageKey: 'outreachWalletAddress',
    type: 'address',
    description: 'The address of the outreach wallet has been changed.',
  },
  {
    name: 'CosmicTokenAddressChanged',
    messageKey: 'cstContractAddress',
    type: 'address',
    description:
      'The address of the Cosmic Signature CST Token (ERC-20) contract has been changed.',
  },
  {
    name: 'CosmicSignatureAddressChanged',
    messageKey: 'cosmicSignatureNftAddress',
    type: 'address',
    description: 'The address of the Cosmic Signature NFT (ERC-721) contract has been changed.',
  },
  {
    name: 'Upgraded',
    messageKey: 'contractUpgrade',
    type: 'address',
    description: 'The CosmicSignature contract has been upgraded.',
  },
  {
    name: 'TimeIncreaseChanged',
    messageKey: 'timeIncreaseRatio',
    type: 'number',
    description: 'The ratio of the time increasement has been changed.',
  },
  {
    name: 'TimeoutClaimPrizeChanged',
    messageKey: 'finalizationTimeout',
    type: 'time',
    description: 'The timeout for finalizing allocation has been changed.',
  },
  {
    name: 'PriceIncreaseChanged',
    messageKey: 'gestureCostIncreaseRatio',
    type: 'number',
    description: 'The ratio of the gesture cost increasement has been changed.',
  },
  {
    name: 'NanoSecondsExtraChanged',
    messageKey: 'gestureTimeIncrement',
    type: 'time',
    description:
      'The value for the increment of allocation time after every gesture has been changed.',
  },
  {
    name: 'InitialDurationUntilMainPrizeDivisorChanged',
    messageKey: 'initialFinalizationDivisor',
    type: 'number',
    description:
      'The divisor used to derive the initial Cycle Finalization Time (mainPrizeTimeIncrementInMicroSeconds / divisor) has been changed.',
  },
  {
    name: 'TreasurerAddressChanged',
    messageKey: 'treasurerAddress',
    type: 'address',
    description: 'The address of the outreach wallet has been changed.',
  },
  {
    name: 'ActivationTimeChanged',
    messageKey: 'activationTime',
    type: 'timestamp',
    description: 'The cycle activation time has been changed.',
  },
  {
    name: 'RoundStartCSTAuctionLengthChanged',
    messageKey: 'cstCalibrationLength',
    type: 'number',
    description: 'The length of the starting CST Calibration Window has been changed.',
  },
  {
    name: 'Erc20RewardMultiplierChanged',
    messageKey: 'erc20Multiplier',
    type: 'number',
    description: 'The ERC20 reward multiplier has been changed.',
  },
  {
    name: 'StartingBidPriceCSTMinLimitChanged',
    messageKey: 'minimumCstGestureCost',
    type: 'number',
    description: 'The minimum limit for the starting gesture cost with CST has been changed.',
  },
  {
    name: 'MarketingRewardChanged',
    messageKey: 'outreachAllocationPercentage',
    type: 'percentage',
    description:
      'The allocation percentage for funds designated for outreach distributions has been changed.',
  },
  {
    name: 'TokenRewardChanged',
    messageKey: 'tokenAllocationPercentage',
    type: 'percentage',
    description:
      'The allocation percentage for funds designated for token rewards has been changed.',
  },
  {
    name: 'MaxMessageLengthChanged',
    messageKey: 'maxMessageLength',
    type: 'number',
    description: 'The max length of the gesture message has been changed.',
  },
  {
    name: 'TokenGenerationScriptURLEvent',
    messageKey: 'tokenScriptUrl',
    type: 'url',
    description: 'Token Generation Script URL has been changed.',
  },
  {
    name: 'BaseURI (CosmicSignature)',
    messageKey: 'nftBaseUri',
    type: 'url',
    description: 'CosmicSignature NFT BaseURI has been changed.',
  },
  {
    name: 'Initialized (Initialized event, openzeppelin)',
    messageKey: 'contractInitialized',
    type: 'number',
    description: 'Contract initialization completed',
  },
  {
    name: 'OwnershipTransferred',
    messageKey: 'ownershipTransferred',
    type: 'address',
    description: 'The ownership of the contract has been transferred.',
  },
  {
    name: 'TimeoutDurationToWithdrawPrizesChanged',
    messageKey: 'allocationRetrievalTimeout',
    type: 'time',
    description: 'The timeout duration to retrieve allocations has been changed.',
  },
  {
    name: 'EthDutchAuctionDurationDivisorChanged',
    messageKey: 'ethCalibrationDurationDivisor',
    type: 'number',
    description: 'The ETH Calibration Window duration has been changed.',
  },
  {
    name: 'EthDutchAuctionEndingBidPriceDivisorChanged',
    messageKey: 'ethCalibrationEndingCostDivisor',
    type: 'number',
    description: 'The divisor for ETH Calibration Window ending gesture cost has been changed.',
  },
  {
    name: 'ChronoWarriorEthPrizeAmountPercentageChanged',
    messageKey: 'chronoWarriorEthPercentage',
    type: 'number',
    description:
      'The allocation percentage for funds designated for chrono warrior ETH allocations has been changed.',
  },
];
