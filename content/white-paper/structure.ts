import { WHITE_PAPER_VERSION, type WhitePaperBlock, type WhitePaperReference } from './types';

/**
 * The locale-independent skeleton of the white paper.
 *
 * Section order, numbers, IDs, and each section's block-kind sequence are
 * declared once here; the per-locale text modules (`text.en.ts`, `text.zh.ts`)
 * provide only copy, keyed by these IDs. A translation that misses or invents
 * a section, or that changes a block's kind or position, fails to compile.
 *
 * Section and subsection IDs are public URL fragments (`/white-paper#<id>`);
 * quiz references and external backlinks depend on them, so they must never
 * change.
 */

export type WhitePaperBlockKind = WhitePaperBlock['kind'];

export interface WhitePaperSubsectionStructure {
  readonly id: string;
  readonly number: string;
  readonly blocks: readonly WhitePaperBlockKind[];
}

export interface WhitePaperSectionStructure extends WhitePaperSubsectionStructure {
  readonly subsections?: readonly WhitePaperSubsectionStructure[];
}

export const WHITE_PAPER_STRUCTURE = [
  {
    id: 'introduction',
    number: '1',
    blocks: ['paragraph', 'paragraph', 'paragraph', 'list', 'paragraph'],
  },
  {
    id: 'protocol-overview',
    number: '2',
    blocks: ['paragraph', 'table', 'paragraph'],
  },
  {
    id: 'performance-cycle',
    number: '3',
    blocks: ['paragraph'],
    subsections: [
      { id: 'eth-calibration-window', number: '3.1', blocks: ['paragraph', 'paragraph'] },
      { id: 'countdown', number: '3.2', blocks: ['paragraph', 'paragraph'] },
      { id: 'finalization', number: '3.3', blocks: ['paragraph', 'paragraph', 'paragraph'] },
    ],
  },
  {
    id: 'gestures',
    number: '4',
    blocks: ['paragraph'],
    subsections: [
      { id: 'eth-gestures', number: '4.1', blocks: ['paragraph'] },
      { id: 'random-walk-attachment', number: '4.2', blocks: ['paragraph'] },
      {
        id: 'cst-gestures',
        number: '4.3',
        blocks: ['paragraph', 'paragraph', 'paragraph', 'paragraph'],
      },
      { id: 'messages-and-attachments', number: '4.4', blocks: ['paragraph'] },
    ],
  },
  {
    id: 'allocation-tracks',
    number: '5',
    blocks: ['paragraph'],
    subsections: [
      {
        id: 'distribution-at-finalization',
        number: '5.1',
        blocks: ['table', 'paragraph', 'table', 'paragraph'],
      },
      { id: 'endurance-and-chrono', number: '5.2', blocks: ['paragraph', 'paragraph'] },
      {
        id: 'stellar-selections',
        number: '5.3',
        blocks: ['paragraph', 'paragraph', 'paragraph'],
      },
      { id: 'delivery-and-timeouts', number: '5.4', blocks: ['paragraph', 'paragraph'] },
    ],
  },
  {
    id: 'the-art',
    number: '6',
    blocks: ['paragraph', 'paragraph'],
    subsections: [
      { id: 'art-pipeline', number: '6.1', blocks: ['list', 'paragraph'] },
      {
        id: 'reproducibility-and-license',
        number: '6.2',
        blocks: ['paragraph', 'paragraph'],
      },
    ],
  },
  {
    id: 'cst',
    number: '7',
    blocks: ['paragraph'],
    subsections: [
      {
        id: 'imprint-rules',
        number: '7.1',
        blocks: ['paragraph', 'formula', 'paragraph', 'table'],
      },
      { id: 'supply-dynamics', number: '7.2', blocks: ['paragraph', 'paragraph'] },
      { id: 'coordination-weight', number: '7.3', blocks: ['paragraph'] },
    ],
  },
  {
    id: 'anchoring',
    number: '8',
    blocks: ['paragraph', 'paragraph', 'paragraph'],
  },
  {
    id: 'cosmic-council',
    number: '9',
    blocks: ['paragraph', 'paragraph', 'paragraph'],
  },
  {
    id: 'public-goods',
    number: '10',
    blocks: ['paragraph', 'paragraph', 'note'],
  },
  {
    id: 'security',
    number: '11',
    blocks: [],
    subsections: [
      {
        id: 'independent-review',
        number: '11.1',
        blocks: ['paragraph', 'paragraph', 'paragraph'],
      },
      { id: 'defensive-design', number: '11.2', blocks: ['list'] },
      { id: 'randomness', number: '11.3', blocks: ['paragraph', 'paragraph'] },
      { id: 'open-verification', number: '11.4', blocks: ['paragraph'] },
    ],
  },
  {
    id: 'upgrade-history',
    number: '12',
    blocks: ['paragraph'],
    subsections: [
      { id: 'v1', number: '12.1', blocks: ['paragraph'] },
      { id: 'v2', number: '12.2', blocks: ['paragraph', 'list'] },
      { id: 'v3', number: '12.3', blocks: ['paragraph', 'formula', 'paragraph', 'paragraph'] },
    ],
  },
  {
    id: 'decentralization',
    number: '13',
    blocks: ['paragraph', 'paragraph', 'paragraph', 'paragraph', 'paragraph'],
  },
  {
    id: 'clarifications',
    number: '14',
    blocks: [],
    subsections: [
      { id: 'what-it-is-not', number: '14.1', blocks: ['paragraph', 'paragraph'] },
      { id: 'risk-factors', number: '14.2', blocks: ['list'] },
    ],
  },
  {
    id: 'conclusion',
    number: '15',
    blocks: ['paragraph'],
  },
  {
    id: 'appendix-a',
    number: 'A',
    blocks: ['table'],
  },
  {
    id: 'appendix-b',
    number: 'B',
    blocks: ['table'],
  },
] as const satisfies readonly WhitePaperSectionStructure[];

