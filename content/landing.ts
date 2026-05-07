/**
 * Single source of truth for every string rendered on the Cosmic Signature
 * landing page at cosmicsignature.com. Every landing component imports from
 * this file so regulatory/legal review is a single-file read.
 *
 * Vocabulary rules (see /marketing/cosmic-lexicon.md for canonical guide):
 * - "bid" is banned. Use "Gesture" or "Make a Gesture".
 * - "allocation" is banned. Use "Allocation" or "Signature Allocation".
 * - "stellarSelection" is banned. Use "Stellar Selection".
 * - "recipient" is banned. Use "Recipient".
 * - "Dutch auction" is banned. Use "Calibration Window".
 * - "anchoring / anchor / anchorHolder" are banned. Use "Anchoring / Anchor / Anchor-holder".
 * - "yield / rewards / passive" are banned. Use "Anchor Distribution".
 * - "charity / donation" are banned. Use "Public Goods Contribution".
 * - "DAO" is banned. Use "Cosmic Council" or "Protocol Coordination".
 * - "withdraw / claim" are replaced with "Retrieve".
 *
 * All public-copy banned words are also banned here per the lexicon's
 * 2026-04-23 revision: "game", "play", "player", "compete", "competition",
 * "contest", "tournament", "draw", "sweepstakes", "giveaway", "earn",
 * "earnings", "income".
 */

import { protocolFacts } from '@/content/protocol-facts';

import { APP_ORIGIN } from '@/lib/hostRouting';

