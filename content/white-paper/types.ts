import type { AppLocale } from '@/i18n/locale';
import { routing } from '@/i18n/routing';

export const WHITE_PAPER_PATH = '/white-paper';

export const WHITE_PAPER_VERSION = '1.0';

/** ISO date of this version of the paper. */
export const WHITE_PAPER_DATE_ISO = '2026-08-24';

/** Human-readable date shown on the title block and the PDF cover. */
export const WHITE_PAPER_DATE_DISPLAY = 'August 2026';

/**
 * The committed, versioned PDF artifacts under `public/`, one per locale:
 * the default locale is unsuffixed, every other locale carries its code
 * (`…-v1.0-zh.pdf`, `…-v1.0-uk.pdf`). Regenerate with `npm run white-paper:pdf`
 * whenever a content module changes, and bump WHITE_PAPER_VERSION for
 * substantive revisions.
 */
export function whitePaperPdfPath(locale: AppLocale): string {
  const suffix = locale === routing.defaultLocale ? '' : `-${locale}`;
  return `/white-paper/cosmic-signature-white-paper-v${WHITE_PAPER_VERSION}${suffix}.pdf`;
}

/** English (default-locale) PDF path, kept for call sites that only cite the original. */
export const WHITE_PAPER_PDF_PATH = whitePaperPdfPath(routing.defaultLocale);

export interface WhitePaperTable {
  readonly columns: readonly string[];
  readonly rows: ReadonlyArray<readonly string[]>;
  /** Small print rendered under the table. */
  readonly footnote?: string;
}

/** One symbol of a formula's plain notation and what it stands for. */
export interface WhitePaperFormulaSymbol {
  readonly symbol: string;
  readonly meaning: string;
}

/** Chrome of the web edition: wayfinding, block labels and the reading-time line. */
export interface WhitePaperReadingCopy {
  /** Accessible name of the sticky contents rail ("On this page"). */
  readonly railLabel: string;
  /** The floating button that opens the contents on phones. */
  readonly openContentsLabel: string;
  readonly backToTopLabel: string;
  /** `{title}` placeholder: the accessible name of a heading's anchor link. */
  readonly headingLinkTemplate: string;
  readonly formulaLabel: string;
  readonly noteLabel: string;
  /** Summary of the disclosure that shows a formula as the contracts write it. */
  readonly contractExpressionLabel: string;
  /** `{number}` placeholder: a figure's label ("Figure 1"). */
  readonly figureTemplate: string;
  /** `{minutes}` placeholder. */
  readonly readingTimeTemplate: string;
  /** Visually hidden after a link that opens a new tab. */
  readonly newTabNote: string;
}

/** One stage of the cycle timeline figure. */
export interface WhitePaperTimelineStep {
  readonly label: string;
  readonly detail: string;
}

/** Copy of the web edition's figures (the PDF has none). */
export interface WhitePaperFiguresCopy {
  /** §3: a cycle from its opening to the next one, in five stages. */
  readonly cycle: {
    readonly title: string;
    readonly caption: string;
    readonly steps: readonly [
      WhitePaperTimelineStep,
      WhitePaperTimelineStep,
      WhitePaperTimelineStep,
      WhitePaperTimelineStep,
      WhitePaperTimelineStep,
    ];
  };
  /** §5.1: the ETH split as one bar; its track names come from the section's table. */
  readonly allocation: {
    readonly title: string;
    readonly caption: string;
  };
  /** §6: finished Signatures on their plates. */
  readonly art: {
    readonly title: string;
    readonly caption: string;
    readonly seedLabel: string;
  };
}

export type WhitePaperBlock =
  | { readonly kind: 'paragraph'; readonly text: string }
  | { readonly kind: 'list'; readonly items: readonly string[] }
  | { readonly kind: 'table'; readonly table: WhitePaperTable }
  | {
      readonly kind: 'formula';
      /** The expression as written in the contracts; the PDF prints it as is. */
      readonly formula: string;
      readonly caption?: string;
      /**
       * The same rule in plain notation with neutral symbols, which the web
       * page shows first (the contract expression stays one click away).
       */
      readonly notation?: string;
      /** What each symbol of `notation` stands for. */
      readonly legend?: readonly WhitePaperFormulaSymbol[];
    }
  /** A boxed aside for disclaimers and similar small print. */
  | { readonly kind: 'note'; readonly text: string };

export interface WhitePaperSubsection {
  readonly id: string;
  readonly number: string;
  readonly heading: string;
  readonly blocks: readonly WhitePaperBlock[];
}

export interface WhitePaperSection {
  readonly id: string;
  readonly number: string;
  readonly heading: string;
  readonly blocks: readonly WhitePaperBlock[];
  readonly subsections?: readonly WhitePaperSubsection[];
}

export interface WhitePaperReference {
  readonly label: string;
  readonly href: string;
}

export interface WhitePaperContent {
  readonly metadata: {
    readonly title: string;
    readonly description: string;
    readonly path: typeof WHITE_PAPER_PATH;
  };
  readonly breadcrumbLabel: string;
  readonly breadcrumbs: {
    readonly ariaLabel: string;
    readonly homeLabel: string;
  };
  readonly hero: {
    readonly eyebrow: string;
    readonly title: string;
    readonly subtitle: string;
    readonly authorName: string;
    readonly authorEmail: string;
    readonly versionLabel: string;
    readonly dateLabel: string;
    readonly downloadLabel: string;
    /** Locale's PDF path — derived from the locale, never written in copy. */
    readonly downloadHref: string;
  };
  readonly abstract: {
    readonly heading: string;
    readonly paragraphs: readonly string[];
  };
  readonly tocHeading: string;
  readonly sections: readonly WhitePaperSection[];
  readonly references: {
    readonly id: string;
    readonly heading: string;
    readonly items: readonly WhitePaperReference[];
  };
  readonly citation: string;
  readonly licenseNote: string;
  readonly reading: WhitePaperReadingCopy;
  readonly figures: WhitePaperFiguresCopy;
}