type WpStructure = typeof WHITE_PAPER_STRUCTURE;

export type WhitePaperSectionId = WpStructure[number]['id'];

/** Anchor of the references list; a public URL fragment like the section IDs. */
export const WHITE_PAPER_REFERENCES_ID = 'references';

/**
 * Copy that is byte-identical in both locales, declared once and injected by
 * the builder in `index.ts`. Everything translated lives in the text modules.
 */
export const WHITE_PAPER_SHARED = {
  heroTitle: 'Cosmic Signature',
  authorName: 'Taras Bobrovytsky',
  authorEmail: 'taras@cosmicsignature.com',
  citation: `Bobrovytsky, T. (2026). Cosmic Signature: A Procedural On-Chain Art Protocol. Version ${WHITE_PAPER_VERSION}.`,
} as const;

type BlockOfKind<Kind extends WhitePaperBlockKind> = Extract<WhitePaperBlock, { kind: Kind }>;

/**
 * Maps a skeleton kind sequence to the tuple of matching block payloads, so
 * each locale must provide exactly the declared kinds, in the declared order.
 */
type WhitePaperBlocksText<Kinds extends readonly WhitePaperBlockKind[]> = {
  readonly [Index in keyof Kinds]: BlockOfKind<Kinds[Index] & WhitePaperBlockKind>;
};

interface WhitePaperHeadedBlocksText<Kinds extends readonly WhitePaperBlockKind[]> {
  readonly heading: string;
  readonly blocks: WhitePaperBlocksText<Kinds>;
}

type WhitePaperSubsectionsText<Subs extends readonly WhitePaperSubsectionStructure[]> = {
  readonly [Sub in Subs[number] as Sub['id']]: WhitePaperHeadedBlocksText<Sub['blocks']>;
};

type WhitePaperSectionText<Section extends WpStructure[number]> = WhitePaperHeadedBlocksText<
  Section['blocks']
> &
  (Section extends {
    readonly subsections: infer Subs extends readonly WhitePaperSubsectionStructure[];
  }
    ? { readonly subsections: WhitePaperSubsectionsText<Subs> }
    : unknown);

/**
 * The complete white-paper copy for one locale, keyed by the skeleton's
 * section and subsection IDs so the compiler rejects missing or extra
 * translations and mismatched block kinds. Genuinely locale-specific scalars
 * (the PDF path, the display date) also live here.
 */
export type WhitePaperText = {
  readonly metadata: {
    readonly title: string;
    readonly description: string;
  };
  readonly breadcrumbLabel: string;
  readonly breadcrumbs: {
    readonly ariaLabel: string;
    readonly homeLabel: string;
  };
  readonly hero: {
    readonly eyebrow: string;
    readonly subtitle: string;
    readonly versionLabel: string;
    readonly dateLabel: string;
    readonly downloadLabel: string;
  };
  readonly abstract: {
    readonly heading: string;
    readonly paragraphs: readonly string[];
  };
  readonly tocHeading: string;
  readonly sections: {
    readonly [Section in WpStructure[number] as Section['id']]: WhitePaperSectionText<Section>;
  };
  readonly references: {
    readonly heading: string;
    readonly items: readonly WhitePaperReference[];
  };
  readonly licenseNote: string;
};
