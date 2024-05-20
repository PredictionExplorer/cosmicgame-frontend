export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const NetworkContextName = 'NETWORK'

export const IS_IN_IFRAME =
  typeof window !== 'undefined' && window.parent !== window

export const ADMIN_EVENTS = [
  'Undefined',
  'CharityPercentageChanged',
  'PrizePercentageChanged',
  'RafflePercentageChanged',
  'StakingPercentageChanged',
  'NumRaffleWinnersPerRoundChanged',
  'NumRaffleNFTWinnersPerRoundChanged',
  'NumHolderNFTWinnersPerRoundChanged',
  'CharityAddressChanged',
  'RandomWalkAddressChanged',
  'RaffleWalletAddressChanged',
  'StakingWalletAddressChanged',
  'MarketingWalletAddressChanged',
  'CosmicTokenAddressChanged',
  'CosmicSignatureAddressChanged',
  'BusinessLogicAddressChanged',
  'TimeIncreaseChanged',
  'TimeoutClaimPrizeChanged',
  'PriceIncreaseChanged',
  'NanoSecondsExtraChanged',
  'InitialSecondsUntilPrizeChanged',
  'InitialBidAmountFractionChanged',
  'ActivationTimeChanged',
  'ETHToCSTBidRatioChanged',
  'RoundStartCSTAuctionLengthChanged'
]
