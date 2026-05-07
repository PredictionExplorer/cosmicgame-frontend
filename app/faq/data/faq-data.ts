import { Rocket, Trophy, Gamepad2, Gem, Layers, ShieldCheck, type LucideIcon } from 'lucide-react';

import { protocolFacts } from '@/content/protocol-facts';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  /** Legacy hash anchors preserved for backward compatibility */
  hashAnchor?: string;
}

export interface FAQCategory {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  items: FAQItem[];
}

/**
 * Note on IDs: item `id` values and `hashAnchor` values are URL fragments
 * preserved for backward compatibility (external backlinks depend on them).
 * They may still contain legacy vocabulary. User-visible `question` and
 * `answer` copy has been rewritten to cosmic-primary per
 * /marketing/cosmic-lexicon.md.
 */
export const faqCategories: FAQCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'The basics of Cosmic Signature and how to participate',
    icon: Rocket,
    items: [
      {
        id: 'what-is-cosmic-signature',
        question: 'What is Cosmic Signature?',
        answer:
          'Cosmic Signature is a procedural on-chain art protocol on Arbitrum. Participants make gestures during a Performance Cycle; every gesture shapes the cycle\u2019s final Signature. When the cycle finalizes, the protocol distributes its reserves across more than ten allocation tracks \u2014 including Protocol Guild, the funding mechanism for 170+ Ethereum core contributors.',
      },
      {
        id: 'how-does-the-bidding-game-work',
        question: 'How does a Performance Cycle work?',
        answer:
          'Each cycle opens with a Calibration Window where Gesture Cost descends from the Calibration Ceiling toward the Calibration Floor over roughly two days. The first gesture starts the Cycle Finalization Time (initially ~24 hours). Each subsequent gesture increases the Gesture Cost by approximately 1% and extends the Cycle Finalization Time by about an hour. When the Cycle Finalization Time expires, the participant who made the Final Gesture may finalize the cycle and receive the Signature Allocation.',
      },
      {
        id: 'what-type-of-gestures-are-available',
        question: 'What types of gestures are available?',
        answer:
          'Gestures can be made with ETH or Cosmic Signature Tokens (ERC-20 CST). You may also attach a Random Walk NFT to your gesture to receive a 50% reduction in Gesture Cost. The CST Gesture Cost drifts downward continuously within its own Calibration Window, allowing more cost-efficient participation later in the cycle.',
      },
      {
        id: 'can-i-participate-without-nfts',
        question: "Can I participate if I don't own any NFTs?",
        answer:
          'Yes. Anyone can participate in a Cosmic Signature Performance Cycle by making a gesture. An unused Random Walk NFT can be attached to an ETH gesture for a 50% Gesture Cost reduction.',
      },
      {
        id: 'how-can-i-get-involved',
        question: 'How can I get involved?',
        answer:
          'You can participate by making gestures during a Performance Cycle, or by contributing an NFT from your project to be attached to a participant\u2019s gesture. Join the Discord to meet other participants.',
      },
      {
        id: 'how-long-does-each-round-last',
        question: 'How long does each Performance Cycle last?',
        answer:
          'Each cycle begins with an initial Cycle Finalization Time of approximately 24 hours once the first gesture is made. Every gesture extends the time by about an hour, so cycles frequently last longer than a day. The cycle ends when the Cycle Finalization Time expires without another gesture arriving.',
      },
      {
        id: 'can-i-place-multiple-gestures',
        question: 'Can I make multiple gestures in one cycle?',
        answer:
          'Yes. Each gesture imprints 100 Participation CST into your wallet, increases your entry count for Stellar Selections, and shapes the cycle\u2019s evolving Signature.',
      },
    ],
  },
  {
    id: 'allocations-and-rewards',
    title: 'Allocations & Distributions',
    description: 'What participants may receive when the cycle finalizes',
    icon: Trophy,
    items: [
      {
        id: 'what-is-the-main-allocation',
        question: 'What is the Signature Allocation?',
        answer:
          'The Signature Allocation is received by the participant who made the Final Gesture of a cycle. It includes one Cosmic Signature NFT, a Recognition CST imprint of 1,000 CST, and 25% of the Cycle Reserve in ETH, plus any tokens or NFTs attached to participant gestures during the cycle.',
        hashAnchor: 'main-allocation',
      },
      {
        id: 'what-rewards-per-bid',
        question: 'What do I receive for each gesture?',
        answer:
          'Every gesture imprints three things: 100 Participation CST (ERC-20), one entry in end-of-cycle Stellar Selections, and a record of your Endurance Window contribution toward the Endurance Champion and Chrono-Warrior tracks.',
      },
      {
        id: 'how-does-the-stellarSelection-work',
        question: 'How does Stellar Selection work?',
        answer: `Each gesture records one entry in Stellar Selection. At the end of each cycle, the smart contract randomly selects participants from the entry pool: ${protocolFacts.ethStellarSelectionRecipients} participants share ${protocolFacts.stellarSelectionEthPercentage}% of the Cycle Reserve in ETH, ${protocolFacts.nftStellarSelectionRecipients} participants each receive ${protocolFacts.specialAllocationCst.toLocaleString()} CST and a Cosmic Signature NFT, and ${protocolFacts.anchoredRwlkNftSelectionRecipients} anchor-holders of Random Walk NFTs also receive ${protocolFacts.specialAllocationCst.toLocaleString()} CST and Cosmic Signature NFTs. Selection frequency increases with the number of gestures you make.`,
      },
      {
        id: 'how-do-i-claim-my-allocation',
        question: 'How do I retrieve my allocation if I\u2019m a recipient?',
        answer:
          'Recipients of the Signature Allocation retrieve their share of the Cycle Reserve through the protocol contract. Visit the My Allocations page or the cycle allocation page to initiate the retrieval after the cycle finalizes.',
      },
      {
        id: 'how-does-anchoring-work',
        question: 'How does Anchoring work?',
        answer:
          'Cosmic Signature NFTs can be anchored to the protocol to receive Anchor Distributions. Anchoring pays 6% of the Cycle Reserve each cycle, distributed proportionally across all anchored Cosmic Signature NFTs. Random Walk NFTs can also be anchored for Anchored-NFT Stellar Selection eligibility. Visit the My Anchors page (from your account menu) to manage anchors.',
      },
      {
        id: 'what-are-marketing-rewards',
        question: 'What is the Outreach Reserve?',
        answer: `You can receive Cosmic Signature Tokens (ERC-20) for helping promote the protocol. The Outreach Reserve imprints ${protocolFacts.outreachReserveCst.toLocaleString()} CST per cycle and distributes it to ecosystem contributors. Contact the Outreach Custodian via Discord for guidance.`,
      },
      {
        id: 'how-many-nfts-minted',
        question: 'How many Cosmic Signature NFTs are imprinted each cycle?',
        answer: `In the vast majority of cycles, ${protocolFacts.typicalNftsPerCycle} Cosmic Signature NFTs are imprinted: one for the Signature Allocation recipient, one for the Final CST Gesture recipient, one for the Endurance Champion, one for the Chrono-Warrior, ${protocolFacts.nftStellarSelectionRecipients} for NFT Stellar Selection recipients, and ${protocolFacts.anchoredRwlkNftSelectionRecipients} for Random Walk NFT anchor-holders selected through Anchored-NFT Stellar Selection. Each of those ${protocolFacts.typicalNftsPerCycle} NFT allocations also includes ${protocolFacts.specialAllocationCst.toLocaleString()} CST.`,
      },
      {
        id: 'what-happens-to-remaining-eth',
        question: 'What happens to the remaining ETH in the Cycle Reserve?',
        answer:
          'About half of the Cycle Reserve rolls forward into the next Performance Cycle as the Compounding Cycle Reserve, increasing the starting balance for the following cycle. The protocol compounds rather than extracts.',
      },
      {
        id: 'who-receives-10-percent',
        question: 'Who receives the public-goods allocation from the Cycle Reserve?',
        answer:
          'Seven percent of the Cycle Reserve is forwarded to a Public Goods Beneficiary selected through Protocol Coordination on the Cosmic Council. The current beneficiary is Protocol Guild \u2014 the collective funding mechanism for 170+ Ethereum core contributors.',
      },
    ],
  },
  {
    id: 'game-mechanics',
    title: 'Cycle Mechanics',
    description: 'Deep dive into gesture timing and protocol rules',
    icon: Gamepad2,
    items: [
      {
        id: 'how-does-price-increase',
        question: 'How does Gesture Cost change across a cycle?',
        answer:
          'Each gesture increases Gesture Cost by approximately 1% \u2014 a Gesture-Cost Drift that adds a strategic element. Gesture early for lower cost and more Stellar Selection entries, or gesture later when the cycle matures. At the start of each new cycle, Gesture Cost resets to approximately 100x lower than the previous cycle\u2019s Final Gesture cost, then opens a Calibration Window.',
      },
      {
        id: 'what-is-dutch-auction',
        question: 'What is the Calibration Window?',
        answer:
          'When you gesture with ETH, you imprint 100 Cosmic Signature Tokens (ERC-20 CST). These tokens can be used to make another gesture through the CST Calibration Window. A Calibration Window is a price-discovery window in which the Gesture Cost descends from a Calibration Ceiling to a Calibration Floor over a known duration. As time passes, Gesture Cost falls \u2014 giving cost-efficient participation to later entrants.',
      },
      {
        id: 'what-is-endurance-champion',
        question: 'What is an Endurance Champion?',
        answer:
          'The participant who remained the most recent gesture maker for the longest consecutive interval within a cycle (the longest gap before another gesture arrived). When the cycle finalizes, the Endurance Champion receives a Recognition CST imprint of 1,000 CST and one Cosmic Signature NFT.',
        hashAnchor: 'endurance-champion',
      },
      {
        id: 'what-is-final-cst-gesture',
        question: 'What is the Final CST Gesture?',
        answer:
          'The Final CST Gesture is the last gesture made with Cosmic Signature Tokens (CST) during a cycle. When the cycle finalizes, the participant who made it receives a Recognition CST imprint of 1,000 CST and one Cosmic Signature NFT.',
        hashAnchor: 'final-cst-gesture',
      },
      {
        id: 'what-is-chrono-warrior',
        question: 'What is a Chrono-Warrior?',
        answer: `The participant who held the Endurance Champion position for the longest consecutive interval. Analogous to the Endurance Champion being the longest-reigning recent gesture maker, the Chrono-Warrior is the longest-reigning Endurance Champion. When the cycle finalizes, the Chrono-Warrior receives ${protocolFacts.chronoWarriorEthPercentage}% of the Cycle Reserve in ETH, ${protocolFacts.specialAllocationCst.toLocaleString()} CST, and one Cosmic Signature NFT.`,
        hashAnchor: 'chrono-warrior',
      },
      {
        id: 'does-time-per-bid-stay-same',
        question: 'Does the time added per gesture always stay the same?',
        answer:
          'No. The time added after each gesture starts at approximately one hour, but gradually increases over time. The increment is designed to be slow \u2014 approximately 10% to 20% per year, exponentially.',
      },
      {
        id: 'why-time-per-bid-increases',
        question: 'Why does the time added per gesture increase over time?',
        answer:
          'The mechanism limits the long-term rate at which Cosmic Signature NFTs are imprinted. Slower cycles mean fewer new NFTs enter circulation per unit time, preserving scarcity.',
      },
      {
        id: 'how-time-increase-affects-game',
        question: 'How does the increase in time per gesture affect the protocol?',
        answer:
          'As the time added per gesture increases, cycles run longer on average. The change is gradual, preserving a smooth participation experience while limiting total Cosmic Signature NFT supply over long time horizons.',
      },
      {
        id: 'what-if-two-gestures-same-time',
        question: 'What happens if two gestures are submitted at the same time?',
        answer:
          'Transactions on Arbitrum are processed in the order they are included by the sequencer. If two gestures arrive at the same moment, the one confirmed first is the valid gesture.',
      },
      {
        id: 'is-there-game-theory',
        question: 'Is there a strategic element in Cosmic Signature?',
        answer:
          'Yes. Participant timing, gesture frequency, and method (ETH vs CST vs Random Walk attachment) all shape how allocations distribute. The social dynamics and protocol design are designed so that multiple strategies can succeed across different allocation tracks.',
      },
    ],
  },
  {
    id: 'tokens-and-nfts',
    title: 'Tokens & Cosmic Signatures',
    description: 'CST, the on-chain art, and digital assets',
    icon: Gem,
    items: [
      {
        id: 'what-are-cst-and-dao',
        question: 'What are Cosmic Signature Tokens and the Cosmic Council?',
        answer:
          'Every gesture imprints Cosmic Signature Tokens (CST), which express Coordination Weight on the Cosmic Council. The Council coordinates the protocol on-chain: CST holders submit Coordination Proposals and express Support or Opposition. The Council decides which Public Goods Beneficiary receives the 7% allocation each cycle and adjusts other on-chain parameters.',
      },
      {
        id: 'what-can-i-do-with-cst',
        question: 'What can I do with CST tokens?',
        answer:
          'CST (Cosmic Signature Tokens) can be used as an alternative to ETH for gestures. You imprint 100 CST per gesture, so active participants naturally accumulate CST for future cycles. They also express Coordination Weight on the Cosmic Council.',
      },
      {
        id: 'what-makes-nfts-unique',
        question: 'What makes Cosmic Signature NFTs unique?',
        answer:
          'Cosmic Signature NFTs are on-chain and self-sustaining. Each NFT is imprinted with a randomly generated seed stored in the smart contract. The image and video are rendered from this seed using an open-source Rust pipeline. The seed determines the three celestial bodies\u2019 starting conditions, producing a unique chaotic trajectory for each NFT.',
      },
      {
        id: 'how-are-nft-images-created',
        question: 'How are the NFT images created?',
        answer:
          'Each Cosmic Signature NFT visualizes the three-body problem in Newtonian gravity. The protocol simulates three celestial bodies under gravity and spectrally renders their trajectories across 16 wavelength bins, creating a unique chaotic pattern for every NFT.',
      },
      {
        id: 'significance-of-random-seed',
        question: 'Why is each NFT generated from an on-chain seed?',
        answer:
          'The seed-based pipeline ensures long-term reproducibility. Unlike NFT projects whose images rely on centralized servers, every Cosmic Signature NFT\u2019s seed is stored on Arbitrum. Anyone can independently regenerate the NFT image and video at any time using the open-source Rust pipeline \u2014 pixel-for-pixel identical to the original.',
      },
      {
        id: 'is-nft-supply-limited',
        question: 'Is the number of Cosmic Signature NFTs limited?',
        answer:
          'Yes. Because the time added per gesture grows exponentially over time, the pace of NFT imprinting slows. Total Cosmic Signature NFTs become a limited resource in the long run.',
      },
      {
        id: 'impact-of-limiting-nfts',
        question: 'What is the impact of the limited NFT supply?',
        answer:
          'The growing gesture-time increment and slowing imprint pace preserve scarcity. Each new Cosmic Signature NFT represents a progressively rarer slice of the cumulative protocol history.',
      },
      {
        id: 'connection-with-randomwalknft',
        question: 'What is the connection with Random Walk NFT?',
        answer:
          'Random Walk NFT holders can attach an unused token to one ETH gesture for a 50% Gesture-Cost reduction. Random Walk NFT anchor-holders also receive entries into the Anchored-NFT Stellar Selection each cycle.',
      },
      {
        id: 'how-to-trade-nfts-tokens',
        question: 'How can I trade or sell my Cosmic Signature NFTs or CST?',
        answer:
          'Cosmic Signature NFTs and CST are standard ERC-721 and ERC-20 assets. They are compatible with any Arbitrum marketplace or exchange that supports those standards, including OpenSea and Uniswap.',
      },
      {
        id: 'participate-dao-without-bidding',
        question: 'Can I participate in the Cosmic Council without making a gesture?',
        answer:
          'Yes. You can acquire CST on a supported exchange and use it to express Coordination Weight on the Cosmic Council. Making gestures remains the primary way to imprint new CST.',
      },
      {
        id: 'donate-nfts-to-game',
        question: 'How can other NFT projects contribute their tokens to a cycle?',
        answer:
          'Projects can attach their tokens (ERC-721 or ERC-20) to a gesture using the "Advanced Options" pane. Provide the contract address and token ID or amount and submit the gesture. Attached tokens forward into the Cycle Reserve and flow to the Signature Allocation recipient after finalization.',
      },
    ],
  },
  {
    id: 'arbitrum-and-technical',
    title: 'Arbitrum & Technical',
    description: 'Network setup, wallets, and technical details',
    icon: Layers,
    items: [
      {
        id: 'what-is-arbitrum',
        question: 'What is Arbitrum and why is Cosmic Signature deployed on it?',
        answer:
          'Arbitrum is an Ethereum Layer 2 rollup that speeds up transactions and reduces fees. Cosmic Signature deploys on Arbitrum to offer sub-cent gas costs and faster finality while preserving Ethereum\u2019s security guarantees.',
      },
      {
        id: 'why-arbitrum-not-ethereum',
        question: 'Why Arbitrum and not Ethereum mainnet?',
        answer:
          'Most on-chain activity is migrating to Layer 2s. Arbitrum offers dramatically lower gas costs while maintaining the same security model as Ethereum Layer 1 \u2014 making it the right home for a gesture-heavy protocol like Cosmic Signature.',
      },
      {
        id: 'arbitrum-security',
        question: 'What makes Arbitrum as secure as Ethereum Layer 1?',
        answer:
          'Arbitrum is a rollup, not a sidechain. Every batch of transactions is posted back to Ethereum mainnet. This anchors Arbitrum\u2019s security in Ethereum itself: the data and dispute resolution live on Layer 1.',
      },
      {
        id: 'how-to-get-eth-on-arbitrum',
        question: 'How do I get ETH on Arbitrum?',
        answer:
          'Bridge ETH from Ethereum mainnet using the official Arbitrum bridge or other supported bridges. Your ETH is locked on Ethereum and an equivalent amount becomes available on Arbitrum. Bridging requires an Ethereum Layer 1 gas payment.',
      },
      {
        id: 'existing-wallet-on-arbitrum',
        question: 'Can I use my existing Ethereum wallet on Arbitrum?',
        answer:
          'Yes. The same private keys sign transactions on both networks. You just need to add the Arbitrum network to your wallet\u2019s network list.',
      },
      {
        id: 'view-tokens-on-arbitrum',
        question: 'How do I view my Cosmic Signature Tokens and NFTs on Arbitrum?',
        answer:
          'View them directly on the Cosmic Signature website, or add the contract addresses to your wallet manually. Contract addresses are published on the Contracts page and in the community Discord.',
      },
      {
        id: 'trade-on-arbitrum',
        question: 'Can I trade my Cosmic Signature NFTs and CST on Arbitrum?',
        answer:
          'Yes. Cosmic Signature NFTs and CST are ERC-721 and ERC-20 assets on Arbitrum. They can be traded on any Arbitrum marketplace or exchange that supports those standards. Always confirm the contract address before trading.',
      },
      {
        id: 'verify-bid-success',
        question: 'How can I confirm that my gesture was submitted successfully?',
        answer:
          'Successful gestures are confirmed on Arbitrum and visible on the Arbitrum block explorer (Arbiscan). Your transaction hash can be pasted into the explorer to verify the gesture.',
      },
      {
        id: 'game-security',
        question: 'How is the protocol\u2019s security ensured?',
        answer:
          'Cosmic Signature contracts are formally verified with Certora, reviewed by Slither, and built on OpenZeppelin foundations. Every contract is CC0-licensed so the community can audit and reproduce behavior independently.',
      },
      {
        id: 'fees-involved',
        question: 'Are there any fees involved?',
        answer:
          'Beyond the Gesture Cost itself, you pay Arbitrum network gas fees for each transaction. Gas fees fluctuate with network conditions and are not controlled by Cosmic Signature.',
      },
    ],
  },
  {
    id: 'trust-and-governance',
    title: 'Trust & Coordination',
    description: 'Transparency, team control, and the open-source vision',
    icon: ShieldCheck,
    items: [
      {
        id: 'team-controls',
        question: 'What controls does the team have over the protocol?',
        answer:
          'Initially, the team has the ability to adjust certain parameters of the protocol, such as gesture-time increments or allocation-track percentages. This control is scoped to the inter-cycle window and implemented through the smart contract\'s "Ownable" pattern. Once a cycle begins (at the first gesture), nobody \u2014 including the owner \u2014 can change protocol conditions until the cycle finalizes.',
      },
      {
        id: 'will-team-always-have-control',
        question: "Will the team always have control over the protocol's parameters?",
        answer:
          'No. Once the protocol is stable, ownership transfers to the Cosmic Council. Parameter changes thereafter occur only through Protocol Coordination proposals that clear the Coordination Quorum.',
      },
      {
        id: 'what-is-renounce-ownership',
        question: 'What does "renouncing ownership" mean?',
        answer:
          'Renouncing ownership is an Ownable-contract function that permanently transfers control away from the deployer address. Once called, no privileged role can modify the contract\u2019s parameters.',
      },
      {
        id: 'why-renounce-ownership',
        question: 'Why would the team renounce ownership?',
        answer:
          'The goal is a fair and decentralized protocol. Renouncing ownership ensures that the protocol\u2019s rules cannot be changed arbitrarily once live \u2014 strengthening trust and predictability for participants.',
      },
      {
        id: 'how-team-profits',
        question: 'How does the Cosmic Signature team receive value from the protocol?',
        answer:
          'No team wallet receives ETH from participant gestures. All ETH flows into the Cycle Reserve and is distributed per the allocation tracks. The team\u2019s alignment with the protocol is held indirectly through Random Walk NFTs; success of the protocol may increase the cultural value of those NFTs. Primary motivations are curiosity, creativity, and contributing to open-source public goods.',
      },
      {
        id: 'why-was-cs-created',
        question: 'Why was Cosmic Signature created?',
        answer:
          'Cosmic Signature was born from a fascination with chaos theory and the unsolvable nature of the three-body problem. The idea of unique, deterministic art generated from on-chain seeds was both intriguing and fitting for a public-goods-aligned protocol.',
      },
      {
        id: 'what-if-team-disappears',
        question: 'What if the team disappears?',
        answer:
          'The protocol is designed to be self-sustaining. Seeds are stored on-chain; anyone can regenerate NFT images and videos using the open-source Rust pipeline. This ensures the continued availability of every Cosmic Signature NFT regardless of the team\u2019s status.',
      },
      {
        id: 'can-create-competing-site',
        question: 'Can I fork this and build my own site?',
        answer:
          'Absolutely. Every contract, shader, renderer, and page is CC0 1.0 \u2014 no rights reserved. Fork, remix, and build whatever you like.',
      },
      {
        id: 'donate-to-pot',
        question: 'Can I contribute ETH to the Cycle Reserve without making a gesture?',
        answer:
          'Yes. The smart contract accepts ETH contributions independent of a gesture. You may also attach a note to the contribution, which may surface on the cycle\u2019s contribution list. Reach out via Discord for details.',
      },
      {
        id: 'get-help',
        question: 'How can I get help if I have questions?',
        answer:
          'The community and support team are available via Discord, X / Twitter, and the support email listed on the Contacts page.',
      },
      {
        id: 'stay-updated',
        question: 'How can I stay updated on Cosmic Signature news?',
        answer:
          'Follow the official social media channels and join the Discord community for the latest announcements, protocol coordination proposals, and cycle recaps.',
      },
    ],
  },
];

// lexicon-allow-start — legacy URL fragment IDs preserved for backward
// compatibility with external backlinks. User-visible question/answer copy
// is cosmic-primary; only these identifier strings retain old vocabulary.
export const popularQuestionIds = [
  'what-is-cosmic-signature',
  'what-is-the-main-allocation',
  'how-does-the-stellarSelection-work',
  'how-does-anchoring-work',
];
// lexicon-allow-end

export function getAllItems(): FAQItem[] {
  return faqCategories.flatMap((cat) => cat.items);
}

export function getTotalQuestionCount(): number {
  return faqCategories.reduce((sum, cat) => sum + cat.items.length, 0);
}

export function findItemById(id: string): { item: FAQItem; category: FAQCategory } | undefined {
  for (const category of faqCategories) {
    const item = category.items.find((q) => q.id === id);
    if (item) return { item, category };
  }
  return undefined;
}

export function findItemByHash(hash: string): { item: FAQItem; category: FAQCategory } | undefined {
  const anchor = hash.replace('#', '');
  for (const category of faqCategories) {
    const item = category.items.find((q) => q.hashAnchor === anchor || q.id === anchor);
    if (item) return { item, category };
  }
  return undefined;
}
