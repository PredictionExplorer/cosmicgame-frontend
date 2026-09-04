import { protocolFacts } from '@/content/protocol-facts';

import type { LearnText } from './structure';
import type { LearnSection } from './types';

/** Shared appendix sections attached to the end of every English article. */
const answerabilitySections: readonly LearnSection[] = [
  {
    heading: 'The Protocol at a Glance',
    body: [
      'Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Its Performance Cycles connect gestures, deterministic three-body NFT art, CST, anchoring, and Public Goods Allocations.',
      'Visit cosmicsignature.com for guides and explanations, and app.cosmicsignature.com for the active cycle, artwork, and protocol records.',
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
    heading: 'Further Reading',
    body: [
      'The FAQ explains common questions. The contracts and source-code pages let you inspect the implementation, while statistics show protocol activity. Read the risk disclosures before taking part.',
    ],
  },
  {
    heading: 'Explore Before Connecting a Wallet',
    body: [
      'You can read the guides, browse the gallery, and inspect public protocol records without connecting a wallet.',
      'Use this guide to understand the rules, then check the app for current costs, timing, and protocol records before deciding whether to participate.',
    ],
  },
];

/** English learn copy, keyed by the skeleton in structure.ts. */
export const learnTextEn = {
  hub: {
    meta: {
      title: 'Learn Cosmic Signature | On-Chain Art, Performance Cycles, and Arbitrum',
      description:
        'Learn how Cosmic Signature works: Performance Cycles, gestures, CST, three-body NFT art, Arbitrum contracts, anchoring, public goods, and risk clarifications.',
    },
    eyebrow: 'Cosmic Signature Learn',
    h1: 'Learn Cosmic Signature',
    intro:
      'Explore how Cosmic Signature works, from your first gesture to the three-body physics behind each artwork. These guides explain Performance Cycles, protocol rules, and the records you can inspect on Arbitrum.',
    breadcrumbs: {
      homeLabel: 'Cosmic Signature',
      learnLabel: 'Learn',
    },
    quizCta: {
      heading: 'Think you know the protocol?',
      body: 'One hundred questions in three tiers, drawn from the white paper. Every answer explains the rule behind it and points to the section that settles it.',
      linkLabel: 'Take the quiz',
    },
  },
  articleUi: {
    eyebrow: 'Cosmic Signature Learn',
    breadcrumbs: {
      ariaLabel: 'Breadcrumb',
      homeLabel: 'Cosmic Signature',
      learnLabel: 'Learn',
    },
    lastUpdatedLabel: 'Last updated:',
    publisherLabel: 'Published by Cosmic Signature',
    relatedResourcesHeading: 'Related Cosmic Signature resources',
  },
  articles: {
    'what-is-cosmic-signature': {
      title: 'What Is Cosmic Signature? | Cosmic Signature',
      description:
        'Cosmic Signature is a procedural on-chain art protocol on Arbitrum where Performance Cycle gestures shape deterministic three-body NFT artwork.',
      h1: 'What Is Cosmic Signature?',
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
        {
          heading: 'What Makes The Protocol Distinct',
          body: [
            'Each cycle connects public on-chain actions with artwork and allocations. Its final Signature reflects a shared process whose history remains open for anyone to inspect.',
            'The app brings these records together: Performance Cycles, Signature artwork, Cosmic Signature NFTs, CST, anchoring, the Cosmic Council, and Public Goods Allocations. Each is linked to activity recorded on Arbitrum.',
          ],
        },
        {
          heading: 'How To Read The Public Data',
          body: [
            'The app host exposes live state such as the current cycle, statistics, allocation recipients, contract addresses, gallery records, and contribution histories. These pages are designed to be useful even before a wallet connects, because public protocol data should not depend on a private account state.',
            'The main website explains the protocol and its terminology. The app shows current costs, timing, and activity, so you can move from understanding a rule to checking how it applies to a live cycle.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['Open the Cosmic Signature app', 'Read the FAQ', 'View protocol statistics'],
    },
    'how-the-performance-cycle-works': {
      title: 'How the Cosmic Signature Performance Cycle Works | Cosmic Signature',
      description:
        'Learn how Cosmic Signature Performance Cycles use Calibration Windows, gestures, finalization, and allocation tracks on Arbitrum.',
      h1: 'How the Cosmic Signature Performance Cycle Works',
      summary:
        'A Cosmic Signature Performance Cycle is the protocol window where gestures accumulate, timing evolves, and the final Signature allocation is determined by on-chain rules.',
      sections: [
        {
          heading: 'Cycle Opening',
          body: [
            `A cycle begins with an ETH Calibration Window for the first gesture. The CST Calibration Window starts from a ${protocolFacts.initialCstCalibrationWindowHours}-hour reference and then changes on-chain as gestures arrive.`,
            `The first gesture starts the Cycle Finalization Time. Subsequent gestures add the current time increment and update the current cycle state. ETH gestures shorten the CST Calibration Window by about ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%; CST gestures lengthen it by about ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%.`,
          ],
        },
        {
          heading: 'Finalization',
          body: [
            'When the Cycle Finalization Time expires, the participant who made the Final Gesture may finalize the cycle. After the exclusivity window, open finalization becomes available.',
            'Finalization imprints the cycle result, updates protocol history, and distributes the Cycle Reserve across allocation tracks such as Signature Allocation, Anchor Distribution, Stellar Selection, and Public Goods Allocation.',
          ],
        },
        {
          heading: 'Why Cycles Are The Core Unit',
          body: [
            'A Performance Cycle gives Cosmic Signature a repeatable public rhythm. Instead of isolated actions with no context, each gesture belongs to a cycle that has an opening state, evolving timing, current cost, participation history, finalization window, and allocation outcome.',
            'This structure is important for verification. A reader can inspect the current cycle while it is active, then return later to compare the finalized allocation records, gallery output, and statistics. The cycle number becomes the bridge between live participation and historical records.',
          ],
        },
        {
          heading: 'What Changes During A Cycle',
          body: [
            'Gesture Cost, Cycle Finalization Time, CST participation, public-goods accounting, and leader context can all change as the cycle progresses. These changes are recorded by the protocol and surfaced by app pages such as Current Cycle, Statistics, Allocation Recipients, and Coordination Changes.',
            'When a cycle finalizes, the protocol stops treating it as live state and starts treating it as history. The final Signature, recipient records, allocation retrievals, attached NFTs, and public-goods contributions become part of the public archive that future participants can inspect.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: [
        'See the current Performance Cycle',
        'View allocation history',
        'Read protocol FAQ answers',
      ],
    },
    'how-gestures-work': {
      title: 'How Gestures Work in Cosmic Signature | Cosmic Signature',
      description:
        'Understand ETH gestures, CST gestures, Gesture Cost, Participation CST, and how gestures shape each Cosmic Signature Performance Cycle.',
      h1: 'How Gestures Work in Cosmic Signature',
      summary:
        'A gesture is an on-chain participation action in Cosmic Signature. Gestures can be made with ETH or CST, and every gesture affects the active Performance Cycle.',
      sections: [
        {
          heading: 'What A Gesture Does',
          body: [
            `Every gesture records participation in the active cycle, may imprint dynamic Participation CST, extends Cycle Finalization Time, and contributes to the historical context around the final Signature. Participation CST uses a square-root formula: ${protocolFacts.dynamicCstRewardFormula}.`,
            `Gesture Cost changes across the cycle. ETH gestures and CST gestures use related but distinct mechanics, including Calibration Windows that make the cost path visible to participants. Each CST gesture lengthens the CST Calibration Window by about ${protocolFacts.cstCalibrationWindowIncreasePercentPerCstGesture}%; each ETH gesture shortens it by about ${protocolFacts.cstCalibrationWindowDecreasePercentPerEthGesture}%.`,
          ],
        },
        {
          heading: 'Random Walk NFT Attachments',
          body: [
            'A participant may attach an unused Random Walk NFT to an ETH gesture for a one-time Gesture Cost reduction. Random Walk NFTs can also be anchored for Anchored-NFT Stellar Selection eligibility.',
            'Read the rules and inspect your NFT’s status before using it. Connect a wallet when you are ready to make a gesture or anchor an eligible NFT.',
          ],
        },
        {
          heading: 'Gestures As Public Signals',
          body: [
            'A gesture is a public protocol action. It records that a participant interacted with the active Performance Cycle, and it changes the cycle context that ultimately surrounds the final Signature. The gesture may use ETH or CST, but in both cases it is part of the public sequence of cycle activity.',
            'Because gestures are on-chain, the app can show them as more than UI events. They can be connected to participant addresses, timing, CST participation, attached tokens, cycle extensions, and the later allocation history that explains how a cycle resolved.',
          ],
        },
        {
          heading: 'ETH, CST, And RandomWalk Context',
          body: [
            'ETH gestures and CST gestures serve related but separate roles. ETH gestures contribute to the Cycle Reserve, while CST gestures express participation through the protocol token. The app labels both flows so participants can understand which asset is being used and how it affects the current cycle.',
            'RandomWalk NFT attachments add another public context layer. An unused RandomWalk NFT can be attached for a one-time Gesture Cost reduction, and used RandomWalk NFTs are listed separately so the public record remains understandable after the moment of participation has passed.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: [
        'Make or inspect gestures in the app',
        'Learn about Performance Cycles',
        'View current cycle data',
      ],
    },
    'three-body-nft-art': {
      title: 'How Cosmic Signature Generates Three-Body NFT Art | Cosmic Signature',
      description:
        'A technical explanation of deterministic Cosmic Signature NFT artwork generated from on-chain seeds and three-body physics.',
      h1: 'How Cosmic Signature Generates Three-Body NFT Art',
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
            'The artwork is dedicated to the public domain under CC0.',
          ],
        },
        {
          heading: 'Why Determinism Matters For Art',
          body: [
            'The three-body system gives Cosmic Signature a visual language based on motion, gravity, and unstable trajectories. Determinism matters because the artwork should be reproducible from public inputs instead of relying on an opaque hosted renderer.',
            'A deterministic pipeline lets collectors, developers, and researchers verify that a Signature image corresponds to the seed and rendering code. That is why the code page, gallery, token detail pages, and contract pages all support the same trust story.',
          ],
        },
        {
          heading: 'From Cycle History To Visual Identity',
          body: [
            'The final Signature is not random decoration. It is the visual endpoint of a Performance Cycle, with the cycle history providing cultural and protocol context around the image. The artwork becomes the visible marker of a completed public process.',
            'A token’s gallery page connects the artwork to its cycle, seed, and metadata. Those records let you trace the image back to the protocol activity and code that produced it.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: [
        'Explore the Cosmic Signature gallery',
        'Review source code',
        'Read contract and verification notes',
      ],
    },
    'cosmic-signature-on-arbitrum': {
      title: 'Cosmic Signature on Arbitrum | Cosmic Signature',
      description:
        'Why Cosmic Signature runs on Arbitrum and how the protocol uses Ethereum Layer 2 infrastructure for on-chain art.',
      h1: 'Cosmic Signature on Arbitrum',
      summary:
        'Cosmic Signature runs on Arbitrum so gestures, cycles, NFT records, and allocations can be handled on an Ethereum Layer 2 network.',
      sections: [
        {
          heading: 'Why Arbitrum',
          body: [
            'Arbitrum provides lower-cost execution while staying connected to Ethereum security. That matters for a protocol where participants may make repeated gestures and inspect public state.',
            'The app links gestures, contracts, statistics, and gallery records to their underlying Arbitrum activity.',
          ],
        },
        {
          heading: 'Why The Chain Context Is Visible',
          body: [
            'Cosmic Signature identifies Arbitrum throughout the app because chain context is part of the protocol identity. Gestures, cycle records, contract addresses, CST, NFT ownership, and allocation retrievals all need a concrete network reference to be independently checked.',
            'Use the contracts page to find deployment addresses and the statistics page to explore recorded activity. Together they connect the protocol’s rules to records you can verify.',
          ],
        },
        {
          heading: 'How App Pages Connect To Arbitrum Records',
          body: [
            'App pages translate raw chain and API records into readable protocol language. Allocation pages explain recipients and cycle outcomes; anchoring pages explain token commitments; public-goods pages explain contribution and retrieval flows; the gallery explains token output.',
            'These records are public. You can browse them and follow links to Arbitrum without connecting a wallet.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['View verified contracts', 'View protocol statistics'],
    },
    'contracts-security-verification': {
      title: 'Cosmic Signature Contracts, Security, and Verification | Cosmic Signature',
      description:
        'Find the Cosmic Signature smart contract, source code, verification, and security context for the Arbitrum protocol.',
      h1: 'Cosmic Signature Contracts, Security, and Verification',
      summary:
        'Cosmic Signature publishes contract and source-code information so participants can inspect the protocol mechanics and verify on-chain behavior.',
      sections: [
        {
          heading: 'Public Contract Context',
          body: [
            'Start with the contracts page for deployment addresses, verification links, and the role of each contract in the protocol.',
            'You can review these resources before connecting a wallet. Follow the explorer links to compare the deployed contracts with their published source code.',
          ],
        },
        {
          heading: 'Verification Surfaces',
          body: [
            'Verification is spread across several public surfaces. The contracts page lists deployment addresses and explorer links, the code page describes the deterministic rendering resources, the audits page states review status, and the security page explains how users should inspect official resources.',
            'These pages should be read together. A contract address without context is hard to interpret; a security claim without links is hard to verify. Cosmic Signature therefore keeps addresses, source references, risk language, and audit status connected through internal links.',
          ],
        },
        {
          heading: 'What To Check First',
          body: [
            'Start with the official app-host contracts page and confirm the Arbitrum network. Then compare source-code links, the security overview, and the audits page. If an audit or formal verification report has not been published, the page should say so plainly instead of implying unavailable proof.',
            'This conservative approach is intentional. Trust pages are most useful when they distinguish deployed facts, published reports, static analysis, community review, and future work rather than collapsing them into a single unsupported claim.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['Open contract addresses', 'Open source code resources', 'Read the FAQ'],
    },
    'cst-token-and-cosmic-council': {
      title: 'CST and the Cosmic Council | Cosmic Signature',
      description:
        'Learn how CST tokens relate to gestures, protocol coordination, and the Cosmic Council.',
      h1: 'CST and the Cosmic Council',
      summary:
        'CST is the Cosmic Signature ERC-20 token imprinted through participation and used for protocol coordination through the Cosmic Council.',
      sections: [
        {
          heading: 'CST In The Protocol',
          body: [
            'Gestures can imprint Participation CST, and CST can also be used as an alternative gesture currency through its own Calibration Window. CST spent on a gesture is burned \u2014 permanently removed from supply \u2014 rather than pooled.',
            'The Participation CST amount is dynamic: it depends on time since the previous gesture and uses a square-root formula, so long quiet periods produce larger imprints while rapid gestures can produce 0 CST.',
            'CST expresses coordination weight in the Cosmic Council once delegated (holders can delegate to themselves), where participants coordinate protocol changes according to on-chain rules.',
          ],
        },
        {
          heading: 'CST As Protocol Context',
          body: [
            'CST is part of the participation and coordination layer of Cosmic Signature. It can be imprinted through gestures, used for CST gestures, and used to express Coordination Weight in the Cosmic Council. That makes it a protocol token, not an equity claim.',
            'The app describes CST through operational terms because its purpose in the interface is participation, coordination, and protocol state. Public pages should explain where CST appears and what it does without implying price behavior.',
          ],
        },
        {
          heading: 'Coordination Records',
          body: [
            'The Cosmic Council gives CST holders a way to coordinate protocol changes according to on-chain rules. Coordination Changes and related app pages make the history of parameter changes visible so readers can understand how the protocol evolves.',
            'The Cosmic Council coordinates protocol changes through proposals and delegated CST weight. The terms and risk disclosures explain the limits and responsibilities that apply to participation.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['Read how gestures work', 'Open the app'],
    },
    'anchoring-nfts': {
      title: 'Anchoring Cosmic Signature NFTs | Cosmic Signature',
      description:
        'How anchoring works for Cosmic Signature NFTs, ETH Anchor Distributions, and Random Walk NFT eligibility.',
      h1: 'Anchoring Cosmic Signature NFTs',
      summary:
        'Anchoring connects NFTs back to the protocol: Cosmic Signature NFTs receive ETH Anchor Distributions, while RandomWalk NFTs enter Anchored-NFT Stellar Selection.',
      sections: [
        {
          heading: 'Anchor Distributions',
          body: [
            'Cosmic Signature NFTs can be anchored to the protocol. Anchored Cosmic Signature NFTs share the ETH Anchor Distribution for a cycle according to the protocol rules, and the accumulated ETH is retrieved when the anchor is released.',
            'Random Walk NFTs have a separate anchoring role for Anchored-NFT Stellar Selection eligibility; they do not receive ETH Anchor Distributions.',
            'Each NFT \u2014 Cosmic Signature or Random Walk \u2014 can be anchored only once. Releasing an anchor returns the NFT and any accumulated distributions, but that NFT can never be anchored again.',
          ],
        },
        {
          heading: 'What Anchoring Makes Public',
          body: [
            'Anchoring connects an NFT back to the protocol after it has been imprinted or acquired. Public anchoring pages show anchor and release actions, anchored token counts, distribution records, and related RandomWalk NFT activity.',
            'You can inspect these records without connecting a wallet, including a token’s anchor history and any distributions associated with it.',
          ],
        },
        {
          heading: 'Cosmic Signature And RandomWalk Roles',
          body: [
            'Cosmic Signature NFTs and RandomWalk NFTs have different anchoring contexts. Cosmic Signature NFTs connect to ETH Anchor Distributions, while RandomWalk NFTs can connect to selection eligibility and one-time ETH gesture discounts depending on their state.',
            'Check which collection an NFT belongs to and whether it has been anchored before. Use the gallery and anchoring records to verify its status, and the current-cycle page to see the allocations available.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['Open anchoring tools', 'Explore the gallery'],
    },
    'protocol-guild-public-goods': {
      title: 'Cosmic Signature and Ethereum Public Goods | Cosmic Signature',
      description:
        'How Cosmic Signature routes a public-goods allocation to Protocol Guild, the funding mechanism for Ethereum core contributors.',
      h1: 'Cosmic Signature and Ethereum Public Goods',
      summary:
        'Cosmic Signature includes a public-goods allocation track that currently forwards a portion of each Cycle Reserve to Protocol Guild.',
      sections: [
        {
          heading: 'Protocol Guild Allocation',
          body: [
            'Protocol Guild is the funding mechanism for 170+ Ethereum core contributors. Cosmic Signature currently forwards the public-goods allocation to Protocol Guild.',
            'Public Goods Allocation is one of the protocol’s allocation tracks. Its contribution and forwarding records are available in the app.',
          ],
        },
        {
          heading: 'Why Public Goods Are Part Of The Protocol',
          body: [
            'Public-goods forwarding is a protocol-level allocation track rather than an occasional marketing statement. A portion of the Cycle Reserve is directed to a public-goods beneficiary, currently Protocol Guild, according to the rules surfaced in the app.',
            'The Public Goods pages show contributions, funds forwarded from the vault, and the recipient address. These records make the path from cycle participation to Ethereum infrastructure support visible.',
          ],
        },
        {
          heading: 'How To Verify Public-Goods Flow',
          body: [
            'Use the public-goods contribution pages for deposited amounts and the retrieval page for funds forwarded from the vault. Use the contracts page for addresses and the statistics page for aggregate context.',
            'A record of funds forwarded to Protocol Guild confirms the transfer. It does not establish any particular tax treatment or legal status.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['View public-goods contribution records', 'Learn how cycles work'],
    },
    'collecting-and-trading-cosmic-signature': {
      title: 'Collecting and Trading Cosmic Signature NFTs and CST | Cosmic Signature',
      description:
        'Where Cosmic Signature assets trade: the zero-fee Axiom Zero NFT marketplace, Uniswap CST swaps on Arbitrum, and the Chaos Zero prediction market for cycles.',
      h1: 'Collecting and Trading Cosmic Signature',
      summary:
        'Cosmic Signature NFTs trade on Axiom Zero, the zero-fee marketplace for fair-launch generative art on Arbitrum. CST trades on Uniswap, and Chaos Zero runs a prediction market on each Performance Cycle.',
      sections: [
        {
          heading: 'Where The Assets Trade',
          body: [
            'Cosmic Signature NFTs are standard ERC-721 tokens on Arbitrum, and their primary marketplace is Axiom Zero. Axiom Zero is built for fair-launch generative art: it charges no platform fee, listings and sales settle directly on-chain in a single transaction, and sellers receive the full sale amount. The marketplace lists both Axiom Zero collections \u2014 Cosmic Signature and Random Walk \u2014 and reads every price it displays straight from verified marketplace contracts.',
            'CST is a standard ERC-20 token and trades on Uniswap on Arbitrum. Because both assets follow open token standards, any Arbitrum marketplace or exchange that supports ERC-721 or ERC-20 can also handle them; always confirm contract addresses against the official contracts page before trading.',
          ],
        },
        {
          heading: 'The Chaos Zero Prediction Market',
          body: [
            'Chaos Zero is a prediction market built specifically for Cosmic Signature. Every Performance Cycle it opens a single question: will this cycle finalize with more gestures than the previous one? Positions are denominated in CST and are fully collateralized by construction \u2014 one CST always converts into one YES plus one NO token, and a matching pair always redeems for one CST.',
            'Markets resolve from the public on-chain gesture count. The moment the count crosses the previous cycle\u2019s total, the outcome is certain, trading halts in the same block, and the market becomes withdraw-only. Chaos Zero has no owner, no admin keys, and no upgrade path.',
          ],
        },
        {
          heading: 'Anchor Status And Collector Context',
          body: [
            'Anchoring gives Cosmic Signature and Random Walk NFTs a second market-relevant property besides the artwork itself. Every NFT can be anchored to the protocol exactly once, ever, and releasing an anchor permanently ends that eligibility. A never-anchored token therefore keeps its one-time anchoring option open for its next owner, which is why collectors often value that status.',
            'Axiom Zero reads anchor status live from the anchoring contracts and labels every token as never anchored or anchored, and each collection can be filtered by that status. This keeps the marketplace description of a token consistent with the on-chain anchoring records that the app itself displays.',
          ],
        },
        {
          heading: 'How To Verify Venues And Addresses',
          body: [
            'Before trading, confirm the official contract addresses on the app-host contracts page and compare them with the collection or token pair you are viewing on a marketplace or exchange. Cosmic Signature links its ecosystem venues \u2014 Axiom Zero, Chaos Zero, and Uniswap \u2014 from the app header, footer, and site map so there is always an official navigation path to the correct destination.',
            'The same caution applies to CST swaps and prediction positions: check that the token address matches the published CST contract, and remember that Chaos Zero positions resolve from public gesture counts recorded by the protocol, so every input to the market can be independently inspected on Arbitrum.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: [
        'Browse Cosmic Signature on Axiom Zero',
        'Make predictions on Chaos Zero',
        'Swap ETH for CST on Uniswap',
        'Verify contract addresses',
        'Explore the NFT gallery',
      ],
    },
    // lexicon-allow-start: explicit denial language for crawler and compliance clarity.
    'not-a-lottery-not-an-investment': {
      title: 'Is Cosmic Signature a Lottery, Casino, or Investment? | Cosmic Signature',
      description:
        'Cosmic Signature is a procedural on-chain art protocol, not a lottery, casino, gambling product, or investment product.',
      h1: 'Is Cosmic Signature a Lottery, Casino, or Investment?',
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
        {
          heading: 'What Participation Means',
          body: [
            'Participation is an interaction with an on-chain art protocol. It does not carry a promise of financial returns, and receiving an allocation does not create equity or dividend rights.',
            'The positive definition remains the anchor: Cosmic Signature is a procedural on-chain art protocol. Participants make gestures, cycles finalize, deterministic artwork is imprinted, and allocations follow public protocol rules.',
          ],
        },
        {
          heading: 'How To Read Allocation Language',
          body: [
            'Allocation language describes protocol distributions after a cycle finalizes. It does not describe profit share, dividend rights, equity, or promised financial return. Risk disclosures and terms should be read before participating.',
            'You can read the rules, terms, and risk disclosures without connecting a wallet. Review them before deciding whether to participate.',
          ],
        },
        ...answerabilitySections,
      ],
      relatedLabels: ['Read the Terms of Service', 'Read the FAQ'],
    },
    // lexicon-allow-end
  },
} satisfies LearnText;
