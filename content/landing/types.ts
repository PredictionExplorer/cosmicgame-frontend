export interface LandingLink {
  readonly label: string;
  readonly href: string;
}

export interface LandingMetaContent {
  readonly title: string;
  readonly description: string;
  readonly keywords: readonly string[];
}

export interface LandingHeroArtContent {
  readonly eyebrow: string;
  readonly caption: string;
  readonly cstNote: string;
  readonly formingLabel: string;
  readonly formingBody: string;
  /** Serializable template. Replace `{tokenLabel}` with the formatted token identifier. */
  readonly viewAriaLabel: string;
  /** Serializable template. Replace `{tokenLabel}` with the formatted token identifier. */
  readonly artworkAlt: string;
  readonly galleryCta: string;
}

export interface LandingHeroContent {
  readonly eyebrow: string;
  readonly headline: string;
  readonly headlineLead: string;
  readonly headlineAccent: string;
  readonly subhead: string;
  readonly biologyDisclaimer: string;
  readonly primaryCta: LandingLink;
  readonly secondaryCta: LandingLink;
  readonly statisticsCta: LandingLink;
  readonly galleryCta: LandingLink;
  readonly scrollAriaLabel: string;
  readonly marqueeChips: readonly string[];
  readonly art: LandingHeroArtContent;
}

export interface LandingStage {
  readonly number: string;
  readonly title: string;
  readonly body: string;
}

export interface LandingCycleContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly stages: readonly LandingStage[];
}

export interface LandingArtFact {
  readonly label: string;
  readonly value: string;
}

export interface LandingArtLoadingContent {
  readonly label: string;
  readonly description: string;
}

export interface LandingArtShowcaseContent {
  readonly liveLabel: string;
  readonly signalLabel: string;
  readonly awaitingMetadataLabel: string;
  /** Serializable template. Replace `{tokenLabel}` with the formatted token identifier. */
  readonly viewAriaLabel: string;
  /** Serializable template. Replace `{tokenLabel}` with the formatted token identifier. */
  readonly artworkAlt: string;
}

export interface LandingArtContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly loading: LandingArtLoadingContent;
  readonly showcase: LandingArtShowcaseContent;
  readonly stageLabel: string;
  readonly stages: readonly LandingStage[];
  readonly facts: readonly LandingArtFact[];
}

export type LandingTrackTone =
  | 'primary'
  | 'aurora'
  | 'rose'
  | 'impact'
  | 'nebula'
  | 'solar'
  | 'default';

export interface LandingTrackItem {
  readonly percent: string;
  readonly title: string;
  readonly body: string;
  readonly tone: LandingTrackTone;
}

export interface LandingTracksContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly description: string;
  readonly cardLabel: string;
  readonly items: readonly LandingTrackItem[];
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
  readonly title: string;
  readonly body: string;
}

export interface LandingVerifiabilityContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly body: string;
  readonly pillars: readonly LandingVerifiabilityPillar[];
}

export interface LandingFaqItem {
  readonly question: string;
  readonly answer: string;
}

export interface LandingFaqContent {
  readonly eyebrow: string;
  readonly heading: string;
  readonly items: readonly LandingFaqItem[];
}

export interface LandingFooterColumn {
  readonly heading: string;
  readonly links: readonly LandingLink[];
}

export interface LandingFooterContent {
  readonly brandName: string;
  readonly logoAlt: string;
  readonly tagline: string;
  readonly columns: readonly LandingFooterColumn[];
  /** Serializable template. Replace `{year}` with the current four-digit year. */
  readonly copyright: string;
  readonly colophon: string;
}

export interface LandingNotFoundContent {
  readonly code: string;
  readonly heading: string;
  readonly description: string;
  readonly cta: LandingLink;
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
  readonly footer: LandingFooterContent;
  readonly notFound: LandingNotFoundContent;
}
