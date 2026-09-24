export const HOW_IT_WORKS_PATH = '/how-it-works';

export interface HowItWorksLink {
  readonly label: string;
  readonly href: string;
}

export interface HowItWorksMetadataContent {
  readonly title: string;
  readonly description: string;
  readonly path: typeof HOW_IT_WORKS_PATH;
}

export interface HowItWorksJsonLdContent {
  readonly name: string;
  readonly description: string;
}

export interface HowItWorksBreadcrumbsContent {
  readonly homeLabel: string;
  readonly pageLabel: string;
}

export interface HowItWorksHeroContent {
  /**
   * The H1 as one plain string per locale: each locale owns its word order
   * and spacing (Japanese sets no space between a Latin name and Japanese text).
   */
  readonly heading: string;
  readonly paragraph: string;
  readonly primaryCta: HowItWorksLink;
  /** The live cycle, where the mechanism can be watched. */
  readonly secondaryCta: HowItWorksLink;
}

/** A real, finalized Cosmic Signature shown as the cycle's payoff. */
export interface HowItWorksArtSample {
  readonly tokenId: number;
  readonly cycle: number;
  readonly seed: string;
}

export interface HowItWorksPayoffContent {
  readonly heading: string;
  readonly body: string;
  /** The wall label, with the cycle number filled in. */
  readonly caption: string;
  readonly link: HowItWorksLink;
  readonly sample: HowItWorksArtSample;
}

export interface HowItWorksRewardItem {
  readonly title: string;
  readonly description: string;
  readonly tooltip: string;
}

export interface HowItWorksRewardBreakdownContent {
  readonly heading: string;
  readonly subhead: string;
  readonly items: readonly [
    HowItWorksRewardItem,
    HowItWorksRewardItem,
    HowItWorksRewardItem,
    HowItWorksRewardItem,
  ];
}

export interface HowItWorksCyclePhase {
  readonly label: string;
  readonly description: string;
  readonly tooltip: string;
}

export interface HowItWorksGameCycleContent {
  readonly heading: string;
  readonly subhead: string;
  readonly phases: readonly [
    HowItWorksCyclePhase,
    HowItWorksCyclePhase,
    HowItWorksCyclePhase,
    HowItWorksCyclePhase,
    HowItWorksCyclePhase,
    HowItWorksCyclePhase,
  ];
}

export interface HowItWorksStep {
  readonly title: string;
  readonly tooltip: string;
  readonly highlights: readonly string[];
}

export interface HowItWorksStepByStepContent {
  readonly heading: string;
  readonly subhead: string;
  /**
   * The step's eyebrow, `{n}` replaced with its number: each locale places
   * the number and its spacing ("Step 1", "ステップ1", "1단계", "第 1 步").
   */
  readonly stepLabel: string;
  readonly steps: readonly [HowItWorksStep, HowItWorksStep, HowItWorksStep];
}

/** A tip: its title and the strategy behind it. */
export interface HowItWorksTip {
  readonly title: string;
  readonly body: string;
}

export interface HowItWorksProTipsContent {
  readonly heading: string;
  readonly subhead: string;
  readonly tips: readonly [
    HowItWorksTip,
    HowItWorksTip,
    HowItWorksTip,
    HowItWorksTip,
    HowItWorksTip,
    HowItWorksTip,
  ];
}

export interface HowItWorksCallToActionContent {
  readonly heading: string;
  readonly body: string;
  readonly primaryCta: HowItWorksLink;
  readonly faqCta: HowItWorksLink;
  readonly discordCta: HowItWorksLink;
  readonly twitterCta: HowItWorksLink;
}

export interface HowItWorksContent {
  readonly metadata: HowItWorksMetadataContent;
  readonly jsonLd: HowItWorksJsonLdContent;
  readonly breadcrumbs: HowItWorksBreadcrumbsContent;
  readonly hero: HowItWorksHeroContent;
  readonly rewardBreakdown: HowItWorksRewardBreakdownContent;
  readonly gameCycle: HowItWorksGameCycleContent;
  readonly payoff: HowItWorksPayoffContent;
  readonly stepByStep: HowItWorksStepByStepContent;
  readonly proTips: HowItWorksProTipsContent;
  readonly callToAction: HowItWorksCallToActionContent;
}
