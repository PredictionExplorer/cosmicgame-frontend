import { protocolFacts } from '@/content/protocol-facts';

import type { HowItWorksText } from './structure';

const cst = protocolFacts.specialAllocationCst.toLocaleString('en-US');

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
    subhead: 'Each gesture takes part in several allocation tracks of its cycle.',
    items: [
      {
        title: 'Dynamic Participation CST',
        description:
          'A gesture may imprint CST. The amount follows the square root of the time since the previous gesture: a gesture right after another can imprint 0 CST, and a longer quiet period imprints more.',
      },
      {
        title: 'Stellar Selection entry',
        description: `Each gesture records one entry. When the cycle finalizes, three entries are drawn at random to share ${protocolFacts.stellarSelectionEthPercentage}% of the Cycle Reserve in ETH.`,
      },
      {
        title: 'Cosmic Signature NFT selection',
        description: `Ten more entries are drawn to receive ${cst} CST and a Cosmic Signature NFT each. The same address can be drawn more than once, and no number of entries guarantees a selection.`,
      },
      {
        title: 'Signature Allocation',
        description: `The participant who made the Final Gesture may finalize the cycle and retrieve ${protocolFacts.mainEthPercentage}% of the Cycle Reserve in ETH, ${cst} CST and a Cosmic Signature NFT.`,
      },
    ],
  },
  costs: {
    heading: 'What a gesture costs',
    subhead: 'Know these before you pay for a gesture with ETH or CST.',
    items: [
      {
        title: 'The spend is not returned',
        body: 'ETH paid for a gesture joins the Cycle Reserve, and CST paid is burned. Neither comes back when someone gestures after you.',
      },
      {
        title: 'The ETH cost steps up',
        body: `Each ETH gesture raises the next ETH Gesture Cost by ${protocolFacts.ethGestureCostStepUpPercent}%. It falls only in the ETH Calibration Window that opens each cycle.`,
      },
      {
        title: 'Gas is paid separately',
        body: 'Every gesture is an Arbitrum transaction, so you also pay a network fee in ETH. Your wallet shows it before you confirm.',
      },
    ],
    note: 'Gesture only with funds you can afford to part with.',
    riskLinkLabel: 'Read the risk disclosures',
  },
  gameCycle: {
    heading: 'Lifecycle of a Performance Cycle',
    subhead: 'Every cycle follows this sequence from open to finalization.',
    legend: {
      gestures: 'Gestures',
      exclusiveWindow: `${protocolFacts.finalGestureExclusivityHours}-hour window: only the Final Gesture participant can finalize`,
      allocations: 'Allocation tracks',
    },
    phases: [
      {
        label: 'The cycle opens',
        description: `A new Performance Cycle opens. The ETH and CST Gesture Costs each fall through a Calibration Window; the CST window starts from a ${protocolFacts.initialCstCalibrationWindowHours}-hour reference that changes with participation. The Cycle Reserve starts with what the previous cycle carried forward.`,
      },
      {
        label: 'Participants gesture',
        description: `Each gesture adds the current time increment to the Cycle Finalization Time. An ETH gesture shortens the CST Calibration Window by about ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%; a CST gesture lengthens it by about ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%.`,
      },
      {
        label: 'The Cycle Finalization Time expires',
        description: `When the countdown reaches zero, the participant who made the Final Gesture has ${protocolFacts.finalGestureExclusivityHours} hours to finalize the cycle. After that, anyone may finalize, and whoever does receives the Signature Allocation. Until finalization runs, a new gesture extends the clock and becomes the Final Gesture.`,
      },
      {
        label: 'The cycle finalizes',
        description: `Finalization distributes every allocation. The participant who finalizes receives the Signature Allocation: ${protocolFacts.mainEthPercentage}% of the Cycle Reserve, ${cst} CST and a Cosmic Signature NFT.`,
      },
      {
        label: 'Stellar Selections',
        description: `Three ETH Stellar Selection recipients share ${protocolFacts.stellarSelectionEthPercentage}% of the Cycle Reserve. Ten NFT Stellar Selection recipients, and ten Anchored-NFT Stellar Selection recipients drawn from anchored Random Walk NFTs, each receive ${cst} CST and a Cosmic Signature NFT. Each gesture adds one entry, and every selection is drawn from all of the cycle’s entries, with replacement.`,
      },
      {
        label: 'The next cycle begins',
        description: `The remaining ${protocolFacts.compoundingReservePercentage}% of the Cycle Reserve rolls forward as the Compounding Reserve, and the next cycle opens with fresh Calibration Windows.`,
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
    subhead: 'From connecting a wallet to your first gesture, in three steps.',
    stepLabel: 'Step {n}',
    steps: [
      {
        title: 'Connect your wallet',
        highlights: [
          'Press the connect button at the top right of the page.',
          'Use a wallet that supports Arbitrum, such as MetaMask. Arbitrum is an Ethereum Layer 2 with lower fees and faster transactions.',
          'Switch to the Arbitrum network when your wallet asks, then approve the connection.',
          'Once you are connected, your address appears in the header.',
        ],
      },
      {
        title: 'Check the Gesture Cost',
        highlights: [
          'Check the current Gesture Cost in ETH or CST before you commit.',
          'Review the Participation CST preview; it changes with the time since the previous gesture.',
          'Make sure your wallet holds the Gesture Cost plus a little ETH for the network fee, which your wallet shows before you confirm.',
        ],
      },
      {
        title: 'Make your gesture',
        highlights: [
          `Choose ETH or CST. An ETH gesture can carry a Random Walk NFT for a ${protocolFacts.randomWalkDiscountPercentage}% ETH Gesture Cost reduction, once per NFT.`,
          'Press the gesture button, which names the method and the cost (for example “Gesture with ETH”), and confirm the transaction in your wallet.',
        ],
      },
    ],
    fundingText: 'Need ETH on Arbitrum first?',
    fundingLinkLabel: 'How to add ETH on Arbitrum',
  },
  proTips: {
    heading: 'Good to know',
    subhead: 'Details that are easy to miss.',
    tips: [
      {
        title: 'Two Calibration Windows',
        body: `The ETH Gesture Cost falls through its Calibration Window once, as each cycle opens. The CST Gesture Cost starts a new window after every CST gesture: from twice the cost just paid (at least ${protocolFacts.cstCalibrationCeilingMinCst} CST) down to zero.`,
      },
      {
        title: 'Each Random Walk NFT works once',
        body: `A Random Walk NFT reduces one ETH gesture by ${protocolFacts.randomWalkDiscountPercentage}%, and cannot reduce another after that. Using it is separate from anchoring it.`,
      },
      {
        title: 'Use a separate wallet',
        body: 'A burner wallet keeps your protocol activity apart from your main holdings. The Audits page lists what has been reviewed and verified.',
      },
    ],
  },
  callToAction: {
    heading: 'Ready to make your first gesture?',
    body: 'Join the active Performance Cycle. Connect your wallet and make your first gesture to start imprinting CST and shaping the cycle’s Signature.',
    primaryCtaLabel: 'Make a gesture',
    faqCtaLabel: 'Browse the FAQ',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'X (Twitter)',
  },
} satisfies HowItWorksText;
