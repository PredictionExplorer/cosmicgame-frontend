import { protocolFacts } from '@/content/protocol-facts';

import type { QuizTierQuestionsText } from './structure';

const cst = (amount: number): string => amount.toLocaleString('en-US');

/**
 * Hard tier: edge cases, adversarial forensics, upgrade history, the art
 * pipeline, and security design. Nearly every question is a scenario; many
 * distractors are superseded V1 behaviors or adjacent-mechanic confusions.
 */
export const hardQuestionsTextEn = {
  'late-gesture-semantics': {
    prompt:
      'The countdown expired a minute ago, but no one has finalized yet. Fen makes a gesture. What exactly does it do?',
    options: {
      a: 'It adds one increment to the stored finalization time and takes over the Final Gesture position \u2014 it does not restart the clock.',
      b: 'It restarts the countdown in full from the present moment.',
      c: 'It reverts \u2014 gestures after expiry are impossible.',
      d: 'It counts for the next cycle instead.',
    },
    explanation:
      'The gesture adds one increment to the stored finalization time and takes over the Final Gesture position. It does not restart a full countdown from the current time, so the updated deadline may still be in the past.',
    referenceLabel: 'White paper \u00a73.2 \u2014 The Countdown',
  },
  'refusing-beneficiary': {
    prompt:
      'An automated contract wallet holds the Final Gesture, but it is built to reject all incoming ETH. It calls finalize. What happens?',
    options: {
      a: `Its own transaction reverts when the Signature Allocation transfer fails \u2014 and after ${protocolFacts.finalGestureExclusivityHours} hours, anyone else may finalize and take the beneficiary role instead.`,
      b: 'Finalization succeeds and the ETH is silently lost.',
      c: 'Finalization succeeds and its ETH share compounds into the next cycle.',
      d: 'The protocol pauses until the owner intervenes.',
    },
    explanation:
      'The Signature Allocation is transferred directly to the beneficiary during finalization. If that wallet rejects ETH, its finalization transaction reverts. Once the exclusive window ends, another participant can finalize and become the beneficiary.',
    referenceLabel: 'White paper \u00a73.3 \u2014 Finalization',
  },
  'refusing-chrono': {
    prompt:
      'A contract that rejects all incoming ETH ends the cycle as Chrono-Warrior. Why can\u2019t it block the cycle from finalizing?',
    options: {
      a: 'Its ETH goes to the Allocations Wallet escrow, so finalization never depends on that recipient accepting a transfer.',
      b: 'Finalization retries the transfer until it is accepted.',
      c: 'Its share is skipped and compounds into the next cycle.',
      d: 'The Cosmic Council reroutes the share to another address.',
    },
    explanation:
      'Secondary ETH allocations are held in the Allocations Wallet rather than transferred to recipients during finalization. A recipient that rejects ETH therefore cannot block finalization through that transfer. The allocation remains available for retrieval under the escrow deadline.',
    referenceLabel: 'White paper \u00a711.2 \u2014 Defensive Design',
  },
  'public-goods-transfer-fails': {
    prompt:
      'During finalization, the Public Goods forwarding cannot complete. What does the protocol do?',
    options: {
      a: 'Finalization proceeds anyway, and the event is recorded for later handling.',
      b: 'The whole finalization reverts until the transfer succeeds.',
      c: 'The share is burned.',
      d: 'The share is silently added to the beneficiary\u2019s allocation.',
    },
    explanation:
      'Failure-tolerant forwarding is a deliberate design choice: a problem at the Public Goods Vault must never strand a cycle. Finalization completes, the failure is recorded on-chain, and the forwarding is handled afterward. Compare that with the beneficiary push, which does revert \u2014 but only the caller\u2019s own transaction.',
    referenceLabel: 'White paper \u00a711.2 \u2014 Defensive Design',
  },
  'no-anchored-nfts': {
    prompt:
      'A cycle finalizes while zero Cosmic Signature NFTs are anchored. What happens to the Anchor Distribution?',
    options: {
      a: `That cycle\u2019s ${protocolFacts.anchorDistributionPercentage}% is skipped and its share compounds into the next cycle.`,
      b: 'It is forwarded to Public Goods instead.',
      c: 'It is held until someone anchors, then paid retroactively.',
      d: 'It is split among the Stellar Selection recipients.',
    },
    explanation:
      'If no Cosmic Signature NFTs are anchored at finalization, the Anchor Distribution is skipped and its share rolls forward with the compounding reserve. Nothing is held back for future anchor-holders \u2014 each cycle\u2019s distribution reads the anchored set as it stands.',
    referenceLabel: 'White paper \u00a75.1 \u2014 Distribution at Finalization',
  },
  'no-cst-gestures': {
    prompt:
      'A cycle ends without a single CST gesture. Which allocation track is affected, and how?',
    options: {
      a: 'The Final CST Gesture track is skipped entirely for that cycle.',
      b: 'Its CST and NFT go to the final ETH gesture maker instead.',
      c: 'The cycle cannot finalize until someone gestures with CST.',
      d: `Its ${cst(protocolFacts.specialAllocationCst)} CST is burned in protest.`,
    },
    explanation:
      'Cycles with no CST gestures simply skip the Final CST Gesture track \u2014 no substitute recipient is drafted, and finalization proceeds normally. The same skip-not-substitute principle applies to the anchored-Random-Walk Selection when nothing is anchored.',
    referenceLabel: 'White paper \u00a75.1 \u2014 Distribution at Finalization',
  },
  'randomness-sources': {
    prompt: 'Where does the randomness behind Stellar Selection and art seeds come from?',
    options: {
      a: 'An on-chain construction folding the previous block hash, the base fee, and Arbitrum precompile entropy, with values derived via keccak256.',
      b: 'A Chainlink VRF oracle subscription.',
      c: 'A commit-reveal ceremony among the cycle\u2019s participants.',
      d: 'A seed submitted by the team before each finalization.',
    },
    explanation:
      'The seed folds together the previous block hash, the current base fee, and Arbitrum-specific entropy from the ArbSys and ArbGasInfo precompiles \u2014 the previous Arbitrum block hash, the gas backlog, and L1 pricing counters. This is deliberate minimalism: no oracle, no external committee, no callback that could strand a cycle.',
    referenceLabel: 'White paper \u00a711.3 \u2014 Randomness',
  },
  'randomness-limits': {
    prompt: 'What limitation of that randomness does the white paper state plainly?',
    options: {
      a: 'A sequencer could in principle influence block-level inputs; the design bounds what that influence could reach.',
      b: 'None \u2014 the construction is provably unpredictable by everyone.',
      c: 'The randomness sometimes fails, which cancels the cycle.',
      d: 'Participants with many gestures can predict the selections.',
    },
    explanation:
      'A sequencer could influence block-level inputs. This randomness is used for Stellar Selection and artwork seeds at finalization; it does not determine the countdown, Gesture Costs, or allocation percentages. The documented limits do not remove the underlying risk.',
    referenceLabel: 'White paper \u00a711.3 \u2014 Randomness',
  },
  'precompile-unavailable': {
    prompt:
      'One of the Arbitrum precompiles is unavailable at the moment of finalization. What happens to the randomness construction?',
    options: {
      a: 'The precompile calls are failure-tolerant; the construction falls back to the remaining sources.',
      b: 'Finalization reverts until the precompile returns.',
      c: 'The cycle waits and retries hourly.',
      d: 'The owner supplies a replacement seed.',
    },
    explanation:
      'If a precompile call fails, the randomness construction uses the remaining entropy sources. This fallback prevents that failed call from blocking finalization.',
    referenceLabel: 'White paper \u00a711.3 \u2014 Randomness',
  },
  'v2-flat-cst-problem': {
    prompt: `V1 imprinted a flat ${cst(100)} CST per gesture. Why did V2 replace that with the square-root formula?`,
    options: {
      a: 'Flat imprinting turned machine-speed gesture sequences into an unbounded source of new CST; the new rule imprints by patience, not frequency.',
      b: 'Participants complained the flat amount was too small.',
      c: 'The formula was simplified to save gas.',
      d: 'It enabled a one-time allocation for the team.',
    },
    explanation:
      'Under flat imprinting, a burst of rapid gestures manufactured CST from nothing but speed. Under the square-root rule, a burst imprints approximately zero while patient participation creates supply \u2014 the formula is itself a supply control, not just a pricing curve.',
    referenceLabel: 'White paper \u00a712.2 \u2014 The V2 Upgrade',
  },
  'v2-min-imprint-guard': {
    prompt:
      'V2 added a parameter to every gesture method: the smallest Participation CST amount the participant will accept. What is it for?',
    options: {
      a: 'It protects participants from timing shifts between signing and execution \u2014 if the imprint would fall below their floor, the gesture reverts.',
      b: 'It lets participants request extra CST for a fee.',
      c: 'It caps the total CST a cycle can imprint.',
      d: 'It is a Council-controlled tax on gestures.',
    },
    explanation:
      'Participation CST depends on the time since the previous gesture. If another gesture executes first, that interval can shrink between signing and execution. The minimum-imprint guard makes the transaction revert when the actual imprint would be below the participant’s specified minimum.',
    referenceLabel: 'White paper \u00a712.2 \u2014 The V2 Upgrade',
  },
  'v2-exclusivity-change': {
    prompt: 'What did V2 do to the Final Gesture participant\u2019s exclusive finalization window?',
    options: {
      a: `It grew from ${protocolFacts.initialCycleFinalizationHoursAtLaunch} to ${protocolFacts.finalGestureExclusivityHours} hours.`,
      b: `It shrank to ${protocolFacts.initialCycleTimeIncrementHours} hour to speed cycles up.`,
      c: 'It was removed \u2014 finalization is open to everyone immediately.',
      d: 'It became infinite \u2014 only the Final Gesture participant may ever finalize.',
    },
    explanation: `V2 doubled the exclusivity window from ${protocolFacts.initialCycleFinalizationHoursAtLaunch} to ${protocolFacts.finalGestureExclusivityHours} hours \u2014 a response to observed behavior: real people sleep, travel, and lose track of deadlines. The window is still finite, because nothing in the protocol waits forever.`,
    referenceLabel: 'White paper \u00a712.2 \u2014 The V2 Upgrade',
  },
  'v2-timing-loophole': {
    prompt: 'V2\u2019s timing hardening closed a loophole. What was it?',
    options: {
      a: 'Near-free CST gestures made after expiry could repeatedly push the deadline outward; extensions now always apply to the stored finalization time.',
      b: 'ETH gestures could be replayed across cycles.',
      c: 'The countdown could be paused by the owner mid-cycle.',
      d: 'Anchored NFTs could be released and re-anchored in one transaction.',
    },
    explanation:
      'When the CST cost has descended to almost zero, post-expiry gestures were nearly free \u2014 and if each one extended the deadline from the present moment, a cycle could be dragged out indefinitely for pennies. Anchoring extensions to the stored time closed the loophole; the same upgrade hardened the scheduling arithmetic so no parameter configuration can prevent finalization.',
    referenceLabel: 'White paper \u00a712.2 \u2014 The V2 Upgrade',
  },
  'v3-what-changes': {
    prompt: 'The planned V3 upgrade changes exactly one thing. What?',
    options: {
      a: 'The cost of acting late: during the final 20 minutes, every Gesture Cost is multiplied by a premium ramping from 1x to 10x.',
      b: 'The art pipeline switches to a new renderer.',
      c: 'CST gestures are removed.',
      d: 'The allocation percentages are rebalanced.',
    },
    explanation:
      'V3 touches nothing but the endgame: in the final 20 minutes before the Cycle Finalization Time, every Gesture Cost \u2014 ETH, ETH with a Random Walk NFT, or CST \u2014 is multiplied by a premium that ramps polynomially from 1x to 10x. Everything else in the protocol stays as V2 defined it.',
    referenceLabel: 'White paper \u00a712.3 \u2014 The Planned V3 Upgrade',
  },
  'v3-shape': {
    prompt:
      'V3\u2019s premium is m(t) = 1 + 9\u00b7(t/T)\u2078. Why does the eighth-order exponent matter?',
    options: {
      a: 'The premium stays nearly invisible for most of the window and turns steep only at the very end \u2014 about 1.04x at ten minutes out, 1.9x at five, 7x at one, and 10x at zero.',
      b: 'It makes the premium rise linearly across the window.',
      c: 'It applies the full 10x for the entire final window.',
      d: 'It only affects CST gestures.',
    },
    explanation:
      'The eighth-power curve concentrates most of the increase near the deadline. Earlier in the window, the multiplier remains close to 1; near the end, it rises sharply toward 10. A linear curve would spread the increase evenly, while a fixed multiplier would apply the same cost throughout.',
    referenceLabel: 'White paper \u00a712.3 \u2014 The Planned V3 Upgrade',
  },
  'v3-overtime': {
    prompt:
      'Under V3, Zed waits until after the deadline has passed and gestures during overtime. What premium applies?',
    options: {
      a: 'The full 10x \u2014 the premium reaches 10x at the deadline and stays there for any overtime gesture.',
      b: 'None \u2014 overtime gestures are back to 1x.',
      c: 'Half the maximum, 5x.',
      d: 'Overtime gestures are blocked entirely under V3.',
    },
    explanation:
      'Under the planned V3 rules, the multiplier reaches 10 at the deadline and stays there during overtime. Post-expiry gestures remain possible, and V2’s rule of extending the stored finalization time still applies.',
    referenceLabel: 'White paper \u00a712.3 \u2014 The Planned V3 Upgrade',
  },
  'owner-mid-cycle': {
    prompt:
      'Mid-cycle, the owner decides a percentage should change and the contract should upgrade. What can the owner actually do right now?',
    options: {
      a: 'The percentage change and upgrade must wait until the interval between cycles; core parameters are locked during an active cycle.',
      b: 'Change the percentage immediately, but not the code.',
      c: 'Upgrade the contract, but not the parameters.',
      d: 'Both, with a Council co-signature.',
    },
    explanation:
      'During an active cycle, the owner cannot change core percentages, time increments, or Gesture Costs, and cannot upgrade the protocol contract. Narrower controls, such as some peripheral settings, have separately documented limits.',
    referenceLabel: 'White paper \u00a713 \u2014 The Path to Full Decentralization',
  },
  'owner-cannot-reach': {
    prompt: 'Which of these can the owner touch, even between cycles?',
    options: {
      a: 'None of these assets or records can be reassigned directly through the documented administrative functions.',
      b: 'Escrowed allocations, but nothing else.',
      c: 'Recorded seeds, to fix broken artwork.',
      d: 'CST balances, in emergencies.',
    },
    explanation:
      'The documented administrative functions do not directly reassign escrowed allocations, imprinted NFT ownership, recorded seeds, or CST balances. The owner retains separately disclosed upgrade authority between cycles until privileged control is relinquished.',
    referenceLabel: 'White paper \u00a713 \u2014 The Path to Full Decentralization',
  },
  'owner-endgame': {
    prompt: 'How does the owner role end, according to the white paper\u2019s commitment?',
    options: {
      a: 'Once the remaining upgrades are complete, privileged control leaves the deploying address permanently \u2014 by transfer to the Cosmic Council or outright renouncement, announced in advance.',
      b: 'It never ends; the team keeps a maintenance role indefinitely.',
      c: 'It is sold to the highest-weighted Council delegate.',
      d: 'It transfers to a company multisig permanently.',
    },
    explanation:
      'The commitment is explicit: after the remaining upgrades land, beginning with V3, the owner role leaves the deployer permanently, with the exact mechanism announced in advance. From then on no private party can upgrade the protocol or change its parameters \u2014 and every step of the process is visible on-chain, including the last one.',
    referenceLabel: 'White paper \u00a713 \u2014 The Path to Full Decentralization',
  },
  'postpone-activation-limit': {
    prompt:
      'The owner wants to postpone an upcoming cycle\u2019s activation. What bounds that power?',
    options: {
      a: 'It works only until the cycle\u2019s first gesture arrives \u2014 after that, the cycle is beyond postponing.',
      b: 'It can pause a cycle at any point, even mid-flight.',
      c: 'It requires a Council proposal to pass first.',
      d: 'There is no such power at all.',
    },
    explanation:
      'Postponing an upcoming cycle\u2019s activation is one of the three narrow controls available at any time \u2014 but only until its first gesture arrives. The moment someone gestures, the cycle is live and the owner\u2019s timing lever is gone.',
    referenceLabel: 'White paper \u00a713 \u2014 The Path to Full Decentralization',
  },
  'no-team-eth': {
    prompt:
      'What is the only recurring flow the team directs, and what ETH does the team receive from gestures?',
    options: {
      a: `The ${cst(protocolFacts.outreachReserveCst)} CST per cycle to the Outreach Reserve \u2014 and no team wallet receives ETH from gestures, ever.`,
      b: 'A small ETH percentage of each gesture.',
      c: 'The Signature Allocation of every tenth cycle.',
      d: 'Nothing at all, including CST.',
    },
    explanation: `The Outreach Reserve receives ${cst(protocolFacts.outreachReserveCst)} CST per cycle for community outreach \u2014 the only recurring flow the team directs, and it carries no special powers. On the ETH side the paper is absolute: no team wallet receives ETH from gestures.`,
    referenceLabel: 'White paper \u00a77.1 \u2014 Imprint Rules',
  },
  'art-integrator': {
    prompt:
      'Which numerical method integrates the three-body simulation, and why does the choice matter?',
    options: {
      a: 'A fourth-order Yoshida symplectic integrator \u2014 it preserves the system\u2019s energy behavior over long horizons.',
      b: 'Simple Euler steps \u2014 fast and good enough for art.',
      c: 'A neural network approximating the orbits.',
      d: 'Closed-form solutions to the three-body equations.',
    },
    explanation:
      'Symplectic integrators preserve the geometric structure of Hamiltonian systems and are designed for stable energy behavior over long simulations. They do not guarantee exact energy conservation at every step. The three-body problem has no general closed-form solution, so the pipeline uses numerical integration.',
    referenceLabel: 'White paper \u00a76.1 \u2014 The Pipeline',
  },
  'art-candidates': {
    prompt: 'How does the pipeline pick the orbit that becomes a Signature?',
    options: {
      a: 'One hundred thousand candidate configurations are simulated for a million steps each, then a Borda rank aggregation scores chaos and triangle equilateralness to pick the most visually interesting orbit.',
      b: 'The first randomly generated orbit is used as-is.',
      c: 'The team curates each cycle\u2019s orbits by hand.',
      d: 'NFT owners vote on candidate orbits after imprinting.',
    },
    explanation:
      'The seed spawns one hundred thousand candidates; each is integrated for a million physics steps; a Borda rank aggregation across chaos and equilateralness metrics picks the standout. Every stage is a pure function of the seed \u2014 curation happens by algorithm, identically reproducible by anyone.',
    referenceLabel: 'White paper \u00a76.1 \u2014 The Pipeline',
  },
  'art-color': {
    prompt: 'How are the colors of the three bodies chosen?',
    options: {
      a: 'Mixed in the OKLab perceptual color space with 120-degree hue separation per body, modulated by drift and a sine wave.',
      b: 'Fixed red, green, and blue for every Signature.',
      c: 'Sampled from photographs of real nebulae.',
      d: 'Chosen by the NFT\u2019s first owner at imprint time.',
    },
    explanation:
      'Colors are mixed in OKLab \u2014 a perceptual space where equal numeric distances look equally different to human eyes \u2014 with 120-degree hue separation keeping the three bodies visually distinct. Like everything downstream of the seed, the palette is deterministic.',
    referenceLabel: 'White paper \u00a76.1 \u2014 The Pipeline',
  },
  'art-spectral': {
    prompt: 'What makes the orbit trails render the way they do?',
    options: {
      a: 'Spectral rendering across sixty-four wavelength bins spanning 380 to 700 nanometers, with velocity-dependent thickness and depth of field.',
      b: 'Flat vector strokes with a glow filter.',
      c: 'Screenshots of a physics simulator, upscaled by AI.',
      d: 'Hand-tuned splines traced over the simulation.',
    },
    explanation:
      'The renderer treats light as a spectrum, not three color channels: sixty-four wavelength bins across the visible range, trails whose thickness responds to velocity, and depth of field for dimensionality. AgX tonemapping, bloom, OpenSimplex nebula layers, and grading finish the frame.',
    referenceLabel: 'White paper \u00a76.1 \u2014 The Pipeline',
  },
  'art-output': {
    prompt: 'What files does the pipeline output for every NFT?',
    options: {
      a: 'A 16-bit PNG and a 30-second H.265 video.',
      b: 'A JPEG thumbnail only.',
      c: 'An animated GIF.',
      d: 'An SVG vector file.',
    },
    explanation:
      'Each Signature ships as a 16-bit PNG \u2014 double the usual color depth per channel \u2014 plus a 30-second H.265 video of the orbit in motion. Both are regenerable from the on-chain seed by anyone running the open-source pipeline.',
    referenceLabel: 'White paper \u00a76.1 \u2014 The Pipeline',
  },
  'art-server-death': {
    prompt:
      'Every server associated with the project disappears tomorrow. What happens to the artwork?',
    options: {
      a: 'Every Signature can be regenerated from the chain \u2014 the seeds are on-chain and the pipeline is public.',
      b: 'The art is lost; only metadata survives.',
      c: 'Only thumbnails survive in wallets.',
      d: 'It depends on whether IPFS pins are maintained.',
    },
    explanation:
      'NFT seeds remain on-chain, and the rendering pipeline is open source and deterministic. Anyone with the seed and the pipeline can regenerate the artwork without relying on the project’s image servers.',
    funFact:
      'Continuous integration asserts SHA-256 hashes of rendered frames, so even an accidental one-pixel drift in the pipeline would fail the build.',
    referenceLabel: 'White paper \u00a76.2 \u2014 Reproducibility and License',
  },
  'art-naming': {
    prompt: 'What customization does an owner have over their Cosmic Signature NFT?',
    options: {
      a: 'They may name it on-chain, up to 32 bytes \u2014 the artwork itself never changes.',
      b: 'They may regenerate the seed once.',
      c: 'They may adjust the color palette.',
      d: 'They may extend the video\u2019s duration.',
    },
    explanation:
      'Owners may record a name of up to 32 bytes on-chain. That is the entire customization surface: the seed, the orbit, the palette, and the video are fixed forever at imprint time — determinism is the collection’s core promise, and regenerating would break it.',
    referenceLabel: 'White paper \u00a76.2 \u2014 Reproducibility and License',
  },
  'art-license': {
    prompt:
      'Under what license do the project-owned contracts, shaders, and rendering pipelines ship?',
    options: {
      a: 'CC0 1.0 \u2014 dedicated to the public domain, no rights reserved.',
      b: 'A proprietary license held by the team.',
      c: 'GPL-3.0, requiring derivative works to open their source.',
      d: 'A per-NFT license owned by each holder.',
    },
    explanation:
      'Project-owned code is dedicated under CC0 1.0 with no rights reserved: anyone may fork the contracts, the renderer, or the site. Third-party dependencies retain their own licenses. Even this white paper is CC0.',
    referenceLabel: 'White paper \u00a76.2 \u2014 Reproducibility and License',
  },
  'seed-derivation': {
    prompt: 'When and how is an NFT\u2019s art seed created?',
    options: {
      a: 'At imprint time, the contract derives a 32-byte seed from on-chain data and stores it with the NFT; a SHA3-256 generator makes everything downstream a pure function of it.',
      b: 'The artist uploads a seed for each NFT before finalization.',
      c: 'The seed is the owner\u2019s wallet address.',
      d: 'A fresh seed is selected every time the art is rendered.',
    },
    explanation:
      'The seed is derived on-chain at imprint time and stored with the NFT permanently. It initializes a SHA3-256 random number generator, and every downstream choice \u2014 candidate orbits, camera, colors \u2014 is a pure function of it. Render it today or in a decade: same seed, same Signature.',
    referenceLabel: 'White paper \u00a76.1 \u2014 The Pipeline',
  },
  'hacken-findings': {
    prompt: 'What did Hacken\u2019s independent security review of the contracts conclude?',
    options: {
      a: '23 findings: none critical, none high severity, 3 medium, 8 low, and 12 informational \u2014 most of them design trade-offs accepted with written rationale.',
      b: 'Several critical findings that remain unfixed.',
      c: 'Zero findings of any severity.',
      d: 'The report was never published.',
    },
    explanation:
      'Published in January 2026, the review covered the core protocol, CST, both NFT integrations, anchoring wallets, and supporting contracts. Assess the findings together with their severity, resolution status, and scope. The absence of critical or high-severity findings does not establish that the protocol is risk-free.',
    referenceLabel: 'White paper \u00a711.1 \u2014 Independent Review',
  },
  'hacken-invariants': {
    prompt: 'Beyond the manual review, what did Hacken\u2019s fuzz testing check?',
    options: {
      a: '14 system invariants \u2014 such as the ETH balance always equaling deposits minus distributions \u2014 all of which held across 10,000 runs.',
      b: 'Gas usage across common transactions.',
      c: 'The art pipeline\u2019s determinism.',
      d: 'Frontend rendering performance.',
    },
    explanation:
      'Fuzz testing runs generated inputs while checking specified properties. Hacken tested 14 invariants across 10,000 runs, with no violation reported. This complements manual review but does not prove every possible state is safe.',
    referenceLabel: 'White paper \u00a711.1 \u2014 Independent Review',
  },
  'verification-tooling': {
    prompt: 'Besides the external review, what verification tooling does the repository carry?',
    options: {
      a: 'Certora formal verification specifications, Solidity SMTChecker configuration, Slither static analysis, and a test suite targeting complete coverage.',
      b: 'Nothing \u2014 the external review is the only check.',
      c: 'A closed-source test suite run privately.',
      d: 'Manual testing before each release.',
    },
    explanation:
      'Certora specifications, SMTChecker, Slither, and coverage-focused tests examine different properties and classes of defects. They complement Hacken’s review and fuzz testing; none of these checks alone establishes complete correctness.',
    referenceLabel: 'White paper \u00a711.1 \u2014 Independent Review',
  },
  'sourcify-status': {
    prompt: 'What is the source-verification status of the deployed contracts?',
    options: {
      a: 'Exact-match verified on Sourcify for Arbitrum One (chain 42161), at the addresses fixed in the white paper\u2019s appendix.',
      b: 'Unverified \u2014 you have to trust the bytecode.',
      c: 'Only the proxy is verified, not the implementation.',
      d: 'Verified on a testnet, but not on mainnet.',
    },
    explanation:
      'All contracts are exact-match verified on Sourcify for chain 42161 \u2014 the strictest verification tier, where the on-chain bytecode matches the published source byte for byte, metadata included. The proxy address is the protocol\u2019s permanent address; implementations change only through the public upgrade process.',
    referenceLabel: 'White paper \u00a711.4 \u2014 Open Verification',
  },
  reentrancy: {
    prompt:
      'A hostile contract tries to re-enter the protocol mid-transaction through a callback. What stands in its way?',
    options: {
      a: 'Reentrancy guards protect every external entry point of the core contract.',
      b: 'Nothing \u2014 the protocol relies on recipients behaving.',
      c: 'A Council-managed allowlist of trusted contracts.',
      d: 'Gas limits alone make reentrancy impossible.',
    },
    explanation:
      'Reentrancy guards prevent protected entry points from being called again during an ongoing transaction. Escrowing secondary allocations also avoids recipient transfers during finalization. These defenses address specific risks without proving all possible attacks are prevented.',
    referenceLabel: 'White paper \u00a711.2 \u2014 Defensive Design',
  },
  'intercycle-locks-why': {
    prompt: 'Why are contract upgrades impossible while a cycle runs \u2014 even in an emergency?',
    options: {
      a: 'By deliberate design: there is no mechanism for changing the contract mid-cycle, whatever the circumstances, so participants always act under the rules they could inspect.',
      b: 'Upgrades would cost too much gas mid-cycle.',
      c: 'It is a technical limitation of the proxy pattern.',
      d: 'They are possible with a unanimous Council decision.',
    },
    explanation:
      'The inter-cycle lock is a policy carved into the contract, not a technical accident \u2014 UUPS proxies could technically upgrade at any time. The protocol chose to make mid-cycle changes impossible so that the rules a participant sees when gesturing are the rules that settle the cycle.',
    referenceLabel: 'White paper \u00a712.1 \u2014 V1: Launch',
  },
  'cst-checkpoints': {
    prompt: 'How does CST snapshot Coordination Weight for proposals?',
    options: {
      a: 'With timestamp-based checkpoints \u2014 proposal snapshots refer to wall-clock time rather than block numbers.',
      b: 'With block-number checkpoints, like most Governor deployments.',
      c: 'Weight is read live at the moment each vote is expressed.',
      d: 'A snapshot is taken once per cycle at finalization.',
    },
    explanation:
      'The token uses timestamp-based checkpoints, so proposal snapshots refer to wall-clock time. On an L2 where block cadence differs from Ethereum mainnet, timestamps are the steadier reference \u2014 a subtle choice that keeps coordination timelines predictable.',
    referenceLabel: 'White paper \u00a77.3 \u2014 Coordination Weight',
  },
  'dust-refund': {
    prompt:
      'Pia overpays her ETH gesture by a few wei \u2014 below the dust threshold. What happens to the difference?',
    options: {
      a: 'It stays in the reserve: a refund that small would cost more in gas than it returns.',
      b: 'It is refunded anyway, on principle.',
      c: 'It accumulates in a personal credit balance.',
      d: 'The gesture reverts to protect her.',
    },
    explanation:
      'Overpayment above the dust threshold is refunded in the same transaction. Below the threshold, it remains in the reserve because the gas cost of sending a refund would exceed the amount returned.',
    referenceLabel: 'White paper \u00a74.1 \u2014 ETH Gestures',
  },
  'rwlk-not-transferred': {
    prompt: 'Sol attaches his Random Walk NFT for the cost reduction. Where is the NFT afterward?',
    options: {
      a: 'Still in his wallet \u2014 the contract only marks it used; it is never transferred or escrowed.',
      b: 'Escrowed in the Allocations Wallet until the cycle ends.',
      c: 'Burned in exchange for the reduction.',
      d: 'Transferred to the protocol and returned after finalization.',
    },
    explanation:
      'The NFT stays in its owner’s wallet. The contract marks its cost reduction as used and applies the discount to the ETH gesture. That one-time discount cannot be used again in a later cycle.',
    referenceLabel: 'White paper \u00a74.2 \u2014 Random Walk NFT Attachment',
  },
  'open-finalization-carries': {
    prompt:
      'During the Open-Finalization Window, Quill (who never gestured once) finalizes the cycle. What exactly does she receive?',
    options: {
      a: 'Everything the beneficiary role carries: the Signature Allocation\u2019s ETH share, its CST imprint, its NFT, and priority over attached assets.',
      b: 'A fixed finalization fee, with the allocations still going to the Final Gesture participant.',
      c: 'Only the NFT; the ETH compounds.',
      d: 'Nothing \u2014 finalizing is a public service.',
    },
    explanation:
      'During the Open-Finalization Window, the participant who finalizes becomes the cycle beneficiary and receives the full Signature Allocation, including priority to retrieve attached assets. Previous participation is not required.',
    referenceLabel: 'White paper \u00a73.3 \u2014 Finalization',
  },
  'attached-priority-timeout': {
    prompt: 'How long does the beneficiary\u2019s priority over attached assets last?',
    options: {
      a: `${protocolFacts.secondaryRetrievalTimeoutWeeks} weeks \u2014 after the open retrieval timeout, anyone may retrieve them.`,
      b: 'Forever \u2014 attached assets wait indefinitely for the beneficiary.',
      c: `${protocolFacts.finalGestureExclusivityHours} hours, matching the finalization window.`,
      d: 'Until the next cycle finalizes.',
    },
    explanation: `Attached assets sit in the Allocations Wallet with the same ${protocolFacts.secondaryRetrievalTimeoutWeeks}-week timeout as every escrowed allocation. The beneficiary has priority during that window; afterward, the assets become available to the first caller. The ${protocolFacts.finalGestureExclusivityHours}-hour figure governs finalization rights, not escrow.`,
    referenceLabel: 'White paper \u00a75.4 \u2014 Delivery, Escrow, and Timeouts',
  },
  'eth-window-duration-drift': {
    prompt: 'How long does the ETH Calibration Window\u2019s descent take, and is that fixed?',
    options: {
      a: 'About two days at launch parameters \u2014 but its duration is tied to the cycle time increment, so it stretches slowly as the protocol ages.',
      b: `Exactly ${protocolFacts.finalGestureExclusivityHours} hours, forever.`,
      c: `Exactly ${protocolFacts.initialCstCalibrationWindowHours} hours, like the CST window\u2019s reference.`,
      d: 'It shrinks each cycle as activity grows.',
    },
    explanation: `At launch parameters the descent takes about two days, and if it fully elapses the cost simply rests at the floor. Because the duration is tied to the time increment \u2014 which grows ${protocolFacts.cycleTimeIncrementIncreasePercentPerCycle}% per cycle \u2014 the window stretches with the protocol\u2019s lengthening tempo rather than staying fixed.`,
    referenceLabel: 'White paper \u00a73.1 \u2014 The ETH Calibration Window',
  },
  'first-cycle-opening': {
    prompt: 'The very first cycle had no predecessor to calibrate from. How did it open?',
    options: {
      a: `At a fixed ${protocolFacts.initialGestureCostEth} ETH.`,
      b: 'At 1 ETH, chosen by the Council.',
      c: 'Free \u2014 the first gesture cost nothing.',
      d: 'At twice the deployment gas cost.',
    },
    explanation: `With no previous opening cost to double, cycle one opened at a fixed ${protocolFacts.initialGestureCostEth} ETH \u2014 deliberately tiny, letting the market walk the cost upward through the ${protocolFacts.ethGestureCostStepUpPercent}% step-ups and the cycle-to-cycle calibration rather than guessing a launch price.`,
    referenceLabel: 'White paper \u00a73.1 \u2014 The ETH Calibration Window',
  },
  'selection-entry-scaling': {
    prompt:
      'Bea made 30 gestures this cycle; Cal made 3. What is true about the ETH Stellar Selection?',
    options: {
      a: 'Bea’s entries appear ten times as often in the pool, and with replacement she could even be selected more than once — but Cal can absolutely still be selected.',
      b: 'Bea is guaranteed at least one selection.',
      c: 'Cal is excluded; only the top participants qualify.',
      d: 'Both have identical chances \u2014 one entry per address.',
    },
    explanation:
      'Entries scale with gestures made — selection frequency is proportional to participation — and selections are made with replacement. Nothing is guaranteed to anyone, and no one who gestured is excluded: the pool weights activity without rationing or thresholds.',
    referenceLabel: 'White paper \u00a75.3 \u2014 Stellar Selections',
  },
  'recognition-vs-participation': {
    prompt:
      'CST enters circulation through three flows. Which one is team-directed, and what power does it carry?',
    options: {
      a: `Only the Outreach Reserve\u2019s ${cst(protocolFacts.outreachReserveCst)} CST per cycle \u2014 and it carries no special powers at all.`,
      b: 'Recognition CST, which the team assigns to favored participants.',
      c: 'Participation CST, which the team can adjust per gesture.',
      d: 'All three flows are team-directed.',
    },
    explanation: `The three flows are: Participation CST (imprinted at gesture time by formula), Recognition CST (${cst(protocolFacts.specialAllocationCst)} CST paired with each NFT distribution at finalization), and the Outreach Reserve (${cst(protocolFacts.outreachReserveCst)} CST per cycle). Only the last is team-directed \u2014 and it is ordinary CST with no special powers, spent on community outreach.`,
    referenceLabel: 'White paper \u00a77.1 \u2014 Imprint Rules',
  },
  'finalization-actions': {
    prompt: 'Finalization is a single transaction. What does it actually do?',
    options: {
      a: 'Reads the protocol\u2019s ETH balance once, distributes the allocation tracks, imprints the cycle\u2019s NFTs and CST, records each artwork\u2019s seed, and schedules the next cycle.',
      b: 'Only transfers the beneficiary\u2019s ETH; everything else happens later.',
      c: 'Only imprints the NFTs; ETH distribution follows over several transactions.',
      d: 'Starts a multi-day settlement process handled by the team.',
    },
    explanation:
      'One transaction settles the entire cycle: the ETH balance is read once, the tracks of Section 5 are distributed (push for the beneficiary and Public Goods, escrow for the rest), NFTs and CST are imprinted with their seeds recorded, and the next cycle is scheduled. Atomicity is the point \u2014 there is no half-finalized state.',
    referenceLabel: 'White paper \u00a73.3 \u2014 Finalization',
  },
  'chrono-vs-endurance-trap': {
    prompt:
      'Nyx holds the most-recent-gesture spot for six hours early in the cycle. Later, Orin holds it for nine hours. Orin\u2019s record stands only briefly before finalization, while Nyx\u2019s stood for two days. Who ends up with which title?',
    options: {
      a: 'Orin is Endurance Champion (longest single gap); Nyx\u2019s long reign as record-holder makes her the likely Chrono-Warrior.',
      b: 'Nyx takes both titles \u2014 two days beats everything.',
      c: 'Orin takes both titles \u2014 the bigger gap always sweeps.',
      d: 'Titles go to whoever made the Final Gesture.',
    },
    explanation:
      'Endurance measures the gap you created — Orin’s nine hours beats Nyx’s six. The Chrono track measures how long the Endurance Champion title was held: Nyx held it for two days before Orin surpassed her, while Orin’s reign lasted only until finalization. The two tracks recognize different forms of persistence, and both resolve only at finalization.',
    referenceLabel: 'White paper \u00a75.2 \u2014 Endurance Champion and Chrono-Warrior',
  },
  'anchored-rwlk-weighting': {
    prompt:
      'Vale anchored five Random Walk NFTs; Wynn anchored one. How does the Anchored-NFT Stellar Selection treat them?',
    options: {
      a: `The ${protocolFacts.anchoredRwlkNftSelectionRecipients} selections are weighted by the number of NFTs each holder has anchored \u2014 Vale carries five times Wynn\u2019s weight.`,
      b: 'Each anchor-holder gets exactly one selection regardless of count.',
      c: 'Selections are weighted by how early each NFT was anchored.',
      d: 'Vale and Wynn split the selections equally.',
    },
    explanation: `The Anchored-NFT Stellar Selection runs ${protocolFacts.anchoredRwlkNftSelectionRecipients} selections per cycle across anchored Random Walk NFTs, weighted by the number each holder has anchored. Each selection carries ${cst(protocolFacts.specialAllocationCst)} CST and a Cosmic Signature NFT \u2014 and no ETH, which stays exclusive to anchored Cosmic Signature NFTs.`,
    referenceLabel: 'White paper \u00a75.3 \u2014 Stellar Selections',
  },
  'voluntary-vault-contributions': {
    prompt: 'Can ETH reach the Public Goods Vault outside the per-cycle forwarding?',
    options: {
      a: 'Yes \u2014 the vault also accepts voluntary ETH contributions directly, outside any cycle.',
      b: 'No \u2014 only finalization can move ETH to the vault.',
      c: 'Only the owner can top up the vault.',
      d: 'Only CST can be contributed voluntarily.',
    },
    explanation: `The vault accepts voluntary ETH contributions directly, on top of the enforced ${protocolFacts.publicGoodsPercentage}% per cycle. The mechanical forwarding sets the floor; anyone moved to add more can do so without waiting for a finalization.`,
    referenceLabel: 'White paper \u00a710 \u2014 Public Goods',
  },
  'risk-honesty': {
    prompt: 'Which of these does the white paper\u2019s own risk section admit?',
    options: {
      a: 'Reviews and formal analysis are not a guarantee \u2014 unknown defects can exist in any software that holds value.',
      b: 'The contracts are mathematically proven free of all defects.',
      c: 'Risks exist only until the V3 upgrade lands.',
      d: 'The only real risk is Ethereum itself failing.',
    },
    explanation:
      'The risk factors are stated without varnish: smart contract risk survives every review; the randomness has stated limits; the timeout deadlines are real; parameters can change between cycles until decentralization completes; asset values move. Treat gestures as expenditure on participation and art \u2014 that is the paper\u2019s own framing.',
    referenceLabel: 'White paper \u00a714.2 \u2014 Risk Factors',
  },
} as const satisfies QuizTierQuestionsText<'hard'>;
