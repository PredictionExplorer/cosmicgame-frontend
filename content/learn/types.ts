export interface LearnSection {
  readonly heading: string;
  readonly body: readonly string[];
}

export interface LearnRelatedLink {
  readonly label: string;
  readonly href: string;
}

export interface LearnArticle {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly updated: string;
  readonly summary: string;
  readonly schemaType: 'Article' | 'TechArticle';
  readonly sections: readonly LearnSection[];
  readonly related: readonly LearnRelatedLink[];
}

export interface LearnHubContent {
  readonly meta: {
    readonly title: string;
    readonly description: string;
  };
  readonly eyebrow: string;
  readonly h1: string;
  readonly intro: string;
  readonly breadcrumbs: {
    readonly homeLabel: string;
    readonly learnLabel: string;
  };
  /** Cross-link to the knowledge quiz, rendered after the article grid. */
  readonly quizCta: {
    readonly heading: string;
    readonly body: string;
    readonly linkLabel: string;
    readonly href: string;
  };
}

export interface LearnArticleUi {
  readonly eyebrow: string;
  readonly breadcrumbs: {
    readonly ariaLabel: string;
    readonly homeLabel: string;
    readonly learnLabel: string;
  };
  readonly lastUpdatedLabel: string;
  readonly publisherLabel: string;
  readonly relatedResourcesHeading: string;
}

export interface LearnContent {
  readonly hub: LearnHubContent;
  readonly articleUi: LearnArticleUi;
  readonly articles: readonly LearnArticle[];
}
