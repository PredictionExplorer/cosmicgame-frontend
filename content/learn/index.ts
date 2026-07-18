import { learnContentEn } from './en';
import type { LearnArticle, LearnContent } from './types';
import { learnContentZh } from './zh';

const isChineseLocale = (locale: string): boolean =>
  locale.trim().toLowerCase().split(/[-_]/, 1)[0] === 'zh';

const withArticleFallback = (
  localizedContent: LearnContent,
  fallbackContent: LearnContent,
): LearnContent => ({
  ...localizedContent,
  articles: fallbackContent.articles.map(
    (fallbackArticle) =>
      localizedContent.articles.find((article) => article.slug === fallbackArticle.slug) ??
      fallbackArticle,
  ),
});

export { learnContentEn, learnContentZh };

export function getLearnContent(locale: string): LearnContent {
  if (!isChineseLocale(locale)) {
    return learnContentEn;
  }

  return withArticleFallback(learnContentZh, learnContentEn);
}

export function getLearnArticle(slug: string, locale: string): LearnArticle | undefined {
  if (isChineseLocale(locale)) {
    const localizedArticle = learnContentZh.articles.find((article) => article.slug === slug);
    if (localizedArticle) {
      return localizedArticle;
    }
  }

  return learnContentEn.articles.find((article) => article.slug === slug);
}

export function getLearnSlugs(): string[] {
  return learnContentEn.articles.map((article) => article.slug);
}

export type {
  LearnArticle,
  LearnArticleUi,
  LearnContent,
  LearnHubContent,
  LearnRelatedLink,
  LearnSection,
} from './types';
