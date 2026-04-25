/**
 * Lexicon-safe strings for the dApp at app.cosmicsignature.com.
 *
 * This is the single source of truth for user-visible UI copy that has been
 * migrated to cosmic-primary vocabulary. Import from here rather than
 * hardcoding strings; string updates become a one-file review.
 *
 * Paired file: /content/landing.ts (root landing site at cosmicsignature.com).
 *
 * Vocabulary rules (see /marketing/cosmic-lexicon.md):
 *   bid        -> Gesture (primary) / Entry (neutral)
 *   prize      -> Allocation / Signature Allocation
 *   stellarSelection     -> Stellar Selection
 *   winner     -> Recipient
 *   anchoring    -> Anchoring
 *   yield      -> Anchor Distribution
 *   charity    -> Public Goods Beneficiary
 *   DAO        -> Cosmic Council
 *   withdraw   -> Retrieve
 *   round      -> Cycle
 *
 * NOTE: Banned in production copy: gambling, lottery, draw, bet, wager,
 * investor, investment, profit, ROI, dividend, tax-deductible, house,
 * ticket. These appear only in FAQ denial copy (with lexicon-allow-block).
 */

export const dappContent = {
  meta: {
    home: {
      title: 'Cosmic Signature \u00b7 Procedural On-Chain Art Protocol',
      description:
        'Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Make a gesture during a Performance Cycle; every gesture shapes the cycle\u2019s final Signature.',
    },
    gallery: {
      title: 'Gallery \u00b7 Cosmic Signature',
      description:
        'Explore every Cosmic Signature NFT \u2014 deterministic three-body orbits rendered spectrally on Arbitrum.',
    },
    currentCycle: {
      title: 'Current Cycle \u00b7 Cosmic Signature',
      description:
        'Live status of the active Performance Cycle: Gesture Cost, Cycle Finalization Time, and recent gestures.',
    },
    allocations: {
      title: 'Allocation Recipients \u00b7 Cosmic Signature',
      description:
        'Recipients of Signature Allocations, Chrono-Warrior Allocations, Anchor Distributions, and Stellar Selections by cycle.',
    },
    anchoring: {
      title: 'Anchor Distributions \u00b7 Cosmic Signature',
      description:
        'Anchor Cosmic Signature and Random Walk NFTs to the protocol to receive per-cycle ETH distributions.',
    },
    statistics: {
      title: 'Statistics \u00b7 Cosmic Signature',
      description:
        'Protocol statistics, cycle history, gesture activity, and allocation distribution data.',
    },
    faq: {
      title: 'Clarifications \u00b7 Cosmic Signature',
      description:
        'Questions worth answering plainly about Cosmic Signature \u2014 what the protocol is, how gestures work, and what it is not.',
    },
    howItWorks: {
      title: 'How It Works \u00b7 Cosmic Signature',
      description:
        'Learn how a Cosmic Signature Performance Cycle unfolds \u2014 from the Calibration Window to final allocation distribution.',
    },
    myAllocations: {
      title: 'My Allocations \u00b7 Cosmic Signature',
      description:
        'Your allocation retrievals, anchor distributions, and Stellar Selection entries.',
    },
    myAnchors: {
      title: 'My Anchors \u00b7 Cosmic Signature',
      description:
        'Your anchored Cosmic Signature and Random Walk NFTs and their per-cycle distributions.',
    },
    contracts: {
      title: 'Contracts \u00b7 Cosmic Signature',
      description: 'On-chain contract addresses for the Cosmic Signature protocol on Arbitrum.',
    },
    terms: {
      title: 'Terms \u00b7 Cosmic Signature',
      description: 'Terms of use for the Cosmic Signature procedural on-chain art protocol.',
    },
    privacy: {
      title: 'Privacy \u00b7 Cosmic Signature',
      description: 'Privacy practices for visitors to the Cosmic Signature protocol.',
    },
    tokenDetail: {
      titleFor: (id: string | number) => `Token #${id} \u00b7 Cosmic Signature`,
      descriptionFor: (id: string | number) =>
        `Attributes and ownership history of Cosmic Signature Token #${id} \u2014 a deterministic three-body NFT rendered spectrally on Arbitrum.`,
      fallbackDescription:
        'Unique generative NFT from the Cosmic Signature procedural on-chain art protocol, rendered from three-body physics.',
    },
    coordinationChanges: {
      title: 'Coordination Changes \u00b7 Cosmic Signature',
      description:
        'Complete history of protocol parameter adjustments in Cosmic Signature \u2014 gesture cost step-ups, cycle time additions, anchor distribution settings, and other coordination updates.',
    },
    distributionsByToken: {
      title: 'Distributions By Token \u00b7 Cosmic Signature',
      description:
        'Anchor Distribution details for a specific Cosmic Signature NFT \u2014 per-cycle ETH distribution history, retrieval status, and cumulative allocations.',
    },
    mint: {
      title: 'Imprint RandomWalk NFT \u00b7 Cosmic Signature',
      description:
        'Imprint a RandomWalk NFT on Cosmic Signature and unlock a 50% Gesture Cost discount. RandomWalk NFTs are unique generative collectibles that augment a cycle strategy.',
    },
    systemEvent: {
      title: 'System Events \u00b7 Cosmic Signature',
      description:
        'Protocol administration events and coordination parameter changes for a specific Cosmic Signature cycle.',
    },
    currentCycleFull: {
      title: 'Current Cycle \u00b7 Cosmic Signature',
      description:
        'Full details for the active Performance Cycle: gesture history, leaderboards, attached contributions, and allocation distribution.',
    },
    allocationInfo: {
      title: 'Allocation Information \u00b7 Cosmic Signature',
      description:
        'Detailed allocation information for a Cosmic Signature cycle \u2014 recipient details, Signature Allocation distribution, Stellar Selection results, and attached NFT allocations.',
    },
    anchorAction: {
      title: 'Anchor Action Detail \u00b7 Cosmic Signature',
      description:
        'Details of a specific anchor action in Cosmic Signature \u2014 token type, anchored amounts, and distribution retrieval status.',
    },
    pageTerms: {
      title: 'Terms \u00b7 Cosmic Signature',
      description:
        'Terms of Service for Cosmic Signature \u2014 eligibility, protocol mechanics, allocations, risks, prohibited activities, and legal terms.',
    },
    userStellarSelectionNft: {
      title: 'Stellar Selection NFTs \u00b7 Cosmic Signature',
      description:
        'All Cosmic Signature NFTs allocated to this participant through Stellar Selection. Browse NFTs received via on-chain random selection.',
    },
    userStellarSelectionEth: {
      title: 'Stellar Selection ETH \u00b7 Cosmic Signature',
      description:
        'All ETH allocations this participant received through Stellar Selection. Track random-selection allocations across completed cycles.',
    },
    publicGoodsCgContributions: {
      title: 'Protocol Public-Goods Contributions \u00b7 Cosmic Signature',
      description:
        'Automatic forwards from the Cosmic Signature protocol to the Public Goods Beneficiary. Each cycle, a fixed share of the Cycle Reserve is forwarded to support public goods via the Cosmic Council.',
    },
    publicGoodsRetrievals: {
      title: 'Public Goods Retrievals \u00b7 Cosmic Signature',
      description:
        'Retrievals from the Public Goods Vault. Each cycle, a share of the Cycle Reserve is forwarded to a beneficiary address selected by the Cosmic Council.',
    },
    publicGoodsVoluntary: {
      title: 'Voluntary Public-Goods Contributions \u00b7 Cosmic Signature',
      description:
        'Voluntary contributions to the Public Goods Vault from the Cosmic Signature community. Contributions support beneficiaries selected through Cosmic Council coordination.',
    },
    allocationRetrieved: {
      title: 'Retrieved Allocations \u00b7 Cosmic Signature',
      description:
        'Details of retrieved allocations from the Cosmic Signature protocol, including ETH receipts, Cosmic Signature NFT allocations, and Stellar Selection allocations.',
    },
    outreach: {
      title: 'Outreach Allocations \u00b7 Cosmic Signature',
      description:
        'Contribute to Cosmic Signature outreach and receive CST allocations. See top ecosystem contributors, allocation history, and how to take part.',
    },
    outreachAddress: {
      title: 'Outreach Allocations \u00b7 Cosmic Signature',
      description:
        'Outreach allocation history and CST allocations for a Cosmic Signature ecosystem contributor. Review referral activity and contributions.',
    },
    ethContribution: {
      title: 'Direct ETH Contributions \u00b7 Cosmic Signature',
      description:
        'Contribute ETH directly to the Cosmic Signature Public Goods Vault and view the complete contribution history. Support public goods while taking part in the protocol.',
    },
    ethContributionDetail: {
      title: 'Direct ETH Contribution Detail \u00b7 Cosmic Signature',
      description:
        'Details of a specific ETH contribution to the Cosmic Signature Public Goods Vault \u2014 contributor address, amount, cycle, and optional note.',
    },
    ethContributionByCycle: {
      title: 'Direct ETH Contributions by Cycle \u00b7 Cosmic Signature',
      description:
        'Direct ETH contributions to the Cosmic Signature protocol broken down by Performance Cycle.',
    },
    myStatistics: {
      title: 'My Statistics \u00b7 Cosmic Signature',
      description:
        'Track your performance in Cosmic Signature \u2014 gesture history, anchor status, anchor distributions, and cycle participation.',
    },
    usedRwlkNfts: {
      title: 'Used RandomWalk NFTs \u00b7 Cosmic Signature',
      description:
        'RandomWalk NFTs already used for a 50% Gesture Cost discount in Cosmic Signature. Each RandomWalk NFT can be used once per wallet.',
    },
    siteMap: {
      title: 'Site Map \u00b7 Cosmic Signature',
      description:
        'Navigate every section of the Cosmic Signature protocol \u2014 gestures, NFT gallery, anchoring, statistics, allocations, and public-goods contributions.',
    },
    nftDonations: {
      title: 'Attached NFTs \u00b7 Cosmic Signature',
      description:
        'NFTs attached to gestures as contributions to the Cosmic Signature protocol. Browse ERC-721 tokens attached by community members across cycles.',
    },
    namedNfts: {
      title: 'Named NFTs \u00b7 Cosmic Signature',
      description: 'Cosmic Signature NFTs that have been assigned a custom name by their owner.',
    },
    recipientHistory: {
      title: 'My Recipient History \u00b7 Cosmic Signature',
      description:
        'Your full allocation history: Signature Allocations, Chrono-Warrior Allocations, Anchor Distributions, and Stellar Selections received across all cycles.',
    },
    admin: {
      title: 'Admin \u00b7 Cosmic Signature',
      description: 'Administrative tools for the Cosmic Signature protocol.',
    },
  },

  wallet: {
    balances: {
      eth: 'ETH',
      cst: 'CST',
      cosmicNfts: 'COSMIC NFTs',
      rwlkNfts: 'RWLK NFTs',
      anchoredCst: 'Anchored CST NFTs',
      anchoredRwlk: 'Anchored RWLK NFTs',
    },
    labels: {
      loading: 'Loading\u2026',
      balancesHeading: 'Balances',
      anchoredHeading: 'Anchored',
    },
  },

  faqPage: {
    heading: 'Clarifications',
    description:
      'Questions worth answering plainly about Cosmic Signature \u2014 what the protocol is, how gestures work, and what it is not.',
  },

  errors: {
    generic: 'Something went off the star map. Please try again.',
    networkOffline: 'No network. Reconnect to continue.',
    walletNotConnected: 'Connect a Web3 wallet to make a gesture.',
    insufficientEth: 'Not enough ETH in your wallet for this gesture.',
    cycleClosed: 'This cycle has closed. The next Performance Cycle opens soon.',
  },

  toasts: {
    gestureSubmitted: 'Gesture submitted. Waiting for confirmation.',
    gestureConfirmed: 'Gesture confirmed. The cycle continues.',
    allocationRetrieved: 'Allocation retrieved to your wallet.',
    anchorSet: 'NFT anchored to the protocol.',
    anchorReleased: 'Anchor released.',
    cycleFinalized: 'Cycle finalized. Allocations distributed.',
  },

  statistics: {
    pageSubtitle: 'Historical data and overall metrics for the Cosmic Signature protocol',
    currentCycleLinkTitle: 'Looking for current cycle data?',
    currentCycleLinkSubtitle: 'View gesture history, leaderboards, and live cycle details',

    heroCards: {
      totalCycles: 'Total Cycles',
      totalCyclesTooltip: 'Total Performance Cycles completed since launch',
      allocationsDistributed: 'Allocations Distributed',
      allocationsDistributedTooltip:
        'Every allocation slot across all cycles. Includes protocol markers not attributed to a single recipient (e.g. Anchor Distribution deposits per cycle).',
      nftsImprinted: 'NFTs Imprinted',
      nftsImprintedTooltip: 'Total Cosmic Signature NFTs (ERC-721) imprinted across all cycles',
      contractBalance: 'Contract Balance',
      contractBalanceTooltip:
        'ETH held by the protocol smart contract, used to fund allocations and Stellar Selection',
    },

    sections: {
      protocolEconomy: 'Protocol Economy',
      communityParticipation: 'Community & Participation',
      tokenDistribution: 'Token Distribution',
      anchoring: 'Anchoring',
      systemEvents: 'System Events',
      cycleActivations: 'Cycle Activations',
    },

    groups: {
      allocationEconomy: 'Allocation Economy',
      tokenEconomy: 'Token Economy',
      publicGoodsContributions: 'Public Goods & Contributions',
    },

    anchoring: {
      cstAnchorHoldersLabel: 'Active CST Anchor-holders',
      cstAnchorHoldersTooltip: 'Wallets currently anchoring at least one Cosmic Signature NFT',
      rwlkAnchorHoldersLabel: 'Active RWLK Anchor-holders',
      rwlkAnchorHoldersTooltip: 'Wallets currently anchoring at least one RandomWalk Token',
      totalDistributionsLabel: 'Total Anchor Distributions',
      totalDistributionsTooltip: 'Total ETH distributed to Cosmic Signature NFT anchor-holders',
      cstOverview: 'CST Anchoring Overview',
      rwlkOverview: 'RWLK Anchoring Overview',
      numActiveAnchorHolders: 'Number of Active Anchor-holders',
      numActiveAnchorHoldersTooltipCst:
        'Wallets currently anchoring at least one Cosmic Signature Token',
      numActiveAnchorHoldersTooltipRwlk:
        'Wallets currently anchoring at least one RandomWalk Token',
      numDistributionDeposits: 'Number of Anchor-Distribution Deposits',
      numDistributionDepositsTooltip: 'Total distribution deposit events into the CST Anchor pool',
      totalDistributions: 'Total Anchor Distributions',
      totalDistributionsTooltipCst:
        'Total ETH distributed as Anchor Distributions to CST anchor-holders',
      totalTokensImprinted: 'Total Tokens Imprinted',
      totalTokensAnchored: 'Total Tokens Anchored',
      totalTokensAnchoredTooltipCst:
        'Number of Cosmic Signature Tokens currently anchored in the protocol',
      totalTokensAnchoredTooltipRwlk:
        'Number of RandomWalk Tokens currently anchored in the protocol',
      unretrievedDistributions: 'Unretrieved Anchor Distributions',
      unretrievedDistributionsTooltip:
        'Anchor Distributions allocated but not yet retrieved by anchor-holders',
      anchorReleaseActions: 'Anchor / Release Actions',
      anchoredTokens: 'Anchored Tokens',
      uniqueAnchorHolders: 'Unique Anchor-holders',
      cosmicSignatureToken: 'Cosmic Signature Token',
      randomWalkToken: 'RandomWalk Token',
    },

    allocationEconomy: {
      numAllocationsDistributed: 'Num Allocations Distributed',
      numAllocationsDistributedTooltip:
        'Total count of allocation rows across all cycles; falls back to aggregated recipient allocation counts when unavailable.',
      totalSignatureAllocationsDistributed: 'Total Signature Allocations Distributed',
      totalSignatureAllocationsDistributedTooltip:
        'Total ETH distributed as Signature Allocations to cycle recipients',
      stellarSelectionEthDeposited: 'Stellar Selection ETH Deposited',
      stellarSelectionEthDepositedTooltip:
        'Total ETH allocated to Stellar Selection pools across all cycles',
      stellarSelectionEthRetrieved: 'Stellar Selection ETH Retrieved',
      stellarSelectionEthRetrievedTooltip:
        'Total ETH retrieved by recipients from Stellar Selection pools',
      pendingRetrievalTemplate:
        '{count} recipients have yet to retrieve funds totaling {amount} ETH',
    },

    tokenEconomy: {
      nftsImprintedTooltip: 'Total Cosmic Signature NFTs (ERC-721) imprinted',
      totalCstConsumed: 'Total CST Consumed',
      totalCstConsumedTooltip:
        'Cosmic Signature Tokens consumed by participants when gesturing with CST',
      gesturesWithCst: 'Gestures with CST',
      gesturesWithCstTooltip:
        'Number of gestures made using Cosmic Signature Tokens instead of ETH',
      outreachReserve: 'Outreach Reserve',
      outreachReserveTooltip:
        'CST forwarded to ecosystem contributors who help promote the protocol',
      outreachTransactions: 'Outreach Transactions',
      randomWalkTokensUsed: 'RandomWalk Tokens Used',
      randomWalkTokensUsedTooltip: 'RandomWalk NFTs attached to gestures for cost reduction',
      namedTokens: 'Named Tokens',
      namedTokensTooltip: 'Cosmic Signature NFTs that have been given a custom name by their owner',
    },

    publicGoods: {
      balance: 'Public Goods Balance',
      balanceTooltip:
        'ETH allocated to the Public Goods Beneficiary, accumulated from protocol flows',
      protocolContractBalance: 'Protocol Contract Balance',
      protocolContractBalanceTooltip: 'ETH held by the Cosmic Signature protocol smart contract',
      attachedNfts: 'Attached NFTs',
      attachedNftsTooltip: 'ERC-721 tokens attached to gestures by community members',
      totalContributedEth: 'Total Contributed ETH',
      totalContributedEthTooltip: 'Total ETH contributed to the protocol across all cycles',
      protocolContributions: 'Protocol Contributions',
      protocolContributionsSum: 'Protocol Contributions Sum',
      voluntaryContributions: 'Voluntary Contributions',
      voluntaryContributionsTooltip: 'Contributions made voluntarily by community members',
      publicGoodsRetrievals: 'Public Goods Retrievals',
      totalPublicGoodsRetrieved: 'Total Public Goods Retrieved',
      totalPublicGoodsRetrievedTooltip: 'Total ETH retrieved from the Public Goods Vault',
    },

    community: {
      uniqueParticipants: 'Unique Participants',
      uniqueParticipantsTooltip:
        'Total unique wallet addresses that have made at least one gesture',
      uniqueRecipients: 'Unique Recipients',
      uniqueRecipientsTooltip:
        'Total unique wallet addresses that have retrieved at least one Signature Allocation',
      uniqueEthContributors: 'Unique ETH Contributors',
      uniqueEthContributorsTooltip: 'Unique addresses that have contributed ETH to the protocol',
      uniqueAnchorHolders: 'Unique Anchor-holders',
      uniqueAnchorHoldersTooltip: 'Combined unique CST and RandomWalk token anchor-holders',
    },

    tokenDistribution: {
      cosmicSignatureNftHolders: 'Cosmic Signature NFT Holders',
      cosmicSignatureNftHoldersTooltip:
        'Unique wallet addresses holding Cosmic Signature NFTs (ERC-721)',
      cstHolders: 'CST (ERC-20) Holders',
      cstHoldersTooltip: 'Unique wallet addresses holding CST tokens (ERC-20)',
      attachedNftsTooltip: 'Total ERC-721 tokens attached to gestures by community members',
      attachedTokenDistribution: 'Attached Token Distribution',
      cosmicSignatureToken721: 'Cosmic Signature Token (ERC-721)',
      cstBalanceDistribution: 'CST (ERC-20) Balance Distribution',
    },

    errorState: {
      title: 'Failed to load statistics',
      message: 'Please refresh the page to try again.',
    },
  },

  tables: {
    empty: {
      gestures: 'No gestures yet.',
      participants: 'No participants yet.',
      recipients: 'No recipients yet.',
      allocations: 'No allocations yet.',
      anchorActions: 'No anchor actions yet.',
      anchoredTokens: 'No anchored tokens yet.',
      contributions: 'No contributions yet.',
      publicGoods: 'No public goods activity yet.',
      stellarSelection: 'No Stellar Selection allocations yet.',
      attachedNfts: 'No attached NFTs yet.',
      attachedTokens: 'No attached tokens yet.',
      systemEvents: 'No system events yet.',
      retrievals: 'No retrievals yet.',
      generic: 'No data available.',
    },
    loading: 'Loading\u2026',
    columns: {
      cycle: 'Cycle',
      participant: 'Participant',
      recipient: 'Recipient',
      gestureCount: 'Gestures',
      allocation: 'Allocation',
      anchorActionId: 'Anchor Action ID',
      dateTime: 'Date & Time',
      amount: 'Amount',
      tokenId: 'Token ID',
      retrieved: 'Retrieved',
      status: 'Status',
      message: 'Message',
      contributor: 'Contributor',
      note: 'Note',
    },
  },

  home: {
    sectionTitles: {
      gestureForm: 'Make Your Gesture',
      gestureFormBody: 'Select gesture method and participate in the active cycle.',
      allocations: 'Cycle Allocations',
      viewCycle: 'View Full Cycle Details',
    },
    cta: {
      makeGesture: 'Gesture now',
      finalize: 'Finalize Cycle',
    },
    liveBar: {
      cycleLabel: 'Cycle',
      gesturesSuffix: 'gesture',
      gesturesPluralSuffix: 'gestures placed',
      previousCycleResults: 'Previous Cycle results',
      parameters: 'Parameters',
    },
    gestureForm: {
      methodLabel: 'Gesture Method',
      payWithEth: 'Pay with Ether',
      payWithCst: 'Pay with CST',
      attachedTokenLabel: 'Attached token',
      attachedNftLabel: 'Attached NFT',
      randomWalkLabel: 'Attach a RandomWalk NFT',
      randomWalkHelp:
        'Attach a Random Walk NFT for a 50% Gesture-Cost discount (one-time use per NFT).',
      messageLabel: 'Gesture message (optional)',
      submitEth: 'Make Gesture \u2014 ETH',
      submitCst: 'Make Gesture \u2014 CST',
    },
    round: {
      currentCycleLabel: 'Current Cycle',
      cycleOpensIn: 'Cycle opens in',
      cycleFinalizationIn: 'Performance closes in',
      totalGestures: 'Total Gestures',
      nextEthGestureCost: 'Next ETH Gesture Cost',
      nextCstGestureCost: 'Next CST Gesture Cost',
      lastParticipant: 'Last Participant',
      lastCstParticipant: 'Last CST Participant',
    },
  },
} as const;

export type DappContent = typeof dappContent;
