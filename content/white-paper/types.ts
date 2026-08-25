export const WHITE_PAPER_PATH = '/white-paper';

export const WHITE_PAPER_VERSION = '1.0';

/** ISO date of this version of the paper. */
export const WHITE_PAPER_DATE_ISO = '2026-08-24';

/** Human-readable date shown on the title block and the PDF cover. */
export const WHITE_PAPER_DATE_DISPLAY = 'August 2026';

/**
 * The committed, versioned PDF artifacts under `public/`. Regenerate with
 * `npm run white-paper:pdf` whenever a content module changes, and bump
 * WHITE_PAPER_VERSION for substantive revisions.
 */
export const WHITE_PAPER_PDF_PATH =
  `/white-paper/cosmic-signature-white-paper-v${WHITE_PAPER_VERSION}.pdf` as const;

export const WHITE_PAPER_PDF_PATH_ZH =
  `/white-paper/cosmic-signature-white-paper-v${WHITE_PAPER_VERSION}-zh.pdf` as const;

export interface WhitePaperTable {
  readonly columns: readonly string[];
  readonly rows: ReadonlyArray<readonly string[]>;
  /** Small print rendered under the table. */
  readonly footnote?: string;
}

export type WhitePaperBlock =
  | { readonly kind: 'paragraph'; readonly text: string }
  | { readonly kind: 'list'; readonly items: readonly string[] }
  | { readonly kind: 'table'; readonly table: WhitePaperTable }
  | { readonly kind: 'formula'; readonly formula: string; readonly caption?: string }
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
    readonly downloadHref: typeof WHITE_PAPER_PDF_PATH | typeof WHITE_PAPER_PDF_PATH_ZH;
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
}
