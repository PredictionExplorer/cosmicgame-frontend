import {
  HOW_IT_WORKS_PATH,
  type HowItWorksArtSample,
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
 * The route path, CTA/link targets and the payoff's sample artwork are
 * declared once here; the per-locale text modules (`text.en.ts`, `text.zh.ts`)
 * provide only copy. Fixed-length tuples in the text type keep the Chinese
 * translation in structural parity with the English content.
 */
export const HOW_IT_WORKS_STRUCTURE = {
  metadataPath: HOW_IT_WORKS_PATH,
  hero: {
    primaryCtaHref: '/#make-gesture',
    secondaryCtaHref: '/current-cycle',
  },
  /** The payoff's artwork: Cycle 1's Signature, token #24 (a real, finalized Signature). */
  payoffSample: {
    tokenId: 24,
    cycle: 1,
    seed: '5084a87375896c7103ba17b57264f20de35d9e6eb545314680ad5e074dfc33ad',
  },
  callToAction: {
    primaryCtaHref: '/#make-gesture',
    faqCtaHref: '/faq',
    // The public invite: a /channels/ deep link opens only for existing members.
    discordCtaHref: 'https://discord.gg/bGnPn96Qwt',
    twitterCtaHref: 'https://x.com/CosmicSignature',
  },
} as const satisfies {
  readonly metadataPath: typeof HOW_IT_WORKS_PATH;
  readonly hero: {
    readonly primaryCtaHref: string;
    readonly secondaryCtaHref: string;
  };
  readonly payoffSample: HowItWorksArtSample;
  readonly callToAction: {
    readonly primaryCtaHref: string;
    readonly faqCtaHref: string;
    readonly discordCtaHref: string;
    readonly twitterCtaHref: string;
  };
};

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
    /** The H1, one plain string. */
    readonly heading: string;
    readonly paragraph: string;
    readonly primaryCtaLabel: string;
    readonly secondaryCtaLabel: string;
  };
  readonly rewardBreakdown: HowItWorksRewardBreakdownContent;
  readonly gameCycle: HowItWorksGameCycleContent;
  readonly payoff: {
    readonly heading: string;
    readonly body: string;
    /** The artwork's wall label; `{cycle}` is replaced with the sample's cycle number. */
    readonly caption: string;
    readonly linkLabel: string;
  };
  readonly stepByStep: HowItWorksStepByStepContent;
  readonly proTips: HowItWorksProTipsContent;
  readonly callToAction: {
    readonly heading: string;
    readonly body: string;
    readonly primaryCtaLabel: string;
    readonly faqCtaLabel: string;
    readonly discordCtaLabel: string;
    readonly twitterCtaLabel: string;
  };
};
