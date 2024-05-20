export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const NetworkContextName = 'NETWORK'

export const IS_IN_IFRAME =
  typeof window !== 'undefined' && window.parent !== window

export const ADMIN_EVENTS = [
  { name: 'Undefined', description: 'Undefined' },
  { name: 'CharityPercentageChanged', description: '' },
  { name: 'PrizePercentageChanged', description: '' },
  { name: 'RafflePercentageChanged', description: '' },
  { name: 'StakingPercentageChanged', description: '' },
  { name: 'NumRaffleWinnersPerRoundChanged', description: '' },
  { name: 'NumRaffleNFTWinnersPerRoundChanged', description: '' },
  { name: 'NumHolderNFTWinnersPerRoundChanged', description: '' },
  { name: 'CharityAddressChanged', description: '' },
  { name: 'RandomWalkAddressChanged', description: '' },
  { name: 'RaffleWalletAddressChanged', description: '' },
  { name: 'StakingWalletAddressChanged', description: '' },
  { name: 'MarketingWalletAddressChanged', description: '' },
  { name: 'CosmicTokenAddressChanged', description: '' },
  { name: 'CosmicSignatureAddressChanged', description: '' },
  { name: 'BusinessLogicAddressChanged', description: '' },
  { name: 'TimeIncreaseChanged', description: '' },
  { name: 'TimeoutClaimPrizeChanged', description: '' },
  { name: 'PriceIncreaseChanged', description: '' },
  { name: 'NanoSecondsExtraChanged', description: '' },
  { name: 'InitialSecondsUntilPrizeChanged', description: '' },
  { name: 'InitialBidAmountFractionChanged', description: '' },
  { name: 'ActivationTimeChanged', description: '' },
  { name: 'ETHToCSTBidRatioChanged', description: '' },
  { name: 'RoundStartCSTAuctionLengthChanged', description: '' },
]
