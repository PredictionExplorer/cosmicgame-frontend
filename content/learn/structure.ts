import { LEGAL_LINKS } from '@/content/legal/links';

import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';
import { APP_ORIGIN, LANDING_ORIGIN } from '@/lib/hostRouting';

import type {
  LearnArticleUi,
  LearnFigure,
  LearnGroupCopy,
  LearnGroupId,
  LearnSection,
} from './types';

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
  /**
   * The guide's stage on the reading path. Articles are listed in reading
   * order, so each stage's guides are consecutive.
   */
  readonly group: LearnGroupId;
  /** The Signature that opens the guide: a token id in components/reading/signaturePlates. */
  readonly plate: number;
  /** Related-resource link targets; the page names each after its destination. */
  readonly related: readonly string[];
  /** Figures drawn inside the guide's sections (./types.ts `LearnFigureKind`). */
  readonly figures?: readonly LearnFigure[];
}

/**
 * The pages a guide's prose may link to inline. A section paragraph writes
 * `[label](key)` and the page links `label` to the target `key` names
 * (content/learn/links.ts), so the eight text modules name a page without
 * repeating its URL, and a locale cannot link anywhere else.
 */
export const LEARN_LINK_TARGETS = {
  contracts: appLink('/contracts'),
  code: appLink('/code'),
  audits: appLink('/audits'),
  security: appLink('/security'),
  statistics: appLink('/statistics'),
  riskDisclosures: appLink('/risk-disclosures'),
  // Evidence published elsewhere, opened in a new tab: the Trust Center's own links.
  explorer: LEGAL_LINKS.explorer.href,
  sourcify: LEGAL_LINKS.sourcify.href,
  contractsRepository: LEGAL_LINKS.contractsRepository.href,
  hackenReport: LEGAL_LINKS.hacken.href,
} as const;

export type LearnLinkTarget = keyof typeof LEARN_LINK_TARGETS;

export const LEARN_STRUCTURE = {
  hub: {
    quizCtaHref: '/quiz',
  },
  articles: [
    {
      slug: 'what-is-cosmic-signature',
      schemaType: 'Article',
      updated: '2026-06-24',
      group: 'start',
      plate: 13,
      related: [APP_ORIGIN, appLink('/faq'), appLink('/statistics')],
    },
    {
      slug: 'how-the-performance-cycle-works',
      schemaType: 'TechArticle',
      updated: '2026-06-24',
      group: 'start',
      plate: 22,
      related: [appLink('/current-cycle'), appLink('/allocation'), appLink('/faq')],
      figures: [
        { kind: 'cycleTimeline', section: 0 },
        { kind: 'allocation', section: 1 },
      ],
    },
    {
      slug: 'how-gestures-work',
      schemaType: 'Article',
      updated: '2026-06-24',
      group: 'start',
      plate: 14,
      related: [
        APP_ORIGIN,
        `${LANDING_ORIGIN}/learn/how-the-performance-cycle-works`,
        appLink('/current-cycle'),
      ],
      figures: [{ kind: 'cycleTimeline', section: 0 }],
    },
    {
      slug: 'three-body-nft-art',
      schemaType: 'TechArticle',
      updated: '2026-06-24',
      group: 'start',
      plate: 3,
      related: [appLink('/gallery'), appLink('/code'), appLink('/contracts')],
      figures: [{ kind: 'seedPlates', section: 0 }],
    },
    {
      slug: 'cosmic-signature-on-arbitrum',
      schemaType: 'Article',
      updated: '2026-06-24',
      group: 'mechanics',
      plate: 33,
      related: [appLink('/contracts'), appLink('/statistics')],
    },
    {
      slug: 'contracts-security-verification',
      schemaType: 'TechArticle',
      updated: '2026-09-25',
      group: 'mechanics',
      plate: 7,
      related: [appLink('/contracts'), appLink('/audits'), appLink('/security')],
      figures: [{ kind: 'contracts', section: 0 }],
    },
    {
      slug: 'cst-token-and-cosmic-council',
      schemaType: 'Article',
      updated: '2026-06-24',
      group: 'mechanics',
      plate: 11,
      related: [`${LANDING_ORIGIN}/learn/how-gestures-work`, APP_ORIGIN],
    },
    {
      slug: 'anchoring-nfts',
      schemaType: 'Article',
      updated: '2026-05-25',
      group: 'mechanics',
      plate: 39,
      related: [appLink('/anchoring'), appLink('/gallery')],
      figures: [{ kind: 'allocation', section: 0 }],
    },
    {
      slug: 'protocol-guild-public-goods',
      schemaType: 'Article',
      updated: '2026-05-25',
      group: 'context',
      plate: 40,
      related: [
        appLink('/public-goods-contributions-cg'),
        `${LANDING_ORIGIN}/learn/how-the-performance-cycle-works`,
      ],
      figures: [{ kind: 'allocation', section: 1 }],
    },
    {
      slug: 'collecting-and-trading-cosmic-signature',
      schemaType: 'Article',
      updated: '2026-07-06',
      group: 'context',
      plate: 25,
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
      group: 'context',
      plate: 9,
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

/** Copy for one learn article, provided per locale. */
type LearnArticleText = {
  readonly title: string;
  readonly description: string;
  readonly h1: string;
  /** A short title for the hub's cards, without the brand name. */
  readonly cardTitle: string;
  /**
   * The card's one line (at most 90 characters, no brand name): what the
   * reader finds in the guide. `description` stays the search snippet.
   */
  readonly cardDescription: string;
  readonly summary: string;
  /**
   * Sections stay fully in the text modules because their count may differ
   * per locale; a figure names its section by index, so a translation keeps
   * the illustrated section in the same place.
   */
  readonly sections: readonly LearnSection[];
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
    readonly h1: string;
    readonly intro: string;
    readonly breadcrumbs: {
      readonly homeLabel: string;
      readonly learnLabel: string;
    };
    readonly groups: Readonly<Record<LearnGroupId, LearnGroupCopy>>;
    readonly whitePaper: {
      readonly eyebrow: string;
      readonly readLabel: string;
    };
    readonly quizCta: {
      readonly heading: string;
      readonly body: string;
      readonly linkLabel: string;
    };
  };
  readonly articleUi: LearnArticleUi;
  readonly articles: {
    readonly [Article in LearnArticleStructureItem as Article['slug']]: LearnArticleText;
  };
};
