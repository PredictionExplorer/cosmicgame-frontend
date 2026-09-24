import type { LearnSlug } from './structure';

export interface LearnSection {
  readonly heading: string;
  readonly body: readonly string[];
}

export interface LearnRelatedLink {
  readonly label: string;
  readonly href: string;
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
  readonly related: readonly LearnRelatedLink[];
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
  readonly relatedResourcesHeading: string;
  /** Accessible name of the closing aside that holds the reference notes. */
  readonly appendixLabel: string;
  /** Heading of the links to the app pages where a reader checks the guide. */
  readonly verifyLinksLabel: string;
  /**
   * Reference notes shared by every guide (how to verify, further reading):
   * kept for readers and answer engines, rendered as a quiet aside after the
   * guide rather than as more of its sections.
   */
  readonly appendix: readonly LearnSection[];
}

export interface LearnContent {
  readonly hub: LearnHubContent;
  readonly articleUi: LearnArticleUi;
  readonly articles: readonly LearnArticle[];
}
