import type { FAQCategoryIcon } from './types';

/**
 * The locale-independent skeleton of the FAQ.
 *
 * Category order, item order, icons, item IDs, and legacy hash anchors are
 * declared once here; the per-locale text modules (`text.en.ts`, `text.zh.ts`)
 * provide only copy, keyed by these IDs. A translation that misses or invents
 * an ID fails to compile.
 *
 * Item IDs and hash anchors are public URL fragments. They intentionally
 * preserve legacy values because external backlinks depend on them.
 */

interface FAQItemStructure {
  readonly id: string;
  /** Legacy hash anchor preserved for backward compatibility. */
  readonly hashAnchor?: string;
}

interface FAQCategoryStructure {
  readonly id: string;
  readonly icon: FAQCategoryIcon;
  readonly items: readonly FAQItemStructure[];
}

export const FAQ_STRUCTURE = [
  {
    id: 'getting-started',
    icon: 'rocket',
    items: [
      { id: 'what-is-cosmic-signature' },
      { id: 'is-cosmic-signature-related-to-biology' },
      { id: 'how-does-the-bidding-game-work' },
      { id: 'what-type-of-gestures-are-available' },
      { id: 'can-i-participate-without-nfts' },
      { id: 'how-can-i-get-involved' },
      { id: 'how-long-does-each-round-last' },
      { id: 'can-i-place-multiple-gestures' },
    ],
  },
  {
    id: 'allocations-and-rewards',
    icon: 'trophy',
    items: [
      { id: 'what-is-the-main-allocation', hashAnchor: 'main-allocation' },
      { id: 'what-rewards-per-bid' },
      { id: 'how-does-the-stellarSelection-work' },
      { id: 'how-random-selection-works' },
      { id: 'how-do-i-claim-my-allocation' },
      { id: 'how-does-anchoring-work' },
      { id: 'what-are-marketing-rewards' },
      { id: 'how-many-nfts-minted' },
      { id: 'what-happens-to-remaining-eth' },
      { id: 'what-happens-to-attached-assets' },
      { id: 'who-receives-10-percent' },
    ],
  },
  {
    id: 'game-mechanics',
    icon: 'cycle',
    items: [
      { id: 'how-does-price-increase' },
      { id: 'what-is-dutch-auction' },
      { id: 'how-is-participation-cst-calculated' },
      { id: 'why-minimum-cst-reward-protection' },
      { id: 'how-cst-calibration-window-changes' },
      { id: 'what-is-open-finalization-window' },
      { id: 'what-is-endurance-champion', hashAnchor: 'endurance-champion' },
      { id: 'what-is-final-cst-gesture', hashAnchor: 'final-cst-gesture' },
      { id: 'what-is-chrono-warrior', hashAnchor: 'chrono-warrior' },
      { id: 'does-time-per-bid-stay-same' },
      { id: 'why-time-per-bid-increases' },
      { id: 'how-time-increase-affects-game' },
      { id: 'what-if-two-gestures-same-time' },
      { id: 'is-there-game-theory' },
    ],
  },
  {
    id: 'tokens-and-nfts',
    icon: 'gem',
    items: [
      { id: 'what-are-cst-and-dao' },
      { id: 'what-can-i-do-with-cst' },
      { id: 'what-makes-nfts-unique' },
      { id: 'how-are-nft-images-created' },
      { id: 'significance-of-random-seed' },
      { id: 'is-nft-supply-limited' },
      { id: 'impact-of-limiting-nfts' },
      { id: 'connection-with-randomwalknft' },
      { id: 'how-to-trade-nfts-tokens' },
      { id: 'where-to-buy-cosmic-signature-nfts' },
      { id: 'cosmic-signature-prediction-market' },
      { id: 'participate-dao-without-bidding' },
      { id: 'donate-nfts-to-game' },
    ],
  },
  {
    id: 'arbitrum-and-technical',
    icon: 'layers',
    items: [
      { id: 'what-is-arbitrum' },
      { id: 'why-arbitrum-not-ethereum' },
      { id: 'arbitrum-security' },
      { id: 'how-to-get-eth-on-arbitrum' },
      { id: 'existing-wallet-on-arbitrum' },
      { id: 'view-tokens-on-arbitrum' },
      { id: 'trade-on-arbitrum' },
      { id: 'verify-bid-success' },
      { id: 'game-security' },
      { id: 'fees-involved' },
    ],
  },
  {
    id: 'trust-and-governance',
    icon: 'shield',
    items: [
      { id: 'team-controls' },
      { id: 'will-team-always-have-control' },
      { id: 'what-is-renounce-ownership' },
      { id: 'why-renounce-ownership' },
      { id: 'how-team-profits' },
      { id: 'why-was-cs-created' },
      { id: 'what-if-team-disappears' },
      { id: 'can-create-competing-site' },
      { id: 'donate-to-pot' },
      { id: 'get-help' },
      { id: 'stay-updated' },
    ],
  },
] as const satisfies readonly FAQCategoryStructure[];

type FaqStructure = typeof FAQ_STRUCTURE;

export type FAQCategoryId = FaqStructure[number]['id'];
export type FAQItemId = FaqStructure[number]['items'][number]['id'];

// lexicon-allow-start — legacy public URL fragment IDs are immutable.
export const FAQ_POPULAR_QUESTION_IDS = [
  'what-is-cosmic-signature',
  'what-is-the-main-allocation',
  'how-does-the-stellarSelection-work',
  'how-does-anchoring-work',
] as const satisfies readonly FAQItemId[];
// lexicon-allow-end

/** Copy for one FAQ entry, provided per locale. */
export interface FAQItemText {
  readonly question: string;
  readonly answer: string;
}

/**
 * The complete FAQ copy for one locale, keyed by the skeleton's category and
 * item IDs so the compiler rejects missing or extra translations.
 */
export type FAQText = {
  readonly [Category in FaqStructure[number] as Category['id']]: {
    readonly title: string;
    readonly description: string;
    readonly items: {
      readonly [Item in Category['items'][number] as Item['id']]: FAQItemText;
    };
  };
};
