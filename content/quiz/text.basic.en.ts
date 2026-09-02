import { protocolFacts } from '@/content/protocol-facts';

import type { QuizTierQuestionsText } from './structure';

/**
 * Basic tier: the shape of the protocol. Scenario-first where possible;
 * every distractor is a misconception someone actually holds. Facts and
 * numbers interpolate from protocolFacts and match the white paper.
 */
export const basicQuestionsTextEn = {
  'what-is-cosmic-signature': {
    prompt: 'A friend asks you what Cosmic Signature actually is. Which answer is right?',
    options: {
      a: 'A procedural on-chain art protocol on Arbitrum that runs as a sequence of timed Performance Cycles.',
      b: 'An AI image service that turns text prompts into space pictures.',
      c: 'A database of cancer mutation signatures used by biologists.',
      d: 'A price-prediction service for NFT collections.',
    },
    explanation:
      'Cosmic Signature is a procedural art protocol: timed Performance Cycles fill with gestures, and finalization imprints deterministic three-body artwork. No AI is involved anywhere in the pipeline — the art is physics computed from a seed, which is the opposite of a text-prompt image service.',
    funFact:
      'The name collides with COSMIC, a well-known cancer mutation database. The protocol has nothing to do with it — a disambiguation the docs state outright.',
    referenceLabel: 'Learn: What Is Cosmic Signature?',
  },
  'what-is-a-gesture': {
    prompt: 'In protocol terms, what is a gesture?',
    options: {
      a: 'A small on-chain act carrying ETH or CST that extends the cycle countdown and records a Stellar Selection entry.',
      b: 'An off-chain signature collected for a community petition.',
      c: 'A brushstroke you draw by hand that gets added to the artwork.',
      d: 'A message posted in the community channels.',
    },
    explanation:
      'Gestures are the protocol\u2019s only input. Each one carries ETH or CST, pushes the Cycle Finalization Time further out, records one entry in the cycle\u2019s Stellar Selections, and can imprint Participation CST. You never draw anything by hand — the artwork is computed from a seed at finalization.',
    referenceLabel: 'White paper \u00a74 \u2014 Gestures',
  },
  'two-currencies': {
    prompt: 'Which currencies can a gesture carry?',
    options: {
      a: 'ETH or CST, the protocol\u2019s own ERC-20 token.',
      b: 'Only ETH.',
      c: 'Only CST.',
      d: 'Any ERC-20, including stablecoins.',
    },
    explanation:
      'There are exactly two ways in: ETH gestures and CST gestures. Other ERC-20 tokens can be attached to a gesture as a carried asset, but they never pay for the gesture itself — the Gesture Cost is settled in ETH or CST only.',
    referenceLabel: 'White paper \u00a74 \u2014 Gestures',
  },
  'countdown-extension': {
    prompt:
      'Nova makes a gesture while the cycle countdown shows plenty of time left. What does her gesture do to the clock?',
    options: {
      a: 'It adds the current time increment to the stored Cycle Finalization Time.',
      b: `It resets the countdown to a fresh ${protocolFacts.initialCycleFinalizationHoursAtLaunch} hours.`,
      c: 'It shortens the countdown, pushing the cycle toward finalization.',
      d: 'Nothing \u2014 only ETH gestures move the clock.',
    },
    explanation: `Every gesture, whether ETH or CST, adds the current time increment to the stored finalization time. Nothing ever resets the clock to a fixed window \u2014 the ${protocolFacts.initialCycleFinalizationHoursAtLaunch}-hour figure is only the initial countdown after a cycle\u2019s opening gesture at launch parameters.`,
    referenceLabel: 'White paper \u00a73.2 \u2014 The Countdown',
  },
  'final-gesture-role': {
    prompt: 'The countdown has just expired. Who is eligible to finalize the cycle first?',
    options: {
      a: 'The participant whose gesture stands last \u2014 the Final Gesture.',
      b: 'The participant who made the most gestures during the cycle.',
      c: 'The protocol owner.',
      d: 'The participant who made the cycle\u2019s opening gesture.',
    },
    explanation:
      'When the Cycle Finalization Time expires, the Final Gesture participant becomes eligible to finalize, exclusively at first. Volume never matters here: a single well-timed gesture that stands last outranks a hundred earlier ones.',
    referenceLabel: 'White paper \u00a73.3 \u2014 Finalization',
  },
  'sleepy-beneficiary': {
    prompt:
      'The countdown expired two days ago and the Final Gesture participant has gone silent. You call finalize from your own wallet. What happens?',
    options: {
      a: 'The cycle finalizes and you become its beneficiary \u2014 the ETH share, the CST, and the NFT are yours.',
      b: 'The transaction reverts; only the Final Gesture participant can ever finalize.',
      c: 'The cycle finalizes, but the Final Gesture participant still receives everything.',
      d: 'Nothing happens until the Cosmic Council votes to intervene.',
    },
    explanation: `The Final Gesture participant holds the right exclusively for ${protocolFacts.finalGestureExclusivityHours} hours. After that, the Open-Finalization Window begins: anyone may finalize, and the contract treats whoever does as the cycle\u2019s beneficiary, with everything the role carries. The rule is deliberately unforgiving \u2014 it keeps the protocol alive if a participant disappears, and it prices carelessness.`,
    funFact:
      'Nothing in the protocol waits forever on an absent participant. Every deadline eventually opens to the first caller.',
    referenceLabel: 'White paper \u00a73.3 \u2014 Finalization',
  },
  'signature-allocation-share': {
    prompt: 'What share of the Cycle Reserve does the Signature Allocation carry at finalization?',
    options: {
      a: `${protocolFacts.mainEthPercentage}%`,
      b: `${protocolFacts.chronoWarriorEthPercentage}%`,
      c: `${protocolFacts.compoundingReservePercentage}%`,
      d: `${protocolFacts.publicGoodsPercentage}%`,
    },
    explanation: `The Signature Allocation is ${protocolFacts.mainEthPercentage}% of the protocol\u2019s ETH balance, read once at the moment of finalization. The ${protocolFacts.compoundingReservePercentage}% figure is the share that is not distributed at all \u2014 it rolls forward as the Compounding Cycle Reserve.`,
    referenceLabel: 'White paper \u00a75.1 \u2014 Distribution at Finalization',
  },
  'compounding-reserve': {
    prompt: 'Why does each Performance Cycle open with a larger reserve than the last?',
    options: {
      a: `About ${protocolFacts.compoundingReservePercentage}% of every cycle\u2019s reserve is never distributed \u2014 it rolls forward into the next cycle.`,
      b: 'The team tops the reserve up between cycles.',
      c: 'The protocol imprints new ETH each cycle.',
      d: 'The Cosmic Council votes fresh ETH into the reserve.',
    },
    explanation:
      'The five distributed ETH tracks sum to half of the reserve; the remainder compounds automatically. No one tops anything up, and no protocol can imprint ETH \u2014 the growth is purely mechanical. The protocol accumulates rather than extracts.',
    referenceLabel: 'White paper \u00a75.1 \u2014 Distribution at Finalization',
  },
  'art-engine': {
    prompt: 'What actually generates a Cosmic Signature artwork?',
    options: {
      a: 'A deterministic physics simulation of the gravitational three-body problem, seeded from on-chain data.',
      b: 'A diffusion model fine-tuned on space photography.',
      c: 'An artist who paints each piece and uploads it.',
      d: 'A random pixel generator with a space color palette.',
    },
    explanation:
      'Three bodies of comparable mass orbit under Newtonian gravity; the seed decides the starting conditions and physics does the rest. No generative model is involved at any stage \u2014 no training data, no sampling, no prompt. Chaos theory, not randomness, is what makes every Signature unique.',
    funFact:
      'The three-body problem has no general closed-form solution. An imperceptible change in starting conditions produces a completely different dance.',
    referenceLabel: 'White paper \u00a76 \u2014 The Art',
  },
  'same-seed': {
    prompt:
      'You re-run the open-source art pipeline with the exact seed stored on-chain for token #42. What comes out?',
    options: {
      a: 'The identical image, pixel for pixel, on any machine.',
      b: 'A similar image with small random variations.',
      c: 'A different image on different hardware.',
      d: 'Only a low-resolution preview; the full art needs the project servers.',
    },
    explanation:
      'Determinism is enforced, not assumed: the same seed produces the same image, bit for bit, on any machine. SHA-256 hashes of rendered frames are asserted in continuous integration, so a drift in output would fail the build.',
    referenceLabel: 'White paper \u00a76.2 \u2014 Reproducibility and License',
  },
  'cst-supply-origin': {
    prompt: 'Where does CST come from?',
    options: {
      a: 'Supply starts at zero, and only the protocol contract can imprint it \u2014 every CST traces back to participation in a cycle.',
      b: 'A large allocation was created for the team at launch.',
      c: 'It was distributed for free to early wallets before launch.',
      d: 'Anyone can imprint CST by calling the token contract.',
    },
    explanation:
      'The CST token contract accepts imprint and burn instructions only from the protocol contract, and supply started at zero. There is no cap, no premine, and no team allocation \u2014 patient participation is the only source of new CST.',
    referenceLabel: 'White paper \u00a77 \u2014 The CST Token',
  },
  'cst-on-spend': {
    prompt: 'Rio spends a handful of CST on a gesture. Where does that CST go?',
    options: {
      a: 'It is burned \u2014 permanently removed from supply.',
      b: 'It goes to the team\u2019s treasury.',
      c: 'It joins the Cycle Reserve and is redistributed at finalization.',
      d: 'It is returned to Rio when the cycle finalizes.',
    },
    explanation:
      'The full cost of every CST gesture is burned. That ties the token\u2019s supply to actual use: quiet cycles imprint little, and heavy CST activity burns supply back down. Nothing flows to any treasury \u2014 there is none.',
    referenceLabel: 'White paper \u00a77.2 \u2014 Burning and Supply Dynamics',
  },
  'public-goods-beneficiary': {
    prompt: `Every cycle forwards ${protocolFacts.publicGoodsPercentage}% of the reserve as the Public Goods Allocation. Who receives it today?`,
    options: {
      a: 'Protocol Guild \u2014 the funding mechanism for more than 170 Ethereum core contributors.',
      b: 'The protocol team\u2019s operations wallet.',
      c: 'Arbitrum validators.',
      d: 'A randomly selected NFT holder.',
    },
    explanation:
      'The Public Goods Vault forwards its share to Protocol Guild, and the forwarding is enforced on-chain as part of finalization \u2014 no one decides each cycle whether to honor it. The reasoning: a protocol that lives on public infrastructure should fund it mechanically, on a schedule, in public.',
    referenceLabel: 'White paper \u00a710 \u2014 Public Goods',
  },
  'anchoring-basic': {
    prompt:
      'Mira anchors her Cosmic Signature NFT to the protocol. What does anchoring do for her?',
    options: {
      a: `While anchored, the NFT accrues a proportional share of each cycle\u2019s ${protocolFacts.anchorDistributionPercentage}% Anchor Distribution, retrieved when the anchor is released.`,
      b: 'It lists the NFT for sale on the marketplace.',
      c: 'It converts the NFT into CST.',
      d: 'It re-renders the artwork with a new seed.',
    },
    explanation:
      'Anchoring is the protocol\u2019s form of long-term alignment: anchored Cosmic Signature NFTs share the Anchor Distribution pro rata, and the accrued ETH is retrieved at release. The NFT itself never changes \u2014 its seed and artwork are permanent.',
    referenceLabel: 'White paper \u00a78 \u2014 Anchoring',
  },
  'anchor-once-ever': {
    prompt: 'Mira later releases her anchor. Can she anchor that NFT again next month?',
    options: {
      a: 'No \u2014 each NFT can be anchored only once, ever. Releasing is permanent.',
      b: 'Yes, after a short cooldown.',
      c: 'Yes, by paying an extra cost.',
      d: 'Yes, but only during the same cycle.',
    },
    explanation:
      'The once-ever rule replaces the usual lock-up schedule with a single irreversible choice, giving the anchored set a real cost of exit. Whether to keep an NFT anchored is a live decision every cycle; whether to release it is a permanent one.',
    referenceLabel: 'White paper \u00a78 \u2014 Anchoring',
  },
  'random-walk-perk': {
    prompt: 'Sol owns a Random Walk NFT and attaches it to an ETH gesture. What happens?',
    options: {
      a: `That gesture\u2019s cost drops by ${protocolFacts.randomWalkDiscountPercentage}%; the NFT stays in Sol\u2019s wallet but is marked used, once ever.`,
      b: 'The NFT is transferred to the protocol in exchange for the reduction.',
      c: 'The gesture becomes free.',
      d: 'The NFT doubles the Participation CST the gesture imprints.',
    },
    explanation: `Attaching a Random Walk NFT reduces one ETH gesture\u2019s cost by ${protocolFacts.randomWalkDiscountPercentage}%. The NFT is not transferred \u2014 the contract simply marks it used. Each Random Walk NFT can be attached exactly once across all cycles, which makes the reduction a consumable resource.`,
    referenceLabel: 'White paper \u00a74.2 \u2014 Random Walk NFT Attachment',
  },
  'first-gesture-currency': {
    prompt: 'A new cycle has just activated. Which gesture can open it?',
    options: {
      a: 'An ETH gesture \u2014 CST gestures become available from the second gesture onward.',
      b: 'A CST gesture, since CST is the protocol\u2019s own token.',
      c: 'Either currency works for the opening gesture.',
      d: 'Only the protocol owner can open a cycle.',
    },
    explanation:
      'Every cycle must open with an ETH gesture, priced by the ETH Calibration Window. Once the cycle is under way, CST offers a second way in. No privileged account opens cycles \u2014 whoever makes the opening gesture does.',
    referenceLabel: 'White paper \u00a74.3 \u2014 CST Gestures',
  },
  'message-on-gesture': {
    prompt: 'Besides value, what can a gesture carry?',
    options: {
      a: `A message of up to ${protocolFacts.gestureMessageMaxLength} bytes recorded on-chain, plus attached ERC-20 tokens or an ERC-721 NFT.`,
      b: 'Nothing \u2014 gestures are value transfers only.',
      c: 'An image file stored in the contract.',
      d: 'Unlimited text, stored off-chain.',
    },
    explanation: `A gesture may carry a message of up to ${protocolFacts.gestureMessageMaxLength} bytes, recorded on-chain alongside it, and may attach tokens or an NFT. Attached assets are held by the Allocations Wallet, where the cycle\u2019s beneficiary has priority to retrieve them after finalization.`,
    funFact:
      'Every message ever attached to a gesture is permanently readable on Arbitrum \u2014 a public guest book woven through the cycles.',
    referenceLabel: 'White paper \u00a74.4 \u2014 Messages and Attached Assets',
  },
  'who-runs-cycles': {
    prompt: 'Who decides how each cycle\u2019s ETH is distributed?',
    options: {
      a: 'No one \u2014 allocation percentages are constants in verified contracts, executed mechanically at finalization.',
      b: 'The team reviews each cycle and signs the distribution.',
      c: 'An oracle service computes the split.',
      d: 'The app\u2019s backend servers issue the transfers.',
    },
    explanation:
      'Mechanical distribution is one of the protocol\u2019s three anchoring properties: no discretionary account sits between participants and the distribution rules, and no team wallet receives ETH from gestures. The app and servers only display what the contracts already did.',
    referenceLabel: 'White paper \u00a71 \u2014 Introduction',
  },
  'nft-count-typical': {
    prompt: 'How many Cosmic Signature NFTs does a typical cycle imprint?',
    options: {
      a: `${protocolFacts.typicalNftsPerCycle}`,
      b: '1',
      c: `${protocolFacts.nftStellarSelectionRecipients}`,
      d: '100',
    },
    explanation: `A typical cycle imprints ${protocolFacts.typicalNftsPerCycle} NFTs: ${protocolFacts.roleNftsPerCycle} role NFTs (beneficiary, Chrono-Warrior, Endurance Champion, Final CST Gesture), ${protocolFacts.nftStellarSelectionRecipients} participant Stellar Selection NFTs, and ${protocolFacts.anchoredRwlkNftSelectionRecipients} anchored-Random-Walk Selection NFTs. Cycles that skip a track imprint fewer.`,
    referenceLabel: 'White paper \u00a75.1 \u2014 Distribution at Finalization',
  },
  'chrono-endurance-exist': {
    prompt: 'What do the Endurance Champion and Chrono-Warrior tracks measure?',
    options: {
      a: 'Persistence over time \u2014 not who gestured last or most.',
      b: 'Who spent the most ETH during the cycle.',
      c: 'Who made the largest number of gestures.',
      d: 'Who gestured first when the cycle opened.',
    },
    explanation:
      'Both tracks measure persistence rather than position: the Endurance Champion held the most-recent-gesture spot for the longest unbroken interval, and the Chrono-Warrior held the Endurance Champion title itself the longest. Spending more or gesturing more does not directly decide either.',
    referenceLabel: 'White paper \u00a75.2 \u2014 Endurance Champion and Chrono-Warrior',
  },
  'stellar-selection-what': {
    prompt: 'What are Stellar Selections?',
    options: {
      a: 'Per-gesture entries recorded during the cycle, from which the contract draws recipients at finalization.',
      b: 'A leaderboard ranking participants by activity.',
      c: 'Rarity tiers assigned to the NFT artwork.',
      d: 'A scheme for naming constellations in the art.',
    },
    explanation:
      'Each gesture records one entry in the cycle\u2019s Selection pool. At finalization the contract draws entries for the ETH and NFT Stellar Selections, so selection frequency is proportional to participation. It is a distribution mechanism, not a ranking.',
    referenceLabel: 'White paper \u00a75.3 \u2014 Stellar Selections',
  },
  'ecosystem-optionality': {
    prompt:
      'The app, the marketplace, and the prediction venue all go offline for a day. What can you still do?',
    options: {
      a: 'Everything \u2014 every mechanic can be exercised directly against the contracts.',
      b: 'Nothing until the app returns.',
      c: 'Only retrieve allocations, not gesture.',
      d: 'Only gesture with CST, not ETH.',
    },
    explanation:
      'The ecosystem around the contracts \u2014 the app, Axiom Zero, Uniswap liquidity, Chaos Zero \u2014 is convenience, not dependency. None of it is required: gestures, finalization, anchoring, and retrieval all work by calling the verified contracts directly.',
    referenceLabel: 'White paper \u00a72 \u2014 Protocol Overview',
  },
  'what-it-is-not': {
    prompt: 'Which statement matches how the white paper describes the protocol\u2019s nature?',
    options: {
      a: 'Participants exchange value for participation itself, and the protocol retains no operator\u2019s margin of any kind.',
      b: 'Acquiring CST is a reliable path to financial gain from the efforts of others.',
      c: 'An operator keeps a percentage of every cycle for itself.',
      d: 'The protocol promises that NFT values will rise over time.',
    },
    explanation:
      'Every allocation track flows to participants, to anchored NFTs, to the compounding reserve, or to public goods \u2014 there is no operator\u2019s margin. The paper makes no promises about price, liquidity, or future value, and says plainly that no one should acquire CST or the NFTs expecting financial gain from the efforts of others.',
    referenceLabel: 'White paper \u00a714.1 \u2014 What Cosmic Signature Is Not',
  },
  'where-recorded': {
    prompt: 'Where do gestures, seeds, and cycle history actually live?',
    options: {
      a: 'On-chain, on Arbitrum One \u2014 an Ethereum Layer 2 network.',
      b: 'In the project\u2019s private database.',
      c: 'Only in IPFS files pinned by the team.',
      d: 'They are not recorded; only totals are kept.',
    },
    explanation:
      'The protocol runs on Arbitrum One, and the important records \u2014 every gesture, every seed, every allocation \u2014 are on-chain. That is what makes the art reproducible and the distribution auditable by anyone, without trusting any server.',
    referenceLabel: 'Learn: Cosmic Signature on Arbitrum',
  },
} as const satisfies QuizTierQuestionsText<'basic'>;
