import { ethDistributionFacts } from '@/content/protocol-facts';

import { CST_GECKOTERMINAL_POOL_URL } from '@/config/geckoterminal';
import { COSMIC_SIGNATURE_MARKETPLACE_URL } from '@/config/marketplace';
import { CHAOS_ZERO_PREDICTIONS_URL } from '@/config/predictions';
import { CST_UNISWAP_SWAP_URL } from '@/config/uniswap';
import { APP_ORIGIN } from '@/lib/hostRouting';

import type {
  LandingArtLoadingContent,
  LandingArtShowcaseContent,
  LandingCouncilContent,
  LandingFaqContent,
  LandingHeroArtContent,
  LandingMetaContent,
  LandingTrackTone,
  LandingVerifiabilityContent,
} from './types';

/**
 * The locale-independent skeleton of the landing content.
 *
 * Section order, stage numbers, tones, CTA/link targets, and locale-invariant
 * value strings (percents, fact values) are declared once here; the per-locale
 * text modules (`text.en.ts`, `text.zh.ts`) provide only copy, keyed by these
 * IDs. A translation that misses or invents an ID fails to compile.
 *
 * Percent/value strings live here ONLY when they are byte-identical across
 * locales. Anything locale-dependent (e.g. `~50%` vs `约 50%`, `10 NFTs` vs
 * `10 枚 NFT`, `on-chain` vs `链上`) stays in the text modules.
 */

interface LandingStageStructure {
  readonly id: string;
  readonly number: string;
}

interface LandingTrackItemStructure {
  readonly id: string;
  readonly tone: LandingTrackTone;
  /** Present only when the percent string is byte-identical across locales. */
  readonly percent?: string;
}

interface LandingArtFactStructure {
  readonly id: string;
  /**
   * Present only when the value string is byte-identical across locales.
   * Grouped numbers (1,000,000 vs 1 000 000) are locale-dependent and live in
   * the text modules.
   */
  readonly value?: string;
}

interface LandingTableRowStructure {
  readonly id: string;
  /** Present only when the value string is byte-identical across locales. */
  readonly value?: string;
}

interface LandingFooterLinkStructure {
  readonly id: string;
  readonly href: string;
}

interface LandingFooterColumnStructure {
  readonly id: string;
  readonly links: readonly LandingFooterLinkStructure[];
}

export const LANDING_STRUCTURE = {
  hero: {
    primaryCtaHref: APP_ORIGIN,
    secondaryCtaHref: '#cycle',
    statisticsCtaHref: `${APP_ORIGIN}/statistics`,
    galleryCtaHref: `${APP_ORIGIN}/gallery`,
  },
  cycle: {
    stages: [
      { id: 'opening', number: '01' },
      { id: 'gestures', number: '02' },
      { id: 'finalization', number: '03' },
      { id: 'allocations', number: '04' },
    ],
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
      { id: 'wavelength-bins', value: '64' },
      { id: 'physics-steps' },
      { id: 'candidate-orbits' },
      { id: 'license', value: 'CC0 1.0' },
    ],
  },
  tracks: {
    items: [
      {
        id: 'signature-allocation',
        tone: 'primary',
        percent: `${ethDistributionFacts.mainEthPercentage}%`,
      },
      { id: 'compounding-reserve', tone: 'aurora' },
      {
        id: 'chrono-warrior',
        tone: 'rose',
        percent: `${ethDistributionFacts.chronoWarriorEthPercentage}%`,
      },
      {
        id: 'public-goods',
        tone: 'impact',
        percent: `${ethDistributionFacts.publicGoodsPercentage}%`,
      },
      {
        id: 'anchor-distribution',
        tone: 'nebula',
        percent: `${ethDistributionFacts.anchorDistributionPercentage}%`,
      },
      {
        id: 'eth-stellar-selection',
        tone: 'solar',
        percent: `${ethDistributionFacts.stellarSelectionEthPercentage}%`,
      },
      { id: 'participant-nft-stellar-selection', tone: 'default' },
      { id: 'anchored-nft-stellar-selection', tone: 'default' },
      // The CST badge is a grouped number, so each locale formats it itself.
      { id: 'endurance-champion', tone: 'default' },
      { id: 'final-cst-gesture', tone: 'default' },
    ],
  },
  anchoring: {
    ctaHref: `${APP_ORIGIN}/anchoring`,
  },
  publicGoods: {
    cardPercentage: `${ethDistributionFacts.publicGoodsPercentage}%`,
    cardTableRows: [
      { id: 'contributors', value: '170+' },
      { id: 'enforcement' },
      { id: 'recipient', value: 'pg.eth' },
    ],
    ctaHref: 'https://protocol-guild.readthedocs.io',
  },
  footer: {
    columns: [
      {
        id: 'protocol',
        links: [
          { id: 'app', href: APP_ORIGIN },
          { id: 'about', href: '/about' },
          { id: 'learn', href: '/learn' },
          { id: 'quiz', href: '/quiz' },
          { id: 'how-it-works', href: `${APP_ORIGIN}/how-it-works` },
          { id: 'contracts', href: `${APP_ORIGIN}/contracts` },
          { id: 'code', href: `${APP_ORIGIN}/code` },
          { id: 'audits', href: `${APP_ORIGIN}/audits` },
        ],
      },
      {
        id: 'ecosystem',
        links: [
          { id: 'marketplace', href: COSMIC_SIGNATURE_MARKETPLACE_URL },
          { id: 'predictions', href: CHAOS_ZERO_PREDICTIONS_URL },
          { id: 'uniswap', href: CST_UNISWAP_SWAP_URL },
          { id: 'geckoterminal', href: CST_GECKOTERMINAL_POOL_URL },
        ],
      },
      {
        id: 'community',
        links: [
          { id: 'twitter', href: 'https://x.com/CosmicSignature' },
          { id: 'discord', href: 'https://discord.gg/bGnPn96Qwt' },
          { id: 'github', href: 'https://github.com/PredictionExplorer' },
          { id: 'protocol-guild', href: 'https://protocol-guild.readthedocs.io' },
        ],
      },
      {
        id: 'legal',
        links: [
          { id: 'terms', href: `${APP_ORIGIN}/terms` },
          { id: 'privacy', href: `${APP_ORIGIN}/privacy` },
          { id: 'faq', href: '#faq' },
        ],
      },
    ],
  },
  notFound: {
    code: '404',
    ctaHref: '/',
  },
} as const satisfies {
  readonly hero: {
    readonly primaryCtaHref: string;
    readonly secondaryCtaHref: string;
    readonly statisticsCtaHref: string;
    readonly galleryCtaHref: string;
  };
  readonly cycle: { readonly stages: readonly LandingStageStructure[] };
  readonly art: {
    readonly stages: readonly LandingStageStructure[];
    readonly facts: readonly LandingArtFactStructure[];
  };
  readonly tracks: { readonly items: readonly LandingTrackItemStructure[] };
  readonly anchoring: { readonly ctaHref: string };
  readonly publicGoods: {
    readonly cardPercentage: string;
    readonly cardTableRows: readonly LandingTableRowStructure[];
    readonly ctaHref: string;
  };
  readonly footer: { readonly columns: readonly LandingFooterColumnStructure[] };
  readonly notFound: { readonly code: string; readonly ctaHref: string };
};

