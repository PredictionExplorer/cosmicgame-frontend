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
      a: `The ETH Calibration Window starts at ${protocolFacts.ethCalibrationCeilingMultiplier}x the previous cycle\u2019s opening cost paid and declines linearly toward a floor of one two-hundredth of that, plus one wei.`,
      b: `Every cycle opens at a fixed ${protocolFacts.initialGestureCostEth} ETH.`,
      c: 'The Cosmic Council votes on each cycle\u2019s opening cost.',
      d: 'The cost doubles every hour until someone gestures.',
    },
    explanation: `This is price discovery without an order book: if the previous cycle opened too cheap, the doubling restores headroom; if the doubled value proves too high, the descent finds the level at which someone is willing to begin. Only the very first cycle used a fixed ${protocolFacts.initialGestureCostEth} ETH \u2014 every cycle since calibrates from its predecessor.`,
    referenceLabel: 'White paper \u00a73.1 \u2014 The ETH Calibration Window',
  },
  'eth-step-up': {
    prompt: 'Pax makes an ETH gesture. What happens to the cost of the next ETH gesture?',
    options: {
      a: `It rises by ${protocolFacts.ethGestureCostStepUpPercent}%, plus one wei \u2014 the sequence is public and exact.`,
      b: 'It doubles.',
      c: 'It stays the same until the cycle finalizes.',
      d: `It falls by ${protocolFacts.ethGestureCostStepUpPercent}% to invite more activity.`,
    },
    explanation: `After the opening gesture, each ETH gesture raises the next ETH Gesture Cost by ${protocolFacts.ethGestureCostStepUpPercent}%, plus one wei, so the cost always grows. Anyone can read the current cost from the contract before acting \u2014 there are no surprises, only a rising staircase.`,
    funFact:
      'The extra wei matters: it guarantees strict growth even when a cost is so small that a percentage of it rounds to zero.',
    referenceLabel: 'White paper \u00a74.1 \u2014 ETH Gestures',
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
      'Overpayment above a dust threshold is refunded in the same transaction. Below that threshold a refund would cost more in gas than it returns, so the difference stays in the reserve \u2014 a deliberate courtesy cutoff, not a penalty.',
    referenceLabel: 'White paper \u00a74.1 \u2014 ETH Gestures',
  },
  'cst-window-restart': {
    prompt: 'Lyra makes a CST gesture. What does that do to the CST Calibration Window?',
    options: {
      a: `It restarts the window from ${protocolFacts.cstCalibrationCeilingMultiplier}x the cost she just paid \u2014 never below ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST \u2014 descending linearly to zero again.`,
      b: 'Nothing \u2014 the window keeps descending where it was.',
      c: `The cost locks at ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST for the rest of the cycle.`,
      d: 'The window closes and CST gestures pause until the next cycle.',
    },
    explanation: `Every CST gesture restarts the window from its new starting value: ${protocolFacts.cstCalibrationCeilingMultiplier}x the last cost paid, with a floor of ${cst(protocolFacts.cstCalibrationCeilingMinCst)} CST on the starting point. From there the cost descends linearly to zero over the window\u2019s duration. The CST spent is burned along the way.`,
    referenceLabel: 'White paper \u00a74.3 \u2014 CST Gestures',
  },
  'cst-free-quiet': {
    prompt:
      'The protocol has been quiet for a long stretch, and the CST Calibration Window has fully elapsed. What is now true?',
    options: {
      a: 'A CST gesture costs almost nothing \u2014 anyone holding even a small CST balance can extend the cycle.',
      b: 'The cycle finalizes itself automatically.',
      c: 'CST gestures are disabled until an ETH gesture arrives.',
      d: 'The CST cost has risen to its ceiling.',
    },
    explanation:
      'The descent can reach zero, and that is intentional: it guarantees the cycle can always be extended by anyone holding a little CST. Cycles never finalize themselves \u2014 finalization is always a transaction someone sends.',
    referenceLabel: 'White paper \u00a74.3 \u2014 CST Gestures',
  },
  'window-feedback-loop': {
    prompt:
      'A burst of ETH gestures sweeps through the cycle. What does that do to the CST Calibration Window\u2019s duration?',
    options: {
      a: `Each ETH gesture shortens it by about ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%, so the CST cost descends faster and CST gestures become attractive sooner.`,
      b: `Each ETH gesture lengthens it by about ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%, slowing the CST descent.`,
      c: 'Nothing \u2014 the two currencies are independent.',
      d: 'The window resets to its original duration.',
    },
    explanation: `The window\u2019s duration is a live parameter and one of the protocol\u2019s quieter feedback loops: ETH gestures shorten it by about ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}% each, CST gestures lengthen it by about ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}% each. Heavy ETH activity speeds the CST descent, and heavy CST activity slows it back down \u2014 nudging every cycle toward a balanced mix.`,
    referenceLabel: 'White paper \u00a74.3 \u2014 CST Gestures',
  },
  'participation-cst-timing': {
    prompt:
      'Two gestures imprint Participation CST at launch parameters: one lands 1 second after the previous gesture, the other ends a full day of silence. Roughly how much does each imprint?',
    options: {
      a: `About ${oneSecondExample.cst} CST and about ${oneDayExample.cst} CST \u2014 the amount grows with the square root of the elapsed time.`,
      b: `A flat ${cst(100)} CST each, regardless of timing.`,
      c: 'Equal amounts \u2014 timing never matters.',
      d: 'Zero for both \u2014 only finalization imprints CST.',
    },
    explanation: `Participation CST grows with the square root of the time since the previous gesture: a gesture arriving one second later imprints almost nothing (about ${oneSecondExample.cst} CST), while one that ends a day of silence imprints hundreds (about ${oneDayExample.cst} CST). The flat ${cst(100)} CST per gesture was the original V1 rule \u2014 it turned machine-speed sequences into free CST, which is exactly why V2 replaced it.`,
    funFact:
      'Patience is the only way to imprint meaningful CST. A bot spamming gestures every second imprints approximately zero.',
    referenceLabel: 'White paper \u00a77.1 \u2014 Imprint Rules',
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
    referenceLabel: 'White paper \u00a74.3 \u2014 CST Gestures',
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
      'Ari\u2019s ten-hour record from the previous question stands unchallenged for two more days before Bea beats it. Who is the Chrono-Warrior measuring?',
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
      a: `${protocolFacts.ethStellarSelectionRecipients} entries are drawn from the cycle\u2019s gesture pool and share ${protocolFacts.stellarSelectionEthPercentage}% of the reserve equally.`,
      b: `${protocolFacts.nftStellarSelectionRecipients} entries are drawn, each receiving ETH and an NFT.`,
      c: 'One entry is drawn and receives the full share.',
      d: 'Every participant receives an equal share.',
    },
    explanation: `The ETH Stellar Selection draws ${protocolFacts.ethStellarSelectionRecipients} entries, which share ${protocolFacts.stellarSelectionEthPercentage}% of the reserve equally. The ${protocolFacts.nftStellarSelectionRecipients}-entry figure belongs to the separate NFT Stellar Selection, which carries CST and NFTs rather than ETH.`,
    referenceLabel: 'White paper \u00a75.3 \u2014 Stellar Selections',
  },
  'nft-selection-count': {
    prompt: 'What does each NFT Stellar Selection recipient receive, and how many are drawn?',
    options: {
      a: `${cst(protocolFacts.specialAllocationCst)} CST and one Cosmic Signature NFT, drawn ${protocolFacts.nftStellarSelectionRecipients} times from the gesture pool.`,
      b: `A share of ETH, drawn ${protocolFacts.ethStellarSelectionRecipients} times.`,
      c: `${cst(protocolFacts.outreachReserveCst)} CST, drawn once.`,
      d: `One NFT only, drawn ${protocolFacts.typicalNftsPerCycle} times.`,
    },
    explanation: `The NFT Stellar Selection draws ${protocolFacts.nftStellarSelectionRecipients} entries; each carries ${cst(protocolFacts.specialAllocationCst)} CST and one NFT. Recognition CST always travels with its NFT \u2014 every NFT distribution at finalization pairs the two.`,
    referenceLabel: 'White paper \u00a75.1 \u2014 Distribution at Finalization',
  },
  'draws-with-replacement': {
    prompt:
      'Can the same participant be drawn more than once in a cycle\u2019s Stellar Selections?',
    options: {
      a: 'Yes \u2014 draws are made with replacement, and entries scale with gestures made.',
      b: 'No \u2014 each participant can be drawn at most once.',
      c: 'Only participants with ten or more gestures can repeat.',
      d: 'Only if the Cosmic Council approves the repeat.',
    },
    explanation:
      'Draws are made with replacement, so the same participant can be drawn more than once. Each gesture records one entry, which makes selection frequency proportional to participation \u2014 the mechanism scales with activity instead of rationing one draw per address.',
    referenceLabel: 'White paper \u00a75.3 \u2014 Stellar Selections',
  },
  'anchored-rwlk-track': {
    prompt: 'What do anchored Random Walk NFTs receive from a cycle?',
    options: {
      a: `${protocolFacts.anchoredRwlkNftSelectionRecipients} draws of ${cst(protocolFacts.specialAllocationCst)} CST plus a Cosmic Signature NFT each, weighted by NFTs anchored \u2014 and no ETH.`,
      b: `A pro-rata share of the ${protocolFacts.anchorDistributionPercentage}% ETH Anchor Distribution.`,
      c: 'Nothing \u2014 only Cosmic Signature NFTs can be anchored.',
      d: 'A one-time CST payment when the anchor is released.',
    },
    explanation: `Random Walk NFTs anchor separately and for a different purpose: they receive draws in the Anchored-NFT Stellar Selection, ${protocolFacts.anchoredRwlkNftSelectionRecipients} per cycle, each carrying CST and a Cosmic Signature NFT. The ETH Anchor Distribution belongs exclusively to anchored Cosmic Signature NFTs \u2014 Random Walk anchoring carries no ETH.`,
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
    funFact: `V1 gave the Final Gesture participant only ${protocolFacts.initialCycleFinalizationHoursAtLaunch} hours of exclusivity. V2 doubled it after live cycles showed people genuinely sleep through deadlines.`,
    referenceLabel: 'White paper \u00a73.3 \u2014 Finalization',
  },
  'escrow-timeout': {
    prompt:
      'Juno was drawn in the ETH Stellar Selection but never retrieves her escrowed ETH. What happens after the timeout?',
    options: {
      a: `After ${protocolFacts.secondaryRetrievalTimeoutWeeks} weeks, anyone may retrieve the unretrieved allocation for themselves.`,
      b: 'It returns to the Cycle Reserve.',
      c: 'It is burned.',
      d: 'It waits in escrow indefinitely until Juno appears.',
    },
    explanation: `Escrowed allocations and attached assets wait ${protocolFacts.secondaryRetrievalTimeoutWeeks} weeks; after that, the contracts permit anyone to retrieve an unretrieved allocation for themselves. The rule mirrors the Open-Finalization Window: every distribution eventually reaches a hand that wants it. Retrieve promptly.`,
    referenceLabel: 'White paper \u00a75.4 \u2014 Delivery, Escrow, and Timeouts',
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
    referenceLabel: 'White paper \u00a75.4 \u2014 Delivery, Escrow, and Timeouts',
  },
  'council-proposal-threshold': {
    prompt: 'How much delegated CST weight does an address need to submit a Coordination Proposal?',
    options: {
      a: `At least ${protocolFacts.councilProposalThresholdCst} CST.`,
      b: `At least ${cst(protocolFacts.specialAllocationCst)} CST.`,
      c: `At least ${cst(protocolFacts.outreachReserveCst)} CST.`,
      d: 'Any amount \u2014 there is no threshold.',
    },
    explanation: `The proposal threshold is ${protocolFacts.councilProposalThresholdCst} CST of delegated weight \u2014 modest on purpose, so proposing stays accessible. The ${cst(protocolFacts.specialAllocationCst)} CST figure is the Recognition CST paired with each NFT distribution, a different constant that is easy to confuse with it.`,
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
    explanation: `The increment grows by ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% with every finalized cycle. Compounding quietly does its work: cycles lengthen, the pace of NFT imprinting slows, and the protocol\u2019s tempo stretches by design as it ages.`,
    referenceLabel: 'White paper \u00a73.2 \u2014 The Countdown',
  },
  'typical-cst-fixed': {
    prompt: 'How much fixed CST does a typical cycle imprint, and how does it break down?',
    options: {
      a: `${cst(protocolFacts.typicalCstImprintsPerCycle)} CST \u2014 ${cst(protocolFacts.specialAllocationCst)} CST paired with each of ${protocolFacts.typicalNftsPerCycle} NFT distributions, plus ${cst(protocolFacts.outreachReserveCst)} CST to the Outreach Reserve.`,
      b: `${cst(protocolFacts.specialAllocationCst)} CST, all to the cycle beneficiary.`,
      c: `${cst(protocolFacts.outreachReserveCst)} CST, all for community outreach.`,
      d: 'It varies unpredictably from cycle to cycle.',
    },
    explanation: `The fixed flows are exact: ${protocolFacts.typicalNftsPerCycle} NFT-paired imprints of ${cst(protocolFacts.specialAllocationCst)} CST plus ${cst(protocolFacts.outreachReserveCst)} CST of outreach, totalling ${cst(protocolFacts.typicalCstImprintsPerCycle)} CST in a typical cycle. Dynamic Participation CST from individual gestures is additional and depends on timing.`,
    referenceLabel: 'White paper \u00a77.1 \u2014 Imprint Rules',
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
    referenceLabel: 'White paper \u00a74.4 \u2014 Messages and Attached Assets',
  },
  'next-cycle-delay': {
    prompt: 'A cycle has just been finalized. When does the next one activate?',
    options: {
      a: `After a short delay \u2014 ${protocolFacts.defaultNextCycleDelayMinutes} minutes by default, though the live on-chain value is adjustable and governs.`,
      b: 'Immediately, in the same transaction.',
      c: `Exactly ${protocolFacts.finalGestureExclusivityHours} hours later.`,
      d: 'Only when the owner manually starts it.',
    },
    explanation: `After finalization the next cycle activates following a short delay, ${protocolFacts.defaultNextCycleDelayMinutes} minutes by default. The live delay is stored on-chain and owner-configurable, so the contract \u2014 not the default \u2014 is the source of truth. Once activated, the new cycle\u2019s Calibration Windows open.`,
    referenceLabel: 'White paper \u00a73.3 \u2014 Finalization',
  },
} as const satisfies QuizTierQuestionsText<'medium'>;
