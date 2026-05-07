export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const ADMIN_EVENTS = [
  { name: 'Undefined', description: 'Undefined' },
  {
    name: 'CharityPercentageChanged',
    type: 'percentage',
    description:
      'The allocation percentage for the funds designated to the Public Goods Vault has been changed.',
  },
  {
    name: 'PrizePercentageChanged',
    type: 'percentage',
    description:
      'The allocation percentage for funds designated for allocation rewards has been changed.',
  },
  {
    name: 'RafflePercentageChanged',
    type: 'percentage',
    description:
      'The allocation percentage for funds designated for Stellar Selection distributions has been changed.',
  },
  {
    name: 'StakingPercentageChanged',
    type: 'percentage',
    description:
      'The allocation percentage for funds designated for anchor distributions has been changed.',
  },
  {
    name: 'NumRaffleWinnersPerRoundChanged',
    type: 'number',
    description: 'The number of Stellar Selection recipients per cycle has been changed.',
  },
  {
    name: 'NumRaffleNFTWinnersPerRoundChanged',
    type: 'number',
    description: 'The number of Stellar Selection NFT recipients per cycle has been changed.',
  },
  {
    name: 'DelayDurationBeforeRoundActivationChanged',
    type: 'time',
    description: 'The delay duration time before cycle activation has been changed.',
  },
  {
    name: 'NumRaffleNFTWinnersStakingRWalkChanged',
    type: 'number',
    description:
      'The number of Stellar Selection NFT recipients for anchored RandomWalk NFTs has been changed.',
  },
  {
    name: 'CharityAddressChanged',
    type: 'address',
    description: 'The address of the public goods vault has been changed.',
  },
  {
    name: 'RandomWalkAddressChanged',
    type: 'address',
    description: 'The address of the RandomWalkNFT contract has been changed.',
  },
  {
    name: 'PrizeWalletAddressChanged',
    type: 'address',
    description: 'The address of the stellar selection wallet has been changed.',
  },
  {
    name: 'StakingWalletAddressChanged',
    type: 'address',
    description: 'The address of the anchoring wallet has been changed.',
  },
  {
    name: 'StakingWalletRWalkAddressChanged',
    type: 'address',
    description: 'The address of the RandomWalk NFT anchoring wallet has been changed.',
  },
  {
    name: 'MarketingWalletAddressChanged',
    type: 'address',
    description: 'The address of the outreach wallet has been changed.',
  },
  {
    name: 'CosmicTokenAddressChanged',
    type: 'address',
    description: 'The address of the Cosmic Signature Token (ERC-20) contract has been changed.',
  },
  {
    name: 'CosmicSignatureAddressChanged',
    type: 'address',
    description: 'The address of the Cosmic Signature Token (ERC-721) contract has been changed.',
  },
  {
    name: 'Upgraded',
    type: 'address',
    description: 'The CosmicSignature contract has been upgraded.',
  },
  {
    name: 'TimeIncreaseChanged',
    type: 'number',
    description: 'The ratio of the time increasement has been changed.',
  },
  {
    name: 'TimeoutClaimPrizeChanged',
    type: 'time',
    description: 'The timeout for finalizing allocation has been changed.',
  },
  {
    name: 'PriceIncreaseChanged',
    type: 'number',
    description: 'The ratio of the gesture cost increasement has been changed.',
  },
  {
    name: 'NanoSecondsExtraChanged',
    type: 'time',
    description:
      'The value for the increment of allocation time after every gesture has been changed.',
  },
  {
    name: 'InitialDurationUntilMainPrizeDivisorChanged',
    type: 'number',
    description:
      'The divisor used to derive the initial Cycle Finalization Time (mainPrizeTimeIncrementInMicroSeconds / divisor) has been changed.',
  },
  {
    name: 'TreasurerAddressChanged',
    type: 'address',
    description: 'The address of the outreach wallet has been changed.',
  },
  {
    name: 'ActivationTimeChanged',
    type: 'timestamp',
    description: 'The cycle activation time has been changed.',
  },
  {
    name: 'RoundStartCSTAuctionLengthChanged',
    type: 'number',
    description: 'The length of the starting CST Calibration Window has been changed.',
  },
  {
    name: 'Erc20RewardMultiplierChanged',
    type: 'number',
    description: 'The ERC20 reward multiplier has been changed.',
  },
  {
    name: 'StartingBidPriceCSTMinLimitChanged',
    type: 'number',
    description: 'The minimum limit for the starting gesture cost with CST has been changed.',
  },
  {
    name: 'MarketingRewardChanged',
    type: 'percentage',
    description:
      'The allocation percentage for funds designated for outreach distributions has been changed.',
  },
  {
    name: 'TokenRewardChanged',
    type: 'percentage',
    description:
      'The allocation percentage for funds designated for token rewards has been changed.',
  },
  {
    name: 'MaxMessageLengthChanged',
    type: 'number',
    description: 'The max length of the gesture message has been changed.',
  },
  {
    name: 'TokenGenerationScriptURLEvent',
    type: 'url',
    description: 'Token Generation Script URL has been changed.',
  },
  {
    name: 'BaseURI (CosmicSignature)',
    type: 'url',
    description: 'CosmicSignature NFT BaseURI has been changed.',
  },
  {
    name: 'Initialized (Initialized event, openzeppelin)',
    type: 'number',
    description: 'Contract initialization completed',
  },
  {
    name: 'OwnershipTransferred',
    type: 'address',
    description: 'The ownership of the contract has been transferred.',
  },
  {
    name: 'TimeoutDurationToWithdrawPrizesChanged',
    type: 'time',
    description: 'The timeout duration to retrieve allocations has been changed.',
  },
  {
    name: 'EthDutchAuctionDurationDivisorChanged',
    type: 'number',
    description: 'The ETH Calibration Window duration has been changed.',
  },
  {
    name: 'EthDutchAuctionEndingBidPriceDivisorChanged',
    type: 'number',
    description: 'The divisor for ETH Calibration Window ending gesture cost has been changed.',
  },
  {
    name: 'ChronoWarriorEthPrizeAmountPercentageChanged',
    type: 'number',
    description:
      'The allocation percentage for funds designated for chrono warrior ETH allocations has been changed.',
  },
];