type LandingStructure = typeof LANDING_STRUCTURE;

type CycleStageStructure = LandingStructure['cycle']['stages'][number];
type ArtStageStructure = LandingStructure['art']['stages'][number];
type ArtFactStructure = LandingStructure['art']['facts'][number];
type TrackItemStructure = LandingStructure['tracks']['items'][number];
type TableRowStructure = LandingStructure['publicGoods']['cardTableRows'][number];
type FooterColumnStructure = LandingStructure['footer']['columns'][number];

export type LandingCycleStageId = CycleStageStructure['id'];
export type LandingArtStageId = ArtStageStructure['id'];
export type LandingTrackId = TrackItemStructure['id'];

/** Copy for one numbered stage, provided per locale. */
export interface LandingStageText {
  readonly title: string;
  readonly body: string;
}

/**
 * Copy for one allocation track. The `percent` string is required here only
 * when the skeleton does not carry it (i.e. it differs across locales).
 */
type LandingTrackItemText<Item> = Item extends { readonly percent: string }
  ? { readonly title: string; readonly body: string }
  : { readonly percent: string; readonly title: string; readonly body: string };

/**
 * Copy for one public-goods table row. The `value` string is required here
 * only when the skeleton does not carry it (i.e. it differs across locales).
 */
type LandingTableRowText<Row> = Row extends { readonly value: string }
  ? { readonly label: string }
  : { readonly label: string; readonly value: string };

/** Copy for one art-pipeline fact; same rule as table rows. */
type LandingArtFactText<Fact> = Fact extends { readonly value: string }
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
    readonly biologyDisclaimer: string;
    readonly primaryCtaLabel: string;
    readonly secondaryCtaLabel: string;
    readonly statisticsCtaLabel: string;
    readonly galleryCtaLabel: string;
    readonly scrollAriaLabel: string;
    readonly marqueeChips: readonly string[];
    readonly art: LandingHeroArtContent;
  };
  readonly cycle: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly description: string;
    readonly stages: {
      readonly [Stage in CycleStageStructure as Stage['id']]: LandingStageText;
    };
  };
  readonly art: {
    readonly eyebrow: string;
    readonly heading: string;
    readonly description: string;
    readonly loading: LandingArtLoadingContent;
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
    readonly cardLabel: string;
    readonly items: {
      readonly [Item in TrackItemStructure as Item['id']]: LandingTrackItemText<Item>;
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
  readonly footer: {
    readonly brandName: string;
    readonly logoAlt: string;
    readonly tagline: string;
    readonly columns: {
      readonly [Column in FooterColumnStructure as Column['id']]: {
        readonly heading: string;
        readonly links: {
          readonly [Link in Column['links'][number] as Link['id']]: string;
        };
      };
    };
    readonly copyright: string;
    readonly colophon: string;
  };
  readonly notFound: {
    readonly heading: string;
    readonly description: string;
    readonly ctaLabel: string;
  };
};
