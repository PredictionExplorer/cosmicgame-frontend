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
  readonly badge: string;
  /** The H1 renders as `{headingLead} {headingAccent}` with the accent in a gradient span. */
  readonly headingLead: string;
  readonly headingAccent: string;
  readonly paragraph: string;
  readonly primaryCta: HowItWorksLink;
  /** In-page anchor CTA (plain `<a>`), e.g. `#protocol-overview`. */
  readonly secondaryCta: HowItWorksLink;
}

export interface HowItWorksOverviewCard {
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly tooltip: string;
}

/**
 * Fixed-length tuples keep the per-item icon/accent visuals (which stay in the
 * components) safely zippable under `noUncheckedIndexedAccess`, and force the
 * Chinese translation to keep structure parity with the English content.
 */
export interface HowItWorksOverviewContent {
  readonly heading: string;
  readonly subhead: string;
  readonly cards: readonly [HowItWorksOverviewCard, HowItWorksOverviewCard, HowItWorksOverviewCard];
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
  /** Visible prefix before the zero-padded ordinal, rendered as e.g. "STEP 01". */
  readonly stepLabel: string;
  readonly steps: readonly [HowItWorksStep, HowItWorksStep, HowItWorksStep];
}

export interface HowItWorksTip {
  readonly title: string;
  readonly description: string;
  readonly tooltip: string;
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

export interface HowItWorksFaqCalloutContent {
  readonly heading: string;
  readonly body: string;
  readonly cta: HowItWorksLink;
}

export interface HowItWorksCallToActionContent {
  readonly heading: string;
  readonly body: string;
  readonly primaryCta: HowItWorksLink;
  readonly discordCta: HowItWorksLink;
  readonly twitterCta: HowItWorksLink;
}

export interface HowItWorksContent {
  readonly metadata: HowItWorksMetadataContent;
  readonly jsonLd: HowItWorksJsonLdContent;
  readonly breadcrumbs: HowItWorksBreadcrumbsContent;
  readonly hero: HowItWorksHeroContent;
  readonly overview: HowItWorksOverviewContent;
  readonly rewardBreakdown: HowItWorksRewardBreakdownContent;
  readonly gameCycle: HowItWorksGameCycleContent;
  readonly stepByStep: HowItWorksStepByStepContent;
  readonly proTips: HowItWorksProTipsContent;
  readonly faqCallout: HowItWorksFaqCalloutContent;
  readonly callToAction: HowItWorksCallToActionContent;
}