export const landingContent = {
  meta: {
    title: 'Cosmic Signature — Procedural On-Chain Art Protocol',
    description:
      'Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Every gesture shapes the cycle\u2019s final Signature, and the protocol redistributes its reserves across everyone who shaped the outcome \u2014 including the infrastructure Ethereum itself depends on.',
    keywords: [
      'Cosmic Signature',
      'procedural art protocol',
      'on-chain art',
      'Arbitrum',
      'three-body problem',
      'generative art',
      'public goods',
      'Protocol Guild',
      'CC0',
      'formally verified',
    ],
  },

  hero: {
    eyebrow: 'Procedural on-chain art protocol \u00b7 Arbitrum',
    headline: 'Every Gesture Shapes the Signature.',
    subhead:
      'A procedural on-chain art protocol on Arbitrum. Make a gesture during a Performance Cycle, and every gesture shapes the cycle\u2019s final Signature. When the cycle closes, the protocol distributes its reserves across more than ten allocation tracks \u2014 including the infrastructure Ethereum itself depends on.',
    primaryCta: { label: 'Open the App', href: APP_ORIGIN },
    secondaryCta: { label: 'Explore the Cycle', href: '#cycle' },
    marqueeChips: [
      'Audited Contracts',
      'CC0',
      'Formally Verified',
      'Deterministic Art',
      '7% to Protocol Guild',
      'Cosmic Council',
      'Arbitrum One',
    ],
  },

  cycle: {
    eyebrow: 'The Cycle',
    heading: 'A Performance Cycle, from open to finalization.',
    description:
      'A cycle is a window in time. It opens with a Calibration Window, fills with gestures, and finalizes when the Cycle Finalization Time expires. No houses. No dealers. Just the protocol.',
    stages: [
      {
        number: '01',
        title: 'Cycle Opening',
        body: 'A new Performance Cycle begins. The Calibration Window opens: Gesture Cost descends from the Calibration Ceiling toward the Calibration Floor over roughly two days.',
      },
      {
        number: '02',
        title: 'Gestures',
        body: 'Participants make gestures with ETH or CST. Every gesture imprints Participation CST, extends the Cycle Finalization Time, and shapes the cycle\u2019s evolving Signature.',
      },
      {
        number: '03',
        title: 'Finalization',
        body: 'When the Cycle Finalization Time expires, the participant who made the Final Gesture may finalize the cycle. After the exclusivity window, the Open-Finalization Window opens to anyone.',
      },
      {
        number: '04',
        title: 'Allocations',
        body: 'The protocol distributes the Cycle Reserve across more than ten allocation tracks. About half of the ETH reserve rolls into the next cycle\u2019s Compounding Reserve.',
      },
    ],
  },

  art: {
    eyebrow: 'The Art',
    heading: 'The Three Body Problem, rendered on-chain.',
    description:
      'Every Cosmic Signature NFT visualizes three celestial bodies orbiting under Newtonian gravity. Three bodies produce fundamentally chaotic trajectories. No AI. No training data. Just deterministic physics. Same seed \u2192 identical output, pixel for pixel.',
    stages: [
      {
        number: '01',
        title: 'Seed',
        body: 'A 32-byte hash is derived from on-chain data \u2014 block information and ArbSys precompiles \u2014 then fed into a SHA3-256 RNG.',
      },
      {
        number: '02',
        title: 'Simulation',
        body: 'One hundred thousand candidate configurations run through a 4th-order Yoshida symplectic integrator at one million physics steps each.',
      },
      {
        number: '03',
        title: 'Selection',
        body: 'A Borda rank aggregation (chaos \u00d7 equilateralness) selects the most visually interesting orbit from the candidate pool.',
      },
      {
        number: '04',
        title: 'Camera',
        body: 'A slow elliptical camera drift gives each Signature a cinematic parallax through the three-body dance.',
      },
      {
        number: '05',
        title: 'Color',
        body: 'Colors are mixed in the OKLab perceptual space with 120\u00b0 hue separation per body, modulated by drift and a sine wave.',
      },
      {
        number: '06',
        title: 'Spectral Render',
        body: 'Sixteen wavelength bins from 380 to 700 nanometers render the orbit trails with velocity-dependent thickness and depth of field.',
      },
      {
        number: '07',
        title: 'Signature',
        body: 'AgX tonemapping, bloom, OpenSimplex nebula layers, and color grading finish the frame. The result: a 16-bit PNG plus a 30-second H.265 video.',
      },
    ],
    facts: [
      { label: 'Wavelength bins', value: '16' },
      { label: 'Physics steps per candidate', value: '1,000,000' },
      { label: 'Candidate orbits', value: '100,000' },
      { label: 'License', value: 'CC0 1.0' },
    ],
  },

  tracks: {
    eyebrow: 'Allocation Tracks',
    heading: 'More than ten ways the protocol distributes the Cycle Reserve.',
    description:
      'When a cycle finalizes, the protocol distributes its ETH and CST reserves across allocation tracks that recognize endurance, timing, dedication, and participation. About half of the ETH reserve compounds into the next cycle.',
    items: [
      {
        percent: '25%',
        title: 'Signature Allocation',
        body: 'To the participant who made the Final Gesture. Includes 1,000 CST and one Cosmic Signature NFT.',
        tone: 'primary',
      },
      {
        percent: '~50%',
        title: 'Compounding Cycle Reserve',
        body: 'Rolls forward into the next Performance Cycle. The protocol compounds rather than extracts.',
        tone: 'aurora',
      },
      {
        percent: '8%',
        title: 'Chrono-Warrior Allocation',
        body: `To the participant who held the Endurance Champion position for the longest consecutive interval. Includes ${protocolFacts.specialAllocationCst.toLocaleString()} CST and one Cosmic Signature NFT.`,
        tone: 'rose',
      },
      {
        percent: '7%',
        title: 'Public Goods Allocation',
        body: 'Forwarded to Protocol Guild, the funding mechanism for 170+ Ethereum core contributors.',
        tone: 'impact',
      },
      {
        percent: '6%',
        title: 'Anchor Distribution',
        body: 'Distributed proportionally across all Cosmic Signature NFTs anchored to the protocol for this cycle.',
        tone: 'nebula',
      },
      {
        percent: '4%',
        title: 'ETH Stellar Selection',
        body: 'Split across three randomly selected participants. Selection frequency scales with gestures made.',
        tone: 'solar',
      },
      {
        percent: '10 NFTs',
        title: 'NFT Stellar Selection \u2014 Participants',
        body: `Ten randomly selected participants each receive ${protocolFacts.specialAllocationCst.toLocaleString()} CST and one Cosmic Signature NFT.`,
        tone: 'default',
      },
      {
        percent: '10 NFTs',
        title: 'Anchored-NFT Stellar Selection',
        body: `Ten randomly selected Random Walk NFT anchor-holders each receive ${protocolFacts.specialAllocationCst.toLocaleString()} CST and one Cosmic Signature NFT.`,
        tone: 'default',
      },
      {
        percent: '1,000 CST',
        title: 'Endurance Champion Allocation',
        body: '1,000 Recognition CST and one Cosmic Signature NFT to the participant with the longest unbroken endurance window.',
        tone: 'default',
      },
      {
        percent: '1,000 CST',
        title: 'Final CST Gesture Allocation',
        body: '1,000 Recognition CST and one Cosmic Signature NFT to the participant who made the last CST gesture of the cycle.',
        tone: 'default',
      },
    ],
  },

  anchoring: {
    eyebrow: 'Anchoring',
    heading: 'Anchor Cosmic Signature NFTs to the protocol.',
    body: `Anchored Cosmic Signature NFTs receive a proportional share of the ${protocolFacts.anchorDistributionPercentage}% Anchor Distribution each cycle. Release the anchor whenever you like. Anchored Random Walk NFTs receive entries into the Anchored-NFT Stellar Selection, where selected anchor-holders receive ${protocolFacts.specialAllocationCst.toLocaleString()} CST and a Cosmic Signature NFT.`,
    bullets: [
      'Per-cycle ETH distribution for anchor-holders',
      'Release anchors at any time',
      'Random Walk anchors enter the Stellar Selection',
      'No lockup, no penalties, no fixed term',
    ],
    cta: { label: 'Anchor in the App', href: `${APP_ORIGIN}/anchoring` },
  },

  publicGoods: {
    eyebrow: 'Public Goods',
    heading: '7% of every cycle funds Ethereum\u2019s core contributors.',
    body: 'Every Performance Cycle forwards 7% of its ETH reserve to Protocol Guild \u2014 the collective funding mechanism for 170+ Ethereum core contributors. The more the protocol is used, the more flows to the infrastructure Ethereum itself depends on.',
    // lexicon-allow-start — explicit legal disclaimer language prescribed by
    // the Cosmic Lexicon Section C.7. "Charitable" appears here deliberately
    // to *deny* any charitable-tax-treatment framing, not to invoke one.
    disclaimer:
      'This is a forwarding of ETH to a public-goods address (currently Protocol Guild). It is not a charitable contribution in the U.S. tax sense, and Cosmic Signature makes no representation about its tax treatment.',
    // lexicon-allow-end
    cta: { label: 'Learn about Protocol Guild', href: 'https://protocol-guild.readthedocs.io' },
  },

  council: {
    eyebrow: 'Cosmic Council',
    heading: 'Protocol Coordination, on-chain.',
    body: 'The Cosmic Council coordinates the protocol on-chain. CST holders submit Coordination Proposals and express Support or Opposition. The Coordination Quorum is met at 3% of CST supply. Proposal threshold: 100 CST.',
    columns: [
      {
        title: 'Coordination Proposal',
        body: 'Any CST holder with at least 100 CST may submit a proposal. Two-day coordination delay, two-week coordination period.',
      },
      {
        title: 'Coordination Weight',
        body: 'Each CST expresses one unit of weight. Expression is a cryptographic signature, not a share or equity instrument.',
      },
      {
        title: 'Coordination Quorum',
        body: 'A proposal passes if support exceeds opposition and 3% of total CST supply has expressed a position.',
      },
    ],
  },

  verifiability: {
    eyebrow: 'Verifiability',
    heading: 'Open, verified, reproducible.',
    body: 'Anyone can verify a Signature by regenerating it from its seed. All contracts have been audited and are formally verified with Certora. The whole repository is CC0 \u2014 no rights reserved, fork and remix encouraged.',
    pillars: [
      {
        title: 'CC0 1.0',
        body: 'Every contract, every shader, every rendering pipeline. No rights reserved. Public domain.',
      },
      {
        title: 'Audited & Formally Verified',
        body: 'All contracts have been audited prior to deployment. Certora formal verification on core contract invariants and Slither static analysis run in CI.',
      },
      {
        title: 'Reproducible Art',
        body: 'SHA-256 hashes of generated frames asserted in continuous integration. Same seed \u2192 identical output.',
      },
    ],
  },

  // lexicon-allow-start: FAQ denial copy intentionally cites the categories it disclaims (lottery, investment, gambling) per cosmic-lexicon.md D.5. This is the one place these words must appear in order to disclaim them.
  faq: {
    eyebrow: 'Clarifications',
    heading: 'Questions worth answering plainly.',
    items: [
      // lexicon-allow-start — mandatory FAQ denial language. Lexicon C banned
      // list explicitly allows invoking "lottery, casino, gambling, house,
      // dealer, bet" in a denial FAQ so that search crawlers and compliance
      // reviewers can see the denial verbatim. Cosmic terms carry the rest.
      {
        question: 'Is this a lottery, casino, or gambling product?',
        answer:
          'No. Cosmic Signature is a procedural on-chain art protocol. Participants make gestures during a Performance Cycle; the protocol distributes allocations across more than ten tracks when the cycle finalizes. There is no house, no dealer, no bet. Allocations recognize endurance, timing, and participation. The one random allocation track, Stellar Selection, is a protocol-level procedural distribution.',
      },
      // lexicon-allow-end
      {
        question: 'What do I actually do as a participant?',
        answer:
          'You make gestures. Each gesture is an ETH or CST transaction that extends the Cycle Finalization Time, imprints Participation CST, and shapes the cycle\u2019s Signature. You may anchor Cosmic Signature NFTs to receive a share of Anchor Distributions. You may submit Coordination Proposals through the Cosmic Council if you hold at least 100 CST.',
      },
      {
        question: 'Where do the ETH allocations come from?',
        answer:
          'From the Cycle Reserve, which grows as participants make gestures. When a cycle finalizes, about half rolls forward into the next cycle\u2019s Compounding Reserve; the remainder is distributed across allocation tracks (Signature Allocation, Chrono-Warrior, Anchor Distribution, Stellar Selection, Public Goods) per on-chain parameters.',
      },
      // lexicon-allow-start — mandatory investment/securities denial FAQ.
      // Per lexicon guidance, "investment / profit / dividend" appear in a
      // denial context so that crawlers and reviewers see the explicit denial.
      {
        question: 'Is any of this an investment?',
        answer:
          'No. Cosmic Signature tokens (CST) express participation and coordination weight within the protocol, not equity, profit share, dividend, or investment contract. No team wallet receives ETH from participant gestures. Cosmic Signature makes no representation about token price or future behavior and does not solicit participation as an investment.',
      },
      // lexicon-allow-end
      // lexicon-allow-start — mandatory public-goods / tax-sense denial FAQ,
      // verbatim from cosmic-lexicon.md Section C.7. "Charitable" denies a
      // charitable-tax-treatment framing, not invokes one.
      {
        question: 'What exactly is Public Goods?',
        answer:
          'Seven percent of each cycle\u2019s ETH reserve is forwarded to a public-goods address, currently Protocol Guild. Protocol Guild is the collective funding mechanism for 170+ Ethereum core contributors. This is a forwarding of ETH to a public-goods address; it is not a charitable contribution in the U.S. tax sense, and Cosmic Signature makes no representation about its tax treatment.',
      },
      // lexicon-allow-end
      {
        question: 'What is the art, technically?',
        answer:
          'Each Cosmic Signature NFT is a deterministic render of a three-body Newtonian simulation. The on-chain seed selects a candidate orbit (from 100,000 simulated via a 4th-order Yoshida symplectic integrator), which is then spectrally rendered across 16 wavelength bins with OKLab color mixing. The pipeline is fully open-source under CC0; anyone can reproduce a Signature from its seed.',
      },
      {
        question: 'Can I fork this?',
        answer:
          'Yes. The entire repository is licensed CC0 1.0 \u2014 no rights reserved. Contracts, shaders, renderers, marketing site, and documentation are all in the public domain.',
      },
    ],
  },

  // lexicon-allow-end
  footer: {
    tagline: 'A procedural on-chain art protocol on Arbitrum.',
    columns: [
      {
        heading: 'Protocol',
        links: [
          { label: 'Open the App', href: APP_ORIGIN },
          { label: 'Documentation', href: `${APP_ORIGIN}/how-it-works` },
          { label: 'Contracts', href: `${APP_ORIGIN}/contracts` },
          { label: 'Source Code', href: `${APP_ORIGIN}/code` },
        ],
      },
      {
        heading: 'Community',
        links: [
          { label: 'X / Twitter', href: 'https://x.com/CosmicSignature' },
          { label: 'Discord', href: 'https://discord.gg/bGnPn96Qwt' },
          { label: 'GitHub', href: 'https://github.com/PredictionExplorer' },
          { label: 'Protocol Guild', href: 'https://protocol-guild.readthedocs.io' },
        ],
      },
      {
        heading: 'Legal',
        links: [
          { label: 'Terms', href: `${APP_ORIGIN}/terms` },
          { label: 'Privacy', href: `${APP_ORIGIN}/privacy` },
          { label: 'FAQ', href: '#faq' },
        ],
      },
    ],
    colophon: 'CC0 1.0 \u00b7 Formally verified \u00b7 Reproducible art',
  },
} as const;

export type LandingContent = typeof landingContent;
