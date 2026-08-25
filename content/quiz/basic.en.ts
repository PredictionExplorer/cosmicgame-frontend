import { protocolFacts } from '@/content/protocol-facts';

import type { QuizQuestion } from './types';

/**
 * Basic tier: the shape of the protocol. Scenario-first where possible;
 * every distractor is a misconception someone actually holds. Facts and
 * numbers interpolate from protocolFacts and match the white paper.
 */
export const basicQuestionsEn: readonly QuizQuestion[] = [
  {
    id: 'what-is-cosmic-signature',
    prompt: 'A friend asks you what Cosmic Signature actually is. Which answer is right?',
    options: [
      {
        id: 'a',
        text: 'A procedural on-chain art protocol on Arbitrum that runs as a sequence of timed Performance Cycles.',
      },
      {
        id: 'b',
        text: 'An AI image service that turns text prompts into space pictures.',
      },
      {
        id: 'c',
        text: 'A database of cancer mutation signatures used by biologists.',
      },
      {
        id: 'd',
        text: 'A price-prediction service for NFT collections.',
      },
    ],
    correctOptionId: 'a',
    explanation:
      'Cosmic Signature is a procedural art protocol: timed Performance Cycles fill with gestures, and finalization imprints deterministic three-body artwork. No AI is involved anywhere in the pipeline — the art is physics computed from a seed, which is the opposite of a text-prompt image service.',
    funFact:
      'The name collides with COSMIC, a well-known cancer mutation database. The protocol has nothing to do with it — a disambiguation the docs state outright.',
    reference: {
      label: 'Learn: What Is Cosmic Signature?',
      href: '/learn/what-is-cosmic-signature',
    },
  },
  {
    id: 'what-is-a-gesture',
    prompt: 'In protocol terms, what is a gesture?',
    options: [
      {
        id: 'a',
        text: 'A small on-chain act carrying ETH or CST that extends the cycle countdown and records a Stellar Selection entry.',
      },
      { id: 'b', text: 'An off-chain signature collected for a community petition.' },
      { id: 'c', text: 'A brushstroke you draw by hand that gets added to the artwork.' },
      { id: 'd', text: 'A message posted in the community channels.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Gestures are the protocol\u2019s only input. Each one carries ETH or CST, pushes the Cycle Finalization Time further out, records one entry in the cycle\u2019s Stellar Selections, and can imprint Participation CST. You never draw anything by hand — the artwork is computed from a seed at finalization.',
    reference: { label: 'White paper \u00a74 \u2014 Gestures', href: '/white-paper#gestures' },
  },
  {
    id: 'two-currencies',
    prompt: 'Which currencies can a gesture carry?',
    options: [
      { id: 'a', text: 'ETH or CST, the protocol\u2019s own ERC-20 token.' },
      { id: 'b', text: 'Only ETH.' },
      { id: 'c', text: 'Only CST.' },
      { id: 'd', text: 'Any ERC-20, including stablecoins.' },
    ],
    correctOptionId: 'a',
    explanation:
      'There are exactly two ways in: ETH gestures and CST gestures. Other ERC-20 tokens can be attached to a gesture as a carried asset, but they never pay for the gesture itself — the Gesture Cost is settled in ETH or CST only.',
    reference: { label: 'White paper \u00a74 \u2014 Gestures', href: '/white-paper#gestures' },
  },
  {
    id: 'countdown-extension',
    prompt:
      'Nova makes a gesture while the cycle countdown shows plenty of time left. What does her gesture do to the clock?',
    options: [
      {
        id: 'a',
        text: 'It adds the current time increment to the stored Cycle Finalization Time.',
      },
      {
        id: 'b',
        text: `It resets the countdown to a fresh ${protocolFacts.initialCycleFinalizationHoursAtLaunch} hours.`,
      },
      { id: 'c', text: 'It shortens the countdown, pushing the cycle toward finalization.' },
      { id: 'd', text: 'Nothing \u2014 only ETH gestures move the clock.' },
    ],
    correctOptionId: 'a',
    explanation: `Every gesture, whether ETH or CST, adds the current time increment to the stored finalization time. Nothing ever resets the clock to a fixed window \u2014 the ${protocolFacts.initialCycleFinalizationHoursAtLaunch}-hour figure is only the initial countdown after a cycle\u2019s opening gesture at launch parameters.`,
    reference: {
      label: 'White paper \u00a73.2 \u2014 The Countdown',
      href: '/white-paper#countdown',
    },
  },
  {
    id: 'final-gesture-role',
    prompt: 'The countdown has just expired. Who is eligible to finalize the cycle first?',
    options: [
      { id: 'a', text: 'The participant whose gesture stands last \u2014 the Final Gesture.' },
      { id: 'b', text: 'The participant who made the most gestures during the cycle.' },
      { id: 'c', text: 'The protocol owner.' },
      { id: 'd', text: 'The participant who made the cycle\u2019s opening gesture.' },
    ],
    correctOptionId: 'a',
    explanation:
      'When the Cycle Finalization Time expires, the Final Gesture participant becomes eligible to finalize, exclusively at first. Volume never matters here: a single well-timed gesture that stands last outranks a hundred earlier ones.',
    reference: {
      label: 'White paper \u00a73.3 \u2014 Finalization',
      href: '/white-paper#finalization',
    },
  },
  {
    id: 'sleepy-beneficiary',
    prompt:
      'The countdown expired two days ago and the Final Gesture participant has gone silent. You call finalize from your own wallet. What happens?',
    options: [
      {
        id: 'a',
        text: 'The cycle finalizes and you become its beneficiary \u2014 the ETH share, the CST, and the NFT are yours.',
      },
      {
        id: 'b',
        text: 'The transaction reverts; only the Final Gesture participant can ever finalize.',
      },
      {
        id: 'c',
        text: 'The cycle finalizes, but the Final Gesture participant still receives everything.',
      },
      { id: 'd', text: 'Nothing happens until the Cosmic Council votes to intervene.' },
    ],
    correctOptionId: 'a',
    explanation: `The Final Gesture participant holds the right exclusively for ${protocolFacts.finalGestureExclusivityHours} hours. After that, the Open-Finalization Window begins: anyone may finalize, and the contract treats whoever does as the cycle\u2019s beneficiary, with everything the role carries. The rule is deliberately unforgiving \u2014 it keeps the protocol alive if a participant disappears, and it prices carelessness.`,
    funFact:
      'Nothing in the protocol waits forever on an absent participant. Every deadline eventually opens to the first caller.',
    reference: {
      label: 'White paper \u00a73.3 \u2014 Finalization',
      href: '/white-paper#finalization',
    },
  },
  {
    id: 'signature-allocation-share',
    prompt: 'What share of the Cycle Reserve does the Signature Allocation carry at finalization?',
    options: [
      { id: 'a', text: `${protocolFacts.mainEthPercentage}%` },
      { id: 'b', text: `${protocolFacts.chronoWarriorEthPercentage}%` },
      { id: 'c', text: `${protocolFacts.compoundingReservePercentage}%` },
      { id: 'd', text: `${protocolFacts.publicGoodsPercentage}%` },
    ],
    correctOptionId: 'a',
    explanation: `The Signature Allocation is ${protocolFacts.mainEthPercentage}% of the protocol\u2019s ETH balance, read once at the moment of finalization. The ${protocolFacts.compoundingReservePercentage}% figure is the share that is not distributed at all \u2014 it rolls forward as the Compounding Cycle Reserve.`,
    reference: {
      label: 'White paper \u00a75.1 \u2014 Distribution at Finalization',
      href: '/white-paper#distribution-at-finalization',
    },
  },
  {
    id: 'compounding-reserve',
    prompt: 'Why does each Performance Cycle open with a larger reserve than the last?',
    options: [
      {
        id: 'a',
        text: `About ${protocolFacts.compoundingReservePercentage}% of every cycle\u2019s reserve is never distributed \u2014 it rolls forward into the next cycle.`,
      },
      { id: 'b', text: 'The team tops the reserve up between cycles.' },
      { id: 'c', text: 'The protocol imprints new ETH each cycle.' },
      { id: 'd', text: 'The Cosmic Council votes fresh ETH into the reserve.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The five distributed ETH tracks sum to half of the reserve; the remainder compounds automatically. No one tops anything up, and no protocol can imprint ETH \u2014 the growth is purely mechanical. The protocol accumulates rather than extracts.',
    reference: {
      label: 'White paper \u00a75.1 \u2014 Distribution at Finalization',
      href: '/white-paper#distribution-at-finalization',
    },
  },
  {
    id: 'art-engine',
    prompt: 'What actually generates a Cosmic Signature artwork?',
    options: [
      {
        id: 'a',
        text: 'A deterministic physics simulation of the gravitational three-body problem, seeded from on-chain data.',
      },
      { id: 'b', text: 'A diffusion model fine-tuned on space photography.' },
      { id: 'c', text: 'An artist who paints each piece and uploads it.' },
      { id: 'd', text: 'A random pixel generator with a space color palette.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Three bodies of comparable mass orbit under Newtonian gravity; the seed decides the starting conditions and physics does the rest. No generative model is involved at any stage \u2014 no training data, no sampling, no prompt. Chaos theory, not randomness, is what makes every Signature unique.',
    funFact:
      'The three-body problem has no general closed-form solution. An imperceptible change in starting conditions produces a completely different dance.',
    reference: { label: 'White paper \u00a76 \u2014 The Art', href: '/white-paper#the-art' },
  },
  {
    id: 'same-seed',
    prompt:
      'You re-run the open-source art pipeline with the exact seed stored on-chain for token #42. What comes out?',
    options: [
      { id: 'a', text: 'The identical image, pixel for pixel, on any machine.' },
      { id: 'b', text: 'A similar image with small random variations.' },
      { id: 'c', text: 'A different image on different hardware.' },
      { id: 'd', text: 'Only a low-resolution preview; the full art needs the project servers.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Determinism is enforced, not assumed: the same seed produces the same image, bit for bit, on any machine. SHA-256 hashes of rendered frames are asserted in continuous integration, so a drift in output would fail the build.',
    reference: {
      label: 'White paper \u00a76.2 \u2014 Reproducibility and License',
      href: '/white-paper#reproducibility-and-license',
    },
  },
  {
    id: 'cst-supply-origin',
    prompt: 'Where does CST come from?',
    options: [
      {
        id: 'a',
        text: 'Supply starts at zero, and only the protocol contract can imprint it \u2014 every CST traces back to participation in a cycle.',
      },
      { id: 'b', text: 'A large allocation was created for the team at launch.' },
      { id: 'c', text: 'It was distributed for free to early wallets before launch.' },
      { id: 'd', text: 'Anyone can imprint CST by calling the token contract.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The CST token contract accepts imprint and burn instructions only from the protocol contract, and supply started at zero. There is no cap, no premine, and no team allocation \u2014 patient participation is the only source of new CST.',
    reference: { label: 'White paper \u00a77 \u2014 The CST Token', href: '/white-paper#cst' },
  },
  {
    id: 'cst-on-spend',
    prompt: 'Rio spends a handful of CST on a gesture. Where does that CST go?',
    options: [
      { id: 'a', text: 'It is burned \u2014 permanently removed from supply.' },
      { id: 'b', text: 'It goes to the team\u2019s treasury.' },
      { id: 'c', text: 'It joins the Cycle Reserve and is redistributed at finalization.' },
      { id: 'd', text: 'It is returned to Rio when the cycle finalizes.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The full cost of every CST gesture is burned. That ties the token\u2019s supply to actual use: quiet cycles imprint little, and heavy CST activity burns supply back down. Nothing flows to any treasury \u2014 there is none.',
    reference: {
      label: 'White paper \u00a77.2 \u2014 Burning and Supply Dynamics',
      href: '/white-paper#supply-dynamics',
    },
  },
  {
    id: 'public-goods-beneficiary',
    prompt: `Every cycle forwards ${protocolFacts.publicGoodsPercentage}% of the reserve as the Public Goods Allocation. Who receives it today?`,
    options: [
      {
        id: 'a',
        text: 'Protocol Guild \u2014 the funding mechanism for more than 170 Ethereum core contributors.',
      },
      { id: 'b', text: 'The protocol team\u2019s operations wallet.' },
      { id: 'c', text: 'Arbitrum validators.' },
      { id: 'd', text: 'A randomly selected NFT holder.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The Public Goods Vault forwards its share to Protocol Guild, and the forwarding is enforced on-chain as part of finalization \u2014 no one decides each cycle whether to honor it. The reasoning: a protocol that lives on public infrastructure should fund it mechanically, on a schedule, in public.',
    reference: {
      label: 'White paper \u00a710 \u2014 Public Goods',
      href: '/white-paper#public-goods',
    },
  },
  {
    id: 'anchoring-basic',
    prompt:
      'Mira anchors her Cosmic Signature NFT to the protocol. What does anchoring do for her?',
    options: [
      {
        id: 'a',
        text: `While anchored, the NFT accrues a proportional share of each cycle\u2019s ${protocolFacts.anchorDistributionPercentage}% Anchor Distribution, retrieved when the anchor is released.`,
      },
      { id: 'b', text: 'It lists the NFT for sale on the marketplace.' },
      { id: 'c', text: 'It converts the NFT into CST.' },
      { id: 'd', text: 'It re-renders the artwork with a new seed.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Anchoring is the protocol\u2019s form of long-term alignment: anchored Cosmic Signature NFTs share the Anchor Distribution pro rata, and the accrued ETH is retrieved at release. The NFT itself never changes \u2014 its seed and artwork are permanent.',
    reference: { label: 'White paper \u00a78 \u2014 Anchoring', href: '/white-paper#anchoring' },
  },
  {
    id: 'anchor-once-ever',
    prompt: 'Mira later releases her anchor. Can she anchor that NFT again next month?',
    options: [
      {
        id: 'a',
        text: 'No \u2014 each NFT can be anchored only once, ever. Releasing is permanent.',
      },
      { id: 'b', text: 'Yes, after a short cooldown.' },
      { id: 'c', text: 'Yes, by paying an extra cost.' },
      { id: 'd', text: 'Yes, but only during the same cycle.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The once-ever rule replaces the usual lock-up schedule with a single irreversible choice, giving the anchored set a real cost of exit. Whether to keep an NFT anchored is a live decision every cycle; whether to release it is a permanent one.',
    reference: { label: 'White paper \u00a78 \u2014 Anchoring', href: '/white-paper#anchoring' },
  },
  {
    id: 'random-walk-perk',
    prompt: 'Sol owns a Random Walk NFT and attaches it to an ETH gesture. What happens?',
    options: [
      {
        id: 'a',
        text: `That gesture\u2019s cost drops by ${protocolFacts.randomWalkDiscountPercentage}%; the NFT stays in Sol\u2019s wallet but is marked used, once ever.`,
      },
      { id: 'b', text: 'The NFT is transferred to the protocol in exchange for the reduction.' },
      { id: 'c', text: 'The gesture becomes free.' },
      { id: 'd', text: 'The NFT doubles the Participation CST the gesture imprints.' },
    ],
    correctOptionId: 'a',
    explanation: `Attaching a Random Walk NFT reduces one ETH gesture\u2019s cost by ${protocolFacts.randomWalkDiscountPercentage}%. The NFT is not transferred \u2014 the contract simply marks it used. Each Random Walk NFT can be attached exactly once across all cycles, which makes the reduction a consumable resource.`,
    reference: {
      label: 'White paper \u00a74.2 \u2014 Random Walk NFT Attachment',
      href: '/white-paper#random-walk-attachment',
    },
  },
  {
    id: 'first-gesture-currency',
    prompt: 'A new cycle has just activated. Which gesture can open it?',
    options: [
      {
        id: 'a',
        text: 'An ETH gesture \u2014 CST gestures become available from the second gesture onward.',
      },
      { id: 'b', text: 'A CST gesture, since CST is the protocol\u2019s own token.' },
      { id: 'c', text: 'Either currency works for the opening gesture.' },
      { id: 'd', text: 'Only the protocol owner can open a cycle.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Every cycle must open with an ETH gesture, priced by the ETH Calibration Window. Once the cycle is under way, CST offers a second way in. No privileged account opens cycles \u2014 whoever makes the opening gesture does.',
    reference: {
      label: 'White paper \u00a74.3 \u2014 CST Gestures',
      href: '/white-paper#cst-gestures',
    },
  },
  {
    id: 'message-on-gesture',
    prompt: 'Besides value, what can a gesture carry?',
    options: [
      {
        id: 'a',
        text: `A message of up to ${protocolFacts.gestureMessageMaxLength} bytes recorded on-chain, plus attached ERC-20 tokens or an ERC-721 NFT.`,
      },
      { id: 'b', text: 'Nothing \u2014 gestures are value transfers only.' },
      { id: 'c', text: 'An image file stored in the contract.' },
      { id: 'd', text: 'Unlimited text, stored off-chain.' },
    ],
    correctOptionId: 'a',
    explanation: `A gesture may carry a message of up to ${protocolFacts.gestureMessageMaxLength} bytes, recorded on-chain alongside it, and may attach tokens or an NFT. Attached assets are held by the Allocations Wallet, where the cycle\u2019s beneficiary has priority to retrieve them after finalization.`,
    funFact:
      'Every message ever attached to a gesture is permanently readable on Arbitrum \u2014 a public guest book woven through the cycles.',
    reference: {
      label: 'White paper \u00a74.4 \u2014 Messages and Attached Assets',
      href: '/white-paper#messages-and-attachments',
    },
  },
  {
    id: 'who-runs-cycles',
    prompt: 'Who decides how each cycle\u2019s ETH is distributed?',
    options: [
      {
        id: 'a',
        text: 'No one \u2014 allocation percentages are constants in verified contracts, executed mechanically at finalization.',
      },
      { id: 'b', text: 'The team reviews each cycle and signs the distribution.' },
      { id: 'c', text: 'An oracle service computes the split.' },
      { id: 'd', text: 'The app\u2019s backend servers issue the transfers.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Mechanical distribution is one of the protocol\u2019s three anchoring properties: no discretionary account sits between participants and the distribution rules, and no team wallet receives ETH from gestures. The app and servers only display what the contracts already did.',
    reference: {
      label: 'White paper \u00a71 \u2014 Introduction',
      href: '/white-paper#introduction',
    },
  },
  {
    id: 'nft-count-typical',
    prompt: 'How many Cosmic Signature NFTs does a typical cycle imprint?',
    options: [
      { id: 'a', text: `${protocolFacts.typicalNftsPerCycle}` },
      { id: 'b', text: '1' },
      { id: 'c', text: `${protocolFacts.nftStellarSelectionRecipients}` },
      { id: 'd', text: '100' },
    ],
    correctOptionId: 'a',
    explanation: `A typical cycle imprints ${protocolFacts.typicalNftsPerCycle} NFTs: ${protocolFacts.roleNftsPerCycle} role NFTs (beneficiary, Chrono-Warrior, Endurance Champion, Final CST Gesture), ${protocolFacts.nftStellarSelectionRecipients} participant Stellar Selection NFTs, and ${protocolFacts.anchoredRwlkNftSelectionRecipients} anchored-Random-Walk Selection NFTs. Cycles that skip a track imprint fewer.`,
    reference: {
      label: 'White paper \u00a75.1 \u2014 Distribution at Finalization',
      href: '/white-paper#distribution-at-finalization',
    },
  },
  {
    id: 'chrono-endurance-exist',
    prompt: 'What do the Endurance Champion and Chrono-Warrior tracks measure?',
    options: [
      { id: 'a', text: 'Persistence over time \u2014 not who gestured last or most.' },
      { id: 'b', text: 'Who spent the most ETH during the cycle.' },
      { id: 'c', text: 'Who made the largest number of gestures.' },
      { id: 'd', text: 'Who gestured first when the cycle opened.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Both tracks measure persistence rather than position: the Endurance Champion held the most-recent-gesture spot for the longest unbroken interval, and the Chrono-Warrior held the Endurance Champion title itself the longest. Spending more or gesturing more does not directly decide either.',
    reference: {
      label: 'White paper \u00a75.2 \u2014 Endurance Champion and Chrono-Warrior',
      href: '/white-paper#endurance-and-chrono',
    },
  },
  {
    id: 'stellar-selection-what',
    prompt: 'What are Stellar Selections?',
    options: [
      {
        id: 'a',
        text: 'Per-gesture entries recorded during the cycle, from which the contract draws recipients at finalization.',
      },
      { id: 'b', text: 'A leaderboard ranking participants by activity.' },
      { id: 'c', text: 'Rarity tiers assigned to the NFT artwork.' },
      { id: 'd', text: 'A scheme for naming constellations in the art.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Each gesture records one entry in the cycle\u2019s Selection pool. At finalization the contract draws entries for the ETH and NFT Stellar Selections, so selection frequency is proportional to participation. It is a distribution mechanism, not a ranking.',
    reference: {
      label: 'White paper \u00a75.3 \u2014 Stellar Selections',
      href: '/white-paper#stellar-selections',
    },
  },
  {
    id: 'ecosystem-optionality',
    prompt:
      'The app, the marketplace, and the prediction venue all go offline for a day. What can you still do?',
    options: [
      {
        id: 'a',
        text: 'Everything \u2014 every mechanic can be exercised directly against the contracts.',
      },
      { id: 'b', text: 'Nothing until the app returns.' },
      { id: 'c', text: 'Only retrieve allocations, not gesture.' },
      { id: 'd', text: 'Only gesture with CST, not ETH.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The ecosystem around the contracts \u2014 the app, Axiom Zero, Uniswap liquidity, Chaos Zero \u2014 is convenience, not dependency. None of it is required: gestures, finalization, anchoring, and retrieval all work by calling the verified contracts directly.',
    reference: {
      label: 'White paper \u00a72 \u2014 Protocol Overview',
      href: '/white-paper#protocol-overview',
    },
  },
  {
    id: 'what-it-is-not',
    prompt: 'Which statement matches how the white paper describes the protocol\u2019s nature?',
    options: [
      {
        id: 'a',
        text: 'Participants exchange value for participation itself, and the protocol retains no operator\u2019s margin of any kind.',
      },
      {
        id: 'b',
        text: 'Acquiring CST is a reliable path to financial gain from the efforts of others.',
      },
      { id: 'c', text: 'An operator keeps a percentage of every cycle for itself.' },
      { id: 'd', text: 'The protocol promises that NFT values will rise over time.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Every allocation track flows to participants, to anchored NFTs, to the compounding reserve, or to public goods \u2014 there is no operator\u2019s margin. The paper makes no promises about price, liquidity, or future value, and says plainly that no one should acquire CST or the NFTs expecting financial gain from the efforts of others.',
    reference: {
      label: 'White paper \u00a714.1 \u2014 What Cosmic Signature Is Not',
      href: '/white-paper#what-it-is-not',
    },
  },
  {
    id: 'where-recorded',
    prompt: 'Where do gestures, seeds, and cycle history actually live?',
    options: [
      { id: 'a', text: 'On-chain, on Arbitrum One \u2014 an Ethereum Layer 2 network.' },
      { id: 'b', text: 'In the project\u2019s private database.' },
      { id: 'c', text: 'Only in IPFS files pinned by the team.' },
      { id: 'd', text: 'They are not recorded; only totals are kept.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The protocol runs on Arbitrum One, and the important records \u2014 every gesture, every seed, every allocation \u2014 are on-chain. That is what makes the art reproducible and the distribution auditable by anyone, without trusting any server.',
    reference: {
      label: 'Learn: Cosmic Signature on Arbitrum',
      href: '/learn/cosmic-signature-on-arbitrum',
    },
  },
];
