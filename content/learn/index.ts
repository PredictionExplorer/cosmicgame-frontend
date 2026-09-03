import { pickByLocale, type LocaleRecord } from '@/i18n/locale';

import { LEARN_STRUCTURE, type LearnText } from './structure';
import { learnTextEn } from './text.en';
import { learnTextJa } from './text.ja';
import { learnTextKo } from './text.ko';
import { learnTextUk } from './text.uk';
import { learnTextVi } from './text.vi';
import { learnTextZh } from './text.zh';
import { learnTextZhHk } from './text.zh-HK';
import { learnTextZhTw } from './text.zh-TW';
import type { LearnArticle, LearnContent, LearnSection } from './types';

export * from './structure';

/** Composes the locale-independent skeleton with one locale's copy. */
function buildLearnContent(text: LearnText): LearnContent {
  // Parity is enforced by LearnText's literal keys; the builder itself only
  // needs plain string lookups.
  const articleTexts = text.articles as Readonly<
    Record<
      string,
      {
        title: string;
        description: string;
        h1: string;
        summary: string;
        sections: readonly LearnSection[];
        relatedLabels: readonly string[];
      }
    >
  >;

  return {
    hub: {
      meta: text.hub.meta,
      eyebrow: text.hub.eyebrow,
      h1: text.hub.h1,
      intro: text.hub.intro,
      breadcrumbs: text.hub.breadcrumbs,
      quizCta: {
        heading: text.hub.quizCta.heading,
        body: text.hub.quizCta.body,
        linkLabel: text.hub.quizCta.linkLabel,
        href: LEARN_STRUCTURE.hub.quizCtaHref,
      },
    },
    articleUi: text.articleUi,
    articles: LEARN_STRUCTURE.articles.map((article): LearnArticle => {
      const articleText = articleTexts[article.slug]!;
      return {
        slug: article.slug,
        title: articleText.title,
        description: articleText.description,
        h1: articleText.h1,
        updated: article.updated,
        summary: articleText.summary,
        schemaType: article.schemaType,
        sections: articleText.sections,
        related: article.related.map((href, index) => ({
          label: articleText.relatedLabels[index]!,
          href,
        })),
      };
    }),
  };
}

export const learnContentEn: LearnContent = buildLearnContent(learnTextEn);
export const learnContentZh: LearnContent = buildLearnContent(learnTextZh);
export const learnContentZhTw: LearnContent = buildLearnContent(learnTextZhTw);
export const learnContentZhHk: LearnContent = buildLearnContent(learnTextZhHk);
export const learnContentUk: LearnContent = buildLearnContent(learnTextUk);
export const learnContentKo: LearnContent = buildLearnContent(learnTextKo);
export const learnContentJa: LearnContent = buildLearnContent(learnTextJa);
export const learnContentVi: LearnContent = buildLearnContent(learnTextVi);

const LEARN_CONTENT: LocaleRecord<LearnContent> = {
  en: learnContentEn,
  zh: learnContentZh,
  'zh-TW': learnContentZhTw,
  'zh-HK': learnContentZhHk,
  uk: learnContentUk,
  ko: learnContentKo,
  ja: learnContentJa,
  vi: learnContentVi,
};

export function getLearnContent(locale: string): LearnContent {
  return pickByLocale(LEARN_CONTENT, locale);
}

export function getLearnArticle(slug: string, locale: string): LearnArticle | undefined {
  return getLearnContent(locale).articles.find((article) => article.slug === slug);
}

export function getLearnSlugs(): string[] {
  return LEARN_STRUCTURE.articles.map((article) => article.slug);
}

export type {
  LearnArticle,
  LearnArticleUi,
  LearnContent,
  LearnHubContent,
  LearnRelatedLink,
  LearnSection,
} from './types';
