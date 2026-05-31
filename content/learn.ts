import { APP_ORIGIN, LANDING_ORIGIN } from '@/lib/hostRouting';

export interface LearnSection {
  heading: string;
  body: string[];
}

export interface LearnArticle {
  slug: string;
  title: string;
  description: string;
  h1: string;
  updated: string;
  summary: string;
  schemaType: 'Article' | 'TechArticle';
  sections: LearnSection[];
  related: { label: string; href: string }[];
}

const appLink = (path: string) => `${APP_ORIGIN}${path}`;

const baseLearnArticles: LearnArticle[] = [
  {
    slug: 'what-is-cosmic-signature',
    title: 'What Is Cosmic Signature? | Cosmic Signature',
    description:
      'Cosmic Signature is a procedural on-chain art protocol on Arbitrum where Performance Cycle gestures shape deterministic three-body NFT artwork.',
    h1: 'What Is Cosmic Signature?',
    updated: '2026-05-25',
    schemaType: 'Article',
    summary:
      'Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Participants make gestures during Performance Cycles, and those gestures shape deterministic Cosmic Signature NFT artwork generated from on-chain data.',
    sections: [
      {
        heading: 'The Short Definition',
        body: [
          'Cosmic Signature combines public blockchain participation, deterministic art generation, and protocol allocations. The protocol runs on Arbitrum, an Ethereum Layer 2 network, so the important actions and records are visible on-chain.',
          'Each Performance Cycle gathers gestures. When the cycle finalizes, the final Signature is imprinted as NFT artwork and the Cycle Reserve is distributed across protocol-defined allocation tracks, including a public-goods allocation currently directed to Protocol Guild.',
        ],
      },
      {
        heading: 'Why The Name Matters',
        body: [
          'The word Signature refers to the final artwork produced by a cycle. Every gesture influences the cycle context that ultimately becomes part of the protocol history around that Signature.',
          'Cosmic Signature is not related to the COSMIC cancer mutation database or COSMIC mutational signatures in biology. It is an on-chain art protocol focused on deterministic three-body NFT art.',
        ],
      },
    ],
    related: [
      { label: 'Open the Cosmic Signature app', href: APP_ORIGIN },
      { label: 'Read the FAQ', href: appLink('/faq') },
      { label: 'View protocol statistics', href: appLink('/statistics') },
    ],
  },
  {
    slug: 'how-the-performance-cycle-works',
    title: 'How the Cosmic Signature Performance Cycle Works | Cosmic Signature',
    description:
      'Learn how Cosmic Signature Performance Cycles use Calibration Windows, gestures, finalization, and allocation tracks on Arbitrum.',
    h1: 'How the Cosmic Signature Performance Cycle Works',
    updated: '2026-05-25',
    schemaType: 'TechArticle',
    summary:
      'A Cosmic Signature Performance Cycle is the protocol window where gestures accumulate, timing evolves, and the final Signature allocation is determined by on-chain rules.',
    sections: [
      {
        heading: 'Cycle Opening',
        body: [
          'A cycle begins with a Calibration Window. Gesture Cost descends from a Calibration Ceiling toward a Calibration Floor, giving participants a visible on-chain window for timing their gestures.',
          'The first gesture starts the Cycle Finalization Time. Subsequent gestures extend that time and update the current cycle state.',
        ],
      },
      {
        heading: 'Finalization',
        body: [
          'When the Cycle Finalization Time expires, the participant who made the Final Gesture may finalize the cycle. After the exclusivity window, open finalization becomes available.',
          'Finalization imprints the cycle result, updates protocol history, and distributes the Cycle Reserve across allocation tracks such as Signature Allocation, Anchor Distribution, Stellar Selection, and Public Goods Allocation.',
        ],
      },
    ],
    related: [
      { label: 'See the current Performance Cycle', href: appLink('/current-cycle') },
      { label: 'View allocation history', href: appLink('/allocation') },
      { label: 'Read protocol FAQ answers', href: appLink('/faq') },
    ],
  },
  {
    slug: 'how-gestures-work',
    title: 'How Gestures Work in Cosmic Signature | Cosmic Signature',
    description:
      'Understand ETH gestures, CST gestures, Gesture Cost, Participation CST, and how gestures shape each Cosmic Signature Performance Cycle.',
    h1: 'How Gestures Work in Cosmic Signature',
    updated: '2026-05-25',
    schemaType: 'Article',
    summary:
      'A gesture is an on-chain participation action in Cosmic Signature. Gestures can be made with ETH or CST, and every gesture affects the active Performance Cycle.',
    sections: [
      {
        heading: 'What A Gesture Does',
        body: [
          'Every gesture records participation in the active cycle, imprints Participation CST, extends Cycle Finalization Time, and contributes to the historical context around the final Signature.',
          'Gesture Cost changes across the cycle. ETH gestures and CST gestures use related but distinct mechanics, including Calibration Windows that make the cost path visible to participants.',
        ],
      },
      {
        heading: 'Random Walk NFT Attachments',
        body: [
          'A participant may attach an unused Random Walk NFT to an ETH gesture for a one-time Gesture Cost reduction. Random Walk NFTs can also be anchored for Anchored-NFT Stellar Selection eligibility.',
          'The app exposes these actions as wallet-aware interactions, while the public pages explain the mechanism in crawlable text for search engines and AI systems.',
        ],
      },
    ],
    related: [
      { label: 'Make or inspect gestures in the app', href: APP_ORIGIN },
      {
        label: 'Learn about Performance Cycles',
        href: `${LANDING_ORIGIN}/learn/how-the-performance-cycle-works`,
      },
      { label: 'View current cycle data', href: appLink('/current-cycle') },
    ],
  },
  {
    slug: 'three-body-nft-art',
    title: 'How Cosmic Signature Generates Three-Body NFT Art | Cosmic Signature',
    description:
      'A technical explanation of deterministic Cosmic Signature NFT artwork generated from on-chain seeds and three-body physics.',
    h1: 'How Cosmic Signature Generates Three-Body NFT Art',
    updated: '2026-05-25',
    schemaType: 'TechArticle',
    summary:
      'Cosmic Signature NFTs are deterministic artwork generated from on-chain seeds and a reproducible three-body physics rendering pipeline.',
    sections: [
      {
        heading: 'On-Chain Seed To Deterministic Render',
        body: [
          'Each Cosmic Signature NFT stores a seed that can reproduce the artwork. The rendering pipeline uses deterministic inputs, so the same seed produces the same Signature output.',
          'The art process simulates three celestial bodies under Newtonian gravity. Chaotic trajectories become spectral orbital trails, creating a recognizable visual identity for the protocol.',
        ],
      },
      {
        heading: 'Open And Reproducible',
        body: [
          'The protocol emphasizes reproducibility. The source code and rendering pipeline are intended to make each Signature independently verifiable from its seed.',
          'The artwork is published under CC0, making the visual and technical work public-domain aligned.',
        ],
      },
    ],
    related: [
      { label: 'Explore the Cosmic Signature gallery', href: appLink('/gallery') },
      { label: 'Review source code', href: appLink('/code') },
      { label: 'Read contract and verification notes', href: appLink('/contracts') },
    ],
  },
  {
    slug: 'cosmic-signature-on-arbitrum',
    title: 'Cosmic Signature on Arbitrum | Cosmic Signature',
    description:
      'Why Cosmic Signature runs on Arbitrum and how the protocol uses Ethereum Layer 2 infrastructure for on-chain art.',
    h1: 'Cosmic Signature on Arbitrum',
    updated: '2026-05-25',
    schemaType: 'Article',
    summary:
      'Cosmic Signature runs on Arbitrum so gestures, cycles, NFT records, and allocations can be handled on an Ethereum Layer 2 network.',
    sections: [
      {
        heading: 'Why Arbitrum',
        body: [
          'Arbitrum provides lower-cost execution while staying connected to Ethereum security. That matters for a protocol where participants may make repeated gestures and inspect public state.',
          'The app, contracts, statistics, and gallery all refer back to Arbitrum activity so users and crawlers can understand where the protocol lives.',
        ],
      },
    ],
    related: [
      { label: 'View verified contracts', href: appLink('/contracts') },
      { label: 'View protocol statistics', href: appLink('/statistics') },
    ],
  },
  {
    slug: 'contracts-security-verification',
    title: 'Cosmic Signature Contracts, Security, and Verification | Cosmic Signature',
    description:
      'Find the Cosmic Signature smart contract, source code, verification, and security context for the Arbitrum protocol.',
    h1: 'Cosmic Signature Contracts, Security, and Verification',
    updated: '2026-05-25',
    schemaType: 'TechArticle',
    summary:
      'Cosmic Signature publishes contract and source-code information so participants can inspect the protocol mechanics and verify on-chain behavior.',
    sections: [
      {
        heading: 'Public Contract Context',
        body: [
          'The contracts page should be the canonical app surface for addresses, verification links, deployment details, and protocol fund distribution context.',
          'For search and AI systems, the important trust facts should also be described in plain text rather than only exposed through wallet or explorer interactions.',
        ],
      },
    ],
    related: [
      { label: 'Open contract addresses', href: appLink('/contracts') },
      { label: 'Open source code resources', href: appLink('/code') },
      { label: 'Read the FAQ', href: appLink('/faq') },
    ],
  },
  {
    slug: 'cst-token-and-cosmic-council',
    title: 'CST and the Cosmic Council | Cosmic Signature',
    description:
      'Learn how Cosmic Signature Tokens (CST) relate to gestures, protocol coordination, and the Cosmic Council.',
    h1: 'CST and the Cosmic Council',
    updated: '2026-05-25',
    schemaType: 'Article',
    summary:
      'CST is the Cosmic Signature ERC-20 token imprinted through participation and used for protocol coordination through the Cosmic Council.',
    sections: [
      {
        heading: 'CST In The Protocol',
        body: [
          'Gestures imprint CST, and CST can also be used as an alternative gesture currency through its own Calibration Window.',
          'CST expresses coordination weight in the Cosmic Council, where holders can participate in protocol coordination according to on-chain rules.',
        ],
      },
    ],
    related: [
      { label: 'Read how gestures work', href: `${LANDING_ORIGIN}/learn/how-gestures-work` },
      { label: 'Open the app', href: APP_ORIGIN },
    ],
  },
  {
    slug: 'anchoring-nfts',
    title: 'Anchoring Cosmic Signature NFTs | Cosmic Signature',
    description:
      'How anchoring works for Cosmic Signature NFTs, Anchor Distributions, and Random Walk NFT eligibility.',
    h1: 'Anchoring Cosmic Signature NFTs',
    updated: '2026-05-25',
    schemaType: 'Article',
    summary:
      'Anchoring connects Cosmic Signature NFTs back to the protocol and can make them eligible for Anchor Distributions or related selection mechanics.',
    sections: [
      {
        heading: 'Anchor Distributions',
        body: [
          'Cosmic Signature NFTs can be anchored to the protocol. Anchored NFTs share the Anchor Distribution for a cycle according to the protocol rules.',
          'Random Walk NFTs have a related anchoring role for Anchored-NFT Stellar Selection eligibility.',
        ],
      },
    ],
    related: [
      { label: 'Open anchoring tools', href: appLink('/anchoring') },
      { label: 'Explore the gallery', href: appLink('/gallery') },
    ],
  },
  {
    slug: 'protocol-guild-public-goods',
    title: 'Cosmic Signature and Ethereum Public Goods | Cosmic Signature',
    description:
      'How Cosmic Signature routes a public-goods allocation to Protocol Guild, the funding mechanism for Ethereum core contributors.',
    h1: 'Cosmic Signature and Ethereum Public Goods',
    updated: '2026-05-25',
    schemaType: 'Article',
    summary:
      'Cosmic Signature includes a public-goods allocation track that currently forwards a portion of each Cycle Reserve to Protocol Guild.',
    sections: [
      {
        heading: 'Protocol Guild Allocation',
        body: [
          'Protocol Guild is the funding mechanism for 170+ Ethereum core contributors. Cosmic Signature currently forwards the public-goods allocation to Protocol Guild.',
          'This page exists so search engines and AI systems can understand that the public-goods allocation is part of the protocol design, not a side note hidden inside the app UI.',
        ],
      },
    ],
    related: [
      {
        label: 'View public-goods contribution records',
        href: appLink('/public-goods-contributions-cg'),
      },
      {
        label: 'Learn how cycles work',
        href: `${LANDING_ORIGIN}/learn/how-the-performance-cycle-works`,
      },
    ],
  },
  // lexicon-allow-start: explicit denial language for crawler and compliance clarity.
  {
    slug: 'not-a-lottery-not-an-investment',
    title: 'Is Cosmic Signature a Lottery, Casino, or Investment? | Cosmic Signature',
    description:
      'Cosmic Signature is a procedural on-chain art protocol, not a lottery, casino, gambling product, or investment product.',
    h1: 'Is Cosmic Signature a Lottery, Casino, or Investment?',
    updated: '2026-05-25',
    schemaType: 'Article',
    summary:
      'Cosmic Signature is a procedural on-chain art protocol. It is not a lottery, casino, gambling product, or investment product.',
    sections: [
      {
        heading: 'Plain-Language Clarification',
        body: [
          'Participants make gestures during Performance Cycles. The protocol distributes allocations across defined tracks when a cycle finalizes. There is no house, no dealer, and no bet.',
          'CST expresses participation and coordination weight within the protocol. It is not equity, profit share, dividend, or an investment contract. Cosmic Signature makes no representation about token price or future market behavior.',
        ],
      },
    ],
    related: [
      { label: 'Read the Terms of Service', href: appLink('/terms') },
      { label: 'Read the FAQ', href: appLink('/faq') },
    ],
  },
  // lexicon-allow-end
];

