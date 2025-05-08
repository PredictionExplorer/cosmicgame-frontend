export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const NetworkContextName = "NETWORK";

export const IS_IN_IFRAME =
  typeof window !== "undefined" && window.parent !== window;

export const ADMIN_EVENTS = [
  { name: "Undefined", description: "Undefined" },
  {
    name: "CharityPercentageChanged",
    type: "percentage",
    description:
      "The allocation percentage for the funds designated to the Charity wallet has been changed.",
  },
  {
    name: "PrizePercentageChanged",
    type: "percentage",
    description:
      "The allocation percentage for funds designated for prize rewards has been changed.",
  },
  {
    name: "RafflePercentageChanged",
    type: "percentage",
    description:
      "The allocation percentage for funds designated for raffle rewards has been changed.",
  },
  {
    name: "StakingPercentageChanged",
    type: "percentage",
    description:
      "The allocation percentage for funds designated for staking rewards has been changed.",
  },
  {
    name: "NumRaffleWinnersPerRoundChanged",
    type: "number",
    description: "The number of raffle winners per round has been changed.",
  },
  {
    name: "NumRaffleNFTWinnersPerRoundChanged",
    type: "number",
    description: "The number of raffle NFT winners per round has been changed.",
  },
  {
    name: "DelayDurationBeforeRoundActivationChanged",
    type: "time",
    description: "",
  },
  {
    name: "NumRaffleNFTWinnersStakingRWalkChanged",
    type: "number",
    description:
      "The number of raffle NFT winners for staking RandomWalk NFTs has been changed.",
  },
  {
    name: "CharityAddressChanged",
    type: "address",
    description: "The address of the charity wallet has been changed.",
  },
  {
    name: "RandomWalkAddressChanged",
    type: "address",
    description: "The address of the RandomWalkNFT contract has been changed.",
  },
  {
    name: "PrizeWalletAddressChanged",
    type: "address",
    description: "The address of the raffle wallet has been changed.",
  },
  {
    name: "StakingWalletAddressChanged",
    type: "address",
    description: "The address of the staking wallet has been changed.",
  },
  {
    name: "StakingWalletRWalkAddressChanged",
    type: "address",
    description:
      "The address of the RandomWalk NFT staking wallet has been changed.",
  },
  {
    name: "MarketingWalletAddressChanged",
    type: "address",
    description: "The address of the marketing wallet has been changed.",
  },
  {
    name: "CosmicTokenAddressChanged",
    type: "address",
    description:
      "The address of the Cosmic Token (ERC-20) contract has been changed.",
  },
  {
    name: "CosmicSignatureAddressChanged",
    type: "address",
    description:
      "The address of the Cosmic Signature Token (ERC-721) contract has been changed.",
  },
  { name: "Upgraded", type: "", description: "" },
  {
    name: "TimeIncreaseChanged",
    type: "number",
    description: "The ratio of the time increasement has been changed.",
  },
  {
    name: "TimeoutClaimPrizeChanged",
    type: "time",
    description: "The time out for claiming prize has been changed.",
  },
  {
    name: "PriceIncreaseChanged",
    type: "number",
    description: "The ratio of the bid price increasement has been changed.",
  },
  {
    name: "NanoSecondsExtraChanged",
    type: "time",
    description:
      "The value for the increment of prize time after every bid has been changed.",
  },
  { name: "InitialBidAmountFractionChanged", type: "number", description: "" }, // have to remove this event
  {
    name: "InitialSecondsUntilPrizeChanged",
    type: "time",
    description: "The initial value of the time until prize has been changed.",
  },
  {
    name: "ActivationTimeChanged",
    type: "timestamp",
    description: "The round activation time has been changed.",
  },
  {
    name: "RoundStartCSTAuctionLengthChanged",
    type: "number",
    description: "",
  },
  { name: "Erc20RewardMultiplierChanged", type: "number", description: "" },
  {
    name: "StartingBidPriceCSTMinLimitChanged",
    type: "number",
    description: "",
  },
  { name: "MarketingRewardChanged", type: "number", description: "" },
  { name: "TokenRewardChanged", type: "number", description: "" },
  { name: "MaxMessageLengthChanged", type: "number", description: "" },
  { name: "TokenGenerationScriptURLEvent", type: "url", description: "" },
  { name: "BaseURI (CosmicSignature)", type: "url", description: "" },
  {
    name: "Initialized (Initialized event, openzeppelin)",
    type: "",
    description: "Contract initialization completed",
  },
  { name: "OwnershipTransferred", type: "address", description: "" },
  {
    name: "TimeoutDurationToWithdrawPrizesChanged",
    type: "time",
    description: "",
  },
  {
    name: "EthDutchAuctionDurationDivisorChanged",
    type: "number",
    description: "",
  },
  {
    name: "EthDutchAuctionEndingBidPriceDivisorChanged",
    type: "number",
    description: "",
  },
  {
    name: "ChronoWarriorEthPrizeAmountPercentageChanged",
    type: "number",
    description: "",
  },
];
