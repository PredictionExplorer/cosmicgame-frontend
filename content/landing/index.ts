import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

import { LANDING_STRUCTURE, type LandingStageText, type LandingText } from './structure';
import { landingTextEn } from './text.en';
import { landingTextZh } from './text.zh';
import type { LandingContent, LandingFooterColumn, LandingTrackItem } from './types';

export * from './types';
export * from './structure';

/** Composes the locale-independent skeleton with one locale's copy. */
function buildLandingContent(text: LandingText): LandingContent {
  // Parity is enforced by LandingText's literal keys; the builder itself only
  // needs plain string lookups.
  const cycleStageTexts = text.cycle.stages as Readonly<Record<string, LandingStageText>>;
  const artStageTexts = text.art.stages as Readonly<Record<string, LandingStageText>>;
  const artFactTexts = text.art.facts as Readonly<Record<string, { label: string }>>;
  const trackItemTexts = text.tracks.items as Readonly<
    Record<string, { percent?: string; title: string; body: string }>
  >;
  const tableRowTexts = text.publicGoods.card.tableRows as Readonly<
    Record<string, { label: string; value?: string }>
  >;
  const footerColumnTexts = text.footer.columns as Readonly<
    Record<string, { heading: string; links: Readonly<Record<string, string>> }>
  >;

  return {
    meta: text.meta,
    hero: {
      eyebrow: text.hero.eyebrow,
      headline: text.hero.headline,
      headlineLead: text.hero.headlineLead,
      headlineAccent: text.hero.headlineAccent,
      subhead: text.hero.subhead,
      biologyDisclaimer: text.hero.biologyDisclaimer,
      primaryCta: { label: text.hero.primaryCtaLabel, href: LANDING_STRUCTURE.hero.primaryCtaHref },
      secondaryCta: {
        label: text.hero.secondaryCtaLabel,
        href: LANDING_STRUCTURE.hero.secondaryCtaHref,
      },
      statisticsCta: {
        label: text.hero.statisticsCtaLabel,
        href: LANDING_STRUCTURE.hero.statisticsCtaHref,
      },
      galleryCta: { label: text.hero.galleryCtaLabel, href: LANDING_STRUCTURE.hero.galleryCtaHref },
      scrollAriaLabel: text.hero.scrollAriaLabel,
      marqueeChips: text.hero.marqueeChips,
      art: text.hero.art,
    },
    cycle: {
      eyebrow: text.cycle.eyebrow,
      heading: text.cycle.heading,
      description: text.cycle.description,
      stages: LANDING_STRUCTURE.cycle.stages.map((stage) => ({
        number: stage.number,
        ...cycleStageTexts[stage.id]!,
      })),
    },
    art: {
      eyebrow: text.art.eyebrow,
      heading: text.art.heading,
      description: text.art.description,
      loading: text.art.loading,
      showcase: text.art.showcase,
      stageLabel: text.art.stageLabel,
      stages: LANDING_STRUCTURE.art.stages.map((stage) => ({
        number: stage.number,
        ...artStageTexts[stage.id]!,
      })),
      facts: LANDING_STRUCTURE.art.facts.map((fact) => ({
        label: artFactTexts[fact.id]!.label,
        value: fact.value,
      })),
    },
    tracks: {
      eyebrow: text.tracks.eyebrow,
      heading: text.tracks.heading,
      description: text.tracks.description,
      cardLabel: text.tracks.cardLabel,
      items: LANDING_STRUCTURE.tracks.items.map((item): LandingTrackItem => {
        const itemText = trackItemTexts[item.id]!;
        return {
          percent: 'percent' in item ? item.percent : itemText.percent!,
          title: itemText.title,
          body: itemText.body,
          tone: item.tone,
        };
      }),
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
    council: text.council,
    verifiability: text.verifiability,
    faq: text.faq,
    footer: {
      brandName: text.footer.brandName,
      logoAlt: text.footer.logoAlt,
      tagline: text.footer.tagline,
      columns: LANDING_STRUCTURE.footer.columns.map((column): LandingFooterColumn => {
        const columnText = footerColumnTexts[column.id]!;
        return {
          heading: columnText.heading,
          links: column.links.map((link) => ({
            label: columnText.links[link.id]!,
            href: link.href,
          })),
        };
      }),
      copyright: text.footer.copyright,
      colophon: text.footer.colophon,
    },
    notFound: {
      code: LANDING_STRUCTURE.notFound.code,
      heading: text.notFound.heading,
      description: text.notFound.description,
      cta: { label: text.notFound.ctaLabel, href: LANDING_STRUCTURE.notFound.ctaHref },
    },
  };
}

export const landingContentEn: LandingContent = buildLandingContent(landingTextEn);
export const landingContentZh: LandingContent = buildLandingContent(landingTextZh);

const LANDING_CONTENT: LocaleRecord<LandingContent> = {
  en: landingContentEn,
  zh: landingContentZh,
};

export function getLandingContent(locale: string): LandingContent {
  return pickByLocale(LANDING_CONTENT, locale);
}
