import {
  HOW_IT_WORKS_PATH,
  type HowItWorksBreadcrumbsContent,
  type HowItWorksGameCycleContent,
  type HowItWorksJsonLdContent,
  type HowItWorksProTipsContent,
  type HowItWorksRewardBreakdownContent,
  type HowItWorksStepByStepContent,
} from './types';

/**
 * The locale-independent skeleton of the how-it-works page.
 *
 * The route path, CTA/link targets, and the overview card numbering are
 * declared once here; the per-locale text modules (`text.en.ts`, `text.zh.ts`)
 * provide only copy. Fixed-length tuples in the text type keep the Chinese
 * translation in structural parity with the English content.
 */
export const HOW_IT_WORKS_STRUCTURE = {
  metadataPath: HOW_IT_WORKS_PATH,
  hero: {
    primaryCtaHref: '/',
    secondaryCtaHref: '#protocol-overview',
  },
  overviewCardNumbers: ['01', '02', '03'],
  faqCalloutCtaHref: '/faq',
  callToAction: {
    primaryCtaHref: '/',
    discordCtaHref: 'https://discord.com/channels/1258032742084509779/1258691600951935056',
    twitterCtaHref: 'https://x.com/CosmicSignature',
  },
} as const satisfies {
  readonly metadataPath: typeof HOW_IT_WORKS_PATH;
  readonly hero: {
    readonly primaryCtaHref: string;
    readonly secondaryCtaHref: string;
  };
  readonly overviewCardNumbers: readonly [string, string, string];
  readonly faqCalloutCtaHref: string;
  readonly callToAction: {
    readonly primaryCtaHref: string;
    readonly discordCtaHref: string;
    readonly twitterCtaHref: string;
  };
};

/** Copy for one overview card; its number comes from the skeleton. */
export interface HowItWorksOverviewCardText {
  readonly title: string;
  readonly description: string;
  readonly tooltip: string;
}

/**
 * The complete how-it-works copy for one locale. Sections whose fields are
 * all copy reuse the public content interfaces directly, so their fixed-length
 * tuples keep enforcing cross-locale parity at compile time.
 */
export type HowItWorksText = {
  readonly metadata: {
    readonly title: string;
    readonly description: string;
  };
  readonly jsonLd: HowItWorksJsonLdContent;
  readonly breadcrumbs: HowItWorksBreadcrumbsContent;
  readonly hero: {
    readonly badge: string;
    readonly headingLead: string;
    readonly headingAccent: string;
    readonly paragraph: string;
    readonly primaryCtaLabel: string;
    readonly secondaryCtaLabel: string;
  };
  readonly overview: {
    readonly heading: string;
    readonly subhead: string;
    readonly cards: readonly [
      HowItWorksOverviewCardText,
      HowItWorksOverviewCardText,
      HowItWorksOverviewCardText,
    ];
  };
  readonly rewardBreakdown: HowItWorksRewardBreakdownContent;
  readonly gameCycle: HowItWorksGameCycleContent;
  readonly stepByStep: HowItWorksStepByStepContent;
  readonly proTips: HowItWorksProTipsContent;
  readonly faqCallout: {
    readonly heading: string;
    readonly body: string;
    readonly ctaLabel: string;
  };
  readonly callToAction: {
    readonly heading: string;
    readonly body: string;
    readonly primaryCtaLabel: string;
    readonly discordCtaLabel: string;
    readonly twitterCtaLabel: string;
  };
};
