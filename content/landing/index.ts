import { withNextCycleShare } from '@/config/allocationTracks';
import { pickByLocale, type AppLocale, type LocaleRecord } from '@/i18n/locale';
import { getLocaleConfig } from '@/i18n/localeConfig';
import { formatCount, formatPercent } from '@/utils/format/numbers';

import {
  LANDING_STRUCTURE,
  type LandingPluralText,
  type LandingStageText,
  type LandingText,
} from './structure';
import { landingTextEn } from './text.en';
import { landingTextJa } from './text.ja';
import { landingTextKo } from './text.ko';
import { landingTextUk } from './text.uk';
import { landingTextVi } from './text.vi';
import { landingTextZh } from './text.zh';
import { landingTextZhHk } from './text.zh-HK';
import { landingTextZhTw } from './text.zh-TW';
import type { LandingContent, LandingEthTrack, LandingFixedTrack } from './types';

export * from './types';
export * from './structure';

type TrackText = {
  readonly percent?: string;
  readonly title: string;
  readonly body: string;
};

/** A count in the locale's words: the plural form `Intl.PluralRules` picks, `{count}` formatted. */
export function pluralPhrase(template: LandingPluralText, count: number, locale: string): string {
  const category = new Intl.PluralRules(getLocaleConfig(locale).intlLocale).select(count);
  return (template[category] ?? template.other).replace('{count}', formatCount(count, locale));
}

