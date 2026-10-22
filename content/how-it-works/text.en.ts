import { ethDistributionFacts, nftAllocationFacts, protocolFacts } from '@/content/protocol-facts';

import { copyNumbers } from './copyNumbers';
import type { HowItWorksText } from './structure';

const numbers = copyNumbers('en');
const cst = numbers.specialAllocationCst;
const { ethRecipients, nftRecipients, anchoredRecipients } = numbers;
const entriesAre = (count: number) =>
  `${numbers.count(count)} ${numbers.plural(count, { one: 'entry is', other: 'entries are' })}`;
const recipients = (count: number) =>
  `${numbers.count(count)} ${numbers.plural(count, { one: 'recipient', other: 'recipients' })}`;

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
    pageLabel: 'How it works',
  },
  hero: {
    heading: 'How Cosmic Signature works',
    paragraph:
      'Participants make gestures during a Performance Cycle, and every gesture shapes the cycle’s Signature. When the Cycle Finalization Time expires, the cycle can be finalized and allocations distribute across a fixed set of tracks — including the Signature Allocation, Anchor Distributions, and Protocol Guild.',
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
          'V3 credits Participation CST to the previous participant when another gesture arrives. The amount grows linearly with elapsed time. The opening gesture credits none, and finalization does not settle the final participant’s additional dynamic CST.',
      },
      {
        title: 'Stellar Selection entry',
        description: `Each gesture records an entry weighted by its undiscounted, premium-free ETH base cost. CST gestures use the concurrent ETH base cost. At finalization, ${entriesAre(ethRecipients)} selected with these weights to share ${ethDistributionFacts.stellarSelectionEthPercentage}% of the Cycle Reserve.`,
      },
      {
        title: 'Cosmic Signature NFT selection',
        description: `Another ${entriesAre(nftRecipients)} selected using those same weights, each receiving ${cst} CST and one NFT. Repeats are possible; no number of gestures guarantees a selection.`,
      },
      {
        title: 'Signature Allocation',
        description: `The participant who made the Final Gesture may finalize the cycle and retrieve ${ethDistributionFacts.mainEthPercentage}% of the Cycle Reserve in ETH, ${cst} CST and ${nftAllocationFacts.mainPrizeNftPhrase.en}.`,
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
        body: `Each ETH gesture increases the next premium-free ETH base cost by ${protocolFacts.ethGestureCostStepUpPercent}% plus one wei. Opening base cost declines through its Calibration Window. Near the deadline, ETH and CST can also carry a late premium of up to approximately ${protocolFacts.v3.lateGestureMaxCostMultiplier}x total cost.`,
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
      finalization: 'Finalization',
      exclusiveWindow: `${protocolFacts.finalGestureExclusivityHours}-hour window: only the Final Gesture participant can finalize`,
      allocations: 'Allocation tracks',
    },
    phases: [
      {
        label: 'The cycle opens',
        description:
          'A cycle opens at its scheduled activation time. Its first gesture must use ETH and starts the finalization clock. The reserve contains the preceding carryover and any direct ETH contributions; the carried CST ceiling and decline rate determine its first CST window.',
      },
      {
        label: 'Participants gesture',
        description:
          'Later gestures add the integer-truncated time increment to the stored deadline, even after expiry. V3 adjusts the CST decline rate. Each CST gesture restarts its ceiling using twice the premium-free base cost and the on-chain minimums.',
      },
      {
        label: 'The Cycle Finalization Time expires',
        description: `When the countdown reaches zero, the participant who made the Final Gesture has ${protocolFacts.finalGestureExclusivityHours} hours to finalize the cycle. After that, anyone may finalize, and whoever does receives the Signature Allocation. Until finalization runs, a new gesture extends the clock and becomes the Final Gesture.`,
      },
      {
        label: 'The cycle finalizes',
        description: `Finalization distributes every allocation. The participant who finalizes receives the Signature Allocation: ${ethDistributionFacts.mainEthPercentage}% of the Cycle Reserve, ${cst} CST and ${nftAllocationFacts.mainPrizeNftPhrase.en}.`,
      },
      {
        label: 'Stellar Selections',
        description: `Participant ETH and NFT selections both use the accumulated premium-free, undiscounted ETH base cost as weight; CST gestures use the concurrent ETH base cost. ${recipients(ethRecipients)} share ${ethDistributionFacts.stellarSelectionEthPercentage}% ETH. ${numbers.count(nftRecipients)} participant selections and up to ${numbers.count(anchoredRecipients)} Anchored-NFT Stellar Selection entries from active Random Walk NFTs each receive ${cst} CST and one NFT. Repeats are possible.`,
      },
      {
        label: 'The next cycle begins',
        description: `About ${protocolFacts.compoundingReservePercentage}% of the Cycle Reserve carries forward, with rounding and conditional-transfer exceptions. The next activation is scheduled from finalization; the current configured delay is ${protocolFacts.currentNextCycleDelayDays} days and can be changed by the owner.`,
      },
    ],
  },
  payoff: {
    heading: 'Every cycle ends in a Signature',
    body: `The Signature Allocation goes to whoever finalizes the cycle. It includes ${nftAllocationFacts.mainPrizeNftPhrase.en} and ${cst} CST in total. For ${protocolFacts.finalGestureExclusivityHours} hours after the deadline, only the Final Gesture participant can finalize. After that, any caller can finalize and receive this allocation.`,
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
          'Check the Participation CST recipient: V3 credits the previous participant when your gesture executes, rather than promising an immediate imprint to you.',
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
        body: `The ETH opening window runs until the first gesture. A CST gesture resets its ceiling to the greatest of twice its premium-free CST base cost, ${protocolFacts.cstCalibrationCeilingMinCst} CST, and the updated decline rate times ${protocolFacts.cstCalibrationRestartMinimumSeconds} seconds. ETH and CST gestures adjust that rate. The restart safeguard is not a cooldown.`,
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
    body: 'Connect a wallet, review the current costs and mechanics, and make a gesture in an active Performance Cycle.',
    primaryCtaLabel: 'Make a gesture',
    faqCtaLabel: 'Browse the FAQ',
    discordCtaLabel: 'Discord',
    twitterCtaLabel: 'X (Twitter)',
  },
} satisfies HowItWorksText;
