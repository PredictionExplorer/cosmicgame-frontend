import type { AllocationTrackId } from '@/config/allocationTracks';

export interface LandingLink {
  readonly label: string;
  readonly href: string;
}

export interface LandingMetaContent {
  readonly title: string;
  readonly description: string;
  readonly keywords: readonly string[];
}

/** Copy around the hero's artwork; the token itself comes from the collection. */
export interface LandingHeroArtContent {
  /** Serializable template. Replace `{tokenLabel}` with the formatted token identifier. */
  readonly viewAriaLabel: string;
  /** Serializable template. Replace `{tokenLabel}` with the formatted token identifier. */
  readonly artworkAlt: string;
  readonly galleryCta: string;
}

export interface LandingHeroContent {
  readonly eyebrow: string;
  readonly headlineLead: string;
  readonly headlineAccent: string;
  /** The loop in one breath: what a visitor does and what happens at zero. */
  readonly subhead: string;
  readonly secondaryCta: LandingLink;
  readonly art: LandingHeroArtContent;
}

export interface LandingStage {
  readonly number: string;
  readonly title: string;
  readonly body: string;
}

/** "How a cycle works": three numbered steps, then a way to take the first one. */
export interface LandingCycleContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly steps: readonly LandingStage[];
  readonly gestureCta: LandingLink;
  readonly guideCta: LandingLink;
}

export type LandingArtFactId = 'imprinted' | 'resolution' | 'animation' | 'license';

export interface LandingArtFact {
  readonly id: LandingArtFactId;
  readonly label: string;
  /** `null` for a figure read live from the collection (the imprinted count). */
  readonly value: string | null;
}

export interface LandingArtShowcaseContent {
  /** Serializable template. Replace `{tokenLabel}` with the formatted token identifier. */
  readonly viewAriaLabel: string;
  /** Serializable template. Replace `{tokenLabel}` with the formatted token identifier. */
  readonly artworkAlt: string;
}

export interface LandingArtContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly showcase: LandingArtShowcaseContent;
  readonly stageLabel: string;
  readonly stages: readonly LandingStage[];
  readonly facts: readonly LandingArtFact[];
}

/** One share of a cycle's ETH reserve, drawn to scale against 100%. */
export interface LandingEthTrack {
  readonly id: AllocationTrackId;
  /** Percent of the ETH Cycle Reserve (the compounding share is the remainder). */
  readonly share: number;
  /** The share as the reader sees it ("25%", "~50%"). */
  readonly percent: string;
  readonly title: string;
  readonly body: string;
}

/** A fixed CST and NFT allocation made every cycle. */
export interface LandingFixedTrack {
  readonly id: string;
  /**
   * How many recipients the track has each cycle ("10 recipients"); what
   * each one receives is said once for the group (`fixedEach`). Each locale
   * writes its own count phrase.
   */
  readonly amount: string;
  readonly title: string;
  readonly body: string;
}

export interface LandingTracksContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly ethLabel: string;
  readonly fixedLabel: string;
  /** What every fixed-track recipient receives: "Each recipient receives 1,000 CST and one …". */
  readonly fixedEach: string;
  readonly eth: readonly LandingEthTrack[];
  readonly fixed: readonly LandingFixedTrack[];
}

export interface LandingAnchoringContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly bullets: readonly string[];
  readonly cta: LandingLink;
}

export interface LandingPublicGoodsTableRow {
  readonly label: string;
  readonly value: string;
}

export interface LandingPublicGoodsCard {
  readonly label: string;
  readonly percentage: string;
  readonly description: string;
  readonly tableRows: readonly LandingPublicGoodsTableRow[];
}

export interface LandingPublicGoodsContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly disclaimerHeading: string;
  readonly disclaimer: string;
  readonly card: LandingPublicGoodsCard;
  readonly cta: LandingLink;
}

export interface LandingCouncilColumn {
  /** `proposal`, `weight` or `quorum` (content/landing/structure.ts). */
  readonly id: string;
  readonly title: string;
  readonly body: string;
}

export interface LandingCouncilContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly columns: readonly LandingCouncilColumn[];
}

export interface LandingVerifiabilityPillar {
  /** `cc0`, `verification` or `reproducible` (content/landing/structure.ts): it picks the icon. */
  readonly id: string;
  readonly title: string;
  readonly body: string;
}

export interface LandingVerifiabilityContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly pillars: readonly LandingVerifiabilityPillar[];
  /** Heads the links to the evidence (contracts, source code, security, audits). */
  readonly evidenceLabel: string;
}

export interface LandingFaqItem {
  readonly question: string;
  readonly answer: string;
}

export interface LandingFaqContent {
  readonly eyebrow: string;
  readonly heading: string;
  /** Names the link to the app's full FAQ. */
  readonly moreLabel: string;
  readonly items: readonly LandingFaqItem[];
}

/** The closing band: recent Signatures and a next step in the app. */
export interface LandingClosingContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  /** The band's commit action: the app's gesture panel (the same link as The Cycle's). */
  readonly gestureCta: LandingLink;
  readonly galleryCta: LandingLink;
}

export interface LandingContent {
  readonly meta: LandingMetaContent;
  readonly hero: LandingHeroContent;
  readonly cycle: LandingCycleContent;
  readonly art: LandingArtContent;
  readonly tracks: LandingTracksContent;
  readonly anchoring: LandingAnchoringContent;
  readonly publicGoods: LandingPublicGoodsContent;
  readonly council: LandingCouncilContent;
  readonly verifiability: LandingVerifiabilityContent;
  readonly faq: LandingFaqContent;
  readonly closing: LandingClosingContent;
}
