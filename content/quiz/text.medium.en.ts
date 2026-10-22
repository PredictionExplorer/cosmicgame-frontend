import { protocolFacts } from '@/content/protocol-facts';

import type { QuizTierQuestionsText } from './structure';

const cst = (amount: number): string => amount.toLocaleString('en-US');

const oneSecondExample = protocolFacts.dynamicCstRewardExamples[1];
const oneDayExample = protocolFacts.dynamicCstRewardExamples[4];

/**
 * Medium tier: the live mechanics. Calibration Windows, the CST feedback
 * loop, persistence tracks, Selection math, Council parameters. Numbers
 * interpolate from protocolFacts.
 */
export const mediumQuestionsTextEn = {
  'eth-opening-price-discovery': {
    prompt: 'How does a new cycle discover its opening ETH Gesture Cost?',
    options: {
      a: `The ceiling starts at ${protocolFacts.ethCalibrationCeilingMultiplier}x the previous cycle’s opening undiscounted ETH base cost and descends toward floor(ceiling / ${protocolFacts.ethCalibrationFloorDivisor}) + one wei.`,
      b: `Every cycle opens at a fixed ${protocolFacts.initialGestureCostEth} ETH.`,
      c: 'The Cosmic Council votes on each cycle\u2019s opening cost.',
      d: 'The cost doubles every hour until someone gestures.',
    },
    explanation: `This is price discovery without an order book: if the previous cycle opened too cheap, the doubling restores headroom; if the doubled value proves too high, the descent finds the level at which someone is willing to begin. Only the very first cycle used a fixed ${protocolFacts.initialGestureCostEth} ETH \u2014 every cycle since calibrates from its predecessor.`,
    referenceLabel: 'White paper \u00a73.1 \u2014 The ETH Calibration Window',
  },
  'eth-step-up': {
    prompt: 'Pax makes an ETH gesture. What happens to the next premium-free ETH base cost?',
    options: {
      a: `It rises by ${protocolFacts.ethGestureCostStepUpPercent}%, plus one wei \u2014 the sequence is public and exact.`,
      b: 'It doubles.',
      c: 'It stays the same until the cycle finalizes.',
      d: `It falls by ${protocolFacts.ethGestureCostStepUpPercent}% to invite more activity.`,
    },
    explanation: `Every ETH gesture, including the opening one, advances the premium-free base by ${protocolFacts.ethGestureCostStepUpPercent}% plus one wei, subject to integer rounding. The late premium and retained overpayment do not enter that base. The actual quoted total also depends on the late window and can change before execution.`,
    funFact:
      'The extra wei matters: it guarantees strict growth even when a cost is so small that a percentage of it rounds to zero.',
    referenceLabel: 'White paper \u00a74.1 \u2014 ETH gestures',
  },
  'overpay-refund': {
    prompt:
      'Vega accidentally sends noticeably more ETH than the current Gesture Cost. What happens to the extra?',
    options: {
      a: 'It is refunded to her in the same transaction.',
      b: 'It is lost to the reserve, whatever the amount.',
      c: 'It is credited toward her next gesture.',
      d: 'It is forwarded to Public Goods.',
    },
    explanation:
      'Overpayment above the dust threshold is refunded in the same transaction. Smaller amounts stay in the reserve because sending them back would cost more in gas than the refund itself.',
    referenceLabel: 'White paper \u00a74.1 \u2014 ETH gestures',
  },
  'cst-window-restart': {
    prompt: 'Lyra makes a CST gesture. What does that do to the CST Calibration Window?',
    options: {
      a: 'It resets the ceiling to the largest of twice the premium-free CST base cost, the configured minimum and the updated decline rate times the safeguard interval.',
      b: 'Nothing \u2014 the window keeps descending where it was.',
      c: `The cost locks at ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST for the rest of the cycle.`,
      d: 'The window closes and CST gestures pause until the next cycle.',
    },
    explanation: `After reducing the decline rate, a CST gesture resets the ceiling to max(2 × premium-free base cost, ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST, new rate × ${protocolFacts.cstCalibrationRestartMinimumSeconds} seconds). The late premium is excluded. This safeguard is not a cooldown between gestures.`,
    referenceLabel: 'White paper \u00a74.3 \u2014 CST gestures',
  },
  'cst-free-quiet': {
    prompt:
      'The protocol has been quiet for a long stretch, and the CST Calibration Window has fully elapsed. What is now true?',
    options: {
      a: 'The CST Gesture Cost has reached zero, so no CST payment is required for a gesture; network gas still applies.',
      b: 'The cycle finalizes itself automatically.',
      c: 'CST gestures are disabled until an ETH gesture arrives.',
      d: 'The CST cost has risen to its ceiling.',
    },
    explanation:
      'The CST Gesture Cost can reach zero when the window fully elapses. A gesture still requires network gas and must satisfy the current cycle rules. Finalization also requires a transaction; the cycle does not finalize automatically.',
    referenceLabel: 'White paper \u00a74.3 \u2014 CST gestures',
  },
  'window-feedback-loop': {
    prompt: 'How do ETH gestures affect the V3 CST decline rate?',
    options: {
      a: 'They attempt to increase the rate, subject to the minimum-window safeguard, making CST base cost decline faster when accepted.',
      b: 'They always reduce the rate, slowing the decline.',
      c: 'Nothing \u2014 the two currencies are independent.',
      d: 'The window resets to its original duration.',
    },
    explanation: `At divisor ${protocolFacts.cstDeclineRateChangeDivisor}, ETH proposes rate + floor(rate / 100), accepted only if rate times ${protocolFacts.cstCalibrationRestartMinimumSeconds} seconds stays within the current ceiling. CST instead uses rate − floor(rate / 101), then resets the ceiling. V3 does not change the old stored duration by fixed percentages.`,
    referenceLabel: 'White paper \u00a74.3 \u2014 CST gestures',
  },
  'participation-cst-timing': {
    prompt:
      'Two gestures imprint Participation CST at launch parameters: one lands 1 second after the previous gesture, the other ends a full day of silence. Roughly how much does each imprint?',
    options: {
      a: `About ${oneSecondExample.cst} CST and ${oneDayExample.cst} CST, credited to the previous participant by a subsequent gesture under the linear rule.`,
      b: `A flat ${cst(100)} CST each, regardless of timing.`,
      c: 'Equal amounts \u2014 timing never matters.',
      d: 'Zero for both \u2014 only finalization imprints CST.',
    },
    explanation:
      'V3’s linear amount is proportional to elapsed time at the original one-hour increment. The examples are approximate and the live rate changes as the increment grows. The next gesture credits the previous participant; the opening gesture credits none, and finalization pays no final dynamic amount.',
    funFact:
      'Longer gaps produce more Participation CST per gesture. Rapid successive gestures can imprint little or no Participation CST; Recognition CST and the Outreach Reserve are separate issuance mechanisms.',
    referenceLabel: 'White paper \u00a77.1 \u2014 Imprint rules',
  },
  'cst-max-cost-protection': {
    prompt:
      'When submitting a CST gesture, what protects Kestrel from paying more than she expects if her transaction lands late?',
    options: {
      a: 'She specifies the maximum cost she accepts; the gesture cannot spend more than authorized.',
      b: 'Nothing \u2014 the price at execution time is what she pays.',
      c: 'The Cosmic Council refunds overcharges after the cycle.',
      d: 'CST costs never change between signing and execution.',
    },
    explanation:
      'A participant submitting a CST gesture specifies the maximum cost they accept, so a gesture landing later than expected cannot spend more than authorized. It matters most right after another CST gesture restarts the window at a higher value.',
    referenceLabel: 'White paper \u00a74.3 \u2014 CST gestures',
  },
  'endurance-definition': {
    prompt:
      'Ari gestures during a slow afternoon and no one displaces him for ten straight hours \u2014 the longest quiet gap of the cycle. Which title is he in line for?',
    options: {
      a: 'Endurance Champion \u2014 he remained the most recent gesture maker for the longest unbroken interval.',
      b: 'Chrono-Warrior \u2014 he held a title for the longest time.',
      c: 'Neither; titles depend on the number of gestures made.',
      d: 'The Final Gesture role, automatically.',
    },
    explanation:
      'The Endurance Champion is the participant who remained the most recent gesture maker for the longest unbroken interval \u2014 the longest quiet gap a single gesture survived. The Chrono-Warrior track sits one level up and measures something different: how long the Endurance Champion title itself was held.',
    referenceLabel: 'White paper \u00a75.2 \u2014 Endurance Champion and Chrono-Warrior',
  },
  'chrono-definition': {
    prompt:
      'Ari sets a ten-hour Endurance record and holds the Endurance Champion title for two days before Bea beats it. What does the Chrono-Warrior track measure?',
    options: {
      a: 'Whoever held the Endurance Champion title for the longest unbroken interval \u2014 Ari\u2019s two days of holding the record count for him.',
      b: 'Whoever reacts fastest after another participant\u2019s gesture.',
      c: 'Whoever participated in the most cycles overall.',
      d: 'Whoever makes the cycle\u2019s Final Gesture.',
    },
    explanation:
      'Endurance measures the gap you created; the Chrono track measures how long your record survived. Ari\u2019s endurance interval was ten hours, but his reign as Endurance Champion lasted two days \u2014 and it is that reign the Chrono-Warrior track scores. Both resolve only at finalization.',
    referenceLabel: 'White paper \u00a75.2 \u2014 Endurance Champion and Chrono-Warrior',
  },
  'eth-selection-count': {
    prompt: 'How does the ETH Stellar Selection distribute its share at finalization?',
    options: {
      a: `${protocolFacts.ethStellarSelectionRecipients} entries are selected from the cycle\u2019s gesture pool and share ${protocolFacts.stellarSelectionEthPercentage}% of the reserve equally.`,
      b: `${protocolFacts.nftStellarSelectionRecipients} entries are selected, each receiving ETH and an NFT.`,
      c: 'One entry is selected and receives the full share.',
      d: 'Every participant receives an equal share.',
    },
    explanation: `The ETH Stellar Selection selects ${protocolFacts.ethStellarSelectionRecipients} entries, which share ${protocolFacts.stellarSelectionEthPercentage}% of the reserve equally. The ${protocolFacts.nftStellarSelectionRecipients}-entry figure belongs to the separate NFT Stellar Selection, which carries CST and NFTs rather than ETH.`,
    referenceLabel: 'White paper \u00a75.3 \u2014 Stellar Selections',
  },
  'nft-selection-count': {
    prompt: 'What does each NFT Stellar Selection recipient receive, and how many are selected?',
    options: {
      a: `${cst(protocolFacts.specialAllocationCst)} CST and one Cosmic Signature NFT, selected ${protocolFacts.nftStellarSelectionRecipients} times from the gesture pool.`,
      b: `A share of ETH, selected ${protocolFacts.ethStellarSelectionRecipients} times.`,
      c: `${cst(protocolFacts.outreachReserveCst)} CST, selected once.`,
      d: `One NFT only, selected ${protocolFacts.typicalNftsPerCycle} times.`,
    },
    explanation: `The participant NFT track selects ${protocolFacts.nftStellarSelectionRecipients} entries using the same base-ETH-cost weights as participant ETH selection. Each selected allocation receives ${cst(protocolFacts.specialAllocationCst)} CST and one NFT. The separate main allocation receives ${cst(protocolFacts.specialAllocationCst)} CST once for its ${protocolFacts.mainPrizeNftsPerCycle} NFTs.`,
    referenceLabel: 'White paper \u00a75.1 \u2014 Distribution at finalization',
  },
  'draws-with-replacement': {
    prompt: 'Can the same participant be selected more than once in a cycle’s Stellar Selections?',
    options: {
      a: 'Yes — selections are made with replacement, and entries scale with gestures made.',
      b: 'No — each participant can be selected at most once.',
      c: 'Only participants with ten or more gestures can repeat.',
      d: 'Only if the Cosmic Council approves the repeat.',
    },
    explanation:
      'Both participant selection tracks allow repeats and use accumulated undiscounted, premium-free ETH base cost as weight, including the concurrent ETH base cost for CST gestures. An address can receive more than one selection; gesture count alone does not determine relative weight.',
    referenceLabel: 'White paper \u00a75.3 \u2014 Stellar Selections',
  },
  'anchored-rwlk-track': {
    prompt: 'What do anchored Random Walk NFTs receive from a cycle?',
    options: {
      a: `${protocolFacts.anchoredRwlkNftSelectionRecipients} selections of ${cst(protocolFacts.specialAllocationCst)} CST plus a Cosmic Signature NFT each, weighted by NFTs anchored \u2014 and no ETH.`,
      b: `A pro-rata share of the ${protocolFacts.anchorDistributionPercentage}% ETH Anchor Distribution.`,
      c: 'Nothing \u2014 only Cosmic Signature NFTs can be anchored.',
      d: 'A one-time CST payment when the anchor is released.',
    },
    explanation: `Random Walk NFTs anchor separately and for a different purpose: they are eligible for the Anchored-NFT Stellar Selection, ${protocolFacts.anchoredRwlkNftSelectionRecipients} per cycle, each carrying CST and a Cosmic Signature NFT. The ETH Anchor Distribution belongs exclusively to anchored Cosmic Signature NFTs \u2014 Random Walk anchoring carries no ETH.`,
    referenceLabel: 'White paper \u00a78 \u2014 Anchoring',
  },
  'exclusivity-window': {
    prompt: 'How long does the Final Gesture participant hold the exclusive right to finalize?',
    options: {
      a: `${protocolFacts.finalGestureExclusivityHours} hours`,
      b: `${protocolFacts.initialCycleFinalizationHoursAtLaunch} hours`,
      c: `${protocolFacts.initialCycleTimeIncrementHours} hour`,
      d: `${protocolFacts.initialCstCalibrationWindowHours} hours`,
    },
    explanation: `The exclusive window is ${protocolFacts.finalGestureExclusivityHours} hours; after that, anyone may finalize and take over the beneficiary role. The ${protocolFacts.initialCycleFinalizationHoursAtLaunch}-hour figure is the initial countdown after a cycle\u2019s opening gesture \u2014 a different clock entirely.`,
    funFact: `V1 gave the Final Gesture participant ${protocolFacts.initialCycleFinalizationHoursAtLaunch} hours of exclusivity. V2 doubled that window to allow more time for participants to finalize.`,
    referenceLabel: 'White paper \u00a73.3 \u2014 Finalization',
  },
  'escrow-timeout': {
    prompt:
      'Juno was selected in the ETH Stellar Selection but never retrieves her escrowed ETH. What happens after the timeout?',
    options: {
      a: `After ${protocolFacts.secondaryRetrievalTimeoutWeeks} weeks, anyone may retrieve the unretrieved allocation for themselves.`,
      b: 'It returns to the Cycle Reserve.',
      c: 'It is burned.',
      d: 'It waits in escrow indefinitely until Juno appears.',
    },
    explanation: `Escrowed allocations and attached assets have a ${protocolFacts.secondaryRetrievalTimeoutWeeks}-week retrieval window. After that deadline, anyone can retrieve the remaining assets for themselves. Recipients should retrieve their allocations before the window closes.`,
    referenceLabel: 'White paper \u00a75.4 \u2014 Delivery, escrow, and timeouts',
  },
  'push-vs-pull': {
    prompt: 'Which ETH goes out directly during finalization, and which waits in escrow?',
    options: {
      a: 'The Signature Allocation and Public Goods forwarding go directly; the Chrono-Warrior\u2019s ETH and the ETH Selection shares wait in the Allocations Wallet.',
      b: 'Everything is sent directly to every recipient.',
      c: 'Everything waits in escrow, including the beneficiary\u2019s share.',
      d: 'Only CST is escrowed; all ETH goes out directly.',
    },
    explanation:
      'Distribution is deliberately split between push and pull. The beneficiary\u2019s ETH and the Public Goods forwarding are pushed during finalization; secondary ETH allocations are placed in the Allocations Wallet for each recipient to retrieve. CST and NFTs are imprinted directly to their recipients.',
    referenceLabel: 'White paper \u00a75.4 \u2014 Delivery, escrow, and timeouts',
  },
  'council-proposal-threshold': {
    prompt: 'How much delegated CST weight does an address need to submit a Coordination Proposal?',
    options: {
      a: `At least ${protocolFacts.councilProposalThresholdCst} CST.`,
      b: `At least ${cst(protocolFacts.specialAllocationCst)} CST.`,
      c: `At least ${cst(protocolFacts.outreachReserveCst)} CST.`,
      d: 'Any amount \u2014 there is no threshold.',
    },
    explanation: `The threshold is ${protocolFacts.councilProposalThresholdCst} CST of historical delegated weight. The ${cst(protocolFacts.specialAllocationCst)} CST figure is a fixed recognition allocation, not the proposal threshold; the main allocation receives that amount once for all its NFTs.`,
    referenceLabel: 'White paper \u00a79 \u2014 The Cosmic Council',
  },
  'council-timeline': {
    prompt: 'A Coordination Proposal is submitted today. What timeline follows?',
    options: {
      a: `A ${protocolFacts.councilVotingDelayDays}-day coordination delay, then a ${protocolFacts.councilVotingPeriodWeeks}-week coordination period.`,
      b: 'It takes effect immediately if the proposer holds enough CST.',
      c: `A ${protocolFacts.secondaryRetrievalTimeoutWeeks}-week delay, then a ${protocolFacts.councilVotingDelayDays}-day coordination period.`,
      d: `A ${protocolFacts.finalGestureExclusivityHours}-hour delay, then it executes automatically.`,
    },
    explanation: `Proposals wait through a ${protocolFacts.councilVotingDelayDays}-day coordination delay, then remain open for a ${protocolFacts.councilVotingPeriodWeeks}-week coordination period. The delay gives holders time to adjust delegation before the snapshot; nothing takes effect immediately.`,
    referenceLabel: 'White paper \u00a79 \u2014 The Cosmic Council',
  },
  'quorum-rule': {
    prompt: 'When does a Coordination Proposal pass?',
    options: {
      a: `Support exceeds Opposition, and Support plus Abstain weight reaches the ${protocolFacts.councilQuorumPercent}% Coordination Quorum.`,
      b: 'Support alone reaches half of the total CST supply.',
      c: `Support, Opposition, and Abstain together reach ${protocolFacts.councilQuorumPercent}%.`,
      d: 'The protocol owner countersigns the result.',
    },
    explanation: `Two conditions must hold: Support exceeds Opposition, and Support plus Abstain reaches the Coordination Quorum of ${protocolFacts.councilQuorumPercent}% of total CST supply. Opposition weight deliberately does not count toward the quorum \u2014 opposing a proposal cannot accidentally help it reach the bar.`,
    referenceLabel: 'White paper \u00a79 \u2014 The Cosmic Council',
  },
  'weight-activation': {
    prompt:
      'Rook holds CST in his wallet but has never touched the Council. How much Coordination Weight does his CST express?',
    options: {
      a: 'None \u2014 weight activates only on delegation, to himself or to another address.',
      b: 'One unit per CST, automatically.',
      c: 'It depends on how long he has held the CST.',
      d: 'Weight comes from anchored NFTs, not CST.',
    },
    explanation:
      'Coordination Weight activates on delegation: a holder delegates to themselves or to another address, and each CST then expresses one unit of weight. Undelegated CST carries no weight at all \u2014 holding alone is not participation in coordination.',
    referenceLabel: 'White paper \u00a77.3 \u2014 Coordination Weight',
  },
  'time-increment-growth': {
    prompt: 'The time increment each gesture adds began at exactly one hour. How does it evolve?',
    options: {
      a: `It grows by ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% with every finalized cycle, so cycles lengthen gradually over the years.`,
      b: 'It is fixed at one hour forever.',
      c: 'It doubles every cycle.',
      d: 'It shrinks as more participants join.',
    },
    explanation: `The increment grows by ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% with every finalized cycle. Larger increments tend to lengthen cycles and slow the pace of NFT imprinting; actual cycle duration also depends on participation.`,
    referenceLabel: 'White paper \u00a73.2 \u2014 The countdown',
  },
  'typical-cst-fixed': {
    prompt: 'How much fixed CST does a typical cycle imprint, and how does it break down?',
    options: {
      a: `${cst(protocolFacts.typicalCstImprintsPerCycle)} CST: ${protocolFacts.nftBearingAllocations} recognition allocations of ${cst(protocolFacts.specialAllocationCst)} CST, plus ${cst(protocolFacts.outreachReserveCst)} CST for outreach.`,
      b: `${cst(protocolFacts.specialAllocationCst)} CST, all to the cycle beneficiary.`,
      c: `${cst(protocolFacts.outreachReserveCst)} CST, all for community outreach.`,
      d: 'It varies unpredictably from cycle to cycle.',
    },
    explanation: `A full-track cycle has ${protocolFacts.nftBearingAllocations} recognition allocations and ${protocolFacts.typicalNftsPerCycle} NFTs: the main allocation carries ${protocolFacts.mainPrizeNftsPerCycle} NFTs with one CST amount. The fixed total is ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST including outreach. Missing tracks reduce this; dynamic Participation CST is additional.`,
    referenceLabel: 'White paper \u00a77.1 \u2014 Imprint rules',
  },
  'attached-assets-destination': {
    prompt: 'Wren attaches an ERC-20 token to her gesture. Where does the attached asset go?',
    options: {
      a: 'To the Allocations Wallet escrow \u2014 the cycle\u2019s beneficiary has priority to retrieve it after finalization.',
      b: 'Into the Cycle Reserve, alongside the gesture\u2019s ETH.',
      c: 'Back to Wren when the cycle finalizes.',
      d: 'It is burned at finalization.',
    },
    explanation:
      'Attached assets never join the ETH reserve. They are held by the Allocations Wallet, and the cycle\u2019s beneficiary has priority to retrieve them after finalization \u2014 subject to the same open retrieval timeout as every other escrowed allocation.',
    referenceLabel: 'White paper \u00a74.4 \u2014 Messages and attached assets',
  },
  'next-cycle-delay': {
    prompt: 'A cycle has just been finalized. When does the next one activate?',
    options: {
      a: `After the on-chain configured delay, currently ${protocolFacts.currentNextCycleDelayDays} days; the owner can change it.`,
      b: 'Immediately, in the same transaction.',
      c: `Exactly ${protocolFacts.finalGestureExclusivityHours} hours later.`,
      d: 'Only when the owner manually starts it.',
    },
    explanation: `The next activation is scheduled from successful finalization using the configured delay. The checked deployment uses ${protocolFacts.currentNextCycleDelayDays} days. The ${protocolFacts.defaultNextCycleDelayMinutes}-minute Solidity default is historical configuration, not the live delay.`,
    referenceLabel: 'White paper \u00a73.3 \u2014 Finalization',
  },
} as const satisfies QuizTierQuestionsText<'medium'>;
