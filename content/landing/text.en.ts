import { protocolFacts } from '@/content/protocol-facts';

import type { LandingText } from './structure';

/** English landing copy, keyed by the skeleton in structure.ts. */
export const landingTextEn = {
  meta: {
    title: 'Cosmic Signature: Procedural On-Chain Art Protocol on Arbitrum',
    description: `Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Participants make gestures in each Performance Cycle; when it finalizes, new Signatures are imprinted and the Cycle Reserve is allocated across more than ten tracks, ${protocolFacts.publicGoodsPercentage}% of it to Ethereum’s core contributors.`,
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
    ],
  },

  hero: {
    eyebrow: 'Procedural on-chain art protocol · Arbitrum',
    headline: 'Art, shaped by every gesture.',
    headlineLead: 'Art, shaped by',
    headlineAccent: 'every gesture.',
    subhead: `Make a gesture with ETH or CST to extend the cycle’s clock. When it runs out, finalizing the cycle imprints new Signatures and allocates the Cycle Reserve, ${protocolFacts.publicGoodsPercentage}% of it to Ethereum’s core contributors.`,
    primaryCtaLabel: 'Open the app',
    secondaryCtaLabel: 'How a cycle works',
    art: {
      viewAriaLabel: 'View Cosmic Signature {tokenLabel} in the app',
      artworkAlt: 'Cosmic Signature {tokenLabel} — deterministic three-body generative artwork',
      galleryCta: 'Browse the full gallery',
    },
  },

  cycle: {
    eyebrow: 'The Cycle',
    heading: 'A Performance Cycle, from opening to finalization.',
    steps: {
      gesture: {
        title: 'Make a gesture',
        body: 'Take part with ETH or CST. Each gesture is recorded on-chain and enters the cycle’s Stellar Selection.',
      },
      extend: {
        title: 'Extend the clock',
        body: 'Every gesture adds time to the Cycle Finalization Time, so the cycle runs for as long as people keep taking part.',
      },
      finalize: {
        title: 'Finalize and allocate',
        body: 'When the clock reaches zero, the cycle can be finalized: new Signatures are imprinted and the Cycle Reserve is allocated across the tracks below.',
      },
    },
    gestureCtaLabel: 'Make a gesture',
    guideCtaLabel: 'How it works, step by step',
  },

  art: {
    eyebrow: 'The Art',
    heading: 'Three-body physics. Art from an on-chain seed.',
    description:
      'Every Cosmic Signature NFT visualizes three celestial bodies orbiting under Newtonian gravity. Three bodies produce fundamentally chaotic trajectories. No AI. No training data. Just deterministic physics. Same seed → identical output, pixel for pixel.',
    showcase: {
      viewAriaLabel: 'View Cosmic Signature {tokenLabel}',
      artworkAlt: 'Cosmic Signature artwork {tokenLabel}',
    },
    stageLabel: 'Stage',
    stages: {
      seed: {
        title: 'Seed',
        body: 'A 32-byte hash is derived from on-chain data — block information and ArbSys precompiles — then fed into a SHA3-256 RNG.',
      },
      simulation: {
        title: 'Simulation',
        body: 'One hundred thousand candidate configurations run through a 4th-order Yoshida symplectic integrator at one million physics steps each.',
      },
      selection: {
        title: 'Selection',
        body: 'A Borda rank aggregation (chaos × equilateralness) selects the most visually interesting orbit from the candidate pool.',
      },
      camera: {
        title: 'Camera',
        body: 'A slow elliptical camera drift gives each Signature a cinematic parallax through the three-body dance.',
      },
      color: {
        title: 'Color',
        body: 'Colors are mixed in the OKLab perceptual space with 120° hue separation per body, modulated by drift and a sine wave.',
      },
      'spectral-render': {
        title: 'Spectral render',
        body: 'Sixty-four wavelength bins from 380 to 700 nanometers render the orbit trails with velocity-dependent thickness and depth of field.',
      },
      signature: {
        title: 'Signature',
        body: 'AgX tonemapping, bloom, OpenSimplex nebula layers, and color grading finish the frame. The result: a 16-bit PNG plus a 30-second H.265 video.',
      },
    },
    facts: {
      imprinted: { label: 'Imprinted so far' },
      resolution: { label: 'Native resolution' },
      animation: { label: 'Animation', value: '30 s at 60 fps' },
      license: { label: 'License' },
    },
  },

  tracks: {
    eyebrow: 'Allocation Tracks',
    heading: 'More than ten ways the protocol distributes the Cycle Reserve.',
    description:
      'When a cycle finalizes, the protocol distributes its ETH and CST reserves across allocation tracks that recognize endurance, timing, dedication, and participation. About half of the ETH reserve compounds into the next cycle.',
    ethLabel: 'ETH from each Cycle Reserve',
    fixedLabel: 'CST and NFTs, every cycle',
    items: {
      'signature-allocation': {
        title: 'Signature Allocation',
        body: 'To the participant who made the Final Gesture. Includes 1,000 CST and one Cosmic Signature NFT.',
      },
      'compounding-reserve': {
        percent: '~50%',
        title: 'Compounding Cycle Reserve',
        body: 'Rolls forward into the next Performance Cycle. The protocol compounds rather than extracts.',
      },
      'chrono-warrior': {
        title: 'Chrono-Warrior Allocation',
        body: `To the participant who held the Endurance Champion position for the longest consecutive interval. Includes ${protocolFacts.specialAllocationCst.toLocaleString('en-US')} CST and one Cosmic Signature NFT.`,
      },
      'public-goods': {
        title: 'Public Goods Allocation',
        body: 'Forwarded to Protocol Guild, the funding mechanism for 170+ Ethereum core contributors.',
      },
      'anchor-distribution': {
        title: 'Anchor Distribution',
        body: 'Distributed proportionally across all Cosmic Signature NFTs anchored to the protocol for this cycle.',
      },
      'eth-stellar-selection': {
        title: 'ETH Stellar Selection',
        body: 'Split across three randomly selected participants. Selection frequency scales with gestures made.',
      },
      'participant-nft-stellar-selection': {
        percent: '10 NFTs',
        title: 'NFT Stellar Selection — Participants',
        body: `Ten randomly selected participants each receive ${protocolFacts.specialAllocationCst.toLocaleString('en-US')} CST and one Cosmic Signature NFT.`,
      },
      'anchored-nft-stellar-selection': {
        percent: '10 NFTs',
        title: 'Anchored-NFT Stellar Selection',
        body: `Ten randomly selected Random Walk NFT anchor-holders each receive ${protocolFacts.specialAllocationCst.toLocaleString('en-US')} CST and one Cosmic Signature NFT.`,
      },
      'endurance-champion': {
        percent: `${protocolFacts.specialAllocationCst.toLocaleString('en-US')} CST`,
        title: 'Endurance Champion Allocation',
        body: '1,000 Recognition CST and one Cosmic Signature NFT to the participant with the longest unbroken endurance window.',
      },
      'final-cst-gesture': {
        percent: `${protocolFacts.specialAllocationCst.toLocaleString('en-US')} CST`,
        title: 'Final CST Gesture Allocation',
        body: '1,000 Recognition CST and one Cosmic Signature NFT to the participant who made the last CST gesture of the cycle.',
      },
    },
  },

  anchoring: {
    eyebrow: 'Anchoring',
    heading: 'Anchor Cosmic Signature NFTs to the protocol.',
    body: `Anchor a Cosmic Signature NFT and it receives a proportional share of the ${protocolFacts.anchorDistributionPercentage}% Anchor Distribution every cycle, paid out when the anchor is released. You can release it at any time, but each NFT can be anchored only once.`,
    bullets: [
      'ETH accrues every cycle and is retrieved at release',
      'No fixed term and no penalty; releasing is permanent for that NFT',
      'Random Walk NFTs, from the companion collection, can be anchored too',
      `Anchored Random Walk NFTs enter the Anchored-NFT Stellar Selection: ${protocolFacts.specialAllocationCst.toLocaleString('en-US')} CST and a Cosmic Signature NFT, no ETH`,
    ],
    ctaLabel: 'Anchor in the app',
  },

  publicGoods: {
    eyebrow: 'Public Goods',
    heading: 'Every cycle funds Ethereum’s core contributors.',
    body: 'Every Performance Cycle forwards a fixed share of its ETH reserve to Protocol Guild — the collective funding mechanism for 170+ Ethereum core contributors. The more the protocol is used, the more flows to the infrastructure Ethereum itself depends on.',
    disclaimerHeading: 'Disclaimer',
    // lexicon-allow-start: explicit legal denial of charitable-tax-treatment framing.
    disclaimer:
      'This is a forwarding of ETH to a public-goods address (currently Protocol Guild). It is not a charitable contribution in the U.S. tax sense, and Cosmic Signature makes no representation about its tax treatment.',
    // lexicon-allow-end
    card: {
      label: 'Cycle allocation',
      description: 'of every Performance Cycle’s ETH reserve is forwarded to Protocol Guild.',
      tableRows: {
        contributors: { label: 'Protocol Guild contributors' },
        enforcement: { label: 'Enforcement', value: 'on-chain' },
        recipient: { label: 'Recipient' },
      },
    },
    ctaLabel: 'Learn about Protocol Guild',
  },

  council: {
    eyebrow: 'Cosmic Council',
    heading: 'Protocol Coordination, on-chain.',
    body: 'CST holders coordinate the protocol on-chain: they delegate weight, submit Coordination Proposals and express Support or Opposition.',
    columns: [
      {
        title: 'Coordination Proposal',
        body: 'Any address with at least 100 CST of delegated weight may submit a proposal. Two-day coordination delay, two-week coordination period.',
      },
      {
        title: 'Coordination Weight',
        body: 'Each CST expresses one unit of weight once delegated. Expression is a cryptographic signature, not a share or equity instrument.',
      },
      {
        title: 'Coordination Quorum',
        body: 'A proposal passes if Support exceeds Opposition and Support plus Abstain weight reaches 3% of total CST supply. Opposition weight does not count toward the quorum.',
      },
    ],
  },

  verifiability: {
    eyebrow: 'Verifiability',
    heading: 'Open, verified, reproducible.',
    body: 'Anyone can verify a Signature by regenerating it from its seed. Contract verification, static analysis notes, and audit status are published through the app as reports become available. Project-owned materials in the Cosmic Signature repositories are dedicated under CC0 1.0; third-party dependencies, fonts, and assets retain their own licenses.',
    pillars: [
      {
        title: 'CC0 1.0',
        body: 'Project-owned contracts, shaders, and rendering pipelines. No rights reserved. Third-party materials are excluded.',
      },
      {
        title: 'Verification status',
        body: 'The app links public contract addresses, source-code resources, verification context, and audit/report status so anyone can inspect what has been published.',
      },
      {
        title: 'Reproducible art',
        body: 'SHA-256 hashes of generated frames asserted in continuous integration. Same seed → identical output.',
      },
    ],
    evidenceLabel: 'Check it yourself',
  },

  faq: {
    eyebrow: 'Clarifications',
    heading: 'Questions worth answering plainly.',
    moreLabel: 'More answers in the FAQ',
    items: [
      {
        question: 'What do I actually do as a participant?',
        answer:
          'You make gestures. Each gesture is an ETH or CST transaction that extends the Cycle Finalization Time, records a Stellar Selection entry, may imprint dynamic Participation CST, and shapes the cycle’s Signature. You may anchor Cosmic Signature NFTs to receive a share of Anchor Distributions. You may submit Coordination Proposals through the Cosmic Council if you hold at least 100 CST.',
      },
      {
        question: 'What is the art, technically?',
        answer:
          'Each Cosmic Signature NFT is a deterministic render of a three-body Newtonian simulation. The on-chain seed selects a candidate orbit (from 100,000 simulated via a 4th-order Yoshida symplectic integrator), which is then spectrally rendered across 64 wavelength bins with OKLab color mixing. The pipeline is fully open-source under CC0; anyone can reproduce a Signature from its seed.',
      },
      {
        question: 'Where do the ETH allocations come from?',
        answer:
          'From the Cycle Reserve, which grows as participants make gestures. When a cycle finalizes, about half rolls forward into the next cycle’s Compounding Reserve; the remainder is distributed across allocation tracks (Signature Allocation, Chrono-Warrior, Anchor Distribution, Stellar Selection, Public Goods) per on-chain parameters.',
      },
      // lexicon-allow-start: explicit denial of charitable-tax-treatment framing.
      {
        question: 'What exactly is Public Goods?',
        answer:
          'Seven percent of each cycle’s ETH reserve is forwarded to a public-goods address, currently Protocol Guild. Protocol Guild is the collective funding mechanism for 170+ Ethereum core contributors. This is a forwarding of ETH to a public-goods address; it is not a charitable contribution in the U.S. tax sense, and Cosmic Signature makes no representation about its tax treatment.',
      },
      // lexicon-allow-end
      // lexicon-allow-start: explicit denial of lottery, casino, gambling, house, dealer, and bet categories.
      {
        question: 'Is this a lottery, casino, or gambling product?',
        answer:
          'No. Cosmic Signature is a procedural on-chain art protocol. Participants make gestures during a Performance Cycle; the protocol distributes allocations across more than ten tracks when the cycle finalizes. There is no house, no dealer, no bet. Allocations recognize endurance, timing, and participation. The one random allocation track, Stellar Selection, is a protocol-level procedural distribution.',
      },
      // lexicon-allow-end
      // lexicon-allow-start: explicit investment and securities denial.
      {
        question: 'Is any of this an investment?',
        answer:
          'No. CST tokens express participation and coordination weight within the protocol, not equity, profit share, dividend, or investment contract. No team wallet receives ETH from participant gestures. Cosmic Signature makes no representation about token price or future behavior and does not solicit participation as an investment.',
      },
      // lexicon-allow-end
      {
        question: 'Why does the Participation CST amount change?',
        answer: `The Participation CST imprint uses a square-root formula based on how long it has been since the previous gesture. Longer quiet periods create larger CST imprints, but the square root makes the increase sublinear. Very rapid gestures can imprint 0 CST. The app previews the current amount before you submit.`,
      },
      {
        question: 'How do ETH and CST gestures affect the CST Calibration Window?',
        answer: `The CST Calibration Window is stored on-chain and changes after every gesture. A CST gesture lengthens it by about ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%, making CST Gesture Cost descend more slowly. An ETH gesture shortens it by about ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%, making CST Gesture Cost descend faster.`,
      },
      {
        question: 'Can I fork this?',
        answer:
          'Yes. Project-owned contracts, shaders, renderers, marketing pages, and documentation are dedicated under CC0 1.0 — no rights reserved. Third-party dependencies, fonts, and assets remain under their own licenses; see THIRD_PARTY_NOTICES.md.',
      },
    ],
  },
  closing: {
    eyebrow: 'The collection',
    heading: 'Every cycle adds to the collection.',
    body: 'Follow the live cycle, make a gesture, or browse every Signature imprinted so far.',
  },

  footer: {
    tagline: 'A procedural on-chain art protocol on Arbitrum.',
    copyright: '© {year} Cosmic Signature. Project-owned materials: CC0 1.0.',
    colophon: 'CC0 1.0 · Publicly verifiable · Reproducible art',
    disambiguation:
      'Cosmic Signature is not related to the COSMIC cancer mutation database or COSMIC mutational signatures in biology. It is an on-chain art protocol and app.',
  },
} satisfies LandingText;
