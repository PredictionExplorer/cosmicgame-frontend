import type { LearnSlug } from './structure';

export interface LearnSection {
  readonly heading: string;
  readonly body: readonly string[];
  /**
   * A procedure the reader follows, set as numbered steps after the
   * paragraphs. Steps may carry `[label](key)` link tokens like the body.
   */
  readonly steps?: readonly string[];
}

/**
 * The figures a guide can carry, each drawn from parts the white paper
 * already uses, so a guide shows what it describes:
 * - `cycleTimeline`: the stages of a Performance Cycle.
 * - `allocation`: the ETH split of a Cycle Reserve, as a bar and its key.
 * - `seedPlates`: two Signatures, each captioned with the seed it renders from.
 * - `contracts`: the core contract addresses on Arbitrum One, each linked to the explorer.
 */
export type LearnFigureKind = 'cycleTimeline' | 'allocation' | 'seedPlates' | 'contracts';

export interface LearnFigure {
  readonly kind: LearnFigureKind;
  /** The section it illustrates (from 0): it follows that section's first paragraph. */
  readonly section: number;
}

/** The three stages of the reading path, in order. */
export const LEARN_GROUP_IDS = ['start', 'mechanics', 'context'] as const;

export type LearnGroupId = (typeof LEARN_GROUP_IDS)[number];

export interface LearnArticle {
  readonly slug: LearnSlug;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  /** A short title for the hub's cards, without the brand name. */
  readonly cardTitle: string;
  /** One line under the card title: what the reader finds, without the brand name. */
  readonly cardDescription: string;
  readonly updated: string;
  readonly summary: string;
  readonly schemaType: 'Article' | 'TechArticle';
  /** Where the guide sits on the reading path. */
  readonly group: LearnGroupId;
  /** The token id of the Signature that opens the guide (components/reading/signaturePlates). */
  readonly plate: number;
  readonly sections: readonly LearnSection[];
  /** The figures set inside the guide's sections, in reading order. */
  readonly figures: readonly LearnFigure[];
  /**
   * Link targets of the guide's related resources: app pages, other guides
   * and outside venues. The page names each one after its destination.
   */
  readonly related: readonly string[];
}

export interface LearnGroupCopy {
  readonly title: string;
  readonly description: string;
}

export interface LearnHubContent {
  readonly meta: {
    readonly title: string;
    readonly description: string;
  };
  readonly h1: string;
  readonly intro: string;
  readonly breadcrumbs: {
    readonly homeLabel: string;
    readonly learnLabel: string;
  };
  /** The reading path's stages. */
  readonly groups: Readonly<Record<LearnGroupId, LearnGroupCopy>>;
  /** The featured card that leads to the white paper. */
  readonly whitePaper: {
    readonly eyebrow: string;
    readonly readLabel: string;
  };
  /** Cross-link to the knowledge quiz, rendered after the reading path and every guide. */
  readonly quizCta: {
    readonly heading: string;
    readonly body: string;
    readonly linkLabel: string;
    readonly href: string;
  };
}

export interface LearnArticleUi {
  readonly breadcrumbs: {
    readonly homeLabel: string;
    readonly learnLabel: string;
  };
  /** `{number}` and `{total}` placeholders: the guide's place on the reading path. */
  readonly guideTemplate: string;
  /** `{minutes}` placeholder. */
  readonly readingTimeTemplate: string;
  readonly nextGuideLabel: string;
  readonly contents: {
    readonly heading: string;
    readonly railLabel: string;
    readonly openLabel: string;
    readonly backToTopLabel: string;
  };
  /** `{title}` placeholder: the accessible name of a heading's anchor link. */
  readonly headingLinkTemplate: string;
  /** Heading of the list of pages to read or check a guide against. */
  readonly relatedResourcesHeading: string;
  /** The contracts guide's address figure. */
  readonly contractsFigure: {
    readonly title: string;
    readonly caption: string;
  };
}

export interface LearnContent {
  readonly hub: LearnHubContent;
  readonly articleUi: LearnArticleUi;
  readonly articles: readonly LearnArticle[];
}
