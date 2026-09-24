import { protocolFacts } from '@/content/protocol-facts';

import type { AllocationTrackId } from '@/config/allocationTracks';
import { APP_ORIGIN } from '@/lib/hostRouting';

import type {
  LandingArtFactId,
  LandingArtShowcaseContent,
  LandingCouncilContent,
  LandingFaqContent,
  LandingHeroArtContent,
  LandingMetaContent,
  LandingVerifiabilityContent,
} from './types';

/**
 * The locale-independent skeleton of the landing content.
 *
 * Section order, step numbers, allocation shares, link targets and
 * locale-invariant values are declared once here; the per-locale text modules
 * (`text.en.ts`, `text.zh.ts`, …) provide only copy, keyed by these IDs. A
 * translation that misses or invents an ID fails to compile.
 *
 * Values live here ONLY when they are byte-identical across locales or are
 * numbers the builder formats per locale (the ETH shares, from
 * content/protocol-facts.ts). Anything locale-dependent (`~50%` vs `约 50%`,
 * `10 NFTs` vs `10 枚 NFT`) stays in the text modules.
 */

interface LandingStageStructure {
  readonly id: string;
  readonly number: string;
}

interface LandingEthTrackStructure {
  readonly id: string;
  /** The track's colour and place in every chart of the split (config/allocationTracks). */
  readonly track: AllocationTrackId;
  /** Percent of the ETH reserve; absent for the remainder that compounds. */
  readonly share?: number;
}

interface LandingFixedTrackStructure {
  readonly id: string;
}

interface LandingArtFactStructure {
  readonly id: LandingArtFactId;
  /** Present only when the value string is byte-identical across locales. */
  readonly value?: string;
  /** Read from the collection on the page, never written in copy. */
  readonly live?: true;
}

interface LandingTableRowStructure {
  readonly id: string;
  /** Present only when the value string is byte-identical across locales. */
  readonly value?: string;
}

export const LANDING_STRUCTURE = {
  hero: {
    primaryCtaHref: APP_ORIGIN,
    secondaryCtaHref: '#cycle',
  },
  cycle: {
    steps: [
      { id: 'gesture', number: '01' },
      { id: 'extend', number: '02' },
      { id: 'finalize', number: '03' },
    ],
    // The app home's gesture panel carries the #make-gesture anchor.
    gestureCtaHref: `${APP_ORIGIN}/#make-gesture`,
    guideCtaHref: `${APP_ORIGIN}/how-it-works`,
  },
  art: {
    stages: [
      { id: 'seed', number: '01' },
      { id: 'simulation', number: '02' },
      { id: 'selection', number: '03' },
      { id: 'camera', number: '04' },
      { id: 'color', number: '05' },
      { id: 'spectral-render', number: '06' },
      { id: 'signature', number: '07' },
    ],
    facts: [
      { id: 'imprinted', live: true },
      // Every Signature renders at 3456 × 2234 (components/ui/art-frame, ART_WIDTH/HEIGHT).
      { id: 'resolution', value: '3456 × 2234' },
      { id: 'animation' },
      { id: 'license', value: 'CC0 1.0' },
    ],
  },
  tracks: {
    // In the order every chart of the split draws them (config/allocationTracks).
    eth: [
      { id: 'signature-allocation', track: 'signature', share: protocolFacts.mainEthPercentage },
      { id: 'chrono-warrior', track: 'chrono', share: protocolFacts.chronoWarriorEthPercentage },
      {
        id: 'eth-stellar-selection',
        track: 'stellar',
        share: protocolFacts.stellarSelectionEthPercentage,
      },
      {
        id: 'anchor-distribution',
        track: 'anchor',
        share: protocolFacts.anchorDistributionPercentage,
      },
      { id: 'public-goods', track: 'publicGoods', share: protocolFacts.publicGoodsPercentage },
      { id: 'compounding-reserve', track: 'nextCycle' },
    ],
    fixed: [
      { id: 'participant-nft-stellar-selection' },
      { id: 'anchored-nft-stellar-selection' },
      { id: 'endurance-champion' },
      { id: 'final-cst-gesture' },
    ],
  },
  anchoring: {
    ctaHref: `${APP_ORIGIN}/anchoring`,
  },
  publicGoods: {
    cardPercentage: `${protocolFacts.publicGoodsPercentage}%`,
    cardTableRows: [
      { id: 'contributors', value: '170+' },
      { id: 'enforcement' },
      { id: 'recipient', value: 'pg.eth' },
    ],
    ctaHref: 'https://protocol-guild.readthedocs.io',
  },
  closing: {
    galleryCtaHref: `${APP_ORIGIN}/gallery`,
  },
} as const satisfies {
  readonly hero: {
    readonly primaryCtaHref: string;
    readonly secondaryCtaHref: string;
  };
  readonly cycle: {
    readonly steps: readonly LandingStageStructure[];
    readonly gestureCtaHref: string;
    readonly guideCtaHref: string;
  };
  readonly art: {
    readonly stages: readonly LandingStageStructure[];
    readonly facts: readonly LandingArtFactStructure[];
  };
  readonly tracks: {
    readonly eth: readonly LandingEthTrackStructure[];
    readonly fixed: readonly LandingFixedTrackStructure[];
  };
  readonly anchoring: { readonly ctaHref: string };
  readonly publicGoods: {
    readonly cardPercentage: string;
    readonly cardTableRows: readonly LandingTableRowStructure[];
    readonly ctaHref: string;
  };
  readonly closing: { readonly galleryCtaHref: string };
};

