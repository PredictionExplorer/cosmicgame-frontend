import { ethDistributionFacts, nftAllocationFacts, protocolFacts } from '@/content/protocol-facts';

import type { LandingText } from './structure';

/** English landing copy, keyed by the skeleton in structure.ts. */
export const landingTextEn = {
  meta: {
    title: 'Cosmic Signature: Procedural On-Chain Art Protocol on Arbitrum',
    description: `Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Gestures extend Performance Cycles; finalization creates Signatures and the reserve is allocated across its tracks, including ${ethDistributionFacts.publicGoodsPercentage}% to a Public Goods Vault.`,
    keywords: [
      'Cosmic Signature',
      'procedural art protocol',
      'on-chain art',
      'Arbitrum',
      'three-body problem',
      'generative art',
      'Public Goods',
      'Protocol Guild',
      'CC0',
    ],
  },

  hero: {
    eyebrow: 'Procedural on-chain art protocol · Arbitrum',
    headlineLead: 'Art, shaped by',
    headlineAccent: 'every gesture.',
    subhead: `Each gesture, made with ETH or CST, extends the cycle’s clock. After the deadline, a transaction can finalize the cycle: new Signatures are imprinted, and the reserve is allocated across its tracks, including ${ethDistributionFacts.publicGoodsPercentage}% to the Public Goods Vault.`,
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
      'Every Cosmic Signature NFT visualizes three celestial bodies orbiting under Newtonian gravity. Its seed is recorded on-chain; an open-source renderer creates the image off-chain. Reproduction uses that seed, the matching renderer revision and configuration, and a compatible toolchain.',
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
        body: 'A Borda ranking of orbital measures creates a shortlist; an image-space aesthetic check guides the final selection.',
      },
      camera: {
        title: 'Camera',
        body: 'A slow elliptical camera drift gives each Signature a cinematic parallax through the three-body dance.',
      },
      color: {
        title: 'Color',
        body: 'A continuous perceptual palette varies hue and other color properties in OKLCh; the bodies do not have a fixed hue separation.',
      },
      'spectral-render': {
        title: 'Spectral render',
        body: 'Sixty-four wavelength bins from 380 to 700 nanometers render the orbit trails with velocity-dependent thickness and depth of field.',
      },
      signature: {
        title: 'Signature',
        body: 'Tonemapping, bloom, and color grading finish the image. The renderer can produce high-resolution images and animated views; output depends on its selected configuration.',
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
    heading: 'Every Cycle Reserve, allocated by rule.',
    description:
      'At finalization, configured ETH shares are distributed and fixed CST allocations and NFTs are created. About half the ETH reserve carries forward, with rounding and omitted-track exceptions; reserve growth is not guaranteed.',
    ethLabel: 'ETH from each Cycle Reserve',
    fixedLabel: 'CST and NFTs, every cycle',
    fixedEach: `Each recipient receives ${protocolFacts.specialAllocationCst.toLocaleString('en-US')} CST and one Cosmic Signature NFT.`,
    recipients: { one: '{count}\u00a0recipient', other: '{count}\u00a0recipients' },
    items: {
      'signature-allocation': {
        title: 'Signature Allocation',
        body: `To the finalization caller: normally the Final Gesture participant, or any caller after the ${protocolFacts.finalGestureExclusivityHours}-hour exclusive window. Includes ${protocolFacts.specialAllocationCst.toLocaleString('en-US')} CST in total and ${nftAllocationFacts.mainPrizeNftPhrase.en}.`,
      },
      'compounding-reserve': {
        percent: '~50%',
        title: 'Compounding Cycle Reserve',
        body: 'Carries into the next Performance Cycle. The retained amount can vary; growth is not guaranteed.',
      },
      'chrono-warrior': {
        title: 'Chrono-Warrior Allocation',
        body: `To the participant who held the Endurance Champion position for the longest consecutive interval. Includes ${protocolFacts.specialAllocationCst.toLocaleString('en-US')} CST and one Cosmic Signature NFT.`,
      },
      'public-goods': {
        title: 'Public Goods Allocation',
        body: 'Sent to the Public Goods Vault; anyone can separately forward its balance to the current beneficiary, Protocol Guild.',
      },
      'anchor-distribution': {
        title: 'Anchor Distribution',
        body: 'Distributed proportionally across all Cosmic Signature NFTs anchored to the protocol for this cycle.',
      },
      'eth-stellar-selection': {
        title: 'ETH Stellar Selection',
        body: `Shared across ${protocolFacts.ethStellarSelectionRecipients} selections. Weights use each gesture’s undiscounted, premium-free ETH base cost; repeats are possible.`,
      },
      'participant-nft-stellar-selection': {
        title: 'NFT Stellar Selection — Participants',
        body: 'Uses the same ETH base-cost weights as participant ETH selection. CST gestures use the concurrent ETH base cost; repeats are possible.',
      },
      'anchored-nft-stellar-selection': {
        title: 'Anchored-NFT Stellar Selection',
        body: 'Selected at random from Random Walk NFT anchor-holders.',
      },
      'endurance-champion': {
        title: 'Endurance Champion Allocation',
        body: 'The participant with the longest unbroken endurance window.',
      },
      'final-cst-gesture': {
        title: 'Final CST Gesture Allocation',
        body: 'The participant who made the cycle’s last CST gesture.',
      },
    },
  },

  anchoring: {
    eyebrow: 'Anchoring',
    heading: 'Anchor Cosmic Signature NFTs to the protocol.',
    body: `Anchor a Cosmic Signature NFT and it receives a proportional share of the ${ethDistributionFacts.anchorDistributionPercentage}% Anchor Distribution every cycle, paid out when the anchor is released. You can release it at any time, but each NFT can be anchored only once.`,
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
    body: 'Each finalized cycle allocates a configured ETH share to the Public Goods Vault. A separate permissionless transaction forwards its balance to the current beneficiary, Protocol Guild. The vault owner can change that beneficiary.',
    disclaimerHeading: 'Disclaimer',
    // lexicon-allow-start: explicit legal denial of charitable-tax-treatment framing.
    disclaimer:
      'This is a forwarding of ETH to a public-goods address (currently Protocol Guild). It is not a charitable contribution in the U.S. tax sense, and Cosmic Signature makes no representation about its tax treatment.',
    // lexicon-allow-end
    card: {
      label: 'Cycle allocation',
      description:
        'of the reserve is allocated to the Public Goods Vault at finalization, for separate forwarding.',
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
    columns: {
      proposal: {
        title: 'Coordination Proposal',
        body: `Any address with at least ${protocolFacts.councilProposalThresholdCst} CST of delegated weight may submit a proposal. ${protocolFacts.councilVotingDelayDays}-day coordination delay, ${protocolFacts.councilVotingPeriodWeeks}-week coordination period.`,
      },
      weight: {
        title: 'Coordination Weight',
        body: 'Each CST expresses one unit of weight once delegated. Expression is a cryptographic signature, not a share or equity instrument.',
      },
      quorum: {
        title: 'Coordination Quorum',
        body: `A proposal passes if Support exceeds Opposition and Support plus Abstain weight reaches ${protocolFacts.councilQuorumPercent}% of total CST supply. Opposition weight does not count toward the quorum.`,
      },
    },
  },

  verifiability: {
    eyebrow: 'Verifiability',
    heading: 'Open, verified, reproducible.',
    body: 'Inspect on-chain seeds, the matching renderer revision, contract addresses, and the published verification and audit status.',
    pillars: {
      cc0: {
        title: 'CC0 1.0',
        body: 'Project-owned materials in the Cosmic Signature repositories: contracts, shaders and rendering pipelines. No rights reserved; third-party dependencies, fonts and assets keep their own licenses.',
      },
      verification: {
        title: 'Verification status',
        body: 'The app links public contract addresses, source-code resources, verification context, and audit/report status so anyone can inspect what has been published.',
      },
      reproducible: {
        title: 'Reproducible art',
        body: 'The renderer provides manual reference-image checks. Reproduction uses the same seed, renderer revision, configuration and compatible toolchain.',
      },
    },
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
          'You make ETH or CST gestures that extend the stored deadline and record weighted Stellar Selection entries. A later gesture can credit Participation CST to the previous participant. You may anchor eligible NFTs or use delegated CST weight in the Cosmic Council. Participation does not guarantee an allocation.',
      },
      {
        question: 'What is the art, technically?',
        answer:
          'Each Signature visualizes a three-body simulation from a seed recorded on-chain. The open-source renderer selects orbital candidates and produces images off-chain. Reproduction requires the matching renderer revision and configuration as well as the seed.',
      },
      {
        question: 'Where do the ETH allocations come from?',
        answer:
          'From the Cycle Reserve, which grows as participants make gestures. When a cycle finalizes, about half rolls forward into the next cycle’s Compounding Reserve; the remainder is distributed across allocation tracks (Signature Allocation, Chrono-Warrior, Anchor Distribution, Stellar Selection, Public Goods) per on-chain parameters.',
      },
      // lexicon-allow-start: explicit denial of charitable-tax-treatment framing.
      {
        question: 'What exactly is Public Goods?',
        answer: `${ethDistributionFacts.publicGoodsPercentage}% of the reserve is allocated to a Public Goods Vault. Anyone can separately forward its balance to the configured beneficiary, currently Protocol Guild; the owner can change that beneficiary. A failed transfer from the protocol can leave the share in the reserve.`,
      },
      // lexicon-allow-end
      // lexicon-allow-start: explicit denial of lottery, casino, gambling, house, dealer, and bet categories.
      {
        question: 'Is this a lottery, casino, or gambling product?',
        answer:
          'No. Cosmic Signature is a procedural on-chain art protocol. Participants make gestures during a Performance Cycle; the protocol distributes allocations across its allocation tracks when the cycle finalizes. There is no house, no dealer, no bet. Allocations recognize endurance, timing, and participation. The one random allocation track, Stellar Selection, is a protocol-level procedural distribution.',
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
        answer: `The amount grows linearly with elapsed time, at about ${protocolFacts.v3.dynamicCstRewardPerMinuteAtLaunch} CST per minute at the original increment. A later gesture credits it to the previous participant. The first gesture credits none, and finalization does not settle the final participant’s additional dynamic CST.`,
      },
      {
        question: 'How do ETH and CST gestures affect the CST Calibration Window?',
        answer:
          'V3 changes the CST decline rate. ETH gestures can increase it subject to a minimum-window safeguard; CST gestures reduce it and restart the ceiling using twice the premium-free base cost and on-chain minimums. Duration is derived from the ceiling and rate, rather than adjusted by a fixed percentage.',
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
} satisfies LandingText;