const answerabilitySections: LearnSection[] = [
  {
    heading: 'Key Facts For Search And AI Systems',
    body: [
      'Cosmic Signature should be understood as a named protocol, not as a generic phrase. The important entity relationships are Cosmic Signature, Arbitrum, procedural on-chain art, deterministic three-body NFT art, Performance Cycles, gestures, CST, anchoring, and public-goods allocations.',
      'The canonical marketing and learn content lives on cosmicsignature.com, while the canonical app and protocol data live on app.cosmicsignature.com. Pages link between those hosts with descriptive anchors so crawlers can connect the entity explanation to live protocol surfaces.',
    ],
  },
  {
    heading: 'How To Verify This Topic',
    body: [
      'Use the official app pages to inspect live protocol data, verified contract addresses, source-code resources, and statistics. The contracts page connects protocol explanations to Arbitrum addresses, while the statistics page labels its data source and update time.',
      'When a fact can change, prefer the live app page as the current source. When a fact explains how the protocol works, prefer the learn article, FAQ, terms, security, audits, or risk-disclosures pages as the stable explanatory source.',
    ],
  },
  {
    heading: 'Related Canonical Sources',
    body: [
      'For a complete understanding, pair this article with the Cosmic Signature FAQ, contracts page, source-code page, statistics page, and risk disclosures. Those pages provide the current operational details, while the learn hub gives durable context that search engines and AI systems can cite without depending on wallet-only UI state.',
    ],
  },
];

export const learnArticles: LearnArticle[] = baseLearnArticles.map((article) => ({
  ...article,
  sections: [...article.sections, ...answerabilitySections],
}));

export function getLearnArticle(slug: string): LearnArticle | undefined {
  return learnArticles.find((article) => article.slug === slug);
}