type LandingStructure = typeof LANDING_STRUCTURE;

type CycleStepStructure = LandingStructure['cycle']['steps'][number];
type ArtStageStructure = LandingStructure['art']['stages'][number];
type ArtFactStructure = LandingStructure['art']['facts'][number];
type EthTrackStructure = LandingStructure['tracks']['eth'][number];
type FixedTrackStructure = LandingStructure['tracks']['fixed'][number];
type TableRowStructure = LandingStructure['publicGoods']['cardTableRows'][number];

export type LandingCycleStepId = CycleStepStructure['id'];
export type LandingArtStageId = ArtStageStructure['id'];
export type LandingTrackId = EthTrackStructure['id'] | FixedTrackStructure['id'];

/** Copy for one numbered stage or step, provided per locale. */
export interface LandingStageText {
  readonly title: string;
  readonly body: string;
}

/**
 * Copy for one allocation track. Tracks without a fixed share in the
 * skeleton write their own figure, because its wording differs across
 * locales: the compounding remainder its approximate `percent` ("~50%"),
 * each CST and NFT track its recipient count as `amount` ("10 recipients").
 */
type LandingTrackItemText<Item> = Item extends { readonly share: number }
  ? { readonly title: string; readonly body: string }
  : Item extends { readonly track: AllocationTrackId }
    ? { readonly percent: string; readonly title: string; readonly body: string }
    : { readonly amount: string; readonly title: string; readonly body: string };

/**
 * Copy for one public-goods table row. The `value` string is required here
 * only when the skeleton does not carry it (i.e. it differs across locales).
 */
type LandingTableRowText<Row> = Row extends { readonly value: string }
  ? { readonly label: string }
  : { readonly label: string; readonly value: string };

/** Copy for one art figure: a label, plus the value when neither live nor shared. */
type LandingArtFactText<Fact> = Fact extends { readonly value: string } | { readonly live: true }
  ? { readonly label: string }
  : { readonly label: string; readonly value: string };

/**
 * The complete landing copy for one locale, keyed by the skeleton's IDs so
 * the compiler rejects missing or extra translations.
 */
export type LandingText = {
  readonly meta: LandingMetaContent;
  readonly hero: {
    readonly eyebrow: string;
    readonly headline: string;
    readonly headlineLead: string;
    readonly headlineAccent: string;
    readonly subhead: string;
    readonly primaryCtaLabel: string;
    readonly secondaryCtaLabel: string;
    readonly art: LandingHeroArtContent;
  };
  readonly cycle: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly steps: {
      readonly [Step in CycleStepStructure as Step['id']]: LandingStageText;
    };
    readonly gestureCtaLabel: string;
    readonly guideCtaLabel: string;
  };
  readonly art: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly description: string;
    readonly showcase: LandingArtShowcaseContent;
    readonly stageLabel: string;
    readonly stages: {
      readonly [Stage in ArtStageStructure as Stage['id']]: LandingStageText;
    };
    readonly facts: {
      readonly [Fact in ArtFactStructure as Fact['id']]: LandingArtFactText<Fact>;
    };
  };
  readonly tracks: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly description: string;
    readonly ethLabel: string;
    readonly fixedLabel: string;
    readonly fixedEach: string;
    readonly items: {
      readonly [Item in
        | EthTrackStructure
        | FixedTrackStructure as Item['id']]: LandingTrackItemText<Item>;
    };
  };
  readonly anchoring: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly body: string;
    readonly bullets: readonly string[];
    readonly ctaLabel: string;
  };
  readonly publicGoods: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly body: string;
    readonly disclaimerHeading: string;
    readonly disclaimer: string;
    readonly card: {
      readonly label: string;
      readonly description: string;
      readonly tableRows: {
        readonly [Row in TableRowStructure as Row['id']]: LandingTableRowText<Row>;
      };
    };
    readonly ctaLabel: string;
  };
  readonly council: LandingCouncilContent;
  readonly verifiability: LandingVerifiabilityContent;
  readonly faq: LandingFaqContent;
  readonly closing: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly body: string;
  };
  readonly footer: {
    readonly tagline: string;
    readonly copyright: string;
    readonly colophon: string;
    readonly disambiguation: string;
  };
};
