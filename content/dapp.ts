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
 *   raffle     -> Stellar Selection
 *   winner     -> Recipient
 *   staking    -> Anchoring
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
} as const;

export type DappContent = typeof dappContent;
