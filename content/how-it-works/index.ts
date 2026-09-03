import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

import { HOW_IT_WORKS_STRUCTURE, type HowItWorksText } from './structure';
import { howItWorksTextEn } from './text.en';
import { howItWorksTextJa } from './text.ja';
import { howItWorksTextKo } from './text.ko';
import { howItWorksTextUk } from './text.uk';
import { howItWorksTextVi } from './text.vi';
import { howItWorksTextZh } from './text.zh';
import { howItWorksTextZhHk } from './text.zh-HK';
import { howItWorksTextZhTw } from './text.zh-TW';
import type { HowItWorksContent } from './types';

export * from './types';
export * from './structure';

/** Composes the locale-independent skeleton with one locale's copy. */
function buildHowItWorksContent(text: HowItWorksText): HowItWorksContent {
  const structure = HOW_IT_WORKS_STRUCTURE;
  return {
    metadata: {
      title: text.metadata.title,
      description: text.metadata.description,
      path: structure.metadataPath,
    },
    jsonLd: text.jsonLd,
    breadcrumbs: text.breadcrumbs,
    hero: {
      badge: text.hero.badge,
      headingLead: text.hero.headingLead,
      headingAccent: text.hero.headingAccent,
      paragraph: text.hero.paragraph,
      primaryCta: { label: text.hero.primaryCtaLabel, href: structure.hero.primaryCtaHref },
      secondaryCta: { label: text.hero.secondaryCtaLabel, href: structure.hero.secondaryCtaHref },
    },
    overview: {
      heading: text.overview.heading,
      subhead: text.overview.subhead,
      cards: [
        { number: structure.overviewCardNumbers[0], ...text.overview.cards[0] },
        { number: structure.overviewCardNumbers[1], ...text.overview.cards[1] },
        { number: structure.overviewCardNumbers[2], ...text.overview.cards[2] },
      ],
    },
    rewardBreakdown: text.rewardBreakdown,
    gameCycle: text.gameCycle,
    stepByStep: text.stepByStep,
    proTips: text.proTips,
    faqCallout: {
      heading: text.faqCallout.heading,
      body: text.faqCallout.body,
      cta: { label: text.faqCallout.ctaLabel, href: structure.faqCalloutCtaHref },
    },
    callToAction: {
      heading: text.callToAction.heading,
      body: text.callToAction.body,
      primaryCta: {
        label: text.callToAction.primaryCtaLabel,
        href: structure.callToAction.primaryCtaHref,
      },
      discordCta: {
        label: text.callToAction.discordCtaLabel,
        href: structure.callToAction.discordCtaHref,
      },
      twitterCta: {
        label: text.callToAction.twitterCtaLabel,
        href: structure.callToAction.twitterCtaHref,
      },
    },
  };
}

export const howItWorksContentEn: HowItWorksContent = buildHowItWorksContent(howItWorksTextEn);
export const howItWorksContentZh: HowItWorksContent = buildHowItWorksContent(howItWorksTextZh);
export const howItWorksContentZhTw: HowItWorksContent = buildHowItWorksContent(howItWorksTextZhTw);
export const howItWorksContentZhHk: HowItWorksContent = buildHowItWorksContent(howItWorksTextZhHk);
export const howItWorksContentUk: HowItWorksContent = buildHowItWorksContent(howItWorksTextUk);
export const howItWorksContentKo: HowItWorksContent = buildHowItWorksContent(howItWorksTextKo);
export const howItWorksContentJa: HowItWorksContent = buildHowItWorksContent(howItWorksTextJa);
export const howItWorksContentVi: HowItWorksContent = buildHowItWorksContent(howItWorksTextVi);

const HOW_IT_WORKS_CONTENT: LocaleRecord<HowItWorksContent> = {
  en: howItWorksContentEn,
  zh: howItWorksContentZh,
  'zh-TW': howItWorksContentZhTw,
  'zh-HK': howItWorksContentZhHk,
  uk: howItWorksContentUk,
  ko: howItWorksContentKo,
  ja: howItWorksContentJa,
  vi: howItWorksContentVi,
};

export function getHowItWorksContent(locale: string): HowItWorksContent {
  return pickByLocale(HOW_IT_WORKS_CONTENT, locale);
}
