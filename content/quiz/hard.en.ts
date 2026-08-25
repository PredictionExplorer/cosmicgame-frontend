import { protocolFacts } from '@/content/protocol-facts';

import type { QuizQuestion } from './types';

const cst = (amount: number): string => amount.toLocaleString('en-US');

/**
 * Hard tier: edge cases, adversarial forensics, upgrade history, the art
 * pipeline, and security design. Nearly every question is a scenario; many
 * distractors are superseded V1 behaviors or adjacent-mechanic confusions.
 */
export const hardQuestionsEn: readonly QuizQuestion[] = [
  {
    id: 'late-gesture-semantics',
    prompt:
      'The countdown expired a minute ago, but no one has finalized yet. Fen sneaks in a gesture. What exactly does it do?',
    options: [
      {
        id: 'a',
        text: 'It adds one increment to the stored finalization time and takes over the Final Gesture position \u2014 it does not restart the clock.',
      },
      { id: 'b', text: 'It restarts the countdown in full from the present moment.' },
      { id: 'c', text: 'It reverts \u2014 gestures after expiry are impossible.' },
      { id: 'd', text: 'It counts for the next cycle instead.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Extensions apply to the stored time, not to the present moment. A gesture made after expiry but before finalization executes adds one increment to the stored value and takes over the Final Gesture position. The clock never restarts \u2014 which is why late takeovers stay a knife-edge affair.',
    reference: {
      label: 'White paper \u00a73.2 \u2014 The Countdown',
      href: '/white-paper#countdown',
    },
  },
  {
    id: 'refusing-beneficiary',
    prompt:
      'An automated contract wallet holds the Final Gesture, but it is built to reject all incoming ETH. It calls finalize. What happens?',
    options: [
      {
        id: 'a',
        text: `Its own transaction reverts when the Signature Allocation transfer fails \u2014 and after ${protocolFacts.finalGestureExclusivityHours} hours, anyone else may finalize and take the beneficiary role instead.`,
      },
      { id: 'b', text: 'Finalization succeeds and the ETH is silently lost.' },
      { id: 'c', text: 'Finalization succeeds and its ETH share compounds into the next cycle.' },
      { id: 'd', text: 'The protocol pauses until the owner intervenes.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The Signature Allocation is pushed to the beneficiary during finalization, so a beneficiary that rejects ETH makes its own finalize call revert. The protocol does not care: once the exclusivity window lapses, the Open-Finalization Window lets anyone finalize and become the beneficiary themselves. A hostile wallet can only sabotage its own position.',
    reference: {
      label: 'White paper \u00a73.3 \u2014 Finalization',
      href: '/white-paper#finalization',
    },
  },
  {
    id: 'refusing-chrono',
    prompt:
      'A contract that rejects all incoming ETH ends the cycle as Chrono-Warrior. Why can\u2019t it block the cycle from finalizing?',
    options: [
      {
        id: 'a',
        text: 'Its ETH goes to the Allocations Wallet escrow, so finalization never depends on that recipient accepting a transfer.',
      },
      { id: 'b', text: 'Finalization retries the transfer until it is accepted.' },
      { id: 'c', text: 'Its share is skipped and compounds into the next cycle.' },
      { id: 'd', text: 'The Cosmic Council reroutes the share to another address.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Pull over push: secondary ETH allocations sit in escrow rather than being sent during finalization, precisely so no recipient contract can block a cycle from closing. The hostile wallet\u2019s ETH waits in the Allocations Wallet \u2014 where, if unretrieved long enough, it eventually becomes anyone\u2019s.',
    reference: {
      label: 'White paper \u00a711.2 \u2014 Defensive Design',
      href: '/white-paper#defensive-design',
    },
  },
  {
    id: 'public-goods-transfer-fails',
    prompt:
      'During finalization, the Public Goods forwarding cannot complete. What does the protocol do?',
    options: [
      {
        id: 'a',
        text: 'Finalization proceeds anyway, and the event is recorded for later handling.',
      },
      { id: 'b', text: 'The whole finalization reverts until the transfer succeeds.' },
      { id: 'c', text: 'The share is burned.' },
      { id: 'd', text: 'The share is silently added to the beneficiary\u2019s allocation.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Failure-tolerant forwarding is a deliberate design choice: a problem at the Public Goods Vault must never strand a cycle. Finalization completes, the failure is recorded on-chain, and the forwarding is handled afterward. Compare that with the beneficiary push, which does revert \u2014 but only the caller\u2019s own transaction.',
    reference: {
      label: 'White paper \u00a711.2 \u2014 Defensive Design',
      href: '/white-paper#defensive-design',
    },
  },
  {
    id: 'no-anchored-nfts',
    prompt:
      'A cycle finalizes while zero Cosmic Signature NFTs are anchored. What happens to the Anchor Distribution?',
    options: [
      {
        id: 'a',
        text: `That cycle\u2019s ${protocolFacts.anchorDistributionPercentage}% is skipped and its share compounds into the next cycle.`,
      },
      { id: 'b', text: 'It is forwarded to Public Goods instead.' },
      { id: 'c', text: 'It is held until someone anchors, then paid retroactively.' },
      { id: 'd', text: 'It is split among the Stellar Selection recipients.' },
    ],
    correctOptionId: 'a',
    explanation:
      'If no Cosmic Signature NFTs are anchored at finalization, the Anchor Distribution is skipped and its share rolls forward with the compounding reserve. Nothing is held back for future anchor-holders \u2014 each cycle\u2019s distribution reads the anchored set as it stands.',
    reference: {
      label: 'White paper \u00a75.1 \u2014 Distribution at Finalization',
      href: '/white-paper#distribution-at-finalization',
    },
  },
  {
    id: 'no-cst-gestures',
    prompt:
      'A cycle ends without a single CST gesture. Which allocation track is affected, and how?',
    options: [
      { id: 'a', text: 'The Final CST Gesture track is skipped entirely for that cycle.' },
      { id: 'b', text: 'Its CST and NFT go to the final ETH gesture maker instead.' },
      { id: 'c', text: 'The cycle cannot finalize until someone gestures with CST.' },
      { id: 'd', text: `Its ${cst(protocolFacts.specialAllocationCst)} CST is burned in protest.` },
    ],
    correctOptionId: 'a',
    explanation:
      'Cycles with no CST gestures simply skip the Final CST Gesture track \u2014 no substitute recipient is drafted, and finalization proceeds normally. The same skip-not-substitute principle applies to the anchored-Random-Walk Selection when nothing is anchored.',
    reference: {
      label: 'White paper \u00a75.1 \u2014 Distribution at Finalization',
      href: '/white-paper#distribution-at-finalization',
    },
  },
  {
    id: 'randomness-sources',
    prompt: 'Where does the randomness behind Selection draws and art seeds come from?',
    options: [
      {
        id: 'a',
        text: 'An on-chain construction folding the previous block hash, the base fee, and Arbitrum precompile entropy, with values drawn via keccak256.',
      },
      { id: 'b', text: 'A Chainlink VRF oracle subscription.' },
      { id: 'c', text: 'A commit-reveal ceremony among the cycle\u2019s participants.' },
      { id: 'd', text: 'A seed submitted by the team before each finalization.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The seed folds together the previous block hash, the current base fee, and Arbitrum-specific entropy from the ArbSys and ArbGasInfo precompiles \u2014 the previous Arbitrum block hash, the gas backlog, and L1 pricing counters. This is deliberate minimalism: no oracle, no external committee, no callback that could strand a cycle.',
    reference: {
      label: 'White paper \u00a711.3 \u2014 Randomness',
      href: '/white-paper#randomness',
    },
  },
  {
    id: 'randomness-limits',
    prompt: 'What limitation of that randomness does the white paper state plainly?',
    options: [
      {
        id: 'a',
        text: 'A sequencer could in principle influence block-level inputs; the design bounds what that influence could reach.',
      },
      { id: 'b', text: 'None \u2014 the construction is provably unpredictable by everyone.' },
      { id: 'c', text: 'The randomness sometimes fails, which cancels the cycle.' },
      { id: 'd', text: 'Participants with many gestures can predict the draws.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The trade-off is stated, not hidden: a sequencer could in principle influence block-level inputs. The design bounds the blast radius \u2014 Selection draws and art seeds are the only consumers of randomness, the construction is consumed once per finalization, and finalization is a public transaction anyone can submit.',
    reference: {
      label: 'White paper \u00a711.3 \u2014 Randomness',
      href: '/white-paper#randomness',
    },
  },
  {
    id: 'precompile-unavailable',
    prompt:
      'One of the Arbitrum precompiles is unavailable at the moment of finalization. What happens to the randomness construction?',
    options: [
      {
        id: 'a',
        text: 'The precompile calls are failure-tolerant; the construction falls back to the remaining sources.',
      },
      { id: 'b', text: 'Finalization reverts until the precompile returns.' },
      { id: 'c', text: 'The cycle waits and retries hourly.' },
      { id: 'd', text: 'The owner supplies a replacement seed.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Every entropy source is optional by design: if a precompile call is unavailable, the construction simply folds the sources that remain. The theme repeats across the protocol \u2014 nothing external, not even Arbitrum\u2019s own precompiles, may hold finalization hostage.',
    reference: {
      label: 'White paper \u00a711.3 \u2014 Randomness',
      href: '/white-paper#randomness',
    },
  },
  {
    id: 'v2-flat-cst-problem',
    prompt: `V1 imprinted a flat ${cst(100)} CST per gesture. Why did V2 replace that with the square-root formula?`,
    options: [
      {
        id: 'a',
        text: 'Flat imprinting turned machine-speed gesture sequences into an unbounded source of new CST; the new rule imprints by patience, not frequency.',
      },
      { id: 'b', text: 'Participants complained the flat amount was too small.' },
      { id: 'c', text: 'The formula was simplified to save gas.' },
      { id: 'd', text: 'It enabled a one-time allocation for the team.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Under flat imprinting, a burst of rapid gestures manufactured CST from nothing but speed. Under the square-root rule, a burst imprints approximately zero while patient participation creates supply \u2014 the formula is itself a supply control, not just a pricing curve.',
    reference: {
      label: 'White paper \u00a712.2 \u2014 The V2 Upgrade',
      href: '/white-paper#v2',
    },
  },
  {
    id: 'v2-min-imprint-guard',
    prompt:
      'V2 added a parameter to every gesture method: the smallest Participation CST amount the participant will accept. What is it for?',
    options: [
      {
        id: 'a',
        text: 'It protects participants from timing shifts between signing and execution \u2014 if the imprint would fall below their floor, the gesture reverts.',
      },
      { id: 'b', text: 'It lets participants request extra CST for a fee.' },
      { id: 'c', text: 'It caps the total CST a cycle can imprint.' },
      { id: 'd', text: 'It is a Council-controlled tax on gestures.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Participation CST depends on the time since the previous gesture \u2014 and that gap can shrink between signing and execution if someone else lands first. The minimum-imprint guard lets a participant state their floor, converting a silent disappointment into a clean revert.',
    reference: { label: 'White paper \u00a712.2 \u2014 The V2 Upgrade', href: '/white-paper#v2' },
  },
  {
    id: 'v2-exclusivity-change',
    prompt: 'What did V2 do to the Final Gesture participant\u2019s exclusive finalization window?',
    options: [
      {
        id: 'a',
        text: `It grew from ${protocolFacts.initialCycleFinalizationHoursAtLaunch} to ${protocolFacts.finalGestureExclusivityHours} hours.`,
      },
      {
        id: 'b',
        text: `It shrank to ${protocolFacts.initialCycleTimeIncrementHours} hour to speed cycles up.`,
      },
      { id: 'c', text: 'It was removed \u2014 finalization is open to everyone immediately.' },
      {
        id: 'd',
        text: 'It became infinite \u2014 only the Final Gesture participant may ever finalize.',
      },
    ],
    correctOptionId: 'a',
    explanation: `V2 doubled the exclusivity window from ${protocolFacts.initialCycleFinalizationHoursAtLaunch} to ${protocolFacts.finalGestureExclusivityHours} hours \u2014 a response to observed behavior: real people sleep, travel, and lose track of deadlines. The window is still finite, because nothing in the protocol waits forever.`,
    reference: { label: 'White paper \u00a712.2 \u2014 The V2 Upgrade', href: '/white-paper#v2' },
  },
  {
    id: 'v2-timing-loophole',
    prompt: 'V2\u2019s timing hardening closed a loophole. What was it?',
    options: [
      {
        id: 'a',
        text: 'Near-free CST gestures made after expiry could repeatedly push the deadline outward; extensions now always apply to the stored finalization time.',
      },
      { id: 'b', text: 'ETH gestures could be replayed across cycles.' },
      { id: 'c', text: 'The countdown could be paused by the owner mid-cycle.' },
      { id: 'd', text: 'Anchored NFTs could be released and re-anchored in one transaction.' },
    ],
    correctOptionId: 'a',
    explanation:
      'When the CST cost has descended to almost zero, post-expiry gestures were nearly free \u2014 and if each one extended the deadline from the present moment, a cycle could be dragged out indefinitely for pennies. Anchoring extensions to the stored time closed the loophole; the same upgrade hardened the scheduling arithmetic so no parameter configuration can prevent finalization.',
    reference: { label: 'White paper \u00a712.2 \u2014 The V2 Upgrade', href: '/white-paper#v2' },
  },
  {
    id: 'v3-what-changes',
    prompt: 'The planned V3 upgrade changes exactly one thing. What?',
    options: [
      {
        id: 'a',
        text: 'The cost of acting late: during the final 20 minutes, every Gesture Cost is multiplied by a premium ramping from 1x to 10x.',
      },
      { id: 'b', text: 'The art pipeline switches to a new renderer.' },
      { id: 'c', text: 'CST gestures are removed.' },
      { id: 'd', text: 'The allocation percentages are rebalanced.' },
    ],
    correctOptionId: 'a',
    explanation:
      'V3 touches nothing but the endgame: in the final 20 minutes before the Cycle Finalization Time, every Gesture Cost \u2014 ETH, ETH with a Random Walk NFT, or CST \u2014 is multiplied by a premium that ramps polynomially from 1x to 10x. Everything else in the protocol stays as V2 defined it.',
    reference: {
      label: 'White paper \u00a712.3 \u2014 The Planned V3 Upgrade',
      href: '/white-paper#v3',
    },
  },
  {
    id: 'v3-shape',
    prompt:
      'V3\u2019s premium is m(t) = 1 + 9\u00b7(t/T)\u2078. Why does the eighth-order exponent matter?',
    options: [
      {
        id: 'a',
        text: 'The premium stays nearly invisible for most of the window and turns steep only at the very end \u2014 about 1.04x at ten minutes out, 1.9x at five, 7x at one, and 10x at zero.',
      },
      { id: 'b', text: 'It makes the premium rise linearly across the window.' },
      { id: 'c', text: 'It applies the full 10x for the entire final window.' },
      { id: 'd', text: 'It only affects CST gestures.' },
    ],
    correctOptionId: 'a',
    explanation:
      'An eighth-order ramp concentrates almost all of its growth in the final minutes: ordinary participation across the window barely notices it, while a deadline ambush pays dearly. A linear ramp would tax the whole window; a flat 10x would tax everyone equally \u2014 the exponent is what aims the premium at snipers specifically.',
    reference: {
      label: 'White paper \u00a712.3 \u2014 The Planned V3 Upgrade',
      href: '/white-paper#v3',
    },
  },
  {
    id: 'v3-overtime',
    prompt:
      'Under V3, Zed waits until after the deadline has passed and gestures during overtime. What premium applies?',
    options: [
      {
        id: 'a',
        text: 'The full 10x \u2014 the premium reaches 10x at the deadline and stays there for any overtime gesture.',
      },
      { id: 'b', text: 'None \u2014 overtime gestures are back to 1x.' },
      { id: 'c', text: 'Half the maximum, 5x.' },
      { id: 'd', text: 'Overtime gestures are blocked entirely under V3.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The premium ramps to 10x at the deadline and stays at 10x for any gesture made during overtime. Post-expiry takeovers remain possible \u2014 V2\u2019s stored-time rule still governs the clock \u2014 but under V3 they are expensive statements rather than free ambushes.',
    reference: {
      label: 'White paper \u00a712.3 \u2014 The Planned V3 Upgrade',
      href: '/white-paper#v3',
    },
  },
  {
    id: 'owner-mid-cycle',
    prompt:
      'Mid-cycle, the owner decides a percentage should change and the contract should upgrade. What can the owner actually do right now?',
    options: [
      {
        id: 'a',
        text: 'Nothing \u2014 core parameters are locked and upgrades are impossible while a cycle runs; owner actions live in the gap between cycles.',
      },
      { id: 'b', text: 'Change the percentage immediately, but not the code.' },
      { id: 'c', text: 'Upgrade the contract, but not the parameters.' },
      { id: 'd', text: 'Both, with a Council co-signature.' },
    ],
    correctOptionId: 'a',
    explanation:
      'While a cycle is running, the owner cannot change percentages, increments, or costs, and cannot upgrade the contract. There is deliberately no mechanism for changing the contract mid-cycle, whatever the circumstances \u2014 participants always act under the rules that were visible when the cycle opened.',
    reference: {
      label: 'White paper \u00a713 \u2014 The Path to Full Decentralization',
      href: '/white-paper#decentralization',
    },
  },
  {
    id: 'owner-cannot-reach',
    prompt: 'Which of these can the owner touch, even between cycles?',
    options: [
      {
        id: 'a',
        text: 'None of them: escrowed allocations, imprinted NFTs, recorded seeds, and CST balances are all beyond every owner power.',
      },
      { id: 'b', text: 'Escrowed allocations, but nothing else.' },
      { id: 'c', text: 'Recorded seeds, to fix broken artwork.' },
      { id: 'd', text: 'CST balances, in emergencies.' },
    ],
    correctOptionId: 'a',
    explanation:
      'No owner power reaches escrowed allocations, imprinted NFTs, recorded seeds, or anyone\u2019s CST balance \u2014 and no team wallet receives ETH from gestures. The owner\u2019s real powers are narrow: timing adjustments between cycles and peripheral management like metadata URIs and the vault beneficiary.',
    reference: {
      label: 'White paper \u00a713 \u2014 The Path to Full Decentralization',
      href: '/white-paper#decentralization',
    },
  },
  {
    id: 'owner-endgame',
    prompt: 'How does the owner role end, according to the white paper\u2019s commitment?',
    options: [
      {
        id: 'a',
        text: 'Once the remaining upgrades are complete, privileged control leaves the deploying address permanently \u2014 by transfer to the Cosmic Council or outright renouncement, announced in advance.',
      },
      { id: 'b', text: 'It never ends; the team keeps a maintenance role indefinitely.' },
      { id: 'c', text: 'It is sold to the highest-weighted Council delegate.' },
      { id: 'd', text: 'It transfers to a company multisig permanently.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The commitment is explicit: after the remaining upgrades land, beginning with V3, the owner role leaves the deployer permanently, with the exact mechanism announced in advance. From then on no private party can upgrade the protocol or change its parameters \u2014 and every step of the process is visible on-chain, including the last one.',
    reference: {
      label: 'White paper \u00a713 \u2014 The Path to Full Decentralization',
      href: '/white-paper#decentralization',
    },
  },
  {
    id: 'postpone-activation-limit',
    prompt:
      'The owner wants to postpone an upcoming cycle\u2019s activation. What bounds that power?',
    options: [
      {
        id: 'a',
        text: 'It works only until the cycle\u2019s first gesture arrives \u2014 after that, the cycle is beyond postponing.',
      },
      { id: 'b', text: 'It can pause a cycle at any point, even mid-flight.' },
      { id: 'c', text: 'It requires a Council proposal to pass first.' },
      { id: 'd', text: 'There is no such power at all.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Postponing an upcoming cycle\u2019s activation is one of the three narrow controls available at any time \u2014 but only until its first gesture arrives. The moment someone gestures, the cycle is live and the owner\u2019s timing lever is gone.',
    reference: {
      label: 'White paper \u00a713 \u2014 The Path to Full Decentralization',
      href: '/white-paper#decentralization',
    },
  },
  {
    id: 'no-team-eth',
    prompt:
      'What is the only recurring flow the team directs, and what ETH does the team receive from gestures?',
    options: [
      {
        id: 'a',
        text: `The ${cst(protocolFacts.outreachReserveCst)} CST per cycle to the Outreach Reserve \u2014 and no team wallet receives ETH from gestures, ever.`,
      },
      { id: 'b', text: 'A small ETH percentage of each gesture.' },
      { id: 'c', text: 'The Signature Allocation of every tenth cycle.' },
      { id: 'd', text: 'Nothing at all, including CST.' },
    ],
    correctOptionId: 'a',
    explanation: `The Outreach Reserve receives ${cst(protocolFacts.outreachReserveCst)} CST per cycle for community outreach \u2014 the only recurring flow the team directs, and it carries no special powers. On the ETH side the paper is absolute: no team wallet receives ETH from gestures.`,
    reference: {
      label: 'White paper \u00a77.1 \u2014 Imprint Rules',
      href: '/white-paper#imprint-rules',
    },
  },
  {
    id: 'art-integrator',
    prompt:
      'Which numerical method integrates the three-body simulation, and why does the choice matter?',
    options: [
      {
        id: 'a',
        text: 'A fourth-order Yoshida symplectic integrator \u2014 it preserves the system\u2019s energy behavior over long horizons.',
      },
      { id: 'b', text: 'Simple Euler steps \u2014 fast and good enough for art.' },
      { id: 'c', text: 'A neural network approximating the orbits.' },
      { id: 'd', text: 'Closed-form solutions to the three-body equations.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Symplectic integrators respect the geometry of Hamiltonian systems, so energy does not drift over a million steps \u2014 the orbits stay physically honest for the whole simulation. And no closed-form path exists to shortcut it: the three-body problem has no general analytic solution, which is the entire artistic point.',
    reference: {
      label: 'White paper \u00a76.1 \u2014 The Pipeline',
      href: '/white-paper#art-pipeline',
    },
  },
  {
    id: 'art-candidates',
    prompt: 'How does the pipeline pick the orbit that becomes a Signature?',
    options: [
      {
        id: 'a',
        text: 'One hundred thousand candidate configurations are simulated for a million steps each, then a Borda rank aggregation scores chaos and triangle equilateralness to pick the most visually interesting orbit.',
      },
      { id: 'b', text: 'The first randomly generated orbit is used as-is.' },
      { id: 'c', text: 'The team curates each cycle\u2019s orbits by hand.' },
      { id: 'd', text: 'NFT owners vote on candidate orbits after imprinting.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The seed spawns one hundred thousand candidates; each is integrated for a million physics steps; a Borda rank aggregation across chaos and equilateralness metrics picks the standout. Every stage is a pure function of the seed \u2014 curation happens by algorithm, identically reproducible by anyone.',
    reference: {
      label: 'White paper \u00a76.1 \u2014 The Pipeline',
      href: '/white-paper#art-pipeline',
    },
  },
  {
    id: 'art-color',
    prompt: 'How are the colors of the three bodies chosen?',
    options: [
      {
        id: 'a',
        text: 'Mixed in the OKLab perceptual color space with 120-degree hue separation per body, modulated by drift and a sine wave.',
      },
      { id: 'b', text: 'Fixed red, green, and blue for every Signature.' },
      { id: 'c', text: 'Sampled from photographs of real nebulae.' },
      { id: 'd', text: 'Chosen by the NFT\u2019s first owner at imprint time.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Colors are mixed in OKLab \u2014 a perceptual space where equal numeric distances look equally different to human eyes \u2014 with 120-degree hue separation keeping the three bodies visually distinct. Like everything downstream of the seed, the palette is deterministic.',
    reference: {
      label: 'White paper \u00a76.1 \u2014 The Pipeline',
      href: '/white-paper#art-pipeline',
    },
  },
  {
    id: 'art-spectral',
    prompt: 'What makes the orbit trails render the way they do?',
    options: [
      {
        id: 'a',
        text: 'Spectral rendering across sixty-four wavelength bins spanning 380 to 700 nanometers, with velocity-dependent thickness and depth of field.',
      },
      { id: 'b', text: 'Flat vector strokes with a glow filter.' },
      { id: 'c', text: 'Screenshots of a physics simulator, upscaled by AI.' },
      { id: 'd', text: 'Hand-tuned splines traced over the simulation.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The renderer treats light as a spectrum, not three color channels: sixty-four wavelength bins across the visible range, trails whose thickness responds to velocity, and depth of field for dimensionality. AgX tonemapping, bloom, OpenSimplex nebula layers, and grading finish the frame.',
    reference: {
      label: 'White paper \u00a76.1 \u2014 The Pipeline',
      href: '/white-paper#art-pipeline',
    },
  },
  {
    id: 'art-output',
    prompt: 'What files does the pipeline output for every NFT?',
    options: [
      { id: 'a', text: 'A 16-bit PNG and a 30-second H.265 video.' },
      { id: 'b', text: 'A JPEG thumbnail only.' },
      { id: 'c', text: 'An animated GIF.' },
      { id: 'd', text: 'An SVG vector file.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Each Signature ships as a 16-bit PNG \u2014 double the usual color depth per channel \u2014 plus a 30-second H.265 video of the orbit in motion. Both are regenerable from the on-chain seed by anyone running the open-source pipeline.',
    reference: {
      label: 'White paper \u00a76.1 \u2014 The Pipeline',
      href: '/white-paper#art-pipeline',
    },
  },
  {
    id: 'art-server-death',
    prompt:
      'Every server associated with the project disappears tomorrow. What happens to the artwork?',
    options: [
      {
        id: 'a',
        text: 'Every Signature can be regenerated from the chain \u2014 the seeds are on-chain and the pipeline is public.',
      },
      { id: 'b', text: 'The art is lost; only metadata survives.' },
      { id: 'c', text: 'Only thumbnails survive in wallets.' },
      { id: 'd', text: 'It depends on whether IPFS pins are maintained.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Because every seed is stored on-chain and the rendering pipeline is open source and deterministic, the collection does not depend on any server. Anyone can regenerate any Signature, pixel for pixel, from the chain alone \u2014 the strongest survivability claim an NFT collection can make.',
    funFact:
      'Continuous integration asserts SHA-256 hashes of rendered frames, so even an accidental one-pixel drift in the pipeline would fail the build.',
    reference: {
      label: 'White paper \u00a76.2 \u2014 Reproducibility and License',
      href: '/white-paper#reproducibility-and-license',
    },
  },
  {
    id: 'art-naming',
    prompt: 'What customization does an owner have over their Cosmic Signature NFT?',
    options: [
      {
        id: 'a',
        text: 'They may name it on-chain, up to 32 bytes \u2014 the artwork itself never changes.',
      },
      { id: 'b', text: 'They may re-roll the seed once.' },
      { id: 'c', text: 'They may adjust the color palette.' },
      { id: 'd', text: 'They may extend the video\u2019s duration.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Owners may record a name of up to 32 bytes on-chain. That is the entire customization surface: the seed, the orbit, the palette, and the video are fixed forever at imprint time \u2014 determinism is the collection\u2019s core promise, and re-rolling would break it.',
    reference: {
      label: 'White paper \u00a76.2 \u2014 Reproducibility and License',
      href: '/white-paper#reproducibility-and-license',
    },
  },
  {
    id: 'art-license',
    prompt:
      'Under what license do the project-owned contracts, shaders, and rendering pipelines ship?',
    options: [
      { id: 'a', text: 'CC0 1.0 \u2014 dedicated to the public domain, no rights reserved.' },
      { id: 'b', text: 'A proprietary license held by the team.' },
      { id: 'c', text: 'GPL-3.0, requiring derivative works to open their source.' },
      { id: 'd', text: 'A per-NFT license owned by each holder.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Project-owned code is dedicated under CC0 1.0 with no rights reserved: anyone may fork the contracts, the renderer, or the site. Third-party dependencies retain their own licenses. Even this white paper is CC0.',
    reference: {
      label: 'White paper \u00a76.2 \u2014 Reproducibility and License',
      href: '/white-paper#reproducibility-and-license',
    },
  },
  {
    id: 'seed-derivation',
    prompt: 'When and how is an NFT\u2019s art seed created?',
    options: [
      {
        id: 'a',
        text: 'At imprint time, the contract derives a 32-byte seed from on-chain data and stores it with the NFT; a SHA3-256 generator makes everything downstream a pure function of it.',
      },
      { id: 'b', text: 'The artist uploads a seed for each NFT before finalization.' },
      { id: 'c', text: 'The seed is the owner\u2019s wallet address.' },
      { id: 'd', text: 'A fresh seed is drawn every time the art is rendered.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The seed is derived on-chain at imprint time and stored with the NFT permanently. It initializes a SHA3-256 random number generator, and every downstream choice \u2014 candidate orbits, camera, colors \u2014 is a pure function of it. Render it today or in a decade: same seed, same Signature.',
    reference: {
      label: 'White paper \u00a76.1 \u2014 The Pipeline',
      href: '/white-paper#art-pipeline',
    },
  },
  {
    id: 'hacken-findings',
    prompt: 'What did Hacken\u2019s independent security review of the contracts conclude?',
    options: [
      {
        id: 'a',
        text: '23 findings: none critical, none high severity, 3 medium, 8 low, and 12 informational \u2014 most of them design trade-offs accepted with written rationale.',
      },
      { id: 'b', text: 'Several critical findings that remain unfixed.' },
      { id: 'c', text: 'Zero findings of any severity.' },
      { id: 'd', text: 'The report was never published.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The review, published in January 2026, covered the core protocol, the CST token, both NFT integrations, the anchoring wallets, and the supporting contracts. Zero findings would itself be a red flag for a system this size; what matters is the severity profile \u2014 none critical, none high \u2014 and that the full report is public.',
    reference: {
      label: 'White paper \u00a711.1 \u2014 Independent Review',
      href: '/white-paper#independent-review',
    },
  },
  {
    id: 'hacken-invariants',
    prompt: 'Beyond the manual review, what did Hacken\u2019s fuzz testing check?',
    options: [
      {
        id: 'a',
        text: '14 system invariants \u2014 such as the ETH balance always equaling deposits minus distributions \u2014 all of which held across 10,000 runs.',
      },
      { id: 'b', text: 'Gas usage across common transactions.' },
      { id: 'c', text: 'The art pipeline\u2019s determinism.' },
      { id: 'd', text: 'Frontend rendering performance.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Fuzzing hammers a system with generated inputs while asserting properties that must always hold. Hacken formalized 14 such invariants and all held across 10,000 runs \u2014 evidence of a different kind than a line-by-line review, aimed at the states no human thinks to try.',
    reference: {
      label: 'White paper \u00a711.1 \u2014 Independent Review',
      href: '/white-paper#independent-review',
    },
  },
  {
    id: 'verification-tooling',
    prompt: 'Besides the external review, what verification tooling does the repository carry?',
    options: [
      {
        id: 'a',
        text: 'Certora formal verification specifications, Solidity SMTChecker configuration, Slither static analysis, and a test suite targeting complete coverage.',
      },
      { id: 'b', text: 'Nothing \u2014 the external review is the only check.' },
      { id: 'c', text: 'A closed-source test suite run privately.' },
      { id: 'd', text: 'Manual testing before each release.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The layers stack: formal verification specs (Certora), SMT-based checking, static analysis (Slither), and coverage-targeting tests \u2014 plus Hacken\u2019s review and fuzzing on top. No single tool proves everything, which is exactly why serious projects run all of them.',
    reference: {
      label: 'White paper \u00a711.1 \u2014 Independent Review',
      href: '/white-paper#independent-review',
    },
  },
  {
    id: 'sourcify-status',
    prompt: 'What is the source-verification status of the deployed contracts?',
    options: [
      {
        id: 'a',
        text: 'Exact-match verified on Sourcify for Arbitrum One (chain 42161), at the addresses fixed in the white paper\u2019s appendix.',
      },
      { id: 'b', text: 'Unverified \u2014 you have to trust the bytecode.' },
      { id: 'c', text: 'Only the proxy is verified, not the implementation.' },
      { id: 'd', text: 'Verified on a testnet, but not on mainnet.' },
    ],
    correctOptionId: 'a',
    explanation:
      'All contracts are exact-match verified on Sourcify for chain 42161 \u2014 the strictest verification tier, where the on-chain bytecode matches the published source byte for byte, metadata included. The proxy address is the protocol\u2019s permanent address; implementations change only through the public upgrade process.',
    reference: {
      label: 'White paper \u00a711.4 \u2014 Open Verification',
      href: '/white-paper#open-verification',
    },
  },
  {
    id: 'reentrancy',
    prompt:
      'A hostile contract tries to re-enter the protocol mid-transaction through a callback. What stands in its way?',
    options: [
      {
        id: 'a',
        text: 'Reentrancy guards protect every external entry point of the core contract.',
      },
      { id: 'b', text: 'Nothing \u2014 the protocol relies on recipients behaving.' },
      { id: 'c', text: 'A Council-managed allowlist of trusted contracts.' },
      { id: 'd', text: 'Gas limits alone make reentrancy impossible.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Every external entry point of the core contract carries a reentrancy guard \u2014 the first line in the defensive design list. Combined with pull-based escrow for secondary allocations, the classic attack surface of value-holding contracts is closed twice over.',
    reference: {
      label: 'White paper \u00a711.2 \u2014 Defensive Design',
      href: '/white-paper#defensive-design',
    },
  },
  {
    id: 'intercycle-locks-why',
    prompt: 'Why are contract upgrades impossible while a cycle runs \u2014 even in an emergency?',
    options: [
      {
        id: 'a',
        text: 'By deliberate design: there is no mechanism for changing the contract mid-cycle, whatever the circumstances, so participants always act under the rules they could inspect.',
      },
      { id: 'b', text: 'Upgrades would cost too much gas mid-cycle.' },
      { id: 'c', text: 'It is a technical limitation of the proxy pattern.' },
      { id: 'd', text: 'They are possible with a unanimous Council decision.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The inter-cycle lock is a policy carved into the contract, not a technical accident \u2014 UUPS proxies could technically upgrade at any time. The protocol chose to make mid-cycle changes impossible so that the rules a participant sees when gesturing are the rules that settle the cycle.',
    reference: { label: 'White paper \u00a712.1 \u2014 V1: Launch', href: '/white-paper#v1' },
  },
  {
    id: 'cst-checkpoints',
    prompt: 'How does CST snapshot Coordination Weight for proposals?',
    options: [
      {
        id: 'a',
        text: 'With timestamp-based checkpoints \u2014 proposal snapshots refer to wall-clock time rather than block numbers.',
      },
      { id: 'b', text: 'With block-number checkpoints, like most Governor deployments.' },
      { id: 'c', text: 'Weight is read live at the moment each vote is expressed.' },
      { id: 'd', text: 'A snapshot is taken once per cycle at finalization.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The token uses timestamp-based checkpoints, so proposal snapshots refer to wall-clock time. On an L2 where block cadence differs from Ethereum mainnet, timestamps are the steadier reference \u2014 a subtle choice that keeps coordination timelines predictable.',
    reference: {
      label: 'White paper \u00a77.3 \u2014 Coordination Weight',
      href: '/white-paper#coordination-weight',
    },
  },
  {
    id: 'dust-refund',
    prompt:
      'Pia overpays her ETH gesture by a few wei \u2014 below the dust threshold. What happens to the difference?',
    options: [
      {
        id: 'a',
        text: 'It stays in the reserve: a refund that small would cost more in gas than it returns.',
      },
      { id: 'b', text: 'It is refunded anyway, on principle.' },
      { id: 'c', text: 'It accumulates in a personal credit balance.' },
      { id: 'd', text: 'The gesture reverts to protect her.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Above the dust threshold, overpayment is refunded in the same transaction; below it, the difference stays in the reserve because the refund itself would burn more gas than it moves. A tiny, honest asymmetry \u2014 documented rather than hidden.',
    reference: {
      label: 'White paper \u00a74.1 \u2014 ETH Gestures',
      href: '/white-paper#eth-gestures',
    },
  },
  {
    id: 'rwlk-not-transferred',
    prompt: 'Sol attaches his Random Walk NFT for the cost reduction. Where is the NFT afterward?',
    options: [
      {
        id: 'a',
        text: 'Still in his wallet \u2014 the contract only marks it used; it is never transferred or escrowed.',
      },
      { id: 'b', text: 'Escrowed in the Allocations Wallet until the cycle ends.' },
      { id: 'c', text: 'Burned in exchange for the reduction.' },
      { id: 'd', text: 'Transferred to the protocol and returned after finalization.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The Random Walk NFT never moves: the contract records it as used and applies the reduction. The mark is what is consumed \u2014 once ever per NFT, across all cycles \u2014 which ties a fixed external collection into the protocol\u2019s economy without taking custody of anything.',
    reference: {
      label: 'White paper \u00a74.2 \u2014 Random Walk NFT Attachment',
      href: '/white-paper#random-walk-attachment',
    },
  },
  {
    id: 'open-finalization-carries',
    prompt:
      'During the Open-Finalization Window, Quill (who never gestured once) finalizes the cycle. What exactly does she receive?',
    options: [
      {
        id: 'a',
        text: 'Everything the beneficiary role carries: the Signature Allocation\u2019s ETH share, its CST imprint, its NFT, and priority over attached assets.',
      },
      {
        id: 'b',
        text: 'A fixed finalization fee, with the allocations still going to the Final Gesture participant.',
      },
      { id: 'c', text: 'Only the NFT; the ETH compounds.' },
      { id: 'd', text: 'Nothing \u2014 finalizing is a public service.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The contract treats whoever finalizes during the open window as the cycle\u2019s beneficiary, full stop \u2014 ETH share, CST imprint, NFT, and priority over attached assets. Quill never needed to gesture. The absent Final Gesture participant forfeits the entire role, not a fraction of it.',
    reference: {
      label: 'White paper \u00a73.3 \u2014 Finalization',
      href: '/white-paper#finalization',
    },
  },
  {
    id: 'attached-priority-timeout',
    prompt: 'How long does the beneficiary\u2019s priority over attached assets last?',
    options: [
      {
        id: 'a',
        text: `${protocolFacts.secondaryRetrievalTimeoutWeeks} weeks \u2014 after the open retrieval timeout, anyone may retrieve them.`,
      },
      { id: 'b', text: 'Forever \u2014 attached assets wait indefinitely for the beneficiary.' },
      {
        id: 'c',
        text: `${protocolFacts.finalGestureExclusivityHours} hours, matching the finalization window.`,
      },
      { id: 'd', text: 'Until the next cycle finalizes.' },
    ],
    correctOptionId: 'a',
    explanation: `Attached assets sit in the Allocations Wallet with the same ${protocolFacts.secondaryRetrievalTimeoutWeeks}-week timeout as every escrowed allocation. The beneficiary has priority during that window; afterward, the assets become available to the first caller. The ${protocolFacts.finalGestureExclusivityHours}-hour figure governs finalization rights, not escrow.`,
    reference: {
      label: 'White paper \u00a75.4 \u2014 Delivery, Escrow, and Timeouts',
      href: '/white-paper#delivery-and-timeouts',
    },
  },
  {
    id: 'eth-window-duration-drift',
    prompt: 'How long does the ETH Calibration Window\u2019s descent take, and is that fixed?',
    options: [
      {
        id: 'a',
        text: 'About two days at launch parameters \u2014 but its duration is tied to the cycle time increment, so it stretches slowly as the protocol ages.',
      },
      { id: 'b', text: `Exactly ${protocolFacts.finalGestureExclusivityHours} hours, forever.` },
      {
        id: 'c',
        text: `Exactly ${protocolFacts.initialCstCalibrationWindowHours} hours, like the CST window\u2019s reference.`,
      },
      { id: 'd', text: 'It shrinks each cycle as activity grows.' },
    ],
    correctOptionId: 'a',
    explanation: `At launch parameters the descent takes about two days, and if it fully elapses the cost simply rests at the floor. Because the duration is tied to the time increment \u2014 which grows ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% per cycle \u2014 the window stretches with the protocol\u2019s lengthening tempo rather than staying fixed.`,
    reference: {
      label: 'White paper \u00a73.1 \u2014 The ETH Calibration Window',
      href: '/white-paper#eth-calibration-window',
    },
  },
  {
    id: 'first-cycle-opening',
    prompt: 'The very first cycle had no predecessor to calibrate from. How did it open?',
    options: [
      { id: 'a', text: `At a fixed ${protocolFacts.initialGestureCostEth} ETH.` },
      { id: 'b', text: 'At 1 ETH, chosen by the Council.' },
      { id: 'c', text: 'Free \u2014 the first gesture cost nothing.' },
      { id: 'd', text: 'At twice the deployment gas cost.' },
    ],
    correctOptionId: 'a',
    explanation: `With no previous opening cost to double, cycle one opened at a fixed ${protocolFacts.initialGestureCostEth} ETH \u2014 deliberately tiny, letting the market walk the cost upward through the ${protocolFacts.ethGestureCostStepUpPercent}% step-ups and the cycle-to-cycle calibration rather than guessing a launch price.`,
    reference: {
      label: 'White paper \u00a73.1 \u2014 The ETH Calibration Window',
      href: '/white-paper#eth-calibration-window',
    },
  },
  {
    id: 'selection-entry-scaling',
    prompt:
      'Bea made 30 gestures this cycle; Cal made 3. What is true about the ETH Stellar Selection draws?',
    options: [
      {
        id: 'a',
        text: 'Bea\u2019s entries appear ten times as often in the pool, and with replacement she could even be drawn more than once \u2014 but Cal can absolutely still be drawn.',
      },
      { id: 'b', text: 'Bea is guaranteed at least one draw.' },
      { id: 'c', text: 'Cal is excluded; only the top participants qualify.' },
      { id: 'd', text: 'Both have identical chances \u2014 one entry per address.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Entries scale with gestures made \u2014 selection frequency is proportional to participation \u2014 and draws are made with replacement. Nothing is guaranteed to anyone, and no one who gestured is excluded: the pool weights activity without rationing or thresholds.',
    reference: {
      label: 'White paper \u00a75.3 \u2014 Stellar Selections',
      href: '/white-paper#stellar-selections',
    },
  },
  {
    id: 'recognition-vs-participation',
    prompt:
      'CST enters circulation through three flows. Which one is team-directed, and what power does it carry?',
    options: [
      {
        id: 'a',
        text: `Only the Outreach Reserve\u2019s ${cst(protocolFacts.outreachReserveCst)} CST per cycle \u2014 and it carries no special powers at all.`,
      },
      { id: 'b', text: 'Recognition CST, which the team assigns to favored participants.' },
      { id: 'c', text: 'Participation CST, which the team can adjust per gesture.' },
      { id: 'd', text: 'All three flows are team-directed.' },
    ],
    correctOptionId: 'a',
    explanation: `The three flows are: Participation CST (imprinted at gesture time by formula), Recognition CST (${cst(protocolFacts.specialAllocationCst)} CST paired with each NFT distribution at finalization), and the Outreach Reserve (${cst(protocolFacts.outreachReserveCst)} CST per cycle). Only the last is team-directed \u2014 and it is ordinary CST with no special powers, spent on community outreach.`,
    reference: {
      label: 'White paper \u00a77.1 \u2014 Imprint Rules',
      href: '/white-paper#imprint-rules',
    },
  },
  {
    id: 'finalization-actions',
    prompt: 'Finalization is a single transaction. What does it actually do?',
    options: [
      {
        id: 'a',
        text: 'Reads the protocol\u2019s ETH balance once, distributes the allocation tracks, imprints the cycle\u2019s NFTs and CST, records each artwork\u2019s seed, and schedules the next cycle.',
      },
      {
        id: 'b',
        text: 'Only transfers the beneficiary\u2019s ETH; everything else happens later.',
      },
      {
        id: 'c',
        text: 'Only imprints the NFTs; ETH distribution follows over several transactions.',
      },
      { id: 'd', text: 'Starts a multi-day settlement process handled by the team.' },
    ],
    correctOptionId: 'a',
    explanation:
      'One transaction settles the entire cycle: the ETH balance is read once, the tracks of Section 5 are distributed (push for the beneficiary and Public Goods, escrow for the rest), NFTs and CST are imprinted with their seeds recorded, and the next cycle is scheduled. Atomicity is the point \u2014 there is no half-finalized state.',
    reference: {
      label: 'White paper \u00a73.3 \u2014 Finalization',
      href: '/white-paper#finalization',
    },
  },
  {
    id: 'chrono-vs-endurance-trap',
    prompt:
      'Nyx holds the most-recent-gesture spot for six hours early in the cycle. Later, Orin holds it for nine hours. Orin\u2019s record stands only briefly before finalization, while Nyx\u2019s stood for two days. Who ends up with which title?',
    options: [
      {
        id: 'a',
        text: 'Orin is Endurance Champion (longest single gap); Nyx\u2019s long reign as record-holder makes her the likely Chrono-Warrior.',
      },
      { id: 'b', text: 'Nyx takes both titles \u2014 two days beats everything.' },
      { id: 'c', text: 'Orin takes both titles \u2014 the bigger gap always sweeps.' },
      { id: 'd', text: 'Titles go to whoever made the Final Gesture.' },
    ],
    correctOptionId: 'a',
    explanation:
      'Endurance measures the gap you created \u2014 Orin\u2019s nine hours beats Nyx\u2019s six. The Chrono track measures how long the Endurance Champion title was held: Nyx held it for two days before Orin surpassed her, while Orin\u2019s reign lasted only until finalization. The two tracks deliberately reward different shapes of persistence, and both resolve only at finalization.',
    reference: {
      label: 'White paper \u00a75.2 \u2014 Endurance Champion and Chrono-Warrior',
      href: '/white-paper#endurance-and-chrono',
    },
  },
  {
    id: 'anchored-rwlk-weighting',
    prompt:
      'Vale anchored five Random Walk NFTs; Wynn anchored one. How does the Anchored-NFT Stellar Selection treat them?',
    options: [
      {
        id: 'a',
        text: `The ${protocolFacts.anchoredRwlkNftSelectionRecipients} draws are weighted by the number of NFTs each holder has anchored \u2014 Vale carries five times Wynn\u2019s weight.`,
      },
      { id: 'b', text: 'Each anchor-holder gets exactly one draw regardless of count.' },
      { id: 'c', text: 'Draws are weighted by how early each NFT was anchored.' },
      { id: 'd', text: 'Vale and Wynn split the draws equally.' },
    ],
    correctOptionId: 'a',
    explanation: `The Anchored-NFT Stellar Selection runs ${protocolFacts.anchoredRwlkNftSelectionRecipients} draws per cycle across anchored Random Walk NFTs, weighted by the number each holder has anchored. Each draw carries ${cst(protocolFacts.specialAllocationCst)} CST and a Cosmic Signature NFT \u2014 and no ETH, which stays exclusive to anchored Cosmic Signature NFTs.`,
    reference: {
      label: 'White paper \u00a75.3 \u2014 Stellar Selections',
      href: '/white-paper#stellar-selections',
    },
  },
  {
    id: 'voluntary-vault-contributions',
    prompt: 'Can ETH reach the Public Goods Vault outside the per-cycle forwarding?',
    options: [
      {
        id: 'a',
        text: 'Yes \u2014 the vault also accepts voluntary ETH contributions directly, outside any cycle.',
      },
      { id: 'b', text: 'No \u2014 only finalization can move ETH to the vault.' },
      { id: 'c', text: 'Only the owner can top up the vault.' },
      { id: 'd', text: 'Only CST can be contributed voluntarily.' },
    ],
    correctOptionId: 'a',
    explanation: `The vault accepts voluntary ETH contributions directly, on top of the enforced ${protocolFacts.publicGoodsPercentage}% per cycle. The mechanical forwarding sets the floor; anyone moved to add more can do so without waiting for a finalization.`,
    reference: {
      label: 'White paper \u00a710 \u2014 Public Goods',
      href: '/white-paper#public-goods',
    },
  },
  {
    id: 'risk-honesty',
    prompt: 'Which of these does the white paper\u2019s own risk section admit?',
    options: [
      {
        id: 'a',
        text: 'Reviews and formal analysis are not a guarantee \u2014 unknown defects can exist in any software that holds value.',
      },
      { id: 'b', text: 'The contracts are mathematically proven free of all defects.' },
      { id: 'c', text: 'Risks exist only until the V3 upgrade lands.' },
      { id: 'd', text: 'The only real risk is Ethereum itself failing.' },
    ],
    correctOptionId: 'a',
    explanation:
      'The risk factors are stated without varnish: smart contract risk survives every review; the randomness has stated limits; the timeout deadlines are real; parameters can change between cycles until decentralization completes; asset values move. Treat gestures as expenditure on participation and art \u2014 that is the paper\u2019s own framing.',
    reference: {
      label: 'White paper \u00a714.2 \u2014 Risk Factors',
      href: '/white-paper#risk-factors',
    },
  },
];
