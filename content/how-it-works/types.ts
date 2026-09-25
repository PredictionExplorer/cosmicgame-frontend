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

/**
 * One outcome of a gesture. An explainer shows its explanation: the whole
 * rule is in the visible description, with no hover card behind the title.
 */
export interface HowItWorksRewardItem {
  readonly title: string;
  readonly description: string;
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

/** One line of what a gesture costs: a short title and the plain fact behind it. */
export interface HowItWorksCostItem {
  readonly title: string;
  readonly body: string;
}

/**
 * What a gesture costs, beside what it can lead to: the spend is not
 * returned, the ETH cost steps up, and gas is paid on Arbitrum. It closes
 * with a caution and the link to the risk disclosures.
 */
export interface HowItWorksCostsContent {
  readonly heading: string;
  readonly subhead: string;
  readonly items: readonly [HowItWorksCostItem, HowItWorksCostItem, HowItWorksCostItem];
  readonly note: string;
  readonly riskLink: HowItWorksLink;
}

/** One numbered stage of the cycle; the rule is in the visible description. */
export interface HowItWorksCyclePhase {
  readonly label: string;
  readonly description: string;
}

/** The key under the drawing: what its dots, hatched band and allocation bar stand for. */
export interface HowItWorksCycleLegend {
  /** Names the gesture dots, which are labelled by their tickers. */
  readonly gestures: string;
  /** Names the row of the hatched band, as the other rows are named. */
  readonly finalization: string;
  /** The hatched band after zero: the Final Gesture participant's exclusive window. */
  readonly exclusiveWindow: string;
  /** Names the allocation bar, whose segments are labelled by track. */
  readonly allocations: string;
}

export interface HowItWorksGameCycleContent {
  readonly heading: string;
  readonly subhead: string;
  readonly legend: HowItWorksCycleLegend;
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
  /** Where to get ETH on Arbitrum: a short question and the FAQ answer on bridging. */
  readonly funding: {
    readonly text: string;
    readonly link: HowItWorksLink;
  };
}

/** A detail that is easy to miss: its name and the plain fact. */
export interface HowItWorksTip {
  readonly title: string;
  readonly body: string;
}

export interface HowItWorksProTipsContent {
  readonly heading: string;
  readonly subhead: string;
  readonly tips: readonly [HowItWorksTip, HowItWorksTip, HowItWorksTip];
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
  readonly costs: HowItWorksCostsContent;
  readonly gameCycle: HowItWorksGameCycleContent;
  readonly payoff: HowItWorksPayoffContent;
  readonly stepByStep: HowItWorksStepByStepContent;
  readonly proTips: HowItWorksProTipsContent;
  readonly callToAction: HowItWorksCallToActionContent;
}
