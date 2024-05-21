export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const NetworkContextName = 'NETWORK'

export const IS_IN_IFRAME =
  typeof window !== 'undefined' && window.parent !== window

export const ADMIN_EVENTS = [
  { name: 'Undefined', description: 'Undefined' },
  { name: 'CharityPercentageChanged', description: 'The allocation percentage for the funds designated to the Charity wallet has been changed.' },
  { name: 'PrizePercentageChanged', description: 'The allocation percentage for funds designated for prize rewards has been changed.' },
  { name: 'RafflePercentageChanged', description: 'The allocation percentage for funds designated for raffle rewards has been changed.' },
  { name: 'StakingPercentageChanged', description: 'The allocation percentage for funds designated for staking rewards has been changed.' },
  { name: 'NumRaffleWinnersPerRoundChanged', description: 'The number of raffle winners per round has been changed.' },
  { name: 'NumRaffleNFTWinnersPerRoundChanged', description: 'The number of raffle NFT winners per round has been changed.' },
  { name: 'NumHolderNFTWinnersPerRoundChanged', description: 'The number of winners for holding NFTs has been changed.' },
  { name: 'CharityAddressChanged', description: 'The address of the charity wallet has been changed.' },
  { name: 'RandomWalkAddressChanged', description: 'The address of the RandomWalkNFT contract has been changed.' },
  { name: 'RaffleWalletAddressChanged', description: 'The address of the raffle wallet has been changed.' },
  { name: 'StakingWalletAddressChanged', description: 'The address of the staking wallet has been changed.' },
  { name: 'MarketingWalletAddressChanged', description: 'The address of the marketing wallet has been changed.' },
  { name: 'CosmicTokenAddressChanged', description: 'The address of the Cosmic Token (ERC-20) contract has been changed.' },
  { name: 'CosmicSignatureAddressChanged', description: 'The address of the Cosmic Signature Token (ERC-721) contract has been changed.' },
  { name: 'BusinessLogicAddressChanged', description: 'The address of the business logic contract has been changed.' },
  { name: 'TimeIncreaseChanged', description: 'The ratio of the time increasement has been changed.' },
  { name: 'TimeoutClaimPrizeChanged', description: 'The time out for claiming prize has been changed.' },
  { name: 'PriceIncreaseChanged', description: 'The ratio of the bid price increasement has been changed.' },
  { name: 'NanoSecondsExtraChanged', description: 'The value for the increment of prize time after every bid has been changed.' },
  { name: 'InitialSecondsUntilPrizeChanged', description: 'The initial value of the time until prize has been changed.' },
  { name: 'InitialBidAmountFractionChanged', description: 'The initial bid amount fraction has been changed.' },
  { name: 'ActivationTimeChanged', description: 'The contract activation time has been changed.' },
  { name: 'ETHToCSTBidRatioChanged', description: 'The ratio of ETH to CST bid has been changed.' },
  { name: 'RoundStartCSTAuctionLengthChanged', description: 'The initial value for the duration of auction has been changed.' },
]
