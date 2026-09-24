import { protocolFacts } from '@/content/protocol-facts';

import type { HowItWorksText } from './structure';

/** English how-it-works copy, keyed by the skeleton in structure.ts. */
export const howItWorksTextEn = {
  metadata: {
    title: 'How Cosmic Signature Works | Performance Cycles, Gestures, and NFTs',
    description:
      'Learn how a Cosmic Signature Performance Cycle unfolds — from the Calibration Window through Gestures to final allocation distribution.',
  },
  jsonLd: {
    name: 'How Cosmic Signature Works',
    description:
      'Learn how a Cosmic Signature Performance Cycle unfolds — from the Calibration Window through Gestures to final allocation distribution.',
  },
  breadcrumbs: {
    homeLabel: 'Home',
    pageLabel: 'How It Works',
  },
  hero: {
    heading: 'How Cosmic Signature works',
    paragraph:
      'Gesture. Endure. Shape the Signature. Participants make gestures during a Performance Cycle. When the Cycle Finalization Time expires, the cycle can be finalized and allocations distribute across more than ten tracks — including the Signature Allocation, Anchor Distributions, and Protocol Guild.',
    primaryCtaLabel: 'Make a gesture',
    secondaryCtaLabel: 'See the live cycle',
  },
  rewardBreakdown: {
    heading: 'What a gesture can lead to',
    subhead: 'Participation CST and the allocation tracks available each cycle.',
    items: [
      {
        title: 'Dynamic Participation CST',
        description:
          'Each gesture may imprint CST based on how long it has been since the previous gesture.',
        tooltip: `Participation CST uses a square-root formula: ${protocolFacts.dynamicCstRewardFormula}. Rapid gestures can receive 0 CST; longer quiet periods create larger imprints.`,
      },
      {
        title: 'Stellar Selection entry',
        description:
          'Each gesture records an entry in Stellar Selection for end-of-cycle allocations.',
        tooltip: `When the cycle finalizes, entries are randomly selected: three participants share ${protocolFacts.stellarSelectionEthPercentage}% of the Cycle Reserve in ETH.`,
      },
      {
        title: 'Cosmic Signature NFT selection',
        description: `Ten participants receive ${protocolFacts.specialAllocationCst.toLocaleString('en-US')} CST and a unique Cosmic Signature NFT via Stellar Selection each cycle.`,
        tooltip: `Ten Stellar Selection recipients plus ten Random Walk NFT anchor-holders each receive ${protocolFacts.specialAllocationCst.toLocaleString('en-US')} CST and a Cosmic Signature NFT each cycle.`,
      },
      {
        title: 'Signature Allocation',
        description: `The participant who made the Final Gesture may retrieve ${protocolFacts.mainEthPercentage}% of the Cycle Reserve in ETH, ${protocolFacts.specialAllocationCst.toLocaleString('en-US')} CST, and a Cosmic Signature NFT.`,
        tooltip:
          'ETH gestures add to the Cycle Reserve. The participant who made the Final Gesture may finalize the cycle and retrieve the Signature Allocation through the protocol contract.',
      },
    ],
  },
  gameCycle: {
    heading: 'Lifecycle of a Performance Cycle',
    subhead: 'Every cycle follows this sequence from open to finalization.',
    phases: [
      {
        label: 'The cycle opens',
        description: `A new Performance Cycle begins. The first ETH Calibration Window opens, and the CST Calibration Window starts from a ${protocolFacts.initialCstCalibrationWindowHours}-hour reference that then changes with participation.`,
        tooltip:
          'Calibration Windows let participants gesture at falling cost. The Cycle Reserve starts at zero plus the Compounding Reserve from the previous cycle.',
      },
      {
        label: 'Participants gesture',
        description: `Each gesture adds the current time increment to Cycle Finalization Time. Participation CST is dynamic, and ETH/CST gestures move the CST Calibration Window by about ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}% down or ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}% up.`,
        tooltip:
          'Participation CST follows a square-root formula based on elapsed time since the previous gesture. The current app preview is the source of truth for the exact CST amount.',
      },
      {
        label: 'The Cycle Finalization Time expires',
        description:
          'When the countdown reaches zero, the participant who made the Final Gesture becomes eligible to finalize the cycle.',
        tooltip: `Gestures remain possible until finalization actually executes — a late gesture extends the stored time and takes over the Final Gesture position. The Final Gesture participant has a ${protocolFacts.finalGestureExclusivityHours}-hour exclusive finalization window; afterwards anyone may finalize and receives the Signature Allocation.`,
      },
      {
        label: 'The cycle finalizes',
        description: `The participant who made the Final Gesture retrieves the Signature Allocation: ${protocolFacts.mainEthPercentage}% of the Cycle Reserve, ${protocolFacts.specialAllocationCst.toLocaleString('en-US')} CST, and a Cosmic Signature NFT.`,
        tooltip:
          'The Signature Allocation retrieval happens via the protocol contract. The CST and Cosmic Signature NFT are imprinted automatically.',
      },
      {
        label: 'Stellar Selections',
        description: `Three ETH Stellar Selection recipients share ${protocolFacts.stellarSelectionEthPercentage}% of the Cycle Reserve. Ten NFT Stellar Selection recipients plus ten Anchored-NFT Stellar Selection recipients each receive ${protocolFacts.specialAllocationCst.toLocaleString('en-US')} CST and a Cosmic Signature NFT.`,
        tooltip:
          'Each gesture adds an entry. More entries increase the chance of selection but do not guarantee it. Anchored Random Walk NFTs take part in a separate Stellar Selection.',
      },
      {
        label: 'The next cycle begins',
        description:
          'About half of the Cycle Reserve rolls forward as the Compounding Reserve, and the next cycle begins with fresh Calibration Windows.',
        tooltip:
          'The Compounding Cycle Reserve means the protocol accumulates value rather than extracts it. The live contracts report the current window durations and costs.',
      },
    ],
  },
  payoff: {
    heading: 'Every cycle ends in a Signature',
    body: 'Every gesture shapes the cycle’s artwork. When the cycle finalizes, its Signature is imprinted as a Cosmic Signature NFT and goes to the Final Gesture participant with the Signature Allocation.',
    caption: 'The Signature of Cycle {cycle}',
    linkLabel: 'View this Signature',
  },
  stepByStep: {
    heading: 'Getting started',
    subhead: 'From wallet connection to your first gesture in three steps.',
    stepLabel: 'Step {n}',
    steps: [
      {
        title: 'Connect your wallet',
        tooltip:
          'Arbitrum is a Layer 2 blockchain on Ethereum with lower gas fees and faster transactions.',
        highlights: [
          'Click the "Connect wallet" button at the top of the page.',
          'Use a wallet that supports the Arbitrum blockchain, such as MetaMask.',
          'Switch your network to Arbitrum when prompted, then approve permissions.',
          'Your wallet address will appear in the header once connected.',
        ],
      },
      {
        title: 'Check the Gesture Cost',
        tooltip:
          'Check the gas estimate in your wallet before confirming. Network fees vary and are separate from the Gesture Cost.',
        highlights: [
          'Check the current Gesture Cost in ETH or CST before committing.',
          'Review the live Participation CST preview; the amount changes with time since the previous gesture.',
          'Note the Signature Allocation amount to see the potential ETH distribution.',
          'Ensure your wallet holds the Gesture Cost plus a small amount for gas fees.',
        ],
      },
      {
        title: 'Make your gesture',
        tooltip: `Each Random Walk NFT can be used once for the ${protocolFacts.randomWalkDiscountPercentage}% ETH Gesture Cost reduction - choose your moment wisely.`,
        highlights: [
          `Choose ETH, optionally attach a Random Walk NFT for a ${protocolFacts.randomWalkDiscountPercentage}% ETH Gesture Cost reduction, or make a CST (ERC-20) gesture.`,
          'Press the gesture button, which names the method and the cost (for example "Gesture with ETH"), and confirm the transaction in your wallet.',
        ],
      },
    ],
  },
  proTips: {
    heading: 'Tips and strategy',
    subhead: 'Practical guidance for maximizing participation across allocation tracks.',
    tips: [
      {
        title: 'Watch both Calibration Windows',
        body: 'ETH gestures slightly shorten the CST Calibration Window; CST gestures slightly lengthen it. The live app panels show the current cost path.',
      },
      {
        title: 'Attach a Random Walk NFT',
        body: 'Each Random Walk NFT can be used once for the cost reduction. Save it for a higher-cost gesture to maximize the effect.',
      },
      {
        title: 'One gesture, one Stellar Selection entry',
        body: `Three ETH Stellar Selection recipients share ${protocolFacts.stellarSelectionEthPercentage}% of the Cycle Reserve. Ten participant NFT recipients and ten Random Walk NFT anchor-holders each receive ${protocolFacts.specialAllocationCst.toLocaleString('en-US')} CST and a Cosmic Signature NFT.`,
      },
      {
        title: 'Use a burner wallet',
        body: 'A burner wallet isolates your protocol activity from your main holdings for additional security. Audit and verification status is published on the Audits page.',
      },
      {
        title: 'Watch the finalization time',
        body: 'Gesturing near the deadline positions you closest to the Final Gesture, but another participant can still gesture after you until the cycle is finalized.',
      },
      {
        title: 'Gesture with CST',
        body: `A CST gesture records a Stellar Selection entry, extends the timer, may imprint dynamic Participation CST, and lengthens the CST Calibration Window by about ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%.`,
      },
    ],
  },
  callToAction: {
    heading: 'Ready to make your first gesture?',
    // The JSX original rendered a literal "\u2019" because unicode escapes are
    // not processed inside JSX text; this is the intentional fix to a real ’.
    body: 'Join the active Performance Cycle. Connect your wallet and make your first gesture to start imprinting CST and shaping the cycle’s Signature.',
    primaryCtaLabel: 'Make a gesture',
    faqCtaLabel: 'Browse the FAQ',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'Twitter / X',
  },
} satisfies HowItWorksText;
