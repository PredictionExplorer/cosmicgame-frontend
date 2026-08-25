import { protocolFacts } from '@/content/protocol-facts';

import type { QuizQuestion } from './types';

const cst = (amount: number): string => amount.toLocaleString('en-US');

const oneSecondExample = protocolFacts.dynamicCstRewardExamples[1];
const oneDayExample = protocolFacts.dynamicCstRewardExamples[4];

/**
 * Medium tier: the live mechanics. Calibration Windows, the CST feedback
 * loop, persistence tracks, Selection math, Council parameters. Numbers
 * interpolate from protocolFacts.
 */
export const mediumQuestionsEn: readonly QuizQuestion[] = [
  {
    id: 'eth-opening-price-discovery',
    prompt: 'How does a new cycle discover its opening ETH Gesture Cost?',
    options: [
      {
        id: 'a',
        text: `The ETH Calibration Window starts at ${protocolFacts.ethCalibrationCeilingMultiplier}x the previous cycle\u2019s opening cost paid and declines linearly toward a floor of one two-hundredth of that, plus one wei.`,
      },
      { id: 'b', text: `Every cycle opens at a fixed ${protocolFacts.initialGestureCostEth} ETH.` },
      { id: 'c', text: 'The Cosmic Council votes on each cycle\u2019s opening cost.' },
      { id: 'd', text: 'The cost doubles every hour until someone gestures.' },
    ],
    correctOptionId: 'a',
    explanation: `This is price discovery without an order book: if the previous cycle opened too cheap, the doubling restores headroom; if the doubled value proves too high, the descent finds the level at which someone is willing to begin. Only the very first cycle used a fixed ${protocolFacts.initialGestureCostEth} ETH \u2014 every cycle since calibrates from its predecessor.`,
    reference: {
      label: 'White paper \u00a73.1 \u2014 The ETH Calibration Window',
      href: '/white-paper#eth-calibration-window',
    },
  },
  {
    id: 'eth-step-up',
    prompt: 'Pax makes an ETH gesture. What happens to the cost of the next ETH gesture?',
    options: [
      {
        id: 'a',
        text: `It rises by ${protocolFacts.ethGestureCostStepUpPercent}%, plus one wei \u2014 the sequence is public and exact.`,
      },
      { id: 'b', text: 'It doubles.' },
      { id: 'c', text: 'It stays the same until the cycle finalizes.' },
      {
        id: 'd',
        text: `It falls by ${protocolFacts.ethGestureCostStepUpPercent}% to invite more activity.`,
      },
    ],
    correctOptionId: 'a',
    explanation: `After the opening gesture, each ETH gesture raises the next ETH Gesture Cost by ${protocolFacts.ethGestureCostStepUpPercent}%, plus one wei, so the cost always grows. Anyone can read the current cost from the contract before acting \u2014 there are no surprises, only a rising staircase.`,
    funFact:
      'The extra wei matters: it guarantees strict growth even when a cost is so small that a percentage of it rounds to zero.',
    reference: {
      label: 'White paper \u00a74.1 \u2014 ETH Gestures',
      href: '/white-paper#eth-gestures',
    },
  },
  {
    id: 'overpay-refund',
    prompt:
      'Vega accidentally sends noticeably more ETH than the current Gesture Cost. What happens to the extra?',
    options: [
      { id: 'a', text: 'It is refunded to her in the same transaction.' },
      { id: 'b', text: 'It is lost to the reserve, whatever the amount.' },
      { id: 'c', text: 'It is credited toward her next gesture.' },
      { id: 'd', text: 'It is forwarded to Public Goods.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Overpayment above a dust threshold is refunded in the same transaction. Below that threshold a refund would cost more in gas than it returns, so the difference stays in the reserve \u2014 a deliberate courtesy cutoff, not a penalty.',
    reference: {
      label: 'White paper \u00a74.1 \u2014 ETH Gestures',
      href: '/white-paper#eth-gestures',
    },
  },
  {
    id: 'cst-window-restart',
    prompt: 'Lyra makes a CST gesture. What does that do to the CST Calibration Window?',
    options: [
      {
        id: 'a',
        text: `It restarts the window from ${protocolFacts.cstCalibrationCeilingMultiplier}x the cost she just paid \u2014 never below ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST \u2014 descending linearly to zero again.`,
      },
      { id: 'b', text: 'Nothing \u2014 the window keeps descending where it was.' },
      {
        id: 'c',
        text: `The cost locks at ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST for the rest of the cycle.`,
      },
      { id: 'd', text: 'The window closes and CST gestures pause until the next cycle.' },
    ],
    correctOptionId: 'a',
    explanation: `Every CST gesture restarts the window from its new starting value: ${protocolFacts.cstCalibrationCeilingMultiplier}x the last cost paid, with a floor of ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST on the starting point. From there the cost descends linearly to zero over the window\u2019s duration. The CST spent is burned along the way.`,
    reference: {
      label: 'White paper \u00a74.3 \u2014 CST Gestures',
      href: '/white-paper#cst-gestures',
    },
  },
  {
    id: 'cst-free-quiet',
    prompt:
      'The protocol has been quiet for a long stretch, and the CST Calibration Window has fully elapsed. What is now true?',
    options: [
      {
        id: 'a',
        text: 'A CST gesture costs almost nothing \u2014 anyone holding even a small CST balance can extend the cycle.',
      },
      { id: 'b', text: 'The cycle finalizes itself automatically.' },
      { id: 'c', text: 'CST gestures are disabled until an ETH gesture arrives.' },
      { id: 'd', text: 'The CST cost has risen to its ceiling.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The descent can reach zero, and that is intentional: it guarantees the cycle can always be extended by anyone holding a little CST. Cycles never finalize themselves \u2014 finalization is always a transaction someone sends.',
    reference: {
      label: 'White paper \u00a74.3 \u2014 CST Gestures',
      href: '/white-paper#cst-gestures',
    },
  },
  {
    id: 'window-feedback-loop',
    prompt:
      'A burst of ETH gestures sweeps through the cycle. What does that do to the CST Calibration Window\u2019s duration?',
    options: [
      {
        id: 'a',
        text: `Each ETH gesture shortens it by about ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%, so the CST cost descends faster and CST gestures become attractive sooner.`,
      },
      {
        id: 'b',
        text: `Each ETH gesture lengthens it by about ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%, slowing the CST descent.`,
      },
      { id: 'c', text: 'Nothing \u2014 the two currencies are independent.' },
      { id: 'd', text: 'The window resets to its original duration.' },
    ],
    correctOptionId: 'a',
    explanation: `The window\u2019s duration is a live parameter and one of the protocol\u2019s quieter feedback loops: ETH gestures shorten it by about ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}% each, CST gestures lengthen it by about ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}% each. Heavy ETH activity speeds the CST descent, and heavy CST activity slows it back down \u2014 nudging every cycle toward a balanced mix.`,
    reference: {
      label: 'White paper \u00a74.3 \u2014 CST Gestures',
      href: '/white-paper#cst-gestures',
    },
  },
  {
    id: 'participation-cst-timing',
    prompt:
      'Two gestures imprint Participation CST at launch parameters: one lands 1 second after the previous gesture, the other ends a full day of silence. Roughly how much does each imprint?',
    options: [
      {
        id: 'a',
        text: `About ${oneSecondExample.cst} CST and about ${oneDayExample.cst} CST \u2014 the amount grows with the square root of the elapsed time.`,
      },
      { id: 'b', text: `A flat ${cst(100)} CST each, regardless of timing.` },
      { id: 'c', text: 'Equal amounts \u2014 timing never matters.' },
      { id: 'd', text: 'Zero for both \u2014 only finalization imprints CST.' },
    ],
    correctOptionId: 'a',
    explanation: `Participation CST grows with the square root of the time since the previous gesture: a gesture arriving one second later imprints almost nothing (about ${oneSecondExample.cst} CST), while one that ends a day of silence imprints hundreds (about ${oneDayExample.cst} CST). The flat ${cst(100)} CST per gesture was the original V1 rule \u2014 it turned machine-speed sequences into free CST, which is exactly why V2 replaced it.`,
    funFact:
      'Patience is the only way to imprint meaningful CST. A bot spamming gestures every second imprints approximately zero.',
    reference: {
      label: 'White paper \u00a77.1 \u2014 Imprint Rules',
      href: '/white-paper#imprint-rules',
    },
  },
  {
    id: 'cst-max-cost-protection',
    prompt:
      'When submitting a CST gesture, what protects Kestrel from paying more than she expects if her transaction lands late?',
    options: [
      {
        id: 'a',
        text: 'She specifies the maximum cost she accepts; the gesture cannot spend more than authorized.',
      },
      { id: 'b', text: 'Nothing \u2014 the price at execution time is what she pays.' },
      { id: 'c', text: 'The Cosmic Council refunds overcharges after the cycle.' },
      { id: 'd', text: 'CST costs never change between signing and execution.' },
    ],
    correctOptionId: 'a',
    explanation:
      'A participant submitting a CST gesture specifies the maximum cost they accept, so a gesture landing later than expected cannot spend more than authorized. It matters most right after another CST gesture restarts the window at a higher value.',
    reference: {
      label: 'White paper \u00a74.3 \u2014 CST Gestures',
      href: '/white-paper#cst-gestures',
    },
  },
  {
    id: 'endurance-definition',
    prompt:
      'Ari gestures during a slow afternoon and no one displaces him for ten straight hours \u2014 the longest quiet gap of the cycle. Which title is he in line for?',
    options: [
      {
        id: 'a',
        text: 'Endurance Champion \u2014 he remained the most recent gesture maker for the longest unbroken interval.',
      },
      { id: 'b', text: 'Chrono-Warrior \u2014 he held a title for the longest time.' },
      { id: 'c', text: 'Neither; titles depend on the number of gestures made.' },
      { id: 'd', text: 'The Final Gesture role, automatically.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The Endurance Champion is the participant who remained the most recent gesture maker for the longest unbroken interval \u2014 the longest quiet gap a single gesture survived. The Chrono-Warrior track sits one level up and measures something different: how long the Endurance Champion title itself was held.',
    reference: {
      label: 'White paper \u00a75.2 \u2014 Endurance Champion and Chrono-Warrior',
      href: '/white-paper#endurance-and-chrono',
    },
  },
  {
    id: 'chrono-definition',
    prompt:
      'Ari\u2019s ten-hour record from the previous question stands unchallenged for two more days before Bea beats it. Who is the Chrono-Warrior measuring?',
    options: [
      {
        id: 'a',
        text: 'Whoever held the Endurance Champion title for the longest unbroken interval \u2014 Ari\u2019s two days of holding the record count for him.',
      },
      { id: 'b', text: 'Whoever reacts fastest after another participant\u2019s gesture.' },
      { id: 'c', text: 'Whoever participated in the most cycles overall.' },
      { id: 'd', text: 'Whoever makes the cycle\u2019s Final Gesture.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Endurance measures the gap you created; the Chrono track measures how long your record survived. Ari\u2019s endurance interval was ten hours, but his reign as Endurance Champion lasted two days \u2014 and it is that reign the Chrono-Warrior track scores. Both resolve only at finalization.',
    reference: {
      label: 'White paper \u00a75.2 \u2014 Endurance Champion and Chrono-Warrior',
      href: '/white-paper#endurance-and-chrono',
    },
  },
  {
    id: 'eth-selection-count',
    prompt: 'How does the ETH Stellar Selection distribute its share at finalization?',
    options: [
      {
        id: 'a',
        text: `${protocolFacts.ethStellarSelectionRecipients} entries are drawn from the cycle\u2019s gesture pool and share ${protocolFacts.stellarSelectionEthPercentage}% of the reserve equally.`,
      },
      {
        id: 'b',
        text: `${protocolFacts.nftStellarSelectionRecipients} entries are drawn, each receiving ETH and an NFT.`,
      },
      { id: 'c', text: 'One entry is drawn and receives the full share.' },
      { id: 'd', text: 'Every participant receives an equal share.' },
    ],
    correctOptionId: 'a',
    explanation: `The ETH Stellar Selection draws ${protocolFacts.ethStellarSelectionRecipients} entries, which share ${protocolFacts.stellarSelectionEthPercentage}% of the reserve equally. The ${protocolFacts.nftStellarSelectionRecipients}-entry figure belongs to the separate NFT Stellar Selection, which carries CST and NFTs rather than ETH.`,
    reference: {
      label: 'White paper \u00a75.3 \u2014 Stellar Selections',
      href: '/white-paper#stellar-selections',
    },
  },
  {
    id: 'nft-selection-count',
    prompt: 'What does each NFT Stellar Selection recipient receive, and how many are drawn?',
    options: [
      {
        id: 'a',
        text: `${cst(protocolFacts.specialAllocationCst)} CST and one Cosmic Signature NFT, drawn ${protocolFacts.nftStellarSelectionRecipients} times from the gesture pool.`,
      },
      {
        id: 'b',
        text: `A share of ETH, drawn ${protocolFacts.ethStellarSelectionRecipients} times.`,
      },
      { id: 'c', text: `${cst(protocolFacts.outreachReserveCst)} CST, drawn once.` },
      { id: 'd', text: `One NFT only, drawn ${protocolFacts.typicalNftsPerCycle} times.` },
    ],
    correctOptionId: 'a',
    explanation: `The NFT Stellar Selection draws ${protocolFacts.nftStellarSelectionRecipients} entries; each carries ${cst(protocolFacts.specialAllocationCst)} CST and one NFT. Recognition CST always travels with its NFT \u2014 every NFT distribution at finalization pairs the two.`,
    reference: {
      label: 'White paper \u00a75.1 \u2014 Distribution at Finalization',
      href: '/white-paper#distribution-at-finalization',
    },
  },
  {
    id: 'draws-with-replacement',
    prompt:
      'Can the same participant be drawn more than once in a cycle\u2019s Stellar Selections?',
    options: [
      {
        id: 'a',
        text: 'Yes \u2014 draws are made with replacement, and entries scale with gestures made.',
      },
      { id: 'b', text: 'No \u2014 each participant can be drawn at most once.' },
      { id: 'c', text: 'Only participants with ten or more gestures can repeat.' },
      { id: 'd', text: 'Only if the Cosmic Council approves the repeat.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Draws are made with replacement, so the same participant can be drawn more than once. Each gesture records one entry, which makes selection frequency proportional to participation \u2014 the mechanism scales with activity instead of rationing one draw per address.',
    reference: {
      label: 'White paper \u00a75.3 \u2014 Stellar Selections',
      href: '/white-paper#stellar-selections',
    },
  },
  {
    id: 'anchored-rwlk-track',
    prompt: 'What do anchored Random Walk NFTs receive from a cycle?',
    options: [
      {
        id: 'a',
        text: `${protocolFacts.anchoredRwlkNftSelectionRecipients} draws of ${cst(protocolFacts.specialAllocationCst)} CST plus a Cosmic Signature NFT each, weighted by NFTs anchored \u2014 and no ETH.`,
      },
      {
        id: 'b',
        text: `A pro-rata share of the ${protocolFacts.anchorDistributionPercentage}% ETH Anchor Distribution.`,
      },
      { id: 'c', text: 'Nothing \u2014 only Cosmic Signature NFTs can be anchored.' },
      { id: 'd', text: 'A one-time CST payment when the anchor is released.' },
    ],
    correctOptionId: 'a',
    explanation: `Random Walk NFTs anchor separately and for a different purpose: they receive draws in the Anchored-NFT Stellar Selection, ${protocolFacts.anchoredRwlkNftSelectionRecipients} per cycle, each carrying CST and a Cosmic Signature NFT. The ETH Anchor Distribution belongs exclusively to anchored Cosmic Signature NFTs \u2014 Random Walk anchoring carries no ETH.`,
    reference: { label: 'White paper \u00a78 \u2014 Anchoring', href: '/white-paper#anchoring' },
  },
  {
    id: 'exclusivity-window',
    prompt: 'How long does the Final Gesture participant hold the exclusive right to finalize?',
    options: [
      { id: 'a', text: `${protocolFacts.finalGestureExclusivityHours} hours` },
      { id: 'b', text: `${protocolFacts.initialCycleFinalizationHoursAtLaunch} hours` },
      { id: 'c', text: `${protocolFacts.initialCycleTimeIncrementHours} hour` },
      { id: 'd', text: `${protocolFacts.initialCstCalibrationWindowHours} hours` },
    ],
    correctOptionId: 'a',
    explanation: `The exclusive window is ${protocolFacts.finalGestureExclusivityHours} hours; after that, anyone may finalize and take over the beneficiary role. The ${protocolFacts.initialCycleFinalizationHoursAtLaunch}-hour figure is the initial countdown after a cycle\u2019s opening gesture \u2014 a different clock entirely.`,
    funFact: `V1 gave the Final Gesture participant only ${protocolFacts.initialCycleFinalizationHoursAtLaunch} hours of exclusivity. V2 doubled it after live cycles showed people genuinely sleep through deadlines.`,
    reference: {
      label: 'White paper \u00a73.3 \u2014 Finalization',
      href: '/white-paper#finalization',
    },
  },
  {
    id: 'escrow-timeout',
    prompt:
      'Juno was drawn in the ETH Stellar Selection but never retrieves her escrowed ETH. What happens after the timeout?',
    options: [
      {
        id: 'a',
        text: `After ${protocolFacts.secondaryRetrievalTimeoutWeeks} weeks, anyone may retrieve the unretrieved allocation for themselves.`,
      },
      { id: 'b', text: 'It returns to the Cycle Reserve.' },
      { id: 'c', text: 'It is burned.' },
      { id: 'd', text: 'It waits in escrow indefinitely until Juno appears.' },
    ],
    correctOptionId: 'a',
    explanation: `Escrowed allocations and attached assets wait ${protocolFacts.secondaryRetrievalTimeoutWeeks} weeks; after that, the contracts permit anyone to retrieve an unretrieved allocation for themselves. The rule mirrors the Open-Finalization Window: every distribution eventually reaches a hand that wants it. Retrieve promptly.`,
    reference: {
      label: 'White paper \u00a75.4 \u2014 Delivery, Escrow, and Timeouts',
      href: '/white-paper#delivery-and-timeouts',
    },
  },
  {
    id: 'push-vs-pull',
    prompt: 'Which ETH goes out directly during finalization, and which waits in escrow?',
    options: [
      {
        id: 'a',
        text: 'The Signature Allocation and Public Goods forwarding go directly; the Chrono-Warrior\u2019s ETH and the ETH Selection shares wait in the Allocations Wallet.',
      },
      { id: 'b', text: 'Everything is sent directly to every recipient.' },
      { id: 'c', text: 'Everything waits in escrow, including the beneficiary\u2019s share.' },
      { id: 'd', text: 'Only CST is escrowed; all ETH goes out directly.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Distribution is deliberately split between push and pull. The beneficiary\u2019s ETH and the Public Goods forwarding are pushed during finalization; secondary ETH allocations are placed in the Allocations Wallet for each recipient to retrieve. CST and NFTs are imprinted directly to their recipients.',
    reference: {
      label: 'White paper \u00a75.4 \u2014 Delivery, Escrow, and Timeouts',
      href: '/white-paper#delivery-and-timeouts',
    },
  },
  {
    id: 'council-proposal-threshold',
    prompt: 'How much delegated CST weight does an address need to submit a Coordination Proposal?',
    options: [
      { id: 'a', text: `At least ${protocolFacts.councilProposalThresholdCst} CST.` },
      { id: 'b', text: `At least ${cst(protocolFacts.specialAllocationCst)} CST.` },
      { id: 'c', text: `At least ${cst(protocolFacts.outreachReserveCst)} CST.` },
      { id: 'd', text: 'Any amount \u2014 there is no threshold.' },
    ],
    correctOptionId: 'a',
    explanation: `The proposal threshold is ${protocolFacts.councilProposalThresholdCst} CST of delegated weight \u2014 modest on purpose, so proposing stays accessible. The ${cst(protocolFacts.specialAllocationCst)} CST figure is the Recognition CST paired with each NFT distribution, a different constant that is easy to confuse with it.`,
    reference: {
      label: 'White paper \u00a79 \u2014 The Cosmic Council',
      href: '/white-paper#cosmic-council',
    },
  },
  {
    id: 'council-timeline',
    prompt: 'A Coordination Proposal is submitted today. What timeline follows?',
    options: [
      {
        id: 'a',
        text: `A ${protocolFacts.councilVotingDelayDays}-day coordination delay, then a ${protocolFacts.councilVotingPeriodWeeks}-week coordination period.`,
      },
      { id: 'b', text: 'It takes effect immediately if the proposer holds enough CST.' },
      {
        id: 'c',
        text: `A ${protocolFacts.secondaryRetrievalTimeoutWeeks}-week delay, then a ${protocolFacts.councilVotingDelayDays}-day coordination period.`,
      },
      {
        id: 'd',
        text: `A ${protocolFacts.finalGestureExclusivityHours}-hour delay, then it executes automatically.`,
      },
    ],
    correctOptionId: 'a',
    explanation: `Proposals wait through a ${protocolFacts.councilVotingDelayDays}-day coordination delay, then remain open for a ${protocolFacts.councilVotingPeriodWeeks}-week coordination period. The delay gives holders time to adjust delegation before the snapshot; nothing takes effect immediately.`,
    reference: {
      label: 'White paper \u00a79 \u2014 The Cosmic Council',
      href: '/white-paper#cosmic-council',
    },
  },
  {
    id: 'quorum-rule',
    prompt: 'When does a Coordination Proposal pass?',
    options: [
      {
        id: 'a',
        text: `Support exceeds Opposition, and Support plus Abstain weight reaches the ${protocolFacts.councilQuorumPercent}% Coordination Quorum.`,
      },
      { id: 'b', text: 'Support alone reaches half of the total CST supply.' },
      {
        id: 'c',
        text: `Support, Opposition, and Abstain together reach ${protocolFacts.councilQuorumPercent}%.`,
      },
      { id: 'd', text: 'The protocol owner countersigns the result.' },
    ],
    correctOptionId: 'a',
    explanation: `Two conditions must hold: Support exceeds Opposition, and Support plus Abstain reaches the Coordination Quorum of ${protocolFacts.councilQuorumPercent}% of total CST supply. Opposition weight deliberately does not count toward the quorum \u2014 opposing a proposal cannot accidentally help it reach the bar.`,
    reference: {
      label: 'White paper \u00a79 \u2014 The Cosmic Council',
      href: '/white-paper#cosmic-council',
    },
  },
  {
    id: 'weight-activation',
    prompt:
      'Rook holds CST in his wallet but has never touched the Council. How much Coordination Weight does his CST express?',
    options: [
      {
        id: 'a',
        text: 'None \u2014 weight activates only on delegation, to himself or to another address.',
      },
      { id: 'b', text: 'One unit per CST, automatically.' },
      { id: 'c', text: 'It depends on how long he has held the CST.' },
      { id: 'd', text: 'Weight comes from anchored NFTs, not CST.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Coordination Weight activates on delegation: a holder delegates to themselves or to another address, and each CST then expresses one unit of weight. Undelegated CST carries no weight at all \u2014 holding alone is not participation in coordination.',
    reference: {
      label: 'White paper \u00a77.3 \u2014 Coordination Weight',
      href: '/white-paper#coordination-weight',
    },
  },
  {
    id: 'time-increment-growth',
    prompt: 'The time increment each gesture adds began at exactly one hour. How does it evolve?',
    options: [
      {
        id: 'a',
        text: `It grows by ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% with every finalized cycle, so cycles lengthen gradually over the years.`,
      },
      { id: 'b', text: 'It is fixed at one hour forever.' },
      { id: 'c', text: 'It doubles every cycle.' },
      { id: 'd', text: 'It shrinks as more participants join.' },
    ],
    correctOptionId: 'a',
    explanation: `The increment grows by ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% with every finalized cycle. Compounding quietly does its work: cycles lengthen, the pace of NFT imprinting slows, and the protocol\u2019s tempo stretches by design as it ages.`,
    reference: {
      label: 'White paper \u00a73.2 \u2014 The Countdown',
      href: '/white-paper#countdown',
    },
  },
  {
    id: 'typical-cst-fixed',
    prompt: 'How much fixed CST does a typical cycle imprint, and how does it break down?',
    options: [
      {
        id: 'a',
        text: `${cst(protocolFacts.typicalCstImprintsPerCycle)} CST \u2014 ${cst(protocolFacts.specialAllocationCst)} CST paired with each of ${protocolFacts.typicalNftsPerCycle} NFT distributions, plus ${cst(protocolFacts.outreachReserveCst)} CST to the Outreach Reserve.`,
      },
      {
        id: 'b',
        text: `${cst(protocolFacts.specialAllocationCst)} CST, all to the cycle beneficiary.`,
      },
      {
        id: 'c',
        text: `${cst(protocolFacts.outreachReserveCst)} CST, all for community outreach.`,
      },
      { id: 'd', text: 'It varies unpredictably from cycle to cycle.' },
    ],
    correctOptionId: 'a',
    explanation: `The fixed flows are exact: ${protocolFacts.typicalNftsPerCycle} NFT-paired imprints of ${cst(protocolFacts.specialAllocationCst)} CST plus ${cst(protocolFacts.outreachReserveCst)} CST of outreach, totalling ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST in a typical cycle. Dynamic Participation CST from individual gestures is additional and depends on timing.`,
    reference: {
      label: 'White paper \u00a77.1 \u2014 Imprint Rules',
      href: '/white-paper#imprint-rules',
    },
  },
  {
    id: 'attached-assets-destination',
    prompt: 'Wren attaches an ERC-20 token to her gesture. Where does the attached asset go?',
    options: [
      {
        id: 'a',
        text: 'To the Allocations Wallet escrow \u2014 the cycle\u2019s beneficiary has priority to retrieve it after finalization.',
      },
      { id: 'b', text: 'Into the Cycle Reserve, alongside the gesture\u2019s ETH.' },
      { id: 'c', text: 'Back to Wren when the cycle finalizes.' },
      { id: 'd', text: 'It is burned at finalization.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Attached assets never join the ETH reserve. They are held by the Allocations Wallet, and the cycle\u2019s beneficiary has priority to retrieve them after finalization \u2014 subject to the same open retrieval timeout as every other escrowed allocation.',
    reference: {
      label: 'White paper \u00a74.4 \u2014 Messages and Attached Assets',
      href: '/white-paper#messages-and-attachments',
    },
  },
  {
    id: 'next-cycle-delay',
    prompt: 'A cycle has just been finalized. When does the next one activate?',
    options: [
      {
        id: 'a',
        text: `After a short delay \u2014 ${protocolFacts.defaultNextCycleDelayMinutes} minutes by default, though the live on-chain value is adjustable and governs.`,
      },
      { id: 'b', text: 'Immediately, in the same transaction.' },
      { id: 'c', text: `Exactly ${protocolFacts.finalGestureExclusivityHours} hours later.` },
      { id: 'd', text: 'Only when the owner manually starts it.' },
    ],
    correctOptionId: 'a',
    explanation: `After finalization the next cycle activates following a short delay, ${protocolFacts.defaultNextCycleDelayMinutes} minutes by default. The live delay is stored on-chain and owner-configurable, so the contract \u2014 not the default \u2014 is the source of truth. Once activated, the new cycle\u2019s Calibration Windows open.`,
    reference: {
      label: 'White paper \u00a73.3 \u2014 Finalization',
      href: '/white-paper#finalization',
    },
  },
];