/** Composes the locale-independent skeleton with one locale's copy. */
function buildLandingContent(text: LandingText, locale: AppLocale): LandingContent {
  // Parity is enforced by LandingText's literal keys; the builder itself only
  // needs plain string lookups.
  const stepTexts = text.cycle.steps as Readonly<Record<string, LandingStageText>>;
  const artStageTexts = text.art.stages as Readonly<Record<string, LandingStageText>>;
  const artFactTexts = text.art.facts as Readonly<
    Record<string, { label: string; value?: string }>
  >;
  const trackTexts = text.tracks.items as Readonly<Record<string, TrackText>>;
  const tableRowTexts = text.publicGoods.card.tableRows as Readonly<
    Record<string, { label: string; value?: string }>
  >;

  // The ETH shares come from protocol facts and the remainder that compounds
  // completes them to exactly 100%, the same rule as every chart of the split.
  const ethStructure = LANDING_STRUCTURE.tracks.eth;
  const shares = withNextCycleShare(
    ethStructure.flatMap((item) =>
      'share' in item ? [{ id: item.track, percent: item.share }] : [],
    ),
  );
  const eth = ethStructure.map((item): LandingEthTrack => {
    const itemText = trackTexts[item.id]!;
    const share = shares.find((entry) => entry.id === item.track)?.percent ?? 0;
    return {
      id: item.track,
      share,
      percent: 'share' in item ? formatPercent(item.share, locale) : itemText.percent!,
      title: itemText.title,
      body: itemText.body,
    };
  });
  const fixed = LANDING_STRUCTURE.tracks.fixed.map((item): LandingFixedTrack => {
    const itemText = trackTexts[item.id]!;
    return {
      id: item.id,
      amount: pluralPhrase(text.tracks.recipients, item.recipients, locale),
      title: itemText.title,
      body: itemText.body,
    };
  });
  const councilTexts = text.council.columns as Readonly<Record<string, LandingStageText>>;
  const pillarTexts = text.verifiability.pillars as Readonly<Record<string, LandingStageText>>;

  return {
    meta: text.meta,
    hero: {
      eyebrow: text.hero.eyebrow,
      headlineLead: text.hero.headlineLead,
      headlineAccent: text.hero.headlineAccent,
      subhead: text.hero.subhead,
      // The hero's commit action is The Cycle's: one label for the one action.
      primaryCta: {
        label: text.cycle.gestureCtaLabel,
        href: LANDING_STRUCTURE.hero.primaryCtaHref,
      },
      secondaryCta: {
        label: text.hero.secondaryCtaLabel,
        href: LANDING_STRUCTURE.hero.secondaryCtaHref,
      },
      art: text.hero.art,
    },
    cycle: {
      eyebrow: text.cycle.eyebrow,
      heading: text.cycle.heading,
      steps: LANDING_STRUCTURE.cycle.steps.map((step) => ({
        number: step.number,
        ...stepTexts[step.id]!,
      })),
      gestureCta: {
        label: text.cycle.gestureCtaLabel,
        href: LANDING_STRUCTURE.cycle.gestureCtaHref,
      },
      guideCta: { label: text.cycle.guideCtaLabel, href: LANDING_STRUCTURE.cycle.guideCtaHref },
    },
    art: {
      eyebrow: text.art.eyebrow,
      heading: text.art.heading,
      description: text.art.description,
      showcase: text.art.showcase,
      stageLabel: text.art.stageLabel,
      stages: LANDING_STRUCTURE.art.stages.map((stage) => ({
        number: stage.number,
        ...artStageTexts[stage.id]!,
      })),
      facts: LANDING_STRUCTURE.art.facts.map((fact) => ({
        id: fact.id,
        label: artFactTexts[fact.id]!.label,
        value: 'live' in fact ? null : 'value' in fact ? fact.value : artFactTexts[fact.id]!.value!,
      })),
    },
    tracks: {
      eyebrow: text.tracks.eyebrow,
      heading: text.tracks.heading,
      description: text.tracks.description,
      ethLabel: text.tracks.ethLabel,
      fixedLabel: text.tracks.fixedLabel,
      fixedEach: text.tracks.fixedEach,
      eth,
      fixed,
    },
    anchoring: {
      eyebrow: text.anchoring.eyebrow,
      heading: text.anchoring.heading,
      body: text.anchoring.body,
      bullets: text.anchoring.bullets,
      cta: { label: text.anchoring.ctaLabel, href: LANDING_STRUCTURE.anchoring.ctaHref },
    },
    publicGoods: {
      eyebrow: text.publicGoods.eyebrow,
      heading: text.publicGoods.heading,
      body: text.publicGoods.body,
      disclaimerHeading: text.publicGoods.disclaimerHeading,
      disclaimer: text.publicGoods.disclaimer,
      card: {
        label: text.publicGoods.card.label,
        percentage: LANDING_STRUCTURE.publicGoods.cardPercentage,
        description: text.publicGoods.card.description,
        tableRows: LANDING_STRUCTURE.publicGoods.cardTableRows.map((row) => {
          const rowText = tableRowTexts[row.id]!;
          return {
            label: rowText.label,
            value: 'value' in row ? row.value : rowText.value!,
          };
        }),
      },
      cta: { label: text.publicGoods.ctaLabel, href: LANDING_STRUCTURE.publicGoods.ctaHref },
    },
    council: {
      eyebrow: text.council.eyebrow,
      heading: text.council.heading,
      body: text.council.body,
      columns: LANDING_STRUCTURE.council.columns.map((column) => ({
        id: column.id,
        ...councilTexts[column.id]!,
      })),
    },
    verifiability: {
      eyebrow: text.verifiability.eyebrow,
      heading: text.verifiability.heading,
      body: text.verifiability.body,
      pillars: LANDING_STRUCTURE.verifiability.pillars.map((pillar) => ({
        id: pillar.id,
        ...pillarTexts[pillar.id]!,
      })),
      evidenceLabel: text.verifiability.evidenceLabel,
    },
    faq: text.faq,
    closing: {
      eyebrow: text.closing.eyebrow,
      heading: text.closing.heading,
      body: text.closing.body,
      gestureCta: {
        label: text.cycle.gestureCtaLabel,
        href: LANDING_STRUCTURE.cycle.gestureCtaHref,
      },
      galleryCta: {
        label: text.hero.art.galleryCta,
        href: LANDING_STRUCTURE.closing.galleryCtaHref,
      },
    },
  };
}

export const landingContentEn: LandingContent = buildLandingContent(landingTextEn, 'en');
export const landingContentZh: LandingContent = buildLandingContent(landingTextZh, 'zh');
export const landingContentZhTw: LandingContent = buildLandingContent(landingTextZhTw, 'zh-TW');
export const landingContentZhHk: LandingContent = buildLandingContent(landingTextZhHk, 'zh-HK');
export const landingContentUk: LandingContent = buildLandingContent(landingTextUk, 'uk');
export const landingContentKo: LandingContent = buildLandingContent(landingTextKo, 'ko');
export const landingContentJa: LandingContent = buildLandingContent(landingTextJa, 'ja');
export const landingContentVi: LandingContent = buildLandingContent(landingTextVi, 'vi');

const LANDING_CONTENT: LocaleRecord<LandingContent> = {
  en: landingContentEn,
  zh: landingContentZh,
  'zh-TW': landingContentZhTw,
  'zh-HK': landingContentZhHk,
  uk: landingContentUk,
  ko: landingContentKo,
  ja: landingContentJa,
  vi: landingContentVi,
};

export function getLandingContent(locale: string): LandingContent {
  return pickByLocale(LANDING_CONTENT, locale);
}
