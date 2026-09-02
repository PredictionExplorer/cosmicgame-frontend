import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';
import { APP_ORIGIN, LANDING_ORIGIN } from '@/lib/hostRouting';

import type { LearnArticleUi, LearnSection } from './types';

/**
 * The locale-independent skeleton of the learn hub.
 *
 * Article order, slugs (public URLs), schema types, `updated` dates, and
 * related-link targets are declared once here; the per-locale text modules
 * (`text.en.ts`, `text.zh.ts`) provide only copy, keyed by these slugs. A
 * translation that misses or invents a slug fails to compile.
 *
 * `updated` dates live here because they are byte-identical across locales
 * today; if a translation ever needs its own date, move that field into the
 * text modules.
 */

const appLink = (path: string) => `${APP_ORIGIN}${path}`;

interface LearnArticleStructure {
  readonly slug: string;
  readonly schemaType: 'Article' | 'TechArticle';
  readonly updated: string;
  /** Related-resource link targets; labels come from the text modules. */
  readonly related: readonly string[];
}

export const LEARN_STRUCTURE = {
  hub: {
    quizCtaHref: '/quiz',
  },
  articles: [
    {
      slug: 'what-is-cosmic-signature',
      schemaType: 'Article',
      updated: '2026-06-24',
      related: [APP_ORIGIN, appLink('/faq'), appLink('/statistics')],
    },
    {
      slug: 'how-the-performance-cycle-works',
      schemaType: 'TechArticle',
      updated: '2026-06-24',
      related: [appLink('/current-cycle'), appLink('/allocation'), appLink('/faq')],
    },
    {
      slug: 'how-gestures-work',
      schemaType: 'Article',
      updated: '2026-06-24',
      related: [
        APP_ORIGIN,
        `${LANDING_ORIGIN}/learn/how-the-performance-cycle-works`,
        appLink('/current-cycle'),
      ],
    },
    {
      slug: 'three-body-nft-art',
      schemaType: 'TechArticle',
      updated: '2026-06-24',
      related: [appLink('/gallery'), appLink('/code'), appLink('/contracts')],
    },
    {
      slug: 'cosmic-signature-on-arbitrum',
      schemaType: 'Article',
      updated: '2026-06-24',
      related: [appLink('/contracts'), appLink('/statistics')],
    },
    {
      slug: 'contracts-security-verification',
      schemaType: 'TechArticle',
      updated: '2026-06-24',
      related: [appLink('/contracts'), appLink('/code'), appLink('/faq')],
    },
    {
      slug: 'cst-token-and-cosmic-council',
      schemaType: 'Article',
      updated: '2026-06-24',
      related: [`${LANDING_ORIGIN}/learn/how-gestures-work`, APP_ORIGIN],
    },
    {
      slug: 'anchoring-nfts',
      schemaType: 'Article',
      updated: '2026-05-25',
      related: [appLink('/anchoring'), appLink('/gallery')],
    },
    {
      slug: 'protocol-guild-public-goods',
      schemaType: 'Article',
      updated: '2026-05-25',
      related: [
        appLink('/public-goods-contributions-cg'),
        `${LANDING_ORIGIN}/learn/how-the-performance-cycle-works`,
      ],
    },
    {
      slug: 'collecting-and-trading-cosmic-signature',
      schemaType: 'Article',
      updated: '2026-07-06',
      related: [
        COSMIC_SIGNATURE_MARKETPLACE_URL,
        CHAOS_ZERO_PREDICTIONS_URL,
        CST_UNISWAP_SWAP_URL,
        appLink('/contracts'),
        appLink('/gallery'),
      ],
    },
    // lexicon-allow-start — legacy public URL slug for the denial article is immutable.
    {
      slug: 'not-a-lottery-not-an-investment',
      schemaType: 'Article',
      updated: '2026-05-25',
      related: [appLink('/terms'), appLink('/faq')],
    },
    // lexicon-allow-end
  ],
} as const satisfies {
  readonly hub: { readonly quizCtaHref: string };
  readonly articles: readonly LearnArticleStructure[];
};

type LearnStructure = typeof LEARN_STRUCTURE;
type LearnArticleStructureItem = LearnStructure['articles'][number];

export type LearnSlug = LearnArticleStructureItem['slug'];

/** Maps a tuple of link targets to a same-length tuple of labels. */
type LabelsFor<Links extends readonly unknown[]> = {
  readonly [Index in keyof Links]: string;
};

/** Copy for one learn article, provided per locale. */
type LearnArticleText<Article extends LearnArticleStructureItem> = {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  readonly summary: string;
  /**
   * Sections stay fully in the text modules because their count legitimately
   * differs per locale (the English answerability appendix is longer than the
   * Chinese one).
   */
  readonly sections: readonly LearnSection[];
  /** Labels for the skeleton's related links, in the same order. */
  readonly relatedLabels: LabelsFor<Article['related']>;
};

/**
 * The complete learn copy for one locale, keyed by the skeleton's slugs so
 * the compiler rejects missing or extra translations.
 */
export type LearnText = {
  readonly hub: {
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
    readonly quizCta: {
      readonly heading: string;
      readonly body: string;
      readonly linkLabel: string;
    };
  };
  readonly articleUi: LearnArticleUi;
  readonly articles: {
    readonly [Article in LearnArticleStructureItem as Article['slug']]: LearnArticleText<Article>;
  };
};
